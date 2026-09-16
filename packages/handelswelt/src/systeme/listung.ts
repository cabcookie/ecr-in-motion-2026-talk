/**
 * Der Listungsweg.
 *
 * Bisher standen diese Regeln im Systemprompt — der Agent *kannte* sie, konnte
 * sie aber nicht belegen. Damit war jede Berufung darauf so viel wert wie eine
 * erfundene Zahl: plausibel und ohne Quelle.
 *
 * Hier stehen sie als Daten, mit Zuständigkeit und Stand. Der Agent kann dann
 * sagen, WORAUF er sich beruft, und die Antwortmail wird prüfbar.
 *
 * Der Port entscheidet nichts. Er nennt die Tore und wer sie öffnet.
 */
import { SCHOKOLADE_UND_PRALINEN, standDerKategorie } from '../daten/kategorien';
import { KATEGORIE } from '../daten/sortiment';
import { type Befund, treffer } from './port';

const QUELLE = 'Kategorieakte Listung';

export interface Tor {
  readonly tor: string;
  readonly regel: string;
  /** Wer öffnet es — und ob das der Assistent selbst sein kann. */
  readonly entscheidet: string;
  /** Wann das Tor überhaupt gilt. Leer heißt: immer. */
  readonly giltWenn?: string;
}

export interface Listungsweg {
  readonly kategorie: string;
  readonly tore: readonly Tor[];
}

export function anforderungen(): Befund<Listungsweg> {
  const vorgabe = `${(SCHOKOLADE_UND_PRALINEN.mindestRohertrag * 100).toFixed(0)} %`;

  return treffer(
    {
      kategorie: KATEGORIE,
      tore: [
        {
          tor: 'Rohertrag',
          regel:
            `Mindestens ${vorgabe} Rohertrag auf den Netto-Verkaufspreis. ` +
            `Schokolade läuft mit ${(SCHOKOLADE_UND_PRALINEN.mehrwertsteuer * 100).toFixed(0)} % ` +
            `Mehrwertsteuer, gerechnet wird also nicht auf den Preis am Regal.`,
          entscheidet: 'Category Management, ohne weitere Freigabe',
        },
        {
          tor: 'Regalplatz',
          regel:
            'Eine Neulistung setzt in der Regel eine Auslistung in derselben Regalzone voraus. ' +
            'Frei werdende Facings müssen die Facings des neuen Artikels decken.',
          entscheidet: 'Category Management, ohne weitere Freigabe',
        },
        {
          tor: 'Aktionsfläche',
          regel:
            `Aktionsflächen laufen über den Aktionskalender. Vorlauf mindestens ` +
            `${SCHOKOLADE_UND_PRALINEN.vorlaufWochen} Wochen vor dem Starttermin.`,
          entscheidet: 'Aktionsplanung',
          giltWenn: 'Der Antrag enthält eine Einführungsaktion oder Zweitplatzierung.',
        },
        {
          tor: 'Exklusivität',
          regel:
            'Eine Exklusivzusage gegenüber einem Hersteller bindet das Haus über die Kategorie ' +
            'hinaus und ist deshalb nicht im Category Management zu entscheiden.',
          entscheidet: 'Einkaufsleitung',
          giltWenn: 'Der Hersteller verlangt Exklusivität.',
        },
        {
          tor: 'Mindestabnahme',
          regel:
            'Eine zugesagte Mindestabnahme ist eine Verpflichtung gegen den Absatz. Sie ist gegen ' +
            'die Absatzerwartung des Artikels zu prüfen, nicht gegen die Kategorie.',
          entscheidet: 'Category Management, ohne weitere Freigabe',
          giltWenn: 'Der Antrag nennt eine Mindestabnahme.',
        },
      ],
    },
    QUELLE,
    standDerKategorie(),
  );
}
