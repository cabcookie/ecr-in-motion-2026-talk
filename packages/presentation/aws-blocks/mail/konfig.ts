/**
 * Zwei Postfächer, zwei Agenten.
 *
 * Der Vortrag braucht beide: In Abschnitt 6 schreiben die Teilnehmer an Lisas
 * Assistenten — der hat einen Systemprompt und Werkzeuge und arbeitet den
 * Vorgang ab. In Abschnitt 15 schreiben sie an einen Agenten, der nichts hat
 * als sein Training; dass der eine Marge erfindet, ist der Punkt der Folie.
 *
 * Unterschieden wird über die Empfängeradresse und nicht über den Betreff:
 * Beim ersten Postfach fordern wir die Teilnehmer ausdrücklich auf, den Text
 * zu ändern. Wer dabei auch den Betreff anfasst, bekäme sonst den falschen
 * Agenten — und würde die Folie nicht verstehen.
 */
export type Modus = "assistent" | "probe";

export interface Postfach {
  readonly adresse: string;
  readonly modus: Modus;
  readonly anzeigename: string;
}

const DOMAIN = "carstenbkoch.de";

export const POSTFAECHER: readonly Postfach[] = [
  { adresse: `ecr2026@${DOMAIN}`, modus: "assistent", anzeigename: "Lisa Berger · Nordkorb" },
  { adresse: `ecr2026-probe@${DOMAIN}`, modus: "probe", anzeigename: "Lisa Berger · Nordkorb" },
];

/** Welcher Agent ist gemeint? Fällt auf den Assistenten zurück. */
export function postfachFuer(empfaenger: readonly string[]): Postfach {
  const klein = empfaenger.map((e) => e.toLowerCase());
  return (
    POSTFAECHER.find((p) => klein.some((e) => e.includes(p.adresse.toLowerCase()))) ??
    POSTFAECHER[0]
  );
}

/*
  Hier stand die Adresse der anklickbaren Fassung. Sie ist raus, weil die
  Fassung nach dem Abend abgeschaltet wird — und eine Adresse, die ins Leere
  laeuft, ist in einer Mail schlechter als gar keine. Was den Abend ueberlebt,
  ist das PDF und der Quelltext.
*/
export const CODE_URL = "https://github.com/cabcookie/ecr-in-motion-2026-talk";
/**
 * Die Folien als PDF.
 *
 * Kurz genug, um sie jemandem zuzurufen, und ohne Endung — die Anwendung
 * faengt den Pfad ab und leitet auf die Datei weiter (siehe src/routen.ts).
 * Wer am naechsten Morgen nachschlagen will, worueber wir gesprochen haben,
 * braucht nicht den Klickpfad durch den Vortrag, sondern ein Dokument.
 */
export const PDF_URL = "https://ecr2026.carstenbkoch.de/vortrag";

/**
 * Was unter jeder Antwort steht — der Weg, den die Teilnehmer selbst gehen können.
 *
 * Der Abend endet für die meisten mit „klingt gut, und jetzt?". Diese Liste ist
 * die Antwort darauf, und sie steht in der Mail und nicht auf einer Folie: Die
 * Mail liegt am nächsten Morgen noch im Postfach, die Folie nicht.
 *
 * Zwei Regeln, nach denen ausgewählt wurde, und beide sind teuer erkauft — an
 * dieser Stelle standen schon einmal Links, die nur auf Startseiten führten:
 *
 * 1. **Jeder Link führt dorthin, wo es losgeht** — nicht auf eine Übersicht,
 *    von der aus der Empfänger selbst weitersuchen muss. Ein Beleg, den man
 *    sich erst suchen muss, ist keiner.
 * 2. **Vier Gruppen, weil vier verschiedene Menschen mitlesen.** Wer selbst
 *    ausprobieren will, wer entscheiden muss, wer es bauen soll, und wer es
 *    nicht allein anfangen möchte. Ohne die Gruppen wäre es eine Linkliste,
 *    und eine Linkliste klickt niemand.
 *
 * Preise stehen hier nur, wo sie öffentlich sind. tecRacer nennt zu seinen
 * Einstiegen keine — das sagt die Zeile auch, statt es offenzulassen.
 */
export interface Einstieg {
  /** Für wen dieser Block gedacht ist — steht als Zeile über den Links. */
  readonly gruppe: string;
  readonly punkte: readonly { readonly was: string; readonly url: string }[];
}

export const EINSTIEGE: readonly Einstieg[] = [
  {
    gruppe: "Selbst ausprobieren — ohne AWS-Konto, ohne Kosten:",
    punkte: [
      { was: "Amazon Quick, Free-Plan — Anmeldung mit Ihrer E-Mail-Adresse", url: "https://aws.amazon.com/quick/" },
      { was: "Die Apps dazu: Mac, Windows, Browser, Outlook, Excel", url: "https://aws.amazon.com/quick/desktop/" },
    ],
  },
  {
    gruppe: "Einordnen, ohne eine Zeile Code (AWS Skill Builder, kostenlos):",
    punkte: [
      {
        was: "Generative AI für Entscheider — drei Kurse, gut drei Stunden",
        url: "https://skillbuilder.aws/learning-plan/STDH6NGPH7/generative-ai-learning-plan-for-decision-makers/MHMHDAWQJY",
      },
      {
        was: "Agenten — das Thema dieses Abends, in einer Stunde",
        url: "https://skillbuilder.aws/learn/DNBD5MT8ZD/introduction-to-agentic-ai-on-aws/WAKAFK6UFY",
      },
    ],
  },
  {
    gruppe: "Zum Weiterleiten an die IT:",
    punkte: [
      {
        was: "Amazon Bedrock — der Zugang zu den Modellen",
        url: "https://docs.aws.amazon.com/de_de/bedrock/latest/userguide/what-is-bedrock.html",
      },
      {
        was: "Amazon Bedrock AgentCore — was einen Agenten betriebsfähig macht",
        url: "https://aws.amazon.com/bedrock/agentcore/",
      },
      {
        was: "Lernplan für Entwickler, kostenlos",
        url: "https://explore.skillbuilder.aws/learn/public/learning_plan/view/2068/generative-ai-learning-plan-for-developers",
      },
    ],
  },
  {
    gruppe: "Mit Begleitung statt allein (AWS-Partner tecRacer, Preise auf Anfrage):",
    punkte: [
      {
        was: "Data Readiness Discovery — nach einer Woche wissen Sie, ob Ihre Daten tragen",
        url: "https://www.tecracer.com/loesungen/conversational-generative-ai/",
      },
      {
        was: "GenAI Data-Evaluator — Proof of Concept auf Ihren eigenen Daten",
        url: "https://www.tecracer.com/en/solutions/genai-data-evaluator/",
      },
    ],
  },
];
