/**
 * Der Agent. Einer.
 *
 * Bis zum 15.09. waren es zwei: eine selbstgeschriebene Werkzeugschleife für
 * den Mailweg und der Blocks-Agent für den Handy-Chat. Zwei Prompts, zwei
 * Modelle, zwei Konfigurationen — und als das Modell wechselte, zerbrach genau
 * der eine, den kein Test berührte.
 *
 * Jetzt gibt es eine Definition. Was die beiden Eingangswege unterscheidet,
 * ist ausschließlich, **womit der Agent antworten kann**:
 *
 *   Postfach  →  antworte_per_mail (Entwurf, Mensch bestätigt) + frage_das_team
 *   Chat      →  antworte_im_chat
 *
 * Alles andere — Modell, Systemprompt, die sechs Fachwerkzeuge, die Grenzen —
 * ist geteilt. Wer den Agenten ändern will, ändert ihn an einer Stelle.
 */
import { Agent, BedrockModels, type Scope } from '@aws-blocks/blocks';
import { SYSTEM_PROMPT } from '../../src/slides/agent';
import {
  antworteImChat,
  antworteVerMail,
  frageLisa,
  vorgangskontext,
  type Fragenablage,
  type Versand,
} from './antwort';
import { fachwerkzeuge } from './werkzeuge';

/**
 * Was für beide gilt.
 *
 * `SMART` ist Opus 4.8 — dasselbe Modell auf beiden Wegen. Bis hierher war das
 * eine Behauptung im Kommentar; jetzt ist es eine Zeile, die beide lesen.
 *
 * `FAST` (Haiku) bleibt als Rückfall: Wenn am Vortragsabend achtzig Handys
 * gleichzeitig schreiben und Opus drosselt, ist eine schnellere Antwort besser
 * als keine.
 */
const GEMEINSAM = {
  model: {
    deployed: [BedrockModels.SMART, BedrockModels.FAST],
    /*
      Lokal DASSELBE Modell wie ausgerollt.

      Ohne diesen Eintrag fällt der Block auf seinen eingebauten
      Attrappen-Provider zurück und antwortet „This is a canned mock response".
      Für eine Probe ist das wertlos: Man prüft dann Streaming und Verlauf, aber
      nie, was der Agent tatsächlich sagt.

      Der Attrappen-Provider bleibt als letzter Rückfall dahinter — wer ohne
      AWS-Zugangsdaten entwickelt, bekommt weiterhin etwas zu sehen. Der
      Dev-Server braucht dafür AWS_PROFILE=ecrtag in seiner Umgebung, sonst
      scheitert Bedrock still und die Attrappe übernimmt wieder.
    */
    local: [BedrockModels.SMART],
  },
  systemPrompt: SYSTEM_PROMPT,
  toolContextSchema: vorgangskontext,
  streamingMode: 'token' as const,
  /** Ein Saal voller Handys — der Verlauf soll nicht unbegrenzt mitwachsen. */
  conversation: { strategy: 'sliding-window' as const, windowSize: 20 },
  /*
    Sieben Fachwerkzeuge, ein Antwortwerkzeug, dazu Runden zum Nachdenken.
    Großzügiger als beim alten Mail-Agenten (dort acht), weil eine Rückfrage an
    Lisa mitten im Zug liegt und das Budget über die Unterbrechung hinweg
    weiterzählt — ein zu enger Deckel würde den Vorgang nach ihrer Antwort
    abwürgen.
  */
  maxLlmCalls: 14,
  maxToolIterations: 20,
};

/**
 * Der Agent hinter dem Postfach.
 *
 * Kurze Kennung mit Absicht: Der Name des S3-Buckets für die Sitzungsstände
 * wird aus Stack- und Blockkennung zusammengesetzt und darf 63 Zeichen nicht
 * überschreiten.
 */
export function postfachAgent(
  scope: Scope,
  kennung: string,
  versende: Versand,
  lege: Fragenablage,
  /*
    Ob der Agent die Systeme der Handelswelt befragen darf.

    Das ist der ganze Unterschied zwischen den beiden Postfächern — und der
    Kern von Abschnitt 15. Derselbe Agent, derselbe Systemprompt, dieselben
    Grenzen; ihm fehlen nur die Werkzeuge. Dann KANN er nichts nachschlagen und
    muss fragen.

    Vorher war der Vergleich schwächer und angreifbar: Das zweite Postfach hatte
    einen ANDEREN Prompt, der ausdrücklich zum Raten aufforderte. Wer das merkt,
    hat die Folie widerlegt.
  */
  mitFachwerkzeugen: boolean,
): Agent<any> {
  return new Agent(scope, kennung, {
    ...GEMEINSAM,
    tools: (tool) => ({
      ...(mitFachwerkzeugen ? fachwerkzeuge(tool) : {}),
      antworte_per_mail: antworteVerMail(tool, versende),
      frage_das_team: frageLisa(tool, lege),
    }),
  });
}

/** Derselbe Agent, im Chat. Er kann hier nur eines nicht: eine Mail senden. */
export function chatAgent(scope: Scope): Agent<any> {
  return new Agent(scope, 'berater', {
    ...GEMEINSAM,
    tools: (tool) => ({
      ...fachwerkzeuge(tool),
      antworte_im_chat: antworteImChat(tool),
    }),
  });
}

export { vorgangskontext, type Fragenablage, type Versand } from './antwort';
