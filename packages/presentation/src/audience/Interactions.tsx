import { useEffect, useState } from "react";
import type { Interaction } from "@/slides/types";

const CARD = "rounded-2xl border border-hair bg-stage-2 p-5";
const LABEL = "font-mono text-[11px] tracking-[0.14em] uppercase text-fg-3";

/** Eine Frage mit festen Antwortmöglichkeiten. Die Wahl ist jederzeit änderbar. */
function Poll({
  interaction,
  value,
  onAnswer,
}: {
  interaction: Extract<Interaction, { kind: "poll" }>;
  value?: string;
  onAnswer: (v: string) => void;
}) {
  return (
    <div className={CARD}>
      <p className="m-0 mb-5 text-xl leading-snug font-medium text-balance text-fg">
        {interaction.question.text}
      </p>
      <div className="grid gap-3">
        {interaction.question.options.map((o) => {
          const chosen = value === o.value;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onAnswer(o.value)}
              aria-pressed={chosen}
              className={`rounded-xl border px-5 py-4 text-left text-lg transition-colors ${
                chosen
                  ? "border-[color:var(--accent)] bg-[color:var(--accent)]/15 text-fg"
                  : "border-hair bg-stage text-fg-2 active:bg-stage-3"
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
      {value && <p className="m-0 mt-4 text-sm text-fg-3">Gespeichert. Sie können ändern.</p>}
    </div>
  );
}

/** Freitext mit Beispielen zum Antippen — auf dem Handy tippt niemand gern lang. */
function FreeText({
  interaction,
  value,
  onAnswer,
}: {
  interaction: Extract<Interaction, { kind: "text" }>;
  value?: string;
  onAnswer: (v: string) => void;
}) {
  const [draft, setDraft] = useState(value ?? "");
  useEffect(() => setDraft(value ?? ""), [value]);
  const dirty = draft.trim() !== (value ?? "").trim();

  return (
    <div className={CARD}>
      <p className="m-0 mb-4 text-xl leading-snug font-medium text-balance text-fg">
        {interaction.prompt}
      </p>

      <div className="mb-4 flex flex-wrap gap-2">
        {interaction.examples.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => setDraft(ex)}
            className="rounded-full border border-hair bg-stage px-3 py-1.5 text-sm text-fg-3 active:bg-stage-3"
          >
            {ex}
          </button>
        ))}
      </div>

      <textarea
        id={`text-${interaction.id}`}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={interaction.placeholder}
        rows={3}
        className="w-full resize-none rounded-xl border border-hair bg-stage px-4 py-3 text-lg text-fg placeholder:text-fg-3 focus:border-[color:var(--accent)] focus:outline-none"
      />

      <button
        type="button"
        disabled={!draft.trim() || !dirty}
        onClick={() => onAnswer(draft.trim())}
        className="mt-3 w-full rounded-xl bg-[color:var(--accent)] px-5 py-4 text-lg font-semibold text-stage disabled:opacity-30"
      >
        {dirty ? "Senden" : "Gesendet"}
      </button>
    </div>
  );
}

/** Öffnet das Mailprogramm mit vorformuliertem Text. */
function MailTo({
  interaction,
}: {
  interaction: Extract<Interaction, { kind: "mailto" }>;
}) {
  const href =
    `mailto:${interaction.to}` +
    `?subject=${encodeURIComponent(interaction.subject)}` +
    `&body=${encodeURIComponent(interaction.body)}`;

  return (
    <div className={CARD}>
      <p className="m-0 mb-4 text-lg leading-relaxed text-fg-2">{interaction.hint}</p>
      <a
        href={href}
        className="block rounded-xl bg-[color:var(--accent)] px-5 py-4 text-center text-lg font-semibold text-stage"
      >
        {interaction.label}
      </a>
    </div>
  );
}

/** Zwischen den Interaktionen: nur ein Hinweis, damit niemand wegklickt. */
function Wait({ interaction }: { interaction: Extract<Interaction, { kind: "wait" }> }) {
  return (
    <div className={`${CARD} text-center`}>
      <p className="m-0 text-lg leading-relaxed text-fg-2">{interaction.message}</p>
    </div>
  );
}

export function InteractionView({
  interaction,
  value,
  onAnswer,
}: {
  interaction: Interaction;
  value?: string;
  onAnswer: (v: string) => void;
}) {
  switch (interaction.kind) {
    case "poll":
      return <Poll interaction={interaction} value={value} onAnswer={onAnswer} />;
    case "text":
      return <FreeText interaction={interaction} value={value} onAnswer={onAnswer} />;
    case "mailto":
      return <MailTo interaction={interaction} />;
    case "wait":
      return <Wait interaction={interaction} />;
  }
}

export { LABEL };
