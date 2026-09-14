/**
 * Die Vorgaben der Kategorie.
 *
 * Sie stehen hier und nicht im Systemprompt, weil der Agent sie sonst nur
 * *weiß*, statt sie nachzuschlagen — und was er nur weiß, kann er nicht
 * belegen.
 */

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
  readonly stand: string;
}

/*
  `stand` ist vorerst ein festes Datum. Sobald das Ankerdatum steht (sx5y),
  kommt es von dort — sonst altert die Angabe zwischen Probe und Auftritt.
*/
export const SCHOKOLADE_UND_PRALINEN: Kategorievorgabe = {
  kategorie: 'Schokolade & Pralinen',
  mindestRohertrag: 0.3,
  mehrwertsteuer: 0.07,
  vorlaufWochen: 4,
  stand: '2026-09-12',
};
