/**
 * Der feste Teil der Antwortmail — gelesen, nicht programmiert.
 *
 * Der Text steht in anhang.md und ist dort zu bearbeiten. Hier stehen nur die
 * beiden Handgriffe, die ihn benutzbar machen, und beide sind reine
 * Zeichenkettenarbeit: kein Dateizugriff, keine Abhaengigkeit auf Node. Das
 * ist Absicht — dieselben Funktionen laufen im Browser, wo die Druckfassung
 * dieselbe Datei rendert.
 *
 * Wer die Datei liest, entscheidet jede Aufrufstelle selbst. In der Lambda
 * liegt sie neben dem Bundle, im Browser kommt sie ueber den ?raw-Import von
 * Vite herein, und unter tsx ueber import.meta.url. Drei Laufzeiten, drei
 * Wege — aber nur eine Quelle.
 */

/** Was zwischen <!-- und --> steht, ist Notiz an den Bearbeiter. */
const KOMMENTAR = /<!--[\s\S]*?-->/g;

/**
 * Wo die Einstiegsliste beginnt.
 *
 * Eine Marke und keine Heuristik, weil es beides gab und die Heuristik verlor.
 * Der Anfang der Datei sieht aus wie eine Gruppe mit Eintraegen — ein Satz,
 * darunter Absaetze mit Adressen — ist aber keine: Dank, Kontakt und die
 * Adressen zum Vortrag gehoeren in die Mail, nicht in eine Liste mit der
 * Ueberschrift „Wie es weitergeht". Kein Muster trennt das zuverlaessig, also
 * sagt es die Datei selbst.
 *
 * Sie ist ein Kommentar und damit im Postfach unsichtbar.
 */
const LISTE_AB = /<!--\s*liste\s*-->/;

/**
 * Der Text, wie ihn der Empfaenger liest.
 *
 * Wortwoertlich bis auf die Kommentare: Was in anhang.md steht, steht in der
 * Mail. Kein Markdown wird gerendert, weil die Mail reiner Text ist — eine
 * Ueberschrift mit # kaeme beim Empfaenger als # an.
 */
export function anhangText(roh: string): string {
  return (
    roh
      .replace(KOMMENTAR, "")
      /*
        Ein entfernter Kommentar hinterlaesst die Leerzeilen, die ihn umgaben —
        stand er zwischen zwei Absaetzen, klafft danach eine doppelte Luecke.
        Im Quelltext sieht man das nicht, im Postfach schon.
      */
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );
}

/** Ein Block der Einstiegsliste: fuer wen, und wohin. */
export interface Einstieg {
  readonly gruppe: string;
  readonly punkte: readonly { readonly was: string; readonly url: string }[];
}

/**
 * Dieselbe Liste, aber als Daten — fuer die letzte Seite des PDFs.
 *
 * Die Mail kippt den Text aus; ein Blatt braucht Spalten, und dafuer muss es
 * wissen, was Ueberschrift und was Eintrag ist. Statt die Liste ein zweites
 * Mal als TypeScript zu fuehren, wird sie hier aus derselben Datei gelesen.
 * Zwei gepflegte Fassungen waeren eine zu viel: Die eine veraltet, und man
 * merkt es erst, wenn jemand auf einen toten Link klickt.
 *
 * Die Regel braucht keine Einrueckung und kein Sonderzeichen. Sie liest die
 * Form, in der so ein Text ohnehin geschrieben wird — Absatz fuer Absatz:
 *
 *   Endet ein Absatz auf einer Adresse, IST er ein Eintrag; was darueber
 *   steht, ist seine Beschreibung.
 *   Endet er nicht auf einer Adresse, ist er die Ueberschrift der Eintraege
 *   darunter.
 *
 * Eine frueher Fassung verlangte eingerueckte Zeilen. Das las sich in der Mail
 * schlecht — Einrueckungen sehen auf einem Handy wie ein Fehler aus —, und ein
 * Format, das den Text verschlechtert, damit ein Programm ihn versteht, hat
 * die Aufgaben vertauscht.
 *
 * Was vor der ersten Ueberschrift steht, faellt heraus: Der Dank, die
 * Adressen zum Vortrag und der Satz zur geloeschten Mailadresse gehoeren in
 * die Mail, aber nicht in eine Liste mit der Ueberschrift „Wie es weitergeht".
 * Dass am Ende ueberhaupt etwas herauskommt, prueft pruefung/papier-test.ts
 * vor jedem Deployment.
 */
export function anhangEinstiege(roh: string): Einstieg[] {
  /* Vor der Marke steht Mailtext, kein Listeneintrag. Ohne Marke: alles. */
  const ab = roh.split(LISTE_AB);
  const text = anhangText(ab.length > 1 ? ab.slice(1).join("") : roh);
  const blocks: { gruppe: string; punkte: { was: string; url: string }[] }[] = [];

  for (const absatz of text.split(/\n\s*\n/)) {
    const zeilen = absatz.trim().split("\n").map((z) => z.trim()).filter(Boolean);
    if (zeilen.length === 0) continue;

    const letzte = zeilen[zeilen.length - 1];
    if (!/^https?:\/\//.test(letzte)) {
      /* Eine Ueberschrift ohne Eintraege war keine — sie faellt gleich weg. */
      if (blocks.length && blocks[blocks.length - 1].punkte.length === 0) blocks.pop();
      blocks.push({ gruppe: zeilen.join(" ").replace(/:$/, ""), punkte: [] });
      continue;
    }

    /* Ein Eintrag ohne Ueberschrift darueber gehoert nicht in die Liste. */
    const offen = blocks[blocks.length - 1];
    if (!offen) continue;
    const was = zeilen.slice(0, -1).join(" ").replace(/:$/, "");
    offen.punkte.push({ was: was || letzte, url: letzte });
  }

  return blocks.filter((b) => b.punkte.length > 0);
}
