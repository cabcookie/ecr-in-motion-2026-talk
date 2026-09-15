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
import { chatAgent, postfachAgent } from './agent';
import { perSes } from './agent/versand';
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
 * Ein Zurücksetzen.
 *
 * Inhaltlich trägt das Ereignis nichts — es sagt nur: fangt von vorn an. Der
 * Zeitstempel steht trotzdem drin, damit zwei Zurücksetzungen hintereinander
 * unterscheidbar bleiben und die zweite nicht als Wiederholung der ersten
 * durchfällt.
 */
const resetEvent = z.object({ at: z.number(), von: z.string() });

export type ResetEvent = z.infer<typeof resetEvent>;

const rtReset = new Realtime(scope, 'reset-live', {
  namespaces: { reset: Realtime.namespace(resetEvent) },
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
/*
  Der Agent kommt aus `agent/` — dieselbe Definition, die auch hinter dem
  Postfach steht. Was ihn hier unterscheidet, ist einzig sein Antwortwerkzeug:
  Er kann im Chat antworten und keine Mail senden.
*/
const berater = chatAgent(scope);

/**
 * Eine Frage, die der Agent Lisa vorgelegt hat und die noch offen ist.
 *
 * Sie liegt hier und nicht im Protokoll, weil sie beantwortet werden muss:
 * Solange sie offen ist, steht ein Vorgang still und eine Mail geht nicht
 * hinaus. Der Indikator auf der Folie liest genau diesen Speicher.
 */
const offeneFrage = z.object({
  id: z.string(),
  frage: z.string(),
  warum: z.string(),
  absender: z.string(),
  betreff: z.string(),
  /** Welchen Zug Lisas Antwort fortsetzt. */
  kanal: z.string(),
  gestellt: z.number(),
  /** Gesetzt, sobald geantwortet wurde — die Frage bleibt als Beleg stehen. */
  antwort: z.string().optional(),
});

export type OffeneFrage = z.infer<typeof offeneFrage>;

const fragen = new KVStore(scope, 'lisa-fragen', { schema: offeneFrage });

/** Damit der Indikator aufleuchtet, ohne dass jemand nachfragen muss. */
const rtFragen = new Realtime(scope, 'fragen-live', {
  namespaces: { fragen: Realtime.namespace(offeneFrage) },
});

/*
  Zwei Postfächer, zwei Bestückungen, ein Agent.

  Der Unterschied ist einzig, ob die Fachwerkzeuge dabei sind. Abschnitt 6
  bekommt sie — dort soll der Agent fundiert antworten und selbst senden.
  Abschnitt 15 bekommt sie nicht: Derselbe Agent, derselbe Prompt, aber er KANN
  nichts nachschlagen. Also fragt er Lisa, und das ist der Punkt der Folie.
*/
const ablegen = async (f: OffeneFrage) => {
  await fragen.put(f.id, f);
  await rtFragen.publish('fragen', CHANNEL, f);
};

const postfaecher = {
  assistent: postfachAgent(scope, 'post', perSes, ablegen, true),
  probe: postfachAgent(scope, 'probe', perSes, ablegen, false),
};

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

  /**
   * Alles zurücksetzen, was Teilnehmer eingegeben haben.
   *
   * Gedacht für die Proben: Nach einem Durchlauf stehen Antworten im Speicher,
   * und die stünden am Vortragsabend als Punkte auf der Leinwand, bevor der
   * erste Teilnehmer den QR-Code gescannt hat.
   *
   * Gelöscht wird nur, was aus dem Publikum kam — Antworten und die offenen
   * Fragen des Agenten. Der Folienstand bleibt, sonst spränge der Vortrag beim
   * Zurücksetzen an den Anfang.
   *
   * Die Gespräche bleiben serverseitig stehen. Sie hängen an einer Kennung, die
   * nur das jeweilige Handy kennt; werden die Handys zurückgesetzt, findet sie
   * niemand mehr. Sie zu löschen hieße, jedes Gespräch einzeln aufzuzählen —
   * für nichts, was danach anders aussähe.
   */
  async resetEingaben(von = 'operator', token = '') {
    assertMayControl(token);

    /*
      Erst sammeln, dann löschen. Während eines laufenden Scans zu löschen ist
      die Sorte Nebenwirkung, die genau einmal im Jahr eine Seite überspringt.
    */
    const schluessel: string[] = [];
    for await (const eintrag of answers.scan()) schluessel.push(eintrag.key);
    for (const key of schluessel) await answers.delete(key);

    const fragenSchluessel: string[] = [];
    for await (const eintrag of fragen.scan()) fragenSchluessel.push(eintrag.key);
    for (const key of fragenSchluessel) await fragen.delete(key);

    await rtReset.publish('reset', CHANNEL, { at: Date.now(), von });
    return { antworten: schluessel.length, fragen: fragenSchluessel.length };
  },

  /**
   * Kanal, über den ein Zurücksetzen bei den Handys und auf der Leinwand
   * ankommt. Ohne ihn müsste jedes Gerät einzeln neu geladen werden — und
   * genau das will man in einer Probe nicht tun.
   */
  async subscribeReset() {
    return rtReset.getChannel('reset', CHANNEL);
  },

  // ─── Chat mit dem Agenten (Abschnitt 16) ──────────────────────────────────
  //
  // Die Teilnehmer melden sich nicht an. Ein Gespräch gehört dem Gerät, das
  // seine Kennung kennt; die Kennung ist eine UUID und steht nirgends sonst.
  // Für einen Vortragsabend ist das der richtige Schutz — fremde Gespräche
  // müsste man raten.

  /** Neues Gespräch beginnen. */
  async chatStart(participantId: string) {
    return { conversationId: await berater.createConversationId(participantId) };
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
    await berater.stream(message, {
      conversationId,
      channelId,
      userId: participantId,
      /* Pflicht, seit der Agent ein Kontextschema hat: Wer schreibt hier? */
      context: { absender: participantId },
    });
  },

  /** Verlauf — damit ein gesperrtes Handy sein Gespräch wiederfindet. */
  async chatHistory(conversationId: string) {
    return { messages: await berater.getConversation(conversationId) };
  },

  /** Kanal, über den die Antwort Stück für Stück hereinkommt. */
  async chatChannel(channelId: string) {
    return berater.getChannel(channelId);
  },

  /**
   * Eine eingegangene E-Mail übergeben.
   *
   * Die Lambda am SNS-Topf parst die Rohmail und reicht sie hierher. Der Aufruf
   * kehrt sofort zurück: Was danach geschieht — Systeme befragen, Lisa fragen,
   * antworten — läuft im Agenten, und das Senden ist sein eigenes Werkzeug.
   */
  async mailEingang(
    modus: 'assistent' | 'probe',
    absender: string,
    betreff: string,
    text: string,
    nachrichtId: string,
    postfach: string,
  ) {
    const kanal = `mail-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    await postfaecher[modus].stream(text, {
      channelId: kanal,
      context: { absender, betreff, nachrichtId, postfach, kanal },
    });
    return { kanal };
  },

  /** Was der Agent gerade von Lisa wissen möchte. Der Indikator liest das. */
  async lisaFragen() {
    const offen: OffeneFrage[] = [];
    for await (const eintrag of fragen.scan()) {
      if (!eintrag.value.antwort) offen.push(eintrag.value);
    }
    return { offen: offen.sort((a, b) => a.gestellt - b.gestellt) };
  },

  /** Kanal für den Indikator — damit er aufleuchtet, statt gepollt zu werden. */
  async lisaKanal() {
    return rtFragen.getChannel('fragen', CHANNEL);
  },

  /**
   * Lisas Antwort — und damit läuft der Vorgang weiter.
   *
   * `resume` setzt den angehaltenen Zug auf demselben Budget fort. Der Agent
   * bekommt die Antwort als Ergebnis seines Werkzeugs und schreibt damit die
   * Mail zu Ende.
   */
  async lisaAntwortet(id: string, antwort: string, modus: 'assistent' | 'probe', token = '') {
    assertMayControl(token);
    const frage = await fragen.get(id);
    if (!frage) throw new Error(`Die Frage ${id} kenne ich nicht.`);
    if (frage.antwort) return { schon: true };

    await fragen.put(id, { ...frage, antwort });
    await postfaecher[modus].resume(frage.kanal, [
      { interruptId: 'frage-an-lisa', response: antwort },
    ]);
    return { fortgesetzt: true };
  },
}));
