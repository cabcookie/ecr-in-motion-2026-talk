import type { TShapeMock } from "@/slides/types";

const MONO = "Amazon Ember Mono, ui-monospace, monospace";
const SANS = "Amazon Ember Display, Helvetica Neue, Arial, sans-serif";
const DISPLAY = "Amazon Ember Display, Helvetica Neue, Arial, sans-serif";

const BREITE = 1360;
const HOEHE = 560;
/** Waagerechte Mitte. Alles richtet sich daran aus, statt an gesetzten Zahlen. */
const MITTE = BREITE / 2;

/** Der Mensch: schmaler Balken, tiefer Stamm. */
const MENSCH = {
  balken: { w: 760, h: 104, y: 92 },
  stamm: { w: 124, h: 286 },
};

/**
 * Das Modell: breiterer und dickerer Balken, dazu ein Stamm, der BREITER ist als
 * der menschliche und trotzdem flacher.
 *
 * Genau das ist die Aussage: Was ein Agent an Spezialwissen bekommt, deckt mehr
 * Fälle ab als das, was ein Einzelner mitbringt — reicht aber nicht so tief.
 */
const MODELL = {
  balken: { w: 1180, h: 156, y: 78 },
  stamm: { w: 208, h: 188 },
};

const MIT_BALKEN = 2;
const MIT_STAMM = 3;
const ERSTER_BAUSTEIN = 4;

/**
 * Wissen als T, in Stufen aufgebaut.
 *
 * **Eine Form, kein Bausatz.** Balken und Stamm sind ein Pfad mit ausgerundeten
 * Innenecken. Als zwei Rechtecke mit je eigenen runden Ecken trafen an der
 * Stoßkante Rundung und Gerade aufeinander — das las sich als zwei
 * aneinandergeklebte Blöcke statt als ein T.
 *
 * **Der Mensch bleibt stehen.** Ab Stufe 1 tritt er zurück, verschwindet aber
 * nicht: Ohne ihn wäre der Balken des Modells nur breit, mit ihm ist er
 * breiter. Der Vergleich ist die Aussage.
 */
