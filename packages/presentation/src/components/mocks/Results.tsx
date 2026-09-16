import { useMemo } from "react";
import type { Interaction, ResultsMock } from "@/slides/types";
import { SECTIONS } from "@/slides/data";
import { useLiveAnswers, type LiveAnswer } from "@/audience/useLiveAnswers";
import { QrTile } from "./StepMocks";

/** Die Interaktion aus den Foliendaten holen — Fragen stehen nur dort. */
function findInteraction(id: string): Interaction | null {
  for (const section of SECTIONS)
    for (const panel of section.panels)
      if (panel.audience?.id === id) return panel.audience;
  return null;
}

/**
 * Kreuztabelle zweier Fragen.
 *
 * Gezählt wird je Teilnehmer, nicht je Antwort: Nur wer beide Fragen
 * beantwortet hat, landet in einer Zelle. Das ist der Punkt der Folie — man
 * kann beunruhigt sein und sich trotzdem freuen, und das sieht man erst,
 * wenn beide Antworten zusammengehören.
 */
function Matrix({ m }: { m: ResultsMock }) {
  const poll = findInteraction(m.of);
  const questions = poll?.kind === "poll" ? poll.questions : [];
  const [qx, qy] = questions;

  const ids = useMemo(
    () => (qx && qy ? [`${m.of}:${qx.id}`, `${m.of}:${qy.id}`] : []),
    [m.of, qx, qy],
  );
  const answers = useLiveAnswers(ids);

  const { cells, complete, teilnehmer, max } = useMemo(() => {
    const byParticipant = new Map<string, Record<string, string>>();
    for (const a of answers) {
      const q = a.interactionId.split(":")[1];
      const entry = byParticipant.get(a.participantId) ?? {};
      entry[q] = a.value;
      byParticipant.set(a.participantId, entry);
    }
    const grid: Record<string, number> = {};
    let done = 0;
    for (const entry of byParticipant.values()) {
      const x = qx && entry[qx.id];
      const y = qy && entry[qy.id];
      if (!x || !y) continue;
      done++;
      grid[`${x}|${y}`] = (grid[`${x}|${y}`] ?? 0) + 1;
    }
    return {
      cells: grid,
      complete: done,
      teilnehmer: byParticipant.size,
      max: Math.max(1, ...Object.values(grid)),
    };
  }, [answers, qx, qy]);

  if (!qx || !qy) return <Placeholder text="Umfrage nicht gefunden" />;

  return (
    <div className="w-full">
      <div
        className="grid gap-[6px]"
        style={{ gridTemplateColumns: `220px repeat(${qx.options.length}, 1fr)` }}
      >
        {/* Kopfzeile: welche Frage die Spalten meinen */}
        <div />
        <div
          className="pb-[6px] font-mono text-[22px] tracking-[0.08em] text-[color:var(--accent)] uppercase"
          style={{ gridColumn: `span ${qx.options.length}` }}
        >
          {m.axes?.x ?? qx.text} →
        </div>

        <div className="flex items-end justify-end pr-[18px] pb-[10px] text-right font-mono text-[22px] tracking-[0.08em] text-[color:var(--accent)] uppercase">
          {m.axes?.y ?? qy.text} ↓
        </div>
        {qx.options.map((o) => (
          <div
            key={o.value}
            className="pb-[10px] text-center font-mono text-[22px] tracking-[0.08em] text-fg-3 uppercase"
          >
            {o.label}
          </div>
        ))}

        {qy.options.map((row) => (
          <Row key={row.value}>
            <div className="flex items-center justify-end pr-[18px] text-right font-mono text-[22px] tracking-[0.08em] text-fg-3 uppercase">
              {row.label}
            </div>
            {qx.options.map((col) => {
              const n = cells[`${col.value}|${row.value}`] ?? 0;
              return (
                <div
                  key={col.value}
                  className="grid h-[132px] place-items-center rounded-lg border transition-colors duration-500"
                  style={{
                    borderColor: n ? "color-mix(in srgb, var(--accent) 45%, transparent)" : "var(--color-hair)",
                    background: n
                      ? `color-mix(in srgb, var(--accent) ${Math.round((n / max) * 30)}%, var(--color-stage-2))`
                      : "var(--color-stage-2)",
                  }}
                >
                  <span
                    className={`font-mono text-[54px] tabular-nums ${n ? "text-fg" : "text-fg-3/40"}`}
                  >
                    {n || "–"}
                  </span>
                </div>
              );
            })}
          </Row>
        ))}
      </div>

      <p className="m-0 mt-[22px] text-center font-mono text-[23px] text-fg-3">
        {complete} von {teilnehmer} {teilnehmer === 1 ? "Teilnehmer" : "Teilnehmern"} vollständig
      </p>
    </div>
  );
}

/** Grid-Zeilen brauchen ein Fragment mit Schlüssel, sonst meckert React. */
function Row({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

/** Freitextantworten, wie sie eintreffen. */
function AnswerList({ m }: { m: ResultsMock }) {
  const answers = useLiveAnswers(useMemo(() => [m.of], [m.of]));
  const neueste = [...answers].reverse();
  const sichtbar = neueste.slice(0, 12);
  const rest = neueste.length - sichtbar.length;

  if (!answers.length) return <Placeholder text="Noch keine Antworten — sie erscheinen hier, sobald sie eintreffen." />;

  return (
    <div className="w-full">
      <div className="grid grid-cols-3 gap-[14px]">
        {sichtbar.map((a: LiveAnswer) => (
          <div
            key={`${a.participantId}-${a.at}`}
            className="rounded-lg border border-hair bg-stage-2 px-[22px] py-[18px] text-[27px] leading-[1.3] text-fg-2"
          >
            {a.value}
          </div>
        ))}
      </div>
      <p className="m-0 mt-[22px] text-center font-mono text-[23px] text-fg-3">
        {answers.length} {answers.length === 1 ? "Antwort" : "Antworten"}
        {rest > 0 && ` · ${rest} weitere nicht gezeigt`}
      </p>
    </div>
  );
}

function Placeholder({ text }: { text: string }) {
  return (
    <div className="grid w-full place-items-center rounded-lg border border-dashed border-hair bg-stage-2 px-[40px] py-[90px]">
      <p className="m-0 text-center font-mono text-[26px] text-fg-3">{text}</p>
    </div>
  );
}

export function ResultsView({ m }: { m: ResultsMock }) {
  const inhalt = m.as === "matrix" ? <Matrix m={m} /> : <AnswerList m={m} />;
  if (!m.qr) return inhalt;

  /*
    Solange die Umfrage läuft, bleibt der Code stehen — wer später hereinkommt,
    soll noch mitmachen können, ohne dass wir zurückblättern müssen.
  */
  return (
    <div className="flex w-full items-center gap-[56px]">
      <div className="min-w-0 flex-1">{inhalt}</div>
      <div className="shrink-0 text-center">
        <QrTile size={240} />
        <p className="m-0 mt-[16px] font-mono text-[20px] tracking-[0.1em] text-fg-3 uppercase">
          Noch dabei?
        </p>
      </div>
    </div>
  );
}
