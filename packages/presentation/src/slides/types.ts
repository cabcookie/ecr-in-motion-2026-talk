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

export interface DiffMock {
  t: "diff";
  before: { h: string; p: string };
  after: { h: string; p: string };
}

export interface ChartMock {
  t: "chart";
  which: "agriculture" | "unemployment" | "exposure";
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

/** Lebenslauf-Stationen als Zeile — für die Vorstellung. */
export interface BioMock {
  t: "bio";
  stations: string[];
  line: string;
}

/** Platzhalter für die Live-Auswertung der Publikumsantworten. */
export interface ResultsMock {
  t: "results";
  of: string;
  as: "matrix" | "list";
  axes?: { x: string; y: string };
}

export type Mock =
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
  | { kind: "poll"; id: string; question: PollQuestion }
  | { kind: "text"; id: string; prompt: string; placeholder: string; examples: string[] }
  | {
      kind: "mailto";
      id: string;
      label: string;
      to: string;
      subject: string;
      body: string;
      hint: string;
    }
  | { kind: "wait"; id: string; message: string };

export interface Slide {
  /** 1-basierte Foliennummer über den ganzen Vortrag */
  n: number;
  b: BlockId;
  /** Typ-Label für die Operator-View, z.B. "Outlook", "Agent · Stufe d" */
  kind: string;
  headline: string;
  sub?: string;
  mock?: Mock;
  /**
   * Anzahl der Klick-Schritte. 1 (oder nicht gesetzt) bedeutet: alles sofort
   * sichtbar, ein Klick geht zur nächsten Folie.
   */
  steps?: number;
  /** Sprechnotiz — nur Operator-View. Bei mehreren Schritten je Schritt eine. */
  say?: string;
  sayByStep?: string[];
  /** Was das Publikum auf dem Handy sieht — Index ist der Klick-Schritt. */
  audience?: Array<Interaction | null>;
  /** Was die Demo-Applikation liefern muss — nur Operator-View */
  app?: string;
  /** Redaktioneller Hinweis — nur Operator-View */
  note?: string;
  /** Ungelöster Punkt — nur Operator-View */
  open?: string;
  /** Interaktion mit dem Publikum — nur Operator-View */
  inter?: string;
}
