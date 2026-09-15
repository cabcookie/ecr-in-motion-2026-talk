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
  /**
   * Folien, auf denen das Publikum mitmacht, und wie lange das dauern wird —
   * in Sekunden, je Stand unter `"<index>:<step>"`.
   *
   * Wer allein probt, klickt an diesen Stellen durch: Es antwortet ja niemand.
   * Genau diese Lücke steht hier. Sie ist eine Schätzung und keine Messung, und
   * das ist auch der Grund, warum sie von Hand eingetragen wird.
   */
  readonly interaktionen?: Readonly<Record<string, number>>;
  /** Wie lang der Vortrag sein SOLL, in Minuten — einschließlich Interaktion. */
  readonly sollMinuten?: number;
}

/** Der Schlüssel, unter dem die Interaktionszeit eines Standes liegt. */
export function standSchluessel(index: number, step: number): string {
  return `${index}:${step}`;
}

/** Wie viel Interaktionszeit für einen Stand vorgesehen ist, in Sekunden. */
export function interaktionFuer(probe: Probe, index: number, step: number): number {
  return probe.interaktionen?.[standSchluessel(index, step)] ?? 0;
}

/** Ob dieser Stand als Interaktion markiert ist — auch mit noch 0 Sekunden. */
export function istMarkiert(probe: Probe, index: number, step: number): boolean {
  return probe.interaktionen?.[standSchluessel(index, step)] !== undefined;
}

/** Die Summe aller Interaktionsschätzungen, in Sekunden. */
export function interaktionGesamt(probe: Probe): number {
  return Object.values(probe.interaktionen ?? {}).reduce((s, v) => s + v, 0);
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

/** "2:30" → 150 Sekunden. Leer oder unsinnig ergibt 0. */
export function sekundenAus(text: string): number {
  const m = /^(\d{1,3}):(\d{1,2})$/.exec(text.trim());
  if (m) return Number(m[1]) * 60 + Math.min(59, Number(m[2]));
  const nur = /^(\d{1,4})$/.exec(text.trim());
  return nur ? Number(nur[1]) * 60 : 0;
}

/**
 * Der Prompt für den Agenten.
 *
 * Er trägt alles, was zur Beurteilung nötig ist, und nichts, was der Agent sich
 * selbst zusammenreimen müsste: den Plan, die gemessenen Zeiten, und die
 * Schätzungen für die Stellen, an denen das Publikum mitmacht.
 *
 * Die Interaktionszeit steht je Folie statt als pauschale Auskunft am Ende.
 * Das ist der Unterschied zwischen „ich habe wohl genug Zeit gelassen" und
 * „auf Abschnitt 8 warte ich drei Minuten auf die Antworten" — nur das zweite
 * kann ein Agent nachrechnen.
 *
 * Absichtlich als Text und nicht als JSON: Er landet in einem Chatfenster, und
 * dort soll ein Mensch ihn noch einmal überfliegen können, bevor er ihn
 * abschickt.
 */
export function promptFuerAgenten(probe: Probe): string {
  const zeilen: string[] = [];
  const interaktion = interaktionGesamt(probe);
  const gesamt = gesamtdauer(probe) / 1000 + interaktion;

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
    `Probe begonnen um ${alsUhrzeit(probe.begonnen)}, reine Vortragszeit ${alsUhr(gesamtdauer(probe))}`,
    `über ${probe.haelte.length} Folienstände.`,
    "",
    "Ich habe allein geprobt. An den Stellen, an denen das Publikum mitmacht, habe ich",
    "durchgeklickt und stattdessen geschätzt, wie lange es dauern wird — diese Schätzungen",
    "stehen unten in der Spalte „Interaktion\" und sind in keiner gemessenen Zeit enthalten.",
    "",
    `**Gemessen ${alsUhr(gesamtdauer(probe))} + geschätzte Interaktion ${alsUhr(interaktion * 1000)} = ${alsUhr(gesamt * 1000)}.**`,
    "",
    "| Abschnitt | Titel | erreicht nach | Verweildauer | Interaktion |",
    "|---|---|---|---|---|",
  );

  const gezaehlt = new Set<string>();
  for (const [i, h] of probe.haelte.entries()) {
    const s = SECTIONS[h.index];
    if (!s) continue;
    const schluessel = standSchluessel(h.index, h.step);
    /* Ein zweites Betreten derselben Folie bringt keine zweite Interaktion mit. */
    const erstmals = !gezaehlt.has(schluessel);
    gezaehlt.add(schluessel);
    const ia = erstmals ? interaktionFuer(probe, h.index, h.step) : 0;
    const nummer = `${s.n}${s.panels.length > 1 ? `.${h.step + 1}` : ""}`;
    zeilen.push(
      `| ${nummer} | ${s.title} | ${alsUhr(h.bei)} | ${alsUhr(dauer(probe, i))} | ${
        istMarkiert(probe, h.index, h.step) && erstmals ? alsUhr(ia * 1000) : "—"
      } |`,
    );
  }

  zeilen.push(
    "",
    "## Was ich von Dir brauche",
    "",
    "1. Halte ich das Gesamtbudget? Wenn nicht, um wie viel liege ich darüber?",
    "2. Welche Blöcke laufen aus dem Ruder, und welche haben Luft?",
    "3. Wo weiche ich am stärksten von den Soll-Uhrzeiten ab — und ist das ein Problem",
    "   oder holt es sich wieder ein?",
    "4. Nenne mir die drei Abschnitte, an denen Kürzen am meisten bringt und am",
    "   wenigsten weh tut. Begründe, warum gerade die.",
    "5. Sind meine Schätzungen für die Interaktion plausibel? Sag es, wenn eine davon",
    "   für das, was dort passieren soll, zu knapp wirkt.",
    "",
    "Sei ehrlich statt freundlich. Wenn es nicht passt, sag es klar.",
  );

  return zeilen.join("\n");
}
