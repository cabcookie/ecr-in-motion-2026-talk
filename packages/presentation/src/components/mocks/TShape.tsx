import type { TShapeMock } from "@/slides/types";

const MONO = "Amazon Ember Mono, ui-monospace, monospace";
const SANS = "Amazon Ember Display, Helvetica Neue, Arial, sans-serif";
const DISPLAY = "Amazon Ember Display, Helvetica Neue, Arial, sans-serif";

const BREITE = 1360;
const HOEHE = 560;
/** Waagerechte Mitte. Alles richtet sich daran aus, statt an gesetzten Zahlen. */
const MITTE = BREITE / 2;

/**
 * Wissen als T.
 *
 * Ein breiter Balken für das Allgemeinwissen, darunter ein tiefer Stamm für das
 * Spezialwissen.
 *
 * **Eine Form, kein Bausatz.** Vorher waren es zwei Rechtecke mit je eigenen
 * runden Ecken. An der Stoßkante trafen die Rundungen des Stamms auf die gerade
 * Unterkante des Balkens, und das las sich als zwei aneinandergeklebte Blöcke
 * statt als ein T. Jetzt ist es ein einziger Pfad mit ausgerundeten
 * Innenecken — die Kehle zwischen Balken und Stamm ist das, was ein T zu einem
 * T macht.
 *
 * Die Beschriftung steht waagerecht neben den Formen statt gedreht darin —
 * gedrehte Schrift ist das, was solche Diagramme unlesbar macht.
 */
