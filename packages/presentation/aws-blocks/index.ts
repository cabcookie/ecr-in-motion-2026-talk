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
import { ApiNamespace, Scope, KVStore, Realtime } from '@aws-blocks/blocks';
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
}));
