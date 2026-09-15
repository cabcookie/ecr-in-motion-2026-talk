import { BLOCKS, SECTIONS } from "@/slides/data";

/**
 * Eine Probe mitschreiben.
 *
 * Der Vortrag hat geplante Zeiten — `at` an den Panels, `budget` an den Blöcken.
 * Was er tatsächlich braucht, weiß man erst, wenn man ihn einmal gehalten hat,
 * und dann hat man es meistens nicht mitgeschrieben. Genau dafür ist das hier:
 * aufnehmen, durchsprechen, und am Ende einen Prompt in der Zwischenablage
 * haben, den ein Agent gegen den Plan rechnen kann.
 *
 * Aufgezeichnet wird jeder STAND, den die Präsentation betritt — nicht jeder
 * Tastendruck. Wer zurückblättert und wieder vor, erzeugt zwei Einträge, und
 * das ist richtig so: Die Folie wurde zweimal gezeigt.
 */

export interface Halt {
  /** Abschnitt, 0-basiert — wie `index` in der Navigation. */
  readonly index: number;
  readonly step: number;
  /** Millisekunden seit Beginn der Aufzeichnung. */
  readonly bei: number;
}

export interface Probe {
  /** Wanduhr beim Start, damit die geplanten Uhrzeiten vergleichbar werden. */
  readonly begonnen: number;
  readonly haelte: readonly Halt[];
  readonly beendet?: number;
  /** Was der Vortragende am Ende angeklickt hat. */
  readonly genugInteraktion?: boolean;
  /** Wie lang der Vortrag sein SOLL, in Minuten — einschließlich Interaktion. */
  readonly sollMinuten?: number;
}

/**
 * Wie lang der Vortrag laut Plan sein soll.
 *
 * Aus den Blockbudgets gerechnet statt irgendwo zusätzlich hinterlegt: Dort
 * steht die Zahl schon, und zwei Orte für dieselbe Angabe gehen auseinander.
 * Ein Budget liest sich als „28 Min · 15 Demo + 13 Interaktion" — die erste
 * Zahl ist die Gesamtzeit des Blocks, der Rest ihre Aufteilung.
 */
export function geplanteMinuten(): number {
  return BLOCKS.reduce((summe, b) => {
    const treffer = /(\d+)\s*Min/.exec(b.budget);
    return summe + (treffer ? Number(treffer[1]) : 0);
  }, 0);
}

/** Wie lange ein Halt gedauert hat. Der letzte zählt bis zum Stopp. */
export function dauer(probe: Probe, i: number): number {
  const naechster = probe.haelte[i + 1]?.bei ?? (probe.beendet ?? Date.now()) - probe.begonnen;
  return naechster - probe.haelte[i].bei;
}

export function gesamtdauer(probe: Probe): number {
  return (probe.beendet ?? Date.now()) - probe.begonnen;
}

/** „7:42" — Minuten und Sekunden, wie eine Stoppuhr sie zeigt. */
export function alsUhr(ms: number): string {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function alsUhrzeit(zeitpunkt: number): string {
  return new Date(zeitpunkt).toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Der Prompt für den Agenten.
 *
 * Er trägt alles, was zur Beurteilung nötig ist, und nichts, was der Agent sich
 * selbst zusammenreimen müsste: den Plan (Blockbudgets und die `at`-Marken an
 * den Folien), die gemessenen Zeiten, und die eine Einschätzung, die nur der
 * Vortragende geben kann — ob genug Raum für Interaktion war.
 *
 * Absichtlich als Text und nicht als JSON: Er landet in einem Chatfenster, und
 * dort soll ein Mensch ihn noch einmal überfliegen können, bevor er ihn
 * abschickt.
 */
export function promptFuerAgenten(probe: Probe): string {
  const zeilen: string[] = [];

  zeilen.push(
    "Ich habe meinen Vortrag einmal geprobt und dabei jeden Folienwechsel mitgeschrieben.",
    "Bitte rechne meine gemessenen Zeiten gegen den Plan und sag mir, ob ich es in der",
    "vorgesehenen Zeit schaffe.",
    "",
    "## Der Plan",
    "",
  );

  for (const b of BLOCKS) {
    zeilen.push(`- **Block ${b.n} · ${b.tab}** — ${b.title}. Budget: ${b.budget}`);
  }

  zeilen.push(
    "",
    "Einzelne Folien tragen eine Soll-Uhrzeit (`at`), zu der wir dort ankommen sollten:",
    "",
  );
  for (const s of SECTIONS) {
    for (const [i, p] of s.panels.entries()) {
      if (p.at) {
        zeilen.push(
          `- ${p.at} — Abschnitt ${s.n}${s.panels.length > 1 ? `.${i + 1}` : ""}: ${s.title}`,
        );
      }
    }
  }

  zeilen.push(
    "",
    "## Was ich gemessen habe",
    "",
    `Der Vortrag SOLL ${probe.sollMinuten ?? geplanteMinuten()} Minuten dauern, einschließlich aller Interaktion.`,
    "",
    `Probe begonnen um ${alsUhrzeit(probe.begonnen)}, gemessene Dauer ${alsUhr(gesamtdauer(probe))}.`,
    `${probe.haelte.length} Folienstände.`,
    "",
    "| Abschnitt | Titel | erreicht nach | Verweildauer |",
    "|---|---|---|---|",
  );

  for (const [i, h] of probe.haelte.entries()) {
    const s = SECTIONS[h.index];
    if (!s) continue;
    const nummer = `${s.n}${s.panels.length > 1 ? `.${h.step + 1}` : ""}`;
    zeilen.push(
      `| ${nummer} | ${s.title} | ${alsUhr(h.bei)} | ${alsUhr(dauer(probe, i))} |`,
    );
  }

  zeilen.push(
    "",
    "## Meine eigene Einschätzung",
    "",
    probe.genugInteraktion
      ? "Ich habe **ausreichend Zeit für Interaktion** mit dem Publikum vorgesehen — Umfragen, Rückfragen, das Warten auf Antworten vom Handy ist in diesen Zeiten enthalten."
      : "Ich habe **nicht genug Zeit für Interaktion** eingeplant. Die gemessenen Zeiten sind die reine Vortragszeit; Umfragen, Rückfragen und das Warten auf Antworten vom Handy kommen noch dazu.",
    "",
    "## Was ich von Dir brauche",
    "",
    "1. Halte ich das Gesamtbudget? Wenn nicht, um wie viel liege ich darüber?",
    "2. Welche Blöcke laufen aus dem Ruder, und welche haben Luft?",
    "3. Wo weiche ich am stärksten von den Soll-Uhrzeiten ab — und ist das ein Problem",
    "   oder holt es sich wieder ein?",
    "4. Nenne mir die drei Abschnitte, an denen Kürzen am meisten bringt und am",
    "   wenigsten weh tut. Begründe, warum gerade die.",
    "5. Wenn ich oben angegeben habe, dass die Interaktionszeit fehlt: Schätze sie",
    "   ab und rechne sie dazu, bevor Du urteilst.",
    "",
    "Sei ehrlich statt freundlich. Wenn es nicht passt, sag es klar.",
  );

  return zeilen.join("\n");
}
