/**
 * Der Aktionskalender.
 *
 * Alle Termine stehen als Abstand zum Ankerdatum, nicht als festes Datum —
 * sonst rutscht die freie Fläche zwischen Probe und Auftritt in die
 * Vergangenheit. Das Einrasten auf Donnerstag ist keine Kosmetik: Aktionswochen
 * beginnen an festen Wochentagen, und eine Zweitplatzierung, die an einem
 * Dienstag startet, gibt es nicht.
 *
 * Die erste Fläche ist die aus Abschnitt 5. Ihr Abstand von fünf Wochen ist so
 * gewählt, dass sie die Vorlauffrist von vier Wochen deutlich überschreitet —
 * relativ zur REGEL, nicht als festes Datum. Dann stimmt die Geschichte bei
 * jeder Probe, egal wann gedrückt wird.
 */
import type { Abstand } from '../zeit/anker';

export interface Aktionsflaeche {
  readonly kennung: string;
  /** Abstand zum Ankerdatum. */
  readonly abstand: Abstand;
  readonly maerkte: number;
  readonly region: string;
  readonly art: string;
  /** Warum sie frei ist. Leer, wenn sie belegt ist. */
  readonly grund?: string;
  /** Wer sie belegt. Leer heißt frei. */
  readonly belegtDurch?: string;
}

export const AKTIONSFLAECHEN: readonly Aktionsflaeche[] = [
  {
    kennung: 'hh-zweitplatzierung',
    abstand: { wochen: 5, wochentag: 'Do' },
    maerkte: 12,
    region: 'Raum Hamburg',
    art: 'Zweitplatzierung, Aufsteller',
    grund: 'Eine geplante Aktion wurde abgesagt.',
  },
  {
    kennung: 'bre-aufsteller',
    abstand: { wochen: 2, wochentag: 'Do' },
    maerkte: 6,
    region: 'Raum Bremen',
    art: 'Aufsteller',
    grund: 'Kurzfristig zurückgegeben.',
  },
  {
    kennung: 'bund-kopfregal',
    abstand: { wochen: 9, wochentag: 'Do' },
    maerkte: 40,
    region: 'bundesweit',
    art: 'Kopfregal',
    grund: 'Regulär ausgeschrieben.',
  },
  {
    kennung: 'han-saison',
    abstand: { wochen: 3, wochentag: 'Do' },
    maerkte: 25,
    region: 'Raum Hannover',
    art: 'Zweitplatzierung, Palette',
    belegtDurch: 'Saisonartikel Winter',
  },
];

export const KALENDER_QUELLE = 'Aktionskalender Süßwaren';
