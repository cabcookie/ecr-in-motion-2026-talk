import type { ArchitekturMock } from "@/slides/types";

/**
 * Das vereinfachte Architekturbild.
 *
 * Drei Stufen, damit es erzählbar bleibt statt auf einmal dazustehen:
 *
 *   0  Die beiden Eingänge und der Agent — wer klopft an, und wer antwortet
 *   1  Seine Werkzeuge — womit er antwortet, und was ihn anhalten lässt
 *   2  Die Systeme dahinter, und dass sie simuliert sind
 *
 * Was das Bild tragen muss: dass es EIN Agent ist. Die beiden Eingänge laufen
 * zusammen, und erst danach trennt sich, womit er antworten darf. Wer hier
 * zwei Kästen nebeneinander malt, hat die Aussage schon verloren.
 *
 * Die Symbole fallen von links nach rechts ein, groß und unscharf zuerst, dann
 * scharf an ihren Platz — als hielte man eine Kamera mit sehr offener Blende
 * über ein Blatt Papier. Die Animation startet erst, wenn das Panel wirklich
 * sichtbar ist: `aria-hidden="false"` setzt sie in Gang (siehe SectionView).
 */
export function ArchitekturView({ m, step = 0 }: { m: ArchitekturMock; step?: number }) {
  return (
    <div className="flex w-full justify-center">
      <svg viewBox="0 0 1200 660" className="w-full max-w-[1200px]" role="img" aria-label={m.alt}>
        <defs>
          <marker
            id="arch-pfeil"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--color-fg-3)" />
          </marker>
          <style>{CSS}</style>
        </defs>

        {ELEMENTE.filter((e) => e.stufe <= step).map((e, i) => (
          <g
            key={e.id}
            className="arch-el"
            /*
              Der Versatz richtet sich nach der x-Position, nicht nach der
              Reihenfolge im Quelltext: Das Auge liest das Blatt von links nach
              rechts, und die Symbole sollen in genau dieser Folge landen.
            */
            style={{ animationDelay: `${ordnung(e) * 85}ms` }}
          >
            {zeichne(e, i)}
          </g>
        ))}

        <text
          x={600}
          y={648}
          textAnchor="middle"
          fill="var(--color-fg-3)"
          className="arch-el"
          style={{ fontSize: 19, animationDelay: `${ELEMENTE.length * 85}ms` }}
        >
          Die Systeme sind simuliert. Die Arbeit des Agenten ist es nicht.
        </text>
      </svg>
    </div>
  );
}

/*
  Die Kamera über dem Blatt.

  `scale(2.4)` und `blur(14px)` sind der Moment, in dem das Symbol noch weit
  über dem Papier schwebt; am Ende sitzt es scharf und in Originalgröße. Die
  Unschärfe verschwindet etwas früher als die Bewegung endet — sonst wirkt das
  Scharfstellen wie ein Schnitt statt wie eine Linse.

  `transform-box: fill-box` ist Pflicht: Ohne das bezieht sich der Ursprung auf
  das ganze SVG, und die Symbole fliegen aus der Ecke statt an Ort und Stelle
  zu landen.
*/
const CSS = `
.arch-el {
  transform-box: fill-box;
  transform-origin: center;
  animation: arch-drop 760ms cubic-bezier(.2,.8,.25,1) backwards;
  animation-play-state: paused;
}
[aria-hidden="false"] .arch-el { animation-play-state: running; }
@keyframes arch-drop {
  0%   { opacity: 0; filter: blur(14px); transform: scale(2.4); }
  55%  { opacity: 1; filter: blur(4px);  }
  100% { opacity: 1; filter: blur(0);    transform: scale(1); }
}
@media (prefers-reduced-motion: reduce) {
  .arch-el { animation: none; }
}
`;

/* --------------------------------------------------------------- Das Blatt */

type Element =
  | { id: string; stufe: number; art: "eingang"; x: number; y: number; w: number; farbe: string; titel: string; unter: string }
  | { id: string; stufe: number; art: "station"; x: number; y: number; w: number; text: string }
  | { id: string; stufe: number; art: "agent"; x: number; y: number; w: number }
  | { id: string; stufe: number; art: "werkzeug"; x: number; y: number; w: number; titel: string; unter: string }
  | { id: string; stufe: number; art: "systeme"; x: number; y: number; w: number }
  | { id: string; stufe: number; art: "pfeil"; x: number; y: number; x2: number; y2: number }
  | { id: string; stufe: number; art: "weg"; x: number; y: number; punkte: string }
  | { id: string; stufe: number; art: "notiz"; x: number; y: number; text: string; farbe: string };

