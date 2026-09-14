import {
  BedrockRuntimeClient,
  ConverseCommand,
  type ContentBlock,
  type Message,
  type Tool,
} from "@aws-sdk/client-bedrock-runtime";
import { FRAGE_LISA, WERKZEUGE } from "./werkzeuge";
import type { Modus } from "./konfig";

/**
 * Claude Sonnet 4.6 über ein globales Inferenzprofil — dasselbe Modell, das
 * auch hinter dem Chat auf dem Handy steht.
 */
const MODELL = "global.anthropic.claude-sonnet-4-6";

/** Höchstens so viele Runden Werkzeugaufrufe. Ohne Deckel läuft eine Schleife. */
const MAX_RUNDEN = 8;

const SYSTEM_ASSISTENT = `Du bist der Assistent von Lisa Berger, Category Managerin für Schokolade & Pralinen bei der Lebensmittelkette Nordkorb.

Deine Aufgabe: eingehende E-Mails von Herstellern einordnen und den Vorgang so weit abschließen, wie du kannst.

Kontext, den du kennst:
- Kategorievorgabe Marge: mindestens 30 %
- Regalplatz ist knapp. Eine Neulistung setzt in der Regel eine Auslistung voraus.
- Aktionsflächen laufen über den Aktionskalender, Vorlauf mindestens vier Wochen.
- Exklusivzusagen brauchen die Freigabe der Einkaufsleitung.

So arbeitest du:
1. Fasse zusammen, worum es geht — Produkt, Konditionen, Termin, Besonderheiten.
2. Leite ab, welche Angaben du für eine Entscheidung brauchst und in welchem System sie stehen.
3. Beschaffe diese Angaben mit den Werkzeugen, die dir zur Verfügung stehen. Nutze alle, die etwas beitragen, und arbeite den Vorgang so vollständig ab, wie deine Berechtigungen es zulassen.
4. Deine Antwort geht an den ABSENDER der Mail — einen Außenstehenden, oft einen Lieferanten, der mit dir verhandelt. Was du von Lisa bräuchtest, hat dort nichts zu suchen: keine internen Zahlen, keine Vorgaben des Hauses, keine Rückfrage an sie. Brauchst du etwas von ihr, lege es ihr mit dem Werkzeug frage_lisa vor. Dem Absender gegenüber benennst du die offene Stelle nur so weit, wie er sie kennen darf.
5. Gib eine Empfehlung ab und sage dazu, worauf sie sich stützt und was du selbst geprüft hast.

Unverhandelbar: Erfinde keine Zahlen. Eine Angabe, die du weder beschafft noch erfragt hast, existiert für dich nicht. Lieber eine Rückfrage als ein plausibler Wert.

Du antwortest als E-Mail. Schreibe reinen Fließtext ohne Markdown, mit Anrede und Grußformel, und unterschreibe als "Assistent von Lisa Berger".`;

/**
 * Der Agent für die Probe.
 *
 * Kein Systemprompt über das Haus, keine Werkzeuge — nichts als das Training.
 * Der Auftrag, die Schrittfolge mitzuliefern, ist Absicht: Auf der Folie werden
 * die Antworten verglichen, und sichtbar werden soll, dass die Zahlen zwischen
 * zwei Antworten auseinandergehen, obwohl niemand etwas nachgeschlagen hat.
 */
const SYSTEM_PROBE = `Du beantwortest eine E-Mail-Anfrage eines Lebensmittelherstellers an eine Handelskette.

Du hast keinen Zugriff auf Systeme, Daten oder Dokumente. Frage auch nicht nach — beantworte die Anfrage mit dem, was du hast.

Antworte als E-Mail in reinem Fließtext, mit Anrede und Grußformel. Hänge darunter, getrennt durch eine Leerzeile und die Zeile "Wie ich darauf komme:", drei bis fünf Stichpunkte an, die deine Schritte benennen.`;

/**
 * Womit der Agent antritt.
 *
 * Für den Vortrag gibt es zwei Ausstattungen — Assistent und Probe. Für die
 * Messung in v455 braucht es vier, weil die Folien behaupten, was der Unterschied
 * ausmacht, und das vorher niemand nachgerechnet hat.
 */
