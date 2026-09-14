/**
 * Erzeugt `src/daten/sortiment.ts` und `src/daten/kulisse.ts` aus der Vorlage.
 *
 * Warum ein Erzeuger und keine Handarbeit: Es sind 1.494 Artikel, und die
 * Kennzahlen müssen zueinander passen — die Kategorieentwicklung auf der Folie
 * (+3,2 %) ist der mengengewichtete Schnitt der Artikel darunter. Von Hand
 * gepflegt wäre das nach der ersten Änderung nicht mehr wahr.
 *
 * Aufruf: `pnpm --filter @ecr-talk/handelswelt run erzeuge`
 */
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ARTIKEL, MARKEN, NICHT_ERLAUBT } from './decknamen';

const hier = fileURLToPath(new URL('.', import.meta.url));
const VORLAGE = join(
  hier, '..', '..', 'docs', 'demo', 'product-catalog', 'script', 'Store_Assortment.json',
);
const ZIEL = join(hier, '..', 'src', 'daten');

/** Die Kategorie, für die Lisa verantwortlich ist. */
const KATEGORIE = 'Schokolade & Pralinen';

/** Warengruppen der Vorlage, aus denen Lisas Kategorie gespeist wird. */
const QUELLGRUPPEN = new Set(['Süßwaren', 'Süss & Salzig']);

/**
 * Marken, die zwar in denselben Warengruppen liegen, aber Zuckerwaren führen —
 * Fruchtgummi und Bonbons. Die gehören nicht Lisa, und dass der Agent das sagen
 * kann, ist der Fall `nicht_zustaendig` im Prüfstand.
 */
const ZUCKERWAREN = new Set([
  'Haribo', 'HARIBO', 'Maoam', 'Nimm2', 'Trolli', 'Sweet Land',
  "Werther's Original", 'Hustin', 'immerfrisch', 'Riesen',
]);

interface Vorlageartikel {
  readonly name: string;
  readonly brand: string;
  readonly category: string;
  readonly size: string;
  readonly unit: string;
}

type Zone = 'tafel' | 'riegel' | 'pralinen';

interface Artikel {
  nummer: string;
  marke: string;
  bezeichnung: string;
  gramm: number;
  zone: Zone;
  eigenmarke: boolean;
  facings: number;
  absatzJahr: number;
  entwicklung: number;
  ekPreis: number;
  vkPreis: number;
}

/* ------------------------------------------------------------------ Zufall */

/** FNV-1a. Gleicher Name, gleiche Zahlen — bei jedem Lauf, auf jedem Rechner. */
function streu(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h;
}

/** Ein Wert aus [von, bis), abgeleitet aus Name und Merkmal. */
function zwischen(name: string, merkmal: string, von: number, bis: number): number {
  return von + ((streu(`${name}#${merkmal}`) % 10000) / 10000) * (bis - von);
}

/* ------------------------------------------------------------- Umbenennung */

function deckmarke(marke: string): string {
  return MARKEN[marke] ?? marke;
}

function deckbezeichnung(name: string, marke: string): string {
  if (ARTIKEL[name]) return ARTIKEL[name];
  /*
    Viele Namen tragen die Marke vorne mit („Milka Choco Wafer"). Die fällt weg;
    was übrig bleibt, beschreibt die Ware und darf bleiben.
  */
  const ohne = name.replace(new RegExp(`^${marke}\\s+`, 'i'), '').trim();
  return ohne.length > 0 ? ohne : name;
}

/* ------------------------------------------------------------------- Regal */

const ZONENREGELN: readonly (readonly [RegExp, Zone])[] = [
  [/pralin|trüffel|selection|tondo|délice|küsse|karamellknopf|täfelchen/i, 'pralinen'],
  [/riegel|doppio|duetto|waffel|nusstafel|knusper|carte|korn|mix|fun|buntlinsen|eier|häppchen|stäbchen|bons|jumbo|crossies|schoklis/i, 'riegel'],
];

function zoneVon(bezeichnung: string): Zone {
  for (const [muster, zone] of ZONENREGELN) if (muster.test(bezeichnung)) return zone;
  return 'tafel';
}

/* -------------------------------------------------------------- Kennzahlen */

