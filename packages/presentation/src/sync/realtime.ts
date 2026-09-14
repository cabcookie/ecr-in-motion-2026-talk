import { api } from "aws-blocks";
import type { SyncMessage, SyncTransport } from "./types";
import { melde, token } from "./token";

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
export function createRealtimeTransport(): SyncTransport {
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
        emit({ type: "goto", index: event.index, step: event.step, from: event.from, at: event.at });
      });
      unsubscribe = () => sub.unsubscribe();

      // Stand nachholen — ersetzt das "hello" des BroadcastChannel-Transports
      const current = await api.currentSlide();
      if (!closed && current.at > 0) {
        emit({ type: "goto", index: current.index, step: current.step, from: current.from, at: current.at });
      }
    } catch (err) {
      console.error("Realtime-Verbindung fehlgeschlagen:", err);
    }
  })();

  /**
   * Schnelles Weiterklicken zusammenfassen.
   *
   * Jeder Klick wäre sonst ein eigener Aufruf; ein halbes Dutzend davon in
   * einer Sekunde kann beim Server in anderer Reihenfolge ankommen, und dann
   * bleibt der falsche Stand stehen. Gesendet wird nur der jeweils letzte —
   * die Zwischenschritte muss niemand sehen.
   */
  let sendTimer: ReturnType<typeof setTimeout> | null = null;
  let queued: { index: number; step: number } | null = null;

  const flush = () => {
    sendTimer = null;
    const target = queued;
    queued = null;
    if (!target || closed) return;
    void api
      .gotoSlide(target.index, target.step, id, token())
      .then(() => melde("greift"))
      .catch((err) => {
        // Der Server nennt den Grund im Klartext; wir unterscheiden nur, ob es
        // am Geheimnis lag oder an der Leitung — die Anzeige am Steuerpult
        // braucht nicht mehr.
        const abgelehnt = String(err?.message ?? err).includes("Steuerungsgeheimnis");
        melde(abgelehnt ? (token() ? "abgelehnt" : "fehlt") : "unbekannt");
        console.error("Folienwechsel abgelehnt:", err);
      });
  };

  return {
    id,
    send(msg) {
      // "hello" wird hier über currentSlide() gelöst, nicht über den Kanal
      if (msg.type !== "goto") return;
      queued = { index: msg.index, step: msg.step };
      if (sendTimer) clearTimeout(sendTimer);
      sendTimer = setTimeout(flush, 120);
    },
    subscribe(h) {
      handler = h;
      return () => {
        handler = null;
      };
    },
    close() {
      closed = true;
      if (sendTimer) clearTimeout(sendTimer);
      unsubscribe?.();
    },
  };
}
