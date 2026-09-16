import type { ChartMock } from "@/slides/types";

const CAP =
  "mx-auto mt-[26px] max-w-[100ch] text-center font-mono text-[23px] leading-[1.5] text-fg-3";

const MONO = "Amazon Ember Mono, ui-monospace, monospace";
const SANS = "Amazon Ember Display, Helvetica Neue, Arial, sans-serif";

/*
  US-Landwirtschaft: nur die beiden belegten Eckwerte, kein erfundener Verlauf.

  Ohne Achsenbeschriftung und ohne Bildunterschrift — beides wird gesprochen.
  Zwei Balken mit 41 und 2 brauchen keine Erklaerung auf der Leinwand; wer sie
  dort hinschreibt, nimmt dem Satz des Vortragenden die Arbeit ab und dem Bild
  die Ruhe. Der aria-label traegt die Angabe weiterhin fuer alle, die das Bild
  nicht sehen.
*/
function Agriculture() {
  const base = 470;
  const maxH = 350;
  const bars = [
    { label: "1900", val: 41, x: 330 },
    { label: "2000", val: 2, x: 810 },
  ];
  return (
    <>
      <svg viewBox="0 0 1360 560" role="img"
        aria-label="Anteil der Landwirtschaft an den US-Beschäftigten: 41 Prozent im Jahr 1900, 2 Prozent im Jahr 2000">
        <line x1="0" y1={base} x2="1360" y2={base} stroke="var(--color-hair)" strokeWidth="2" />
        {bars.map((b) => {
          const h = Math.max(8, (b.val / 41) * maxH);
          return (
            <g key={b.label}>
              <rect x={b.x} y={base - h} width="220" height={h} fill="var(--accent)" rx="3" />
              <text x={b.x + 110} y={base - h - 28} textAnchor="middle" fontFamily={MONO}
                fontSize="64" fontWeight="600" fill="var(--color-fg)">
                {b.val} %
              </text>
              <text x={b.x + 110} y={base + 48} textAnchor="middle" fontFamily={MONO}
                fontSize="30" fill="var(--color-fg-3)">
                {b.label}
              </text>
            </g>
          );
        })}
      </svg>
    </>
  );
}

/**
 * Deutsche Arbeitslosenquote an Ankerpunkten.
 *
 * Bewusst keine durchgezogene Zeitreihe: über 100 Jahre brechen Gebiet
 * (Deutsches Reich, früheres Bundesgebiet, Gesamtdeutschland) und Definition
 * mehrfach. Die Ankerpunkte tragen das Argument — die Ausschläge kamen von
 * Kriegen und Krisen, nicht von Technologie.
 */
function Unemployment() {
  const points = [
    { year: "1932", value: 30.0, label: "Weltwirtschaftskrise" },
    { year: "1950", value: 11.0, label: "Nachkriegszeit" },
    { year: "1960", value: 1.3, label: "Wirtschaftswunder" },
    { year: "1975", value: 4.7, label: "Ölkrise" },
    { year: "2005", value: 11.7, label: "nach der Wiedervereinigung" },
    { year: "heute", value: 6.0, label: "" },
  ];
  const x0 = 60;
  const x1 = 1320;
  const base = 400;
  const top = 90;
  const maxV = 32;
  const px = (i: number) => x0 + (i / (points.length - 1)) * (x1 - x0);
  const py = (v: number) => base - (v / maxV) * (base - top);
  const path = points.map((p, i) => `${i ? "L" : "M"}${px(i)},${py(p.value)}`).join(" ");

  return (
    <>
      <svg viewBox="0 0 1360 500" role="img"
        aria-label="Deutsche Arbeitslosenquote an Ankerpunkten: 1932 rund 30 Prozent, 1950 11 Prozent, 1960 1,3 Prozent, 1975 4,7 Prozent, 2005 11,7 Prozent, heute rund 6 Prozent">
        <text x="0" y="34" fontFamily={MONO} fontSize="24" letterSpacing="3" fill="var(--color-fg-3)">
          ARBEITSLOSENQUOTE DEUTSCHLAND
        </text>
        <line x1="0" y1={base} x2="1360" y2={base} stroke="var(--color-hair)" strokeWidth="2" />
        <path d={path} fill="none" stroke="var(--accent)" strokeWidth="4"
          strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => (
          <g key={p.year}>
            <circle cx={px(i)} cy={py(p.value)} r="10" fill="var(--accent)" />
            <text x={px(i)} y={py(p.value) - 26} textAnchor="middle" fontFamily={MONO}
              fontSize="32" fontWeight="600" fill="var(--color-fg)">
              {String(p.value).replace(".", ",")} %
            </text>
            <text x={px(i)} y={base + 42} textAnchor="middle" fontFamily={MONO}
              fontSize="28" fill="var(--color-fg-2)">
              {p.year}
            </text>
            {p.label && (
              <text x={px(i)} y={base + 76} textAnchor="middle" fontFamily={SANS}
                fontSize="22" fill="var(--color-fg-3)">
                {p.label}
              </text>
            )}
          </g>
        ))}
      </svg>
      <p className={CAP}>
        Ankerpunkte statt durchgezogener Reihe — über 100 Jahre brechen Gebiet und Definition mehrfach.
      </p>
    </>
  );
}

/** Stanford SIEPR, Juli 2026 — der kontraintuitive Befund. */
function Exposure() {
  const x0 = 560;
  const maxW = 620;
  const rows = [
    { label: "Stark KI-exponiert", v: 0.77, fill: "var(--accent)" },
    { label: "Kaum KI-exponiert", v: 0.85, fill: "var(--color-fg-3)" },
  ];
  return (
    <>
      <svg viewBox="0 0 1360 400" role="img"
        aria-label="Anstieg der Arbeitslosigkeit seit 2022 in Prozentpunkten: stark KI-exponierte Berufe plus 0,77, kaum KI-exponierte Berufe plus 0,85">
        <text x="0" y="40" fontFamily={MONO} fontSize="24" letterSpacing="3" fill="var(--color-fg-3)">
          ANSTIEG DER ARBEITSLOSIGKEIT SEIT 2022, IN PROZENTPUNKTEN
        </text>
        <line x1={x0} y1="110" x2={x0} y2="330" stroke="var(--color-hair)" strokeWidth="2" />
        {rows.map((r, i) => {
          const y = 130 + i * 110;
          const w = (r.v / 1.0) * maxW;
          return (
            <g key={r.label}>
              <text x={x0 - 32} y={y + 48} textAnchor="end" fontFamily={SANS} fontSize="34"
                fill="var(--color-fg-2)">
                {r.label}
              </text>
              <rect x={x0} y={y} width={w} height="70" fill={r.fill} rx="3" />
              <text x={x0 + w + 26} y={y + 50} fontFamily={MONO} fontSize="44" fontWeight="600"
                fill="var(--color-fg)">
                +{String(r.v).replace(".", ",")}
              </text>
            </g>
          );
        })}
      </svg>
      <p className={CAP}>
        Die exponierte Gruppe schnitt leicht besser ab. Ausnahme: Berufseinsteiger, 5,6 % (+1,6 Punkte in drei Jahren).
      </p>
    </>
  );
}

const CHARTS = { agriculture: Agriculture, unemployment: Unemployment, exposure: Exposure };

export function ChartView({ m }: { m: ChartMock }) {
  const C = CHARTS[m.which];
  return (
    <div className="flex w-full justify-center [&_svg]:h-auto [&_svg]:w-full [&_svg]:max-w-[1360px]">
      <div className="w-full">
        <C />
      </div>
    </div>
  );
}
