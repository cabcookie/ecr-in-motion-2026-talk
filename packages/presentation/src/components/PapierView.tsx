import { SECTIONS } from "@/slides/data";
import type { Panel, Section } from "@/slides/types";
import { SectionView } from "./SectionView";
import { Logo } from "./Logo";

/** Die Bühne, auf der jede Folie entworfen ist. */
const BUEHNE_B = 1920;
const BUEHNE_H = 1080;

/**
 * Der Vortrag als Dokument.
 *
 * Eine Seite ist eine Folie — dieselbe Bühne, dieselben Farben, derselbe Aufbau
 * wie auf der Leinwand. Keine blasse Übersetzung und auch kein Notizblatt: Wer
 * das PDF neben den Vortrag legt, soll dieselbe Folie sehen.
 *
 * Der gesprochene Text steht NICHT darunter. Er ist zum Sprechen geschrieben,
 * und abgedruckt würde aus jeder Seite ein Aufsatz mit einer Briefmarke
 * obendrauf. Wo die Rede aber etwas trägt, ohne das die Folie unverständlich
 * bliebe, steht es in `papier.text` — kurz, ein, zwei Sätze, in einem schmalen
 * Band darunter.
 *
 * Was ohne den Saal gar nicht funktioniert — QR-Codes, Live-Auswertungen —,
 * ersetzt `papier.statt`. Welche Panels das brauchen, findet
 * `pruefung/papier-test.ts`, und der Bau bricht ab, wenn eines fehlt.
 */
/**
 * Folienarten, die sich über mehrere Klicks aufbauen.
 *
 * Auf der Leinwand ist der Aufbau der Vortrag: Jeder Klick bringt ein Stück,
 * und der Vortragende erklärt es, während es erscheint. Auf Papier ist er
 * Wiederholung — fünf fast gleiche Bilder hintereinander, von denen nur das
 * letzte alles zeigt.
 */
const AUFBAU = new Set(["tshape", "architektur", "reveal", "stepped"]);

/**
 * Baut eine Folie auf demselben Bild weiter wie die nächste?
 *
 * Dann ist sie im PDF entbehrlich: Was sie zeigt, steht auch im nächsten Bild.
 * Die Ausnahme steht am Panel selbst — `papier.behalten` für Zwischenstufen,
 * die etwas tragen, das der Endstand nicht mehr hergibt.
 */
function nurZwischenstufe(abschnitt: Section, i: number): boolean {
  const hier = abschnitt.panels[i];
  if (hier.papier?.behalten) return false;
  const art = hier.mock?.t;
  if (!art || !AUFBAU.has(art)) return false;
  return abschnitt.panels[i + 1]?.mock?.t === art;
}

export function PapierView() {
  const seiten = SECTIONS.flatMap((abschnitt, index) =>
    abschnitt.panels
      .map((panel, i) => ({ abschnitt, panel, index, schritt: i }))
      .filter(({ panel, schritt }) => !panel.papier?.weg && !nurZwischenstufe(abschnitt, schritt)),
  );

  return (
    <div data-view="papier" className="bg-stage text-fg">
      <style>{DRUCK}</style>
      <Deckblatt />
      {seiten.map(({ abschnitt, panel, index, schritt }) => (
        <Seite
          key={`${abschnitt.n}.${schritt}`}
          abschnitt={abschnitt}
          panel={panel}
          index={index}
          schritt={schritt}
        />
      ))}
      <Schluss />
    </div>
  );
}

function Deckblatt() {
  const titel = SECTIONS[0];
  return (
    <section className="papier-seite flex flex-col justify-between px-[22mm] py-[18mm]">
      <Logo />
      <div>
        <p className="m-0 font-mono text-[11pt] tracking-[0.2em] text-fg-3 uppercase">
          ECR in Motion 2026 · Masterclass
        </p>
        <h1 className="mt-4 mb-0 font-display text-[34pt] leading-[1.1] font-extrabold tracking-tight">
          {titel.title}
        </h1>
        {titel.sub && <p className="mt-3 mb-0 text-[15pt] text-fg-2">{titel.sub}</p>}
        <p className="mt-10 mb-0 max-w-[62ch] text-[11pt] leading-relaxed text-fg-2">
          Die Folien des Vortrags zum Nachlesen. Wo eine Folie ohne das Gesagte
          unverständlich bliebe, steht das Nötige in einer Zeile darunter. Die Stellen,
          an denen das Publikum auf dem eigenen Handy mitgemacht hat, sind als solche
          benannt.
        </p>
      </div>
      <p className="m-0 font-mono text-[9pt] text-fg-3">
        Carsten Koch · Amazon Web Services · ecr2026.carstenbkoch.de
      </p>
    </section>
  );
}

