import { useCallback, useEffect, useRef, useState } from "react";
import { chooseTransport, type TransportKind } from "@/sync";
import type { SyncTransport } from "@/sync/types";
import { panelsOf } from "@/slides/data";

export interface Navigation {
  index: number;
  /** Panel innerhalb des Abschnitts, 0-basiert */
  step: number;
  total: number;
  next: () => void;
  prev: () => void;
  goto: (i: number, step?: number) => void;
  connected: boolean;
  transport: TransportKind;
}

export interface NavigationOptions {
  keyboard?: boolean;
  sync?: boolean;
  /** nur zuhören — die Zuschauersicht steuert nichts */
  readOnly?: boolean;
}

/**
 * Folien-Navigation für alle drei Ansichten.
 *
 * Eine Folie kann mehrere Klick-Schritte haben; `next` geht erst durch die
 * Schritte und dann zur nächsten Folie, `prev` entsprechend rückwärts auf den
 * letzten Schritt der vorigen Folie.
 *
 * Gesendet wird beim Befehl, nicht in einem Effekt auf den Zustand — ein
 * Effekt lief im StrictMode beim zweiten Mount erneut und überschrieb den
 * Serverstand mit der Startfolie.
 */
export function useNavigation(
  total: number,
  { keyboard = true, sync = true, readOnly = false }: NavigationOptions = {},
): Navigation {
  const [{ index, step }, setCursor] = useState({ index: 0, step: 0 });
  const [connected, setConnected] = useState(false);
  const [{ kind, create }] = useState(chooseTransport);

  const transport = useRef<SyncTransport | null>(null);
  /**
   * Der Stand als Ref, synchron mitgeführt.
   *
   * Er darf NICHT beim Rendern gesetzt werden: Mehrere Klicks im selben Tick
   * (schnelles Weiterklicken, gedrückt gehaltene Pfeiltaste) läsen sonst alle
   * denselben veralteten Wert, und nur einer davon käme an.
   */
  const cursorRef = useRef({ index: 0, step: 0 });

  /** Einzige Stelle, an der sich der Stand ändert. */
  const apply = useCallback(
    (i: number, s: number, broadcast: boolean) => {
      const clampedIndex = Math.min(total - 1, Math.max(0, i));
      const clampedStep = Math.min(panelsOf(clampedIndex) - 1, Math.max(0, s));
      cursorRef.current = { index: clampedIndex, step: clampedStep };
      setCursor(cursorRef.current);
      const t = transport.current;
      if (broadcast && t && !readOnly) {
        t.send({
          type: "goto",
          index: clampedIndex,
          step: clampedStep,
          from: t.id,
          at: Date.now(),
        });
      }
    },
    [total, readOnly],
  );

  const goto = useCallback((i: number, s = 0) => apply(i, s, true), [apply]);

  const next = useCallback(() => {
    const { index: i, step: s } = cursorRef.current;
    if (s + 1 < panelsOf(i)) apply(i, s + 1, true);
    else apply(i + 1, 0, true);
  }, [apply]);

  const prev = useCallback(() => {
    const { index: i, step: s } = cursorRef.current;
    if (s > 0) apply(i, s - 1, true);
    else apply(i - 1, panelsOf(Math.max(0, i - 1)) - 1, true);
  }, [apply]);

  // Transport aufbauen und Fremdänderungen übernehmen
  useEffect(() => {
    if (!sync) return;

    const t = create();
    if (!t) return;
    transport.current = t;
    // Der BroadcastChannel kennt keinen Abriss und meldet deshalb nichts;
    // über das Netz kommt der Stand vom Transport.
    const offStatus = t.onStatus ? t.onStatus(setConnected) : (setConnected(true), () => {});

    const off = t.subscribe((msg) => {
      if (msg.type === "goto") {
        apply(msg.index, msg.step ?? 0, false);
      } else if (msg.type === "hello" && !readOnly) {
        const { index: i, step: s } = cursorRef.current;
        t.send({ type: "goto", index: i, step: s, from: t.id, at: Date.now() });
      }
    });

    // Der Realtime-Transport holt den Stand selbst über currentSlide()
    if (kind === "broadcast") {
      t.send({ type: "hello", from: t.id, at: Date.now() });
    }

    return () => {
      off();
      offStatus();
      t.close();
      transport.current = null;
      setConnected(false);
    };
  }, [sync, create, kind, apply, readOnly]);

  useEffect(() => {
    if (!keyboard || readOnly) return;
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
  }, [keyboard, readOnly, next, prev, goto, total]);

  return { index, step, total, next, prev, goto, connected, transport: kind };
}
