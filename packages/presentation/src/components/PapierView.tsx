import { useLayoutEffect, useRef } from "react";
import { BLOCKS, SECTIONS } from "@/slides/data";
import type { Mock, Panel, Section } from "@/slides/types";
import { MockView } from "./mocks";
import { Logo } from "./Logo";

const ACCENT = ["", "var(--color-b1)", "var(--color-b2)", "var(--color-b3)", "var(--color-b4)"];

/**
 * Der Vortrag als Dokument.
 *
 * Ein PDF wird allein gelesen, später, ohne Vortragenden und ohne den Saal.
 * Deshalb steht hier nicht die Folie allein, sondern Folie UND der Text, der
 * sonst gesprochen wird — sonst fehlt dem Leser die Hälfte des Arguments.
 *
 * Was auf Papier nicht trägt, regelt jedes Panel selbst über `papier`: `weg`
 * lässt es aus, `statt` tauscht die Folie, `text` schreibt den Begleittext neu.
 * Welche Panels das brauchen, findet `pruefung/papier-test.ts` — und bricht ab,
 * wenn eines davon vergessen wurde.
 *
 * Absichtlich echter Text und keine Screenshots: So bleibt das Ergebnis
 * durchsuchbar, kopierbar und für Vorleseprogramme lesbar.
 */
export function PapierView() {
  const seiten = SECTIONS.flatMap((abschnitt) =>
    abschnitt.panels
      .map((panel, i) => ({ abschnitt, panel, nummer: `${abschnitt.n}.${i + 1}` }))
      .filter(({ panel }) => !panel.papier?.weg),
  );

  return (
    <div data-view="papier" className="bg-white text-[#0f1720]">
      <style>{DRUCK}</style>
      <Einpassen />
      <Deckblatt />
      {seiten.map(({ abschnitt, panel, nummer }) => (
        <Seite key={nummer} abschnitt={abschnitt} panel={panel} nummer={nummer} />
      ))}
      <Schluss />
    </div>
  );
}

/**
 * Passt jede Seite in ihre Höhe.
 *
 * Die Mocks sind für eine 16:9-Leinwand bemessen, die Seite ist A4 quer — und
 * wie viel Platz der Begleittext braucht, hängt an seiner Länge. Ein fester
 * Maßstab trifft deshalb mal, mal nicht: Sechs von zweiundsechzig Seiten liefen
 * über, und ein Überlauf fällt im PDF nicht auf, er schneidet einfach ab.
 *
 * Also wird gemessen und verkleinert, bis es passt — dieselbe Idee wie `FitBox`
 * auf der Bühne. Verkleinert wird nur die Folie, nie der Text: Eine Folie darf
 * klein sein, ein unleserlicher Absatz nicht.
 */
