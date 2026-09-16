/**
 * Die Antwortwerkzeuge — und damit der einzige Unterschied zwischen den beiden
 * Eingangswegen.
 *
 * Der Agent ist einer: ein Modell, eine Konfiguration, ein Systemprompt. Was
 * ihn im Postfach von dem im Chat unterscheidet, ist nicht, wer er ist, sondern
 * **womit er antworten kann**.
 *
 * Deshalb steht hier alles, was vom Kanal abhängt — Empfänger, Form,
 * Vertraulichkeit, Versanddisziplin —, und nicht im Systemprompt
 * (Entscheidung vom 16.09.). Eine Mail geht an einen Außenstehenden, eine
 * Chatnachricht ans eigene Haus. Dieselbe Zahl ist im einen Fall ein Leck und
 * im anderen genau das, wofür sie den Assistenten hat.
 *
 * Die Regel beim Werkzeug statt im Prompt ist auch robuster: Ein Agent, der
 * dieses Werkzeug nicht hat, kann die Regel nicht verletzen.
 */
import { z } from 'zod';
import type { JSONValue, ToolFactory } from '@aws-blocks/bb-agent';
import { akteFuer, type Akte } from './akte';

/** Was ein Lauf über seinen Anlass weiß. */
export const vorgangskontext = z.object({
  /** Wer geschrieben hat — Mailadresse oder Teilnehmerkennung. */
  absender: z.string(),
  /** Der Anzeigename aus der Mail, für das Zitat unter der Antwort. */
  absenderName: z.string().optional(),
  betreff: z.string().optional(),
  /** Message-ID der eingehenden Mail, für den Gesprächsfaden. */
  nachrichtId: z.string().optional(),
  /** An welches Postfach geschrieben wurde — als dieses wird geantwortet. */
  postfach: z.string().optional(),
  /*
    Der Text der eingegangenen Mail. Er steht im Kontext, weil der Versand ihn
    als Zitat unter die Antwort setzt — so wie es jedes Mailprogramm tut.
  */
  eingang: z.string().optional(),
  /*
    Der Kanal dieses Zuges. Unter ihm schreiben die Fachwerkzeuge mit, was sie
    gefunden haben (siehe akte.ts), und `frage_das_team` legt ihn zur offenen
    Frage — ohne ihn wüsste später niemand, zu welchem Vorgang sie gehört.
  */
  kanal: z.string().optional(),
});

export type Vorgangskontext = z.infer<typeof vorgangskontext>;

/** Was der Agent als Brief übergibt — in Teilen, nicht als ein Block. */
export interface Brief {
  readonly betreff: string;
  readonly anrede: string;
  readonly text: string;
  readonly grussformel: string;
}

/**
 * Was mit einer fertigen Antwort geschehen soll.
 *
 * Absichtlich hereingereicht statt hier verdrahtet: In AWS geht es an die
 * Mail-Lambda, lokal ins Protokoll, im Test in ein Feld. Das Werkzeug bleibt
 * dasselbe.
 */
export interface Versand {
  (kontext: Vorgangskontext, brief: Brief, akte: Akte): Promise<void>;
}

