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
 * entsteht. Der gemessene Faktor landet in data-fit, damit der
 * Screenshot-Lauf melden kann, welche Folien zu voll sind.
 */
export function FitBox({
  children,
  slideKey,
  centered = false,
}: {
  children: ReactNode;
  /** löst die Neumessung beim Folienwechsel aus */
  slideKey: number;
  centered?: boolean;
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
      i.style.transformOrigin = centered ? "top center" : "top left";
      i.style.transform = s < 0.999 ? `scale(${s})` : "none";
      o.dataset.fit = s.toFixed(2);
    };

    apply();
    // Webfonts kommen nach dem ersten Layout an und ändern die Höhe
    document.fonts.ready.then(apply).catch(() => {});
  }, [slideKey, centered]);

  return (
    <div
      ref={outer}
      className={`flex h-full w-full items-start ${centered ? "justify-center" : "justify-start"}`}
    >
      <div ref={inner} className={centered ? "max-w-full" : "w-full"}>
        {children}
      </div>
    </div>
  );
}
