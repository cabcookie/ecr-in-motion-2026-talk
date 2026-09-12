import type {
  DiffMock,
  ListMock,
  QuoteMock,
  StatementMock,
  TimelineMock,
  TweetsMock,
} from "@/slides/types";
import { Rich } from "./AppWindow";

/** Mocks ohne Fensterrahmen — sie stehen direkt auf der Bühne. */

export function TimelineView({ m }: { m: TimelineMock }) {
  return (
    <div className="plain">
      {m.rows.map(([yr, ev]) => (
        <div className="tl-row" key={yr}>
          <span className="yr">{yr}</span>
          <Rich className="ev" html={ev} />
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
  return (
    <div className="plain">
      {m.items.map(([term, desc], i) => (
        <div className={`li-row${terse ? " terse" : ""}`} key={i}>
          <span className="n">{m.ordered ? String(i + 1).padStart(2, "0") : "—"}</span>
          <span className="t">
            <b>{term}</b>
            {!terse && desc ? ` — ${desc}` : ""}
          </span>
        </div>
      ))}
    </div>
  );
}

export function TweetsView({ m }: { m: TweetsMock }) {
  return (
    <div className="tweets">
      {m.items.map((t, i) => (
        <div className={`tw${t.reply ? " reply" : ""}`} key={i}>
          <span className="handle">{t.handle}</span>
          <p>{t.text}</p>
        </div>
      ))}
    </div>
  );
}

export function QuoteView({ m }: { m: QuoteMock }) {
  return (
    <blockquote className="quote">
      <p>„{m.text}“</p>
      <cite>{m.cite}</cite>
    </blockquote>
  );
}

export function StatementView({ m }: { m: StatementMock }) {
  return (
    <div className="statement">
      <p>{m.text}</p>
      {m.after && <p className="after">{m.after}</p>}
    </div>
  );
}

export function DiffView({ m }: { m: DiffMock }) {
  return (
    <div className="diff">
      <div className="diff-col before">
        <h4>{m.before.h}</h4>
        <p>{m.before.p}</p>
      </div>
      <div className="diff-col after">
        <h4>{m.after.h}</h4>
        <p>{m.after.p}</p>
      </div>
    </div>
  );
}
