import { BLOCKS, SLIDES, TOTAL, blockOf } from "@/slides/data";
import { useNavigation } from "@/nav/useNavigation";
import { StagePreview } from "./StagePreview";
import { Timer } from "./Timer";

const ACCENT = ["", "var(--color-b1)", "var(--color-b2)", "var(--color-b3)", "var(--color-b4)"];

function Note({ label, tone, children }: { label: string; tone: string; children: string }) {
  return (
    <div className="grid grid-cols-[92px_1fr] items-start gap-4 border-b border-hair py-3 last:border-b-0">
      <dt className={`pt-0.5 font-mono text-[10px] tracking-[0.12em] uppercase ${tone}`}>
        {label}
      </dt>
      <dd className="m-0 text-[15px] leading-relaxed text-fg-2">{children}</dd>
    </div>
  );
}

export function OperatorView() {
  const { index, next, prev, goto, connected } = useNavigation(TOTAL);
  const slide = SLIDES[index];
  const block = blockOf(slide.b);
  const upcoming = SLIDES[index + 1];

  return (
    <div
      className="h-full overflow-y-auto bg-stage text-fg"
      style={{ ["--accent" as string]: ACCENT[slide.b] }}
    >
      <div className="mx-auto flex max-w-[1400px] flex-col gap-5 px-5 py-5">
        {/* Kopf */}
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-hair pb-4">
          <div className="flex items-center gap-3">
            <span
              className="size-3 rounded-full"
              style={{ background: "var(--accent)" }}
              aria-hidden
            />
            <div>
              <div className="font-mono text-[11px] tracking-[0.12em] text-fg-3 uppercase">
                Block {block.n} · {block.tab} · {block.budget}
              </div>
              <div className="font-display text-lg font-bold">{block.title}</div>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <Timer />
            <div className="text-right">
              <div className="font-mono text-2xl tabular-nums">
                {String(slide.n).padStart(2, "0")}
                <span className="text-fg-3">/{TOTAL}</span>
              </div>
              <div className="font-mono text-[10px] tracking-[0.1em] uppercase">
                <span className={connected ? "text-b4" : "text-b1"}>
                  {connected ? "● Live gekoppelt" : "● nicht gekoppelt"}
                </span>
              </div>
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,560px)_1fr]">
          {/* Vorschau */}
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="mb-2 flex items-baseline gap-2 font-mono text-[10px] tracking-[0.14em] text-fg-3 uppercase">
                Auf dem Beamer
                <span className="normal-case tracking-normal text-fg-3/70">
                  — Vollbild zum Bedienen eingebetteter Anwendungen
                </span>
              </h2>
              <StagePreview slide={slide} width={560} expandable />
            </div>

            <div>
              <h2 className="mb-2 font-mono text-[10px] tracking-[0.14em] text-fg-3 uppercase">
                Als Nächstes
              </h2>
              {upcoming ? (
                <StagePreview slide={upcoming} width={320} />
              ) : (
                <p className="text-sm text-fg-3">Letzte Folie.</p>
              )}
            </div>
          </div>

          {/* Notizen */}
          <div className="min-w-0">
            <h2 className="mb-1 font-mono text-[10px] tracking-[0.14em] text-fg-3 uppercase">
              {slide.kind}
            </h2>
            <h3 className="mb-4 font-display text-2xl leading-tight font-bold text-balance">
              {slide.headline}
            </h3>

            <dl className="m-0">
              {slide.say && (
                <Note label="Gesagt" tone="text-fg-3">
                  {slide.say}
                </Note>
              )}
              {slide.inter && (
                <Note label="Interaktion" tone="text-[color:var(--accent)]">
                  {slide.inter}
                </Note>
              )}
              {slide.app && (
                <Note label="App liefert" tone="text-b3">
                  {slide.app}
                </Note>
              )}
              {slide.note && (
                <Note label="Hinweis" tone="text-fg-3">
                  {slide.note}
                </Note>
              )}
              {slide.open && (
                <Note label="Offen" tone="text-b2">
                  {slide.open}
                </Note>
              )}
            </dl>
          </div>
        </div>

        {/* Steuerung */}
        <div className="sticky bottom-0 flex items-center gap-4 border-t border-hair bg-stage py-3">
          <button
            type="button"
            onClick={prev}
            disabled={index === 0}
            className="rounded border border-hair px-4 py-2 text-sm font-medium hover:border-fg-3 disabled:opacity-30"
          >
            ← Zurück
          </button>
          <button
            type="button"
            onClick={next}
            disabled={index === TOTAL - 1}
            className="rounded border border-hair px-4 py-2 text-sm font-medium hover:border-fg-3 disabled:opacity-30"
          >
            Weiter →
          </button>
          <p className="m-0 ml-auto font-mono text-[11px] text-fg-3">
            Pfeiltasten und Leertaste steuern hier genauso
          </p>
        </div>

        {/* Folienleiste */}
        <div className="flex flex-col gap-2">
          {BLOCKS.map((b) => (
            <div key={b.n} className="flex items-center gap-2">
              <span
                className="w-24 shrink-0 font-mono text-[10px] tracking-[0.1em] uppercase"
                style={{ color: ACCENT[b.n] }}
              >
                {b.n} · {b.tab}
              </span>
              <div className="flex flex-wrap gap-1">
                {SLIDES.filter((s) => s.b === b.n).map((s) => {
                  const current = s.n === slide.n;
                  return (
                    <button
                      key={s.n}
                      type="button"
                      onClick={() => goto(s.n - 1)}
                      title={s.headline}
                      className={`h-7 w-9 rounded font-mono text-[11px] tabular-nums transition-colors ${
                        current ? "text-stage" : "border border-hair text-fg-3 hover:text-fg"
                      }`}
                      style={current ? { background: ACCENT[b.n] } : undefined}
                    >
                      {String(s.n).padStart(2, "0")}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
