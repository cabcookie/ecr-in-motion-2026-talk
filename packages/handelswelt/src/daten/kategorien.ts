/**
 * Die Vorgaben der Kategorie.
 *
 * Sie stehen hier und nicht im Systemprompt, weil der Agent sie sonst nur
 * *weiß*, statt sie nachzuschlagen — und was er nur weiß, kann er nicht
 * belegen.
 */

import { type Abstand, alsStand, anker, verschiebe } from '../zeit/anker';

export interface Kategorievorgabe {
  readonly kategorie: string;
  /** Mindest-Rohertrag als Anteil, nicht als Prozentzahl. 0,30 sind 30 %. */
  readonly mindestRohertrag: number;
  /**
   * Schokolade und Zuckerwaren laufen im deutschen Handel mit dem ermäßigten
   * Satz. Das ist der Grund, warum die Marge auf dem Netto-VK gerechnet wird
   * und nicht auf dem Preisschild.
   */
  readonly mehrwertsteuer: number;
  /** Vorlauf für Aktionsflächen. */
  readonly vorlaufWochen: number;
  /** Abstand des Datenstands zum Ankerdatum — nie ein festes Datum. */
  readonly standAbstand: Abstand;
}

export const SCHOKOLADE_UND_PRALINEN: Kategorievorgabe = {
  kategorie: 'Schokolade & Pralinen',
  mindestRohertrag: 0.3,
  mehrwertsteuer: 0.07,
  vorlaufWochen: 4,
  standAbstand: { tage: -4 },
};

/** Der Datenstand der Warenwirtschaft, lesbar — „12.09." */
export function standDerKategorie(): string {
  return alsStand(verschiebe(anker(), SCHOKOLADE_UND_PRALINEN.standAbstand));
}