function Einpassen() {
  const getan = useRef(false);

  useLayoutEffect(() => {
    if (getan.current) return;
    getan.current = true;

    /*
      Die Folie auf das Blatt rechnen.

      Nicht mit `zoom`: Das legt breitenfuellende Inhalte nur breiter um und
      verkleinert optisch gar nichts — eine SVG-Folie blieb dadurch gleich hoch,
      egal welcher Wert dort stand. Stattdessen dasselbe Verfahren wie FitBox
      auf der Buehne: feste Entwurfsbreite, echtes `scale`, und der Rahmen
      bekommt die gerechnete Hoehe, damit der Seitenumbruch stimmt.
    */
    const ENTWURFSBREITE = 1360;

    const folienPassen = () => {
      for (const seite of document.querySelectorAll<HTMLElement>(".papier-seite")) {
        const rahmen = seite.querySelector<HTMLElement>(".papier-buehne");
        const inhalt = seite.querySelector<HTMLElement>(".papier-inhalt");
        if (!rahmen || !inhalt) continue;

        inhalt.style.transform = "none";
        rahmen.style.height = "auto";
        const natur = inhalt.offsetHeight;
        const breite = rahmen.clientWidth;
        if (!natur || !breite) continue;

        /* Erst auf die Breite, dann sehen wir, was an Hoehe uebrig bleibt. */
        const s1 = breite / ENTWURFSBREITE;
        inhalt.style.transformOrigin = "top left";
        inhalt.style.transform = `scale(${s1})`;
        /*
          Ein Punkt Zugabe. Ohne ihn schnitt der Rahmen die Unterkante knapp ab —
          `offsetHeight` wird gegen ein Layout gemessen, das die feste
          Entwurfsbreite gerade erst bekommen hat, und liegt dann ein, zwei
          Pixel daneben.
        */
        rahmen.style.height = `${Math.ceil(natur * s1) + 2}px`;
      }
    };

    /*
      Steht die Folie, kann der Text noch zu lang sein. Dann wird erst die Folie
      weiter verkleinert, danach die Schrift — aber nur bis 8,5pt. Darunter wird
      aus einem Dokument zum Nachlesen eine Fussnote, und dann ist Kuerzen die
      ehrlichere Antwort. Genau deshalb bricht der Bau ab, wenn auch das nicht
      reicht: Ein Ueberlauf im PDF schneidet ab, ohne dass es auffaellt.
    */
    const runde = (): boolean => {
      let offen = false;
      for (const seite of document.querySelectorAll<HTMLElement>(".papier-seite")) {
        if (seite.scrollHeight <= seite.clientHeight) continue;

        const rahmen = seite.querySelector<HTMLElement>(".papier-buehne");
        const inhalt = seite.querySelector<HTMLElement>(".papier-inhalt");
        if (rahmen && inhalt) {
          const jetzt = Number(/scale\(([\d.]+)\)/.exec(inhalt.style.transform)?.[1] ?? 1);
          if (jetzt > 0.2) {
            const neu = Math.round((jetzt - 0.05) * 100) / 100;
            inhalt.style.transform = `scale(${neu})`;
            rahmen.style.height = `${Math.ceil((inhalt.offsetHeight || 0) * neu)}px`;
            offen = true;
            continue;
          }
        }

        const absatz = seite.querySelector<HTMLElement>("[data-begleittext]");
        if (absatz) {
          const jetzt = Number((absatz.style.fontSize || "10.5pt").replace("pt", ""));
          if (jetzt > 8.5) {
            absatz.style.fontSize = `${Math.round((jetzt - 0.5) * 100) / 100}pt`;
            offen = true;
          }
        }
      }
      return offen;
    };

    /**
     * Zieht die Rahmenhöhe an den Inhalt nach — ohne den Maßstab anzufassen.
     *
     * Manche Folien wachsen erst nach dem ersten Layout: eine, die ihre
     * Schritte nacheinander aufbaut, ist am Ende höher als beim Messen. Ihr
     * Rahmen wäre dann zu knapp und schnitte unten ab, ohne dass die Seite
     * überliefe — also der stille Fehler, den niemand bemerkt.
     *
     * Neu zu skalieren wäre hier falsch: Das machte jede Verkleinerung wieder
     * rückgängig, die vorher nötig war, damit der Text danebenpasst.
     */
    const rahmenNachziehen = () => {
      for (const seite of document.querySelectorAll<HTMLElement>(".papier-seite")) {
        const rahmen = seite.querySelector<HTMLElement>(".papier-buehne");
        const inhalt = seite.querySelector<HTMLElement>(".papier-inhalt");
        if (!rahmen || !inhalt) continue;
        const massstab = Number(/scale\(([\d.]+)\)/.exec(inhalt.style.transform)?.[1] ?? 1);
        const noetig = Math.ceil(inhalt.offsetHeight * massstab) + 2;
        if (noetig > rahmen.offsetHeight) rahmen.style.height = `${noetig}px`;
      }
    };

    const naechste = (versuch: number) => {
      if (versuch > 40 || !runde()) {
        /*
          Eine letzte Messung der Rahmen.

          Manche Folien wachsen erst nach dem ersten Layout — eine, die ihre
          Schritte nacheinander aufbaut, ist am Ende höher als beim Messen. Ihr
          Rahmen wäre dann zu knapp und schnitte unten ab, ohne dass die Seite
          überliefe. Also noch einmal, wenn alles steht.
        */
        rahmenNachziehen();
        requestAnimationFrame(() => {
          document.body.dataset.papierFertig = "ja";
        });
        return;
      }
      requestAnimationFrame(() => naechste(versuch + 1));
    };

    /* Erst wenn die Schriften stehen — sonst wird gegen den Rückfall gemessen. */
    void document.fonts.ready.then(() =>
      requestAnimationFrame(() => {
        folienPassen();
        /* Zweimal: Beim ersten Mal steht die Entwurfsbreite noch nicht im Layout. */
        requestAnimationFrame(() => {
          folienPassen();
          requestAnimationFrame(() => naechste(0));
        });
      }),
    );
  }, []);

  return null;
}

function Deckblatt() {
  const titel = SECTIONS[0];
  return (
    <section className="papier-seite flex flex-col justify-between">
      <Logo />
      <div>
        <p className="m-0 font-mono text-[11pt] tracking-[0.2em] text-[#6b7785] uppercase">
          ECR in Motion 2026 · Masterclass
        </p>
        <h1 className="mt-4 mb-0 font-display text-[34pt] leading-[1.1] font-extrabold tracking-tight">
          {titel.title}
        </h1>
        {titel.sub && (
          <p className="mt-3 mb-0 text-[15pt] text-[#4a5663]">{titel.sub}</p>
        )}
        <p className="mt-10 mb-0 max-w-[62ch] text-[11pt] leading-relaxed text-[#4a5663]">
          Dieses Dokument gibt den Vortrag zum Nachlesen wieder. Was im Saal gesprochen
          wurde, steht hier unter den Folien. Die Stellen, an denen das Publikum auf dem
          eigenen Handy mitgemacht hat, sind als solche benannt — sie lassen sich beim
          Lesen nicht wiederholen, ihr Ergebnis aber nachvollziehen.
        </p>
      </div>
      <p className="m-0 font-mono text-[9pt] text-[#8b95a1]">
        Carsten Koch · Amazon Web Services · ecr2026.carstenbkoch.de
      </p>
    </section>
  );
}