export interface Ausstattung {
  /** Der Systemprompt. Leer heißt: gar keiner. */
  readonly systemprompt?: string;
  readonly werkzeuge: boolean;
  /** Name eines Werkzeugs, das nicht antwortet — für den Fall „System gestört". */
  readonly stoerung?: string;
}

/**
 * Ein nackter Auftrag ohne jede Rolle.
 *
 * Wichtig für die Messung: Der bisherige Proben-Agent hat sehr wohl einen
 * Systemprompt (SYSTEM_PROBE) — er ist nur ein anderer, und er fordert
 * ausdrücklich zum Raten auf. „Ohne Systemprompt" gab es im Code bisher nicht.
 */
const SYSTEM_ROH = `Beantworte diese E-Mail.`;

export const AUSSTATTUNGEN: Readonly<Record<string, Ausstattung>> = {
  roh: { systemprompt: SYSTEM_ROH, werkzeuge: false },
  probe: { systemprompt: SYSTEM_PROBE, werkzeuge: false },
  prompt: { systemprompt: SYSTEM_ASSISTENT, werkzeuge: false },
  voll: { systemprompt: SYSTEM_ASSISTENT, werkzeuge: true },
  gestoert: {
    systemprompt: SYSTEM_ASSISTENT,
    werkzeuge: true,
    stoerung: "aktionskalender_zeitraum",
  },
};

export interface Lauf {
  /** Der Antworttext des Agenten. */
  readonly text: string;
  /** Welche Systeme er in welcher Reihenfolge abgefragt hat. */
  readonly schritte: readonly string[];
  /**
   * Was er Lisa vorlegen möchte.
   *
   * Steht getrennt, weil es der einzige Teil des Laufs ist, der NICHT in die
   * Antwortmail darf: Die geht an den Absender, und das hier ist intern.
   */
  readonly fragenAnLisa: readonly { frage: string; warum: string }[];
  /**
   * Was die Systeme geantwortet haben, roh.
   *
   * Grundlage der Zahlendeckung: Jede Zahl in der Antwort muss sich hierauf
   * oder auf die eingehende Mail zurückführen lassen. Was übrig bleibt, ist
   * erfunden.
   */
  readonly belege: readonly Record<string, unknown>[];
  /** Verbrauchte Token, für die Kostenrechnung. */
  readonly verbrauch: { ein: number; aus: number };
}

/*
  Die Schemata sind gewöhnliches JSON, das SDK erwartet dafür seinen
  rekursiven Dokumenttyp. Ein Record<string, unknown> ist ihm nicht genug, und
  die Member-Helfer der Union gibt es in dieser Fassung nur als Typ, nicht als
  Wert — deshalb hier eine Behauptung an genau zwei Stellen statt eines
  Nachbaus des Dokumenttyps.
*/
function werkzeugliste(): Tool[] {
  return WERKZEUGE.map(
    (w) =>
      ({
        toolSpec: {
          name: w.name,
          description: w.beschreibung,
          inputSchema: { json: w.schema },
        },
      }) as Tool,
  );
}

function textVon(inhalt: ContentBlock[] | undefined): string {
  return (inhalt ?? [])
    .map((b) => ("text" in b ? (b.text ?? "") : ""))
    .join("")
    .trim();
}

/**
 * Lässt den Agenten die Mail beantworten.
 *
 * Die Werkzeugschleife steht hier ausgeschrieben statt in einem Framework:
 * Was der Vortrag zeigen will — welche Systeme der Agent in welcher Reihenfolge
 * befragt — fällt dabei als Nebenprodukt ab und geht in die Antwortmail.
 *
 * Zwei Dinge kommen getrennt heraus, und die Trennung ist der Punkt: die
 * Systeme, die er abgefragt hat, und die Fragen, die er Lisa vorlegen möchte.
 * Das eine geht an den Absender, das andere nie.
 */
