import { useCallback, useEffect, useState } from "react";

export interface Navigation {
  index: number;
  total: number;
  next: () => void;
  prev: () => void;
  goto: (i: number) => void;
}

/**
 * Folien-Navigation für die Live-View.
 *
 * Tastatur: → / Leertaste / Bild-ab vor, ← / Bild-auf zurück, Pos1 / Ende an die Ränder.
 * Bild-auf und Bild-ab decken die gängigen Presenter-Clicker ab.
 *
 * Die Operator-View wird später über `goto` andocken — deshalb liegt der
 * Zustand hier und nicht in der Komponente.
 */
export function useNavigation(total: number): Navigation {
  const [index, setIndex] = useState(0);

  const goto = useCallback(
    (i: number) => setIndex(Math.min(total - 1, Math.max(0, i))),
    [total],
  );
  const next = useCallback(() => setIndex((i) => Math.min(total - 1, i + 1)), [total]);
  const prev = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      switch (e.key) {
        case "ArrowRight":
        case " ":
        case "PageDown":
          e.preventDefault();
          next();
          break;
        case "ArrowLeft":
        case "PageUp":
          e.preventDefault();
          prev();
          break;
        case "Home":
          e.preventDefault();
          goto(0);
          break;
        case "End":
          e.preventDefault();
          goto(total - 1);
          break;
        case "f":
          if (document.fullscreenElement) document.exitFullscreen();
          else document.documentElement.requestFullscreen();
          break;
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, goto, total]);

  return { index, total, next, prev, goto };
}