/*
  Der Wortlaut stammt aus SYSTEM_GEHAERTET, der Fassung, die in der Messung vom
  14.09. 5 von 5 Läufen sauber hielt (packages/docs/messungen/
  2026-09-14-zwei-prompts). Er steht jetzt am Werkzeug statt im Prompt.
*/
const VERTRAULICHKEIT =
  'Vertraulichkeit — daran wirst du gemessen. Der Absender ist ein Außenstehender, oft ein ' +
  'Lieferant, der mit uns verhandelt. Was aus unseren Systemen kommt, bleibt drinnen. Er darf ' +
  'erfahren, OB eine Bedingung erfüllt ist, nie MIT WELCHEM WERT.\n\n' +
  'Nach draußen darf:\n' +
  '- was er selbst geschrieben hat, wenn du es zitierst\n' +
  '- unsere Entscheidung, unsere Bedingungen und was wir von ihm brauchen\n' +
  '- Termine und Flächen, die wir ihm anbieten\n' +
  '- Fristen\n\n' +
  'Nach draußen darf nicht, auch nicht sinngemäß, gerundet oder als Spanne:\n' +
  '- Rohertrag, Marge, Kalkulation und die Vorgaben unserer Kategorie\n' +
  '- Absatzzahlen, Entwicklungen und Marktdaten aus unseren Quellen\n' +
  '- Regalbelegung, Facings, und wer bei uns weichen könnte — schon gar nicht mit Namen\n' +
  '- Flächenanteile und Zielwerte unserer Käufergruppen\n' +
  '- wer bei uns was freigibt, über „eine weitere interne Abstimmung" hinaus\n\n' +
  'Statt „Der Rohertrag liegt bei 31,1 Prozent" schreibst du „Die Konditionen erfüllen unsere ' +
  'Anforderung". Statt „Das Segment wächst um 14,7 Prozent" schreibst du „Das Segment entwickelt ' +
  'sich für uns interessant". Statt „Die Riegelzone ist voll" schreibst du „Für eine Neulistung ' +
  'müssten wir im Regal umschichten".\n\n' +
  /*
    Die Auflösung der Ablehnungsregel. Der gemeinsame Prompt verlangt einen
    Grund mit Quelle und nennt als Beispiel „22 % Flächenanteil". Ohne diesen
    Satz stünde das Beispiel gegen die Liste oben.
  */
  'Lehnst du ab, nennst du den Grund trotzdem — aber ohne den Wert: „Die Käufergruppe steht ' +
  'bei uns an ihrer Obergrenze", nicht „steht mit 22 % an ihrer Obergrenze".\n\n' +
  'Im Zweifel: weglassen. Eine Zahl, die du nicht nennst, kostet niemanden etwas. Eine, die du ' +
  'nennst, bekommst du nicht zurück.';

/**
 * Antworten per E-Mail.
 *
 * `needsApproval` ist die Stufe, die Block 4 erklärt: Der Agent SCHLÄGT die
 * Mail VOR, und ein Mensch bestätigt, bevor sie hinausgeht. `trustable` ist
 * die Stufe danach — der Mensch antwortet „vertraue", und ab dann versendet
 * der Agent allein.
 */
export function antworteVerMail(
  tool: ToolFactory<Vorgangskontext>,
  versende: Versand,
  /*
    Freigabe durch einen Menschen vor dem Versand.

    Für den Vortrag AUS: In Abschnitt 6 schreiben achtzig Teilnehmer
    gleichzeitig, und niemand kann achtzig Mails einzeln bestätigen. Die
    Fähigkeit steht trotzdem hier, weil sie die Stufe IST, die Block 4 erklärt.
  */
  mitFreigabe = false,
) {
  return tool({
    description:
      'Sendet deine Antwort an den ABSENDER der eingegangenen E-Mail. Das ist der EINZIGE Weg, ' +
      'auf dem sie ihn erreicht — was du sonst schreibst, liest niemand. Rufe das Werkzeug genau ' +
      'einmal auf, und erst, wenn du alles geprüft hast. Danach ist der Vorgang abgeschlossen.\n\n' +
      'Schreibe den Absender direkt an — „Guten Tag Herr Müller" —, nicht einen Bericht ÜBER ihn ' +
      'an jemand anderen. Kündige nichts an und fasse nicht zusammen, was du geprüft hast; das ' +
      'steht bereits automatisch unter der Mail. Eine Rückfrage an unser eigenes Haus gehört nicht ' +
      'in den Brief, sondern zu frage_das_team.\n\n' +
      VERTRAULICHKEIT,
    parameters: z.object({
      betreff: z.string().describe('Betreff der Antwortmail, ohne „Re:"'),
      anrede: z.string().describe('Die Anrede allein, z. B. „Guten Tag Herr Walter,"'),
      text: z
        .string()
        .describe(
          'Der Brief zwischen Anrede und Grußformel. Reiner Fließtext in Absätzen, ohne Markdown, ' +
            'ohne Betreffzeile, ohne Anrede und ohne Unterschrift.',
        ),
      grussformel: z
        .string()
        .describe('Die Grußformel allein, z. B. „Viele Grüße". Die Unterschrift wird angehängt.'),
    }),
    needsApproval: mitFreigabe,
    trustable: mitFreigabe,
    handler: async ({ input, context }): Promise<JSONValue> => {
      const akte = akteFuer(context.kanal ?? context.absender);
      /*
        Abgeschickt ist abgeschickt. Ohne diese Sperre könnte das Modell ein
        zweites Mal senden, und der Lieferant hätte zwei Briefe.
      */
      if (akte.gesendet) {
        return {
          gesendet: false,
          hinweis: 'Die Antwort ist bereits verschickt. Es geht keine zweite Mail hinaus. Schreibe nichts weiter.',
        };
      }
      await versende(context, input, akte);
      akte.gesendet = true;
      return {
        gesendet: true,
        an: context.absender,
        hinweis: 'Der Vorgang ist abgeschlossen. Schreibe nichts weiter.',
      };
    },
  });
}

