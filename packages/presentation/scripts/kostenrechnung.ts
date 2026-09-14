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

/** Amazon Bedrock, Claude Sonnet 4.6, On-Demand, globales Inferenzprofil. */
const PREIS_EIN = 3 / 1_000_000;
const PREIS_AUS = 15 / 1_000_000;

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

// ─── Lauf A: Frage für Frage ────────────────────────────────────────────────
//
// Aufruf k trägt den Systemprompt, die Mail und alles, was bisher gesagt
// wurde. Nach der sechsten Antwort folgt ein siebter Aufruf für die
// Empfehlung.
let einA = 0;
let ausA = 0;
let verlauf = 0;
for (const runde of RUNDEN) {
  einA += sys + mail + verlauf;
  ausA += tok(runde.frage);
  verlauf += tok(runde.frage) + tok(runde.antwort);
}
einA += sys + mail + verlauf;
ausA += tok(EMPFEHLUNG);
const aufrufeA = RUNDEN.length + 1;

// ─── Lauf B: alles in einer Nachricht ───────────────────────────────────────
const einB = sys + mail + tok(BRIEFING);
const ausB = tok(EMPFEHLUNG);

const kosten = (ein: number, aus: number) => ein * PREIS_EIN + aus * PREIS_AUS;
const kostenA = kosten(einA, ausA);
const kostenB = kosten(einB, ausB);

const cent = (d: number) => `${(d * 100).toFixed(3)} ct`;
const zahl = (n: number) => n.toLocaleString('de-DE');

/**
 * Wie sich das Verhältnis verschiebt.
 *
 * Zwei Hebel bestimmen es. Erstens die Zahl der Runden: der feste Vorspann —
 * Systemprompt und Mail — wird jedes Mal erneut bezahlt, der Verlauf wächst
 * obendrein. Zweitens die Größe dessen, was der Agent mit sich trägt. Hängen
 * an der ersten Nachricht Unterlagen, dann wandern die bei jedem Aufruf
 * wieder mit, und das Verhältnis läuft gegen die Zahl der Aufrufe.
 */
function laufA(runden: number, anhang: number) {
  let ein = 0;
  let aus = 0;
  let verlauf = 0;
  for (let i = 0; i < runden; i++) {
    const r = RUNDEN[i % RUNDEN.length];
    ein += sys + mail + anhang + verlauf;
    aus += tok(r.frage);
    verlauf += tok(r.frage) + tok(r.antwort);
  }
  ein += sys + mail + anhang + verlauf;
  aus += tok(EMPFEHLUNG);
  return kosten(ein, aus);
}

function laufB(anhang: number) {
  return kosten(sys + mail + anhang + tok(BRIEFING), tok(EMPFEHLUNG));
}

const skala = [
  ['ohne Anhang', 0],
  ['mit Kategoriebericht (~5.000 Token)', 5_000],
  ['mit Bericht, Planogramm und Marktdaten (~20.000 Token)', 20_000],
] as const;

console.log(`
Kostenvergleich · Abschnitt 17
Modell: Claude Sonnet 4.6 auf Amazon Bedrock, On-Demand
Preis:  $3 je Mio. Eingabe-Token, $15 je Mio. Ausgabe-Token

Bausteine
  Systemprompt              ${zahl(sys).padStart(6)} Token
  Eingehende Mail           ${zahl(mail).padStart(6)} Token
  Sechs Angaben am Stück    ${zahl(tok(BRIEFING)).padStart(6)} Token
  Empfehlung                ${zahl(tok(EMPFEHLUNG)).padStart(6)} Token

A · Frage für Frage (${aufrufeA} Modellaufrufe)
  Eingabe   ${zahl(einA).padStart(7)} Token   $${(einA * PREIS_EIN).toFixed(5)}
  Ausgabe   ${zahl(ausA).padStart(7)} Token   $${(ausA * PREIS_AUS).toFixed(5)}
  Summe                        $${kostenA.toFixed(5)}   ${cent(kostenA)}

B · Alles in einer Nachricht (1 Modellaufruf)
  Eingabe   ${zahl(einB).padStart(7)} Token   $${(einB * PREIS_EIN).toFixed(5)}
  Ausgabe   ${zahl(ausB).padStart(7)} Token   $${(ausB * PREIS_AUS).toFixed(5)}
  Summe                        $${kostenB.toFixed(5)}   ${cent(kostenB)}

Verhältnis: ${(kostenA / kostenB).toFixed(1)}-mal so teuer
Eingabe-Token: ${(einA / einB).toFixed(1)}-mal so viele

Zum Einordnen: 1.000 solcher Vorgänge kosten
  A  $${(kostenA * 1000).toFixed(2)}
  B  $${(kostenB * 1000).toFixed(2)}

Wie sich das verschiebt
${skala
  .map(([was, anhang]) => {
    const a = laufA(6, anhang);
    const b = laufB(anhang);
    return `  ${was.padEnd(56)} ${cent(a).padStart(10)} gegen ${cent(b).padStart(9)}  =  ${(
      a / b
    ).toFixed(1)}-mal`;
  })
  .join('\n')}

Mehr Runden, ohne Anhang
${[3, 6, 12, 20]
  .map((n) => {
    const a = laufA(n, 0);
    const b = laufB(0);
    return `  ${String(n).padStart(2)} Runden  ${cent(a).padStart(10)} gegen ${cent(b).padStart(
      9,
    )}  =  ${(a / b).toFixed(1)}-mal`;
  })
  .join('\n')}

Gezählt mit cl100k_base, nicht mit dem Tokenizer von Claude — der ist nicht
veröffentlicht. Für diesen Text sind das ${(
  (SYSTEM_PROMPT.length + SEED_MESSAGE.length) /
  (sys + mail)
).toFixed(2)} Zeichen je Token. Das Verhältnis
der beiden Läufe hängt nicht am Tokenizer, die absoluten Cent-Beträge schon
um einige Prozent. Ohne Prompt-Caching gerechnet; mit Caching schrumpft der
Abstand, verschwindet aber nicht.
`);
