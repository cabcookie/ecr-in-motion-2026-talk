import type { SyncMessage, SyncTransport } from "./types";

const CHANNEL = "ecr-masterclass";

/**
 * Fensterübergreifende Steuerung ohne Backend.
 *
 * Reicht für den Normalfall: Live-View auf dem Beamer, Operator-View auf dem
 * zweiten Bildschirm desselben Rechners. Für Steuerung von einem anderen
 * Gerät braucht es einen Transport mit Server.
 */
export function createBroadcastTransport(): SyncTransport {
  const id = Math.random().toString(36).slice(2, 10);
  const channel = new BroadcastChannel(CHANNEL);

  return {
    id,
    send(msg) {
      channel.postMessage(msg);
    },
    subscribe(handler) {
      const listener = (e: MessageEvent<SyncMessage>) => {
        // Eigene Nachrichten kommen nicht zurück, aber doppelt schadet nicht
        if (e.data?.from !== id) handler(e.data);
      };
      channel.addEventListener("message", listener);
      return () => channel.removeEventListener("message", listener);
    },
    close() {
      channel.close();
    },
  };
}

/** Nicht überall verfügbar (alte Safari-Versionen, manche WebViews). */
export const BROADCAST_SUPPORTED = typeof BroadcastChannel !== "undefined";
