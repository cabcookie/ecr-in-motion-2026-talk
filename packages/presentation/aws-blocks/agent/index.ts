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
 *   Postfach  →  antworte_per_mail (Entwurf, Mensch bestätigt) + frage_lisa
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
  model: { deployed: [BedrockModels.SMART, BedrockModels.FAST] },
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
export function postfachAgent(scope: Scope, versende: Versand): Agent<any> {
  return new Agent(scope, 'post', {
    ...GEMEINSAM,
    tools: (tool) => ({
      ...fachwerkzeuge(tool),
      antworte_per_mail: antworteVerMail(tool, versende),
      frage_lisa: frageLisa(tool),
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

export { vorgangskontext, type Versand } from './antwort';
