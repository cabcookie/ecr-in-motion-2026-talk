import { useLayoutEffect, useRef, type ReactNode } from "react";

/**
 * Hält Folieninhalte im Bild.
 *
 * Misst den Inhalt ungeskaliert und verkleinert ihn per transform, wenn er
 * höher oder breiter ist als der zugewiesene Platz. Damit kann kein Mock
 * über den Folienrand laufen, egal wie lang ein Text wird — und wir müssen
 * Inhalte nicht pro Folie von Hand auf die Bühne passen.
 *
 * Greift direkt aufs DOM zu statt über State, damit kein Mess-Render-Kreis
 * entsteht.
 */
export function FitBox({
  children,
  slideKey,
  origin = "top center",
}: {
  children: ReactNode;
  /** löst die Neumessung beim Folienwechsel aus */
  slideKey: number;
  origin?: "top center" | "top left";
}) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const o = outer.current;
    const i = inner.current;
    if (!o || !i) return;

    const apply = () => {
      i.style.transform = "none";
      const h = i.offsetHeight;
      const w = i.offsetWidth;
      if (!h || !w) return;
      const s = Math.min(1, o.clientHeight / h, o.clientWidth / w);
      i.style.transformOrigin = origin;
      i.style.transform = s < 0.999 ? `scale(${s})` : "none";
      // Für die Diagnose: welche Folien müssen geschrumpft werden?
      o.dataset.fit = s.toFixed(2);
    };

    apply();
    // Webfonts kommen nach dem ersten Layout an und ändern die Höhe
    document.fonts.ready.then(apply).catch(() => {});
  }, [slideKey, origin]);

  return (
    <div className="fit-outer" ref={outer}>
      <div className="fit-inner" ref={inner}>
        {children}
      </div>
    </div>
  );
}
