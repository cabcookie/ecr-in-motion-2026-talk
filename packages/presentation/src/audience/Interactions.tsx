import { useEffect, useRef, useState } from "react";
import type { Interaction } from "@/slides/types";
import { SEED_MAIL } from "@/slides/agent";
import { briefingFuer, gruppenName, type Briefing } from "@/slides/briefing";
import { participantId } from "./participant";
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
  onWeitere,
}: {
  interaction: Extract<Interaction, { kind: "text" }>;
  value?: string;
  onAnswer: (v: string) => void;
  onWeitere?: (v: string, lfd: number) => void;
}) {
  const mehrfach = interaction.mehrfach === true;
  const [draft, setDraft] = useState(mehrfach ? "" : (value ?? ""));
  /* Was dieses Gerät schon beigetragen hat — im Mehrfachmodus die ganze Liste. */
  const [gesendet, setGesendet] = useState<string[]>([]);

  useEffect(() => {
    if (!mehrfach) setDraft(value ?? "");
  }, [value, mehrfach]);

  const dirty = draft.trim() !== (value ?? "").trim();
  const schonDa = gesendet.includes(draft.trim());
  const absendbar = draft.trim() !== "" && (mehrfach ? !schonDa : dirty);

  function senden() {
    const text = draft.trim();
    if (!text) return;
    if (mehrfach) {
      /*
        Die erste Antwort geht den gewöhnlichen Weg, jede weitere bekommt eine
        laufende Nummer. So bleibt die Korrektur der ersten möglich, und die
        Leinwand sieht trotzdem alles.
      */
      if (gesendet.length === 0) onAnswer(text);
      else onWeitere?.(text, gesendet.length);
      setGesendet((g) => [...g, text]);
      setDraft("");
    } else {
      onAnswer(text);
    }
  }

  return (
    <div className={CARD}>
      <p className="m-0 mb-4 text-xl leading-snug font-medium text-balance text-fg">
        {interaction.prompt}
      </p>
      <div className="mb-4 flex flex-wrap gap-2">
        {interaction.examples
          .filter((ex) => !gesendet.includes(ex))
          .map((ex) => (
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
        placeholder={
          mehrfach && gesendet.length ? "Und was noch?" : interaction.placeholder
        }
        rows={3}
        className="w-full resize-none rounded-xl border border-hair bg-stage px-4 py-3 text-lg text-fg placeholder:text-fg-3 focus:border-[color:var(--accent)] focus:outline-none"
      />
      <button
        type="button"
        disabled={!absendbar}
        onClick={senden}
        className="mt-3 w-full rounded-xl bg-[color:var(--accent)] px-5 py-4 text-lg font-semibold text-stage disabled:opacity-30"
      >
        {mehrfach
          ? gesendet.length
            ? "Noch eine senden"
            : "Senden"
          : dirty
            ? "Senden"
            : "Gesendet"}
      </button>

      {/*
        Was schon draußen ist, bleibt sichtbar. Ohne das wüsste im
        Mehrfachmodus niemand, ob die letzte Eingabe angekommen ist — das Feld
        leert sich ja.
      */}
      {gesendet.length > 0 && (
        <>
          <p className="m-0 mt-5 font-mono text-[10px] tracking-[0.14em] text-fg-3 uppercase">
            Von Dir gesendet
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {gesendet.map((g) => (
              <span
                key={g}
                className="rounded-full border border-[color:var(--accent)]/40 bg-[color:var(--accent)]/10 px-3 py-1.5 text-sm text-fg-2"
              >
                ✓ {g}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/** Öffnet das Mailprogramm mit vorformuliertem Text. */
/**
 * Das Briefing: wer der Teilnehmer in dieser Mail ist.
 *
 * Aufgeklappt wäre es eine Wand aus Text über dem Knopf, und der Knopf ist das,
 * worauf es ankommt. Zugeklappt ist es eine Zeile, die neugierig macht — wer
 * sie überliest, kann trotzdem schreiben.
 *
 * Die Bestandstabelle steht bewusst mit drin. Sie ist das, was der Teilnehmer
 * über sich wissen muss, und sie stammt aus demselben Sortiment, in dem der
 * Agent nachschlägt: Was hier steht, findet er auch.
 */
function BriefingKarte({ briefing }: { briefing: Briefing }) {
  const [offen, setOffen] = useState(false);

  return (
    <div className="rounded-2xl border border-[color:var(--accent)]/40 bg-stage-2">
      <button
        type="button"
        onClick={() => setOffen((o) => !o)}
        aria-expanded={offen}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <span className="min-w-0">
          <span className="block font-mono text-[10px] tracking-[0.14em] text-[color:var(--accent)] uppercase">
            Dein Briefing
          </span>
          <span className="mt-0.5 block text-lg font-semibold text-fg">
            {briefing.rolle}, {briefing.firma}
          </span>
        </span>
        <span className="shrink-0 font-mono text-[11px] text-fg-3">
          {offen ? "▲" : "▼"}
        </span>
      </button>

      {offen && (
        <div className="border-t border-hair px-5 py-4">
          <p className="m-0 text-base leading-relaxed text-fg-2">
            Du vertrittst <b className="text-fg">{briefing.marke}</b> gegenüber Nordkorb.
          </p>

          <div className="mt-4 font-mono text-[10px] tracking-[0.14em] text-fg-3 uppercase">
            Was Nordkorb von Dir führt
          </div>
          {briefing.bestand.length === 0 ? (
            <p className="m-0 mt-2 text-[15px] leading-relaxed text-fg-2">
              Nichts. Nordkorb führt Deine Marke noch nicht — Du willst erstmals
              gelistet werden.
            </p>
          ) : (
            <div className="mt-2 overflow-x-auto">
              <table className="w-full border-collapse text-left text-[13px]">
                <thead>
                  <tr className="font-mono text-[10px] tracking-[0.1em] text-fg-3 uppercase">
                    <th className="py-1 pr-2 font-normal">Artikel</th>
                    <th className="py-1 pr-2 text-right font-normal">Fac.</th>
                    <th className="py-1 pr-2 text-right font-normal">Absatz/Jahr</th>
                    <th className="py-1 text-right font-normal">Entw.</th>
                  </tr>
                </thead>
                <tbody>
                  {briefing.bestand.map((a) => (
                    <tr key={a.bezeichnung} className="border-t border-hair">
                      <td className="py-1.5 pr-2 text-fg-2">
                        {a.bezeichnung}
                        <span className="text-fg-3">
                          {" "}
                          {a.gramm} g · {a.zone}
                        </span>
                      </td>
                      <td className="py-1.5 pr-2 text-right tabular-nums text-fg-2">
                        {a.facings}
                      </td>
                      <td className="py-1.5 pr-2 text-right tabular-nums text-fg-2">
                        {a.absatzJahr.toLocaleString("de-DE")}
                      </td>
                      <td
                        className={`py-1.5 text-right whitespace-nowrap tabular-nums ${
                          a.entwicklung < 0 ? "text-b1" : "text-b4"
                        }`}
                      >
                        {a.entwicklung > 0 ? "+" : ""}
                        {a.entwicklung.toLocaleString("de-DE")} %
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {briefing.produkt && (
            <>
              <div className="mt-4 font-mono text-[10px] tracking-[0.14em] text-fg-3 uppercase">
                Dein Produkt
              </div>
              <p className="m-0 mt-1 text-[15px] leading-relaxed text-fg-2">
                <b className="text-fg">{briefing.produkt.name}</b> — {briefing.produkt.was}
              </p>
              {/*
                Warum jemand danach greift. Der Satz, den der Agent gegen die
                Ziele der Kategorie halten kann — ein Adjektiv könnte er nicht.
              */}
              <p className="m-0 mt-2 text-[15px] leading-relaxed text-fg-3">
                {briefing.produkt.warum}
              </p>
              <p className="m-0 mt-2 font-mono text-[11px] tracking-[0.06em] text-fg-3">
                Käufergruppe: {gruppenName(briefing.produkt.gruppe)}
              </p>
            </>
          )}

          <div className="mt-4 font-mono text-[10px] tracking-[0.14em] text-fg-3 uppercase">
            Dein Ziel
          </div>
          <p className="m-0 mt-1 text-[15px] leading-relaxed text-fg-2">
            {briefing.auftrag}
          </p>

          <div className="mt-4 font-mono text-[10px] tracking-[0.14em] text-fg-3 uppercase">
            Der Haken
          </div>
          <p className="m-0 mt-1 text-[15px] leading-relaxed text-fg-3">
            {briefing.haken}
          </p>
        </div>
      )}
    </div>
  );
}

function MailTo({ interaction }: { interaction: Extract<Interaction, { kind: "mailto" }> }) {
  /*
    Die Zuteilung hängt an der Gerätekennung und nicht an einem Würfel: Wer die
    Seite neu lädt, während er noch schreibt, soll dieselbe Rolle wiederfinden.
  */
  const briefing = useRef(
    interaction.briefing ? briefingFuer(participantId()) : null,
  ).current;

  const betreff = briefing?.betreff ?? interaction.subject;
  const text = briefing?.text ?? interaction.body;

  const href =
    `mailto:${interaction.to}` +
    `?subject=${encodeURIComponent(betreff)}` +
    `&body=${encodeURIComponent(text)}`;

  return (
    <div className="grid gap-4">
      {briefing && <BriefingKarte briefing={briefing} />}

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
  const { messages, antworten, loading, error, started, start, send, seed } = useAgentChat(
    interaction.id,
    { stufe: interaction.stufe, auftakt: interaction.auftakt },
  );
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
  /* Zählt die Züge des Agenten mit, damit jeder seine eigene Antwort bekommt. */
  let agentenzug = 0;

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
          {interaction.auftakt === "briefing" ? (
            <EigeneAnfrage text={seed} />
          ) : (
            <SeedMail />
          )}

          {thread.map((m) =>
            m.role === "user" ? (
              <div
                key={m.id}
                className="max-w-[85%] justify-self-end rounded-2xl rounded-br-sm bg-[color:var(--accent)]/15 px-4 py-3 text-base leading-relaxed text-fg"
              >
                {m.content}
              </div>
            ) : (
              <Agentenzug
                key={m.id}
                arbeitsweg={m.content}
                antwort={antworten[agentenzug++]}
                laeuftNoch={loading}
              />
            ),
          )}

          {loading && <Arbeitet />}

          {error && <p className="m-0 text-sm leading-relaxed text-b1">{error}</p>}

          <div ref={bottom} />

          {interaction.suggestions && !loading && !interaction.einmalig && (
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

          {/*
            Kein Eingabefeld, wo es nichts zu antworten gibt. In Abschnitt 14
            geht es um EINE Antwort; ein Feld darunter lüde zum Weiterreden ein,
            während vorn schon der nächste Punkt läuft.
          */}
          {!interaction.einmalig && (
            <div className="flex items-end gap-2">
              <textarea
                id={`chat-${interaction.id}`}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Antworte ihm …"
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
          )}
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
/**
 * Die eigene Anfrage aus dem Briefing, so wie sie an den Agenten ging.
 *
 * Sichtbar und nicht stumm: Wer gleich eine Antwort liest, soll wissen, worauf
 * sie sich bezieht — und dass es SEIN Produkt war, nicht ein Beispiel von der
 * Leinwand.
 */
function EigeneAnfrage({ text }: { text: string }) {
  const [kopf, ...rest] = text.split("\n");
  return (
    <div className="rounded-2xl border border-[color:var(--accent)]/40 bg-stage p-4">
      <p className="m-0 font-mono text-[10px] tracking-[0.14em] text-[color:var(--accent)] uppercase">
        Von Dir gesendet
      </p>
      <p className="m-0 mt-2 text-base font-semibold text-balance text-fg">
        {kopf.replace(/^Betreff:\s*/, "")}
      </p>
      <p className="m-0 mt-2 text-sm leading-relaxed whitespace-pre-wrap text-fg-2">
        {rest.join("\n").trim()}
      </p>
    </div>
  );
}

/**
 * Was der Agent zurückschickt: sein Arbeitsweg und seine Antwort.
 *
 * Die Antwort kommt aus dem Werkzeug `antworte_im_chat`, der Arbeitsweg ist
 * alles, was er daneben geschrieben hat. Das ist die saubere Trennung — vorher
 * stand beides in einem Text, getrennt durch eine Marke, und solange die nicht
 * angekommen war, zeigte die App den laufenden Arbeitsweg als Antwort und
 * ordnete ihn danach um. Es sprang.
 *
 * Solange keine Antwort da ist, steht hier nichts als der aufklappbare
 * Arbeitsweg: Er ist im Gange, das genügt. Kommt am Ende gar keine — weil das
 * Modell das Werkzeug vergessen hat —, tritt der Arbeitsweg an ihre Stelle.
 * Lieber Denken zeigen als gar nichts.
 */
function Agentenzug({
  arbeitsweg,
  antwort,
  laeuftNoch,
}: {
  arbeitsweg: string;
  antwort?: string;
  laeuftNoch: boolean;
}) {
  const [offen, setOffen] = useState(false);
  const weg = entklebe(arbeitsweg.trim());
  const fehlgeschlagen = !antwort && !laeuftNoch && weg !== "";
  const zeigt = antwort ?? (fehlgeschlagen ? weg : undefined);

  return (
    <div className="grid max-w-[92%] justify-self-start gap-1.5">
      {weg !== "" && !fehlgeschlagen && (
        <>
          <button
            type="button"
            onClick={() => setOffen((o) => !o)}
            aria-expanded={offen}
            className="justify-self-start rounded-full border border-hair px-3 py-1 font-mono text-[10px] tracking-[0.12em] text-fg-3 uppercase active:bg-stage-3"
          >
            {offen ? "▲ Gedankengang" : "▼ Gedankengang"}
          </button>
          {offen && (
            <div className="rounded-2xl border border-dashed border-hair px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap text-fg-3">
              {weg}
            </div>
          )}
        </>
      )}
      {zeigt !== undefined && (
        <div className="rounded-2xl rounded-bl-sm border border-hair bg-stage px-4 py-3 text-base leading-relaxed whitespace-pre-wrap text-fg">
          {zeigt}
        </div>
      )}
    </div>
  );
}

/**
 * Der Verlauf klebt die Textblöcke einer Nachricht ohne Trenner aneinander —
 * „…Category-Kontakt.Ich habe dem Lieferanten…". Hier wird zwischen Satzende
 * und nächstem Großbuchstaben wieder ein Absatz eingesetzt. Nur für den
 * Gedankengang: Dort ist das Gedrängel störend und eine falsch gesetzte
 * Trennung folgenlos.
 */
function entklebe(text: string): string {
  return text.replace(/([.!?])([A-ZÄÖÜ])/g, "$1\n\n$2");
}

/** Dass er noch arbeitet, soll man sehen, ohne auf Text zu warten. */
function Arbeitet() {
  return (
    <div className="flex items-center gap-2 justify-self-start rounded-2xl border border-hair bg-stage px-4 py-3">
      <span className="flex gap-1" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="size-2 animate-bounce rounded-full bg-[color:var(--accent)]"
            style={{ animationDelay: `${i * 140}ms`, animationDuration: "900ms" }}
          />
        ))}
      </span>
      <span className="font-mono text-[11px] tracking-[0.12em] text-fg-3 uppercase">
        Der Agent arbeitet
      </span>
    </div>
  );
}

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
  onWeitere,
}: {
  interaction: Interaction;
  answers: Record<string, string>;
  onAnswer: (key: string, v: string) => void;
  onWeitere?: (key: string, v: string, lfd: number) => void;
}) {
  return (
    <div className="grid gap-4">
      {/*
        Der Zusammenhang steht über der Interaktion, nicht in ihr: Auf dem Handy
        ist die Leinwand nicht zu sehen, und eine Frage ohne ihren Anlass ist
        eine andere Frage. Bei `wait` entfällt er — dort ist der Satz selbst der
        ganze Inhalt und würde sonst doppelt stehen.
      */}
      {interaction.kind !== "wait" && interaction.message && (
        <p className="m-0 text-base leading-relaxed text-balance text-fg-3">
          {interaction.message}
        </p>
      )}
      <Koerper
        interaction={interaction}
        answers={answers}
        onAnswer={onAnswer}
        onWeitere={onWeitere}
      />
    </div>
  );
}

function Koerper({
  interaction,
  answers,
  onAnswer,
  onWeitere,
}: {
  interaction: Interaction;
  answers: Record<string, string>;
  onAnswer: (key: string, v: string) => void;
  onWeitere?: (key: string, v: string, lfd: number) => void;
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
          onWeitere={(v, lfd) => onWeitere?.(interaction.id, v, lfd)}
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
