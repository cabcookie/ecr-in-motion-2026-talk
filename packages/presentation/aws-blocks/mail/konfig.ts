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

/*
  Hier stand die Adresse der anklickbaren Fassung. Sie ist raus, weil die
  Fassung nach dem Abend abgeschaltet wird — und eine Adresse, die ins Leere
  laeuft, ist in einer Mail schlechter als gar keine. Was den Abend ueberlebt,
  ist das PDF und der Quelltext.
*/
export const CODE_URL = "https://github.com/cabcookie/ecr-in-motion-2026-talk";
/**
 * Die Folien als PDF.
 *
 * Kurz genug, um sie jemandem zuzurufen, und ohne Endung — die Anwendung
 * faengt den Pfad ab und leitet auf die Datei weiter (siehe src/routen.ts).
 * Wer am naechsten Morgen nachschlagen will, worueber wir gesprochen haben,
 * braucht nicht den Klickpfad durch den Vortrag, sondern ein Dokument.
 */
export const PDF_URL = "https://ecr2026.carstenbkoch.de/vortrag";

/*
  Hier stand EINSTIEGE: vier Gruppen, neun Adressen, als TypeScript.

  Der Text gehoert dem Leser, nicht dem Uebersetzer. Er steht jetzt in
  anhang.md und wird von dort gelesen - von der Mail woertlich, von der
  letzten PDF-Seite als Liste (siehe anhang.ts). Die Auswahlregeln, die dort
  einmal im Kommentar standen und teuer erkauft waren, stehen jetzt als
  Kommentar in der Datei selbst, wo sie derjenige sieht, der sie braucht.
*/
