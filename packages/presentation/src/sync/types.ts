/**
 * Transportschicht zwischen Operator-View und Live-View.
 *
 * Die Schnittstelle ist bewusst klein gehalten, damit neben dem
 * BroadcastChannel (gleicher Browser, kein Backend) später ein zweiter
 * Transport über den Realtime-Block von AWS Blocks danebentreten kann —
 * derselbe Vertrag, nur über API Gateway WebSocket statt im Browser.
 */

export type SyncMessage =
  /** Springe zu dieser Folie. Von beiden Seiten sendbar. */
  | { type: "goto"; index: number; from: string; at: number }
  /** Neu dazugekommen — wer den Stand kennt, möge ihn schicken. */
  | { type: "hello"; from: string; at: number };

export interface SyncTransport {
  /** Kennung dieser Instanz, um eigene Nachrichten zu erkennen */
  readonly id: string;
  send(msg: SyncMessage): void;
  subscribe(handler: (msg: SyncMessage) => void): () => void;
  close(): void;
}
