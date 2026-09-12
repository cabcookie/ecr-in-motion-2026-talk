import { api } from "aws-blocks";
import type { SyncMessage, SyncTransport } from "./types";

/**
 * Fernsteuerung über AWS Blocks Realtime — für Geräte, die sich keinen
 * Browser teilen: Live-View auf dem Beamer-Rechner, Operator-View auf dem
 * Handy.
 *
 * Lokal ist das ein WebSocket-Server im Blocks-Dev-Server, in AWS AppSync
 * Events. Für diese Datei macht das keinen Unterschied.
 *
 * Beim Verbinden wird der zuletzt gesetzte Stand nachgeholt, damit ein
 * Gerät, das mitten im Vortrag dazukommt, sofort die richtige Folie zeigt.
 */
export function createRealtimeTransport(token: string): SyncTransport {
  const id = Math.random().toString(36).slice(2, 10);
  let handler: ((msg: SyncMessage) => void) | null = null;
  let unsubscribe: (() => void) | null = null;
  let closed = false;

  /** Umweg über eine Funktion: direkt aufgerufen verengt TypeScript `handler` auf null. */
  const emit = (msg: SyncMessage) => handler?.(msg);

  void (async () => {
    try {
      const channel = await api.subscribeDeck();
      if (closed) return;

      const sub = channel.subscribe((event) => {
        if (event.from === id) return;
        emit({ type: "goto", index: event.index, from: event.from, at: event.at });
      });
      unsubscribe = () => sub.unsubscribe();

      // Stand nachholen — ersetzt das "hello" des BroadcastChannel-Transports
      const current = await api.currentSlide();
      if (!closed && current.at > 0) {
        emit({ type: "goto", index: current.index, from: current.from, at: current.at });
      }
    } catch (err) {
      console.error("Realtime-Verbindung fehlgeschlagen:", err);
    }
  })();

  return {
    id,
    send(msg) {
      // "hello" wird hier über currentSlide() gelöst, nicht über den Kanal
      if (msg.type !== "goto") return;
      void api.gotoSlide(msg.index, id, token).catch((err) => {
        console.error("Folienwechsel abgelehnt:", err);
      });
    },
    subscribe(h) {
      handler = h;
      return () => {
        handler = null;
      };
    },
    close() {
      closed = true;
      unsubscribe?.();
    },
  };
}