export function TShapeView({ m }: { m: TShapeMock }) {
  const stufe = m.stufe;
  const zeigtModellBalken = stufe >= MIT_BALKEN;
  const zeigtModellStamm = stufe >= MIT_STAMM;
  /* Nur auf der ersten Stufe steht der Mensch für sich — dort wird er erklärt. */
  const menschImVordergrund = stufe === 0;

  const mStammOben = MODELL.balken.y + MODELL.balken.h;
  const mStammX = MITTE - MODELL.stamm.w / 2;
  /** Die Linie, auf der „WIE TIEF" und „Spezialwissen" gemeinsam sitzen. */
  const linieMensch = MENSCH.balken.y + MENSCH.balken.h + MENSCH.stamm.h / 2;
  const linieModell = mStammOben + MODELL.stamm.h / 2;

  /*
    Der Umriss des Modells — mit Stamm, sobald er da ist.

    Er dient doppelt: als gefüllte Silhouette und als Schablone für den
    andersfarbigen Stamm. Deshalb wächst dort keine zweite Form heran, sondern
    eine Farbfläche innerhalb dieser einen. Vorher lag der Stamm obendrauf, und
    seine ausgerundeten Schultern standen als grüne Flügel auf dem blauen
    Balken.
  */
  const modellUmriss = zeigtModellStamm
    ? ganzesT(MODELL.balken, MODELL.stamm)
    : nurBalken(MODELL.balken);

  return (
    <div className="w-full">
      <style>{CSS}</style>
      <svg viewBox={`0 0 ${BREITE} ${HOEHE}`} role="img" aria-label={m.alt}>
        {/* Der Mensch — ab Stufe 1 nur noch als Vergleichsmaß */}
        <path
          d={ganzesT(MENSCH.balken, MENSCH.stamm)}
          fill="var(--color-fg-3)"
          opacity={menschImVordergrund ? 1 : 0.22}
          style={{ transition: "opacity 700ms ease" }}
        />

        {menschImVordergrund && (
          <>
            <text
              x={MITTE}
              y={MENSCH.balken.y + MENSCH.balken.h / 2 + 13}
              textAnchor="middle"
              fontFamily={DISPLAY}
              fontSize="40"
              fontWeight="700"
              fill="var(--color-stage)"
            >
              Allgemeinwissen
            </text>
            <text
              x={MITTE + MENSCH.stamm.w / 2 + 40}
              y={linieMensch + 14}
              fontFamily={DISPLAY}
              fontSize="40"
              fontWeight="700"
              fill="var(--color-fg)"
            >
              Spezialwissen
            </text>
            <text
              x={MITTE - MENSCH.balken.w / 2}
              y={MENSCH.balken.y - 20}
              fontFamily={MONO}
              fontSize="22"
              letterSpacing="2.5"
              fill="var(--color-fg-3)"
            >
              WIE VIELE THEMEN
            </text>
            <text
              x={MITTE - MENSCH.stamm.w / 2 - 34}
              y={linieMensch + 8}
              textAnchor="end"
              fontFamily={MONO}
              fontSize="22"
              letterSpacing="2.5"
              fill="var(--color-fg-3)"
            >
              WIE TIEF
            </text>
          </>
        )}

        {/*
          Das Modell legt sich DARÜBER, nicht daneben — und durchscheinend, damit
          der Mensch darunter sichtbar bleibt. Ein deckender Balken hätte ihn
          verborgen, und dann wäre „breiter" eine Behauptung statt eines Bildes.
        */}
        {zeigtModellBalken && (
          <>
            <defs>
              <clipPath id="modell-umriss">
                <path d={modellUmriss} />
              </clipPath>
            </defs>
            <path
              key="modell-balken"
              className="t-el"
              d={modellUmriss}
              fill="var(--accent)"
              fillOpacity="0.78"
            />
          </>
        )}

        {/*
          Der Stamm wächst nach unten heraus. `transform-box: fill-box` mit
          `transform-origin: top` hält ihn dabei oben am Balken, statt ihn aus
          der Mitte aufploppen zu lassen.
        */}
        {zeigtModellStamm && (
          <rect
            key="modell-stamm"
            className="t-wachs"
            x={mStammX - 60}
            y={mStammOben}
            width={MODELL.stamm.w + 120}
            height={MODELL.stamm.h}
            fill="var(--color-b4)"
            fillOpacity="0.92"
            clipPath="url(#modell-umriss)"
          />
        )}

        {zeigtModellBalken && (
          <text
            key="modell-label"
            className="t-el"
            x={MITTE}
            y={MODELL.balken.y + MODELL.balken.h / 2 + 13}
            textAnchor="middle"
            fontFamily={DISPLAY}
            fontSize="40"
            fontWeight="700"
            fill="var(--color-stage)"
          >
            Allgemeinwissen
          </text>
        )}

        {zeigtModellStamm && (
          <text
            key="modell-spezial"
            className="t-el"
            x={mStammX + MODELL.stamm.w + 44}
            y={linieModell + 14}
            fontFamily={DISPLAY}
            fontSize="40"
            fontWeight="700"
            fill="var(--color-fg)"
          >
            Spezialwissen
          </text>
        )}

        {/*
          Die Bausteine — einer je Stufe, nur das Wort.

          Zeilenabstand 48 und nicht 54: Bei vier Bausteinen fiel der letzte
          („Autonomie") sonst unten aus dem Zeichenfeld. Gemessen, nicht
          geschätzt — im Bild sah es aus, als wäre einfach nichts da.
        */}
        {m.bausteine?.map((wort, i) =>
          stufe >= ERSTER_BAUSTEIN + i ? (
            <g key={wort} className="t-el">
              <circle
                cx={mStammX + MODELL.stamm.w + 62}
                cy={linieModell + 60 + i * 48}
                r="8"
                fill="var(--color-b4)"
              />
              <text
                x={mStammX + MODELL.stamm.w + 90}
                y={linieModell + 71 + i * 48}
                fontFamily={SANS}
                fontSize="32"
                fill="var(--color-fg-2)"
              >
                {wort}
              </text>
            </g>
          ) : null,
        )}
      </svg>
    </div>
  );
}

