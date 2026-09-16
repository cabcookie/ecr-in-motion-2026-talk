import { useLayoutEffect, useRef, useState } from "react";
import type { Section } from "@/slides/types";
import { MockView } from "./mocks";
import { FitBox } from "./FitBox";
import { STAGE_H } from "@/nav/useStageScale";

/** Titelgröße nach Länge — lange Sätze dürfen nicht bis zum Rand laufen. */
function titlePx(text: string, hero: boolean): number {
  if (hero) {
    if (text.length <= 30) return 132;
    if (text.length <= 60) return 104;
    return 78;
  }
  if (text.length <= 34) return 76;
  if (text.length <= 64) return 62;
  return 50;
}

/** Abstand von der Oberkante des Inhalts, siehe pt-[86px] am Wurzelknoten. */
const KOPF_OBEN = 86;
const KOPF_MS = 820;

/**
 * Abschnitte, deren Panels dasselbe Bild in Stufen AUFBAUEN.
 *
 * Für die ergibt das horizontale Karussell keinen Sinn: Es schöbe die Zeichnung
 * seitlich weg und eine fast identische Kopie herein. Schlimmer noch, jedes
 * Panel ist ein eigener DOM-Baum — die Einblendanimation liefe dann bei jedem
 * Klick für ALLE Elemente neu, obwohl nur drei dazugekommen sind.
 *
 * Solche Abschnitte bekommen deshalb eine EINZIGE, stehende Instanz, der die
 * aktuelle Stufe als `step` gereicht wird. React lässt die vorhandenen Elemente
 * dann in Ruhe und hängt nur die neuen ein — und nur die animieren.
 */
