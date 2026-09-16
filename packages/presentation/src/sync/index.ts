import { createBroadcastTransport, BROADCAST_SUPPORTED } from "./broadcast";
import { createRealtimeTransport } from "./realtime";
import type { SyncTransport } from "./types";
import { LOKAL, ansicht } from "../routen";

export type TransportKind = "broadcast" | "realtime" | "none";

/**
 * Wie die drei Ansichten sich einig bleiben.
 *
 * Im Regelfall über den Server: Leinwand, Steuerpult und Teilnehmerhandys
 * stehen an drei verschiedenen Geräten, da hilft kein BroadcastChannel.
 *
 * `?local` dreht das für Leinwand und Steuerpult um — der Rettungsanker, wenn
 * am Abend das Netz ausfällt. Beide laufen dann im selben Browser und brauchen
 * kein Backend. Auf den Teilnehmerhandys gibt es diesen Ausweg nicht, dort
 * bleibt es beim Server.
 *
 * Das Steuerungsgeheimnis kommt per `?token=` und wird für die Sitzung
 * gemerkt, damit man es auf dem Handy nur einmal eintippen muss.
 */
export function chooseTransport(): { kind: TransportKind; create: () => SyncTransport | null } {
  if (!LOKAL || ansicht() === "teilnehmer") {
    return { kind: "realtime", create: () => createRealtimeTransport() };
  }

  if (BROADCAST_SUPPORTED) {
    return { kind: "broadcast", create: () => createBroadcastTransport() };
  }

  return { kind: "none", create: () => null };
}

export type { SyncTransport, SyncMessage } from "./types";
