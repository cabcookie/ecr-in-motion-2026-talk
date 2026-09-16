/**
 * Das Steuerungsgeheimnis und ob die Steuerung greift.
 *
 * Ohne gültiges Geheimnis lehnt der Server jeden Folienwechsel ab. Vorher stand
 * das nur in der Browserkonsole — die Leinwand blieb stehen, und am Steuerpult
 * war nichts davon zu sehen. Auf der Bühne ist das der schlechteste Fehlerfall:
 * Man klickt weiter und merkt erst am ratlosen Publikum, dass nichts passiert.
 *
 * Deshalb hier: Das Geheimnis liegt an einer Stelle, Ablehnungen werden gemeldet,
 * und das Steuerpult zeigt sie.
 */
const SPEICHER = "deck-token";

function ausSpeicher(): string {
  try {
    return sessionStorage.getItem(SPEICHER) ?? "";
  } catch {
    return "";
  }
}

const ausUrl = new URLSearchParams(location.search).get("token");
if (ausUrl) {
  try {
    sessionStorage.setItem(SPEICHER, ausUrl);
  } catch {
    // Privater Modus — dann gilt es nur für diese Seite
  }
}

let aktuell = ausUrl ?? ausSpeicher();

export function token(): string {
  return aktuell;
}

export function setzeToken(neu: string): void {
  aktuell = neu.trim();
  try {
    sessionStorage.setItem(SPEICHER, aktuell);
  } catch {
    // dann eben nur für diese Seite
  }
  melde(aktuell ? "unbekannt" : "fehlt");
}

/**
 * `offen` heißt: Der Server verlangt gar kein Geheimnis (lokale Entwicklung).
 * `unbekannt` heißt: Wir haben noch nichts gesendet, also wissen wir es nicht.
 */
export type Steuerung = "offen" | "unbekannt" | "greift" | "abgelehnt" | "fehlt";

let stand: Steuerung = aktuell ? "unbekannt" : "fehlt";
const hoerer = new Set<(s: Steuerung) => void>();

export function melde(neu: Steuerung): void {
  if (neu === stand) return;
  stand = neu;
  for (const h of hoerer) h(stand);
}

export function steuerung(): Steuerung {
  return stand;
}

export function aufSteuerung(h: (s: Steuerung) => void): () => void {
  hoerer.add(h);
  h(stand);
  return () => hoerer.delete(h);
}
