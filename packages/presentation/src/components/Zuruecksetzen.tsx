import { useState } from "react";
import { api } from "aws-blocks";
import { token } from "@/sync/token";

type Stand =
  | { was: "ruht" }
  | { was: "fragt" }
  | { was: "laeuft" }
  | { was: "fertig"; antworten: number; fragen: number }
  | { was: "fehler"; text: string };

const KNOPF =
  "flex items-center gap-2 rounded-md border px-3 py-1.5 font-mono text-[11px] tracking-[0.1em] uppercase transition-colors";

/**
 * Setzt alles zurück, was aus dem Publikum kam.
 *
 * Gebaut für die Proben: Nach einem Durchlauf stehen Antworten im Speicher,
 * und beim nächsten Mal hätte die Umfrage auf der Leinwand schon Punkte, bevor
 * der erste Teilnehmer den QR-Code gescannt hat.
 *
 * Mit Rückfrage, und das ist keine Höflichkeit. Der Knopf sitzt neben dem für
 * die Aufzeichnung; ein Fehlgriff während des Vortrags löschte die Antworten
 * eines ganzen Saals, und niemand könnte sie wiederholen.
 */
export function Zuruecksetzen() {
  const [stand, setStand] = useState<Stand>({ was: "ruht" });

  async function los() {
    setStand({ was: "laeuft" });
    try {
      const { antworten, fragen } = await api.resetEingaben("operator", token());
      setStand({ was: "fertig", antworten, fragen });
      /* Die Meldung geht von allein wieder weg — sie ist eine Quittung, kein Zustand. */
      setTimeout(() => setStand({ was: "ruht" }), 5000);
    } catch (err) {
      setStand({ was: "fehler", text: String((err as Error)?.message ?? err) });
    }
  }

  switch (stand.was) {
    case "fragt":
      return (
        <div className="flex items-center gap-2 rounded-md border border-b1 bg-b1/10 px-3 py-1">
          <span className="text-[12px] text-fg-2">Alle Eingaben löschen?</span>
          <button
            type="button"
            onClick={los}
            className="rounded border border-b1 bg-b1/20 px-2 py-1 font-mono text-[11px] tracking-[0.1em] text-b1 uppercase hover:bg-b1/30"
          >
            Ja
          </button>
          <button
            type="button"
            onClick={() => setStand({ was: "ruht" })}
            className="rounded px-2 py-1 font-mono text-[11px] tracking-[0.1em] text-fg-3 uppercase hover:text-fg-2"
          >
            Abbrechen
          </button>
        </div>
      );

    case "laeuft":
      return (
        <span className={`${KNOPF} border-hair text-fg-3`}>läuft …</span>
      );

    case "fertig":
      return (
        <span className={`${KNOPF} border-b4 text-b4`}>
          ✓ {stand.antworten} Antworten
          {stand.fragen > 0 && `, ${stand.fragen} Fragen`} gelöscht
        </span>
      );

    case "fehler":
      return (
        <button
          type="button"
          onClick={() => setStand({ was: "fragt" })}
          title={stand.text}
          className={`${KNOPF} border-b1 text-b1 hover:bg-b1/15`}
        >
          Nicht gelöscht — nochmal?
        </button>
      );

    default:
      return (
        <button
          type="button"
          onClick={() => setStand({ was: "fragt" })}
          title="Antworten und offene Fragen löschen, auf allen Geräten"
          className={`${KNOPF} border-hair text-fg-3 hover:border-fg-3 hover:text-fg-2`}
        >
          Zurücksetzen
        </button>
      );
  }
}
