import { anhangStruktur } from "../../aws-blocks/mail/anhang";
import anhangRoh from "../../aws-blocks/mail/anhang.md?raw";
import { PDF_DATEI } from "@/routen";

/**
 * Was die Wurzel außerhalb des Vortragsfensters zeigt — die letzte Folie.
 *
 * Das Material kommt aus aws-blocks/mail/anhang.md, derselben Datei, aus der
 * Abspannfolie, PDF und Antwortmail lesen. Wie dort bleibt der Kopf der Datei
 * draußen; er ist für das Postfach geschrieben.
 */
const ABSPANN = anhangStruktur(anhangRoh);

export function Abschlussseite() {
  return (
    <div
      data-view="abschluss"
      className="h-dvh overflow-y-auto overscroll-contain bg-stage text-fg"
      style={{ ["--accent" as string]: "var(--color-b3)" }}
    >
      <div
        className="mx-auto flex max-w-lg flex-col gap-8 px-4 pt-10"
        style={{ paddingBottom: "max(4rem, env(safe-area-inset-bottom))" }}
      >
        <header className="grid gap-3">
          <span className="font-mono text-[11px] tracking-[0.14em] text-fg-3 uppercase">
            ECR in Motion 2026 · KI-Masterclass
          </span>
          <h1 className="m-0 font-display text-3xl leading-tight font-extrabold tracking-tight text-balance">
            Danke, dass Du da warst.
          </h1>
          <p className="m-0 text-base leading-relaxed text-fg-2">
            Hier ist die Präsentation zum Nachlesen, und darunter alles, womit Du weitermachen
            kannst.
          </p>
          <a
            href={PDF_DATEI}
            className="mt-2 inline-flex w-fit items-center rounded-full border border-[color:var(--accent)] px-5 py-3 font-bold text-fg no-underline"
          >
            Präsentation als PDF
          </a>
        </header>

        {ABSPANN.abschnitte.map((abschnitt) => (
          <section key={abschnitt.titel} className="grid gap-3">
            <h2 className="m-0 font-display text-xl leading-tight font-extrabold text-[color:var(--accent)]">
              {abschnitt.titel}
            </h2>
            {abschnitt.einleitung && (
              <p className="m-0 text-sm leading-relaxed text-fg-2">{abschnitt.einleitung}</p>
            )}
            <ul className="m-0 grid list-none gap-3 p-0">
              {abschnitt.eintraege.map((e) => (
                <li key={e.url}>
                  <a
                    href={e.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-2xl border border-hair px-4 py-3 text-fg no-underline"
                  >
                    <b className="font-bold">{e.was}</b>
                    {e.warum && (
                      <span className="mt-1 block text-sm leading-snug text-fg-2">{e.warum}</span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <p className="m-0 text-sm leading-relaxed text-fg-3">
          Lisa ist im Moment nicht aktiv. Wenn Du sie noch einmal erleben möchtest, frag gerne eine
          Präsentation bei Euch an:{" "}
          <a href="https://carstenbkoch.de/" className="text-fg underline">
            carstenbkoch.de
          </a>
        </p>
      </div>
    </div>
  );
}