function Schluss() {
  return (
    <section className="papier-seite flex flex-col justify-center px-[22mm] py-[18mm]">
      <h2 className="m-0 font-display text-[22pt] font-extrabold">Zum Weiterlesen</h2>
      <p className="mt-4 mb-0 max-w-[62ch] text-[11pt] leading-relaxed text-fg-2">
        Der Vortrag zum Mitklicken und der vollständige Quelltext — einschließlich der
        simulierten Systeme, der Messläufe und aller Prompts:
      </p>
      <p className="mt-6 mb-0 font-mono text-[11pt]">
        ecr2026.carstenbkoch.de
        <br />
        github.com/cabcookie/ecr-in-motion-2026-talk
      </p>
    </section>
  );
}

/**
 * Eine Folie auf einem Blatt.
 *
 * Die Bühne behält ihre 1920×1080 und wird als Ganzes verkleinert — genau wie
 * die Leinwand es tut. Jede andere Lösung müsste die Mocks ein zweites Mal für
 * den Druck bemessen, und dann driften die beiden Fassungen auseinander.
 */
function Seite({
  abschnitt,
  panel,
  index,
  schritt,
}: {
  abschnitt: Section;
  panel: Panel;
  index: number;
  schritt: number;
}) {
  const hinweis = panel.papier?.text;

  /*
    Ein Panel kann seine Folie für den Druck tauschen. `SectionView` liest sie
    aus dem Abschnitt, deshalb bekommt es hier einen Abschnitt, in dem genau
    dieses eine Panel ausgewechselt ist — statt SectionView um einen Sonderweg
    zu erweitern, den nur das PDF benutzt.
  */
  const ersatz = panel.papier?.statt;
  const gezeigt: Section = ersatz
    ? {
        ...abschnitt,
        panels: abschnitt.panels.map((p, i) => (i === schritt ? { ...p, mock: ersatz } : p)),
      }
    : abschnitt;

  return (
    <section className="papier-seite flex flex-col justify-center">
      <div className="papier-rahmen">
        <div className="papier-buehne" data-block={abschnitt.b}>
          <SectionView section={gezeigt} panel={schritt} isTitle={index === 0} />
          <Logo large={index === 0} />
        </div>
      </div>

      {hinweis && (
        <p className="mx-auto mt-[5mm] max-w-[96ch] px-[16mm] text-center text-[9.5pt] leading-[1.5] text-fg-2">
          {hinweis}
        </p>
      )}
    </section>
  );
}

/*
  Druckmaß.

  A4 quer ist 297×210 mm, die Folie 16:9. Sie passt also in der Breite und lässt
  unten ein Band frei — dort steht der Hinweis, wenn es einen gibt.

  Der Maßstab ist fest gerechnet und nicht gemessen: 1122 Bildpunkte Breite bei
  96 dpi, abzüglich Rand, geteilt durch die 1920 der Bühne. Ein Messverfahren
  wäre hier nur eine weitere Stelle, an der etwas danebengehen kann.
*/
const BREITE_PX = 1122;
const SEITENRAND = 52;
const MASSSTAB = (BREITE_PX - 2 * SEITENRAND) / BUEHNE_B;

const DRUCK = `
@page { size: A4 landscape; margin: 0; }

/*
  Die Seite darf wachsen.

  Global stehen html und body auf voller Höhe mit overflow hidden — richtig für
  die Leinwand, die nie scrollen darf. Für den Druck ist es fatal: Alles
  unterhalb des ersten Bildschirms wird abgeschnitten, und aus zweiundsechzig
  Abschnitten wurden zwei PDF-Seiten. Dieselbe Ausnahme hat die Zuschauersicht
  schon.
*/
html:has([data-view="papier"]),
body:has([data-view="papier"]),
body:has([data-view="papier"]) #root {
  height: auto;
  overflow: visible;
}

[data-view="papier"] { background: var(--color-stage); }

.papier-seite {
  width: 297mm;
  height: 209mm;
  box-sizing: border-box;
  overflow: hidden;
  /*
    Beide Schreibweisen. Die moderne allein genügte nicht — der Druck fasste
    mehrere Abschnitte auf eine Seite.
  */
  break-after: page;
  page-break-after: always;
  break-inside: avoid;
  page-break-inside: avoid;
}
.papier-seite:last-child { break-after: auto; page-break-after: auto; }

/* Der Rahmen trägt die gerechnete Höhe, damit der Seitenumbruch stimmt. */
.papier-rahmen {
  width: ${Math.round(BUEHNE_B * MASSSTAB)}px;
  height: ${Math.round(BUEHNE_H * MASSSTAB)}px;
  margin: 0 auto;
  overflow: hidden;
  position: relative;
}
/*
  Die Bühne behält ihre Entwurfsmaße und wird als Ganzes verkleinert. Sonst
  müsste jeder Mock ein zweites Mal für das Blatt bemessen werden.
*/
.papier-buehne {
  width: ${BUEHNE_B}px;
  height: ${BUEHNE_H}px;
  position: relative;
  transform: scale(${MASSSTAB});
  transform-origin: top left;
  background: var(--color-stage);
}
`;
