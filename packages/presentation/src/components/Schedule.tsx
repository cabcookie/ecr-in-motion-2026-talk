import { useCallback, useEffect, useState } from "react";
import { api } from "aws-blocks";
import { token } from "@/sync/token";
import { useVortragsfenster } from "@/sync/useVortragsfenster";

/** Der Vortrag beginnt um 18:00 — darauf sind alle Zeiten in den Foliendaten bezogen. */
const START_SOLL = 18 * 60;
const SPEICHER = "ecr-start-offset";

/** "18:36" → Minuten seit Mitternacht. */
function toMinutes(hhmm: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

function hhmm(minuten: number): string {
  const m = ((minuten % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(Math.round(m % 60)).padStart(2, "0")}`;
}

function ladeVersatz(): number {
  try {
    return Number(localStorage.getItem(SPEICHER)) || 0;
  } catch {
    return 0;
  }
}

/**
 * Liegen wir in der Zeit?
 *
 * Links steht, wann wir auf dieser Folie ankommen sollten, rechts wie spät es
 * wirklich ist. Die Farbe rechts ist die ganze Information: grün heißt, wir
 * sind früh dran, gelb heißt punktgenau, rot heißt wir hängen hinterher.
 *
 * Der Versatz verschiebt den geplanten Beginn, damit sich der Vortrag zu jeder
 * Tageszeit durchspielen und die Zeiten prüfen lassen. Für den Ernstfall gilt
 * 18:00, und zwar auch dann, wenn es ein paar Minuten später losgeht: das Ende
 * um 19:00 verschiebt sich nicht mit.
 *
 * Beide Knöpfe öffnen zugleich das Vortragsfenster auf dem Server (siehe
 * aws-blocks/fenster.ts): „Start jetzt" ab sofort, „18:00" heute von 17:50
 * bis 19:50 Uhr — zehn Minuten Vorlauf, damit die Handys vor dem Beginn
 * bereitstehen. Nur in diesem Fenster nimmt die Anwendung Teilnehmer an. Der
 * Versatz für die Anzeige bleibt im Browser; das Fenster steht auf dem
 * Server, weil es alle Geräte betrifft.
 *
 * `geprobt` heißt: Die Soll-Uhrzeit links stammt aus einer aufgezeichneten
 * Probe, nicht aus den Schätzungen in den Foliendaten. Das gehört sichtbar
 * gemacht — sonst weiß man auf der Bühne nicht, gegen was man gerade misst.
 */
export function Schedule({
  at,
  geprobt = false,
  verwerfen,
}: {
  at?: string;
  geprobt?: boolean;
  verwerfen?: () => void;
}) {
  const [now, setNow] = useState(() => new Date());
  const [versatz, setVersatz] = useState(ladeVersatz);
  const [fragt, setFragt] = useState(false);
  const { stand: fenster, setStand: setFenster } = useVortragsfenster();
  const [fensterFehler, setFensterFehler] = useState<string | null>(null);

  const oeffnen = useCallback(
    async (art: "jetzt" | "abend") => {
      setFensterFehler(null);
      try {
        setFenster(await api.fensterOeffnen(art, token()));
      } catch (err) {
        setFensterFehler(String((err as Error)?.message ?? err));
      }
    },
    [setFenster],
  );

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const setzen = useCallback((v: number) => {
    setVersatz(v);
    try {
      if (v) localStorage.setItem(SPEICHER, String(v));
      else localStorage.removeItem(SPEICHER);
    } catch {
      // dann gilt der Versatz eben nur für diese Sitzung
    }
  }, []);

  const jetzt = now.getHours() * 60 + now.getMinutes();
  const geplant = at ? toMinutes(at) : null;
  const soll = geplant === null ? null : geplant + versatz;

  /**
   * Toleranz von einer Minute in beide Richtungen. Enger wäre nervös: bei
   * 43 Panels springt die Anzeige sonst im Sekundentakt zwischen zwei Farben.
   */
  const ton =
    soll === null
      ? "text-fg-3"
      : jetzt < soll - 1
        ? "text-b4" // früh dran
        : jetzt > soll + 1
          ? "text-b1" // hinterher
          : "text-b2"; // punktgenau

  const knopf =
    "rounded border border-hair px-2 py-1 font-mono text-[10px] tracking-[0.1em] uppercase hover:border-fg-3 hover:text-fg";

  return (
    <div className="flex items-start gap-5">
      <div>
        <div className="font-mono text-2xl tabular-nums text-b3">
          {soll === null ? "—" : hhmm(soll)}
        </div>
        <div className="font-mono text-[10px] tracking-[0.12em] text-fg-3 uppercase">Geplant</div>
      </div>
      <div>
        <div className={`font-mono text-2xl tabular-nums ${ton}`}>{hhmm(jetzt)}</div>
        <div className="font-mono text-[10px] tracking-[0.12em] text-fg-3 uppercase">Jetzt</div>
      </div>
      <div className="flex flex-col items-start gap-1">
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => {
              setzen(jetzt - START_SOLL);
              void oeffnen("jetzt");
            }}
            className={`${knopf} ${versatz ? "text-fg" : "text-fg-3"}`}
            title="Beginn auf die aktuelle Uhrzeit legen und die Anwendung zwei Stunden lang öffnen"
          >
            Start jetzt
          </button>
          <button
            type="button"
            onClick={() => {
              setzen(0);
              void oeffnen("abend");
            }}
            className={`${knopf} ${versatz ? "text-fg-3" : "text-fg"}`}
            title="Zurück auf den echten Beginn — die Anwendung ist heute von 17:50 bis 19:50 offen"
          >
            18:00
          </button>
        </div>
        <span className="font-mono text-[10px] tracking-[0.1em] text-fg-3 uppercase">
          {versatz ? `Probe · Beginn ${hhmm(START_SOLL + versatz)}` : "Ernstfall · Ende 19:00"}
          {geprobt &&
            (fragt ? (
              <>
                {" · "}
                <button
                  type="button"
                  onClick={() => {
                    verwerfen?.();
                    setFragt(false);
                  }}
                  className="text-b1 uppercase hover:underline"
                >
                  Folienzeiten?
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setFragt(true)}
                title="Zurück auf die geschätzten Zeiten aus den Foliendaten"
                className="text-b3 uppercase hover:underline"
              >
                {" · "}geprobte Zeiten
              </button>
            ))}
        </span>
        <FensterZeile stand={fenster} fehler={fensterFehler} jetzt={now.getTime()} />
      </div>
    </div>
  );
}

function uhrzeit(ms: number): string {
  return new Date(ms).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
}

/** Ob die Teilnehmer gerade hineinkommen — sonst merkt man es erst im Saal. */
function FensterZeile({
  stand,
  fehler,
  jetzt,
}: {
  stand: { aktiv: boolean; start: number | null; ende: number | null } | null;
  fehler: string | null;
  jetzt: number;
}) {
  const zeile = "font-mono text-[10px] tracking-[0.1em] uppercase";
  if (fehler) return <span className={`${zeile} text-b1`}>Fenster: {fehler}</span>;
  if (!stand) return <span className={`${zeile} text-fg-3`}>Fenster: …</span>;
  if (stand.start !== null && stand.ende !== null && jetzt < stand.ende) {
    return jetzt < stand.start ? (
      <span className={`${zeile} text-b2`}>
        Gesperrt · öffnet {uhrzeit(stand.start)} bis {uhrzeit(stand.ende)}
      </span>
    ) : (
      <span className={`${zeile} text-b4`}>Offen bis {uhrzeit(stand.ende)}</span>
    );
  }
  return <span className={`${zeile} text-b1`}>Gesperrt · Teilnehmer sehen die Abschlussseite</span>;
}
