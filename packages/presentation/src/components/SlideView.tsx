import type { Slide } from "@/slides/types";
import { blockOf } from "@/slides/data";
import { MockView } from "./mocks";
import { FitBox } from "./FitBox";

/** Headline-Stufe nach Länge — lange Sätze dürfen nicht bis zum Rand laufen. */
function headlineSize(text: string): string {
  if (text.length <= 26) return "s-xl";
  if (text.length <= 46) return "s-lg";
  if (text.length <= 76) return "s-md";
  return "s-sm";
}

/** Folien ohne Anwendungsfenster stehen mittig — die Aussage ist die Folie. */
function isCentered(s: Slide): boolean {
  if (!s.mock) return true;
  return s.mock.t === "statement" || s.mock.t === "quote";
}

export function SlideView({ slide, isTitle }: { slide: Slide; isTitle: boolean }) {
  const block = blockOf(slide.b);
  const centered = isTitle || isCentered(slide);

  /** Neun Arbeitsschritte passen nur zweispaltig und ohne Erläuterungen aufs Bild. */
  const terse = slide.mock?.t === "list" && slide.mock.items.length > 6;

  return (
    <div className={`slide${centered ? " center" : ""}`}>
      {isTitle && <div className="title-kicker">ECR in Motion · Masterclass</div>}

      <h1 className={`headline ${headlineSize(slide.headline)}`}>{slide.headline}</h1>
      {slide.sub && <p className="sub">{slide.sub}</p>}

      {slide.mock && (
        <div className={`mockarea${terse ? " cols2" : ""}`}>
          <FitBox slideKey={slide.n} origin={centered ? "top center" : "top left"}>
            <MockView mock={slide.mock} terse={terse} />
          </FitBox>
        </div>
      )}

      <div className="blockmark">
        <span className="dot" />
        <span>
          {block.n} · {block.tab}
        </span>
      </div>
      <div className="slideno">{String(slide.n).padStart(2, "0")}</div>
    </div>
  );
}
