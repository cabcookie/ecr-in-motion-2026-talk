/**
 * Die Ziele der Kategorie für das laufende Geschäftsjahr.
 *
 * Bis hierher konnte der Assistent nur prüfen, ob etwas *geht*: Marge über der
 * Vorgabe, Regalplatz vorhanden, Vorlauf gewahrt. Was er nicht konnte, war
 * beurteilen, ob etwas *gewollt* ist — und ein Prüfer ohne Präferenz endet
 * zwangsläufig beim Ja mit Auflagen.
 *
 * Ein Ziel ist die erste Angabe, mit der er etwas Zulässiges trotzdem ablehnen
 * kann. Es ist damit auch die erste, die ihn von einem Rechner unterscheidet.
 *
 * Wie die Kategorievorgaben steht das hier und nicht im Systemprompt: Was der
 * Assistent nur weiß, kann er nicht belegen. Ein Nein ohne Quelle ist auf der
 * anderen Seite des Tisches nichts wert.
 */

import { anker } from '../zeit/anker';

/**
 * Was mit einer Käufergruppe geschehen soll.
 *
 * `nicht_ausbauen` ist kein Tippfehler für „halten". Halten heißt: die Position
 * verteidigen, Anträge werden normal geprüft. Nicht ausbauen heißt: Wir haben
 * dort genug, und zusätzliche Fläche geht zu Lasten der Ziele — das ist der
 * Grund, mit dem ein Nein begründet werden kann.
 */
export type Richtung = 'gewinnen' | 'steigern' | 'halten' | 'nicht_ausbauen';

export interface Ziel {
  /** Kennung der Käufergruppe. */
  readonly gruppe: string;
  readonly richtung: Richtung;
  /** Was der Plan wörtlich vorgibt. */
  readonly vorgabe: string;
  /** Zielanteil an der Fläche der Kategorie, als Anteil. Fehlt, wo keiner gesetzt wurde. */
  readonly zielAnteilFlaeche?: number;
  /** Warum. Ohne diesen Satz ist ein Nein eine Behauptung. */
  readonly begruendung: string;
}

/**
 * Das Geschäftsjahr beginnt am 1. Juni.
 *
 * Als Regel und nicht als Datum, damit die Zahl mitzieht: Am Ankerdatum im
 * September steht der vierte Monat, im folgenden März der zehnte — desselben
 * Geschäftsjahrs. Ein eingetragenes „Monat 4" wäre bei der zweiten Auflage des
 * Vortrags still falsch.
 */
export const BEGINNT_IM_MONAT = 6;

export interface Geschaeftsjahr {
  /** „2026/27" */
  readonly bezeichnung: string;
  readonly beginn: Date;
  readonly ende: Date;
  /** Der wievielte Monat läuft gerade — 1 bis 12. */
  readonly monat: number;
}

export function geschaeftsjahr(bezug: Date = anker()): Geschaeftsjahr {
  const jahr = bezug.getMonth() + 1 >= BEGINNT_IM_MONAT ? bezug.getFullYear() : bezug.getFullYear() - 1;
  const beginn = new Date(jahr, BEGINNT_IM_MONAT - 1, 1);
  const ende = new Date(jahr + 1, BEGINNT_IM_MONAT - 1, 0);
  const monate = (bezug.getFullYear() - jahr) * 12 + (bezug.getMonth() + 1 - BEGINNT_IM_MONAT);
  return {
    bezeichnung: `${jahr}/${String((jahr + 1) % 100).padStart(2, '0')}`,
    beginn,
    ende,
    monat: monate + 1,
  };
}

/**
 * Die Ziele.
 *
 * Bewusst so gelegt, dass nicht alles abgelehnt wird. Zwei Gruppen ziehen an,
 * zwei sind neutral, eine ist zu. Wären die Ziele enger, bekäme der halbe Saal
 * eine Absage — und lernte daraus „der Agent blockt", was schlechter wäre als
 * ein pauschales Ja.
 */
export const ZIELE: readonly Ziel[] = [
  {
    gruppe: 'bewusst',
    richtung: 'gewinnen',
    vorgabe: 'Flächenanteil von 8 % auf 15 % anheben, mindestens vier Neulistungen im Jahr.',
    zielAnteilFlaeche: 0.15,
    begruendung:
      'Die Gruppe wächst im Markt am stärksten, und wir bedienen sie fast nur mit der Eigenmarke. Herstellermarken fehlen uns hier — wer nach vegan oder hohem Kakaoanteil sucht, findet bei uns wenig Auswahl und kauft woanders.',
  },
  {
    gruppe: 'impuls',
    richtung: 'steigern',
    vorgabe: 'Flächenanteil von 26 % auf 30 %, Schwerpunkt Kassenzone und kleine Formate.',
    zielAnteilFlaeche: 0.3,
    begruendung:
      'Der Bon ist klein, die Spanne gut, und der Anlass ist der einzige, der ohne Planung funktioniert. Jede zusätzliche Sichtbarkeit zahlt hier unmittelbar ein.',
  },
  {
    gruppe: 'geschenk',
    richtung: 'halten',
    vorgabe: 'Position halten. Neulistungen nur im Tausch, nicht zusätzlich.',
    begruendung:
      'Wir sind hier gut aufgestellt und verdienen ordentlich. Der Anlass ist aber saisonal und die Fläche im Sommer schwer zu verteidigen — mehr Breite hilft uns nicht.',
  },
  {
    gruppe: 'bevorratung',
    richtung: 'halten',
    vorgabe: 'Position halten. Keine zusätzliche Fläche, Rotation über das Bestandssortiment.',
    begruendung:
      'Die Gruppe trägt ein Fünftel des Absatzes und ist stabil. Sie wächst nicht, verliert aber auch nicht — investieren würden wir hier nur gegen einen konkreten Wettbewerbsnachteil.',
  },
  {
    gruppe: 'preiseinstieg',
    richtung: 'nicht_ausbauen',
    vorgabe: 'Flächenanteil nicht über 22 %. Preiseinstieg bleibt Sache der Eigenmarke.',
    zielAnteilFlaeche: 0.22,
    begruendung:
      'Wir haben den Preiseinstieg mit der Eigenmarke abgedeckt und verdienen dort am besten. Eine Herstellermarke in dieser Preislage nähme der Eigenmarke Absatz weg und brächte uns weniger Rohertrag je Facing.',
  },
];

export function zielFuer(gruppe: string): Ziel | undefined {
  return ZIELE.find((z) => z.gruppe === gruppe);
}
