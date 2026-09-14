import {
  BedrockRuntimeClient,
  ConverseCommand,
  type ContentBlock,
  type Message,
  type Tool,
} from "@aws-sdk/client-bedrock-runtime";
import { WERKZEUGE } from "./werkzeuge";
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
4. Steht dir für eine Angabe kein Werkzeug zur Verfügung, dann frage Lisa danach. Benenne genau, welche Zahl du brauchst und wo sie zu finden ist.
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

export interface Lauf {
  /** Der Antworttext des Agenten. */
  readonly text: string;
  /** Welche Werkzeuge er in welcher Reihenfolge aufgerufen hat. */
  readonly schritte: readonly string[];
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
 * Die Werkzeugschleife steht hier ausgeschrieben statt in einem Framework: Es
 * sind fünf Werkzeuge mit festen Antworten, und was der Vortrag zeigen will —
 * welche Systeme der Agent in welcher Reihenfolge befragt — fällt dabei als
 * Nebenprodukt ab und geht in die Antwortmail.
 */
export async function beantworte(
  modus: Modus,
  mailtext: string,
  client = new BedrockRuntimeClient({}),
): Promise<Lauf> {
  const mitWerkzeugen = modus === "assistent";
  const system = [{ text: mitWerkzeugen ? SYSTEM_ASSISTENT : SYSTEM_PROBE }];
  const messages: Message[] = [{ role: "user", content: [{ text: mailtext }] }];
  const schritte: string[] = [];

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

    const inhalt = antwort.output?.message?.content ?? [];
    messages.push({ role: "assistant", content: inhalt });

    const aufrufe = inhalt.flatMap((b) => ("toolUse" in b && b.toolUse ? [b.toolUse] : []));
    if (antwort.stopReason !== "tool_use" || aufrufe.length === 0) {
      return { text: textVon(inhalt), schritte };
    }

    const ergebnisse: ContentBlock[] = aufrufe.map((a) => {
      const werkzeug = WERKZEUGE.find((w) => w.name === a.name);
      schritte.push(a.name ?? "unbekannt");
      return {
        toolResult: {
          toolUseId: a.toolUseId,
          content: [{ json: werkzeug ? werkzeug.antwort() : { fehler: "Werkzeug unbekannt" } }],
        },
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