/** Preis für 100 g, brutto. Der Preis großer Packungen wächst langsamer. */
const PREISBAND: Readonly<Record<Zone, readonly [number, number]>> = {
  tafel: [1.05, 1.65],
  riegel: [1.15, 1.75],
  pralinen: [1.5, 2.4],
};

/**
 * Eigenmarken sind nicht gleich Eigenmarken: Chocorée ist der Einstieg,
 * Berghoff die Premiumlinie. Eine 125-g-Tafel Berghoff kostet mehr als eine
 * 300-g-Tafel Chocorée, und genau das macht die Auslistungsfrage interessant.
 */
const PREISLAGE: Readonly<Record<string, number>> = {
  'Chocorée': 0.62,
  'Berghoff': 0.85,
};

/** Auf ,x9 runden — so stehen Preise im Regal, und der Saal erkennt es. */
function aufNeun(wert: number): number {
  return Math.max(0.79, Math.round(wert * 10) / 10 - 0.01);
}

function kennzahlen(a: Omit<Artikel, 'facings' | 'absatzJahr' | 'entwicklung' | 'ekPreis' | 'vkPreis'>): Artikel {
  const schluessel = `${a.marke} ${a.bezeichnung}`;
  const [von, bis] = PREISBAND[a.zone];

  /*
    Preisdegression: Der Preis wächst mit ^0,8 statt linear. Ohne das kostet
    eine 500-g-Packung das Vierfache einer 125-g-Packung, und im Regal tut sie
    das nie — große Packungen sind je 100 g günstiger.
  */
  const vkPreis = aufNeun(
    zwischen(schluessel, 'preis', von, bis) *
      (a.gramm / 100) ** 0.8 *
      (PREISLAGE[a.marke] ?? 1),
  );

  /*
    Eigenmarken tragen mehr Rohertrag als Herstellermarken — das ist der Grund,
    warum eine Auslistung zugunsten eines Herstellerartikels nicht umsonst ist.
  */
  const marge = a.eigenmarke
    ? zwischen(schluessel, 'marge', 0.34, 0.44)
    : zwischen(schluessel, 'marge', 0.24, 0.34);
  const vkNetto = vkPreis / 1.07;

  return {
    ...a,
    facings: Math.round(zwischen(schluessel, 'facings', a.eigenmarke ? 2 : 1, a.eigenmarke ? 5 : 4)),
    absatzJahr: Math.round(
      zwischen(schluessel, 'absatz', a.eigenmarke ? 40_000 : 15_000, a.eigenmarke ? 180_000 : 90_000) / 100,
    ) * 100,
    /*
      Der Boden liegt bei -11 und nicht tiefer: Nocturne Mini steht mit -12 %
      auf der Folie als schwächster Artikel der Kategorie. Läge ein anderer
      darunter, wäre die Folie falsch.
    */
    entwicklung: Math.round(zwischen(schluessel, 'trend', -11, 18) * 10) / 10,
    ekPreis: Math.round(vkNetto * (1 - marge) * 100) / 100,
    vkPreis,
  };
}

/* ------------------------------------------------------------------ Lesen */

const vorlage = JSON.parse(await readFile(VORLAGE, 'utf8')) as { products: Vorlageartikel[] };

const lisas: Artikel[] = [];
const gesehen = new Set<string>();
const kulisse = new Map<string, number>();

