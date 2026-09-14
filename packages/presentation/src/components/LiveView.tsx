import { useEffect, useState } from "react";
import { SECTIONS, TOTAL } from "@/slides/data";
import { useNavigation } from "@/nav/useNavigation";
import { useSectionTransition } from "@/nav/useSectionTransition";
import { STAGE_W, useStageScale } from "@/nav/useStageScale";
import { SectionView } from "./SectionView";

/** ?clean blendet den Tastaturhinweis aus — für Screenshots und den Ernstfall. */
const CLEAN = new URLSearchParams(location.search).has("clean");

export function LiveView() {
  const { index, step, total } = useNavigation(TOTAL);
  const { leaving, forward } = useSectionTransition(index);
  const scale = useStageScale();
  const section = SECTIONS[index];
  const [showHelp, setShowHelp] = useState(!CLEAN);

  useEffect(() => {
    if (CLEAN) return;
    const t = setTimeout(() => setShowHelp(false), 5000);
    return () => clearTimeout(t);
  }, []);

  const done = SECTIONS.slice(0, index).reduce((a, s) => a + s.panels.length, 0) + step + 1;
  const all = SECTIONS.reduce((a, s) => a + s.panels.length, 0);

  // Für das Screenshot-Skript: wie viele Klicks hat der ganze Vortrag?
  useEffect(() => {
    document.body.dataset.panels = String(all);
  }, [all]);

  return (
    <div className="fixed inset-0 grid place-items-center bg-stage">
      <div
        className="relative h-[1080px] w-[1920px] shrink-0 origin-center overflow-hidden bg-stage"
        data-block={section.b}
        style={{ transform: `scale(${scale})` }}
      >
        {leaving !== null && (
          <div
            key={`leave-${leaving}`}
            className={`absolute inset-0 ${forward ? "section-leave-up" : "section-leave-down"}`}
            aria-hidden
          >
            <SectionView
              section={SECTIONS[leaving]}
              panel={SECTIONS[leaving].panels.length - 1}
              isTitle={leaving === 0}
            />
          </div>
        )}

        <div
          key={`enter-${index}`}
          className={`absolute inset-0 ${
            leaving === null ? "" : forward ? "section-enter-down" : "section-enter-up"
          }`}
        >
          <SectionView section={section} panel={step} isTitle={index === 0} />
        </div>

        <div className="absolute inset-x-0 bottom-0 h-[9px] bg-stage-3" />
        <div
          className="absolute bottom-0 left-0 h-[9px] bg-[color:var(--accent)] transition-[width] duration-500 ease-out"
          style={{ width: `${(done / all) * STAGE_W}px` }}
        />
      </div>

      {!CLEAN && (
        <div
          className={`pointer-events-none fixed right-6 bottom-6 rounded border border-hair bg-stage/90 px-3 py-2 font-mono text-xs tracking-wider text-fg-3 transition-opacity duration-500 ${
            showHelp ? "opacity-100" : "opacity-0"
          }`}
        >
          → / Leertaste vor · ← zurück · ⌃⌘F Vollbild · {index + 1}/{total}
        </div>
      )}
    </div>
  );
}
