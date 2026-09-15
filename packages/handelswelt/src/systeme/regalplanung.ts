/**
 * Die Regalplanung.
 *
 * Die Frage ist nie „gibt es Platz", sondern „wer weicht". Der Port antwortet
 * deshalb nicht mit ja oder nein, sondern mit der Belegung und den Artikeln,
 * die als Erste zur Disposition stünden — geordnet nach Schwäche, nicht nach
 * Bequemlichkeit.
 *
 * Was er NICHT tut, ist entscheiden. Dass eine Auslistung den eigenen
 * Rohertrag kostet, steht in den Zahlen; den Schluss daraus zieht der Agent.
 */
import { SCHOKOLADE_UND_PRALINEN, standDerKategorie } from '../daten/kategorien';
import { SORTIMENT, type Regalzone } from '../daten/sortiment';
import { type Befund, fehlschlag, treffer } from './port';

const QUELLE = 'Regalplanung, Planogramm';

/**
 * Wie viele Facings die Zone hergibt.
 *
 * Der Systemprompt sagt „Regalplatz ist knapp, eine Neulistung setzt in der
 * Regel eine Auslistung voraus". Das muss aus den DATEN folgen, nicht nur aus
 * dem Prompt — sonst behauptet der Agent eine Knappheit, die das System nicht
 * kennt.
 *
 * Also: Die Riegelzone ist exakt voll. Dort liegt der Artikel aus dem Szenario,
 * und dort ist die Auslistungsfrage echt. Tafel und Pralinen haben etwas Luft,
 * damit „knapp" nicht „überall unmöglich" heißt — ein Regal, in dem gar nichts
 * geht, stellt auch keine Frage mehr.
 */
const KAPAZITAET: Readonly<Record<Regalzone, number>> = {
  tafel: 148,
  riegel: 75,
  pralinen: 31,
};

export interface Weichkandidat {
  readonly nummer: string;
  readonly artikel: string;
  readonly facings: number;
  readonly absatzJahr: number;
  readonly entwicklung: number;
  readonly eigenmarke: boolean;
  /** Rohertrag in Prozent — was eine Auslistung kostet. */
  readonly rohertrag: number;
}

export interface Zonenauskunft {
  readonly zone: Regalzone;
  readonly kapazitaet: number;
  readonly belegt: number;
  readonly frei: number;
  readonly artikel: number;
  /** Die schwächsten Artikel der Zone, schwächster zuerst. */
  readonly weichkandidaten: readonly Weichkandidat[];
}

function rohertragProzent(ekPreis: number, vkPreis: number): number {
  const netto = vkPreis / (1 + SCHOKOLADE_UND_PRALINEN.mehrwertsteuer);
  return Math.round(((netto - ekPreis) / netto) * 1000) / 10;
}

export function istZone(wert: string): wert is Regalzone {
  return wert === 'tafel' || wert === 'riegel' || wert === 'pralinen';
}

/** Belegung einer Regalzone und wer bei einer Neulistung weichen müsste. */
export function platz(zone: string): Befund<Zonenauskunft> {
  const gesucht = zone.trim().toLowerCase();
  if (!istZone(gesucht)) {
    return fehlschlag(
      'nicht_gefunden',
      `Die Zone „${zone.trim()}" gibt es nicht. Das Planogramm dieser Kategorie kennt drei: ` +
        `tafel, riegel, pralinen.`,
    );
  }

  const inZone = SORTIMENT.filter((a) => a.zone === gesucht);
  const belegt = inZone.reduce((s, a) => s + a.facings, 0);

  return treffer(
    {
      zone: gesucht,
      kapazitaet: KAPAZITAET[gesucht],
      belegt,
      frei: KAPAZITAET[gesucht] - belegt,
      artikel: inZone.length,
      weichkandidaten: [...inZone]
        .sort((a, b) => a.entwicklung - b.entwicklung)
        .slice(0, 3)
        .map((a) => ({
          nummer: a.nummer,
          artikel: `${a.marke} ${a.bezeichnung}`,
          facings: a.facings,
          absatzJahr: a.absatzJahr,
          entwicklung: a.entwicklung,
          eigenmarke: a.eigenmarke,
          rohertrag: rohertragProzent(a.ekPreis, a.vkPreis),
        })),
    },
    QUELLE,
    standDerKategorie(),
  );
}
