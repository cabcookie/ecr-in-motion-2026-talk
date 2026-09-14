/**
 * Kostenvergleich für Abschnitt 17: sechs Rückfragen gegen eine Nachricht.
 *
 *   pnpm --filter @ecr-talk/presentation kosten
 *
 * Beide Läufe kommen zum selben Ergebnis — derselben Empfehlung an Lisa.
 * Der Unterschied liegt allein darin, wie oft der Verlauf übertragen wird:
 * Ein Modell hat kein Gedächtnis, also geht bei jedem Aufruf das ganze
 * Gespräch erneut hin. Bei n Runden wird der Systemprompt n-mal bezahlt und
 * die k-te Antwort (n−k)-mal.
 *
 * Systemprompt und eingehende Mail kommen aus den Foliendaten, damit hier
 * genau der Text gerechnet wird, der im Vortrag gezeigt wird.
 */
import { encode } from 'gpt-tokenizer';
import { SYSTEM_PROMPT, SEED_MESSAGE } from '../src/slides/agent';

/**
 * Gezählt wird mit einem öffentlichen BPE-Tokenizer (cl100k_base), nicht mit
 * dem von Claude — der ist nicht veröffentlicht. Für deutschen Fließtext
 * liegen beide im selben Bereich. Wichtiger ist ohnehin das Verhältnis der
 * beiden Läufe, und das hängt nicht am Tokenizer: beide rechnen mit denselben
 * Texten, nur unterschiedlich oft.
 */
const tok = (s: string) => encode(s).length;

/**
 * Preise je Million Token, Amazon Bedrock, On-Demand, globales Inferenzprofil.
 *
 * Prompt-Caching hat zwei Lebensdauern. Die kurze ist billiger zu schreiben,
 * hält aber nur fünf Minuten — und genau das ist hier der Haken: In einem
 * Gespräch, in dem ein Mensch antwortet, vergehen zwischen zwei Runden
 * leicht mehr als fünf Minuten. Dann ist der Cache kalt und der Verlauf wird
 * zum vollen Preis neu geschrieben. Die Stundenvariante überlebt das, kostet
 * im Schreiben aber das Doppelte.
 */
const MODELLE = {
  'Claude Opus 4.8': { ein: 5, aus: 25, schreib5m: 6.25, schreib1h: 10, lesen: 0.5 },
  'Claude Sonnet 4.6': { ein: 3, aus: 15, schreib5m: 3.75, schreib1h: 6, lesen: 0.3 },
} as const;

type Preise = (typeof MODELLE)[keyof typeof MODELLE];
type Modus = 'ohne' | '5m' | '1h';

const M = 1_000_000;

/** Die sechs Angaben, die dem Agenten fehlen — dieselben wie in Abschnitt 18. */
const RUNDEN = [
  {
    frage:
      'Bevor ich das einordnen kann, brauche ich eine Angabe aus der Warenwirtschaft: Wie hat sich die Kategorie Schokolade & Pralinen in den letzten zwölf Monaten entwickelt? Mir fehlt der Zugriff darauf, deshalb frage ich Sie.',
    antwort: 'Die Kategorie wächst um 3,2 Prozent gegenüber dem Vorjahr.',
  },
  {
    frage:
      'Danke. Weil der Regalplatz knapp ist, setzt eine Neulistung in der Regel eine Auslistung voraus. Welcher Artikel in der Kategorie läuft am schlechtesten? Ich brauche Name und Entwicklung, dann kann ich den Tausch vorschlagen.',
    antwort: 'Nocturne Mini, minus 12 Prozent. Der ist seit zwei Quartalen auf dem Rückzug.',
  },
  {
    frage:
      'Verstanden. Nächste Frage an die Regalplanung: Würde durch eine Auslistung von Nocturne Mini tatsächlich Platz für Hallbach Crispy Bites frei, oder liegen die Artikel in unterschiedlichen Regalzonen?',
    antwort: 'Gleiche Zone. Wenn Nocturne Mini geht, ist der Platz frei.',
  },
  {
    frage:
      'Gut. Für die Kategorievorgabe brauche ich die Marge. Aus den Konditionen der Anfrage — Einkaufspreis 2,89 Euro, empfohlener Verkaufspreis 4,49 Euro — ergibt sich ein Wert, aber ich möchte ihn nicht selbst rechnen und als geprüft ausgeben. Welche Marge steht in der Kalkulation?',
    antwort: 'Die Kalkulation weist 34,2 Prozent aus. Damit liegt sie über der Vorgabe von 30 Prozent.',
  },
  {
    frage:
      'Danke. Jetzt zum Segment: Wie entwickelt sich Crispy beziehungsweise gefüllte Riegel im Markt insgesamt? Das brauche ich, um einzuschätzen, ob die Listung auf einen Trend aufsetzt oder gegen ihn läuft.',
    antwort: 'Das Segment wächst zweistellig, deutlich schneller als die Gesamtkategorie.',
  },
  {
    frage:
      'Letzte Angabe: Steht im Aktionskalender im Zeitraum um den gewünschten Start am 15. Oktober etwas an, das sich mit einer Einführung verbinden ließe? Der Vorlauf für Aktionsflächen beträgt vier Wochen, wir wären knapp dran.',
    antwort:
      'Am 22. Oktober werden in zwölf Hamburger Märkten Aufsteller frei. Die waren für eine Aktion vorgesehen, die abgesagt wurde.',
  },
];

