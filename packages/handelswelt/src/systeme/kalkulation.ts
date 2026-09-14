/**
 * Die Kalkulation — der erste Port, der wirklich rechnet.
 *
 * Vorher gab das Werkzeug bei jedem Preis „34,2 %, Vorgabe erfüllt" zurück. In
 * Abschnitt 6 werden die Teilnehmer ausdrücklich aufgefordert, den Mailtext zu
 * ändern; wer dabei eigene Preise nennt, bekam eine überzeugende falsche Zahl
 * auf die Leinwand. Genau die Halluzination, die Abschnitt 15 vorführen will,
 * nur im falschen Agenten.
 */
import { SCHOKOLADE_UND_PRALINEN, type Kategorievorgabe } from '../daten/kategorien';
import { type Befund, fehlschlag, treffer } from './port';

export interface Margenbefund {
  readonly ekPreis: number;
  readonly vkPreis: number;
  /** Der Verkaufspreis ohne Mehrwertsteuer — darauf wird gerechnet. */
  readonly vkNetto: number;
  /** Rohertrag als Anteil. 0,3113 sind 31,1 %. */
  readonly rohertrag: number;
  readonly mindestRohertrag: number;
  readonly erfuellt: boolean;
  /** Abstand zur Vorgabe in Prozentpunkten. Negativ heißt: darunter. */
  readonly luftInPunkten: number;
}

/**
 * Rohertrag auf den Netto-VK, gegen die Vorgabe der Kategorie.
 *
 * Beispiel aus dem Szenario: EK 2,89 und VK 4,49 ergeben bei 7 % einen
 * Netto-VK von 4,196 und damit 31,1 % — erfüllt, aber mit gut einem Punkt
 * Luft. Das ist eine Entscheidung; „34,2 %" war eine Fußnote.
 */
export function marge(
  ekPreis: number,
  vkPreis: number,
  vorgabe: Kategorievorgabe = SCHOKOLADE_UND_PRALINEN,
): Befund<Margenbefund> {
  if (!istPreis(ekPreis) || !istPreis(vkPreis)) {
    return fehlschlag(
      'unvollstaendig',
      'Für die Marge brauche ich einen Einkaufs- und einen Verkaufspreis, beide größer als null.',
    );
  }

  const vkNetto = vkPreis / (1 + vorgabe.mehrwertsteuer);

  /*
    Ein EK über dem Netto-VK ist kein Fehler, sondern ein Angebot, das sich
    nicht rechnet. Der Agent soll das sagen dürfen, statt eine Zahl zu
    bekommen, die nach Erfolg aussieht.
  */
  const rohertrag = (vkNetto - ekPreis) / vkNetto;

  return treffer(
    {
      ekPreis,
      vkPreis,
      vkNetto: runde(vkNetto, 4),
      rohertrag: runde(rohertrag, 4),
      mindestRohertrag: vorgabe.mindestRohertrag,
      erfuellt: rohertrag >= vorgabe.mindestRohertrag,
      luftInPunkten: runde((rohertrag - vorgabe.mindestRohertrag) * 100, 2),
    },
    `Kalkulation ${vorgabe.kategorie}`,
    vorgabe.stand,
  );
}

function istPreis(wert: number): boolean {
  return Number.isFinite(wert) && wert > 0;
}

function runde(wert: number, stellen: number): number {
  const faktor = 10 ** stellen;
  return Math.round(wert * faktor) / faktor;
}
