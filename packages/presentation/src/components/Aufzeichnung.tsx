import { useEffect, useRef, useState } from "react";
import {
  alsUhr,
  geplanteMinuten,
  gesamtdauer,
  promptFuerAgenten,
  type Halt,
  type Probe,
} from "@/probe/aufzeichnung";

/**
 * Der Aufnahmeknopf in der Operator-Ansicht.
 *
 * Drücken heißt: an den Anfang springen, die Uhr auf jetzt setzen und jeden
 * Folienstand mitschreiben. Noch einmal drücken beendet die Probe und fragt das
 * Einzige, was die Maschine nicht wissen kann — ob genug Raum für Interaktion
 * war. Danach liegt ein Prompt in der Zwischenablage, den ein Agent gegen den
 * Plan rechnen kann.
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
    setProbe({ begonnen: Date.now(), haelte: [] });
  }

  function stoppen() {
    if (!probe) return;
    const beendet = { ...probe, beendet: Date.now() };
    setProbe(null);
    setDialog(beendet);
  }

  return (
    <>
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

      {dialog && <Auswertung probe={dialog} schliessen={() => setDialog(null)} />}
    </>
  );
}

function halt(index: number, step: number, begonnen: number): Halt {
  return { index, step, bei: Date.now() - begonnen };
}

/**
 * Was nach dem Stopp erscheint.
 *
 * Eine einzige Frage, und sie ist nicht Beiwerk: Ob genug Zeit für Interaktion
 * war, kann die Aufzeichnung nicht wissen. Wer allein probt, klickt schneller
 * durch als vor achtzig Leuten, die gerade auf ihren Handys tippen — und ohne
 * diese Angabe würde der Agent die Probe für die Wirklichkeit halten.
 */
function Auswertung({ probe, schliessen }: { probe: Probe; schliessen: () => void }) {
  const [genug, setGenug] = useState<boolean | null>(null);
  /*
    Vorbelegt aus den Blockbudgets — dort steht die Zahl schon, und zwei Orte
    für dieselbe Angabe gehen auseinander. Änderbar bleibt sie trotzdem: Wer
    kürzer eingeladen ist als geplant, will das hier korrigieren und nicht in
    den Foliendaten.
  */
  const [soll, setSoll] = useState(geplanteMinuten());
  const [kopiert, setKopiert] = useState(false);

  async function kopieren() {
    const text = promptFuerAgenten({
      ...probe,
      genugInteraktion: genug ?? false,
      sollMinuten: soll,
    });
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
      <div className="w-full max-w-[560px] rounded-lg border border-hair bg-stage-2 p-6">
        <div className="font-mono text-[11px] tracking-[0.12em] text-fg-3 uppercase">
          Probe beendet
        </div>
        <div className="mt-1 font-display text-2xl font-bold">
          {alsUhr(gesamtdauer(probe))} über {probe.haelte.length} Folienstände
        </div>

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
              }}
              className="w-[74px] rounded-md border border-hair bg-stage px-2 py-1.5 text-right font-mono text-lg tabular-nums text-fg focus:border-[color:var(--accent)] focus:outline-none"
            />
            <span className="text-fg-3">Min</span>
          </span>
        </label>

        <p className="mt-5 text-fg-2">
          Hast Du dabei ausreichend Zeit für Interaktion mit dem Publikum
          vorgesehen?
        </p>
        <div className="mt-3 flex gap-3">
          {[
            { wert: true, text: "Ja, ist enthalten" },
            { wert: false, text: "Nein, kommt noch dazu" },
          ].map((o) => (
            <button
              key={String(o.wert)}
              type="button"
              onClick={() => {
                setGenug(o.wert);
                setKopiert(false);
              }}
              className={`flex-1 rounded-md border px-3 py-2 text-sm transition-colors ${
                genug === o.wert
                  ? "border-[color:var(--accent)] bg-[color:var(--accent)]/15 text-fg"
                  : "border-hair text-fg-3 hover:border-fg-3 hover:text-fg-2"
              }`}
            >
              {o.text}
            </button>
          ))}
        </div>

        {/*
          Der Kopierknopf erscheint erst nach der Antwort — ohne sie wäre der
          Prompt unvollständig, und ein Agent würde die fehlende
          Interaktionszeit nicht einrechnen können.
        */}
        {genug !== null && (
          <button
            type="button"
            onClick={kopieren}
            className="mt-5 w-full rounded-md border border-[color:var(--accent)] bg-[color:var(--accent)]/15 px-3 py-2.5 text-sm text-fg transition-colors hover:bg-[color:var(--accent)]/25"
          >
            {kopiert ? "✓ In der Zwischenablage" : "Prompt für Agenten kopieren"}
          </button>
        )}

        <button
          type="button"
          onClick={schliessen}
          className="mt-3 w-full rounded-md px-3 py-2 text-sm text-fg-3 transition-colors hover:text-fg-2"
        >
          Schließen
        </button>
      </div>
    </div>
  );
}
