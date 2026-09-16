import { useEffect, useRef, useState } from "react";

export const SECTION_MS = 820;

export interface Transition {
  /** Abschnitt, der gerade hinausläuft — null, wenn nichts läuft */
  leaving: number | null;
  /** true, wenn vorwärts geblättert wird */
  forward: boolean;
}

/**
 * Hält den verlassenen Abschnitt so lange am Leben, wie die Bewegung dauert.
 *
 * Ohne das könnte nur der neue Abschnitt einlaufen — das sähe aus wie ein
 * Schnitt, nicht wie Scrollen. Beide gleichzeitig zu zeigen ist der ganze
 * Trick.
 */
export function useSectionTransition(index: number): Transition {
  const [leaving, setLeaving] = useState<number | null>(null);
  const [forward, setForward] = useState(true);
  const current = useRef(index);

  useEffect(() => {
    if (current.current === index) return;
    const from = current.current;
    current.current = index;
    setForward(index > from);
    setLeaving(from);
    const t = setTimeout(() => setLeaving(null), SECTION_MS);
    return () => clearTimeout(t);
  }, [index]);

  return { leaving, forward };
}
