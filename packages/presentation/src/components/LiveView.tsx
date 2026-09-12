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
    <div className="viewport">
      <div className="stage" data-block={slide.b} style={{ transform: `scale(${scale})` }}>
        <SlideView slide={slide} isTitle={index === 0} />
        <div className="progress-track" />
        <div
          className="progress"
          style={{ width: `${((index + 1) / TOTAL) * STAGE_W}px` }}
        />
      </div>
      {!CLEAN && (
        <div className={`help${showHelp ? "" : " hidden"}`}>
          → / Leertaste vor · ← zurück · F Vollbild
        </div>
      )}
    </div>
  );
}
