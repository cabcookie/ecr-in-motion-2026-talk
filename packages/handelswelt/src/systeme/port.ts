/**
 * Was ein System antwortet.
 *
 * Die eine Regel, an der alles hängt: **Ein Port wirft nicht.** Ein unbekanntes
 * Produkt ist kein Absturz, sondern ein Grund, den der Agent aussprechen kann.
 * Das ist kein Stilfrage — ein Fehler, den die Werkzeugschleife verschluckt,
 * kommt als erfundene Zahl wieder heraus.
 *
 * Und jeder Treffer trägt `quelle` und `stand`. Daher kommt der Unterschied
 * zwischen den beiden Antworten auf der Folie: Der eine Agent kann sagen, woher
 * er die Zahl hat, der andere nicht.
 */

/** Warum ein System nichts liefern konnte. Vier Gründe, mehr braucht es nicht. */
export type Grund =
  /** Das System kennt die Sache nicht — dieses Produkt, diesen Lieferanten. */
  | 'nicht_gefunden'
  /** Außerhalb der Zuständigkeit: eine andere Kategorie, ein fremdes Regal. */
  | 'nicht_zustaendig'
  /** Die Anfrage selbst trägt nicht — es fehlt eine Angabe, um zu antworten. */
  | 'unvollstaendig'
  /** Das System antwortet gerade nicht. */
  | 'nicht_erreichbar';

export interface Treffer<T> {
  readonly ok: true;
  readonly daten: T;
  /** Welches System die Angabe geliefert hat. Geht mit in die Antwortmail. */
  readonly quelle: string;
  /** Wie alt die Angabe ist — ein Datum, kein Gefühl. */
  readonly stand: string;
}

export interface Fehlschlag {
  readonly ok: false;
  readonly grund: Grund;
  /** Was der Agent dem Menschen darüber sagen kann. Ein ganzer Satz. */
  readonly hinweis: string;
}

export type Befund<T> = Treffer<T> | Fehlschlag;

export function treffer<T>(daten: T, quelle: string, stand: string): Treffer<T> {
  return { ok: true, daten, quelle, stand };
}

export function fehlschlag(grund: Grund, hinweis: string): Fehlschlag {
  return { ok: false, grund, hinweis };
}
