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
 * Außenstehenden, eine Chatnachricht geht an Lisa selbst. Dieselbe Zahl ist im
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
export function antworteVerMail(tool: ToolFactory<Vorgangskontext>, versende: Versand) {
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
    needsApproval: true,
    trustable: true,
    handler: async ({ input, context }) => {
      await versende(context, input.betreff, input.text);
      return { gesendet: true, an: context.absender };
    },
  });
}

/**
 * Antworten im Chat.
 *
 * Kein `needsApproval`: Hier sitzt Lisa selbst am anderen Ende. Eine Antwort an
 * sie braucht niemandes Freigabe, und Interna sind hier keine — sie ist das
 * Haus.
 */
export function antworteImChat(tool: ToolFactory<Vorgangskontext>) {
  return tool({
    description:
      'Antwortet Lisa im Chat. Sie ist die Category Managerin selbst — ihr gegenüber sind ' +
      'Zahlen aus unseren Systemen keine Interna, sondern genau das, wofür sie dich hat. ' +
      'Nenne sie mit Quelle und Stand.',
    parameters: z.object({
      text: z.string().describe('Die Antwort an Lisa. Kurz — sie liest auf dem Handy.'),
    }),
    handler: async ({ input }) => ({ gesendet: true, text: input.text }),
  });
}

/**
 * Eine Rückfrage an Lisa.
 *
 * `interrupt()` hält den Zug an. Der Agent wartet, die Frage landet beim
 * Operator, und erst wenn sie beantwortet ist, läuft der Vorgang weiter und die
 * Mail geht hinaus.
 *
 * Das gibt es nur im Mailweg. Im Chat wäre es sinnlos: Dort ist Lisa ohnehin
 * der Gesprächspartner — da fragt man einfach.
 */
export function frageLisa(tool: ToolFactory<Vorgangskontext>) {
  return tool({
    description:
      'Legt Lisa Berger eine Rückfrage vor und wartet auf ihre Antwort. Nutze das für alles, ' +
      'was du von ihr brauchst und in keinem System steht — interne Einschätzungen, Freigaben, ' +
      'Zahlen ohne Quelle. Der Vorgang pausiert, bis sie geantwortet hat.',
    parameters: z.object({
      frage: z.string().describe('Was du von Lisa wissen musst, als ganzer Satz'),
      warum: z.string().describe('Wofür du die Angabe brauchst'),
    }),
    handler: async ({ input, context, interrupt }) => {
      /*
        `interrupt()` hält den Zug an UND gibt zurück, was der Mensch geantwortet
        hat. Deshalb steht es hier im Handler und nicht in der `interrupt`-Hook
        davor: Lisas Antwort wird damit zum Werkzeugergebnis, und der Agent
        rechnet damit weiter, statt sie nur zur Kenntnis zu nehmen.

        `reason` ist das, was die Operator-Ansicht anzeigt. Alles, was Carsten
        auf der Bühne zum Beantworten braucht, muss hier drinstehen.
      */
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