/** Die Empfehlung am Ende — in beiden Läufen dieselbe. */
const EMPFEHLUNG = `Zusammenfassung: Hallbach Süßwaren möchte Hallbach Crispy Bites exklusiv einführen, Start 15. Oktober, Einkaufspreis 2,89 Euro, empfohlener Verkaufspreis 4,49 Euro, Mindestabnahme 500 Verkaufseinheiten, Rückmeldung bis Ende nächster Woche.

Empfehlung: listen, mit einem Gegenvorschlag zum Termin.

Worauf sie sich stützt:
- Marge 34,2 Prozent, über der Kategorievorgabe von 30 Prozent (Ihre Angabe aus der Kalkulation).
- Die Kategorie wächst um 3,2 Prozent, das Segment deutlich schneller. Die Listung setzt auf einen Trend auf.
- Regalplatz wird frei, wenn Nocturne Mini ausgelistet wird — minus 12 Prozent, gleiche Regalzone.
- Am 22. Oktober werden in zwölf Hamburger Märkten Aufsteller frei. Ein Start am 22. statt am 15. Oktober verbindet die Einführung mit einer Zweitplatzierung. Der Vorlauf von vier Wochen ist damit gewahrt.

Was ich nicht geprüft habe: die Exklusivzusage. Die braucht die Freigabe der Einkaufsleitung, dafür habe ich keine Berechtigung.`;

/** Die sechs Angaben auf einmal — so, wie man sie einem Agenten gleich mitgibt. */
const BRIEFING = [
  'Hier alles, was du zur Einordnung brauchst:',
  ...RUNDEN.map((r, i) => `${i + 1}. ${r.antwort}`),
].join('\n');


const sys = tok(SYSTEM_PROMPT);
const mail = tok(SEED_MESSAGE);

/**
 * Das Gespräch als Folge von Abschnitten, in der Reihenfolge, in der sie
 * hinzukommen. Abschnitt 0 ist der feste Vorspann, danach kommt je Runde die
 * Frage des Agenten und Lisas Antwort dazu.
 *
 * Aufruf j trägt die Abschnitte 0 bis j. Das sind sieben Aufrufe: sechs
 * Rückfragen und die Empfehlung.
 */
const ABSCHNITTE = [sys + mail, ...RUNDEN.map((r) => tok(r.frage) + tok(r.antwort))];
const AUFRUFE = ABSCHNITTE.length;

/** Ausgabe je Aufruf: sechs Fragen, dann die Empfehlung. */
const AUSGABEN = [...RUNDEN.map((r) => tok(r.frage)), tok(EMPFEHLUNG)];
const ausA = AUSGABEN.reduce((a, b) => a + b, 0);

/**
 * Eingabe-Token nach Abrechnungsart.
 *
 * Ohne Caching zahlt jeder Aufruf alles, was er mitschickt. Mit Caching wird
 * jeder Abschnitt genau einmal geschrieben und danach bei jedem weiteren
 * Aufruf gelesen — Lesen kostet ein Zehntel.
 */
function eingabeA(mitCache: boolean) {
  let voll = 0;
  let schreiben = 0;
  let lesen = 0;
  for (let j = 0; j < AUFRUFE; j++) {
    for (let i = 0; i <= j; i++) {
      if (!mitCache) voll += ABSCHNITTE[i];
      else if (i === j) schreiben += ABSCHNITTE[i];
      else lesen += ABSCHNITTE[i];
    }
  }
  return { voll, schreiben, lesen };
}

function kostenA(p: Preise, modus: Modus) {
  const e = eingabeA(modus !== 'ohne');
  const schreibpreis = modus === '1h' ? p.schreib1h : p.schreib5m;
  return (
    (e.voll * p.ein + e.schreiben * schreibpreis + e.lesen * p.lesen + ausA * p.aus) / M
  );
}

// ─── Lauf B: alles in einer Nachricht ───────────────────────────────────────
//
// Ein einziger Aufruf. Caching bringt hier nichts — es gibt keinen zweiten
// Aufruf, der davon lesen könnte. Ein Cache-Eintrag wäre sogar teurer.
// Ausnahme: der Systemprompt ist für alle Vorgänge derselbe und liegt im
// laufenden Betrieb ohnehin im Cache.
const einB = sys + mail + tok(BRIEFING);
const ausB = tok(EMPFEHLUNG);
const kostenB = (p: Preise) => (einB * p.ein + ausB * p.aus) / M;
const kostenBWarm = (p: Preise) =>
  (sys * p.lesen + (mail + tok(BRIEFING)) * p.ein + ausB * p.aus) / M;

