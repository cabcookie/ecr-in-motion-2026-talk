import type { ChatMock as Chat } from "@/slides/types";
import { AppWindow } from "./AppWindow";

export function ChatMockView({ m }: { m: Chat }) {
  return (
    <AppWindow label={m.app} pip="var(--sys-chat)" width={1560}>
      <div className="chat">
        {m.msgs.map((msg, i) => (
          <div key={i} className={`bubble ${msg.role}${msg.flat ? " flat" : ""}`}>
            <span className="who">{msg.who}</span>
            {msg.tools && (
              <div className="tools">
                {msg.tools.map((t) => (
                  <span className="tool" key={t}>
                    {t}()
                  </span>
                ))}
              </div>
            )}
            {msg.text}
          </div>
        ))}
      </div>
    </AppWindow>
  );
}
