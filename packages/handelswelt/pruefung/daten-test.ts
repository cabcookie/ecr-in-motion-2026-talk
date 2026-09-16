/**
 * Tragen die erzeugten Daten, was die Folien behaupten?
 *
 * Geprüft wird dreierlei: dass die Zahlen der Folien aus dem Sortiment
 * folgen, dass die Artikel sich im Schnitt rechnen, und dass die Kulisse den
 * Rest des Ladens abdeckt, ohne Artikelnamen zu tragen.
 *
 *   pnpm --filter @ecr-talk/handelswelt run daten:test
 */
import { KULISSE } from '../src/daten/kulisse';
import { KATEGORIE, SORTIMENT } from '../src/daten/sortiment';
import { SCHOKOLADE_UND_PRALINEN } from '../src/daten/kategorien';
import { marge } from '../src/systeme/kalkulation';

let fehler = 0;
function pruefe(was: string, bedingung: boolean, zusatz = ''): void {
  if (bedingung) console.log(`  ok   ${was}`);
  else {
    fehler += 1;
    console.error(`  FEHL ${was}${zusatz ? ` — ${zusatz}` : ''}`);
  }
}

console.log('\nDie Zahlen der Folie kommen aus den Daten');

const menge = SORTIMENT.reduce((s, a) => s + a.absatzJahr, 0);
const entwicklung = SORTIMENT.reduce((s, a) => s + a.entwicklung * a.absatzJahr, 0) / menge;
pruefe(
  `Kategorie wächst +3,2 % (gerechnet: ${entwicklung.toFixed(1)} %)`,
  Math.abs(entwicklung - 3.2) < 0.05,
);

const nocturne = SORTIMENT.find((a) => a.bezeichnung === 'Nocturne Mini');
pruefe('Nocturne Mini steht im Sortiment', nocturne !== undefined);
pruefe('Nocturne Mini liegt bei -12 %', nocturne?.entwicklung === -12);
pruefe(
  'Nocturne Mini ist der schwächste Artikel',
  nocturne !== undefined && SORTIMENT.every((a) => a.entwicklung >= nocturne.entwicklung),
);
pruefe(
  'Nocturne Mini liegt in der Riegelzone — sonst stimmt die Folie zum Regalplatz nicht',
  nocturne?.zone === 'riegel',
);

console.log('\nDie Artikel rechnen sich');

const rohertragVon = (a: { ekPreis: number; vkPreis: number }) => {
  const b = marge(a.ekPreis, a.vkPreis);
  return b.ok ? b.daten.rohertrag : 0;
};

/*
  NICHT geprüft wird, ob jeder einzelne Artikel die Vorgabe hält — das tut im
  Handel keine Kategorie. Die 30 % sind die Hürde für eine NEUlistung, nicht
  ein Gesetz für den Bestand. Was gelten muss, ist der gewichtete Schnitt.
*/
const menge2 = SORTIMENT.reduce((s, a) => s + a.absatzJahr, 0);
const schnittGewichtet =
  SORTIMENT.reduce((s, a) => s + rohertragVon(a) * a.absatzJahr, 0) / menge2;
const darunter = SORTIMENT.filter((a) => rohertragVon(a) < SCHOKOLADE_UND_PRALINEN.mindestRohertrag);
pruefe(
  `Die Kategorie trägt im Schnitt über der Vorgabe (${(schnittGewichtet * 100).toFixed(1)} %)`,
  schnittGewichtet >= SCHOKOLADE_UND_PRALINEN.mindestRohertrag,
);
console.log(`  ·    ${darunter.length} von ${SORTIMENT.length} Artikeln liegen einzeln darunter — das ist Handel, kein Fehler`);

pruefe(
  'Hallbach Crispy Bites läge mit 31,1 % über der Vorgabe, aber unter dem Schnitt',
  (() => {
    const b = marge(2.89, 4.49);
    return b.ok && b.daten.erfuellt && b.daten.rohertrag < schnittGewichtet;
  })(),
);

const eigen = SORTIMENT.filter((a) => a.eigenmarke);
const fremd = SORTIMENT.filter((a) => !a.eigenmarke);
const schnitt = (as: typeof SORTIMENT) => as.reduce((s, a) => s + rohertragVon(a), 0) / as.length;
pruefe(
  `Eigenmarken tragen mehr Rohertrag als Herstellermarken (${(schnitt(eigen) * 100).toFixed(1)} % gegen ${(schnitt(fremd) * 100).toFixed(1)} %)`,
  schnitt(eigen) > schnitt(fremd),
);

console.log('\nDie Kulisse trägt');

pruefe('Kulisse kennt viele Warengruppen', KULISSE.length > 100);
pruefe(
  'Lisas Kategorie liegt NICHT in der Kulisse',
  !KULISSE.some((g) => g.gruppe === KATEGORIE),
);
pruefe(
  'Die Kulisse trägt keine Artikelnamen — nur Gruppe und Anzahl',
  KULISSE.every((g) => typeof g.artikel === 'number' && g.artikel > 0),
);
pruefe(
  'Die Kulisse deckt den Rest des Ladens ab',
  KULISSE.reduce((s, g) => s + g.artikel, 0) > 1300,
);

console.log(
  `\n${SORTIMENT.length} Artikel in ${KATEGORIE}, ${KULISSE.reduce((s, g) => s + g.artikel, 0)} in der Kulisse.` +
    ` Vorgabe ${(SCHOKOLADE_UND_PRALINEN.mindestRohertrag * 100).toFixed(0)} %.`,
);

if (fehler > 0) process.exitCode = 1;
