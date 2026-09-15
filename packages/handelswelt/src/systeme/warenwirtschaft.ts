/**
 * Die Warenwirtschaft — Artikelstamm und Abverkauf.
 *
 * Vorher gab dieses Werkzeug bei jeder Frage dieselben vier Zeilen zurück.
 * Jetzt rechnet es: Die Kategorieentwicklung ist der mengengewichtete Schnitt
 * der Artikel, und der schwächste Artikel wird gesucht, nicht genannt.
 */
import { KULISSE } from '../daten/kulisse';
import { standDerKategorie } from '../daten/kategorien';
import { KATEGORIE, SORTIMENT, type Artikel } from '../daten/sortiment';
import { type Befund, fehlschlag, treffer } from './port';

const QUELLE = 'Warenwirtschaft';

export interface Artikelauskunft {
  readonly nummer: string;
  readonly artikel: string;
  readonly zone: string;
  readonly eigenmarke: boolean;
  readonly absatzJahr: number;
  readonly entwicklung: number;
  readonly ekPreis: number;
  readonly vkPreis: number;
}

export interface Kategorieauskunft {
  readonly kategorie: string;
  readonly artikelzahl: number;
  readonly absatzJahr: number;
  readonly entwicklung: number;
  readonly schwaechster: Artikelauskunft;
  readonly staerkster: Artikelauskunft;
}

function auskunft(a: Artikel): Artikelauskunft {
  return {
    nummer: a.nummer,
    artikel: `${a.marke} ${a.bezeichnung}`,
    zone: a.zone,
    eigenmarke: a.eigenmarke,
    absatzJahr: a.absatzJahr,
    entwicklung: a.entwicklung,
    ekPreis: a.ekPreis,
    vkPreis: a.vkPreis,
  };
}

/** Wie sich die Kategorie in den letzten zwölf Monaten entwickelt hat. */
export function kategorie(): Befund<Kategorieauskunft> {
  const menge = SORTIMENT.reduce((s, a) => s + a.absatzJahr, 0);
  const entwicklung = SORTIMENT.reduce((s, a) => s + a.entwicklung * a.absatzJahr, 0) / menge;
  const sortiert = [...SORTIMENT].sort((a, b) => a.entwicklung - b.entwicklung);

  return treffer(
    {
      kategorie: KATEGORIE,
      artikelzahl: SORTIMENT.length,
      absatzJahr: menge,
      entwicklung: Math.round(entwicklung * 10) / 10,
      schwaechster: auskunft(sortiert[0]),
      staerkster: auskunft(sortiert[sortiert.length - 1]),
    },
    QUELLE,
    standDerKategorie(),
  );
}

/**
 * Ein einzelner Artikel.
 *
 * Drei Ausgänge, und der dritte ist der, auf den es ankommt: Wer nach
 * Kartoffelchips fragt, bekommt nicht „nicht gefunden", sondern „nicht meine
 * Kategorie" — samt der Warengruppen, die es bei Nordkorb sonst noch gibt.
 * Der Unterschied ist für den Agenten der zwischen „das Produkt kennt niemand"
 * und „dafür ist jemand anderes zuständig".
 */
export function artikel(suche: string): Befund<Artikelauskunft> {
  const begriff = suche.trim().toLowerCase();
  if (begriff.length < 2) {
    return fehlschlag('unvollstaendig', 'Für die Suche brauche ich mindestens zwei Zeichen.');
  }

  const treffer_ = SORTIMENT.filter((a) =>
    `${a.marke} ${a.bezeichnung}`.toLowerCase().includes(begriff),
  );
  if (treffer_.length > 0) {
    /* Bei mehreren Treffern der mengenstärkste — das ist der, den man meint. */
    const gemeint = treffer_.reduce((a, b) => (a.absatzJahr > b.absatzJahr ? a : b));
    return treffer(auskunft(gemeint), QUELLE, standDerKategorie());
  }

  return fehlschlag(
    'nicht_zustaendig',
    `„${suche.trim()}" liegt nicht in ${KATEGORIE}. Nordkorb führt ${KULISSE.length} weitere ` +
      `Warengruppen; für die ist eine andere Kategorie zuständig. Ein Artikel, den es gar nicht ` +
      `gibt, sähe hier genauso aus — mehr kann die Warenwirtschaft dieser Kategorie nicht sagen.`,
  );
}
