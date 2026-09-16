import { useCallback, useEffect, useRef, useState } from "react";
import { chooseTransport, type TransportKind } from "@/sync";
import type { SyncTransport } from "@/sync/types";
import { SECTIONS, panelsOf } from "@/slides/data";
import { ZIEL } from "@/routen";

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

  /*
    `?slide=13.1` beim Laden anfahren.

    Einmalig und mit Verzögerung: Die Verbindung meldet kurz nach dem Aufbau den
    gespeicherten Stand, und der überschriebe ein sofortiges Springen wieder.
    Erst danach gilt, was in der Adresse steht — ab dann die gewöhnliche
    Steuerung.

    Auch in der Zuschauersicht, dort aber ohne zu senden: Sie darf den Vortrag
    nicht steuern. Sie zeigt dann, was in IHRER Adresse steht, während Leinwand
    und Handys weiterlaufen — genau das, was man beim Prüfen einer einzelnen
    Folie braucht.
  */
  const zielAngefahren = useRef(false);
  /** Gesetzt, sobald `?slide=` eine Ansicht auf eine Folie festgelegt hat. */
  const gepinnt = useRef(false);
  useEffect(() => {
    const ziel = ZIEL;
    if (!ziel || zielAngefahren.current) return;
    zielAngefahren.current = true;
    const i = SECTIONS.findIndex((abschnitt) => abschnitt.n === ziel.abschnitt);
    if (i < 0) return;
    /*
      Kein Aufräumen des Timers.

      Mit `return () => clearTimeout(t)` hat der Sprung nie stattgefunden: Der
      Effekt lief bei jedem Rendern erneut, räumte dabei den Timer ab — und die
      Sperre oben verhinderte, dass ein neuer gestellt wurde. Innerhalb von 900
      Millisekunden rendert diese Ansicht mehrfach, allein schon wenn die
      Verbindung steht. Der Timer läuft jetzt durch; `apply` begrenzt ohnehin
      auf gültige Folien, ein später Schuss richtet also keinen Schaden an.
    */
    setTimeout(() => {
      /*
        Nur die mitlesende Ansicht wird festgenagelt. Das Steuerpult springt
        hin und steuert danach ganz normal weiter — dort ist der Parameter eine
        Abkürzung, keine Fessel.
      */
      if (readOnly) gepinnt.current = true;
      apply(i, ziel.panel - 1, !readOnly);
    }, 900);
  }, [apply, readOnly]);

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
        /*
          Eine festgenagelte Ansicht folgt nicht mehr.

          `?slide=13.1` in der Zuschauersicht heißt: Zeig mir genau diese Folie.
          Der Server meldet beim Verbinden seinen gespeicherten Stand, und ohne
          diese Sperre käme er nach dem Sprung an und zöge die Ansicht zurück —
          je nach Netz mal vor, mal nach dem Sprung. Das Ergebnis wäre eine
          Ansicht, die manchmal tut, was in ihrer Adresse steht.
        */
        if (gepinnt.current) return;
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