for (const p of vorlage.products) {
  const gehoertLisa = QUELLGRUPPEN.has(p.category) && !ZUCKERWAREN.has(p.brand);

  if (gehoertLisa) {
    const marke = deckmarke(p.brand);
    const bezeichnung = deckbezeichnung(p.name, p.brand);
    const gramm = p.unit === 'g' ? Number(p.size) : 0;
    /*
      Die Vorlage führt denselben Artikel mehrfach, wenn er auf mehreren Fotos
      liegt oder unter Haus- und Produktmarke erfasst wurde (Knoppers steht
      unter `Storck` UND unter `Knoppers`). Der Artikelstamm kennt ihn einmal.
    */
    if (gesehen.has(`${marke}|${bezeichnung}`)) continue;
    gesehen.add(`${marke}|${bezeichnung}`);
    lisas.push(
      kennzahlen({
        nummer: `NK-${(streu(`${marke} ${bezeichnung}`) % 900000 + 100000).toString()}`,
        marke,
        bezeichnung,
        gramm: Number.isFinite(gramm) && gramm > 0 ? gramm : 150,
        zone: zoneVon(bezeichnung),
        eigenmarke: marke === 'Chocorée' || marke === 'Berghoff',
      }),
    );
  } else {
    /*
      Die Kulisse trägt WEDER Marken NOCH Artikelnamen — nur die Warengruppe und
      wie viele Artikel darin liegen.

      Das ist nicht Vorsicht, sondern der richtige Schnitt: Dass Kartoffelchips
      Knabberartikel sind, weiß das Modell von sich aus. Was es nicht wissen
      kann, ist, welche Warengruppen es bei Nordkorb überhaupt gibt und welche
      davon Lisa gehört. Genau das steht hier.

      Nebenbei verschwindet damit eine ganze Klasse von Risiko: Von den 316
      Marken im Katalog sind die meisten Eigenmarken, und die sind selbst
      geschützte Namen — „Goldbären" ebenso wie „Choceur".
    */
    const gruppe = p.category.trim();
    kulisse.set(gruppe, (kulisse.get(gruppe) ?? 0) + 1);
  }
}

/* ---------------------------------------------- Der Artikel aus dem Szenario */

/*
  Nocturne Mini steht auf den Folien, aber nicht in der Vorlage — er ist
  erfunden. Er ist eine Premium-Eigenmarke, und das ist Absicht: Wer ihn
  auslistet, opfert den eigenen Rohertrag für einen Herstellerartikel. Das
  macht die Entscheidung teurer als „schwacher Artikel raus" und gibt dem
  Agenten etwas zu erkennen.

  Er liegt in derselben Zone wie Hallbach Crispy Bites — sonst stimmt der Satz
  auf der Folie nicht, dass der Platz nur über ihn frei wird.
*/
const nocturne: Artikel = {
  nummer: 'NK-204771',
  marke: 'Berghoff',
  bezeichnung: 'Nocturne Mini',
  gramm: 160,
  zone: 'riegel',
  eigenmarke: true,
  facings: 2,
  absatzJahr: 41_200,
  entwicklung: -12,
  ekPreis: 1.44,
  vkPreis: 2.49,
};
lisas.push(nocturne);

/* -------------------------------------------------- Auf die Folie einnorden */

/*
  Abschnitt 5 sagt: die Kategorie wächst um 3,2 %. Wenn der Agent das gleich
  ausrechnet, statt es zu behaupten, muss es aus den Artikeln darunter
  herauskommen. Also werden die Entwicklungen so verschoben, dass der
  mengengewichtete Schnitt genau dort landet — Nocturne Mini bleibt bei -12 %,
  der steht ebenfalls auf der Folie.
*/
const ZIEL_ENTWICKLUNG = 3.2;
const beweglich = lisas.filter((a) => a !== nocturne);

function gewichteterSchnitt(artikel: readonly Artikel[]): number {
  const menge = artikel.reduce((s, a) => s + a.absatzJahr, 0);
  return artikel.reduce((s, a) => s + a.entwicklung * a.absatzJahr, 0) / menge;
}

const mengeBeweglich = beweglich.reduce((s, a) => s + a.absatzJahr, 0);
const mengeGesamt = mengeBeweglich + nocturne.absatzJahr;
const sollBeweglich =
  (ZIEL_ENTWICKLUNG * mengeGesamt - nocturne.entwicklung * nocturne.absatzJahr) / mengeBeweglich;
const verschiebung = sollBeweglich - gewichteterSchnitt(beweglich);
for (const a of beweglich)
  a.entwicklung = Math.max(-11.5, Math.round((a.entwicklung + verschiebung) * 10) / 10);

/*
  Das Runden auf eine Nachkommastelle verschiebt den Schnitt minimal. Der Rest
  geht auf den mengenstärksten Artikel — der verträgt ihn, ohne aufzufallen.
*/
const staerkster = beweglich.reduce((a, b) => (a.absatzJahr > b.absatzJahr ? a : b));
staerkster.entwicklung =
  Math.round(
    (staerkster.entwicklung +
      ((ZIEL_ENTWICKLUNG - gewichteterSchnitt(lisas)) * mengeGesamt) / staerkster.absatzJahr) * 10,
  ) / 10;

