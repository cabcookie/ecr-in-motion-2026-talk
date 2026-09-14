import { useMemo } from "react";
import { SECTIONS, TOTAL, blockOf } from "@/slides/data";
import type { Interaction } from "@/slides/types";
import { useNavigation } from "@/nav/useNavigation";
import { useAnswers } from "@/audience/useAnswers";
import { InteractionView } from "@/audience/Interactions";

const ACCENT = ["", "var(--color-b1)", "var(--color-b2)", "var(--color-b3)", "var(--color-b4)"];

/**
 * Ab hier ist das Publikum dabei: Abschnitt 5, zweites Panel — dort steht der
 * QR-Code auf der Leinwand und die Teilnehmer kommen auf diese Seite.
 *
 * Davor soll das Handy nichts zeigen als den Hinweis, dass gleich etwas kommt.
 * Wer früh da ist, soll nicht die Überschriften des Vortrags mitlesen; die
 * stehen groß auf der Leinwand.
 */
const START = { index: 4, step: 1 };

function vorDemStart(index: number, step: number): boolean {
  return index < START.index || (index === START.index && step < START.step);
}

/**
 * Interaktionen, die offen bleiben.
 *
 * Die Mail an Lisa darf bis zum Ende geschrieben werden, und wer bei der
 * Umfrage zu langsam war, soll sie nachholen können. Alles, was bis zum
 * aktuellen Stand vorkam und `persist` trägt, bleibt erreichbar.
 */
function persistentUpTo(index: number, panel: number, current: Interaction | null) {
  const out: Interaction[] = [];
  for (let s = 0; s <= index; s++) {
    const section = SECTIONS[s];
    const last = s === index ? panel : section.panels.length - 1;
    for (let p = 0; p <= last; p++) {
      const a = section.panels[p]?.audience;
      if (a && "persist" in a && a.persist && a.id !== current?.id) out.push(a);
    }
  }
  return out;
}

/**
 * Was die Teilnehmer auf dem Handy sehen.
 *
 * Bewusst nicht die Folie: nur ihre Überschrift, damit man weiß, wo man ist,
 * und darunter die Interaktion, die zum aktuellen Panel gehört. Die Ansicht
 * folgt der Leinwand; steuern kann sie nichts.
 *
 * Wer das Handy sperrt und zurückkommt, landet auf dem aktuellen Stand und
 * findet seine Eingaben wieder.
 */
export function AudienceView() {
  const { index, step, connected } = useNavigation(TOTAL, { readOnly: true, keyboard: false });
  const { answers, submit, pending } = useAnswers();

  const section = SECTIONS[index];
  const block = blockOf(section.b);
  const wartet = vorDemStart(index, step);
  const current = section.panels[step]?.audience ?? null;
  const stillOpen = useMemo(
    () => persistentUpTo(index, step, current),
    [index, step, current],
  );

  return (
    <div
      data-view="audience"
      className="min-h-dvh overflow-y-auto bg-stage text-fg"
      style={{ ["--accent" as string]: ACCENT[section.b] }}
    >
      {wartet ? (
        <div className="mx-auto flex min-h-dvh max-w-lg items-center justify-center px-6">
          <p className="m-0 text-center text-lg leading-relaxed text-balance text-fg-2">
            Gleich geht es los. Lassen Sie diese Seite offen — sie folgt dem Vortrag von allein.
          </p>
        </div>
      ) : (
      <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-6">
        <header className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-2 font-mono text-[11px] tracking-[0.14em] text-fg-3 uppercase">
            <span className="size-2 rounded-full" style={{ background: "var(--accent)" }} />
            {block.n} · {block.tab}
          </span>
          <span
            className={`font-mono text-[11px] tracking-[0.1em] uppercase ${
              connected ? "text-fg-3" : "text-b1"
            }`}
          >
            {connected ? `Abschnitt ${section.n}` : "getrennt"}
          </span>
        </header>

        <h1 className="m-0 font-display text-3xl leading-tight font-extrabold tracking-tight text-balance">
          {section.title}
        </h1>

        {current ? (
          <InteractionView interaction={current} answers={answers} onAnswer={submit} />
        ) : (
          <div className="rounded-2xl border border-dashed border-hair px-5 py-8 text-center">
            <p className="m-0 text-base leading-relaxed text-fg-3">
              Hier ist gerade nichts zu tun. Die Seite folgt dem Vortrag von allein — lassen Sie
              sie einfach offen.
            </p>
          </div>
        )}

        {stillOpen.length > 0 && (
          <section className="grid gap-3">
            <h2 className="m-0 font-mono text-[11px] tracking-[0.14em] text-fg-3 uppercase">
              Weiterhin möglich
            </h2>
            {stillOpen.map((i) => (
              <InteractionView key={i.id} interaction={i} answers={answers} onAnswer={submit} />
            ))}
          </section>
        )}

        <p className="m-0 text-center font-mono text-[10px] tracking-[0.12em] text-fg-3 uppercase">
          {pending ? "wird gesendet …" : "ECR Masterclass"}
        </p>
      </div>
      )}
    </div>
  );
}
