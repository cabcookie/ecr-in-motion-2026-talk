import type { FanMock as Fan } from "@/slides/types";
import { AppWindow } from "./AppWindow";

export function FanMockView({ m }: { m: Fan }) {
  return (
    <AppWindow label="Ausgeführt — gleichzeitig" pip="var(--sys-agent)">
      <div className="fan">
        {m.cells.map((c, i) => (
          <div className="fan-cell" key={i}>
            <span className="sys">{c.sys}</span>
            <div className="act">{c.act}</div>
            <span className="qty">{c.qty}</span>
          </div>
        ))}
      </div>
    </AppWindow>
  );
}
