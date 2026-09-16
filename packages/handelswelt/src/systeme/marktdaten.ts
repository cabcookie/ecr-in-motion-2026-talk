/**
 * Das Marktpanel.
 *
 * Der Port liefert zwei Zahlen zu jedem Segment, und ihre Differenz ist der
 * eigentliche Inhalt: wie das Segment im Markt läuft, und wie es bei uns läuft.
 * Wächst der Markt zweistellig und wir nicht, fehlt etwas im Regal — das ist
 * das Argument, das eine Listung trägt.
 *
 * Die eigene Zahl wird aus dem Sortiment gerechnet, nicht behauptet.
 */
import { PANEL_ABSTAND, PANEL_QUELLE, SEGMENTE, type Segment } from '../daten/marktpanel';
import { SORTIMENT, type Artikel } from '../daten/sortiment';
import { alsStand, anker, verschiebe } from '../zeit/anker';
import { type Befund, fehlschlag, treffer } from './port';

export interface Segmentauskunft {
  readonly segment: string;
  readonly marktentwicklung: number;
  /** Entwicklung unserer Artikel in diesem Segment. Leer, wenn wir keine führen. */
  readonly eigeneEntwicklung: number | null;
  readonly eigeneArtikel: number;
  /** Was die Differenz bedeutet — in Prozentpunkten, nicht als Urteil. */
  readonly abstandInPunkten: number | null;
}

/** In welches Segment das Panel ein Produkt einsortiert. */
export function segmentVon(bezeichnung: string): Segment {
  return SEGMENTE.find((s) => s.erkennung.test(bezeichnung)) ?? SEGMENTE[SEGMENTE.length - 1];
}

function eigene(segment: Segment): Artikel[] {
  return SORTIMENT.filter((a) => segmentVon(`${a.marke} ${a.bezeichnung}`).kennung === segment.kennung);
}

/**
 * In welches Segment fällt ein Produkt, und wie läuft dieses Segment?
 *
 * Das Produkt muss nicht gelistet sein — nach genau dieser Auskunft fragt man
 * ja, BEVOR man listet. Das Panel kennt das Segment, nicht unseren Artikelstamm.
 */
export function segment(produkt: string): Befund<Segmentauskunft> {
  const bezeichnung = produkt.trim();
  if (bezeichnung.length < 2) {
    return fehlschlag('unvollstaendig', 'Ohne Produktnamen kann ich kein Segment bestimmen.');
  }

  const s = segmentVon(bezeichnung);
  const unsere = eigene(s);
  const menge = unsere.reduce((sum, a) => sum + a.absatzJahr, 0);
  const eigeneEntwicklung =
    menge > 0
      ? Math.round((unsere.reduce((sum, a) => sum + a.entwicklung * a.absatzJahr, 0) / menge) * 10) / 10
      : null;

  return treffer(
    {
      segment: s.name,
      marktentwicklung: s.marktentwicklung,
      eigeneEntwicklung,
      eigeneArtikel: unsere.length,
      abstandInPunkten:
        eigeneEntwicklung === null
          ? null
          : Math.round((s.marktentwicklung - eigeneEntwicklung) * 10) / 10,
    },
    PANEL_QUELLE,
    alsStand(verschiebe(anker(), PANEL_ABSTAND)),
  );
}
