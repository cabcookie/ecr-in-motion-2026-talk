import type { TShapeMock } from "@/slides/types";

const MONO = "Amazon Ember Mono, ui-monospace, monospace";
const SANS = "Amazon Ember Display, Helvetica Neue, Arial, sans-serif";
const DISPLAY = "Amazon Ember Display, Helvetica Neue, Arial, sans-serif";

/**
 * Wissen als T: ein breiter Balken für das Allgemeinwissen, ein tiefer Stamm
 * für das Spezialwissen.
 *
 * Die Beschriftung steht bewusst waagerecht neben den Formen statt gedreht
 * darin — gedrehte Schrift ist das, was solche Diagramme unlesbar macht.
 */
export function TShapeView({ m }: { m: TShapeMock }) {
  const isHuman = m.variant === "human";
  const isGrown = m.variant === "grown";

  // Der Balken des Modells ist breiter UND dicker: mehr Themen, mehr Tiefe je Thema.
  const bar = isHuman
    ? { x: 210, y: 96, w: 760, h: 104 }
    : { x: 40, y: 70, w: 1100, h: 156 };

  const stem = {
    x: bar.x + bar.w / 2 - 62,
    y: bar.y + bar.h,
    w: 124,
    h: isHuman ? 300 : 268,
  };

  const stemVisible = isHuman || isGrown;

  return (
    <div className="w-full">
      <svg viewBox="0 0 1360 600" role="img" aria-label={m.alt}>
        {/* Allgemeinwissen */}
        <rect
          x={bar.x} y={bar.y} width={bar.w} height={bar.h} rx="14"
          fill={isHuman ? "var(--color-fg-3)" : "var(--accent)"}
        />
        <text
          x={bar.x + 34} y={bar.y + bar.h / 2 + 13}
          fontFamily={DISPLAY} fontSize="40" fontWeight="700"
          fill="var(--color-stage)"
        >
          Allgemeinwissen
        </text>

        {/* Spezialwissen — beim reinen Modell nur als Leerstelle */}
        {stemVisible ? (
          <rect
            x={stem.x} y={stem.y} width={stem.w} height={stem.h} rx="14"
            fill={isHuman ? "var(--color-fg-3)" : "var(--color-b4)"}
          />
        ) : (
          <rect
            x={stem.x} y={stem.y} width={stem.w} height={stem.h} rx="14"
            fill="none" stroke="var(--color-hair)" strokeWidth="3" strokeDasharray="14 12"
          />
        )}

        <text
          x={stem.x + stem.w + 40} y={stem.y + 64}
          fontFamily={DISPLAY} fontSize="40" fontWeight="700"
          fill={stemVisible ? "var(--color-fg)" : "var(--color-fg-3)"}
        >
          Spezialwissen
        </text>

        {!stemVisible && (
          <text
            x={stem.x + stem.w + 40} y={stem.y + 116}
            fontFamily={SANS} fontSize="30" fill="var(--color-fg-3)"
          >
            fehlt
          </text>
        )}

        {/* Die drei Wege, auf denen das Spezialwissen hereinkommt */}
        {isGrown &&
          m.capabilities?.map((cap, i) => (
            <g key={cap}>
              <circle
                cx={stem.x + stem.w + 62} cy={stem.y + 128 + i * 62} r="7"
                fill="var(--color-b4)"
              />
              <text
                x={stem.x + stem.w + 90} y={stem.y + 138 + i * 62}
                fontFamily={SANS} fontSize="32" fill="var(--color-fg-2)"
              >
                {cap}
              </text>
            </g>
          ))}

        {/* Achsenhinweise, damit klar ist, was breit und was tief bedeutet */}
        <text
          x={bar.x} y={bar.y - 22}
          fontFamily={MONO} fontSize="22" letterSpacing="2.5" fill="var(--color-fg-3)"
        >
          WIE VIELE THEMEN
        </text>
        <text
          x={stem.x - 34} y={stem.y + stem.h / 2 + 8} textAnchor="end"
          fontFamily={MONO} fontSize="22" letterSpacing="2.5" fill="var(--color-fg-3)"
        >
          WIE TIEF
        </text>
      </svg>

      {m.caption && (
        <p className="mx-auto mt-[18px] max-w-[90ch] text-center font-mono text-[23px] leading-[1.5] text-fg-3">
          {m.caption}
        </p>
      )}
    </div>
  );
}
