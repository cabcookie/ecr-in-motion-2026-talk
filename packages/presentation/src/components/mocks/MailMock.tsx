import type { MailMock as Mail } from "@/slides/types";
import { AppWindow } from "./AppWindow";

export function MailMockView({ m }: { m: Mail }) {
  return (
    <AppWindow label={m.app} pip="bg-sys-mail">
      <div className="border-b border-win-rule px-[36px] pt-[32px] pb-[26px]">
        <h3 className="m-0 mb-[16px] font-display text-[42px] leading-[1.22] font-bold tracking-[-0.012em] text-win-ink">
          {m.subject}
        </h3>
        <div className="flex items-baseline gap-[16px] text-[27px] text-win-muted">
          <span>
            <b className="font-semibold text-win-ink-2">{m.sent ? "An:" : "Von:"}</b>{" "}
            {m.sent ? m.to : m.from}
          </span>
          <span className="ml-auto font-mono text-[24px]">{m.time}</span>
        </div>
      </div>

      <div className="grid gap-[20px] px-[36px] pt-[30px] pb-[34px] text-[30px] leading-[1.5] text-win-ink-2">
        {m.body.map((p, i) => (
          <p className="m-0" key={i}>
            {p}
          </p>
        ))}
        {m.facts && (
          <dl className="mt-[8px] grid auto-cols-fr grid-flow-col gap-px overflow-hidden rounded-md border border-win-rule bg-win-rule">
            {m.facts.map(([k, v]) => (
              <div className="bg-win px-[22px] py-[20px]" key={k}>
                <dt className="font-mono text-[19px] tracking-[0.08em] text-win-faint uppercase">
                  {k}
                </dt>
                <dd className="m-0 mt-[8px] text-[34px] font-bold tabular-nums text-win-ink">
                  {v}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </AppWindow>
  );
}
