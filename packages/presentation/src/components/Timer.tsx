import { useEffect, useRef, useState } from "react";

function mmss(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

/** Laufzeit des Vortrags. 60 Minuten sind das Budget — ab 55 wird es rot. */
export function Timer() {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const startedAt = useRef<number | null>(null);
  const base = useRef(0);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setElapsed(base.current + (Date.now() - (startedAt.current ?? Date.now())));
    }, 250);
    return () => clearInterval(t);
  }, [running]);

  function toggle() {
    if (running) {
      base.current = elapsed;
      startedAt.current = null;
    } else {
      startedAt.current = Date.now();
    }
    setRunning(!running);
  }

  function reset() {
    base.current = 0;
    startedAt.current = running ? Date.now() : null;
    setElapsed(0);
  }

  const minutes = elapsed / 60000;
  const tone = minutes >= 60 ? "text-b1" : minutes >= 55 ? "text-b2" : "text-fg";

  return (
    <div className="flex items-center gap-2">
      <span className={`font-mono text-2xl tabular-nums ${tone}`}>{mmss(elapsed)}</span>
      <button
        type="button"
        onClick={toggle}
        className="rounded border border-hair px-2 py-1 font-mono text-[11px] tracking-wider text-fg-3 uppercase hover:border-fg-3 hover:text-fg"
      >
        {running ? "Pause" : "Start"}
      </button>
      <button
        type="button"
        onClick={reset}
        className="rounded border border-hair px-2 py-1 font-mono text-[11px] tracking-wider text-fg-3 uppercase hover:border-fg-3 hover:text-fg"
      >
        Null
      </button>
    </div>
  );
}
