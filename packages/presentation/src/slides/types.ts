export type BlockId = 1 | 2 | 3 | 4;

export interface Block {
  n: BlockId;
  /** Kurzname für Tabs und Operator-View */
  tab: string;
  title: string;
  /** Worum es in diesem Block geht — nur Operator-View */
  claim: string;
  budget: string;
}

export interface MailMock {
  t: "mail";
  /** Fensterzeile, z.B. "Microsoft Outlook — Posteingang" */
  app: string;
  /** true = gesendete Nachricht, zeigt "An:" statt "Von:" */
  sent?: boolean;
  from: string;
  to: string;
  time: string;
  subject: string;
  body: string[];
  facts?: Array<[string, string]>;
}

export interface ChatMessage {
  who: string;
  role: "user" | "agent";
  text: string;
  /** Namen aufgerufener Tools, werden als Chips über der Antwort gezeigt */
  tools?: string[];
  /** gedämpft dargestellt — für die nutzlose Antwort in Stufe a */
  flat?: boolean;
}

export interface ChatMock {
  t: "chat";
  app: string;
  msgs: ChatMessage[];
}

export interface RunStep {
  sys: string;
  txt: string;
  /** Ergebniszeile, darf <b> enthalten */
  out?: string;
  /** hebt den Schritt hervor — die Entdeckung */
  key?: boolean;
}

export interface RunMock {
  t: "run";
  steps: RunStep[];
}

export interface FanMock {
  t: "fan";
  cells: Array<{ sys: string; act: string; qty: string }>;
}

export interface TimelineMock {
  t: "timeline";
  /** [Jahr, Ereignis] — Ereignis darf <b> enthalten */
  rows: Array<[string, string]>;
}

export interface ListMock {
  t: "list";
  ordered: boolean;
  /** [Begriff, Erläuterung] */
  items: Array<[string, string]>;
}

export interface TweetsMock {
  t: "tweets";
  items: Array<{ handle: string; text: string; reply?: boolean }>;
}

export interface QuoteMock {
  t: "quote";
  text: string;
  cite: string;
}

export interface StatementMock {
  t: "statement";
  text: string;
  after?: string;
}

/**
 * Zwei Wege zum selben Ergebnis, nebeneinander.
 *
 * `n` ist die große Zahl, auf die es ankommt, `sub` ihre Einheit. Beides ist
 * freiwillig — eine Gegenüberstellung ohne Zahlen bleibt möglich.
 */
export interface DiffMock {
  t: "diff";
  before: { h: string; n?: string; sub?: string; p: string };
  after: { h: string; n?: string; sub?: string; p: string };
  /** Eine Zeile unter beiden Spalten, z.B. wie sich das Verhältnis entwickelt */
  foot?: string;
}

export interface ChartMock {
  t: "chart";
  which: "agriculture" | "unemployment" | "exposure";
}

/**
 * Wissen als T-Form.
 *
 * `human` — mäßig breiter Balken, tiefer Stamm.
 * `llm` — deutlich breiterer und dickerer Balken, aber kein Stamm.
 * `grown` — derselbe Balken, und der Stamm wächst zurück, beschriftet mit den
 * Wegen, über die das Spezialwissen hereinkommt.
 */
export interface TShapeMock {
  t: "tshape";
  variant: "human" | "llm" | "grown";
  capabilities?: string[];
  caption?: string;
  /** Beschreibung für Screenreader */
  alt: string;
}

/** Zwei E-Mails nebeneinander — die zweite erscheint erst beim nächsten Klick. */
export interface MailThreadMock {
  t: "mailthread";
  incoming: MailMock;
  reply: MailMock;
}

/** Blöcke, die sich mit jedem Klick aufbauen: Schritt n zeigt die Elemente 0 bis n. */
export interface RevealMock {
  t: "reveal";
  items: Array<{ text: string; sub?: string; accent?: boolean }>;
}

/** Ein eigener Inhalt je Klick-Schritt — ersetzt statt ergänzt. */
export interface SteppedMock {
  t: "stepped";
  frames: Mock[];
}

/** QR-Code auf die Zuschauersicht, mit kurzer Anleitung daneben. */
export interface QrMock {
  t: "qr";
  caption: string;
  hint: string;
}

/**
 * Die Vorstellung: Bild, Name, Rolle. Mehr nicht — der Rest wird erzählt.
 */
export interface BioMock {
  t: "bio";
  /** Pfad im public-Verzeichnis */
  photo: string;
  name: string;
  role: string;
}

