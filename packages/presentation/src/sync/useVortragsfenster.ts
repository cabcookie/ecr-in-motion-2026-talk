import { useCallback, useEffect, useState } from "react";
import { api } from "aws-blocks";

export interface Fensterstand {
  aktiv: boolean;
  start: number | null;
  ende: number | null;
}

/**
 * Läuft der Vortrag gerade?
 *
 * Fragt beim Laden und danach alle dreißig Sekunden. So wechselt ein Handy,
 * das schon vor dem Start offen liegt, von selbst in den Vortrag — und zwei
 * Stunden später wieder auf die Abschlussseite, ohne dass jemand neu lädt.
 *
 * `null` heißt: noch keine Antwort. Ein Fehler lässt den letzten Stand
 * stehen. Mitten im Vortrag soll ein verlorener Abruf nicht „Danke, dass Du
 * da warst" zeigen.
 *
 * Die Sicherheit hängt nicht hieran. Gesperrt wird im Backend; diese Abfrage
 * entscheidet nur, welche Seite zu sehen ist.
 */
export function useVortragsfenster(takt = 30_000) {
  const [stand, setStand] = useState<Fensterstand | null>(null);

  const neuLaden = useCallback(async () => {
    try {
      setStand(await api.vortragsfenster());
    } catch {
      // letzter Stand bleibt
    }
  }, []);

  useEffect(() => {
    void neuLaden();
    const t = setInterval(() => void neuLaden(), takt);
    return () => clearInterval(t);
  }, [neuLaden, takt]);

  /*
    Das Ende steht fest, sobald der Start bekannt ist. Ohne diesen Zeitgeber
    wechselte die Seite erst beim nächsten Abruf, bis zu dreißig Sekunden zu
    spät.
  */
  useEffect(() => {
    if (!stand?.aktiv || stand.ende === null) return;
    const rest = stand.ende - Date.now();
    if (rest <= 0) return;
    const t = setTimeout(() => void neuLaden(), rest + 1_000);
    return () => clearTimeout(t);
  }, [stand, neuLaden]);

  return { stand, neuLaden, setStand };
}