export async function beantworte(
  modus: Modus,
  mailtext: string,
  client = new BedrockRuntimeClient({}),
): Promise<Lauf> {
  return beantworteMit(
    modus === "assistent" ? AUSSTATTUNGEN.voll : AUSSTATTUNGEN.probe,
    mailtext,
    client,
  );
}

/** Derselbe Lauf, aber mit frei gewählter Ausstattung — für die Messung. */
export async function beantworteMit(
  ausstattung: Ausstattung,
  mailtext: string,
  client = new BedrockRuntimeClient({}),
): Promise<Lauf> {
  const mitWerkzeugen = ausstattung.werkzeuge;
  const system = ausstattung.systemprompt ? [{ text: ausstattung.systemprompt }] : undefined;
  const messages: Message[] = [{ role: "user", content: [{ text: mailtext }] }];
  const schritte: string[] = [];
  const fragenAnLisa: { frage: string; warum: string }[] = [];
  const belege: Record<string, unknown>[] = [];
  const verbrauch = { ein: 0, aus: 0 };

  for (let runde = 0; runde < MAX_RUNDEN; runde++) {
    const antwort = await client.send(
      new ConverseCommand({
        modelId: MODELL,
        system,
        messages,
        inferenceConfig: { maxTokens: 1600, temperature: 0.3 },
        ...(mitWerkzeugen ? { toolConfig: { tools: werkzeugliste() } } : {}),
      }),
    );

    verbrauch.ein += antwort.usage?.inputTokens ?? 0;
    verbrauch.aus += antwort.usage?.outputTokens ?? 0;

    const inhalt = antwort.output?.message?.content ?? [];
    messages.push({ role: "assistant", content: inhalt });

    const aufrufe = inhalt.flatMap((b) => ("toolUse" in b && b.toolUse ? [b.toolUse] : []));
    if (antwort.stopReason !== "tool_use" || aufrufe.length === 0) {
      return { text: textVon(inhalt), schritte, fragenAnLisa, belege, verbrauch };
    }

    const ergebnisse: ContentBlock[] = aufrufe.map((a) => {
      const werkzeug = WERKZEUGE.find((w) => w.name === a.name);
      const args = (a.input ?? {}) as Record<string, unknown>;

      /*
        frage_lisa ist keine Systemabfrage, sondern ein Ergebnis: eine Frage,
        die Lisa auf den Tisch bekommt. Sie gehört deshalb nicht in die Liste
        der abgefragten Systeme — die steht in der Mail an den Absender, und
        dort hat sie nichts verloren.
      */
      if (a.name === FRAGE_LISA) {
        fragenAnLisa.push({
          frage: typeof args.frage === "string" ? args.frage : "",
          warum: typeof args.warum === "string" ? args.warum : "",
        });
      } else {
        schritte.push(a.name ?? "unbekannt");
      }
      /*
        Der Störungsschalter. Ein ausgefallenes System wirft nicht, sondern
        antwortet mit einem Grund — sonst verschluckt die Schleife den Fehler,
        und er kommt als erfundene Zahl wieder heraus.
      */
      const ergebnis =
        a.name === ausstattung.stoerung
          ? {
              verfuegbar: false,
              grund: "nicht_erreichbar",
              hinweis: "Das System antwortet gerade nicht. Versuche es nicht erneut.",
            }
          : werkzeug
            ? werkzeug.antwort(args)
            : { fehler: "Werkzeug unbekannt" };
      if (a.name !== FRAGE_LISA) belege.push(ergebnis);

      return {
        toolResult: { toolUseId: a.toolUseId, content: [{ json: ergebnis }] },
      } as ContentBlock;
    });
    messages.push({ role: "user", content: ergebnisse });
  }

  /*
    Nur erreichbar, wenn das Modell acht Runden lang Werkzeuge aufruft, ohne
    zu einem Schluss zu kommen. Dann ist eine ehrliche Fehlermeldung besser als
    eine Antwort, die so tut, als wäre etwas entschieden worden.
  */
  throw new Error(`Der Agent kam nach ${MAX_RUNDEN} Runden zu keinem Ergebnis.`);
}
