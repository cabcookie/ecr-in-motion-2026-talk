/**
 * Das Zielsystem — wohin die Kategorie in diesem Geschäftsjahr will.
 *
 * Der Port liefert zwei Dinge nebeneinander, und erst beides zusammen ist eine
 * Entscheidungsgrundlage: die **Vorgabe** aus dem Kategorieplan und den **Ist-
 * Stand**, gerechnet aus dem Sortiment. Der Plan sagt „von 8 auf 15 Prozent",
 * das Sortiment sagt, wo wir heute stehen. Die Lücke dazwischen ist das
 * Argument.
 *
 * Gerechnet und nicht hinterlegt: Eine eingetragene Ist-Zahl wäre am Tag nach
 * der ersten Sortimentsänderung falsch, und niemand würde es merken.
 */

import { SORTIMENT, type Artikel } from '../daten/sortiment';
import { KAEUFERGRUPPEN, gruppeVon, type Kaeufergruppe } from '../daten/kaeufergruppen';
import { ZIELE, geschaeftsjahr, type Richtung } from '../daten/ziele';
import { alsStand } from '../zeit/anker';
import { treffer, type Befund } from './port';

export interface Zielstand {
  readonly gruppe: string;
  readonly name: string;
  readonly anlass: string;
  /** Warum der Kunde greift — der Satz, den eine Anfrage bedienen muss. */
  readonly warum: string;

  readonly richtung: Richtung;
  readonly vorgabe: string;
  readonly begruendung: string;

  readonly artikel: number;
  readonly facings: number;
  /** Anteil an der Fläche der Kategorie, in Prozent. */
  readonly anteilFlaeche: number;
  readonly anteilAbsatz: number;
  /** Absatzgewichtete Entwicklung der Gruppe, in Prozent. */
  readonly entwicklung: number;
  /** Zielanteil in Prozent, wo der Plan einen nennt. */
  readonly zielAnteilFlaeche?: number;
  /**
   * Wie die Gruppe zu ihrem Ziel steht, in einem Satz.
   * Das ist die Zeile, die in einer Antwort zitierbar ist.
   */
  readonly lage: string;
}

export interface Zielauskunft {
  readonly geschaeftsjahr: string;
  /** Der wievielte Monat läuft — „im 4. von 12 Monaten". */
  readonly monat: number;
  readonly staende: readonly Zielstand[];
}

function rundeAufZehntel(wert: number): number {
  return Math.round(wert * 10) / 10;
}

/**
 * Wie eine Gruppe zu ihrem Ziel steht.
 *
 * Absichtlich ein Satz und keine Ampel. Eine Farbe müsste der Assistent
 * auslegen; ein Satz lässt sich zitieren, und in einer Absage ist genau das
 * gefragt — nicht „rot", sondern warum.
 */
function lageSatz(
  richtung: Richtung,
  anteil: number,
  ziel: number | undefined,
): string {
  const abstand = ziel === undefined ? 0 : rundeAufZehntel(ziel - anteil);

  switch (richtung) {
    case 'gewinnen':
      return abstand > 0
        ? `Wir liegen ${abstand} Punkte unter dem Ziel. Anfragen aus dieser Gruppe haben Vorrang, auch gegen Bestand.`
        : 'Das Ziel ist erreicht. Weitere Listungen werden normal geprüft.';
    case 'steigern':
      return abstand > 0
        ? `Wir liegen ${abstand} Punkte unter dem Ziel. Zusätzliche Fläche ist hier erwünscht.`
        : 'Das Ziel ist erreicht. Weitere Fläche ist nicht vorgesehen.';
    case 'halten':
      return 'Die Position ist gesetzt. Neues kommt nur im Tausch gegen Bestehendes, nicht zusätzlich.';
    case 'nicht_ausbauen':
      return anteil >= (ziel ?? 0)
        ? `Die Obergrenze von ${rundeAufZehntel(ziel ?? 0)} Prozent ist mit ${anteil} Prozent erreicht. Zusätzliche Fläche in dieser Gruppe ist ausgeschlossen.`
        : `Noch ${rundeAufZehntel((ziel ?? 0) - anteil)} Punkte bis zur Obergrenze, danach ist die Gruppe geschlossen.`;
  }
}

function standFuer(
  gruppe: Kaeufergruppe,
  artikel: readonly Artikel[],
  gesamtFacings: number,
  gesamtAbsatz: number,
): Zielstand | null {
  const ziel = ZIELE.find((z) => z.gruppe === gruppe.kennung);
  if (!ziel) return null;

  const facings = artikel.reduce((s, a) => s + a.facings, 0);
  const absatz = artikel.reduce((s, a) => s + a.absatzJahr, 0);
  const anteilFlaeche = rundeAufZehntel((facings / gesamtFacings) * 100);
  const zielAnteil =
    ziel.zielAnteilFlaeche === undefined ? undefined : rundeAufZehntel(ziel.zielAnteilFlaeche * 100);

  return {
    gruppe: gruppe.kennung,
    name: gruppe.name,
    anlass: gruppe.anlass,
    warum: gruppe.warum,
    richtung: ziel.richtung,
    vorgabe: ziel.vorgabe,
    begruendung: ziel.begruendung,
    artikel: artikel.length,
    facings,
    anteilFlaeche,
    anteilAbsatz: rundeAufZehntel((absatz / gesamtAbsatz) * 100),
    /* Absatzgewichtet: Ein Artikel mit 400 Stück soll den Schnitt nicht kippen. */
    entwicklung: absatz
      ? rundeAufZehntel(artikel.reduce((s, a) => s + a.entwicklung * a.absatzJahr, 0) / absatz)
      : 0,
    zielAnteilFlaeche: zielAnteil,
    lage: lageSatz(ziel.richtung, anteilFlaeche, zielAnteil),
  };
}

/**
 * Die Ziele der Kategorie, mit dem Stand von heute.
 *
 * Ohne Argument, weil es nichts zu fragen gibt: Es gibt einen Plan, und er gilt
 * für alle Gruppen. Wer nur eine Gruppe braucht, sucht sie sich heraus — das
 * ist billiger als ein Port, der falsch gefragt werden kann.
 */
export function ziele(): Befund<Zielauskunft> {
  const gesamtFacings = SORTIMENT.reduce((s, a) => s + a.facings, 0);
  const gesamtAbsatz = SORTIMENT.reduce((s, a) => s + a.absatzJahr, 0);

  const nachGruppe = new Map<string, Artikel[]>();
  for (const a of SORTIMENT) {
    const k = gruppeVon(a).kennung;
    nachGruppe.set(k, [...(nachGruppe.get(k) ?? []), a]);
  }

  const staende = KAEUFERGRUPPEN.map((g) =>
    standFuer(g, nachGruppe.get(g.kennung) ?? [], gesamtFacings, gesamtAbsatz),
  ).filter((s): s is Zielstand => s !== null);

  const jahr = geschaeftsjahr();

  return treffer(
    { geschaeftsjahr: jahr.bezeichnung, monat: jahr.monat, staende },
    `Kategorieplan Schokolade & Pralinen ${jahr.bezeichnung}`,
    alsStand(jahr.beginn),
  );
}
