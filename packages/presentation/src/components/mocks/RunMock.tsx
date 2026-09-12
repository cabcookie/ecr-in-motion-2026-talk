import type { RunMock as Run } from "@/slides/types";
import { AppWindow, Rich } from "./AppWindow";

export function RunMockView({ m }: { m: Run }) {
  return (
    <AppWindow label="Agent — Arbeitsprotokoll" pip="bg-sys-agent">
      <div>
        {m.steps.map((s, i) => (
          <div
            key={i}
            className={`grid grid-cols-[62px_1fr] items-start gap-[24px] border-b border-win-3 px-[36px] py-[24px] last:border-b-0 ${
              s.key ? "bg-key-bg" : ""
            }`}
          >
            <span
              className={`pt-[6px] font-mono text-[24px] tabular-nums ${
                s.key ? "text-key-num" : "text-win-faint"
              }`}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <div
              className={`text-[30px] leading-[1.4] ${
                s.key ? "font-semibold text-win-ink" : "text-win-ink-2"
              }`}
            >
              <span
                className={`mr-[16px] inline-block rounded-[4px] px-[12px] py-[5px] align-[3px] font-mono text-[19px] tracking-[0.08em] uppercase ${
                  s.key ? "bg-key-chip text-key-ink" : "bg-win-3 text-win-muted"
                }`}
              >
                {s.sys}
              </span>
              {s.txt}
              {s.out && (
                <Rich className="mt-[10px] block text-[27px] text-win-muted" html={s.out} />
              )}
            </div>
          </div>
        ))}
      </div>
    </AppWindow>
  );
}