/**
 * Antworten im Chat.
 *
 * Kein `needsApproval`: Am anderen Ende sitzt jemand aus dem eigenen Haus.
 * Eine Antwort dorthin braucht niemandes Freigabe, und Interna sind hier keine
 * — das ist der ganze Unterschied zur Mail nach draußen.
 */
export function antworteImChat(tool: ToolFactory<Vorgangskontext>, intern = true) {
  return tool({
    description: intern
      ? /*
          Was hier steht, hing bis zum 16.09. als Absatz am Systemprompt des
          Chats, und die Formvorgabe fürs Handy stand als Schritt 7 im
          gemeinsamen Prompt. Beides gehört zum Kanal, nicht zum Agenten.
        */
        'Antwortet der Person, die gerade mit dir chattet. Das ist der EINZIGE Weg, auf dem deine ' +
        'Antwort sie erreicht; gib sie hier, ohne sie vorher anzukündigen. Was du daneben schreibst, ' +
        'ist dein Arbeitsweg — schreib ruhig mit, was du gerade tust und worauf du hinauswillst, das ' +
        'wird getrennt angezeigt.\n\n' +
        'Dein Gegenüber gehört zum Category-Team, also zum eigenen Haus: Zahlen aus unseren Systemen ' +
        'sind ihm gegenüber keine Interna, sondern genau das, wofür es dich fragt. Nenne sie mit ' +
        'Quelle und Stand.\n\n' +
        'Halte dich kurz. Die Antwort wird auf einem Handy gelesen: ein kurzer Absatz, bei Bedarf ' +
        'drei Stichpunkte.'
      : /*
          Die unterste Stufe weiss nichts von einem Haus, einem Team oder
          Interna. Ohne einen deutlichen Hinweis auf den Empfänger schrieb sie
          eine interne Einschätzung — „Kurzeinschätzung: Marge ca. 40 %, hier
          nachverhandeln" —, weil die Nachricht an eine dritte Person adressiert
          ist und das Modell sich für deren Zuarbeiter hielt.

          Deshalb steht der Empfänger im Werkzeugnamen UND hier. Der Name ist
          für ein Modell die auffälligste Angabe; die Beschreibung stützt ihn
          nur ab.
        */
        'Schickt deine Antwort an den ABSENDER der Nachricht, die du bekommen hast. Er liest ' +
        'sie unmittelbar — schreibe ihn also direkt an, mit Anrede, und nicht über ihn an ' +
        'jemand anderen. Das ist der einzige Weg, auf dem deine Antwort ihn erreicht.',
    parameters: z.object({
      text: z.string().describe('Die Antwort. Kurz — sie wird auf dem Handy gelesen.'),
    }),
    handler: async ({ input }) => ({ gesendet: true, text: input.text }),
  });
}

