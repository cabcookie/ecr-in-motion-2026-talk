/**
 * Transportschicht zwischen Operator-View, Live-View und Zuschauersicht.
 *
 * Die Schnittstelle ist bewusst klein, damit neben dem BroadcastChannel
 * (gleicher Browser, kein Backend) der Realtime-Block von AWS Blocks
 * danebenstehen kann — derselbe Vertrag, nur über AppSync Events.
 */

/** Ein Folienstand: Folie plus Klick-Schritt innerhalb der Folie. */
export interface Cursor {
  index: number;
  step: number;
}

export type SyncMessage =
  /** Springe zu diesem Stand. Von beiden Seiten sendbar. */
  | { type: "goto"; index: number; step: number; from: string; at: number }
  /** Neu dazugekommen — wer den Stand kennt, möge ihn schicken. */
  | { type: "hello"; from: string; at: number };

export interface SyncTransport {
  /** Kennung dieser Instanz, um eigene Nachrichten zu erkennen */
  readonly id: string;
  send(msg: SyncMessage): void;
  subscribe(handler: (msg: SyncMessage) => void): () => void;
  close(): void;
}
