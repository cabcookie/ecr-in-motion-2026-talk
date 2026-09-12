import type { MailMock as Mail } from "@/slides/types";
import { AppWindow } from "./AppWindow";

export function MailMockView({ m }: { m: Mail }) {
  return (
    <AppWindow label={m.app} pip="var(--sys-mail)">
      <div className="mail-hdr">
        <h3 className="mail-subject">{m.subject}</h3>
        <div className="mail-line">
          <span>
            <b>{m.sent ? "An:" : "Von:"}</b> {m.sent ? m.to : m.from}
          </span>
          <span className="t">{m.time}</span>
        </div>
      </div>
      <div className="mail-body">
        {m.body.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        {m.facts && (
          <dl className="facts">
            {m.facts.map(([k, v]) => (
              <div className="fact" key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </AppWindow>
  );
}
