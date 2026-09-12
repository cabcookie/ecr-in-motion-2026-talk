import type { RunMock as Run } from "@/slides/types";
import { AppWindow, Rich } from "./AppWindow";

export function RunMockView({ m }: { m: Run }) {
  return (
    <AppWindow label="Agent — Arbeitsprotokoll" pip="var(--sys-agent)">
      <div>
        {m.steps.map((s, i) => (
          <div className={`step${s.key ? " key" : ""}`} key={i}>
            <span className="idx">{String(i + 1).padStart(2, "0")}</span>
            <div className="txt">
              <span className="sys">{s.sys}</span>
              {s.txt}
              {s.out && <Rich className="out" html={s.out} />}
            </div>
          </div>
        ))}
      </div>
    </AppWindow>
  );
}
