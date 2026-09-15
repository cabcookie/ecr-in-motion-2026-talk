import { useEffect, useRef, useState } from "react";
import {
  alsUhr,
  geplanteMinuten,
  gesamtdauer,
  interaktionGesamt,
  istMarkiert,
  promptFuerAgenten,
  sekundenAus,
  standSchluessel,
  type Halt,
  type Probe,
} from "@/probe/aufzeichnung";
import { SECTIONS } from "@/slides/data";
import { planAusProbe, endeLaut } from "@/probe/zeitplan";
import { useZeitplan } from "@/probe/useZeitplan";

/**
 * Der Aufnahmeknopf in der Operator-Ansicht.
 *
 * Drücken heißt: an den Anfang springen, die Uhr auf jetzt setzen und jeden
 * Folienstand mitschreiben. Unterwegs lassen sich die Folien markieren, auf
 * denen das Publikum mitmacht — wer allein probt, klickt dort durch, und ohne
 * die Markierung fehlte genau diese Zeit im Ergebnis.
 *
 * Am Ende steht daraus ein neuer Zeitplan, der die geschätzten Uhrzeiten der
 * Foliendaten ersetzt.
 */
export function Aufzeichnung({
  index,
  step,
  goto,
}: {
  index: number;
  step: number;
  goto: (i: number, step?: number) => void;
}) {
  const [probe, setProbe] = useState<Probe | null>(null);
  const [dialog, setDialog] = useState<Probe | null>(null);
  const [jetzt, setJetzt] = useState(Date.now());

  const laeuft = probe !== null && probe.beendet === undefined;

  /*
    Der letzte aufgezeichnete Stand als Ref.

    Ohne ihn schriebe der Effekt unten bei jedem Rendern einen Eintrag, nicht
    nur bei einem echten Wechsel — und ein Rendern löst hier vieles aus, allein
    schon die laufende Uhr.
  */
  const letzter = useRef<string>("");

  useEffect(() => {
    if (!laeuft) return;
    const schluessel = `${index}:${step}`;
    if (letzter.current === schluessel) return;
    letzter.current = schluessel;
    setProbe((p) =>
      p ? { ...p, haelte: [...p.haelte, halt(index, step, p.begonnen)] } : p,
    );
  }, [index, step, laeuft]);

  /** Die Anzeige tickt mit, sonst stünde die Dauer still, bis jemand klickt. */
  useEffect(() => {
    if (!laeuft) return;
    const t = setInterval(() => setJetzt(Date.now()), 1000);
    return () => clearInterval(t);
  }, [laeuft]);

  function starten() {
    /*
      Erst an den Anfang, dann die Uhr stellen — und den letzten Stand leeren,
      damit Abschnitt 1 auch dann aufgezeichnet wird, wenn wir schon dort
      standen. Sonst fehlte ausgerechnet der erste Eintrag.
    */
    goto(0, 0);
    letzter.current = "";
    setProbe({ begonnen: Date.now(), haelte: [], interaktionen: {} });
  }

  function stoppen() {
    if (!probe) return;
    const beendet = { ...probe, beendet: Date.now() };
    setProbe(null);
    setDialog(beendet);
  }

  /** Den aktuellen Stand als Interaktion markieren — oder die Markierung wieder abnehmen. */
  function markieren() {
    setProbe((p) => {
      if (!p) return p;
      const schluessel = standSchluessel(index, step);
      const bisher = { ...(p.interaktionen ?? {}) };
      if (schluessel in bisher) delete bisher[schluessel];
      /*
        Zwei Minuten als Vorschlag, nicht als Wahrheit. Ein Wert, der sofort
        dasteht, wird im Dialog nachgeschärft; ein leeres Feld wird vergessen.
      */
      else bisher[schluessel] = 120;
      return { ...p, interaktionen: bisher };
    });
  }

  const markiert = probe ? istMarkiert(probe, index, step) : false;
  const anzahlMarkiert = Object.keys(probe?.interaktionen ?? {}).length;

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={laeuft ? stoppen : starten}
          className={`flex items-center gap-2 rounded-md border px-3 py-1.5 font-mono text-[11px] tracking-[0.1em] uppercase transition-colors ${
            laeuft
              ? "border-b1 bg-b1/15 text-b1 hover:bg-b1/25"
              : "border-hair text-fg-3 hover:border-fg-3 hover:text-fg-2"
          }`}
          title={
            laeuft
              ? "Probe beenden und auswerten"
              : "Probe aufzeichnen — springt an den Anfang"
          }
        >
          <span
            className={`size-2.5 ${laeuft ? "bg-b1" : "rounded-full bg-b1/70"}`}
            aria-hidden
          />
          {laeuft ? (
            <>
              Stopp
              <span className="tabular-nums">
                {alsUhr(jetzt - (probe?.begonnen ?? jetzt))}
              </span>
              <span className="text-b1/60">· {probe?.haelte.length ?? 0}</span>
            </>
          ) : (
            "Probe aufzeichnen"
          )}
        </button>

        {/*
          Nur während der Aufnahme, und bewusst ein einziger Klick: Auf der
          Bühne — oder im Durchlauf, der die Bühne simuliert — will niemand ein
          Zahlenfeld ausfüllen. Die Sekunden kommen im Dialog, wo Zeit dafür ist.
        */}
        {laeuft && (
          <button
            type="button"
            onClick={markieren}
            title={
              markiert
                ? "Markierung dieser Folie wieder abnehmen"
                : "Hier macht das Publikum mit — Zeit dafür später eintragen"
            }
            className={`flex items-center gap-2 rounded-md border px-3 py-1.5 font-mono text-[11px] tracking-[0.1em] uppercase transition-colors ${
              markiert
                ? "border-b3 bg-b3/15 text-b3 hover:bg-b3/25"
                : "border-hair text-fg-3 hover:border-fg-3 hover:text-fg-2"
            }`}
          >
            {markiert ? "✓ Interaktion" : "+ Interaktion"}
            {anzahlMarkiert > 0 && (
              <span className={markiert ? "text-b3/60" : "text-fg-3"}>
                {" · "}
                {anzahlMarkiert}
              </span>
            )}
          </button>
        )}
      </div>

      {dialog && <Auswertung probe={dialog} schliessen={() => setDialog(null)} />}
    </>
  );
}

