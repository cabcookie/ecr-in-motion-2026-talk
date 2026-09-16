/**
 * Die Ports gegen das, was auf den Folien steht.
 *
 * Der Zweck ist nicht, dass die Ports „funktionieren" — sondern dass die Zahlen
 * aus Abschnitt 5 aus ihnen HERAUSKOMMEN, statt daneben behauptet zu werden.
 * Sobald Folie und Port auseinanderlaufen, schlägt hier etwas an und nicht erst
 * jemand im Publikum.
 *
 * Der Anker steht auf dem Vortragsabend. Alle Termine sind Abstände dazu, also
 * ergibt derselbe Lauf morgen dieselben Aussagen — nur mit anderen Daten darin.
 */
import {
  artikel,
  flaechen,
  kategorie,
  marge,
  platz,
  segment,
  anforderungen,
  setzeAnker,
  SORTIMENT,
} from '../src/index';

const VORTRAG = new Date(2026, 8, 16, 18, 0);
setzeAnker(VORTRAG);

let fehler = 0;
function pruefe(was: string, bedingung: boolean, zusatz = ''): void {
  if (bedingung) console.log(`  ok   ${was}`);
  else {
    fehler += 1;
    console.error(`  FEHL ${was}${zusatz ? ` — ${zusatz}` : ''}`);
  }
}

console.log('\nWarenwirtschaft — die Zahlen aus Abschnitt 5');
const kat = kategorie();
pruefe('Die Kategorie antwortet', kat.ok);
if (kat.ok) {
  pruefe(`Kategorie wächst +3,2 % (${kat.daten.entwicklung} %)`, kat.daten.entwicklung === 3.2);
  pruefe(
    `Schwächster Artikel ist Nocturne Mini (${kat.daten.schwaechster.artikel})`,
    kat.daten.schwaechster.artikel === 'Berghoff Nocturne Mini',
  );
  pruefe(
    `Er liegt bei -12 % (${kat.daten.schwaechster.entwicklung} %)`,
    kat.daten.schwaechster.entwicklung === -12,
  );
  pruefe('Jeder Treffer trägt Quelle und Stand', Boolean(kat.quelle && kat.stand));
}

console.log('\nWarenwirtschaft — die drei Ausgänge');
pruefe('Ein gelisteter Artikel wird gefunden', artikel('Nocturne').ok);
const neu = artikel('Hallbach Crispy Bites');
pruefe(
  'Ein neues Produkt ergibt nicht_gefunden, nicht „andere Kategorie zuständig"',
  !neu.ok && neu.grund === 'nicht_gefunden' && !/nicht zuständig/i.test(neu.hinweis ?? ''),
  neu.ok ? 'wurde gefunden' : `${neu.grund}: ${neu.hinweis}`,
);
pruefe(
  'Die Meldung nennt ein neues Produkt ausdrücklich als Normalfall',
  !neu.ok && /Normalfall/.test(neu.hinweis ?? ''),
);
const leer = artikel('');
pruefe('Eine leere Suche ergibt unvollstaendig', !leer.ok && leer.grund === 'unvollstaendig');

console.log('\nMarktdaten — das Argument für die Listung');
const seg = segment('Hallbach Crispy Bites');
pruefe('Das Segment antwortet', seg.ok);
if (seg.ok) {
  pruefe(
    `Segment ist „Crispy / gefüllte Riegel" (${seg.daten.segment})`,
    seg.daten.segment === 'Crispy / gefüllte Riegel',
  );
  pruefe(
    `Der Markt wächst zweistellig (${seg.daten.marktentwicklung} %)`,
    seg.daten.marktentwicklung >= 10,
  );
  pruefe(
    `Unser eigenes Sortiment bleibt dahinter (${seg.daten.eigeneEntwicklung} % gegen ${seg.daten.marktentwicklung} %)`,
    seg.daten.eigeneEntwicklung !== null && seg.daten.eigeneEntwicklung < seg.daten.marktentwicklung,
  );
  /*
    Das ist der Grund, warum die Trennung von Panelsegment und Regalzone drin
    ist: Käme beides aus derselben Quelle, wäre der Abstand null und das
    Argument verschwände.
  */
  pruefe('Panel und eigenes Sortiment sind nicht dieselbe Zahl', seg.daten.abstandInPunkten !== 0);
}

console.log('\nRegalplanung — die Knappheit steht in den Daten');
const riegel = platz('riegel');
pruefe('Die Zone antwortet', riegel.ok);
if (riegel.ok) {
  pruefe(
    `Die Riegelzone ist voll (${riegel.daten.belegt} von ${riegel.daten.kapazitaet} Facings)`,
    riegel.daten.frei === 0,
  );
  pruefe(
    'Nocturne Mini steht oben auf der Weichliste',
    riegel.daten.weichkandidaten[0]?.artikel === 'Berghoff Nocturne Mini',
  );
  pruefe(
    'Seine Auslistung kostet Rohertrag — er ist Eigenmarke und trägt überdurchschnittlich',
    riegel.daten.weichkandidaten[0]?.eigenmarke === true &&
      riegel.daten.weichkandidaten[0]?.rohertrag > 31.1,
  );
}
const zone = platz('Süßwarenregal');
pruefe(
  'Eine erfundene Zone ergibt nicht_gefunden mit den echten Zonen im Hinweis',
  !zone.ok && zone.grund === 'nicht_gefunden' && zone.hinweis.includes('riegel'),
);

