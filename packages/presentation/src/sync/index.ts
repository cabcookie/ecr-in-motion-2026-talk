import { createBroadcastTransport, BROADCAST_SUPPORTED } from "./broadcast";
import { createRealtimeTransport } from "./realtime";
import type { SyncTransport } from "./types";

export type TransportKind = "broadcast" | "realtime" | "none";

const params = new URLSearchParams(location.search);

/**
 * `?remote` schaltet auf die Fernsteuerung über AWS Blocks um. Ohne den
 * Schalter bleibt es beim BroadcastChannel: kein Backend, kein Netz, nichts
 * was am Vortragsabend ausfallen kann.
 *
 * Das Steuerungsgeheimnis kommt per `?token=` und wird für die Sitzung
 * gemerkt, damit man es auf dem Handy nur einmal eintippen muss.
 */
export function chooseTransport(): { kind: TransportKind; create: () => SyncTransport | null } {
  if (params.has("remote")) {
    const fromUrl = params.get("token");
    if (fromUrl) sessionStorage.setItem("deck-token", fromUrl);
    const token = fromUrl ?? sessionStorage.getItem("deck-token") ?? "";
    return { kind: "realtime", create: () => createRealtimeTransport(token) };
  }

  if (BROADCAST_SUPPORTED) {
    return { kind: "broadcast", create: () => createBroadcastTransport() };
  }

  return { kind: "none", create: () => null };
}

export type { SyncTransport, SyncMessage } from "./types";
