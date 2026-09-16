/**
 * Das Postfach des Agenten.
 *
 * Bis zum 16.09. waren es zwei: `ecr2026@` für den Assistenten mit Werkzeugen
 * und `ecr2026-probe@` für denselben Agenten ohne. Das zweite ist ersatzlos
 * entfallen (Entscheidung Carsten, 16.09.) — die Stufe ohne Werkzeuge zeigt im
 * Vortrag der rohe Agent im Chat.
 *
 * Die Liste bleibt eine Liste, weil die SES-Regel im Domain-Konto mehrere
 * Adressen annimmt: Was dort an eine Adresse geht, die hier fehlt, beantwortet
 * das erste Postfach. Eine Antwort vom Standardpostfach ist besser als keine.
 */
export interface Postfach {
  readonly adresse: string;
  readonly anzeigename: string;
}

const DOMAIN = "carstenbkoch.de";

export const POSTFAECHER: readonly Postfach[] = [
  { adresse: `ecr2026@${DOMAIN}`, anzeigename: "Lisa Berger · Nordkorb" },
];

/** Welches Postfach ist gemeint? Fällt auf das erste zurück. */
export function postfachFuer(empfaenger: readonly string[]): Postfach {
  const klein = empfaenger.map((e) => e.toLowerCase());
  return (
    POSTFAECHER.find((p) => klein.some((e) => e.includes(p.adresse.toLowerCase()))) ??
    POSTFAECHER[0]
  );
}

/**
 * Der feste Name der Mail-Lambda.
 *
 * Fest statt von CDK erzeugt, weil der Agent sie zum Versenden aufruft — und
 * der Agent läuft in AgentCore, wohin keine Umgebungsvariable des Stacks
 * gelangt. Derselbe Grund wie beim Rollennamen: ein abgesprochener Name statt
 * einer Verdrahtung.
 */
export const MAIL_FUNKTION = "ecr2026-mail-handler";

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

/**
 * Was der Agent der Mail-Lambda zum Versenden übergibt.
 *
 * Der Rumpf ist fertig bis auf den festen Anhang und das Zitat; beides setzt
 * die Lambda davor, weil anhang.md nur neben ihr liegt.
 */
export interface Sendeauftrag {
  readonly art: "senden";
  readonly postfach: string;
  readonly an: string;
  readonly betreff: string;
  readonly rumpf: string;
  readonly inAntwortAuf?: string;
  readonly eingang?: { readonly absender: string; readonly absenderName?: string; readonly text: string };
}