/**
 * Live-Auswertung der Publikumsantworten auf der Leinwand.
 *
 * `of` nennt die Interaktion aus den Foliendaten. Fragen und Antwortoptionen
 * werden von dort geholt statt hier wiederholt — sonst laufen Handy und
 * Leinwand auseinander, sobald jemand eine Option ändert.
 */
export interface ResultsMock {
  t: "results";
  of: string;
  as: "matrix" | "list";
  axes?: { x: string; y: string };
  /** Kleiner QR-Code daneben — wer zu spät kommt, soll noch mitmachen können. */
  qr?: boolean;
}

export type Mock =
  | TShapeMock
  | MailThreadMock
  | RevealMock
  | SteppedMock
  | QrMock
  | BioMock
  | ResultsMock
  | MailMock
  | ChatMock
  | RunMock
  | FanMock
  | TimelineMock
  | ListMock
  | TweetsMock
  | QuoteMock
  | StatementMock
  | DiffMock
  | ChartMock;

/** Eine Frage der Publikumsumfrage. */
export interface PollQuestion {
  id: string;
  text: string;
  options: Array<{ value: string; label: string }>;
}

/**
 * Was die Teilnehmer auf dem Handy sehen und tun. Pro Klick-Schritt höchstens
 * eine Interaktion — die Zuschauersicht zeigt immer nur die eine, die gerade
 * dran ist.
 */
export type Interaction =
  /** Mehrere Fragen auf einmal — der Vortragende klickt dazwischen nicht weiter. */
  | { kind: "poll"; id: string; questions: PollQuestion[]; persist?: boolean }
  | {
      kind: "text";
      id: string;
      prompt: string;
      placeholder: string;
      examples: string[];
      persist?: boolean;
    }
  | {
      kind: "mailto";
      id: string;
      label: string;
      to: string;
      subject: string;
      body: string;
      hint: string;
      /** Hinweis, was mit der Adresse passiert — steht direkt am Knopf. */
      privacy?: string;
      /**
       * Bleibt auf dem Handy erreichbar, auch wenn der Vortrag weiter ist.
       * Die Mail an Lisa darf bis zum Ende geschrieben werden.
       */
      persist?: boolean;
      /** Bis wann der Knopf angeboten wird, als HH:MM Ortszeit. */
      until?: string;
    }
  /**
   * Gespräch mit dem Agenten auf dem Handy. Der Systemprompt ist einsehbar —
   * er ist der eigentliche Lerninhalt dieser Stufe.
   */
  | {
      kind: "chat";
      id: string;
      label: string;
      hint: string;
      systemPrompt: string;
      /** Vorgeschlagene Antworten, damit niemand lange tippen muss */
      suggestions?: string[];
      persist?: boolean;
    }
  | { kind: "wait"; id: string; message: string; persist?: boolean };

/**
 * Eine Stufe innerhalb eines Abschnitts.
 *
 * Panels scrollen horizontal: das vorige wandert nach links unter ein Overlay
 * und blendet dabei aus. Ein Panel ohne Mock zeigt nur den Titel — so beginnt
 * ein Abschnitt, dessen Aussage erst für sich stehen soll.
 */
export interface Panel {
  mock?: Mock;
  /** Gesprochener Text für genau diese Stufe */
  say?: string;
  /** Uhrzeit, zu der wir hier ankommen sollten */
  at?: string;
  /** Was das Publikum auf dem Handy sieht, solange diese Stufe läuft */
  audience?: Interaction;
  /** Was die Demo-Applikation liefern muss */
  app?: string;
  note?: string;
  open?: string;
  /** Interaktion mit dem Publikum, die der Vortragende moderiert */
  inter?: string;
}

/**
 * Ein Abschnitt der Präsentation.
 *
 * Abschnitte scrollen vertikal: der alte wandert nach oben weg, der neue
 * kommt von unten und blendet ein. Der Titel eines `hero`-Abschnitts steht
 * zuerst groß in der Mitte und wandert beim ersten Weiterklicken nach oben,
 * wo er als Überschrift stehen bleibt.
 */
export interface Section {
  /** 1-basierte Nummer über den ganzen Vortrag */
  n: number;
  b: BlockId;
  /** Typ-Label für die Operator-View */
  kind: string;
  title: string;
  sub?: string;
  /** Titel startet groß und mittig und wird dann zur klebenden Überschrift */
  hero?: boolean;
  panels: Panel[];
}
