/**
 * Der Aktionskalender.
 *
 * Er beantwortet zwei Fragen auf einmal, weil sie im Handel zusammengehören:
 * Ist der Wunschtermin überhaupt zu halten — also liegt er hinter der
 * Vorlauffrist —, und was ist in seiner Nähe frei?
 *
 * Die Frist steht nicht im Systemprompt, sondern in der Kategorieakte. Das ist
 * der Unterschied zwischen einem Agenten, der eine Regel *kennt*, und einem,
 * der sie *belegen* kann.
 */
import { AKTIONSFLAECHEN, KALENDER_QUELLE } from '../daten/aktionen';
import { SCHOKOLADE_UND_PRALINEN } from '../daten/kategorien';
import { alsStand, alsText, anker, lies, tageZwischen, verschiebe } from '../zeit/anker';
import { type Befund, fehlschlag, treffer } from './port';

export interface FreieFlaeche {
  readonly datum: string;
  readonly inTagen: number;
  readonly maerkte: number;
  readonly region: string;
  readonly art: string;
  readonly grund?: string;
  /** Abstand zum Wunschtermin in Tagen. Negativ heißt: liegt davor. */
  readonly abstandZumWunsch: number;
}

export interface Kalenderauskunft {
  readonly wunschtermin: string;
  readonly vorlaufTage: number;
  readonly vorlaufNoetig: number;
  readonly fristErfuellt: boolean;
  /** Um so viele Tage verfehlt der Wunschtermin die Frist. 0, wenn er sie hält. */
  readonly fehlendeTage: number;
  readonly freieFlaechen: readonly FreieFlaeche[];
  readonly belegt: readonly string[];
}

/**
 * Freie Aktionsflächen rund um einen Wunschtermin.
 *
 * Der Termin kommt aus einer Mail, also so, wie Menschen ihn schreiben:
 * „15. Oktober", „15.10.", „2026-10-15".
 */
export function flaechen(wunschtermin: string): Befund<Kalenderauskunft> {
  const heute = anker();
  const wunsch = lies(wunschtermin, heute);
  if (!wunsch) {
    return fehlschlag(
      'unvollstaendig',
      `„${wunschtermin}" kann ich nicht als Datum lesen. Gebraucht wird ein Termin wie ` +
        `„15. Oktober" oder „15.10.".`,
    );
  }

  const vorlaufTage = tageZwischen(heute, wunsch);
  const noetig = SCHOKOLADE_UND_PRALINEN.vorlaufWochen * 7;

  const alle = AKTIONSFLAECHEN.map((f) => {
    const datum = verschiebe(heute, f.abstand);
    return { f, datum, inTagen: tageZwischen(heute, datum) };
  });

  const frei = alle
    .filter((e) => !e.f.belegtDurch)
    /* Flächen innerhalb der Vorlauffrist sind faktisch nicht buchbar. */
    .filter((e) => e.inTagen >= noetig)
    .map((e) => ({
      datum: alsText(e.datum),
      inTagen: e.inTagen,
      maerkte: e.f.maerkte,
      region: e.f.region,
      art: e.f.art,
      ...(e.f.grund ? { grund: e.f.grund } : {}),
      abstandZumWunsch: tageZwischen(wunsch, e.datum),
    }))
    /* Nach Nähe zum Wunschtermin, nicht nach Datum — danach wird gefragt. */
    .sort((a, b) => Math.abs(a.abstandZumWunsch) - Math.abs(b.abstandZumWunsch));

  return treffer(
    {
      wunschtermin: alsText(wunsch),
      vorlaufTage,
      vorlaufNoetig: noetig,
      fristErfuellt: vorlaufTage >= noetig,
      fehlendeTage: Math.max(0, noetig - vorlaufTage),
      freieFlaechen: frei,
      belegt: alle
        .filter((e) => e.f.belegtDurch)
        .map((e) => `${alsText(e.datum)}, ${e.f.region}: ${e.f.belegtDurch}`),
    },
    KALENDER_QUELLE,
    alsStand(heute),
  );
}
