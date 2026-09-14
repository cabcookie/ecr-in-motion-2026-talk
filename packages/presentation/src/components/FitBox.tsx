import { useLayoutEffect, useRef, type ReactNode } from "react";

/**
 * Hält Folieninhalte im Bild.
 *
 * Misst den Inhalt ungeskaliert und verkleinert ihn per transform, wenn er
 * höher oder breiter ist als der zugewiesene Platz. Damit kann kein Mock über
 * den Folienrand laufen, egal wie lang ein Text wird.
 *
 * Der Platz steht nicht sofort fest: Beim ersten Panel eines Abschnitts wandert
 * die Überschrift gerade erst nach oben und gibt die Fläche nach und nach frei.
 * Früher wurde deshalb einmal am Anfang und noch einmal nach 820 ms gemessen —
 * und der Inhalt sprang sichtbar von halber auf volle Größe.
 *
 * Jetzt beobachtet ein ResizeObserver die Fläche und rechnet den Maßstab bei
 * jeder Änderung neu. Die Naturgröße des Inhalts wird dabei nur einmal
 * gemessen, danach kommt die Fläche aus contentRect — kein erzwungenes Layout
 * je Bild, also keine Ruckler.
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

    /** Naturgröße des Inhalts — ändert sich nur, wenn die Schrift nachlädt. */
    let natH = 0;
    let natW = 0;

    const messen = () => {
      i.style.transform = "none";
      natH = i.offsetHeight;
      natW = i.offsetWidth;
    };

    const passen = (flaecheH: number, flaecheW: number) => {
      if (!natH || !natW || !flaecheH || !flaecheW) return;
      const s = Math.min(1, flaecheH / natH, flaecheW / natW);
      /*
        Immer von der Mitte aus verkleinern. Mit "top left" klebte ein
        geschrumpfter Inhalt am linken Rand und ließ rechts eine Lücke — auf
        der Leinwand sieht das aus, als wäre die Folie falsch gesetzt.
      */
      i.style.transformOrigin = "top center";
      i.style.transform = s < 0.999 ? `scale(${s})` : "none";
      o.dataset.fit = s.toFixed(2);
    };

    messen();
    passen(o.clientHeight, o.clientWidth);

    const ro = new ResizeObserver((eintraege) => {
      const r = eintraege[0]?.contentRect;
      if (r) passen(r.height, r.width);
    });
    ro.observe(o);

    // Webfonts kommen nach dem ersten Layout an und ändern die Naturgröße
    let verworfen = false;
    document.fonts.ready
      .then(() => {
        if (verworfen) return;
        messen();
        passen(o.clientHeight, o.clientWidth);
      })
      .catch(() => {});

    return () => {
      verworfen = true;
      ro.disconnect();
    };
  }, [slideKey, centered]);

  return (
    <div
      ref={outer}
      className={`flex h-full w-full items-center ${centered ? "justify-center" : "justify-start"}`}
    >
      <div ref={inner} className={centered ? "max-w-full" : "w-full"}>
        {children}
      </div>
    </div>
  );
}