lisas.sort((a, b) => a.marke.localeCompare(b.marke) || a.bezeichnung.localeCompare(b.bezeichnung));

/* ------------------------------------------------------------- Schreiben */

const kopf = `/*
 * ERZEUGT — nicht von Hand ändern.
 *
 * Quelle: packages/docs/demo/product-catalog/script/Store_Assortment.json
 * Erzeuger: packages/handelswelt/erzeugung/erzeuge.ts
 * Zuordnung echter Marken auf Decknamen: erzeugung/decknamen.ts
 *
 * Warengruppen, Größen und Preislagen stammen aus 92 Regalfotos und sind echt.
 * Die Namen sind es nicht — siehe die Notiz \`demo-daten-keine-echten-marken\`.
 */\n\n`;

await writeFile(
  join(ZIEL, 'sortiment.ts'),
  kopf +
    `export type Regalzone = 'tafel' | 'riegel' | 'pralinen';\n\n` +
    `export interface Artikel {\n` +
    `  /** Artikelnummer, wie sie in der Warenwirtschaft steht. */\n` +
    `  readonly nummer: string;\n` +
    `  readonly marke: string;\n` +
    `  readonly bezeichnung: string;\n` +
    `  readonly gramm: number;\n` +
    `  readonly zone: Regalzone;\n` +
    `  /** Eigenmarke der Kette — trägt mehr Rohertrag als eine Herstellermarke. */\n` +
    `  readonly eigenmarke: boolean;\n` +
    `  readonly facings: number;\n` +
    `  /** Absatz der letzten zwölf Monate, ganze Kette, in Stück. */\n` +
    `  readonly absatzJahr: number;\n` +
    `  /** Entwicklung gegenüber dem Vorjahr in Prozent. */\n` +
    `  readonly entwicklung: number;\n` +
    `  readonly ekPreis: number;\n` +
    `  readonly vkPreis: number;\n` +
    `}\n\n` +
    `/** Die Kategorie, für die Lisa verantwortlich ist. */\n` +
    `export const KATEGORIE = ${JSON.stringify(KATEGORIE)};\n\n` +
    `export const SORTIMENT: readonly Artikel[] = ${JSON.stringify(lisas, null, 2)};\n`,
  'utf8',
);

const gruppen = [...kulisse.entries()]
  .map(([gruppe, artikel]) => ({ gruppe, artikel }))
  .sort((a, b) => a.gruppe.localeCompare(b.gruppe));

await writeFile(
  join(ZIEL, 'kulisse.ts'),
  kopf +
    `/*\n` +
    ` * Alles, was NICHT Lisas Kategorie ist.\n` +
    ` *\n` +
    ` * Nur die Warengruppen und ihre Artikelzahl — keine Marken, keine\n` +
    ` * Artikelnamen, keine Kennzahlen. Der Agent soll auf eine Frage außerhalb\n` +
    ` * seiner Kategorie ehrlich antworten können („Kartoffelchips liegen bei\n` +
    ` * Knabberartikel, das ist nicht meine Kategorie"). Dass Chips Knabberartikel\n` +
    ` * sind, weiß er selbst; welche Warengruppen es bei Nordkorb gibt, nicht.\n` +
    ` * Das ist der Grund \`nicht_zustaendig\`.\n` +
    ` */\n\n` +
    `export interface Warengruppe {\n` +
    `  readonly gruppe: string;\n` +
    `  /** Wie viele Artikel Nordkorb in dieser Gruppe führt. */\n` +
    `  readonly artikel: number;\n` +
    `}\n\n` +
    `export const KULISSE: readonly Warengruppe[] = ${JSON.stringify(gruppen, null, 2)};\n`,
  'utf8',
);

const kulissenzahl = gruppen.reduce((s, g) => s + g.artikel, 0);
console.log(`Sortiment: ${lisas.length} Artikel in ${KATEGORIE}`);
console.log(`Kulisse:   ${kulissenzahl} Artikel in ${gruppen.length} Warengruppen`);
console.log(`Entwicklung der Kategorie: ${gewichteterSchnitt(lisas).toFixed(2)} % (Ziel ${ZIEL_ENTWICKLUNG})`);
