import { useCallback, useEffect, useRef, useState } from "react";
import type { Section } from "@/slides/types";
import { SectionView } from "./SectionView";
import { STAGE_H, STAGE_W } from "@/nav/useStageScale";

/**
 * Zeigt eine Folie verkleinert — dieselbe Komponente wie auf dem Beamer,
 * nur herunterskaliert. So kann die Vorschau nicht von der Live-View
 * abweichen.
 *
 * `expandable` blendet einen Vollbild-Knopf ein. Im Vollbild füllt die Bühne
 * den Bildschirm des Operators, sodass eine eingebettete Anwendung in
 * Originalgröße bedienbar ist, während der Saal dasselbe auf dem Beamer sieht.
 */
export function StagePreview({
  section,
  width,
  panel = 0,
  expandable = false,
}: {
  section: Section;
  width: number;
  panel?: number;
  expandable?: boolean;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [fsScale, setFsScale] = useState(1);

  const measure = useCallback(() => {
    setFsScale(Math.min(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H));
  }, []);

  useEffect(() => {
    function onChange() {
      const active = document.fullscreenElement === box.current;
      setFullscreen(active);
      if (active) measure();
    }
    document.addEventListener("fullscreenchange", onChange);
    window.addEventListener("resize", measure);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  async function toggle() {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await box.current?.requestFullscreen();
  }

  const scale = fullscreen ? fsScale : width / STAGE_W;

  return (
    <div className="group relative w-fit">
      <div
        ref={box}
        data-block={section.b}
        className={
          fullscreen
            ? "grid h-screen w-screen place-items-center overflow-hidden bg-stage"
            : "relative overflow-hidden rounded-md border border-hair bg-stage"
        }
        style={
          fullscreen
            ? undefined
            : { width, height: Math.round(width * (STAGE_H / STAGE_W)) }
        }
      >
        <div
          className={fullscreen ? "shrink-0 origin-center" : "absolute top-0 left-0 origin-top-left"}
          style={{ width: STAGE_W, height: STAGE_H, transform: `scale(${scale})` }}
        >
          <SectionView section={section} panel={panel} isTitle={section.n === 1} />
        </div>
      </div>

      {expandable && (
        <button
          type="button"
          onClick={toggle}
          className="absolute top-2 right-2 z-10 rounded border border-hair bg-stage/85 px-2 py-1 font-mono text-[10px] tracking-wider text-fg-3 uppercase opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 hover:text-fg"
        >
          {fullscreen ? "Schließen" : "Vollbild"}
        </button>
      )}
    </div>
  );
}
