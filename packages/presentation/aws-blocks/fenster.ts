/**
 * Das Vortragsfenster — die Anwendung lebt nur, solange der Vortrag läuft.
 *
 * Außerhalb davon nimmt sie nichts an: keine Antworten, keinen Chat, keine
 * Mail an den Agenten. Grund ist das offene Repository. Wer den Quelltext
 * liest, findet auch die Endpunkte, und `chatSend` stößt ohne Anmeldung bis zu
 * vierzehn Opus-Aufrufe an.
 *
 * Das Fenster beginnt mit einem absoluten Zeitpunkt und dauert zwei Stunden.
 * Absolut, nicht als Uhrzeit: „18:00" allein stünde jeden Abend offen.
 *
 * Hier stehen nur reine Rechnungen. Speicher und Endpunkte liegen in index.ts,
 * damit die Mail-Lambda und die Tests dieselben Regeln lesen können, ohne ein
 * Blocks-Backend zu starten.
 */

/** Wie lange das Fenster nach dem Start offen ist. */
export const FENSTER_DAUER_MS = 2 * 60 * 60 * 1000;

/** Der Vortrag beginnt um 18:00 Uhr in Bonn. */
export const ZEITZONE = 'Europe/Berlin';
export const ABEND_STUNDE = 18;

/**
 * Die Meldung, mit der jeder gesperrte Endpunkt ablehnt.
 *
 * Fest und wiedererkennbar: Das Frontend erkennt daran, dass es die
 * Abschlussseite zeigen soll, statt einen Fehler zu melden.
 */
export const INAKTIV = 'Lisa ist im Moment nicht aktiv.';

export interface Fensterstand {
  readonly aktiv: boolean;
  /** Beginn in Epoch-ms, oder null, wenn nie geöffnet wurde. */
  readonly start: number | null;
  readonly ende: number | null;
}

export function istAktiv(start: number | null | undefined, jetzt: number): boolean {
  if (start === null || start === undefined || !Number.isFinite(start)) return false;
  return start <= jetzt && jetzt < start + FENSTER_DAUER_MS;
}

export function fensterstand(start: number | null | undefined, jetzt: number): Fensterstand {
  const gueltig = start !== null && start !== undefined && Number.isFinite(start);
  return {
    aktiv: istAktiv(start, jetzt),
    start: gueltig ? start : null,
    ende: gueltig ? start + FENSTER_DAUER_MS : null,
  };
}

/**
 * Heute 18:00 Uhr in Bonn, als Epoch-ms.
 *
 * „Heute" ist der Kalendertag in Berlin, nicht in UTC: Die Lambda läuft in
 * UTC, und kurz nach Mitternacht deutscher Zeit wäre dort noch gestern.
 *
 * Der Versatz zu UTC wird am Zieltag selbst bestimmt, damit Sommer- und
 * Winterzeit stimmen. Um 18:00 wechselt die Uhr nie, eine Korrekturrunde
 * reicht also.
 */
export function heuteAbend(jetzt: number): number {
  const teile = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: ZEITZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
      .formatToParts(new Date(jetzt))
      .map((t) => [t.type, t.value]),
  );
  const alsUtc = Date.UTC(Number(teile.year), Number(teile.month) - 1, Number(teile.day), ABEND_STUNDE);
  return alsUtc - versatzMs(alsUtc);
}

/** Wie weit Berlin zu diesem Zeitpunkt vor UTC liegt. */
function versatzMs(zeitpunkt: number): number {
  const teile = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: ZEITZONE,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
      .formatToParts(new Date(zeitpunkt))
      .map((t) => [t.type, t.value]),
  );
  const wandUhr = Date.UTC(
    Number(teile.year),
    Number(teile.month) - 1,
    Number(teile.day),
    Number(teile.hour),
    Number(teile.minute),
    Number(teile.second),
  );
  return wandUhr - zeitpunkt;
}
