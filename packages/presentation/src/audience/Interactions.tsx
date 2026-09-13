import { useEffect, useRef, useState } from "react";
import type { Interaction } from "@/slides/types";
import { SEED_MAIL } from "@/slides/agent";
import { useAgentChat } from "./useAgentChat";

const CARD = "rounded-2xl border border-hair bg-stage-2 p-5";

/**
 * Alle Fragen einer Umfrage auf einmal — der Vortragende klickt dazwischen
 * nicht weiter, die Auswertung auf der Leinwand füllt sich nach und nach.
 */
function Poll({
  interaction,
  answers,
  onAnswer,
}: {
  interaction: Extract<Interaction, { kind: "poll" }>;
  answers: Record<string, string>;
  onAnswer: (key: string, v: string) => void;
}) {
  return (
    <div className="grid gap-4">
      {interaction.questions.map((q) => {
        const key = `${interaction.id}:${q.id}`;
        const chosen = answers[key];
        return (
          <div className={CARD} key={q.id}>
            <p className="m-0 mb-4 text-xl leading-snug font-medium text-balance text-fg">
              {q.text}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {q.options.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => onAnswer(key, o.value)}
                  aria-pressed={chosen === o.value}
                  className={`rounded-xl border px-2 py-4 text-base transition-colors ${
                    chosen === o.value
                      ? "border-[color:var(--accent)] bg-[color:var(--accent)]/15 text-fg"
                      : "border-hair bg-stage text-fg-2 active:bg-stage-3"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        );
      })}
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
function MailTo({ interaction }: { interaction: Extract<Interaction, { kind: "mailto" }> }) {
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
      {interaction.privacy && (
        <p className="m-0 mt-4 text-sm leading-relaxed text-fg-3">{interaction.privacy}</p>
      )}
      {interaction.until && (
        <p className="m-0 mt-2 font-mono text-[11px] tracking-wider text-fg-3 uppercase">
          Bis {interaction.until} möglich
        </p>
      )}
    </div>
  );
}

/**
 * Gespräch mit dem Agenten.
 *
 * Das Gespräch beginnt nicht mit einer Frage des Teilnehmers, sondern mit der
 * Mail von Hallbach — derselben, die in Abschnitt 2 auf der Leinwand stand.
 * Der Agent hat den Systemprompt, aber keine Tools: er ordnet die Mail ein und
 * fragt nach den Zahlen, die ihm fehlen. Die Teilnehmer sind seine Werkzeuge.
 *
 * Der Systemprompt ist aufklappbar — er ist auf dieser Stufe der eigentliche
 * Lerninhalt, und es ist derselbe Text, mit dem der Agent tatsächlich läuft.
 */
function Chat({ interaction }: { interaction: Extract<Interaction, { kind: "chat" }> }) {
  const { messages, loading, error, started, start, send, seed } = useAgentChat(interaction.id);
  const [draft, setDraft] = useState("");
  const bottom = useRef<HTMLDivElement>(null);

  // Beim Nachrücken einer Antwort ans Ende springen, damit man nicht scrollen muss.
  useEffect(() => {
    if (started) bottom.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [messages.length, loading, started]);

  const submit = (text: string) => {
    setDraft("");
    void send(text);
  };

  // Die erste Nachricht ist die eingegangene Mail, nicht etwas Getipptes.
  const thread = messages.filter((m, i) => !(i === 0 && m.content === seed));

  return (
    <div className={CARD}>
      <p className="m-0 mb-4 text-lg leading-relaxed text-fg-2">{interaction.hint}</p>

      {!started ? (
        <button
          type="button"
          onClick={() => void start()}
          className="w-full rounded-xl bg-[color:var(--accent)] px-5 py-4 text-lg font-semibold text-stage"
        >
          {interaction.label}
        </button>
      ) : (
        <div className="grid gap-3">
          <SeedMail />

          {thread.map((m) => (
            <div
              key={m.id}
              className={
                m.role === "user"
                  ? "justify-self-end rounded-2xl rounded-br-sm bg-[color:var(--accent)]/15 px-4 py-3 text-base leading-relaxed text-fg max-w-[85%]"
                  : "justify-self-start rounded-2xl rounded-bl-sm border border-hair bg-stage px-4 py-3 text-base leading-relaxed whitespace-pre-wrap text-fg max-w-[92%]"
              }
            >
              {m.content}
            </div>
          ))}

          {loading && (
            <p className="m-0 justify-self-start font-mono text-[11px] tracking-[0.12em] text-fg-3 uppercase">
              Der Agent schreibt …
            </p>
          )}

          {error && <p className="m-0 text-sm leading-relaxed text-b1">{error}</p>}

          <div ref={bottom} />

          {interaction.suggestions && !loading && (
            <div className="flex flex-wrap gap-2">
              {interaction.suggestions.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => submit(sug)}
                  className="rounded-full border border-hair bg-stage px-3 py-1.5 text-sm text-fg-3 active:bg-stage-3"
                >
                  {sug}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-end gap-2">
            <textarea
              id={`chat-${interaction.id}`}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Antworten Sie ihm …"
              rows={2}
              className="w-full resize-none rounded-xl border border-hair bg-stage px-4 py-3 text-base text-fg placeholder:text-fg-3 focus:border-[color:var(--accent)] focus:outline-none"
            />
            <button
              type="button"
              disabled={!draft.trim() || loading}
              onClick={() => submit(draft)}
              className="shrink-0 rounded-xl bg-[color:var(--accent)] px-4 py-3 text-base font-semibold text-stage disabled:opacity-30"
            >
              Senden
            </button>
          </div>
        </div>
      )}

      <details className="mt-4 rounded-xl border border-hair bg-stage p-4">
        <summary className="cursor-pointer font-mono text-[11px] tracking-[0.12em] text-fg-3 uppercase">
          Systemprompt ansehen
        </summary>
        <pre className="mt-3 overflow-x-auto font-mono text-[13px] leading-relaxed whitespace-pre-wrap text-fg-2">
          {interaction.systemPrompt}
        </pre>
      </details>
    </div>
  );
}

/** Die eingegangene Mail als Auftakt des Gesprächs — so, wie sie auf der Folie stand. */
function SeedMail() {
  return (
    <div className="rounded-2xl border border-hair bg-stage p-4">
      <p className="m-0 font-mono text-[10px] tracking-[0.14em] text-fg-3 uppercase">
        Posteingang · {SEED_MAIL.time}
      </p>
      <p className="m-0 mt-2 text-sm text-fg-3">{SEED_MAIL.from}</p>
      <p className="m-0 mt-1 text-base font-semibold text-balance text-fg">{SEED_MAIL.subject}</p>
      {SEED_MAIL.body.map((line) => (
        <p key={line} className="m-0 mt-2 text-sm leading-relaxed text-fg-2">
          {line}
        </p>
      ))}
      {SEED_MAIL.facts && (
        <dl className="m-0 mt-3 grid grid-cols-2 gap-x-3 gap-y-1">
          {SEED_MAIL.facts.map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="m-0 text-xs text-fg-3">{k}</dt>
              <dd className="m-0 text-xs font-medium text-fg-2">{v}</dd>
            </div>
          ))}
        </dl>
      )}
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
  answers,
  onAnswer,
}: {
  interaction: Interaction;
  answers: Record<string, string>;
  onAnswer: (key: string, v: string) => void;
}) {
  switch (interaction.kind) {
    case "poll":
      return <Poll interaction={interaction} answers={answers} onAnswer={onAnswer} />;
    case "text":
      return (
        <FreeText
          interaction={interaction}
          value={answers[interaction.id]}
          onAnswer={(v) => onAnswer(interaction.id, v)}
        />
      );
    case "mailto":
      return <MailTo interaction={interaction} />;
    case "chat":
      return <Chat interaction={interaction} />;
    case "wait":
      return <Wait interaction={interaction} />;
  }
}
