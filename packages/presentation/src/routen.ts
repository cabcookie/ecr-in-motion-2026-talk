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
 *   /papier      Druckfassung, aus der das PDF entsteht
 *
 * Das ist kein Schutz im Sinne von Sicherheit — der liegt beim Steuerungs-
 * geheimnis, ohne das niemand eine Folie weiterschalten kann. Es verhindert
 * nur Versehen.
 */
export type Ansicht = "teilnehmer" | "leinwand" | "operator" | "papier";

const pfad = location.pathname.replace(/\/+$/, "").toLowerCase();

/**
 * `/vortrag` fuehrt auf das PDF.
 *
 * Die Adresse, die man jemandem zurufen kann — kein Dateiname mit Jahreszahl
 * und keine Endung. Sie muss hier stehen und nicht in der Auslieferung: Vor
 * dem Eimer sitzt eine CloudFront-Funktion, die JEDEN Pfad ohne Punkt im
 * letzten Segment auf `/index.html` umschreibt. Genau das laesst `/audience`
 * und `/papier` funktionieren, und genau deshalb kaeme eine Datei namens
 * `vortrag` dort nie an — der Pfad ist ersetzt, bevor S3 ihn sieht.
 *
 * Also faengt die Anwendung den Ruf ab und schickt weiter. `replace`, damit
 * der Zurueck-Knopf nicht zwischen Vortrag und PDF hin und her springt.
 *
 * Das Ziel traegt den langen Namen, weil er der Dateiname im Download-Ordner
 * des Zuhoerers wird. `vortrag.pdf` waere dort in einer Woche nicht mehr
 * zuzuordnen.
 */
export const PDF_DATEI = "/ecr-in-motion-2026.pdf";
if (pfad === "/vortrag") location.replace(PDF_DATEI);

export function ansicht(): Ansicht {
  if (pfad === "/audience") return "leinwand";
  if (pfad === "/operator") return "operator";
  /* Die Druckfassung. Nur der Bauprozess ruft sie auf; sie ist nicht verlinkt. */
  if (pfad === "/papier") return "papier";
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

/**
 * `?slide=13.1` steuert eine Folie direkt an.
 *
 * Gemeint ist die Nummer, die im Steuerpult und auf dem Handy steht: Abschnitt
 * und Panel, beide ab 1 gezählt — „13.1" ist das erste Panel von Abschnitt 13.
 * Ohne Panel („?slide=13") ist das erste gemeint.
 *
 * Gebraucht wird das beim Bauen und Prüfen: Sich mit Pfeiltasten zu einer Folie
 * in der Mitte durchzuklicken ist zäh und geht schief, sobald die Zählung sich
 * ändert. Es gilt für alle drei Ansichten — vom Steuerpult aufgerufen nimmt es
 * Leinwand und Handys gleich mit, weil der Stand ohnehin geteilt wird.
 *
 * Absichtlich nur beim Laden. Ein Parameter, der dauernd nachwirkt, würde jeden
 * späteren Folienwechsel zurückdrehen.
 */
export const ZIEL: { abschnitt: number; panel: number } | null = (() => {
  const roh = params.get("slide");
  if (!roh) return null;
  const m = /^(\d{1,3})(?:[.:](\d{1,2}))?$/.exec(roh.trim());
  if (!m) return null;
  return { abschnitt: Number(m[1]), panel: Number(m[2] ?? 1) };
})();