const AGENT_Y = 300;
const WERKZEUG_Y = 430;
const SYSTEME_Y = 556;

const ELEMENTE: Element[] = [
  /* Stufe 0 — die beiden Eingänge laufen auf einen Agenten zu */
  { id: "mail", stufe: 0, art: "eingang", x: 40, y: 24, w: 340, farbe: "var(--color-sys-mail)", titel: "E-Mail vom Hersteller", unter: "ecr2026@carstenbkoch.de" },
  { id: "ses", stufe: 0, art: "station", x: 62, y: 130, w: 296, text: "SES nimmt an · Konto A" },
  { id: "s3", stufe: 0, art: "station", x: 62, y: 184, w: 296, text: "S3 legt ab, SNS meldet" },
  { id: "lambda", stufe: 0, art: "station", x: 62, y: 238, w: 296, text: "Lambda liest die Rohmail" },
  { id: "chat", stufe: 0, art: "eingang", x: 820, y: 24, w: 340, farbe: "var(--color-sys-chat)", titel: "Chat auf dem Handy", unter: "Lisa fragt ihren Assistenten" },

  { id: "p-mail1", stufe: 0, art: "pfeil", x: 210, y: 92, x2: 210, y2: 130 },
  { id: "p-mail2", stufe: 0, art: "pfeil", x: 210, y: 166, x2: 210, y2: 184 },
  { id: "p-mail3", stufe: 0, art: "pfeil", x: 210, y: 220, x2: 210, y2: 238 },
  { id: "p-mail4", stufe: 0, art: "pfeil", x: 210, y: 274, x2: 380, y2: AGENT_Y + 30 },
  { id: "p-chat", stufe: 0, art: "pfeil", x: 990, y: 92, x2: 820, y2: AGENT_Y + 30 },

  { id: "agent", stufe: 0, art: "agent", x: 390, y: AGENT_Y, w: 420 },

  /* Stufe 1 — womit er antworten darf, und was ihn anhält */
  /* Jeder Pfeil endet auf der MITTE seines Kastens, nicht irgendwo dazwischen. */
  { id: "p-w1", stufe: 1, art: "pfeil", x: 500, y: AGENT_Y + 104, x2: 310, y2: WERKZEUG_Y - 2 },
  { id: "p-w2", stufe: 1, art: "pfeil", x: 600, y: AGENT_Y + 104, x2: 600, y2: WERKZEUG_Y - 2 },
  { id: "p-w3", stufe: 1, art: "pfeil", x: 700, y: AGENT_Y + 104, x2: 900, y2: WERKZEUG_Y - 2 },
  { id: "w-mail", stufe: 1, art: "werkzeug", x: 170, y: WERKZEUG_Y, w: 280, titel: "antworte_per_mail", unter: "nur im Mailweg" },
  { id: "w-chat", stufe: 1, art: "werkzeug", x: 470, y: WERKZEUG_Y, w: 260, titel: "antworte_im_chat", unter: "nur im Chat" },
  { id: "w-lisa", stufe: 1, art: "werkzeug", x: 750, y: WERKZEUG_Y, w: 300, titel: "frage_lisa", unter: "hält an, bis geantwortet ist" },
  { id: "n-operator", stufe: 1, art: "notiz", x: 1050, y: WERKZEUG_Y - 14, text: "der Mensch antwortet live  ↓", farbe: "var(--color-b2)" },

  /* Stufe 2 — die Systeme, in denen er nachschlägt */
  /*
    Rechtwinklig am linken Rand entlang statt quer durchs Bild: Eine gerade
    Linie vom Agenten zu den Systemen würde `antworte_per_mail` durchkreuzen,
    und ein Pfeil, der durch einen Kasten läuft, behauptet eine Verbindung, die
    es nicht gibt.
  */
  { id: "p-sys", stufe: 2, art: "weg", x: 100, y: AGENT_Y + 52, punkte: `390,${AGENT_Y + 52} 100,${AGENT_Y + 52} 100,${SYSTEME_Y - 4}` },
  { id: "systeme", stufe: 2, art: "systeme", x: 40, y: SYSTEME_Y, w: 1120 },
];

/** Reihenfolge des Einfallens: links vor rechts, bei Gleichstand oben vor unten. */
function ordnung(e: Element): number {
  const sortiert = [...ELEMENTE].sort((a, b) => a.x - b.x || a.y - b.y);
  return sortiert.indexOf(e);
}

