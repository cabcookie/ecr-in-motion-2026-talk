import { useEffect, useMemo, useState } from "react";
import { SECTIONS, TOTAL, blockOf } from "@/slides/data";
import type { Interaction } from "@/slides/types";
import { useNavigation } from "@/nav/useNavigation";
import { useAnswers } from "@/audience/useAnswers";
import { eigeneEingabenLoeschen, useReset } from "@/audience/useReset";
import { InteractionView } from "@/audience/Interactions";

const ACCENT = ["", "var(--color-b1)", "var(--color-b2)", "var(--color-b3)", "var(--color-b4)"];

/**
 * Ab hier ist das Publikum dabei: Abschnitt 6 „Mach mit" — dort steht der
 * QR-Code auf der Leinwand und die Teilnehmer kommen auf diese Seite.
 *
 * Davor soll das Handy nichts zeigen als den Hinweis, dass gleich etwas kommt.
 * Wer früh da ist, soll nicht die Überschriften des Vortrags mitlesen; die
 * stehen groß auf der Leinwand.
 */
const START = { index: 5, step: 0 };

function vorDemStart(index: number, step: number): boolean {
  return index < START.index || (index === START.index && step < START.step);
}

/**
 * Interaktionen, die offen bleiben.
 *
 * Wer bei der Umfrage zu langsam war, soll sie nachholen können. Alles, was bis
 * zum aktuellen Stand vorkam und `persist` trägt, bleibt erreichbar — aber nicht
 * unbegrenzt: Eine Seite, auf der drei alte Angebote stehen, lenkt von dem
 * einen ab, das gerade zählt.
 *
 * Zwei Schranken begrenzen das. `bisAbschnitt` nennt den letzten Abschnitt, in
 * dem etwas noch erscheint; `until` eine Uhrzeit. Die Abschnittsnummer ist die
 * verlässlichere — eine Uhrzeit trifft nur zu, wenn der Vortrag im Plan liegt.
 */
function abgelaufen(at: string | undefined, jetzt: Date): boolean {
  if (!at) return false;
  const m = /^(\d{1,2}):(\d{2})$/.exec(at.trim());
  if (!m) return false;
  return jetzt.getHours() * 60 + jetzt.getMinutes() > Number(m[1]) * 60 + Number(m[2]);
}

function persistentUpTo(
  index: number,
  panel: number,
  current: Interaction | null,
  jetzt: Date,
) {
  const out: Interaction[] = [];
  const hier = SECTIONS[index]?.n ?? 0;
  for (let s = 0; s <= index; s++) {
    const section = SECTIONS[s];
    const last = s === index ? panel : section.panels.length - 1;
    for (let p = 0; p <= last; p++) {
      const a = section.panels[p]?.audience;
      if (!a || !("persist" in a) || !a.persist || a.id === current?.id) continue;
      if ("bisAbschnitt" in a && a.bisAbschnitt !== undefined && hier > a.bisAbschnitt) continue;
      if ("until" in a && abgelaufen(a.until, jetzt)) continue;
      out.push(a);
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
  const { answers, submit, submitWeitere, pending } = useAnswers();

  /*
    Zurücksetzen heißt hier: neu laden.

    Man könnte die Zustände einzeln leeren — die Antworten, das Gespräch, die
    Gesprächskennung, den laufenden Strom vom Agenten. Vier Stellen, die beim
    nächsten Umbau auseinanderlaufen. Ein Neuladen nach dem Löschen des lokalen
    Speichers lässt nichts übrig und landet auf demselben Folienstand, weil die
    Ansicht der Leinwand folgt.
  */
  useReset(() => {
    eigeneEingabenLoeschen();
    location.reload();
  });

  const section = SECTIONS[index];
  const block = blockOf(section.b);
  const wartet = vorDemStart(index, step);
  const current = section.panels[step]?.audience ?? null;
  /*
    Eine Uhr im Minutentakt. Ohne sie bliebe ein abgelaufenes Angebot stehen,
    bis die nächste Folie kommt — und wenn der Vortrag gerade dort verweilt,
    hiesse "Bis 20:00 möglich" um 20:15 immer noch dasselbe.
  */
  const [minute, setMinute] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setMinute(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  const stillOpen = useMemo(
    () => persistentUpTo(index, step, current, minute),
    [index, step, current, minute],
  );

  return (
    <div
      data-view="audience"
      /*
        Feste Höhe, nicht Mindesthöhe. `min-h-dvh` wuchs mit dem Inhalt, und weil
        body auf overflow:hidden steht — die Leinwand darf nie scrollen —, wurde
        alles darunter abgeschnitten statt scrollbar. Hier ist der Scrollbereich.
      */
      className="h-dvh overflow-y-auto overscroll-contain bg-stage text-fg"
      style={{ ["--accent" as string]: ACCENT[section.b] }}
    >
      {wartet ? (
        <div className="mx-auto flex min-h-dvh max-w-lg items-center justify-center px-6">
          <p className="m-0 text-center text-lg leading-relaxed text-balance text-fg-2">
            Gleich geht es los. Lass diese Seite offen — sie folgt dem Vortrag von allein.
          </p>
        </div>
      ) : (
      <div
        className="mx-auto flex max-w-lg flex-col gap-6 px-4 pb-16"
        style={{ paddingBottom: "max(4rem, env(safe-area-inset-bottom))" }}
      >
        {/*
          Bleibt oben stehen, wenn die Seite länger wird. Der negative Rand zieht
          den Hintergrund über die volle Breite, sonst schöbe sich der Inhalt
          seitlich daran vorbei.
        */}
        <header className="sticky top-0 z-10 -mx-4 flex items-center justify-between gap-3 border-b border-hair bg-stage px-4 py-4">
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
          <InteractionView
            interaction={current}
            answers={answers}
            onAnswer={submit}
            onWeitere={submitWeitere}
          />
        ) : (
          <div className="rounded-2xl border border-dashed border-hair px-5 py-8 text-center">
            <p className="m-0 text-base leading-relaxed text-fg-3">
              Hier ist gerade nichts zu tun. Die Seite folgt dem Vortrag von allein — lass sie
              einfach offen.
            </p>
          </div>
        )}

        {stillOpen.length > 0 && (
          <section className="grid gap-3">
            <h2 className="m-0 font-mono text-[11px] tracking-[0.14em] text-fg-3 uppercase">
              Weiterhin möglich
            </h2>
            {stillOpen.map((i) => (
              <InteractionView
                key={i.id}
                interaction={i}
                answers={answers}
                onAnswer={submit}
                onWeitere={submitWeitere}
              />
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