const ct = (d: number) => `${(d * 100).toFixed(3)} ct`;
const zahl = (n: number) => n.toLocaleString('de-DE');

const roh = eingabeA(false);
const cached = eingabeA(true);

console.log(`
Kostenvergleich · Abschnitt 17
Sechs Rückfragen gegen eine Nachricht — dasselbe Ergebnis, derselbe Text.

Bausteine
  Systemprompt              ${zahl(sys).padStart(6)} Token
  Eingehende Mail           ${zahl(mail).padStart(6)} Token
  Sechs Angaben am Stück    ${zahl(tok(BRIEFING)).padStart(6)} Token
  Empfehlung                ${zahl(tok(EMPFEHLUNG)).padStart(6)} Token

Mengengerüst
  A · ${AUFRUFE} Aufrufe   Eingabe ${zahl(roh.voll).padStart(6)} Token   Ausgabe ${zahl(ausA).padStart(5)} Token
       davon mit Caching: ${zahl(cached.schreiben)} geschrieben, ${zahl(cached.lesen)} gelesen
  B · 1 Aufruf     Eingabe ${zahl(einB).padStart(6)} Token   Ausgabe ${zahl(ausB).padStart(5)} Token
`);

for (const [name, p] of Object.entries(MODELLE)) {
  const b = kostenB(p);
  const zeilen: Array<[string, number]> = [
    ['ohne Caching', kostenA(p, 'ohne')],
    ['Caching, 5 Minuten', kostenA(p, '5m')],
    ['Caching, 1 Stunde', kostenA(p, '1h')],
  ];
  console.log(`${name}   ($${p.ein} Eingabe · $${p.aus} Ausgabe · $${p.lesen} Cache-Treffer, je Mio.)`);
  for (const [was, a] of zeilen) {
    console.log(
      `  A ${was.padEnd(20)} ${ct(a).padStart(9)}   gegen B ${ct(b).padStart(9)}   =  ${(
        a / b
      ).toFixed(1)}-mal`,
    );
  }
  console.log(
    `  B mit warmem Systemprompt ${ct(kostenBWarm(p)).padStart(9)}` +
      `   ·  1.000 Vorgänge: A $${(kostenA(p, '5m') * 1000).toFixed(2)} gegen B $${(b * 1000).toFixed(2)}\n`,
  );
}

/** Wie das Verhältnis mit der Zahl der Runden wächst. */
function verhaeltnis(runden: number, p: Preise, modus: Modus) {
  const abschnitte = [
    ABSCHNITTE[0],
    ...Array.from({ length: runden }, (_, i) => ABSCHNITTE[1 + (i % RUNDEN.length)]),
  ];
  const ausgaben = [
    ...Array.from({ length: runden }, (_, i) => tok(RUNDEN[i % RUNDEN.length].frage)),
    tok(EMPFEHLUNG),
  ];
  let voll = 0;
  let schreiben = 0;
  let lesen = 0;
  for (let j = 0; j < abschnitte.length; j++) {
    for (let i = 0; i <= j; i++) {
      if (modus === 'ohne') voll += abschnitte[i];
      else if (i === j) schreiben += abschnitte[i];
      else lesen += abschnitte[i];
    }
  }
  const schreibpreis = modus === '1h' ? p.schreib1h : p.schreib5m;
  const aus = ausgaben.reduce((a, b) => a + b, 0);
  const a = (voll * p.ein + schreiben * schreibpreis + lesen * p.lesen + aus * p.aus) / M;
  return a / kostenB(p);
}

const opus = MODELLE['Claude Opus 4.8'];
console.log('Verhältnis nach Zahl der Runden · Claude Opus 4.8');
console.log('  Runden        ohne Caching    mit Caching (5 Min.)');
for (const n of [3, 6, 12, 20]) {
  console.log(
    `  ${String(n).padStart(2)}  ${verhaeltnis(n, opus, 'ohne').toFixed(1).padStart(14)}-mal ${verhaeltnis(
      n,
      opus,
      '5m',
    )
      .toFixed(1)
      .padStart(17)}-mal`,
  );
}

console.log(`
Gezählt mit cl100k_base, nicht mit dem Tokenizer von Claude — der ist nicht
veröffentlicht; für diesen Text sind das ${(
  (SYSTEM_PROMPT.length + SEED_MESSAGE.length) /
  (sys + mail)
).toFixed(2)} Zeichen je Token. Das Verhältnis
der Läufe hängt nicht am Tokenizer, die absoluten Beträge um einige Prozent.

Der Cache mit fünf Minuten Lebensdauer setzt voraus, dass Lisa binnen fünf
Minuten antwortet. Tut sie das nicht, ist der Verlauf kalt und wird zum vollen
Preis neu geschrieben — dann gilt wieder die Zeile "ohne Caching".
`);