function zeichne(e: Element, i: number) {
  switch (e.art) {
    case "eingang":
      return (
        <>
          <rect x={e.x} y={e.y} width={e.w} height={68} rx={12} fill={e.farbe} opacity={0.22} />
          <rect x={e.x} y={e.y} width={e.w} height={68} rx={12} fill="none" stroke={e.farbe} strokeWidth={2} />
          <text x={e.x + e.w / 2} y={e.y + 30} textAnchor="middle" className="fill-fg" style={{ fontSize: 23, fontWeight: 600 }}>
            {e.titel}
          </text>
          <text x={e.x + e.w / 2} y={e.y + 54} textAnchor="middle" fill="var(--color-fg-3)" style={{ fontSize: 17 }}>
            {e.unter}
          </text>
        </>
      );
    case "station":
      return (
        <>
          <rect x={e.x} y={e.y} width={e.w} height={36} rx={8} fill="var(--color-stage-3)" stroke="var(--color-hair)" />
          <text x={e.x + e.w / 2} y={e.y + 24} textAnchor="middle" fill="var(--color-fg-2)" style={{ fontSize: 17 }}>
            {e.text}
          </text>
        </>
      );
    case "agent":
      return (
        <>
          <rect x={e.x} y={e.y} width={e.w} height={104} rx={14} fill="var(--color-sys-agent)" opacity={0.2} />
          <rect x={e.x} y={e.y} width={e.w} height={104} rx={14} fill="none" stroke="var(--color-sys-agent)" strokeWidth={2.5} />
          <text x={e.x + e.w / 2} y={e.y + 40} textAnchor="middle" className="fill-fg" style={{ fontSize: 30, fontWeight: 700 }}>
            Ein Agent
          </text>
          <text x={e.x + e.w / 2} y={e.y + 68} textAnchor="middle" fill="var(--color-fg-2)" style={{ fontSize: 20 }}>
            Claude Opus 4.8 · Bedrock AgentCore
          </text>
          <text x={e.x + e.w / 2} y={e.y + 90} textAnchor="middle" fill="var(--color-fg-3)" style={{ fontSize: 17 }}>
            ein Systemprompt, eine Konfiguration
          </text>
        </>
      );
    case "werkzeug":
      return (
        <>
          <rect x={e.x} y={e.y} width={e.w} height={68} rx={10} fill="var(--color-stage-2)" stroke="var(--color-hair)" />
          <text x={e.x + e.w / 2} y={e.y + 30} textAnchor="middle" fill="var(--color-b3)" style={{ fontSize: 19, fontFamily: "ui-monospace, monospace" }}>
            {e.titel}
          </text>
          <text x={e.x + e.w / 2} y={e.y + 53} textAnchor="middle" fill="var(--color-fg-3)" style={{ fontSize: 15 }}>
            {e.unter}
          </text>
        </>
      );
    case "systeme":
      return (
        <>
          <rect x={e.x} y={e.y} width={e.w} height={72} rx={12} fill="var(--color-stage-3)" stroke="var(--color-hair)" />
          <text x={e.x + 24} y={e.y + 29} fill="var(--color-fg-2)" style={{ fontSize: 18, fontWeight: 600 }}>
            Simulierte Systeme
          </text>
          {SYSTEME.map((name, k) => (
            <text key={name} x={e.x + 30 + k * 182} y={e.y + 56} fill="var(--color-fg-3)" style={{ fontSize: 17 }}>
              {name}
            </text>
          ))}
        </>
      );
    case "pfeil":
      return (
        <line
          x1={e.x}
          y1={e.y}
          x2={e.x2}
          y2={e.y2}
          stroke="var(--color-fg-3)"
          strokeWidth={2}
          markerEnd="url(#arch-pfeil)"
        />
      );
    case "weg":
      return (
        <polyline
          points={e.punkte}
          fill="none"
          stroke="var(--color-fg-3)"
          strokeWidth={2}
          markerEnd="url(#arch-pfeil)"
        />
      );
    case "notiz":
      return (
        <text x={e.x} y={e.y} textAnchor="end" fill={e.farbe} style={{ fontSize: 16 }} key={i}>
          {e.text}
        </text>
      );
  }
}

const SYSTEME = [
  "Warenwirtschaft",
  "Marktdaten",
  "Regalplanung",
  "Kalkulation",
  "Aktionskalender",
  "Listung",
];
