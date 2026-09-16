/**
 * Die Antwort außerhalb des Vortragsfensters.
 *
 * Kein Agent, kein Modell, kein Zitat. Nur dieser Satz und darunter der feste
 * Teil aus anhang.md, samt dessen erstem Satz: Die Antwort kommt zwar nicht
 * vom Agenten, aber sie kommt automatisch — und das soll erkennbar sein.
 *
 * Das Zitat fehlt mit Absicht. Stünde der eingegangene Text darunter, könnte
 * jeder fremden Text über dieses Postfach an eine beliebige Adresse schicken.
 *
 * Der Wortlaut steht hier für sich, damit `pnpm mail:test` ihn prüfen kann.
 */
export const RUHE_HINWEIS =
  "Lisa ist im Moment nicht aktiv. Wenn Du sie noch einmal erleben möchtest,\n" +
  "frag gerne eine Präsentation bei Euch an:\n" +
  "https://carstenbkoch.de/";

export function ruheRumpf(): string {
  return ["Hallo,", "", RUHE_HINWEIS].join("\n");
}
