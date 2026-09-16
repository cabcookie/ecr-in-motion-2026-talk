import { api } from "aws-blocks";
import type { SyncMessage, SyncTransport } from "./types";
import { melde, token } from "./token";

/**
 * Fernsteuerung über AWS Blocks Realtime — für Geräte, die sich keinen Browser
 * teilen: Leinwand, Steuerpult und die Handys im Saal.
 *
 * Der wichtigste Teil hier ist nicht das Verbinden, sondern das Wiederverbinden.
 * Ein gesperrtes Handy friert die Seite ein und die Weboberfläche schließt die
 * Verbindung; kommt der Teilnehmer zurück, ist die Seite da, aber taub. Genau
 * das ist im Saal der Regelfall, nicht die Ausnahme — jeder sperrt irgendwann
 * sein Telefon.
 *
 * Deshalb drei Netze übereinander:
 *
 *   1. `onDisconnect` meldet einen Abriss, wenn die Weboberfläche ihn bemerkt.
 *   2. Kommt die Seite wieder in den Vordergrund oder das Netz zurück, wird
 *      ohne Rückfrage neu verbunden — ein Abriss im Schlaf wird oft gar nicht
 *      gemeldet, weil der Browser den Zeitgeber angehalten hat.
 *   3. Ein langsamer Puls fragt den Stand auch dann ab, wenn beides schweigt.
 *      Er ist die Versicherung gegen die stille tote Verbindung.
 *
 * Nach jedem Verbinden wird der aktuelle Stand geholt, nicht nur abonniert.
 * Sonst stünde ein zurückgekehrtes Handy auf der Folie von vor dem Sperren und
 * würde erst beim nächsten Klick des Vortragenden aufwachen.
 */
export function createRealtimeTransport(): SyncTransport {
  const id = Math.random().toString(36).slice(2, 10);
  let handler: ((msg: SyncMessage) => void) | null = null;
  let statusHandler: ((verbunden: boolean) => void) | null = null;
  let unsubscribe: (() => void) | null = null;
  let closed = false;
  let verbunden = false;
  let versuch = 0;
  let nachholTimer: ReturnType<typeof setTimeout> | null = null;

  /** Umweg über eine Funktion: direkt aufgerufen verengt TypeScript `handler` auf null. */
  const emit = (msg: SyncMessage) => handler?.(msg);

  const setzeStatus = (neu: boolean) => {
    if (neu === verbunden) return;
    verbunden = neu;
    statusHandler?.(neu);
  };

  /** Den Stand vom Server holen und übernehmen. */
  async function holeStand() {
    try {
      const aktuell = await api.currentSlide();
      if (!closed && aktuell.at > 0) {
        emit({
          type: "goto",
          index: aktuell.index,
          step: aktuell.step,
          from: aktuell.from,
          at: aktuell.at,
        });
      }
      setzeStatus(true);
    } catch {
      setzeStatus(false);
    }
  }

  async function verbinde() {
    if (closed) return;
    unsubscribe?.();
    unsubscribe = null;
    try {
      const channel = await api.subscribeDeck();
      if (closed) return;

      const sub = channel.subscribe({
        onMessage: (event) => {
          if (event.from === id) return;
          setzeStatus(true);
          emit({
            type: "goto",
            index: event.index,
            step: event.step,
            from: event.from,
            at: event.at,
          });
        },
        onDisconnect: (grund) => {
          if (closed || grund === "client") return;
          setzeStatus(false);
          neuVersuchen();
        },
      });
      unsubscribe = () => sub.unsubscribe();

      await sub.established;
      if (closed) return;
      versuch = 0;
      await holeStand();
    } catch {
      setzeStatus(false);
      neuVersuchen();
    }
  }

  /** Wachsende Wartezeit, gedeckelt bei acht Sekunden. */
  function neuVersuchen() {
    if (closed || nachholTimer) return;
    const wartezeit = Math.min(8000, 500 * 2 ** versuch++);
    nachholTimer = setTimeout(() => {
      nachholTimer = null;
      void verbinde();
    }, wartezeit);
  }

  /** Zurück aus dem Schlaf: sofort neu verbinden, ohne auf eine Meldung zu warten. */
  const aufwachen = () => {
    if (closed || document.visibilityState !== "visible") return;
    versuch = 0;
    void verbinde();
  };

  document.addEventListener("visibilitychange", aufwachen);
  window.addEventListener("online", aufwachen);
  window.addEventListener("pageshow", aufwachen);

  /*
    Der langsame Puls. Zwanzig Sekunden sind selten genug, dass ein Saal voller
    Handys keine Last erzeugt, und häufig genug, dass niemand länger als eine
    halbe Folie auf dem falschen Stand steht.
  */
  const puls = setInterval(() => {
    if (closed || document.visibilityState !== "visible") return;
    void holeStand();
  }, 20_000);

  void verbinde();

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
    onStatus(h) {
      statusHandler = h;
      h(verbunden);
      return () => {
        statusHandler = null;
      };
    },
    close() {
      closed = true;
      if (sendTimer) clearTimeout(sendTimer);
      if (nachholTimer) clearTimeout(nachholTimer);
      clearInterval(puls);
      document.removeEventListener("visibilitychange", aufwachen);
      window.removeEventListener("online", aufwachen);
      window.removeEventListener("pageshow", aufwachen);
      unsubscribe?.();
    },
  };
}
