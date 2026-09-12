import { useCallback, useEffect, useRef, useState } from "react";
import { createBroadcastTransport, BROADCAST_SUPPORTED } from "@/sync/broadcast";
import type { SyncTransport } from "@/sync/types";

export interface Navigation {
  index: number;
  total: number;
  next: () => void;
  prev: () => void;
  goto: (i: number) => void;
  /** true, wenn die Fernsteuerung angebunden ist */
  connected: boolean;
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

  const transport = useRef<SyncTransport | null>(null);
  /** unterdrückt das Zurücksenden einer gerade empfangenen Änderung */
  const fromRemote = useRef(false);
  /** beim Mount nicht senden — dafür ist "hello" da */
  const mounted = useRef(false);
  const indexRef = useRef(0);
  indexRef.current = index;

  const goto = useCallback(
    (i: number) => setIndex(Math.min(total - 1, Math.max(0, i))),
    [total],
  );
  const next = useCallback(() => setIndex((i) => Math.min(total - 1, i + 1)), [total]);
  const prev = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);

  // Transport aufbauen und Fremdänderungen übernehmen
  useEffect(() => {
    if (!sync || !BROADCAST_SUPPORTED) return;

    const t = createBroadcastTransport();
    transport.current = t;
    setConnected(true);

    const off = t.subscribe((msg) => {
      if (msg.type === "goto") {
        fromRemote.current = true;
        setIndex(msg.index);
      } else if (msg.type === "hello") {
        // Wer den Stand kennt, teilt ihn dem neuen Fenster mit
        t.send({ type: "goto", index: indexRef.current, from: t.id, at: Date.now() });
      }
    });

    t.send({ type: "hello", from: t.id, at: Date.now() });

    return () => {
      off();
      t.close();
      transport.current = null;
      setConnected(false);
    };
  }, [sync]);

  // Eigene Änderungen verteilen
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    if (fromRemote.current) {
      fromRemote.current = false;
      return;
    }
    transport.current?.send({
      type: "goto",
      index,
      from: transport.current.id,
      at: Date.now(),
    });
  }, [index]);

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

  return { index, total, next, prev, goto, connected };
}
