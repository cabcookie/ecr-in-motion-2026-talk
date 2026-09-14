/**
 * Wann die Welt spielt.
 *
 * Alle Termine der Handelswelt stehen als Abstand zu einem Ankerdatum, nicht
 * als festes Datum. Sonst altert die Demo zwischen Probe und Auftritt: Eine
 * Aktionsfläche, die im September in der Zukunft lag, liegt im Oktober in der
 * Vergangenheit, und der Agent rechnet mit einem Termin, der vorbei ist.
 *
 * Der Abstand zählt in Wochen und Tagen, nicht in Millisekunden. Der Handel
 * läuft auf Kalenderwochen und Wochentagen — Aktionswochen beginnen an festen
 * Tagen, Abverkauf wird je Woche gelesen. Ein reiner Millisekunden-Abstand
 * verschiebt den Wochentag, sobald einmal sonntags geprobt und mittwochs
 * aufgetreten wird, und dann liegt die Aktionsfläche an einem Dienstag.
 *
 * Vorerst ist der Anker schlicht „jetzt". Das Steuerpult wird ihn setzen
 * („Start jetzt" / „18:00"), und dann kommt er aus dem KVStore — solange dort
 * nichts steht, gilt weiter „jetzt". Das ist kein Übergangszustand, sondern
 * der Rückfall, den es dauerhaft braucht: Beim Testen und bei jeder Mail vor
 * Vortragsbeginn hat niemand gedrückt.
 */

export type Wochentag = 'Mo' | 'Di' | 'Mi' | 'Do' | 'Fr' | 'Sa' | 'So';

const WOCHENTAGE: readonly Wochentag[] = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

export interface Abstand {
  readonly wochen?: number;
  readonly tage?: number;
  /** Wenn gesetzt, rastet das Ergebnis auf den nächsten solchen Wochentag ein. */
  readonly wochentag?: Wochentag;
}

/** Überschreibbar für Tests und später für das Steuerpult. */
let gesetzterAnker: Date | undefined;

export function setzeAnker(datum: Date | undefined): void {
  gesetzterAnker = datum;
}

export function anker(): Date {
  return gesetzterAnker ?? new Date();
}

/** Verschiebt ein Datum um einen Abstand und rastet notfalls auf den Wochentag ein. */
export function verschiebe(von: Date, abstand: Abstand): Date {
  const ziel = new Date(von.getTime());
  ziel.setDate(ziel.getDate() + (abstand.wochen ?? 0) * 7 + (abstand.tage ?? 0));
  if (abstand.wochentag) {
    const soll = WOCHENTAGE.indexOf(abstand.wochentag);
    /*
      Vorwärts einrasten, nie zurück: Ein Termin, der wegen des Wochentags in
      die Vergangenheit rutscht, wäre schlimmer als einer, der ein paar Tage
      später liegt.
    */
    ziel.setDate(ziel.getDate() + ((soll - ziel.getDay() + 7) % 7));
  }
  return ziel;
}

/** Ganze Tage zwischen zwei Daten, kalendarisch gezählt statt in Millisekunden. */
export function tageZwischen(von: Date, bis: Date): number {
  const a = Date.UTC(von.getFullYear(), von.getMonth(), von.getDate());
  const b = Date.UTC(bis.getFullYear(), bis.getMonth(), bis.getDate());
  return Math.round((b - a) / 86_400_000);
}

const MONATE = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
];

/** „22. Oktober 2026" — so, wie es in einer Mail stehen soll. */
export function alsText(datum: Date): string {
  return `${datum.getDate()}. ${MONATE[datum.getMonth()]} ${datum.getFullYear()}`;
}

/** Kurzform ohne Jahr, für Datenstände: „12.09." */
export function alsStand(datum: Date): string {
  return `${String(datum.getDate()).padStart(2, '0')}.${String(datum.getMonth() + 1).padStart(2, '0')}.`;
}

/**
 * Liest einen Termin, wie ein Mensch ihn in eine Mail schreibt.
 *
 * „15. Oktober", „15.10.", „2026-10-15". Ohne Jahr wird das nächste
 * passende genommen — wer im September „15. Oktober" schreibt, meint diesen
 * Oktober, wer im Dezember „15. Januar" schreibt, meint den nächsten.
 */
export function lies(text: string, bezug: Date = anker()): Date | undefined {
  const sauber = text.trim();

  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(sauber);
  if (iso) return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));

  const punkt = /^(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})?$/.exec(sauber);
  if (punkt) {
    return imNaechstenPassendenJahr(Number(punkt[1]), Number(punkt[2]) - 1, punkt[3], bezug);
  }

  const wort = /^(\d{1,2})\.?\s+([A-Za-zÄÖÜäöü]+)\s*(\d{4})?$/.exec(sauber);
  if (wort) {
    const monat = MONATE.findIndex((m) => m.toLowerCase().startsWith(wort[2].toLowerCase().slice(0, 3)));
    if (monat >= 0) return imNaechstenPassendenJahr(Number(wort[1]), monat, wort[3], bezug);
  }

  return undefined;
}

function imNaechstenPassendenJahr(
  tag: number,
  monat: number,
  jahr: string | undefined,
  bezug: Date,
): Date | undefined {
  if (jahr) return gueltig(Number(jahr), monat, tag);
  const diesesJahr = gueltig(bezug.getFullYear(), monat, tag);
  if (!diesesJahr) return undefined;
  /*
    Mehr als ein halbes Jahr in der Vergangenheit heißt: gemeint war das
    nächste Jahr. Ein Termin, der wenige Tage zurückliegt, bleibt dagegen in
    der Vergangenheit — das ist dann eine verspätete Anfrage, und der Agent
    soll das sagen dürfen.
  */
  return tageZwischen(bezug, diesesJahr) < -182
    ? gueltig(bezug.getFullYear() + 1, monat, tag)
    : diesesJahr;
}

function gueltig(jahr: number, monat: number, tag: number): Date | undefined {
  const datum = new Date(jahr, monat, tag);
  return datum.getMonth() === monat && datum.getDate() === tag ? datum : undefined;
}
