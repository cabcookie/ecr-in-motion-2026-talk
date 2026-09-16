import { useEffect, useState } from "react";

export const STAGE_W = 1920;
export const STAGE_H = 1080;

export interface StageFit {
  /** Faktor, mit dem die Bühne auf das Fenster passt. */
  scale: number;
  /** Versatz von der linken oberen Ecke, damit sie mittig sitzt. */
  left: number;
  top: number;
}

/**
 * Passt die 1920 × 1080 große Bühne ins Fenster.
 *
 * Damit ist das Layout auf jedem Projektor identisch — alle Maße in den Styles
 * sind Design-Pixel und müssen nie responsiv gedacht werden.
 *
 * Der Versatz wird hier ausgerechnet und nicht dem Layout überlassen. Vorher
 * hing die Bühne in einem `grid place-items-center`, und das ging schief, sobald
 * das Fenster schmaler war als 1920: Die Gitterspur wuchs auf die 1920 Pixel des
 * Kindes, das Kind zentrierte sich brav in dieser Spur — und die Spur begann bei
 * null. Auf einem 1512 Pixel breiten Bildschirm stand die Bühne dadurch 204
 * Pixel zu weit rechts und wurde rechts abgeschnitten. Auf einem Full-HD-Beamer
 * fiel es nicht auf, weil dort nichts skaliert wird.
 */
export function useStageFit(): StageFit {
  const [fit, setFit] = useState<StageFit>({ scale: 1, left: 0, top: 0 });

  useEffect(() => {
    function passe() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const scale = Math.min(w / STAGE_W, h / STAGE_H);
      setFit({
        scale,
        left: Math.round((w - STAGE_W * scale) / 2),
        top: Math.round((h - STAGE_H * scale) / 2),
      });
    }
    passe();
    window.addEventListener("resize", passe);
    return () => window.removeEventListener("resize", passe);
  }, []);

  return fit;
}
