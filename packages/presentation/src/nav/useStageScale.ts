import { useEffect, useState } from "react";

export const STAGE_W = 1920;
export const STAGE_H = 1080;

/**
 * Skaliert die 1920×1080-Bühne auf das Fenster.
 * Damit ist das Layout auf jedem Projektor identisch — alle Maße
 * in den Styles sind Design-Pixel und müssen nie responsiv gedacht werden.
 */
export function useStageScale(): number {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    function fit() {
      setScale(Math.min(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H));
    }
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  return scale;
}
