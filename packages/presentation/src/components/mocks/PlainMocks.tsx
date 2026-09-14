import type {
  DiffMock,
  ListMock,
  QuoteMock,
  StatementMock,
  TimelineMock,
  TweetsMock,
} from "@/slides/types";
import { Rich } from "./AppWindow";

/* Mocks ohne Fensterrahmen — sie stehen direkt auf der dunklen Bühne. */

const ROW = "border-b border-hair last:border-b-0";
const STAGE_RICH = "[--rich-strong:var(--color-fg)]";

export function TimelineView({ m }: { m: TimelineMock }) {
  return (
    <div className={`grid w-full ${STAGE_RICH}`}>
      {m.rows.map(([yr, ev]) => (
        <div
          key={yr}
          className={`grid grid-cols-[190px_1fr] items-baseline gap-[40px] py-[26px] ${ROW}`}
        >
          <span className="font-mono text-[42px] font-medium tabular-nums text-[color:var(--accent)]">
            {yr}
          </span>
          <Rich className="text-[38px] leading-[1.3] text-fg-2" html={ev} />
        </div>
      ))}
    </div>
  );
}

/**
 * `terse` zeigt nur die Begriffe ohne Erläuterung — für lange Listen, bei denen
 * die Menge die Aussage ist und die Details gesprochen werden. Die Operator-View
 * bekommt später denselben Datensatz vollständig.
 */
export function ListView({ m, terse = false }: { m: ListMock; terse?: boolean }) {
  // Zweispaltig und spaltenweise gefüllt: 01–05 links, 06–09 rechts.
  // Zeilenweise Füllung würde die Reihenfolge zerreißen.
  const cols = terse ? "grid-flow-col grid-cols-2 grid-rows-5 gap-x-[80px]" : "";
  return (
    <div className={`grid w-full ${cols}`}>
      {m.items.map(([term, desc], i) => (
        <div
          key={i}
          className={`grid grid-cols-[84px_1fr] items-baseline gap-[30px] ${
            terse ? "py-[24px]" : "py-[22px]"
          } ${ROW}`}
        >
          <span className="font-mono text-[28px] tabular-nums text-[color:var(--accent)]">
            {m.ordered ? String(i + 1).padStart(2, "0") : "—"}
          </span>
          <span className={`${terse ? "text-[36px]" : "text-[34px]"} leading-[1.35] text-fg-2`}>
            <b className="font-bold text-fg">{term}</b>
            {!terse && desc ? ` — ${desc}` : ""}
          </span>
        </div>
      ))}
    </div>
  );
}

export function TweetsView({ m }: { m: TweetsMock }) {
  return (
    <div className="grid w-full gap-[26px]">
      {m.items.map((t, i) => (
        <div
          key={i}
          className={`rounded-[10px] border border-hair bg-stage-2 px-[34px] py-[30px] ${
            t.reply ? "ml-[90px] border-l-[5px] border-l-[color:var(--accent)]" : ""
          }`}
        >
          <span
            className={`mb-[16px] block font-mono text-[23px] ${
              t.reply ? "text-[color:var(--accent)]" : "text-fg-3"
            }`}
          >
            {t.handle}
          </span>
          <p className="m-0 text-[34px] leading-[1.4] text-fg-2">{t.text}</p>
        </div>
      ))}
    </div>
  );
}

export function QuoteView({ m }: { m: QuoteMock }) {
  return (
    <blockquote className="m-0 max-w-[1400px] text-center">
      <p className="m-0 font-display text-[62px] leading-[1.24] font-medium text-balance text-fg italic">
        „{m.text}“
      </p>
      <cite className="mt-[34px] block font-mono text-[26px] tracking-[0.11em] text-fg-3 uppercase not-italic">
        {m.cite}
      </cite>
    </blockquote>
  );
}

export function StatementView({ m }: { m: StatementMock }) {
  return (
    <div className="text-center">
      <p className="m-0 font-display text-[76px] leading-[1.1] font-extrabold tracking-[-0.022em] text-balance text-[color:var(--accent)]">
        {m.text}
      </p>
      {m.after && (
        <p className="m-0 mt-[30px] font-sans text-[34px] leading-[1.4] font-normal text-fg-3">
          {m.after}
        </p>
      )}
    </div>
  );
}

export function DiffView({ m }: { m: DiffMock }) {
  const col = "rounded-[10px] border border-hair bg-stage-2 px-[36px] py-[34px]";
  const head = "m-0 mb-[20px] font-mono text-[23px] font-medium tracking-[0.11em] uppercase";
  const body = "m-0 text-[32px] leading-[1.42] text-fg-2";

  /** Die Zahl trägt die Folie — sie muss aus der letzten Reihe lesbar sein. */
  const side = (s: DiffMock["before"], tone: string) => (
    <div className={col}>
      <h4 className={`${head} ${tone}`}>{s.h}</h4>
      {s.n && (
        <p
          className={`m-0 mb-[6px] font-display text-[96px] leading-none font-extrabold tracking-tight tabular-nums ${tone}`}
        >
          {s.n}
        </p>
      )}
      {s.sub && (
        <p className="m-0 mb-[22px] font-mono text-[24px] tracking-[0.06em] text-fg-3">{s.sub}</p>
      )}
      <p className={body}>{s.p}</p>
    </div>
  );

  return (
    <div className="grid w-full gap-[26px]">
      {/* Der teure Weg in der Warnfarbe, der bessere in Grün — mit einer großen
          Zahl darunter liest die umgekehrte Zuordnung sich sofort falsch. */}
      <div className="grid grid-cols-2 gap-[32px]">
        {side(m.before, "text-b1")}
        {side(m.after, "text-b4")}
      </div>
      {m.foot && (
        <p className="m-0 text-center font-mono text-[25px] leading-[1.5] tracking-[0.04em] text-fg-3">
          {m.foot}
        </p>
      )}
    </div>
  );
}
