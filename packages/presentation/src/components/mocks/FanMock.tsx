import type { FanMock as Fan } from "@/slides/types";
import { AppWindow } from "./AppWindow";

export function FanMockView({ m }: { m: Fan }) {
  return (
    <AppWindow label="Ausgeführt — gleichzeitig" pip="bg-sys-agent">
      <div className="grid auto-cols-fr grid-flow-col gap-px bg-win-rule">
        {m.cells.map((c, i) => (
          <div className="bg-win px-[28px] py-[30px]" key={i}>
            <span className="mb-[16px] block font-mono text-[20px] tracking-[0.09em] text-sys-mail uppercase">
              {c.sys}
            </span>
            <div className="text-[32px] leading-[1.28] font-semibold text-win-ink">{c.act}</div>
            <span className="mt-[14px] block font-mono text-[22px] leading-[1.35] text-win-muted">
              {c.qty}
            </span>
          </div>
        ))}
      </div>
    </AppWindow>
  );
}
