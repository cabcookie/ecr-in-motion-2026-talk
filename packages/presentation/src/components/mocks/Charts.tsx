import type { ChartMock } from "@/slides/types";

const MONO = "IBM Plex Mono, monospace";
const SANS = "IBM Plex Sans, sans-serif";

/** US-Landwirtschaft: nur die beiden belegten Eckwerte, kein erfundener Verlauf. */
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
        <text x="0" y="40" fontFamily={MONO} fontSize="24" letterSpacing="3" fill="var(--fg-3)">
          ANTEIL AN DEN US-BESCHÄFTIGTEN
        </text>
        <line x1="0" y1={base} x2="1360" y2={base} stroke="var(--hair)" strokeWidth="2" />
        {bars.map((b) => {
          const h = Math.max(8, (b.val / 41) * maxH);
          return (
            <g key={b.label}>
              <rect x={b.x} y={base - h} width="220" height={h} fill="var(--accent)" rx="3" />
              <text x={b.x + 110} y={base - h - 28} textAnchor="middle" fontFamily={MONO}
                fontSize="64" fontWeight="600" fill="var(--fg)">
                {b.val} %
              </text>
              <text x={b.x + 110} y={base + 48} textAnchor="middle" fontFamily={MONO}
                fontSize="30" fill="var(--fg-3)">
                {b.label}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="chart-cap">
        Zwei Belegwerte. Der Verlauf dazwischen ist bewusst nicht gezeichnet.
      </p>
    </>
  );
}

/** Spannweite der deutschen Arbeitslosenquote — Platzhalter, bis die Zeitreihe da ist. */
function Unemployment() {
  const x0 = 120;
  const x1 = 1240;
  const y = 210;
  const px = (v: number) => x0 + (v / 30) * (x1 - x0);
  const marks = [
    { v: 3.71, label: "HEUTE", sub: "3,71 %", up: true, color: "var(--accent)" },
    { v: 6.03, label: "LANGZEITSCHNITT", sub: "6,03 %", up: false, color: "var(--fg-3)" },
  ];
  return (
    <>
      <svg viewBox="0 0 1360 420" role="img"
        aria-label="Spannweite der deutschen Arbeitslosenquote über 100 Jahre: Minimum 0,4 Prozent, Maximum 30 Prozent, Langzeitschnitt 6,03 Prozent, heute 3,71 Prozent">
        <text x="0" y="40" fontFamily={MONO} fontSize="24" letterSpacing="3" fill="var(--fg-3)">
          SPANNWEITE 1925–2025 · DEUTSCHLAND
        </text>
        <rect x={x0} y={y - 24} width={x1 - x0} height="48" fill="var(--stage-3)" rx="6" />
        <text x={x0} y={y + 76} textAnchor="middle" fontFamily={MONO} fontSize="26" fill="var(--fg-3)">
          0,4 %
        </text>
        <text x={x1} y={y + 76} textAnchor="middle" fontFamily={MONO} fontSize="26" fill="var(--fg-3)">
          30 %
        </text>
        {marks.map((m) => {
          const X = px(m.v);
          const ty = m.up ? y - 58 : y + 96;
          return (
            <g key={m.label}>
              <line x1={X} y1={y - 44} x2={X} y2={y + 44} stroke={m.color} strokeWidth="5" />
              <text x={X} y={ty} textAnchor="middle" fontFamily={MONO} fontSize="40"
                fontWeight="600" fill={m.color}>
                {m.sub}
              </text>
              <text x={X} y={m.up ? ty - 34 : ty + 34} textAnchor="middle" fontFamily={MONO}
                fontSize="22" letterSpacing="2" fill="var(--fg-3)">
                {m.label}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="chart-cap">
        Platzhalter: nur die vier belegten Eckwerte. Die Zeitreihe fehlt noch.
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
    { label: "Kaum KI-exponiert", v: 0.85, fill: "var(--fg-3)" },
  ];
  return (
    <>
      <svg viewBox="0 0 1360 400" role="img"
        aria-label="Anstieg der Arbeitslosigkeit seit 2022 in Prozentpunkten: stark KI-exponierte Berufe plus 0,77, kaum KI-exponierte Berufe plus 0,85">
        <text x="0" y="40" fontFamily={MONO} fontSize="24" letterSpacing="3" fill="var(--fg-3)">
          ANSTIEG DER ARBEITSLOSIGKEIT SEIT 2022, IN PROZENTPUNKTEN
        </text>
        <line x1={x0} y1="110" x2={x0} y2="330" stroke="var(--hair)" strokeWidth="2" />
        {rows.map((r, i) => {
          const y = 130 + i * 110;
          const w = (r.v / 1.0) * maxW;
          return (
            <g key={r.label}>
              <text x={x0 - 32} y={y + 48} textAnchor="end" fontFamily={SANS} fontSize="34"
                fill="var(--fg-2)">
                {r.label}
              </text>
              <rect x={x0} y={y} width={w} height="70" fill={r.fill} rx="3" />
              <text x={x0 + w + 26} y={y + 50} fontFamily={MONO} fontSize="44" fontWeight="600"
                fill="var(--fg)">
                +{String(r.v).replace(".", ",")}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="chart-cap">
        Die exponierte Gruppe schnitt leicht besser ab. Ausnahme: Berufseinsteiger, 5,6 % (+1,6 Punkte in drei Jahren).
      </p>
    </>
  );
}

const CHARTS = { agriculture: Agriculture, unemployment: Unemployment, exposure: Exposure };

export function ChartView({ m }: { m: ChartMock }) {
  const C = CHARTS[m.which];
  return (
    <div className="chart">
      <div style={{ width: "100%" }}>
        <C />
      </div>
    </div>
  );
}
