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
        </header>

        <AbspannMaterial />

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

/** Die Adresse verkürzt, wie auf der Leinwand — niemand liest "https://". */
function knapp(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

/**
 * Das Material selbst: das PDF und die Abschnitte aus anhang.md.
 *
 * Steht zweimal: auf der Abschlussseite außerhalb des Vortragsfensters und auf
 * dem Handy bei der letzten Folie.
 *
 * `breit` macht es responsiv für die letzte Folie: Schmal bleiben es Karten
 * mit Erklärung zum Antippen. Ab Tablet-Breite steht es wie auf der Leinwand —
 * vier Abschnitte in zwei Spalten, je Eintrag Name und kurze Adresse, und
 * trotzdem anklickbar.
 */
export function AbspannMaterial({ breit = false }: { breit?: boolean }) {
  return (
    <>
      <a
        href={PDF_DATEI}
        className="inline-flex w-fit items-center rounded-full border border-[color:var(--accent)] px-5 py-3 font-bold text-fg no-underline"
      >
        Präsentation als PDF
      </a>

      <div
        className={
          breit
            ? "grid gap-8 md:grid-cols-2 md:gap-x-20 md:gap-y-12"
            : "grid gap-8"
        }
      >
        {ABSPANN.abschnitte.map((abschnitt) => (
          <section key={abschnitt.titel} className={breit ? "grid content-start gap-3" : "grid gap-3"}>
            <h2
              className={`m-0 font-display text-xl leading-tight font-extrabold text-[color:var(--accent)] ${
                breit ? "md:text-3xl" : ""
              }`}
            >
              {abschnitt.titel}
            </h2>
            {abschnitt.einleitung && (
              <p className={`m-0 text-sm leading-relaxed text-fg-2 ${breit ? "md:hidden" : ""}`}>
                {abschnitt.einleitung}
              </p>
            )}
            <ul className={`m-0 grid list-none gap-3 p-0 ${breit ? "md:gap-4" : ""}`}>
              {abschnitt.eintraege.map((e) => (
                <li key={e.url}>
                  <a
                    href={e.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block rounded-2xl border border-hair px-4 py-3 text-fg no-underline ${
                      breit ? "md:rounded-none md:border-0 md:p-0 md:hover:underline" : ""
                    }`}
                  >
                    <b className={`font-bold ${breit ? "md:text-xl" : ""}`}>{e.was}</b>
                    {e.warum && (
                      <span
                        className={`mt-1 block text-sm leading-snug text-fg-2 ${breit ? "md:hidden" : ""}`}
                      >
                        {e.warum}
                      </span>
                    )}
                    {breit && (
                      <span className="hidden font-mono text-sm leading-snug break-all text-fg-3 md:block">
                        {knapp(e.url)}
                      </span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