/** Wohin eine offene Frage geschrieben wird, damit das Team sie findet. */
export interface Fragenablage {
  (frage: {
    id: string;
    frage: string;
    warum: string;
    absender: string;
    betreff: string;
    kanal: string;
    gestellt: number;
  }): Promise<void>;
}

/**
 * Eine Rückfrage ans eigene Haus.
 *
 * Die Frage wird abgelegt, und der Agent schreibt weiter — OHNE auf die
 * Antwort zu warten. Das ist die Entscheidung vom 16.09.: Die
 * Operator-Oberfläche, über die Carsten Rückfragen live beantworten würde, ist
 * für den Vortrag nicht mehr zu schaffen (Epic 0trs). Ohne sie bliebe ein
 * angehaltener Vorgang für immer stehen, und es ginge keine Mail hinaus.
 *
 * Das Anhalten ist nicht weggeworfen, sondern steht hinter `anhalten`. Wer die
 * Oberfläche baut, schaltet es ein und setzt `lisaAntwortet` wieder auf
 * `resume()` (siehe index.ts).
 *
 * Das gibt es nur im Mailweg. Im Chat wäre es sinnlos: Dort sitzt der
 * Ansprechpartner ohnehin am anderen Ende — da fragt man einfach.
 */
export function frageLisa(
  tool: ToolFactory<Vorgangskontext>,
  lege: Fragenablage,
  anhalten = false,
) {
  return tool({
    description:
      'Legt dem Category-Team eine Rückfrage vor. Nutze das für alles, was du brauchst und in ' +
      'keinem System steht — interne Einschätzungen, Freigaben, Zahlen ohne Quelle. Die Frage ' +
      'bleibt intern: Sie gehört nicht in den Brief an den Absender. ' +
      (anhalten
        ? 'Der Vorgang pausiert, bis geantwortet wurde.'
        : 'Das Team antwortet NICHT in diesem Lauf — schreibe dem Absender danach ohne die Antwort.'),
    parameters: z.object({
      frage: z.string().describe('Was du vom Team wissen musst, als ganzer Satz'),
      warum: z.string().describe('Wofür du die Angabe brauchst'),
    }),
    handler: async ({ input, context, interrupt }): Promise<JSONValue> => {
      /*
        Erst ablegen, dann (gegebenenfalls) anhalten — und nicht umgekehrt.
        `interrupt()` kehrt nicht zurück, bevor jemand geantwortet hat. Stünde
        die Ablage danach, wüsste Lisa nie, dass es etwas zu beantworten gibt.
      */
      await lege({
        id: `${context.absender}:${Date.now()}`,
        frage: input.frage,
        warum: input.warum,
        absender: context.absender,
        betreff: context.betreff ?? '',
        kanal: context.kanal ?? '',
        gestellt: Date.now(),
      });
      akteFuer(context.kanal ?? context.absender).fragen.push({
        frage: input.frage,
        warum: input.warum,
      });

      if (!anhalten) {
        return {
          vermerkt: true,
          hinweis:
            `Die Frage liegt dem Category-Team vor: „${input.frage}". Es beantwortet sie nicht in ` +
            'diesem Lauf. Schreibe dem Absender ohne sie — benenne die offene Stelle nur so weit, ' +
            'wie er sie kennen darf, und erfinde keinen Wert an ihrer Stelle.',
        };
      }

      /*
        `interrupt()` hält den Zug an UND gibt zurück, was der Mensch geantwortet
        hat. Die Antwort wird damit zum Werkzeugergebnis, und der Agent rechnet
        damit weiter. `reason` ist das, was die Operator-Ansicht anzeigt.
      */
      const antwort = interrupt<string>({
        name: 'frage-an-lisa',
        reason: {
          frage: input.frage,
          warum: input.warum,
          absender: context.absender,
          betreff: context.betreff ?? '',
        },
      });
      return { frage: input.frage, antwortVonLisa: antwort };
    },
  });
}