function halt(index: number, step: number, begonnen: number): Halt {
  return { index, step, bei: Date.now() - begonnen };
}

/** „6.2 · Mach mit" — wie der Stand im Dialog heißt. */
function standName(index: number, step: number): string {
  const s = SECTIONS[index];
  if (!s) return `${index}.${step + 1}`;
  return `${s.n}${s.panels.length > 1 ? `.${step + 1}` : ""} · ${s.title}`;
}

/**
 * Was nach dem Stopp erscheint.
 *
 * Hier werden die markierten Folien mit Zeiten versehen, und aus Messung plus
 * Schätzung entsteht der neue Zeitplan. Die frühere Frage „hast Du genug Zeit
 * für Interaktion vorgesehen?" ist damit hinfällig: Sie ließ sich nur mit
 * einem Gefühl beantworten, und ein Gefühl kann niemand nachrechnen.
 */
function Auswertung({ probe, schliessen }: { probe: Probe; schliessen: () => void }) {
  /*
    Die Zeiten werden hier bearbeitet, also liegt die Probe im Zustand. Als Text
    und nicht als Zahl: Wer „2:3" tippt, ist auf dem Weg zu „2:30", und ein Feld,
    das dazwischen auf „2:03" springt, ist unbenutzbar.
  */
  const [entwurf, setEntwurf] = useState<Probe>(probe);
  const [felder, setFelder] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      Object.entries(probe.interaktionen ?? {}).map(([k, v]) => [k, alsUhr(v * 1000)]),
    ),
  );
  /*
    Vorbelegt aus den Blockbudgets — dort steht die Zahl schon, und zwei Orte
    für dieselbe Angabe gehen auseinander. Änderbar bleibt sie trotzdem: Wer
    kürzer eingeladen ist als geplant, will das hier korrigieren und nicht in
    den Foliendaten.
  */
  const [soll, setSoll] = useState(geplanteMinuten());
  const [kopiert, setKopiert] = useState(false);
  const [gespeichert, setGespeichert] = useState<"nein" | "laeuft" | "ja" | "fehler">("nein");

  const { speichern } = useZeitplan();

  const markierungen = Object.keys(entwurf.interaktionen ?? {});
  const interaktion = interaktionGesamt(entwurf);
  const gesamtMs = gesamtdauer(entwurf) + interaktion * 1000;
  const sollMs = soll * 60_000;
  const abweichung = gesamtMs - sollMs;

  const fertig: Probe = { ...entwurf, sollMinuten: soll };

  function setzeZeit(schluessel: string, text: string) {
    setFelder((f) => ({ ...f, [schluessel]: text }));
    setEntwurf((p) => ({
      ...p,
      interaktionen: { ...(p.interaktionen ?? {}), [schluessel]: sekundenAus(text) },
    }));
    setKopiert(false);
    setGespeichert("nein");
  }

  async function uebernehmen() {
    setGespeichert("laeuft");
    try {
      await speichern(planAusProbe(fertig));
      setGespeichert("ja");
    } catch {
      setGespeichert("fehler");
    }
  }

  async function kopieren() {
    const text = promptFuerAgenten(fertig);
    try {
      await navigator.clipboard.writeText(text);
      setKopiert(true);
    } catch {
      /*
        Ohne sicheren Kontext oder Erlaubnis schlägt die Zwischenablage fehl.
        Dann ein Textfeld mit ausgewähltem Inhalt — der Vortragende kann
        selbst kopieren, statt vor einem stummen Knopf zu stehen.
      */
      const feld = document.createElement("textarea");
      feld.value = text;
      feld.style.position = "fixed";
      feld.style.opacity = "0";
      document.body.append(feld);
      feld.select();
      document.execCommand("copy");
      feld.remove();
      setKopiert(true);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
      <div className="flex max-h-[88vh] w-full max-w-[620px] flex-col rounded-lg border border-hair bg-stage-2">
        <div className="border-b border-hair p-6 pb-5">
          <div className="font-mono text-[11px] tracking-[0.12em] text-fg-3 uppercase">
            Probe beendet
          </div>
          <div className="mt-1 font-display text-2xl font-bold">
            {alsUhr(gesamtdauer(entwurf))} über {entwurf.haelte.length} Folienstände
          </div>
          <p className="mt-2 mb-0 text-[13px] leading-relaxed text-fg-3">
            Reine Vortragszeit. Was das Publikum beiträgt, steht unten — es war beim
            Proben nicht dabei.
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          <div className="font-mono text-[11px] tracking-[0.12em] text-fg-3 uppercase">
            Interaktion
          </div>

          {markierungen.length === 0 ? (
            <p className="mt-2 mb-0 text-[13px] leading-relaxed text-fg-3">
              Keine Folie markiert. Während der Aufnahme markiert der Knopf
              „+ Interaktion" die Folie, auf der das Publikum mitmacht — die Zeit
              dafür trägst Du dann hier ein.
            </p>
          ) : (
            <div className="mt-3 grid gap-2">
              {markierungen.map((k) => {
                const [i, s] = k.split(":").map(Number);
                return (
                  <label
                    key={k}
                    className="flex items-center justify-between gap-4 rounded-md border border-hair px-3 py-2"
                  >
                    <span className="min-w-0 truncate text-[14px] text-fg-2">
                      {standName(i, s)}
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={felder[k] ?? ""}
                      onChange={(e) => setzeZeit(k, e.target.value)}
                      placeholder="2:00"
                      className="w-[72px] shrink-0 rounded-md border border-hair bg-stage px-2 py-1 text-right font-mono tabular-nums text-fg focus:border-[color:var(--accent)] focus:outline-none"
                    />
                  </label>
                );
              })}
            </div>
          )}

          <label className="mt-5 flex items-center justify-between gap-4 rounded-md border border-hair px-3 py-2.5">
            <span className="text-fg-2">
              Wie lang soll der Vortrag sein?
              <span className="block text-[12px] text-fg-3">
                einschließlich aller Interaktion
              </span>
            </span>
            <span className="flex items-baseline gap-2">
              <input
                type="number"
                min={1}
                max={480}
                value={soll}
                onChange={(e) => {
                  setSoll(Number(e.target.value));
                  setKopiert(false);
                  setGespeichert("nein");
                }}
                className="w-[74px] rounded-md border border-hair bg-stage px-2 py-1.5 text-right font-mono text-lg tabular-nums text-fg focus:border-[color:var(--accent)] focus:outline-none"
              />
              <span className="text-fg-3">Min</span>
            </span>
          </label>

          {/*
            Die Rechnung, die alles zusammenzieht. Sie steht hier und nicht erst
            im Prompt des Agenten: Ob es passt, soll man sehen, bevor man einen
            Agenten dafür bemüht.
          */}
          <dl className="mt-5 grid grid-cols-[1fr_auto] gap-x-4 gap-y-1.5 font-mono text-[13px] tabular-nums">
            <dt className="text-fg-3">Gemessen</dt>
            <dd className="m-0 text-right text-fg-2">{alsUhr(gesamtdauer(entwurf))}</dd>
            <dt className="text-fg-3">Interaktion (geschätzt)</dt>
            <dd className="m-0 text-right text-fg-2">+ {alsUhr(interaktion * 1000)}</dd>
            <dt className="border-t border-hair pt-1.5 text-fg">Zusammen</dt>
            <dd className="m-0 border-t border-hair pt-1.5 text-right text-fg">
              {alsUhr(gesamtMs)}
            </dd>
            <dt className={abweichung > 0 ? "text-b1" : "text-b4"}>
              {abweichung > 0 ? "Über dem Budget" : "Unter dem Budget"}
            </dt>
            <dd
              className={`m-0 text-right ${abweichung > 0 ? "text-b1" : "text-b4"}`}
            >
              {abweichung > 0 ? "+" : "−"} {alsUhr(Math.abs(abweichung))}
            </dd>
          </dl>

          <p className="mt-3 mb-0 text-[13px] leading-relaxed text-fg-3">
            Übernommen endet der Vortrag um{" "}
            <span className="font-mono text-fg-2">{endeLaut(planAusProbe(fertig))}</span>.
          </p>
        </div>

        <div className="border-t border-hair p-6 pt-5">
          <button
            type="button"
            onClick={uebernehmen}
            disabled={gespeichert === "laeuft"}
            className="w-full rounded-md border border-[color:var(--accent)] bg-[color:var(--accent)]/15 px-3 py-2.5 text-sm text-fg transition-colors hover:bg-[color:var(--accent)]/25 disabled:opacity-60"
          >
            {gespeichert === "ja"
              ? "✓ Zeiten übernommen"
              : gespeichert === "laeuft"
                ? "wird gespeichert …"
                : gespeichert === "fehler"
                  ? "Nicht gespeichert — nochmal?"
                  : "Zeiten übernehmen"}
          </button>
          <p className="mt-2 mb-0 text-center text-[12px] leading-relaxed text-fg-3">
            Ersetzt die geplanten Uhrzeiten der Folien. Bleibt gespeichert, auch wenn
            die Eingaben der Teilnehmer zurückgesetzt werden.
          </p>

          <button
            type="button"
            onClick={kopieren}
            className="mt-3 w-full rounded-md border border-hair px-3 py-2.5 text-sm text-fg-2 transition-colors hover:border-fg-3 hover:text-fg"
          >
            {kopiert ? "✓ In der Zwischenablage" : "Prompt für Agenten kopieren"}
          </button>

          <button
            type="button"
            onClick={schliessen}
            className="mt-2 w-full rounded-md px-3 py-2 text-sm text-fg-3 transition-colors hover:text-fg-2"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
}
