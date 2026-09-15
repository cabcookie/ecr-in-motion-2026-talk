/**
 * Backend der Präsentation — aws-blocks/index.ts (IFC-Schicht)
 *
 * Einzige Aufgabe: den Folienstand zwischen Operator-View und Live-View
 * synchron halten, auch über Gerätegrenzen hinweg. Der BroadcastChannel
 * deckt den gleichen Browser ab; hier geht es um die Steuerung vom Handy.
 *
 * Lokal ist Realtime ein WebSocket-Server im Prozess, in AWS AppSync Events.
 * Derselbe Code, kein Unterschied im Frontend.
 */
import { Agent, ApiNamespace, BedrockModels, Scope, KVStore, Realtime } from '@aws-blocks/blocks';
import { SYSTEM_PROMPT } from '../src/slides/agent';
import { z } from 'zod';

const scope = new Scope('ecr-masterclass');

/** Ein Folienwechsel. `from` ist die Absenderkennung, damit ein Fenster die eigene Nachricht erkennt. */
const slideEvent = z.object({
  index: z.number().int().min(0),
  /** Klick-Schritt innerhalb der Folie */
  step: z.number().int().min(0),
  from: z.string(),
  at: z.number(),
});

export type SlideEvent = z.infer<typeof slideEvent>;

const rt = new Realtime(scope, 'deck', {
  namespaces: { deck: Realtime.namespace(slideEvent) },
});

/** Ein Kanal reicht — es gibt genau einen Vortrag. */
const CHANNEL = 'main';

/**
 * Der zuletzt gesetzte Stand. Ein Gerät, das sich mitten im Vortrag
 * verbindet, holt sich daraus sofort die richtige Folie, statt bei 1
 * anzufangen.
 */
const state = new KVStore(scope, 'deck-state', { schema: slideEvent });

/**
 * Steuerungsgeheimnis, beim Deployment als Umgebungsvariable gesetzt
 * (siehe index.cdk.ts). Leer bedeutet offen — das ist lokal gewollt und
 * in AWS ein Fehler, den wir beim Schreiben melden.
 */
const CONTROL_TOKEN = process.env.DECK_TOKEN ?? '';

function assertMayControl(token: string): void {
  if (!CONTROL_TOKEN) return; // lokale Entwicklung
  if (token !== CONTROL_TOKEN) {
    throw new Error('Falsches Steuerungsgeheimnis — diese Folie wurde nicht gewechselt.');
  }
}

/** Eine Antwort eines Teilnehmers auf eine Interaktion. */
const answer = z.object({
  interactionId: z.string(),
  /** Gerätekennung — die Teilnehmer melden sich nicht an. */
  participantId: z.string(),
  value: z.string(),
  at: z.number(),
});

export type Answer = z.infer<typeof answer>;

/**
 * Antworten der Teilnehmer. Schlüssel ist `<interaktion>:<teilnehmer>`, damit
 * ein Teilnehmer seine eigene Antwort überschreibt statt zu vervielfachen —
 * wer sein Handy sperrt und zurückkommt, soll seine Eingabe wiederfinden.
 */
const answers = new KVStore(scope, 'answers', { schema: answer });

/** Damit die Leinwand die Antworten live mitbekommt. */
const rtAnswers = new Realtime(scope, 'answers-live', {
  namespaces: { answers: Realtime.namespace(answer) },
});

/**
 * Der Agent aus Abschnitt 16.
 *
 * Er bekommt den Systemprompt — und bewusst keine Tools. Genau das ist der
 * Punkt der Stufe: Er weiß, welche Angaben ihm fehlen und in welchem System
 * sie stünden, kann sie aber nicht holen. Also fragt er die Teilnehmer.
 * Die sind seine Werkzeuge.
 *
 * Der Prompt kommt aus den Foliendaten, damit der Agent mit demselben Text
 * läuft, den das Publikum auf dem Handy aufklappen kann.
 *
 * Lokal läuft das ohne AWS: die Blocks-Agent-Implementierung fällt auf ihren
 * eingebauten Canned-Provider zurück. Die Antworten sind dann Attrappen, aber
 * Streaming, Verlauf und Wiederaufnahme lassen sich damit vollständig prüfen.
 */
