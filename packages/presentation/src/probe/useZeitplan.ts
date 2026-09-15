import { useCallback, useEffect, useState } from "react";
import { api } from "aws-blocks";
import { token } from "@/sync/token";
import { atFuer, type Zeitplan } from "./zeitplan";

/**
 * Der geltende Zeitplan — einer für die ganze Seite.
 *
 * Der Zustand liegt im Modul und nicht in der Komponente, weil ihn zwei
 * Stellen brauchen: das Steuerpult zeigt die Soll-Uhrzeit an, der Dialog am
 * Ende einer Probe schreibt sie neu. Mit je eigenem Zustand schriebe der
 * Dialog in seine Kopie, und das Steuerpult zeigte bis zum nächsten Neuladen
 * die alten Zeiten — ein Fehler, den man erst auf der Bühne bemerkt.
 *
 * Dasselbe Muster wie beim Steuerungsgeheimnis in `sync/token.ts`.
 */
let aktuell: Zeitplan | null = null;
let geladen = false;
let laeuftGerade: Promise<void> | null = null;

const hoerer = new Set<(p: Zeitplan | null) => void>();

function melde(neu: Zeitplan | null): void {
  aktuell = neu;
  for (const h of hoerer) h(aktuell);
}

/** Einmal laden, egal wie viele Komponenten fragen. */
function laden(): Promise<void> {
  if (laeuftGerade) return laeuftGerade;
  laeuftGerade = api
    .zeitplanLesen()
    .then((p) => melde((p as Zeitplan | null) ?? null))
    .catch(() => {
      /*
        Kein Backend: dann gelten die Zeiten aus den Foliendaten. Ein Steuerpult
        ohne Zeitanzeige wäre auf der Bühne schlimmer als eines mit den alten
        Schätzungen.
      */
    })
    .finally(() => {
      geladen = true;
    });
  return laeuftGerade;
}

export function useZeitplan() {
  const [plan, setPlan] = useState<Zeitplan | null>(aktuell);
  const [fertig, setFertig] = useState(geladen);

  useEffect(() => {
    hoerer.add(setPlan);
    void laden().then(() => setFertig(true));
    return () => {
      hoerer.delete(setPlan);
    };
  }, []);

  const speichern = useCallback(async (neu: Zeitplan) => {
    /*
      Erst melden, dann senden. Der Plan ist bereits gerechnet; ihn erst nach
      der Antwort des Servers anzuzeigen hieße, die Zeitanzeige für die Dauer
      eines Netzwerkaufrufs auf den alten Werten stehen zu lassen.
    */
    melde(neu);
    await api.zeitplanSchreiben(neu, token());
  }, []);

  const verwerfen = useCallback(async () => {
    melde(null);
    await api.zeitplanVerwerfen(token());
  }, []);

  return {
    plan,
    geladen: fertig,
    speichern,
    verwerfen,
    /** Die geltende Soll-Uhrzeit einer Folie: Plan vor Foliendaten. */
    at: useCallback(
      (index: number, step: number) => atFuer(plan, index, step),
      [plan],
    ),
  };
}