export function TShapeView({ m }: { m: TShapeMock }) {
  const isHuman = m.variant === "human";
  const isGrown = m.variant === "grown";

  /*
    Der Balken des Modells ist breiter UND dicker: mehr Themen, mehr Tiefe je
    Thema. Beide sind um MITTE herum gebaut, nicht an gesetzten x-Werten — der
    alte Balken saß 90 Punkte links der Mitte, und auf der Leinwand sah das aus,
    als stünde die Folie schief.
  */
  const balken = isHuman
    ? { w: 760, h: 104, y: 92 }
    : { w: 1180, h: 156, y: 78 };

  const stamm = { w: 124, h: isHuman ? 286 : 250 };

  const bx = MITTE - balken.w / 2;
  const sx = MITTE - stamm.w / 2;
  const balkenUnten = balken.y + balken.h;
  const stammUnten = balkenUnten + stamm.h;

  const hatStamm = isHuman || isGrown;

  /*
    Eine gemeinsame Linie auf halber Stammhöhe.

    Links steht „WIE TIEF", rechts „Spezialwissen" — beide beziehen sich auf den
    Stamm, also gehören sie auf dieselbe Höhe. Direkt unter dem Balken las sich
    „Spezialwissen" wie eine zweite Zeile zum Balken.

    Die Grundlinien liegen unterschiedlich weit darunter, weil die Schriftgrade
    verschieden sind: Eine gemeinsame Grundlinie ergäbe optisch zwei Höhen.
    Ausgerichtet wird an der Mitte der Zeichen, nicht an ihrem Fuß.
  */
  const linie = balkenUnten + stamm.h / 2;

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${BREITE} ${HOEHE}`} role="img" aria-label={m.alt}>
        <defs>
          <clipPath id="tshape-umriss">
            <path d={umriss(bx, balken, sx, stamm, balkenUnten, stammUnten, hatStamm)} />
          </clipPath>
        </defs>

        {/* Die Silhouette: ein Pfad, eine Farbe. */}
        <path
          d={umriss(bx, balken, sx, stamm, balkenUnten, stammUnten, hatStamm)}
          fill={isHuman ? "var(--color-fg-3)" : "var(--accent)"}
        />

        {/*
          Beim gewachsenen T ist der Stamm das Neue und deshalb anders eingefärbt.
          Er wird in den Umriss GECLIPPT statt danebengelegt: So bleibt die Kehle
          erhalten und der Farbwechsel liest sich als Zone einer Form, nicht als
          zweites Bauteil.
        */}
        {isGrown && (
          <rect
            x={sx - 40}
            y={balkenUnten}
            width={stamm.w + 80}
            height={stamm.h}
            fill="var(--color-b4)"
            clipPath="url(#tshape-umriss)"
          />
        )}

        {/* Beim reinen Modell fehlt der Stamm — als Leerstelle, nicht als Fläche. */}
        {!hatStamm && (
          <rect
            x={sx}
            y={balkenUnten + 14}
            width={stamm.w}
            height={stamm.h - 14}
            rx="14"
            fill="none"
            stroke="var(--color-hair)"
            strokeWidth="3"
            strokeDasharray="14 12"
          />
        )}

        <text
          x={MITTE}
          y={balken.y + balken.h / 2 + 13}
          textAnchor="middle"
          fontFamily={DISPLAY}
          fontSize="40"
          fontWeight="700"
          fill="var(--color-stage)"
        >
          Allgemeinwissen
        </text>

        <text
          x={sx + stamm.w + 40}
          y={linie + 14}
          fontFamily={DISPLAY}
          fontSize="40"
          fontWeight="700"
          fill={hatStamm ? "var(--color-fg)" : "var(--color-fg-3)"}
        >
          Spezialwissen
        </text>

        {!hatStamm && (
          <text
            x={sx + stamm.w + 40}
            y={linie + 62}
            fontFamily={SANS}
            fontSize="30"
            fill="var(--color-fg-3)"
          >
            fehlt
          </text>
        )}

        {/* Die Wege, auf denen das Spezialwissen hereinkommt */}
        {isGrown &&
          m.capabilities?.map((cap, i) => (
            <g key={cap}>
              <circle
                cx={sx + stamm.w + 52}
                cy={linie + 66 + i * 54}
                r="7"
                fill="var(--color-b4)"
              />
              <text
                x={sx + stamm.w + 74}
                y={linie + 76 + i * 54}
                fontFamily={SANS}
                /*
                  25 statt 32: Diese Spalte beginnt rechts des Stamms, und der
                  Balken der breiten Fassung ist 1180 Punkte breit. Bei 32 liefen
                  „Memory — wächst mit jeder Korrektur" und „Tools und Memory —
                  woher kommen die Daten" rechts aus dem Bild.
                */
                fontSize="25"
                fill="var(--color-fg-2)"
              >
                {cap}
              </text>
            </g>
          ))}

        {/*
          Achsenhinweise. „Wie viele Themen" steht innerhalb des Feldes und nicht
          darüber: Oberhalb des Balkens wurde die Zeile abgeschnitten, sobald die
          Folie das Bild verkleinerte.
        */}
        <text
          x={bx}
          y={balken.y - 20}
          fontFamily={MONO}
          fontSize="22"
          letterSpacing="2.5"
          fill="var(--color-fg-3)"
        >
          WIE VIELE THEMEN
        </text>
        <text
          x={sx - 34}
          y={linie + 8}
          textAnchor="end"
          fontFamily={MONO}
          fontSize="22"
          letterSpacing="2.5"
          fill="var(--color-fg-3)"
        >
          WIE TIEF
        </text>
      </svg>
    </div>
  );
}

/**
 * Der Umriss des T als ein Pfad, im Uhrzeigersinn.
 *
 * `R` rundet die Aussenecken, `K` die beiden Innenecken — die Kehle. Ohne sie
 * stossen zwei Kanten rechtwinklig aufeinander, und das Auge liest zwei Teile.
 * Ohne Stamm bleibt es beim Balken allein.
 */
function umriss(
  bx: number,
  balken: { w: number; h: number; y: number },
  sx: number,
  stamm: { w: number; h: number },
  balkenUnten: number,
  stammUnten: number,
  hatStamm: boolean,
): string {
  const R = 16;
  const K = 26;
  const bx2 = bx + balken.w;
  const sx2 = sx + stamm.w;
  const by = balken.y;

  if (!hatStamm) {
    return [
      `M ${bx + R} ${by}`,
      `H ${bx2 - R}`,
      `A ${R} ${R} 0 0 1 ${bx2} ${by + R}`,
      `V ${balkenUnten - R}`,
      `A ${R} ${R} 0 0 1 ${bx2 - R} ${balkenUnten}`,
      `H ${bx + R}`,
      `A ${R} ${R} 0 0 1 ${bx} ${balkenUnten - R}`,
      `V ${by + R}`,
      `A ${R} ${R} 0 0 1 ${bx + R} ${by}`,
      "Z",
    ].join(" ");
  }

  return [
    `M ${bx + R} ${by}`,
    `H ${bx2 - R}`,
    `A ${R} ${R} 0 0 1 ${bx2} ${by + R}`,
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
    /* linke Kehle */
    `A ${K} ${K} 0 0 0 ${sx - K} ${balkenUnten}`,
    `H ${bx + R}`,
    `A ${R} ${R} 0 0 1 ${bx} ${balkenUnten - R}`,
    `V ${by + R}`,
    `A ${R} ${R} 0 0 1 ${bx + R} ${by}`,
    "Z",
  ].join(" ");
}
