import { useCallback, useEffect, useRef, useState } from "react";
import { chooseTransport, type TransportKind } from "@/sync";
import type { SyncTransport } from "@/sync/types";

export interface Navigation {
  index: number;
  total: number;
  next: () => void;
  prev: () => void;
  goto: (i: number) => void;
  /** true, wenn die Fernsteuerung angebunden ist */
  connected: boolean;
  /** welcher Transport gerade trägt — für die Anzeige in der Operator-View */
  transport: TransportKind;
}

export interface NavigationOptions {
  /** Tastatur auswerten */
  keyboard?: boolean;
  /** Stand an andere Fenster senden und von dort übernehmen */
  sync?: boolean;
}

/**
 * Folien-Navigation für Live- und Operator-View.
 *
 * Beide Seiten dürfen springen; die Änderung wird über den Transport
 * gespiegelt. Empfangene Sprünge werden nicht zurückgesendet, sonst
 * schaukeln sich die Fenster gegenseitig auf.
 *
 * Der Transport wird im Effekt erzeugt und dort auch geschlossen — nicht in
 * einem useMemo. Sonst überlebt er den Doppel-Mount im StrictMode nicht:
 * die erste Aufräumrunde schließt den Kanal, und der zweite Mount sendet
 * in einen geschlossenen Kanal.
 */
export function useNavigation(
  total: number,
  { keyboard = true, sync = true }: NavigationOptions = {},
): Navigation {
  const [index, setIndex] = useState(0);
  const [connected, setConnected] = useState(false);
  const [{ kind, create }] = useState(chooseTransport);

  const transport = useRef<SyncTransport | null>(null);
  const indexRef = useRef(0);
  indexRef.current = index;

  /**
   * Einzige Stelle, an der sich die Folie ändert.
   *
   * `broadcast` trennt eigene Befehle von übernommenen Änderungen. Früher hing
   * das Senden an einem Effekt auf `index` — der lief im StrictMode beim
   * zweiten Mount erneut und überschrieb den Serverstand mit der Startfolie.
   * Senden gehört an den Befehl, nicht an den Zustand.
   */
  const apply = useCallback(
    (i: number, broadcast: boolean) => {
      const clamped = Math.min(total - 1, Math.max(0, i));
      setIndex(clamped);
      const t = transport.current;
      if (broadcast && t) {
        t.send({ type: "goto", index: clamped, from: t.id, at: Date.now() });
      }
    },
    [total],
  );

  const goto = useCallback((i: number) => apply(i, true), [apply]);
  const next = useCallback(() => apply(indexRef.current + 1, true), [apply]);
  const prev = useCallback(() => apply(indexRef.current - 1, true), [apply]);

  // Transport aufbauen und Fremdänderungen übernehmen
  useEffect(() => {
    if (!sync) return;

    const t = create();
    if (!t) return;
    transport.current = t;
    setConnected(true);

    const off = t.subscribe((msg) => {
      if (msg.type === "goto") {
        apply(msg.index, false);
      } else if (msg.type === "hello") {
        // Wer den Stand kennt, teilt ihn dem neuen Fenster mit
        t.send({ type: "goto", index: indexRef.current, from: t.id, at: Date.now() });
      }
    });

    // Der Realtime-Transport holt den Stand selbst über currentSlide()
    if (kind === "broadcast") {
      t.send({ type: "hello", from: t.id, at: Date.now() });
    }

    return () => {
      off();
      t.close();
      transport.current = null;
      setConnected(false);
    };
  }, [sync, create, kind, apply]);

  useEffect(() => {
    if (!keyboard) return;
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLElement && e.target.closest("input,textarea")) return;
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
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [keyboard, next, prev, goto, total]);

  return { index, total, next, prev, goto, connected, transport: kind };
}
