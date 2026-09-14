/**
 * Zwei Postfächer, zwei Agenten.
 *
 * Der Vortrag braucht beide: In Abschnitt 6 schreiben die Teilnehmer an Lisas
 * Assistenten — der hat einen Systemprompt und Werkzeuge und arbeitet den
 * Vorgang ab. In Abschnitt 15 schreiben sie an einen Agenten, der nichts hat
 * als sein Training; dass der eine Marge erfindet, ist der Punkt der Folie.
 *
 * Unterschieden wird über die Empfängeradresse und nicht über den Betreff:
 * Beim ersten Postfach fordern wir die Teilnehmer ausdrücklich auf, den Text
 * zu ändern. Wer dabei auch den Betreff anfasst, bekäme sonst den falschen
 * Agenten — und würde die Folie nicht verstehen.
 */
export type Modus = "assistent" | "probe";

export interface Postfach {
  readonly adresse: string;
  readonly modus: Modus;
  readonly anzeigename: string;
}

const DOMAIN = "carstenbkoch.de";

export const POSTFAECHER: readonly Postfach[] = [
  { adresse: `ecr2026@${DOMAIN}`, modus: "assistent", anzeigename: "Lisa Berger · Nordkorb" },
  { adresse: `ecr2026-probe@${DOMAIN}`, modus: "probe", anzeigename: "Lisa Berger · Nordkorb" },
];

/** Welcher Agent ist gemeint? Fällt auf den Assistenten zurück. */
export function postfachFuer(empfaenger: readonly string[]): Postfach {
  const klein = empfaenger.map((e) => e.toLowerCase());
  return (
    POSTFAECHER.find((p) => klein.some((e) => e.includes(p.adresse.toLowerCase()))) ??
    POSTFAECHER[0]
  );
}

/** Adresse des Vortrags — steht in jeder Antwort. */
export const VORTRAG_URL = "https://ecr2026.carstenbkoch.de";
export const CODE_URL = "https://github.com/cabcookie/ecr-in-motion-2026-talk";