// Kurze Kennung mit Absicht: der Name des S3-Buckets für die Sitzungsstände
// wird aus Stack- und Blockkennung zusammengesetzt und darf 63 Zeichen nicht
// überschreiten. 'lisa-assistant' sprengte das Limit um zwei Zeichen.
const chatAgent = new Agent(scope, 'berater', {
  /*
    SMART ist Opus 4.8 — dasselbe Modell wie im Mailweg. FAST (Haiku) bleibt
    als Rückfall stehen: Wenn am Vortragsabend achtzig Handys gleichzeitig
    schreiben und Opus drosselt, ist eine schnellere Antwort besser als keine.
  */
  model: { deployed: [BedrockModels.SMART, BedrockModels.FAST] },
  systemPrompt: SYSTEM_PROMPT,
  streamingMode: 'token',
  /** Ein Saal voller Handys — der Verlauf soll nicht unbegrenzt mitwachsen. */
  conversation: { strategy: 'sliding-window', windowSize: 20 },
  /** Ohne Tools endet ein Zug nach einem Modellaufruf. Mehr wäre ein Fehler. */
  maxLlmCalls: 2,
  /*
    Keine Werkzeuge, und das ist hier keine Sparsamkeit, sondern eine Sperre.

    Dieser Agent spricht mit Lisa — also mit dem Teilnehmer am Handy. Er darf
    deshalb UNTER KEINEN UMSTÄNDEN ins Postfach schreiben können: Was zwischen
    ihm und Lisa besprochen wird, ist intern, und der Absender einer Mail ist
    ein Außenstehender. Der Mail-Agent trennt dieselben beiden Kanäle von der
    anderen Seite her (frage_lisa in aws-blocks/mail/werkzeuge.ts).

    Wer hier später ein Werkzeug ergänzt, muss zuerst zeigen, dass es keinen
    Weg nach draußen öffnet.
  */
  maxToolIterations: false,
});

export const api = new ApiNamespace(scope, 'api', (_context) => ({
  /**
   * Liefert einen Kanal, den das Frontend direkt abonniert.
   * Bewusst ohne Anmeldung: Zuhören ist harmlos, nur Steuern ist geschützt.
   */
  async subscribeDeck() {
    return rt.getChannel('deck', CHANNEL);
  },

  /** Aktueller Stand — für Fenster, die sich mitten im Vortrag verbinden. */
  async currentSlide(): Promise<SlideEvent> {
    return (await state.get('current')) ?? { index: 0, step: 0, from: 'server', at: 0 };
  },

  /** Folie wechseln und allen Verbundenen mitteilen. */
  async gotoSlide(index: number, step: number, from: string, token = ''): Promise<SlideEvent> {
    assertMayControl(token);
    const event: SlideEvent = { index, step, from, at: Date.now() };
    await state.put('current', event);
    await rt.publish('deck', CHANNEL, event);
    return event;
  },

  /** Zeigt dem Operator, ob die Steuerung überhaupt geschützt ist. */
  async controlStatus() {
    return { protected: CONTROL_TOKEN !== '' };
  },

  // ─── Publikumsinteraktion ──────────────────────────────────────────────────

  /** Antwort eines Teilnehmers festhalten. Bewusst ohne Anmeldung. */
  async submitAnswer(interactionId: string, participantId: string, value: string) {
    const entry: Answer = { interactionId, participantId, value, at: Date.now() };
    await answers.put(`${interactionId}:${participantId}`, entry);
    await rtAnswers.publish('answers', 'main', entry);
    return entry;
  },

  /** Eigene Antworten wiederherstellen, wenn das Handy zwischendurch gesperrt war. */
  async myAnswers(participantId: string) {
    const mine: Answer[] = [];
    for await (const entry of answers.scan()) {
      if (entry.value.participantId === participantId) mine.push(entry.value);
    }
    return mine;
  },

  /** Alle Antworten zu einer Interaktion — für die Auswertung auf der Leinwand. */
  async answersFor(interactionId: string) {
    const all: Answer[] = [];
    for await (const entry of answers.scan()) {
      if (entry.value.interactionId === interactionId) all.push(entry.value);
    }
    return all;
  },

  /** Kanal, über den neue Antworten live auf die Leinwand kommen. */
  async subscribeAnswers() {
    return rtAnswers.getChannel('answers', 'main');
  },

  // ─── Chat mit dem Agenten (Abschnitt 16) ──────────────────────────────────
  //
  // Die Teilnehmer melden sich nicht an. Ein Gespräch gehört dem Gerät, das
  // seine Kennung kennt; die Kennung ist eine UUID und steht nirgends sonst.
  // Für einen Vortragsabend ist das der richtige Schutz — fremde Gespräche
  // müsste man raten.

  /** Neues Gespräch beginnen. */
  async chatStart(participantId: string) {
    return { conversationId: await chatAgent.createConversationId(participantId) };
  },

  /**
   * Nachricht abschicken. Kehrt sofort zurück — die Antwort kommt als Strom
   * über den Kanal, nicht als Rückgabewert dieses Aufrufs.
   */
  async chatSend(
    conversationId: string,
    message: string,
    channelId: string,
    participantId: string,
  ) {
    await chatAgent.stream(message, { conversationId, channelId, userId: participantId });
  },

  /** Verlauf — damit ein gesperrtes Handy sein Gespräch wiederfindet. */
  async chatHistory(conversationId: string) {
    return { messages: await chatAgent.getConversation(conversationId) };
  },

  /** Kanal, über den die Antwort Stück für Stück hereinkommt. */
  async chatChannel(channelId: string) {
    return chatAgent.getChannel(channelId);
  },
}));
