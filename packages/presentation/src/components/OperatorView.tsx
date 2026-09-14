import { BLOCKS, SECTIONS, TOTAL, blockOf } from "@/slides/data";
import { useNavigation } from "@/nav/useNavigation";
import { StagePreview } from "./StagePreview";
import { AudiencePreview } from "./AudiencePreview";
import { Schedule } from "./Schedule";

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
  const { index, step, next, prev, goto, connected, transport } = useNavigation(TOTAL);
  const section = SECTIONS[index];
  const block = blockOf(section.b);
  const panel = section.panels[step];
  /** Nächstes Panel — im selben Abschnitt oder das erste des nächsten. */
  const nextSection = step + 1 < section.panels.length ? section : SECTIONS[index + 1];
  const nextPanel = step + 1 < section.panels.length ? step + 1 : 0;

  return (
    <div
      className="h-full overflow-y-auto bg-stage text-fg"
      style={{ ["--accent" as string]: ACCENT[section.b] }}
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
                Block {block.n} · {block.tab}
              </div>
              <div className="font-display text-lg font-bold">{block.title}</div>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <Schedule at={panel?.at} />
            <div className="text-right">
              <div className="font-mono text-2xl tabular-nums">
                {String(section.n).padStart(2, "0")}
                {section.panels.length > 1 && (
                  <span className="text-fg-3">.{step + 1}</span>
                )}
                <span className="text-fg-3">/{TOTAL}</span>
              </div>
              <div className="font-mono text-[10px] tracking-[0.1em] uppercase">
                <span className={connected ? "text-b4" : "text-b1"}>
                  {connected
                    ? transport === "realtime"
                      ? "● Fernsteuerung (AWS)"
                      : "● gekoppelt (dieser Browser)"
                    : "● nicht gekoppelt"}
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
              <StagePreview section={section} panel={step} width={560} expandable />
            </div>

            {/*
              Die nächste Folie ist nur halb so breit wie die aktuelle. Der
              Platz daneben trägt die Zuschauersicht — so sieht der
              Vortragende, was gerade auf den Handys steht.
            */}
            <div className="flex items-start gap-4">
              <div>
                <h2 className="mb-2 font-mono text-[10px] tracking-[0.14em] text-fg-3 uppercase">
                  Als Nächstes
                </h2>
                {nextSection ? (
                  <StagePreview section={nextSection} panel={nextPanel} width={320} />
                ) : (
                  <p className="text-sm text-fg-3">Letzte Folie.</p>
                )}
              </div>

              <div>
                <h2 className="mb-2 font-mono text-[10px] tracking-[0.14em] text-fg-3 uppercase">
                  Auf den Handys
                </h2>
                <AudiencePreview width={200} height={300} />
              </div>
            </div>
          </div>

          {/*
            Der gesprochene Text führt die Spalte an und ist groß genug zum
            Vorlesen. Der Folientitel steht nicht noch einmal hier — er ist
            in der Vorschau daneben zu sehen.
          */}
          <div className="flex min-w-0 flex-col">
            {panel?.say && (
              <div className="mb-5">
                <p className="m-0 mb-2 font-mono text-[10px] tracking-[0.14em] text-fg-3 uppercase">
                  Sprechertext
                </p>
                <p className="m-0 text-[26px] leading-[1.45] text-pretty text-fg">{panel.say}</p>
              </div>
            )}

            <dl className="m-0">
              {panel?.inter && (
                <Note label="Interaktion" tone="text-[color:var(--accent)]">
                  {panel?.inter!}
                </Note>
              )}
              {panel?.app && (
                <Note label="App liefert" tone="text-b3">
                  {panel?.app!}
                </Note>
              )}
              {panel?.note && (
                <Note label="Hinweis" tone="text-fg-3">
                  {panel?.note!}
                </Note>
              )}
              {panel?.open && (
                <Note label="Offen" tone="text-b2">
                  {panel?.open!}
                </Note>
              )}
            </dl>

                    <div className="mt-auto flex flex-col gap-2 border-t border-hair pt-4">
            {BLOCKS.map((b) => (
              <div key={b.n} className="flex items-center gap-2">
                <span
                  className="w-24 shrink-0 font-mono text-[10px] tracking-[0.1em] uppercase"
                  style={{ color: ACCENT[b.n] }}
                >
                  {b.n} · {b.tab}
                </span>
                <div className="flex flex-wrap gap-1">
                  {SECTIONS.filter((s) => s.b === b.n).map((s) => {
                    const current = s.n === section.n;
                    return (
                      <button
                        key={s.n}
                        type="button"
                        onClick={() => goto(s.n - 1)}
                        title={`${s.panels[0]?.at ?? ""} ${s.title}`}
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

      </div>
    </div>
  );
}