function Schluss() {
  return (
    <section className="papier-seite flex flex-col justify-center">
      <h2 className="m-0 font-display text-[22pt] font-extrabold">Zum Weiterlesen</h2>
      <p className="mt-4 mb-0 max-w-[62ch] text-[11pt] leading-relaxed text-[#4a5663]">
        Der Vortrag zum Mitklicken und der vollständige Quelltext — einschließlich der
        simulierten Systeme, der Messläufe und aller Prompts:
      </p>
      <p className="mt-6 mb-0 font-mono text-[11pt]">
        ecr2026.carstenbkoch.de
        <br />
        github.com/cabcookie/ecr-in-motion-2026-talk
      </p>
    </section>
  );
}

function Seite({
  abschnitt,
  panel,
  nummer,
}: {
  abschnitt: Section;
  panel: Panel;
  nummer: string;
}) {
  const block = BLOCKS.find((b) => b.n === abschnitt.b);
  const mock: Mock | undefined = panel.papier?.statt ?? panel.mock;
  const text = panel.papier?.text ?? panel.say;

  return (
    <section
      className="papier-seite flex flex-col"
      style={{ ["--accent" as string]: ACCENT[abschnitt.b] }}
    >
      <header className="flex items-baseline justify-between border-b border-[#e3e7ec] pb-3">
        <span className="font-mono text-[9pt] tracking-[0.16em] text-[#6b7785] uppercase">
          {block ? `${block.n} · ${block.tab}` : ""}
        </span>
        <span className="font-mono text-[9pt] text-[#8b95a1]">{nummer}</span>
      </header>

      <h2 className="mt-6 mb-0 font-display text-[19pt] leading-tight font-extrabold tracking-tight">
        {abschnitt.title}
      </h2>
      {abschnitt.sub && (
        <p className="mt-1 mb-0 text-[11pt] text-[#6b7785]">{abschnitt.sub}</p>
      )}

      {/*
        Die Folie im hellen Gewand. Die Mocks sind für die dunkle Bühne gebaut;
        `papier-buehne` dreht die Farbvariablen um, statt jeden Mock ein zweites
        Mal zu schreiben.

        `shrink-0` ist dabei nicht kosmetisch: Der Rahmen ist ein Flex-Kind und
        wurde sonst zusammengedrückt, sobald der Text darunter Platz brauchte.
        Die gerechnete Höhe passte dann nicht mehr zum Maßstab, und die Folie
        wurde unten abgeschnitten — ohne dass irgendwo etwas rot wurde.
      */}
      {mock && (
        <div className="papier-buehne mt-6 shrink-0 overflow-hidden rounded-lg">
          <div className="papier-inhalt px-6 py-7">
            <MockView mock={mock} step={9} />
          </div>
        </div>
      )}

      {text && (
        <p
          data-begleittext
          className="mt-6 mb-0 max-w-[74ch] text-[10.5pt] leading-[1.65] text-[#2b3540]"
        >
          {text}
        </p>
      )}

      {panel.note && (
        <p className="mt-4 mb-0 max-w-[74ch] border-l-2 border-[#d7dde4] pl-4 text-[9pt] leading-relaxed text-[#6b7785]">
          {panel.note}
        </p>
      )}
    </section>
  );
}

/*
  Druckmaß und Farbumkehr.

  Die Seiten sind A4 quer: Die Folien sind für 16:9 entworfen, und hochkant
  müsste jede von ihnen geschrumpft werden, bis der Text darauf nicht mehr zu
  lesen ist.

  `papier-buehne` kehrt die Bühnenfarben ins Helle. Die Mocks lesen ihre Farben
  aus Variablen; hier bekommen sie andere. Das ist der Grund, warum kein Mock
  eine zweite Fassung für den Druck braucht.
*/
const DRUCK = `
@page { size: A4 landscape; margin: 0; }
[data-view="papier"] { background: #fff; }
.papier-seite {
  width: 297mm;
  height: 209.5mm;
  padding: 16mm 18mm;
  box-sizing: border-box;
  break-after: page;
  overflow: hidden;
}
.papier-seite:last-child { break-after: auto; }
.papier-buehne {
  --color-stage: #f4f6f8;
  --color-stage-2: #eceff3;
  --color-stage-3: #e1e6ec;
  --color-fg: #0f1720;
  --color-fg-2: #2b3540;
  --color-fg-3: #6b7785;
  --color-hair: #d7dde4;
  background: #f4f6f8;
  color: #0f1720;
}
/*
  Feste Entwurfsbreite, damit der Umbruch im Inneren derselbe ist wie auf der
  Leinwand. Den Maßstab setzt Einpassen je Seite.
*/
.papier-inhalt { width: 1360px; }
@media print {
  html, body { background: #fff; }
}
`;
