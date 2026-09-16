/**
 * Der Abspann des Vortrags — eine Datei, drei Auftritte.
 *
 * Der Text steht in anhang.md und ist dort zu bearbeiten. Hier steht, was ihn
 * benutzbar macht: `anhangStruktur` liest ihn als Markdown, `anhangText`
 * rechnet ihn fuer die Mail zu reinem Text herunter.
 *
 * Beides ist reine Zeichenkettenarbeit — kein Dateizugriff, keine
 * Abhaengigkeit auf Node. Das ist Absicht: Dieselben Funktionen laufen im
 * Browser, wo Folie und Druckfassung dieselbe Datei rendern.
 *
 * Wer die Datei liest, entscheidet jede Aufrufstelle selbst. In der Lambda
 * liegt sie neben dem Bundle, im Browser kommt sie ueber den ?raw-Import von
 * Vite herein, unter tsx ueber import.meta.url. Drei Laufzeiten, drei Wege —
 * aber nur eine Quelle.
 *
 * **Warum ein eigener Leser und keine Bibliothek.** Gebraucht werden vier
 * Formen: Ueberschrift, Absatz, Eintrag mit Link, nackte Adresse. Ein
 * Markdown-Paket haette Tabellen, Fussnoten und eingebettetes HTML
 * mitgebracht — und die Frage offengelassen, was davon auf einer Folie
 * passiert. Dieser Leser versteht genau das, was die Datei erlaubt.
 */

/** Was zwischen <!-- und --> steht, ist Notiz an den Bearbeiter. */
const KOMMENTAR = /<!--[\s\S]*?-->/g;

/** `- [Titel](adresse) — Beschreibung` */
const EINTRAG = /^-\s*\[([^\]]+)\]\(([^)]+)\)\s*(?:[—–-]\s*)?([\s\S]*)$/;
/** `<adresse>` allein auf der Zeile */
const NACKTE_ADRESSE = /^<(https?:\/\/[^>]+)>$/;

/** Ein Link mit dem Satz, der ihn erklaert. */
export interface Eintrag {
  readonly was: string;
  readonly url: string;
  /** Der Satz hinter dem Gedankenstrich; leer, wenn keiner dastand. */
  readonly warum: string;
}

/** Ein Abschnitt: Ueberschrift, ein Satz dazu, seine Eintraege. */
export interface Abschnitt {
  readonly titel: string;
  readonly einleitung: string;
  readonly eintraege: readonly Eintrag[];
}

/**
 * Der Abspann, zerlegt.
 *
 * `kopf` ist alles vor der ersten Ueberschrift und geht NUR in die Mail: Dank,
 * die drei Adressen, der Satz zur geloeschten Mailadresse. Das gehoert in ein
 * Postfach, nicht auf eine Leinwand.
 */
export interface Anhang {
  readonly kopf: readonly string[];
  readonly abschnitte: readonly Abschnitt[];
}

/** Absaetze: durch Leerzeilen getrennt, Zeilen darin bleiben zunaechst stehen. */
function bloecke(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);
}

/**
 * Liest anhang.md.
 *
 * Vier Formen, mehr gibt es nicht — sie stehen im Kommentar der Datei selbst.
 * Was in keine passt, ist Fliesstext: vor der ersten Ueberschrift Kopf, danach
 * die Einleitung seines Abschnitts.
 *
 * Abschnitte ohne Eintraege fallen heraus. Eine Ueberschrift ohne Links ist
 * auf einer Folie eine leere Spalte, und die faellt mehr auf als ihr Fehlen.
 */
export function anhangStruktur(roh: string): Anhang {
  const kopf: string[] = [];
  const abschnitte: { titel: string; einleitung: string; eintraege: Eintrag[] }[] = [];

  for (const block of bloecke(roh.replace(KOMMENTAR, ""))) {
    if (block.startsWith("## ")) {
      abschnitte.push({ titel: block.slice(3).trim(), einleitung: "", eintraege: [] });
      continue;
    }

    const offen = abschnitte[abschnitte.length - 1];

    /*
      Eine Liste ist EIN Absatz mit mehreren Zeilen. Deshalb wird der Block
      zeilenweise geprueft; nur wenn keine Zeile ein Eintrag ist, gilt er als
      Fliesstext.
    */
    const eintraege = sammleEintraege(block.split("\n"));
    if (eintraege.length > 0) {
      if (offen) offen.eintraege.push(...eintraege);
      continue;
    }

    if (!offen) kopf.push(block);
    else if (!offen.einleitung) offen.einleitung = block.replace(/\s*\n\s*/g, " ");
  }

  return { kopf, abschnitte: abschnitte.filter((a) => a.eintraege.length > 0) };
}

/**
 * Die Eintraege eines Blocks.
 *
 * Fortsetzungszeilen gehoeren zum Eintrag darueber: Wer eine lange
 * Beschreibung umbricht, meint einen Eintrag und nicht zwei.
 */
function sammleEintraege(zeilen: string[]): Eintrag[] {
  const raus: { was: string; url: string; warum: string }[] = [];
  for (const zeile of zeilen) {
    const treffer = EINTRAG.exec(zeile.trim());
    if (treffer) {
      raus.push({ was: treffer[1].trim(), url: treffer[2].trim(), warum: treffer[3].trim() });
      continue;
    }
    const letzter = raus[raus.length - 1];
    if (letzter) letzter.warum = `${letzter.warum} ${zeile.trim()}`.trim();
  }
  return raus;
}

/** Umbruch an Wortgrenzen — das Mailprogramm soll nicht selbst raten muessen. */
function umbrich(text: string, breite = 70): string {
  const zeilen: string[] = [];
  let aktuell = "";
  for (const wort of text.split(/\s+/).filter(Boolean)) {
    if (!aktuell) aktuell = wort;
    else if (aktuell.length + 1 + wort.length <= breite) aktuell += ` ${wort}`;
    else {
      zeilen.push(aktuell);
      aktuell = wort;
    }
  }
  if (aktuell) zeilen.push(aktuell);
  return zeilen.join("\n");
}

/**
 * Der Text, wie ihn der Empfaenger im Postfach liest.
 *
 * Reiner Text, weil die Mail in jedem Programm gleich aussehen soll — ein ##
 * kaeme beim Empfaenger als ## an und nicht als Ueberschrift. Die Auszeichnung
 * faellt also weg und wird zu dem, was sie meint: aus einem Link sein Titel,
 * der Satz dazu, und darunter die nackte Adresse.
 *
 * Die Adresse steht IMMER allein auf ihrer Zeile. Die Skill-Builder-Links sind
 * ueber hundert Zeichen lang; ein Mailprogramm, das eine Zeile umbricht,
 * zerlegt sie — und einen Link, den man von Hand zusammensetzen muss, klickt
 * niemand.
 */
export function anhangText(roh: string): string {
  const { kopf, abschnitte } = anhangStruktur(roh);
  const teile: string[] = [];

  /* Der Kopf ist vom Autor umgebrochen; nur die spitzen Klammern fallen weg. */
  for (const block of kopf) {
    teile.push(
      block
        .split("\n")
        .map((z) => z.trim().replace(NACKTE_ADRESSE, "$1"))
        .join("\n"),
    );
  }

  for (const abschnitt of abschnitte) {
    teile.push(abschnitt.titel);
    if (abschnitt.einleitung) teile.push(umbrich(abschnitt.einleitung));
    for (const e of abschnitt.eintraege) {
      teile.push(`${umbrich(e.warum ? `${e.was} — ${e.warum}` : e.was)}\n${e.url}`);
    }
  }

  return teile.join("\n\n").trim();
}
