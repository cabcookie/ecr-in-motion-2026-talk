/**
 * Die Antwortwerkzeuge — und damit der einzige Unterschied zwischen den beiden
 * Eingangswegen.
 *
 * Der Agent ist einer: ein Modell, eine Konfiguration, ein Systemprompt. Was
 * ihn im Postfach von dem im Chat unterscheidet, ist nicht, wer er ist, sondern
 * **womit er antworten kann**.
 *
 * Deshalb steht die Vertraulichkeitsregel hier und nicht im Systemprompt. Sie
 * gilt nicht für den Agenten, sie gilt für den KANAL: Eine Mail geht an einen
 * Außenstehenden, eine Chatnachricht ans eigene Haus. Dieselbe Zahl ist im
 * einen Fall ein Leck und im anderen genau das, wofür sie den Assistenten hat.
 *
 * Die Regel beim Werkzeug statt im Prompt ist auch robuster: Ein Agent, der
 * dieses Werkzeug nicht hat, kann die Regel nicht verletzen.
 */
import { z } from 'zod';
import type { ToolFactory } from '@aws-blocks/bb-agent';

/** Was ein Lauf über seinen Anlass weiß. */
export const vorgangskontext = z.object({
  /** Wer geschrieben hat — Mailadresse oder Teilnehmerkennung. */
  absender: z.string(),
  betreff: z.string().optional(),
  /** Message-ID der eingehenden Mail, für den Gesprächsfaden. */
  nachrichtId: z.string().optional(),
  /** An welches Postfach geschrieben wurde — als dieses wird geantwortet. */
  postfach: z.string().optional(),
  /*
    Der Kanal dieses Zuges. Er steht im Kontext, damit `frage_das_team` ihn in die
    offene Frage schreiben kann — ohne ihn wüsste später niemand, welchen Zug
    die Antwort des Teams fortsetzen soll.
  */
  kanal: z.string().optional(),
});

export type Vorgangskontext = z.infer<typeof vorgangskontext>;

/**
 * Was mit einer fertigen Antwort geschehen soll.
 *
 * Absichtlich hereingereicht statt hier verdrahtet: In der Lambda sendet das
 * SES, im Sandkasten schreibt es in eine Datei, im Test sammelt es in einem
 * Feld. Das Werkzeug bleibt dasselbe.
 */
export interface Versand {
  (kontext: Vorgangskontext, betreff: string, text: string): Promise<void>;
}

/**
 * Antworten per E-Mail.
 *
 * `needsApproval` ist der Kern der Vorführung: Der Agent SCHLÄGT die Mail VOR,
 * und ein Mensch bestätigt, bevor sie hinausgeht. Genau die Stufe, die der
 * Vortrag erklärt — Werkzeuge sind da, Autonomie noch nicht.
 *
 * `trustable` ist die Stufe danach: Der Mensch antwortet „vertraue", und ab
 * dann versendet der Agent allein. Der Autonomieregler ist kein Bild, sondern
 * zwei Felder.
 */
export function antworteVerMail(
  tool: ToolFactory<Vorgangskontext>,
  versende: Versand,
  /*
    Freigabe durch einen Menschen vor dem Versand.

    Für den Vortrag AUS: In Abschnitt 6 schreiben achtzig Teilnehmer
    gleichzeitig, und niemand kann achtzig Mails einzeln bestätigen. Der
    Mensch-im-Kreis-Moment liegt dort, wo er hingehört — bei `frage_das_team`.

    Die Fähigkeit steht trotzdem hier, weil sie die Stufe IST, die Block 4
    erklärt: Der Agent schlägt vor, ein Mensch bestätigt, und wer „vertraue"
    antwortet, lässt ihn ab dann allein.
  */
  mitFreigabe = false,
) {
  return tool({
    description:
      'Sendet die fertige Antwort an den Absender der eingegangenen E-Mail. ' +
      'ACHTUNG: Der Absender ist ein Außenstehender, oft ein Lieferant, der mit uns verhandelt. ' +
      'Was aus unseren Systemen kommt, bleibt drinnen — er darf erfahren, OB eine Bedingung ' +
      'erfüllt ist, nie MIT WELCHEM WERT. Keine Roherträge, keine Kategorievorgaben, keine ' +
      'Absatzzahlen, keine Marktdaten, keine Regalbelegung und niemals den Namen eines Artikels, ' +
      'der weichen könnte. Termine und Flächen, die wir ihm anbieten, gehören hingegen hinein. ' +
      'Im Zweifel weglassen: Eine Zahl, die du nicht nennst, kostet niemanden etwas.',
    parameters: z.object({
      betreff: z.string().describe('Betreff der Antwortmail'),
      text: z
        .string()
        .describe('Die vollständige Mail als Fließtext, mit Anrede und Grußformel, ohne Markdown'),
    }),
    needsApproval: mitFreigabe,
    trustable: mitFreigabe,
    handler: async ({ input, context }) => {
      await versende(context, input.betreff, input.text);
      return { gesendet: true, an: context.absender };
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
      ? 'Antwortet der Person, die gerade mit dir chattet. Sie gehört zum Category-Team, ' +
        'also zum eigenen Haus — ihr gegenüber sind Zahlen aus unseren Systemen keine Interna, ' +
        'sondern genau das, wofür sie dich fragt. Nenne sie mit Quelle und Stand.'
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

/**
 * Eine Rückfrage ans eigene Haus.
 *
 * `interrupt()` hält den Zug an. Der Agent wartet, die Frage landet beim
 * Operator, und erst wenn sie beantwortet ist, läuft der Vorgang weiter und die
 * Mail geht hinaus.
 *
 * Das gibt es nur im Mailweg. Im Chat wäre es sinnlos: Dort sitzt der
 * Ansprechpartner ohnehin am anderen Ende — da fragt man einfach.
 */
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

export function frageLisa(tool: ToolFactory<Vorgangskontext>, lege: Fragenablage) {
  return tool({
    description:
      'Legt dem Category-Team eine Rückfrage vor und wartet auf die Antwort. Nutze das für ' +
      'alles, was du brauchst und in keinem System steht — interne Einschätzungen, Freigaben, ' +
      'Zahlen ohne Quelle. Der Vorgang pausiert, bis geantwortet wurde.',
    parameters: z.object({
      frage: z.string().describe('Was du vom Team wissen musst, als ganzer Satz'),
      warum: z.string().describe('Wofür du die Angabe brauchst'),
    }),
    handler: async ({ input, context, interrupt }) => {
      /*
        `interrupt()` hält den Zug an UND gibt zurück, was der Mensch geantwortet
        hat. Deshalb steht es hier im Handler und nicht in der `interrupt`-Hook
        davor: Die Antwort wird damit zum Werkzeugergebnis, und der Agent
        rechnet damit weiter, statt sie nur zur Kenntnis zu nehmen.

        `reason` ist das, was die Operator-Ansicht anzeigt. Alles, was Carsten
        auf der Bühne zum Beantworten braucht, muss hier drinstehen.
      */
      /*
        Erst ablegen, dann anhalten — und nicht umgekehrt.

        `interrupt()` kehrt nicht zurück, bevor jemand geantwortet hat. Stünde
        die Ablage danach, wüsste Lisa nie, dass es etwas zu beantworten gibt,
        und der Vorgang bliebe für immer stehen.
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

      const antwort = await interrupt<string>({
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
