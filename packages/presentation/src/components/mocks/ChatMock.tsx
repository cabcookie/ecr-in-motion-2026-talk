import type { ChatMock as Chat } from "@/slides/types";
import { AppWindow } from "./AppWindow";

export function ChatMockView({ m }: { m: Chat }) {
  return (
    <AppWindow label={m.app} pip="bg-sys-chat" width={1560}>
      <div className="grid gap-[24px] px-[36px] py-[32px]">
        {m.msgs.map((msg, i) => (
          <div
            key={i}
            className={[
              "max-w-[86%] rounded-lg border px-[28px] py-[24px] text-[30px] leading-[1.46]",
              msg.role === "user"
                ? "justify-self-end border-user-rule bg-user-bg text-win-ink"
                : "justify-self-start border-win-rule bg-win-2 text-win-ink-2",
              msg.flat ? "text-win-muted italic" : "",
            ].join(" ")}
          >
            <span className="mb-[12px] block font-mono text-[19px] tracking-[0.1em] text-win-faint uppercase">
              {msg.who}
            </span>
            {msg.tools && (
              <div className="mb-[18px] flex flex-wrap gap-[10px]">
                {msg.tools.map((t) => (
                  <span
                    key={t}
                    className="rounded-[5px] border border-tool-rule bg-tool-bg px-[14px] py-[7px] font-mono text-[21px] whitespace-nowrap text-sys-agent"
                  >
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
