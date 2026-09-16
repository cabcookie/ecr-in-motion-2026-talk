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
import { chatAgent, postfachAgent, rohChatAgent } from './agent';
import { perMailLambda } from './agent/versand';
import { fensterstand, heuteAbend, INAKTIV, istAktiv, type Fensterstand } from './fenster';
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
 * Der Agent im Handy-Chat.
 *
 * Dieselbe Definition, die auch hinter dem Postfach steht — er kann nur eines
 * nicht: eine Mail senden. Dafür antwortet er im Chat.
 *
 * ACHTUNG, hier stand bis zur Vereinheitlichung das Gegenteil: „bewusst keine
 * Tools". Das stimmt nicht mehr. `chatAgent` bringt alle Fachwerkzeuge mit,
 * einschließlich der Ziele. Der stufenweise Aufbau — erst Prompt, dann
 * Werkzeuge einzeln dazu —, der den Unterschied auf dem Handy erlebbar machen
 * soll, ist NOCH NICHT gebaut.
 *
 * Der Prompt kommt aus den Foliendaten, damit der Agent mit demselben Text
 * läuft, den das Publikum auf dem Handy aufklappen kann.
 *
 * Lokal läuft das ohne AWS: die Blocks-Agent-Implementierung fällt auf ihren
 * eingebauten Canned-Provider zurück. Die Antworten sind dann Attrappen, aber
 * Streaming, Verlauf und Wiederaufnahme lassen sich damit vollständig prüfen.
 */
const berater = chatAgent(scope);

/*
  Die unterste Stufe, für Abschnitt 14: das nackte Modell ohne Systemprompt und
  ohne Fachwerkzeuge. Ein eigener Agent und kein Schalter am bestehenden —
  Blocks führt den Verlauf je Agent, und zwei Stufen im selben Gespräch wären
  nicht zu trennen.
*/
const roh = rohChatAgent(scope);

/** Welche Stufe ein Chat anspricht. */
const CHATS = { voll: berater, roh } as const;
type Chatstufe = keyof typeof CHATS;

/** Die Stufe kommt vom Handy; nur die beiden bekannten gelten. */
function chat(stufe: Chatstufe) {
  if (stufe !== 'voll' && stufe !== 'roh') throw new Error(`Unbekannte Stufe: ${String(stufe)}`);
  return CHATS[stufe];
}

/**
 * Eine Frage, die der Agent Lisa vorgelegt hat und die noch offen ist.
 *
 * Sie liegt hier und nicht im Protokoll, weil jemand sie beantworten soll.
 * Den Vorgang hält sie nicht mehr an (siehe `frageLisa`): Die Mail geht
 * trotzdem hinaus, und die Frage bleibt für das Team liegen.
 */
