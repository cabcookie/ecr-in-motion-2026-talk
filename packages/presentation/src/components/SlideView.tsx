import type { Slide } from "@/slides/types";
import { blockOf } from "@/slides/data";
import { MockView } from "./mocks";
import { FitBox } from "./FitBox";

/** Headline-Stufe nach Länge — lange Sätze dürfen nicht bis zum Rand laufen. */
function headlineSize(text: string): string {
  if (text.length <= 26) return "text-[124px]";
  if (text.length <= 46) return "text-[100px]";
  if (text.length <= 76) return "text-[80px]";
  return "text-[64px]";
}

/** Folien ohne Anwendungsfenster stehen mittig — die Aussage ist die Folie. */
function isCentered(s: Slide): boolean {
  if (!s.mock) return true;
  return s.mock.t === "statement" || s.mock.t === "quote" || s.mock.t === "reveal";
}

export function SlideView({
  slide,
  isTitle,
  step = 0,
}: {
  slide: Slide;
  isTitle: boolean;
  step?: number;
}) {
  const block = blockOf(slide.b);
  const centered = isTitle || isCentered(slide);

  /** Neun Arbeitsschritte passen nur zweispaltig und ohne Erläuterungen aufs Bild. */
  const terse = slide.mock?.t === "list" && slide.mock.items.length > 6;

  return (
    <div
      className={`absolute inset-0 flex flex-col px-[108px] pt-[92px] pb-[104px] ${
        centered ? "items-center justify-center text-center" : ""
      }`}
    >
      {isTitle && (
        <div className="mb-[42px] font-mono text-[26px] tracking-[0.2em] text-[color:var(--accent)] uppercase">
          ECR in Motion · Masterclass
        </div>
      )}

      <h1
        className={`m-0 font-display leading-[1.04] font-extrabold tracking-[-0.025em] text-balance text-fg ${headlineSize(
          slide.headline,
        )} ${centered ? "max-w-[20ch]" : "max-w-[24ch]"}`}
      >
        {slide.headline}
      </h1>

      {slide.sub && (
        <p
          className={`m-0 mt-[26px] text-[38px] leading-[1.38] font-normal text-pretty text-fg-2 ${
            centered ? "max-w-[38ch]" : "max-w-[46ch]"
          }`}
        >
          {slide.sub}
        </p>
      )}

      {slide.mock && (
        <div
          className={`min-h-0 ${centered ? "mt-[56px] flex-none" : "mt-[48px] flex-1"}`}
        >
          <FitBox slideKey={slide.n * 100 + step} centered={centered}>
            <MockView mock={slide.mock} terse={terse} step={step} />
          </FitBox>
        </div>
      )}

      <div className="absolute bottom-[32px] left-[44px] flex items-center gap-[13px] font-mono text-[20px] tracking-[0.11em] text-fg-3 uppercase">
        <span className="size-[12px] rounded-full bg-[color:var(--accent)]" />
        <span>
          {block.n} · {block.tab}
        </span>
      </div>
      {/* data-slideno ist der stabile Haken für das Screenshot-Skript —
          Style-Klassen taugen dafür nicht, sie ändern sich mit dem Design. */}
      <div
        data-slideno={slide.n}
        className="absolute right-[44px] bottom-[34px] font-mono text-[21px] tracking-[0.09em] tabular-nums text-fg-3"
      >
        {String(slide.n).padStart(2, "0")}
      </div>
    </div>
  );
}