/*
  Angehalten, bis die Folie sichtbar ist.

  Alle Panels liegen im Baum; ohne das liefe die Animation im Verborgenen ab und
  wäre vorbei, bevor jemand hinsieht. `aria-hidden` setzt die Folienansicht
  ohnehin — dasselbe Muster wie beim Architekturbild.
*/
const CSS = `
.t-el, .t-wachs {
  transform-box: fill-box;
  animation-play-state: paused;
}
.t-el {
  transform-origin: center;
  animation: t-auf 620ms cubic-bezier(.2,.8,.25,1) backwards;
}
.t-wachs {
  transform-origin: top center;
  animation: t-wachsen 820ms cubic-bezier(.22,.9,.28,1) backwards;
}
[aria-hidden="false"] .t-el,
[aria-hidden="false"] .t-wachs { animation-play-state: running; }
@keyframes t-auf {
  from { opacity: 0; transform: translateY(-14px) scale(.96); }
  to   { opacity: 1; transform: none; }
}
@keyframes t-wachsen {
  from { transform: scaleY(0); }
  to   { transform: scaleY(1); }
}
@media (prefers-reduced-motion: reduce) {
  .t-el, .t-wachs { animation: none; }
}
`;

const R = 16;
const K = 26;

/** Nur der Balken, als abgerundetes Rechteck. */
function nurBalken(b: { w: number; h: number; y: number }): string {
  const x = MITTE - b.w / 2;
  const x2 = x + b.w;
  const unten = b.y + b.h;
  return [
    `M ${x + R} ${b.y}`,
    `H ${x2 - R}`,
    `A ${R} ${R} 0 0 1 ${x2} ${b.y + R}`,
    `V ${unten - R}`,
    `A ${R} ${R} 0 0 1 ${x2 - R} ${unten}`,
    `H ${x + R}`,
    `A ${R} ${R} 0 0 1 ${x} ${unten - R}`,
    `V ${b.y + R}`,
    `A ${R} ${R} 0 0 1 ${x + R} ${b.y}`,
    "Z",
  ].join(" ");
}

/**
 * Das ganze T als ein Pfad, im Uhrzeigersinn.
 *
 * `R` rundet die Aussenecken, `K` die beiden Innenecken — die Kehle. Ohne sie
 * stossen zwei Kanten rechtwinklig aufeinander, und das Auge liest zwei Teile.
 */
function ganzesT(
  b: { w: number; h: number; y: number },
  st: { w: number; h: number },
): string {
  const bx = MITTE - b.w / 2;
  const bx2 = bx + b.w;
  const sx = MITTE - st.w / 2;
  const sx2 = sx + st.w;
  const balkenUnten = b.y + b.h;
  const stammUnten = balkenUnten + st.h;

  return [
    `M ${bx + R} ${b.y}`,
    `H ${bx2 - R}`,
    `A ${R} ${R} 0 0 1 ${bx2} ${b.y + R}`,
    `V ${balkenUnten - R}`,
    `A ${R} ${R} 0 0 1 ${bx2 - R} ${balkenUnten}`,
    /* rechte Kehle: nach innen gerundet, deshalb Sweep 0 */
    `H ${sx2 + K}`,
    `A ${K} ${K} 0 0 0 ${sx2} ${balkenUnten + K}`,
    `V ${stammUnten - R}`,
    `A ${R} ${R} 0 0 1 ${sx2 - R} ${stammUnten}`,
    `H ${sx + R}`,
    `A ${R} ${R} 0 0 1 ${sx} ${stammUnten - R}`,
    `V ${balkenUnten + K}`,
    `A ${K} ${K} 0 0 0 ${sx - K} ${balkenUnten}`,
    `H ${bx + R}`,
    `A ${R} ${R} 0 0 1 ${bx} ${balkenUnten - R}`,
    `V ${b.y + R}`,
    `A ${R} ${R} 0 0 1 ${bx + R} ${b.y}`,
    "Z",
  ].join(" ");
}
