import { SECTIONS } from "@/slides/data";
import type { Panel, Section } from "@/slides/types";
import { SectionView } from "./SectionView";
import { Logo } from "./Logo";
import { CODE_URL, PDF_URL } from "../../aws-blocks/mail/konfig";
/*
  Dieselbe Datei wie die Antwortmail — nicht eine zweite Liste.

  Was auf der letzten Seite steht, hat jeder Teilnehmer am Abend auch per Mail
  bekommen. Zwei gepflegte Fassungen davon waeren eine zu viel: Die eine
  veraltet, und man merkt es erst, wenn jemand auf einen toten Link klickt.

  Die Mail kippt den Text aus, das Blatt braucht Spalten — deshalb liest
  `anhangEinstiege` die Gruppen aus demselben Text heraus. `?raw` bettet die
  Datei beim Bauen ein; im Browser gibt es kein Dateisystem.
*/
import anhangRoh from "../../aws-blocks/mail/anhang.md?raw";
import { anhangEinstiege } from "../../aws-blocks/mail/anhang";

const EINSTIEGE = anhangEinstiege(anhangRoh);


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

/**
 * Eine Seite, die nur den Titel zeigt — und die nächste zeigt ihn auch.
 *
 * Auf der Leinwand ist das ein Moment: Der Satz steht groß und allein, der
 * Vortragende lässt ihn wirken, dann kommt der Beleg. Auf Papier steht
 * derselbe Satz zweimal untereinander, einmal groß und einmal als
 * Seitenüberschrift — und liest sich wie ein Druckfehler.
 */
function nurTitelblatt(abschnitt: Section, i: number): boolean {
  if (abschnitt.panels[i].papier?.behalten) return false;
  if (abschnitt.panels[i].mock) return false;
  return i + 1 < abschnitt.panels.length;
}

export function PapierView() {
  const seiten = SECTIONS.flatMap((abschnitt, index) =>
    abschnitt.panels
      .map((panel, i) => ({ abschnitt, panel, index, schritt: i }))
      .filter(
        ({ panel, schritt }) =>
          !panel.papier?.weg &&
          !nurZwischenstufe(abschnitt, schritt) &&
          !nurTitelblatt(abschnitt, schritt),
      ),
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

/**
 * Das Logo für Deck- und Schlussseite — im Fluss, nicht auf der Bühne.
 *
 * Das Bühnenlogo sitzt absolut auf Bühnenkoordinaten; unten links heißt dort
 * `top: 998`, und das liegt jenseits der Seitenhöhe. Ohne positionierten
 * Vorfahren landete es auf der NÄCHSTEN Seite, die dadurch zwei Logos trug.
 *
 * Fehlt die Datei — sie liegt nicht im Repository —, verschwindet das Bild,
 * statt als kaputtes Symbol dazustehen.
 */
function Markenzeichen() {
  return (
    <img
      src="/brand/aws-logo.svg"
      alt="Amazon Web Services"
      /* `self-start`, sonst zieht der Flex-Container das Bild in die Mitte. */
      className="h-[14mm] w-auto self-start"
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).style.display = "none";
      }}
    />
  );
}

function Deckblatt() {
  const titel = SECTIONS[0];
  return (
    <section className="papier-seite flex flex-col justify-between px-[22mm] py-[18mm]">
      <Markenzeichen />
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
        Carsten Koch · Amazon Web Services · ecr2026.carstenbkoch.de/vortrag
      </p>
    </section>
  );
}

/**
 * Die letzte Seite: was man am naechsten Morgen damit anfangen kann.
 *
 * Der Vortrag endet mit einer Adresse auf der Leinwand — die kann man
 * fotografieren, aber nicht anklicken. Hier stehen die Wege ausgeschrieben,
 * nach Leserkreis geordnet: wer selbst ausprobieren will, wer entscheiden
 * muss, wer es bauen soll, und wer es nicht allein anfangen moechte.
 *
 * Die Reihenfolge und die Auswahl kommen aus der Antwortmail und werden
 * NICHT hier gepflegt. Wer einen Link aendert, aendert beide Fassungen.
 */
function Schluss() {
  return (
    <section className="papier-seite flex flex-col justify-between px-[20mm] py-[14mm]">
      <div>
        <Markenzeichen />
        <h2 className="mt-[8mm] mb-0 font-display text-[20pt] leading-none font-extrabold">
          Wie es weitergeht
        </h2>
        <p className="mt-2 mb-0 max-w-[92ch] text-[10pt] leading-relaxed text-fg-2">
          Vier Wege, je nachdem, wer mitliest. Dieselbe Liste steht in der Antwort-Mail,
          die Du am Abend von Lisa Berger bekommen hast.
        </p>

        <div className="mt-[7mm] grid grid-cols-2 gap-x-[12mm] gap-y-[6mm]">
          {EINSTIEGE.map((block) => (
            <div key={block.gruppe}>
              {/*
                Ganze Saetze, keine Etiketten — deshalb Satzschrift und keine
                Versalien. Die Ueberschriften standen hier einmal als kurze
                Mono-Labels in Grossbuchstaben; seit sie aus der Mail kommen
                („Wenn Du Unterstuetzung von Deiner IT brauchst ..."), waeren
                das drei Zeilen Geschrei.
              */}
              <p className="m-0 max-w-[46ch] text-[9.5pt] leading-snug font-semibold text-fg">
                {block.gruppe}
              </p>
              <ul className="mt-2 mb-0 list-none space-y-[2.5mm] p-0">
                {block.punkte.map((punkt) => (
                  <li key={punkt.url}>
                    <p className="m-0 text-[9pt] leading-snug text-fg-2">{punkt.was}</p>
                    {/*
                      Die Adresse ausgeschrieben und nicht hinter dem Text
                      versteckt: Auf Papier ist ein Link, den man nicht lesen
                      kann, kein Link. `break-all`, weil die Skill-Builder-
                      Adressen laenger sind als die Spalte breit ist.
                    */}
                    <p className="m-0 font-mono text-[7.5pt] leading-snug break-all text-fg-3">
                      {punkt.url}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-[6mm] border-t border-fg-3/25 pt-[4mm]">
        <p className="m-0 font-mono text-[9pt] leading-relaxed">
          {/*
            Die anklickbare Fassung des Vortrags steht hier bewusst NICHT: Sie
            wird nach dem Abend abgeschaltet, und ein gedrucktes Dokument
            ueberlebt sie. Eine Adresse, die ins Leere laeuft, ist schlechter
            als keine.
          */}
          Diese Folien als PDF: {PDF_URL}
          <br />
          Der Quelltext, die Messläufe und alle Prompts: {CODE_URL}
        </p>
        <p className="mt-[3mm] mb-0 font-mono text-[8pt] text-fg-3">
          Carsten Koch · Amazon Web Services
        </p>
      </div>
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
