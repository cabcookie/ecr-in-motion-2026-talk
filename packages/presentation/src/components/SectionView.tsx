import type { Section } from "@/slides/types";
import { MockView } from "./mocks";
import { FitBox } from "./FitBox";
import { Logo } from "./Logo";

/** Titelgröße nach Länge — lange Sätze dürfen nicht bis zum Rand laufen. */
function titleSize(text: string, hero: boolean): string {
  if (hero) {
    if (text.length <= 30) return "text-[132px]";
    if (text.length <= 60) return "text-[104px]";
    return "text-[78px]";
  }
  if (text.length <= 34) return "text-[76px]";
  if (text.length <= 64) return "text-[62px]";
  return "text-[50px]";
}

/** Panels ohne Anwendungsfenster stehen mittig — die Aussage ist der Inhalt. */
function isCentered(section: Section, panel: number): boolean {
  const m = section.panels[panel]?.mock;
  if (!m) return true;
  return m.t === "statement" || m.t === "quote" || m.t === "reveal";
}

/**
 * Ein Abschnitt der Präsentation.
 *
 * Der Titel eines hero-Abschnitts steht auf Panel 0 groß in der Mitte und
 * wandert beim Weiterklicken nach oben, wo er als Überschrift stehen bleibt.
 * Die Panels darunter scrollen horizontal; das verlassene Panel wandert nach
 * links und blendet unter einem Verlauf aus.
 */
export function SectionView({
  section,
  panel,
  isTitle = false,
}: {
  section: Section;
  panel: number;
  isTitle?: boolean;
}) {
  const hero = Boolean(section.hero) && panel === 0;
  const centered = isCentered(section, panel);

  // Block und Foliennummer stehen bewusst nicht mehr im Bild — das Publikum
  // soll die Aussage sehen, nicht die Buchhaltung. Die Kennzeichnung bleibt
  // als Datenattribut, damit Screenshots und Tests sie weiterhin finden.
  return (
    <div
      data-slideno={section.n}
      data-panel={panel}
      className="absolute inset-0 flex flex-col overflow-hidden px-[108px] pt-[86px] pb-[104px]"
    >
      <Logo large={isTitle} />
      {/* Kopf — wandert vom Bildmittelpunkt nach oben, wenn das erste Panel kommt */}
      <div
        className={`flex flex-col transition-all duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          hero ? "flex-1 items-center justify-center text-center" : "flex-none items-start"
        }`}
      >
        {isTitle && (
          <div className="mb-[42px] font-mono text-[26px] tracking-[0.2em] text-[color:var(--accent)] uppercase">
            ECR in Motion · Masterclass
          </div>
        )}
        <h1
          className={`m-0 font-display leading-[1.12] font-extrabold tracking-[-0.025em] text-balance text-fg transition-all duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${titleSize(
            section.title,
            hero,
          )} ${hero ? "max-w-[20ch]" : "max-w-[26ch]"}`}
        >
          {section.title}
        </h1>
        {section.sub && (
          <p
            className={`m-0 mt-[22px] text-[34px] leading-[1.36] font-normal text-pretty text-fg-2 ${
              hero ? "max-w-[38ch]" : "max-w-[52ch]"
            }`}
          >
            {section.sub}
          </p>
        )}
      </div>

      {/* Karussell — die Panels laufen horizontal durch */}
      {!hero && (
        <div className="relative mt-[44px] min-h-0 flex-1">
          <div
            className="flex h-full transition-transform duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ transform: `translateX(-${panel * 100}%)` }}
          >
            {section.panels.map((p, i) => (
              <div
                key={i}
                className={`h-full w-full shrink-0 transition-opacity duration-[600ms] ${
                  i === panel ? "opacity-100" : "opacity-0"
                }`}
                aria-hidden={i !== panel}
              >
                {p.mock && (
                  <FitBox slideKey={section.n * 100 + i} centered={centered}>
                    <MockView mock={p.mock} terse={isTerse(p.mock)} step={i} />
                  </FitBox>
                )}
              </div>
            ))}
          </div>

          {/* Verlauf, unter dem das verlassene Panel nach links verschwindet */}
          <div className="pointer-events-none absolute inset-y-0 -left-[108px] w-[108px] bg-gradient-to-r from-stage to-transparent" />
        </div>
      )}

    </div>
  );
}

/** Neun Arbeitsschritte passen nur zweispaltig und ohne Erläuterungen aufs Bild. */
function isTerse(mock: NonNullable<Section["panels"][number]["mock"]>): boolean {
  return mock.t === "list" && mock.items.length > 6;
}
