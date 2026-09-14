import { useEffect, useState } from "react";

/** "18:36" → Minuten seit Mitternacht. */
function toMinutes(hhmm: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

function clock(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/**
 * Liegen wir in der Zeit?
 *
 * Links steht, wann wir auf dieser Folie ankommen sollten, rechts wie spät es
 * wirklich ist. Die Farbe rechts ist die ganze Information: grün heißt, wir
 * sind früh dran, gelb heißt punktgenau, rot heißt wir hängen hinterher.
 *
 * Kein Timer — im Vortrag hilft die Uhrzeit, nicht die verstrichene Zeit.
 */
export function Schedule({ at }: { at?: string }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const geplant = at ? toMinutes(at) : null;
  const jetzt = now.getHours() * 60 + now.getMinutes();

  /**
   * Toleranz von einer Minute in beide Richtungen. Enger wäre nervös: bei
   * 43 Panels springt die Anzeige sonst im Sekundentakt zwischen zwei Farben.
   */
  const tone =
    geplant === null
      ? "text-fg-3"
      : jetzt < geplant - 1
        ? "text-b4" // früh dran
        : jetzt > geplant + 1
          ? "text-b1" // hinterher
          : "text-b2"; // punktgenau

  return (
    <div className="flex items-start gap-6">
      <div>
        <div className="font-mono text-2xl tabular-nums text-b3">{at ?? "—"}</div>
        <div className="font-mono text-[10px] tracking-[0.12em] text-fg-3 uppercase">Geplant</div>
      </div>
      <div>
        <div className={`font-mono text-2xl tabular-nums ${tone}`}>{clock(now)}</div>
        <div className="font-mono text-[10px] tracking-[0.12em] text-fg-3 uppercase">Jetzt</div>
      </div>
    </div>
  );
}