const offeneFrage = z.object({
  id: z.string(),
  frage: z.string(),
  warum: z.string(),
  absender: z.string(),
  betreff: z.string(),
  /** Zu welchem Mailvorgang die Frage gehört. */
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

/**
 * Der überschriebene Zeitplan.
 *
 * In den Foliendaten trägt jede Folie eine Soll-Uhrzeit, geschätzt bevor der
 * Vortrag je gehalten wurde. Nach einer Probe steht hier, was er wirklich
 * braucht — gemessene Verweildauer plus die geschätzte Zeit für die Stellen,
 * an denen das Publikum mitmacht.
 *
 * Er liegt im Speicher und nicht im Browser, weil er den Vortrag betrifft und
 * nicht das Gerät, von dem aus geprobt wurde: Wer vom Laptop probt und vom
 * Tablet vorträgt, soll denselben Plan sehen.
 */
const planstand = z.object({
  index: z.number().int().min(0),
  step: z.number().int().min(0),
  /** Soll-Uhrzeit als "18:09". */
  at: z.string(),
  /** Davon für die Interaktion vorgesehen, in Sekunden. */
  interaktion: z.number(),
});

const zeitplan = z.object({
  beginn: z.string(),
  staende: z.array(planstand),
  geschrieben: z.number(),
  ausProbe: z.number(),
  gemessen: z.number(),
  interaktion: z.number(),
});

export type Zeitplan = z.infer<typeof zeitplan>;

const plaene = new KVStore(scope, 'zeitplan', { schema: zeitplan });

/** Es gibt genau einen geltenden Plan. Ältere zu behalten hieße, sie zu verwalten. */
const PLAN = 'aktuell';

/**
 * Wann das Vortragsfenster begonnen hat (siehe fenster.ts).
 *
 * Ein absoluter Zeitpunkt, geschrieben vom Steuerpult. Fehlt er, ist die
 * Anwendung gesperrt — der sichere Zustand nach einem frischen Deployment.
 */
const fensterBeginn = z.object({ start: z.number(), gesetzt: z.number() });

const fenster = new KVStore(scope, 'vortragsfenster', { schema: fensterBeginn });
const FENSTER = 'aktuell';

/**
 * Kurz gemerkt, damit nicht jeder Aufruf erst den Speicher fragt. Nach
 * „Start jetzt" kann eine andere, warme Instanz also bis zu fünf Sekunden
 * lang noch den alten Stand sehen.
 */
const MERKEN_MS = 5_000;
let gemerkt: { start: number | null; bis: number } | null = null;

async function fensterBeginnLesen(): Promise<number | null> {
  const jetzt = Date.now();
  if (gemerkt && gemerkt.bis > jetzt) return gemerkt.start;
  const start = (await fenster.get(FENSTER))?.start ?? null;
  gemerkt = { start, bis: jetzt + MERKEN_MS };
  return start;
}

/**
 * Die Sperre. Steht als ERSTE Zeile in jedem Endpunkt, der Teilnehmerdaten
 * liest oder schreibt oder ein Modell ruft — vor jedem Parsen, Lesen und
 * Schreiben.
 *
 * Offen bleiben nur Folienstand, Zeitplan und der Fensterstand selbst: Die
 * Leinwand hängt schon vor 18:00 am Beamer und muss der Steuerung folgen,
 * und darin steht nichts, was ein Teilnehmer eingegeben hat.
 */
async function nurImFenster(): Promise<void> {
  if (!istAktiv(await fensterBeginnLesen(), Date.now())) throw new Error(INAKTIV);
}

/** Obergrenzen für Freitext von außen. Eine Chatfrage passt locker hinein. */
const MAX_NACHRICHT = 2_000;
const MAX_ANTWORT = 500;
const MAX_KENNUNG = 100;

function begrenze(wert: unknown, max: number, was: string): string {
  if (typeof wert !== 'string' || wert.length > max) {
    throw new Error(`${was} fehlt oder ist länger als ${max} Zeichen.`);
  }
  return wert;
}

const ablegen = async (f: OffeneFrage) => {
  await fragen.put(f.id, f);
  await rtFragen.publish('fragen', CHANNEL, f);
};

/*
  Ein Postfach, ein Agent, alle Fachwerkzeuge.

  Bis zum 16.09. gab es daneben 'probe' — derselbe Agent ohne Werkzeuge, für
  Abschnitt 15. Das Postfach ist entfallen; die Stufe ohne Werkzeuge zeigt
  rohChatAgent im Chat.
*/
const postfach = postfachAgent(scope, 'post', perMailLambda, ablegen);

/** Was die Mail-Lambda aus einer eingegangenen Mail übergibt. */
const mailEingangDaten = z.object({
  absender: z.string().email(),
  absenderName: z.string().optional(),
  betreff: z.string(),
  text: z.string().max(50_000),
  nachrichtId: z.string().optional(),
  postfach: z.string(),
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

  // ─── Vortragsfenster ──────────────────────────────────────────────────────

  /**
   * Läuft der Vortrag gerade? Offen, denn die Teilnehmerseite entscheidet
   * danach, ob sie mitspielt oder die Abschlussseite zeigt — und die
   * Mail-Lambda, ob der Agent antwortet.
   */
  async vortragsfenster(): Promise<Fensterstand> {
    return fensterstand(await fensterBeginnLesen(), Date.now());
  },

  /**
   * Das Fenster öffnen, geschützt wie ein Folienwechsel.
   *
   * `jetzt` beginnt sofort, `abend` heute um 18:00 Uhr in Bonn. Den Zeitpunkt
   * rechnet der Server aus, nicht der Browser: Eine falsch gehende Uhr am
   * Steuerpult soll das Fenster nicht verschieben.
   */
  async fensterOeffnen(art: 'jetzt' | 'abend', token = ''): Promise<Fensterstand> {
    assertMayControl(token);
    if (art !== 'jetzt' && art !== 'abend') throw new Error(`Unbekannter Beginn: ${String(art)}`);
    const jetzt = Date.now();
    const start = art === 'jetzt' ? jetzt : heuteAbend(jetzt);
    await fenster.put(FENSTER, { start, gesetzt: jetzt });
    gemerkt = { start, bis: jetzt + MERKEN_MS };
    return fensterstand(start, jetzt);
  },

  // ─── Publikumsinteraktion ──────────────────────────────────────────────────

  /** Antwort eines Teilnehmers festhalten. Bewusst ohne Anmeldung. */
  async submitAnswer(interactionId: string, participantId: string, value: string) {
    await nurImFenster();
    begrenze(interactionId, MAX_KENNUNG, 'Die Interaktion');
    begrenze(participantId, MAX_KENNUNG, 'Die Teilnehmerkennung');
    begrenze(value, MAX_ANTWORT, 'Die Antwort');
    const entry: Answer = { interactionId, participantId, value, at: Date.now() };
    await answers.put(`${interactionId}:${participantId}`, entry);
    await rtAnswers.publish('answers', 'main', entry);
    return entry;
  },

  /** Eigene Antworten wiederherstellen, wenn das Handy zwischendurch gesperrt war. */
  async myAnswers(participantId: string) {
    await nurImFenster();
    const mine: Answer[] = [];
    for await (const entry of answers.scan()) {
      if (entry.value.participantId === participantId) mine.push(entry.value);
    }
    return mine;
  },

  /** Alle Antworten zu einer Interaktion — für die Auswertung auf der Leinwand. */
  async answersFor(interactionId: string) {
    await nurImFenster();
    const all: Answer[] = [];
    for await (const entry of answers.scan()) {
      if (entry.value.interactionId === interactionId) all.push(entry.value);
    }
    return all;
  },

  /** Kanal, über den neue Antworten live auf die Leinwand kommen. */
  async subscribeAnswers() {
    await nurImFenster();
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
   * Der Zeitplan bleibt ebenfalls stehen, und das ist keine Nachlässigkeit: Er
   * ist das Ergebnis einer Probe, nicht die Eingabe eines Teilnehmers. Ihn beim
   * Leeren des Saals mitzulöschen hieße, vor jedem Durchlauf neu zu proben.
   * Wer ihn loswerden will, nimmt `zeitplanVerwerfen`.
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

  // ─── Zeitplan ─────────────────────────────────────────────────────────────

  /** Der geltende Zeitplan, oder nichts — dann gelten die Zeiten aus den Folien. */
  async zeitplanLesen(): Promise<Zeitplan | null> {
    return (await plaene.get(PLAN)) ?? null;
  },

  /**
   * Den Zeitplan überschreiben.
   *
   * Geschützt wie ein Folienwechsel: Wer den Vortrag nicht steuern darf, darf
   * auch nicht seine Zeiten umschreiben.
   */
  async zeitplanSchreiben(plan: Zeitplan, token = '') {
    assertMayControl(token);
    await plaene.put(PLAN, plan);
    return plan;
  },

  /** Zurück auf die Zeiten aus den Foliendaten. */
  async zeitplanVerwerfen(token = '') {
    assertMayControl(token);
    await plaene.delete(PLAN);
    return { verworfen: true };
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
  async chatStart(participantId: string, stufe: Chatstufe = 'voll') {
    await nurImFenster();
    begrenze(participantId, MAX_KENNUNG, 'Die Teilnehmerkennung');
    return { conversationId: await chat(stufe).createConversationId(participantId) };
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
    stufe: Chatstufe = 'voll',
  ) {
    await nurImFenster();
    begrenze(message, MAX_NACHRICHT, 'Die Nachricht');
    begrenze(participantId, MAX_KENNUNG, 'Die Teilnehmerkennung');
    await chat(stufe).stream(message, {
      conversationId,
      channelId,
      userId: participantId,
      /* Pflicht, seit der Agent ein Kontextschema hat: Wer schreibt hier? */
      context: { absender: participantId },
    });
  },

  /** Verlauf — damit ein gesperrtes Handy sein Gespräch wiederfindet. */
  async chatHistory(conversationId: string, stufe: Chatstufe = 'voll') {
    await nurImFenster();
    return { messages: await chat(stufe).getConversation(conversationId) };
  },

  /** Kanal, über den die Antwort Stück für Stück hereinkommt. */
  async chatChannel(channelId: string, stufe: Chatstufe = 'voll') {
    await nurImFenster();
    return chat(stufe).getChannel(channelId);
  },

  /**
   * Eine eingegangene E-Mail übergeben.
   *
   * Die Mail-Lambda liest die Rohmail und reicht sie hierher. Der Aufruf kehrt
   * sofort zurück: Was danach geschieht — Systeme befragen, das Team fragen,
   * antworten — läuft im Agenten, und das Senden ist sein eigenes Werkzeug.
   *
   * Geschützt wie ein Folienwechsel. Offen könnte jeder einen Lauf mit
   * beliebigem Absender anstoßen, und der Agent schriebe an eine Adresse, die
   * nie geschrieben hat.
   */
  async mailEingang(token: string, daten: z.infer<typeof mailEingangDaten>) {
    assertMayControl(token);
    /*
      Die Mail-Lambda fragt vorher selbst nach dem Fenster und antwortet
      außerhalb fest. Hier steht die Sperre trotzdem: Der Agent soll auch dann
      nicht anlaufen, wenn jemand mit dem Geheimnis direkt ruft.
    */
    await nurImFenster();
    const mail = mailEingangDaten.parse(daten);
    const kanal = `mail-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    /* Mit Absender: Ohne den Namen schrieb der Agent „Sehr geehrte Damen und Herren“. */
    const von = mail.absenderName ? `${mail.absenderName} <${mail.absender}>` : mail.absender;
    await postfach.stream(`Von: ${von}\nBetreff: ${mail.betreff}\n\n${mail.text}`, {
      channelId: kanal,
      /* Pflicht, solange der Agent den Verlauf speichert. */
      userId: mail.absender,
      context: {
        absender: mail.absender,
        absenderName: mail.absenderName,
        betreff: mail.betreff,
        nachrichtId: mail.nachrichtId,
        postfach: mail.postfach,
        eingang: mail.text,
        kanal,
      },
    });
    return { kanal };
  },

  /** Was der Agent gerade von Lisa wissen möchte. Der Indikator liest das. */
  async lisaFragen() {
    await nurImFenster();
    const offen: OffeneFrage[] = [];
    for await (const eintrag of fragen.scan()) {
      if (!eintrag.value.antwort) offen.push(eintrag.value);
    }
    return { offen: offen.sort((a, b) => a.gestellt - b.gestellt) };
  },

  /** Kanal für den Indikator — damit er aufleuchtet, statt gepollt zu werden. */
  async lisaKanal() {
    await nurImFenster();
    return rtFragen.getChannel('fragen', CHANNEL);
  },

  /**
   * Lisas Antwort — festgehalten, aber (noch) ohne Fortsetzung.
   *
   * `frage_das_team` hält den Zug nicht mehr an (Entscheidung vom 16.09.): Die
   * Mail ist längst draußen, wenn hier jemand antwortet. Die Antwort bleibt
   * deshalb als Beleg an der Frage stehen.
   *
   * Wer die Operator-Oberfläche aus Epic 0trs baut, schaltet in
   * `frageLisa(…, anhalten = true)` das Anhalten ein und setzt hier den Zug
   * fort:
   *
   *   await postfach.resume(frage.kanal, [
   *     { interruptId: 'frage-an-lisa', response: antwort },
   *   ]);
   */
  async lisaAntwortet(id: string, antwort: string, token = '') {
    assertMayControl(token);
    const frage = await fragen.get(id);
    if (!frage) throw new Error(`Die Frage ${id} kenne ich nicht.`);
    if (frage.antwort) return { schon: true };

    await fragen.put(id, { ...frage, antwort });
    return { festgehalten: true };
  },
}));
