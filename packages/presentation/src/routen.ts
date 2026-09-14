/**
 * Welche der drei Ansichten ist gemeint?
 *
 * Die Wurzel gehört den Teilnehmern. Wer die Adresse in die Hand bekommt oder
 * sie einfach ausprobiert, landet dort — und nicht auf der Leinwand oder gar im
 * Steuerpult. Die beiden anderen liegen auf Pfaden, die man nicht errät.
 *
 *   /            Handy der Teilnehmer
 *   /audience    Anzeige im Raum, also der Beamer
 *   /operator    Steuerpult des Vortragenden
 *
 * Das ist kein Schutz im Sinne von Sicherheit — der liegt beim Steuerungs-
 * geheimnis, ohne das niemand eine Folie weiterschalten kann. Es verhindert
 * nur Versehen.
 */
export type Ansicht = "teilnehmer" | "leinwand" | "operator";

const pfad = location.pathname.replace(/\/+$/, "").toLowerCase();

export function ansicht(): Ansicht {
  if (pfad === "/audience") return "leinwand";
  if (pfad === "/operator") return "operator";
  return "teilnehmer";
}

const params = new URLSearchParams(location.search);

/**
 * `?local` zwingt Leinwand und Steuerpult auf den BroadcastChannel.
 *
 * Der Rettungsanker für den Fall, dass am Vortragsabend das Netz ausfällt:
 * Beide Ansichten laufen dann im selben Browser und brauchen kein Backend.
 * Die Teilnehmer sind damit außen vor, aber der Vortrag läuft weiter.
 */
export const LOKAL = params.has("local");

/** Blendet den Tastaturhinweis aus — für Screenshots und den Ernstfall. */
export const CLEAN = params.has("clean");
