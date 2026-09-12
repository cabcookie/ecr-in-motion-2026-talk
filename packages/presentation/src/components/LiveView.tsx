import { useEffect, useState } from "react";
import { SLIDES, TOTAL } from "@/slides/data";
import { useNavigation } from "@/nav/useNavigation";
import { STAGE_W, useStageScale } from "@/nav/useStageScale";
import { SlideView } from "./SlideView";

/** ?clean blendet den Tastaturhinweis aus — für Screenshots und den Ernstfall. */
const CLEAN = new URLSearchParams(location.search).has("clean");

export function LiveView() {
  const { index } = useNavigation(TOTAL);
  const scale = useStageScale();
  const slide = SLIDES[index];
  const [showHelp, setShowHelp] = useState(!CLEAN);

  useEffect(() => {
    if (CLEAN) return;
    const t = setTimeout(() => setShowHelp(false), 5000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="fixed inset-0 grid place-items-center bg-stage">
      <div
        className="relative h-[1080px] w-[1920px] shrink-0 origin-center overflow-hidden bg-stage"
        data-block={slide.b}
        style={{ transform: `scale(${scale})` }}
      >
        <SlideView slide={slide} isTitle={index === 0} />
        <div className="absolute inset-x-0 bottom-0 h-[9px] bg-stage-3" />
        <div
          className="absolute bottom-0 left-0 h-[9px] bg-[color:var(--accent)] transition-[width] duration-300 ease-out"
          style={{ width: `${((index + 1) / TOTAL) * STAGE_W}px` }}
        />
      </div>

      {!CLEAN && (
        <div
          className={`pointer-events-none fixed right-6 bottom-6 rounded border border-hair bg-stage/90 px-3 py-2 font-mono text-xs tracking-wider text-fg-3 transition-opacity duration-500 ${
            showHelp ? "opacity-100" : "opacity-0"
          }`}
        >
          → / Leertaste vor · ← zurück · F Vollbild
        </div>
      )}
    </div>
  );
}
