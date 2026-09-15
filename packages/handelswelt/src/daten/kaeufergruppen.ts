/**
 * Käufergruppen — wer das kauft und warum.
 *
 * Die dritte Art, dieselbe Kategorie zu schneiden, und sie schneidet quer zu
 * den beiden anderen. Das Regal ordnet nach Platzbedarf (Tafel, Riegel,
 * Pralinen). Das Panel ordnet nach Rezeptur (Crispy, Zartbitter, Frei-von).
 * Eine Käufergruppe ordnet nach **Anlass**: Wofür wird das gekauft?
 *
 * Genau deshalb ist sie der interessantere Schnitt für eine Entscheidung. Ob
 * ein Artikel im Regal passt, sagt das Planogramm. Ob wir ihn *wollen*, sagt
 * erst die Frage, welchen Anlass er bedient und ob wir diesen Anlass ausbauen.
 *
 * Wie beim Panel gilt: Reihenfolge ist Rangfolge, der erste Treffer gewinnt.
 * Eine vegane Tafel mit 300 g ist „Bewusst" und nicht „Bevorratung" — die
 * Haltung schlägt die Packungsgröße.
 */

import type { Artikel } from './sortiment';

export interface Kaeufergruppe {
  readonly kennung: string;
  readonly name: string;
  /** Der Anlass in einem Satz — so würde ihn ein Category Manager beschreiben. */
  readonly anlass: string;
  /** Warum der Kunde greift. Das, was auf keiner Packung steht. */
  readonly warum: string;
  /** Woran wir einen Artikel dieser Gruppe erkennen. */
  readonly trifft: (a: Artikel) => boolean;
}

/** Preis je 100 g — die Vergleichsgröße, die Packungsgrößen unvergleichbar macht. */
export function preisJe100g(a: Artikel): number {
  return (a.vkPreis / a.gramm) * 100;
}

export const KAEUFERGRUPPEN: readonly Kaeufergruppe[] = [
  {
    kennung: 'bewusst',
    name: 'Bewusst',
    anlass: 'Sucht gezielt nach vegan, frei-von oder hohem Kakaoanteil.',
    warum:
      'Will nicht verzichten, sondern anders wählen. Liest die Zutatenliste, vergleicht Kakaoanteile und zahlt dafür mehr — kauft aber seltener und kleinere Mengen.',
    trifft: (a) =>
      /vegan|frei.?von|laktosefrei|ohne zucker|zuckerreduziert/i.test(a.bezeichnung) ||
      /bitter\s*(7[0-9]|8[0-9]|9[0-9])\s*%/i.test(a.bezeichnung),
  },
  {
    kennung: 'geschenk',
    name: 'Genuss & Geschenk',
    anlass: 'Mitbringsel, Gastgeschenk, der Abend zu zweit.',
    warum:
      'Kauft für andere oder für einen Anlass. Die Packung muss etwas hermachen; der Preis ist zweitrangig, die Peinlichkeit eines billig wirkenden Mitbringsels nicht.',
    trifft: (a) =>
      a.zone === 'pralinen' ||
      /selection|trüffel|pralin|délice|edel/i.test(a.bezeichnung) ||
      preisJe100g(a) >= 1.5,
  },
  {
    kennung: 'impuls',
    name: 'Impuls & unterwegs',
    anlass: 'Griff im Vorbeigehen, verzehrt noch am selben Tag.',
    warum:
      'Kauft nicht geplant, sondern weil es da ist. Kleine Formate, die in die Jackentasche passen — was zu Hause liegen bliebe, wird hier sofort gegessen.',
    trifft: (a) => a.gramm <= 160,
  },
  {
    kennung: 'preiseinstieg',
    name: 'Preiseinstieg',
    anlass: 'Der günstigste Weg zu Schokolade im Haus.',
    warum:
      'Rechnet in Cent je 100 Gramm. Nimmt die Eigenmarke, weil sie reicht — und wechselt sofort, wenn woanders billiger.',
    trifft: (a) => a.eigenmarke && preisJe100g(a) <= 0.8,
  },
  {
    kennung: 'bevorratung',
    name: 'Familienbevorratung',
    anlass: 'Der Vorrat für die Woche, für mehrere Personen.',
    warum:
      'Kauft Menge, nicht Erlebnis. Große Packungen und Mehrfachriegel, die im Schrank liegen und für Kinder, Büro und Gäste reichen.',
    trifft: (a) => a.gramm >= 180,
  },
];

/**
 * Die Käufergruppe eines Artikels.
 *
 * Nie `undefined`: Jeder Artikel gehört zu einem Anlass, auch wenn keine Regel
 * greift. Ein Artikel ohne Gruppe wäre ein Artikel, über den sich nichts
 * entscheiden lässt — und das gibt es im Regal nicht.
 */
export function gruppeVon(a: Artikel): Kaeufergruppe {
  return KAEUFERGRUPPEN.find((g) => g.trifft(a)) ?? KAEUFERGRUPPEN[KAEUFERGRUPPEN.length - 1];
}

export function gruppeMit(kennung: string): Kaeufergruppe | undefined {
  return KAEUFERGRUPPEN.find((g) => g.kennung === kennung);
}
