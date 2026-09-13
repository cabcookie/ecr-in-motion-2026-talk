import { SLIDES, TOTAL, blockOf } from "@/slides/data";
import { useNavigation } from "@/nav/useNavigation";
import { useAnswers } from "@/audience/useAnswers";
import { InteractionView } from "@/audience/Interactions";

const ACCENT = ["", "var(--color-b1)", "var(--color-b2)", "var(--color-b3)", "var(--color-b4)"];

/**
 * Was die Teilnehmer auf dem Handy sehen.
 *
 * Bewusst nicht die Folie: nur ihre Überschrift, damit man weiß, wo man ist,
 * und darunter die Interaktion, die zum aktuellen Klick-Schritt gehört. Die
 * Ansicht folgt der Live-View; steuern kann sie nichts.
 *
 * Wer das Handy sperrt und zurückkommt, landet auf dem aktuellen Stand und
 * findet seine Eingaben wieder — der Stand kommt vom Server, die Eingaben aus
 * dem lokalen Speicher und vom Server.
 */
export function AudienceView() {
  const { index, step, connected } = useNavigation(TOTAL, { readOnly: true, keyboard: false });
  const { answers, submit, pending } = useAnswers();

  const slide = SLIDES[index];
  const block = blockOf(slide.b);
  const interaction = slide.audience?.[step] ?? null;

  return (
    <div
      data-view="audience"
      className="min-h-dvh overflow-y-auto bg-stage text-fg"
      style={{ ["--accent" as string]: ACCENT[slide.b] }}
    >
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
            {connected ? `Folie ${slide.n}` : "getrennt"}
          </span>
        </header>

        <h1 className="m-0 font-display text-3xl leading-tight font-extrabold tracking-tight text-balance">
          {slide.headline}
        </h1>

        {interaction ? (
          <InteractionView
            interaction={interaction}
            value={answers[interaction.id]}
            onAnswer={(v) => void submit(interaction.id, v)}
          />
        ) : (
          <div className="rounded-2xl border border-dashed border-hair px-5 py-8 text-center">
            <p className="m-0 text-base leading-relaxed text-fg-3">
              Hier ist gerade nichts zu tun. Die Seite folgt dem Vortrag von allein — lassen Sie
              sie einfach offen.
            </p>
          </div>
        )}

        <p className="m-0 text-center font-mono text-[10px] tracking-[0.12em] text-fg-3 uppercase">
          {pending ? "wird gesendet …" : "ECR Masterclass"}
        </p>
      </div>
    </div>
  );
}
