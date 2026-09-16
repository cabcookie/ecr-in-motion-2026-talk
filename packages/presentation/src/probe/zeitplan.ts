import { SECTIONS } from "@/slides/data";
import { dauer, interaktionFuer, type Probe } from "./aufzeichnung";

/**
 * Der überschriebene Zeitplan.
 *
 * In `data.ts` trägt jede Folie eine Soll-Uhrzeit — geschätzt, bevor der
 * Vortrag je gehalten wurde. Nach einer Probe weiß man es besser. Dieser Plan
 * ist das Bessere: aus den gemessenen Zeiten gerechnet, um die geschätzte
 * Interaktionsdauer ergänzt, und er hat Vorrang vor den Foliendaten.
 *
 * Er liegt in der Datenbank und nicht im Browser, weil er den Vortrag betrifft
 * und nicht das Gerät, von dem aus geprobt wurde.
 */
export interface Planstand {
  readonly index: number;
  readonly step: number;
  /** Soll-Uhrzeit als "18:09". */
  readonly at: string;
  /** Wie viel davon für die Interaktion vorgesehen ist, in Sekunden. */
  readonly interaktion: number;
}

export interface Zeitplan {
  /** Wann der Vortrag beginnt — aus der ersten Folie übernommen. */
  readonly beginn: string;
  /*
    Bewusst kein `readonly Planstand[]`: Der Plan geht so, wie er ist, über die
    API-Grenze, und ein readonly-Array liesse sich dort nicht übergeben.
  */
  readonly staende: Planstand[];
  /** Wann dieser Plan entstanden ist, und aus welcher Probe. */
  readonly geschrieben: number;
  readonly ausProbe: number;
  /** Gemessene Dauer der Probe und die Summe der Interaktionsschätzungen, in Sekunden. */
  readonly gemessen: number;
  readonly interaktion: number;
}

/** "18:36" → Minuten seit Mitternacht. */
export function minutenAus(hhmm: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
}

export function alsUhrzeit(minuten: number): string {
  const m = ((Math.round(minuten) % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

/** Der geplante Beginn, so wie er in den Foliendaten steht. */
export function beginnLautFolien(): string {
  return SECTIONS[0]?.panels[0]?.at ?? "18:00";
}

/**
 * Aus einer Probe einen Zeitplan rechnen.
 *
 * Die Uhrzeit einer Folie ist der Beginn plus alles, was davor lag: gemessene
 * Verweildauer und geschätzte Interaktion.
 *
 * Wer zurückblättert und wieder vor, betritt denselben Stand zweimal. Die
 * Uhrzeit kommt vom ERSTEN Betreten — dort war man das erste Mal dort — und
 * die Interaktionszeit wird nur einmal gezählt. Sie findet nicht zweimal
 * statt, nur weil man die Folie zweimal gezeigt hat.
 */
export function planAusProbe(probe: Probe): Zeitplan {
  const beginn = beginnLautFolien();
  const beginnMinuten = minutenAus(beginn) ?? 18 * 60;

  const staende: Planstand[] = [];
  const gesehen = new Set<string>();
  /** Sekunden seit Beginn. */
  let versetzt = 0;
  let interaktionGesamt = 0;

  for (const [i, h] of probe.haelte.entries()) {
    const schluessel = `${h.index}:${h.step}`;
    const erstmals = !gesehen.has(schluessel);
    const interaktion = erstmals ? interaktionFuer(probe, h.index, h.step) : 0;

    if (erstmals) {
      gesehen.add(schluessel);
      staende.push({
        index: h.index,
        step: h.step,
        at: alsUhrzeit(beginnMinuten + versetzt / 60),
        interaktion,
      });
      interaktionGesamt += interaktion;
    }

    versetzt += dauer(probe, i) / 1000 + interaktion;
  }

  return {
    beginn,
    staende,
    geschrieben: Date.now(),
    ausProbe: probe.begonnen,
    gemessen: Math.round(((probe.beendet ?? Date.now()) - probe.begonnen) / 1000),
    interaktion: interaktionGesamt,
  };
}

/**
 * Die geltende Soll-Uhrzeit einer Folie.
 *
 * Der Plan gewinnt, wo er etwas sagt. Folien, die in der Probe nie betreten
 * wurden, behalten ihre Uhrzeit aus den Foliendaten — ein übersprungener
 * Abschnitt soll seine Zeit nicht verlieren, nur weil einmal an ihm
 * vorbeigeklickt wurde.
 */
export function atFuer(plan: Zeitplan | null, index: number, step: number): string | undefined {
  const treffer = plan?.staende.find((s) => s.index === index && s.step === step);
  return treffer?.at ?? SECTIONS[index]?.panels[step]?.at;
}

/** Wann der Vortrag nach diesem Plan endet. */
export function endeLaut(plan: Zeitplan): string {
  const beginn = minutenAus(plan.beginn) ?? 18 * 60;
  return alsUhrzeit(beginn + (plan.gemessen + plan.interaktion) / 60);
}