console.log('\nAktionskalender — Termine relativ zur Regel');
const kal = flaechen('15. Oktober');
pruefe('Der Kalender antwortet', kal.ok);
if (kal.ok) {
  pruefe(
    `Der Wunschtermin hält die Vorlauffrist — knapp (${kal.daten.vorlaufTage} Tage, nötig ${kal.daten.vorlaufNoetig})`,
    kal.daten.fristErfuellt && kal.daten.vorlaufTage - kal.daten.vorlaufNoetig <= 3,
  );
  const naechste = kal.daten.freieFlaechen[0];
  pruefe(
    `Die nächste freie Fläche liegt am 22. Oktober (${naechste?.datum})`,
    naechste?.datum === '22. Oktober 2026',
  );
  pruefe(`Sie umfasst 12 Märkte (${naechste?.maerkte})`, naechste?.maerkte === 12);
  pruefe(`Sie liegt im Raum Hamburg (${naechste?.region})`, naechste?.region === 'Raum Hamburg');
  pruefe(
    'Flächen innerhalb der Vorlauffrist werden gar nicht erst angeboten',
    kal.daten.freieFlaechen.every((f) => f.inTagen >= kal.daten.vorlaufNoetig),
  );
}
const zuFrueh = flaechen('20. September');
pruefe(
  'Ein Termin unter der Frist wird als solcher benannt',
  zuFrueh.ok && !zuFrueh.daten.fristErfuellt && zuFrueh.daten.fehlendeTage > 0,
);
const kauderwelsch = flaechen('demnächst');
pruefe(
  'Ein unlesbarer Termin ergibt unvollstaendig statt eines geratenen Datums',
  !kauderwelsch.ok && kauderwelsch.grund === 'unvollstaendig',
);

console.log('\nListung — Regeln mit Quelle statt im Systemprompt');
const weg = anforderungen();
pruefe('Der Listungsweg antwortet', weg.ok);
if (weg.ok) {
  pruefe('Er nennt mehrere Tore', weg.daten.tore.length >= 4);
  pruefe(
    'Exklusivität entscheidet nicht das Category Management',
    weg.daten.tore.some((t) => t.tor === 'Exklusivität' && t.entscheidet.includes('Einkaufsleitung')),
  );
  pruefe(
    'Jedes Tor nennt, wer entscheidet',
    weg.daten.tore.every((t) => t.entscheidet.length > 0),
  );
}

console.log('\nDas Szenario rechnet sich durch');
const hallbach = marge(2.89, 4.49);
pruefe('Hallbach Crispy Bites: 31,1 %', hallbach.ok && hallbach.daten.rohertrag === 0.3113);
if (hallbach.ok && riegel.ok) {
  const nocturne = SORTIMENT.find((a) => a.bezeichnung === 'Nocturne Mini')!;
  const alt = marge(nocturne.ekPreis, nocturne.vkPreis);
  pruefe(
    alt.ok
      ? `Die Auslistung kostet ${((alt.daten.rohertrag - hallbach.daten.rohertrag) * 100).toFixed(1)} Punkte Rohertrag`
      : 'Nocturne Mini rechnet',
    alt.ok && alt.daten.rohertrag > hallbach.daten.rohertrag,
  );
}

/*
  Die zentrale Zusage des Zeitmodells, und deshalb gemessen statt geglaubt:
  Die Folie nennt den 22. Oktober. Der muss herauskommen, egal an welchem Tag
  geprobt wird — sonst steht in der Probe ein anderes Datum als im Vortrag.

  Das Einrasten auf Donnerstag leistet das: Fünf Wochen nach einem Sonntag und
  fünf Wochen nach einem Mittwoch sind verschiedene Tage, aber derselbe
  Aktionsdonnerstag.
*/
console.log('\nDas Datum hält, egal wann geprobt wird');
for (const [was, tag] of [
  ['Sonntag, 13.09.', new Date(2026, 8, 13)],
  ['Montag, 14.09.', new Date(2026, 8, 14)],
  ['Generalprobe, 15.09.', new Date(2026, 8, 15)],
  ['Vortrag, 16.09.', VORTRAG],
] as const) {
  setzeAnker(tag);
  const k = flaechen('15. Oktober');
  pruefe(
    `${was} ergibt den 22. Oktober`,
    k.ok && k.daten.freieFlaechen[0]?.datum === '22. Oktober 2026',
    k.ok ? k.daten.freieFlaechen[0]?.datum : k.grund,
  );
}
setzeAnker(VORTRAG);

console.log(
  `\nAnker: Vortragsabend. Alle Termine sind Abstände dazu — derselbe Lauf morgen ergibt dieselben Aussagen.`,
);
if (fehler > 0) process.exitCode = 1;