function istStehend(section: Section): boolean {
  const arten = new Set(section.panels.map((p) => p.mock?.t));
  return arten.size === 1 && (arten.has("architektur") || arten.has("tshape"));
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
 *
 * Dieses Wandern war lange zweierlei: Der Titel wechselte Schriftgrad,
 * Zeilenbreite und Ausrichtung zugleich, brach also neu um und sprang
 * horizontal — zwei Objekte, nicht eines. Jetzt steht er immer in der
 * Hero-Größe und bleibt zentriert; bewegt wird nur ein transform, das ihn
 * hebt und verkleinert. Die Umbrüche bleiben damit gleich, und weil ein
 * transform kein Layout anfasst, hat der Inhalt darunter von Anfang an seine
 * endgültige Höhe — die eintreffende Mail muss ihre Größe nicht mehr ändern.
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
  /** Abschnitt mit großem Auftakt — nur dort wandert der Titel überhaupt. */
  const heroAbschnitt = Boolean(section.hero);
  const hero = heroAbschnitt && panel === 0;
  const centered = isCentered(section, panel);
  const stehend = istStehend(section);

  /*
    In einem Hero-Abschnitt steht der Titel immer in der großen Fassung und
    bleibt zentriert. Für die Panels danach schrumpft ihn ein transform auf das
    normale Maß; gleichzeitig fällt der Versatz weg, der ihn in die Bildmitte
    hebt. Beides in einer Bewegung — der Titel bleibt ein Objekt.
  */
  const kopf = useRef<HTMLDivElement>(null);
  const [hebung, setHebung] = useState(0);
  const [kopfHoehe, setKopfHoehe] = useState<number | undefined>(undefined);
  const klein = titlePx(section.title, false) / titlePx(section.title, true);

  useLayoutEffect(() => {
    if (!heroAbschnitt) return;
    const h = kopf.current?.scrollHeight ?? 0;
    // Mitte des Kopfes auf die Bildmitte legen — offsetHeight ignoriert transform
    setHebung(Math.max(0, Math.round(STAGE_H / 2 - KOPF_OBEN - h / 2)));
    /*
      Der Titel steht in der großen Fassung, wird aber auf den Panels danach
      verkleinert gezeigt. Im Layout darf er deshalb nur die verkleinerte Höhe
      belegen — sonst fehlt dem Inhalt darunter der Platz, und die FitBox
      schrumpft ihn. In der Bildmitte ragt der Titel über diese Höhe hinaus;
      das stört nicht, dort steht ohnehin nichts anderes.
    */
    setKopfHoehe(Math.round(h * klein));
  }, [heroAbschnitt, section.n, klein]);

  // Block und Foliennummer stehen bewusst nicht mehr im Bild — das Publikum
  // soll die Aussage sehen, nicht die Buchhaltung. Die Kennzeichnung bleibt
  // als Datenattribut, damit Screenshots und Tests sie weiterhin finden.
  return (
    <div
      data-slideno={section.n}
      data-panel={panel}
      className="absolute inset-0 flex flex-col overflow-hidden px-[108px] pt-[86px] pb-[104px]"
    >
      {/* Kopf — hebt und verkleinert sich als Ganzes, wenn das erste Panel kommt */}
      <div
        ref={kopf}
        className={`flex flex-none flex-col ${
          heroAbschnitt ? "items-center text-center" : "items-start"
        }`}
        style={
          heroAbschnitt
            ? {
                height: kopfHoehe,
                transform: hero ? `translateY(${hebung}px)` : `scale(${klein})`,
                transformOrigin: "center top",
                transition: `transform ${KOPF_MS}ms cubic-bezier(0.32, 0.72, 0, 1)`,
                willChange: "transform",
              }
            : undefined
        }
      >
        {isTitle && (
          <div className="mb-[42px] font-mono text-[26px] tracking-[0.2em] text-[color:var(--accent)] uppercase">
            ECR in Motion · Masterclass
          </div>
        )}
        <h1
          className="m-0 font-display leading-[1.12] font-extrabold tracking-[-0.025em] text-balance text-fg"
          style={{
            fontSize: titlePx(section.title, heroAbschnitt),
            maxWidth: heroAbschnitt ? "20ch" : "26ch",
          }}
        >
          {section.title}
        </h1>
        {section.sub && (
          <p
            className={`m-0 mt-[22px] text-[34px] leading-[1.36] font-normal text-pretty text-fg-2 ${
              heroAbschnitt ? "max-w-[38ch]" : "max-w-[52ch]"
            }`}
          >
            {section.sub}
          </p>
        )}
      </div>

      {/* Karussell — die Panels laufen horizontal durch */}
      {!hero && (
        <div
          /*
            Beschnitten an der Spaltenkante. Vorher lief das ausscheidende
            Panel in den Seitenrand hinein und ein Verlauf im Rand sollte es
            verdecken — der stand aber links neben dem Panel statt darauf, und
            übrig blieb ein heller Streifen mit harter Kante.
          */
          className={`relative mt-[44px] min-h-0 flex-1 overflow-hidden ${
            heroAbschnitt ? "panel-rise" : ""
          }`}
        >
          {stehend ? (
            /*
              Ein Baum, der wächst. Der `slideKey` trägt bewusst KEINE
              Panelnummer — sonst würde die FitBox bei jedem Klick neu
              aufgebaut und wir wären wieder da, wo wir hergekommen sind.
            */
            <div className="h-full w-full" aria-hidden={false}>
              {section.panels[panel]?.mock && (
                <FitBox slideKey={section.n * 100} centered={centered}>
                  <MockView
                    mock={section.panels[panel].mock!}
                    terse={isTerse(section.panels[panel].mock!)}
                    step={panel}
                  />
                </FitBox>
              )}
            </div>
          ) : (
          <div
            className="flex h-full transition-transform duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ transform: `translateX(-${panel * 100}%)` }}
          >
            {section.panels.map((p, i) => (
              <div
                key={i}
                /*
                  Das ausscheidende Panel bekommt ease-in: es bleibt zunächst
                  hell und verliert erst zum Schluss. Mit der linearen Kurve
                  war es nach einem Drittel der Strecke schon weg, obwohl es
                  noch sichtbar über die Fläche schob.
                */
                className={`h-full w-full shrink-0 transition-opacity duration-[700ms] ${
                  i === panel ? "opacity-100 ease-out" : "opacity-0 ease-in"
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
          )}

        </div>
      )}

    </div>
  );
}

/** Neun Arbeitsschritte passen nur zweispaltig und ohne Erläuterungen aufs Bild. */
function isTerse(mock: NonNullable<Section["panels"][number]["mock"]>): boolean {
  return mock.t === "list" && mock.items.length > 6;
}
