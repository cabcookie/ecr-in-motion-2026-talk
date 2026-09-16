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
 * Wissen als T — in Stufen aufgebaut.
 *
 * Das menschliche T steht zuerst allein und beschriftet. Danach tritt es
 * zurück und dient als Vergleich, während sich das Modell darüberlegt: erst
 * sein breiterer Balken, dann sein Stamm, dann die Bausteine einzeln.
 *
 * Eine Stufe je Klick, damit der Vortragende jeden Schritt erklären kann,
 * während er erscheint:
 *
 *   0  das menschliche T, voll beschriftet
 *   1  dasselbe, blass und ohne Beschriftung — „und ein Sprachmodell?"
 *   2  dazu der Balken des Modells, durchscheinend über dem menschlichen
 *   3  dazu der Stamm des Modells — er wächst herunter
 *   4+ dazu je ein Baustein, einer je Stufe
 */
export interface TShapeMock {
  t: "tshape";
  stufe: number;
  /** Die Bausteine, die ab Stufe 4 einzeln erscheinen. Nur Wörter, keine Sätze. */
  bausteine?: string[];
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

/**
 * Ein Bild, das für sich steht.
 *
 * Für Belege, die als Beleg aussehen müssen: ein Screenshot beglaubigt stärker
 * als derselbe Text neu gesetzt. Wer ihn nachgebaut sieht, fragt sich, ob er
 * stimmt; wer das Original sieht, fragt sich das nicht.
 */
export interface BildMock {
  t: "bild";
  /** Pfad im public-Verzeichnis. */
  src: string;
  alt: string;
  caption?: string;
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

/**
 * Das vereinfachte Architekturbild.
 *
 * Dreistufig: Eingänge und Agent, dann seine Werkzeuge, dann die simulierten
 * Systeme. `alt` beschreibt das Bild für alles, was kein Bild lesen kann.
 */
export interface ArchitekturMock {
  t: "architektur";
  alt: string;
}

/**
 * Der Abspann: was die Teilnehmer mitnehmen koennen.
 *
 * Traegt keine eigenen Daten — der Inhalt steht in
 * aws-blocks/mail/anhang.md und damit an derselben Stelle wie der feste Teil
 * der Antwortmail und die letzte Seite des PDFs.
 */
export interface AbspannMock {
  t: "abspann";
}

export type Mock =
  | AbspannMock
  | BildMock
  | ArchitekturMock
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
 * Ein Satz Zusammenhang, der über der Interaktion steht.
 *
 * Auf dem Handy fehlt alles, was gerade auf der Leinwand zu sehen ist: Wer eine
 * Frage beantworten soll, sieht nur die Frage. Dieser Satz stellt her, worauf
 * sie sich bezieht. Optional, weil die meisten Fragen für sich stehen — und
 * dann ist jeder zusätzliche Satz nur eine Hürde vor der Antwort.
 */
interface MitZusammenhang {
  message?: string;
  /**
   * Letzter Abschnitt, in dem etwas auf dem Handy noch erscheint.
   *
   * Verlässlicher als `until`: Eine Uhrzeit trifft nur zu, wenn der Vortrag im
   * Plan liegt, eine Abschnittsnummer immer. Ab dem Abschnitt danach ist das
   * Handy wieder frei für das, was gerade dran ist — eine Seite, auf der drei
   * alte Angebote stehen, lenkt von dem einen ab, das zählt.
   *
   * Steht hier und nicht an einzelnen Arten, weil es für jede gilt, die
   * `persist` trägt.
   */
  bisAbschnitt?: number;
}

/**
 * Was die Teilnehmer auf dem Handy sehen und tun. Pro Klick-Schritt höchstens
 * eine Interaktion — die Zuschauersicht zeigt immer nur die eine, die gerade
 * dran ist.
 */
export type Interaction = MitZusammenhang &
  /** Mehrere Fragen auf einmal — der Vortragende klickt dazwischen nicht weiter. */
  (| { kind: "poll"; id: string; questions: PollQuestion[]; persist?: boolean }
    | {
      kind: "text";
      id: string;
      prompt: string;
      placeholder: string;
      examples: string[];
      persist?: boolean;
      /**
       * Mehrere Antworten statt einer.
       *
       * Auf „Welche Aufgaben hast Du abgegeben?" gibt es selten nur eine
       * Antwort. Ohne dies überschriebe die zweite Eingabe die erste, und die
       * Leinwand zeigte am Ende weniger, als der Raum beigetragen hat.
       */
      mehrfach?: boolean;
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
      /**
       * Jedem Teilnehmer eine Rolle zuteilen und den Entwurf dazu vorfüllen.
       *
       * Ohne das schreibt jeder ins Blaue: Man weiß weder, für welche Marke man
       * steht, noch was Nordkorb davon führt. Bewusst nicht überall an — in
       * Abschnitt 15 soll der Text ausdrücklich unverändert bleiben, dort wäre
       * ein Briefing das Gegenteil des Punktes.
       */
      briefing?: boolean;
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
      /**
       * Welche Stufe antwortet.
       *
       * `roh` ist das nackte Modell — kein Systemprompt, keine Werkzeuge. Genau
       * darum geht es in Abschnitt 14: Man soll erleben, wie ein Agent klingt,
       * der nichts nachschlagen kann, bevor man sieht, was ein Systemprompt
       * daraus macht.
       *
       * `prompt` ist der Systemprompt ohne Systeme (Abschnitt 16): Der Agent
       * weiß, wer er ist, und muss jede Zahl im Chat erfragen. Ohne Angabe
       * antwortet `voll`, der Agent mit allen Fachwerkzeugen.
       */
      stufe?: "voll" | "prompt" | "roh";
      /**
       * Womit das Gespräch beginnt.
       *
       * `briefing` nimmt die Mail aus dem eigenen Briefing — der Teilnehmer
       * schreibt also als der Lieferant, der er den ganzen Abend ist.
       * `hallbach` nimmt die Mail von der Leinwand.
       */
      auftakt?: "hallbach" | "briefing";
      /** Zeigt die erste Nachricht an, statt sie stumm zu schicken. */
      auftaktZeigen?: boolean;
      /**
       * Ein Zug, kein Gespräch: kein Eingabefeld, keine Vorschläge.
       *
       * In Abschnitt 14 geht es nur darum, EINE Antwort zu sehen — die eines
       * Agenten, der nichts nachschlagen kann. Ein Eingabefeld darunter lädt
       * zum Weiterreden ein und zieht die Aufmerksamkeit von dem ab, was gerade
       * auf der Leinwand besprochen wird.
       */
      einmalig?: boolean;
      /** Vorgeschlagene Antworten, damit niemand lange tippen muss */
      suggestions?: string[];
      persist?: boolean;
    }
    /** Zwischen zwei Interaktionen — hier IST der Zusammenhang der ganze Inhalt. */
    | { kind: "wait"; id: string; message: string; persist?: boolean });

/**
 * Wie ein Panel auf Papier landet.
 *
 * Ein PDF wird allein gelesen, später, ohne Vortragenden und ohne den Saal. Was
 * live trägt, trägt dort oft nicht: Ein QR-Code führt ins Leere, eine
 * Live-Auswertung zeigt null Antworten, und ein Sprechertext, der „schau auf
 * Dein Handy" sagt, redet mit niemandem.
 *
 * Alle drei Angaben sind freiwillig. Ohne sie gilt: Folie übernehmen,
 * Sprechertext darunter. Das trägt bei drei Vierteln der Panels — der
 * Sprechertext dieses Vortrags besteht aus ganzen Sätzen.
 *
 * Verlassen sollte man sich darauf trotzdem nicht: `pruefung/papier-test.ts`
 * findet die Panels, bei denen das PDF lügen würde, und bricht ab, wenn eines
 * davon keine Angabe hat. Das eigentliche Problem ist nicht, eine Folie zu
 * vergessen, sondern dass es niemandem auffällt.
 */
export interface Papier {
  /** Kommt gar nicht ins PDF. Für alles, was ohne den Raum sinnlos ist. */
  weg?: boolean;
  /**
   * Auch dann zeigen, wenn eine Aufbaufolge sonst nur ihren Endstand druckt.
   *
   * Eine Folie, die sich über mehrere Klicks aufbaut, braucht auf Papier nur
   * ihr letztes Bild — dort steht ohnehin alles. Manchmal trägt eine
   * Zwischenstufe aber etwas, das der Endstand nicht mehr zeigt: eine
   * Beschriftung, die später zurücktritt, ein Vergleich, der danach nur noch
   * blass im Hintergrund steht. Die bekommt dieses Kennzeichen.
   */
  behalten?: boolean;
  /** Ersetzt die Folie — der QR-Code wird zu dem, was dahinter lag. */
  statt?: Mock;
  /** Was unter der Folie steht. Fehlt er, gilt der Sprechertext. */
  text?: string;
}

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
  /** Wie dieses Panel im PDF erscheint. Fehlt es, gilt die Folie unverändert. */
  papier?: Papier;
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
