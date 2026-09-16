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
 * Der Text, wie ihn der Empfaenger liest.
 *
 * Wortwoertlich bis auf die Kommentare: Was in anhang.md steht, steht in der
 * Mail. Kein Markdown wird gerendert, weil die Mail reiner Text ist — eine
 * Ueberschrift mit # kaeme beim Empfaenger als # an.
 */
export function anhangText(roh: string): string {
  return roh.replace(KOMMENTAR, "").trim();
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
 * wissen, was Gruppe und was Eintrag ist. Statt die Liste ein zweites Mal als
 * TypeScript zu fuehren, wird sie hier aus derselben Datei gelesen. Zwei
 * gepflegte Fassungen waeren eine zu viel: Die eine veraltet, und man merkt es
 * erst, wenn jemand auf einen toten Link klickt.
 *
 * Die Form, auf die sich das stuetzt, ist die, in der der Text ohnehin schon
 * dasteht — nichts wurde fuer den Parser erfunden:
 *
 *   Gruppe, am Zeilenanfang, mit Doppelpunkt:
 *     Wofuer dieser Eintrag gut ist
 *     https://die.adresse/
 *
 * Eine Gruppe erkennt man daran, dass die naechste nicht leere Zeile
 * EINGERUECKT ist. Das unterscheidet sie von der Einleitung ("Wenn Sie selbst
 * anfangen moechten:"), die aeusserlich genauso aussieht, aber keine Eintraege
 * hat.
 *
 * Was nicht in dieses Muster passt, wird stillschweigend uebergangen — der
 * Anfang der Datei (Hinweis auf den KI-Agenten, die beiden Adressen) soll hier
 * ja gerade NICHT als Einstieg auftauchen. Dass am Ende ueberhaupt etwas
 * herauskommt, prueft pruefung/papier-test.ts vor jedem Deployment.
 */
export function anhangEinstiege(roh: string): Einstieg[] {
  const zeilen = anhangText(roh).split("\n");
  const blocks: { gruppe: string; punkte: { was: string; url: string }[] }[] = [];

  const eingerueckt = (z: string) => /^\s+\S/.test(z);
  /** Die naechste Zeile mit Inhalt — Leerzeilen trennen, sie beenden nichts. */
  const naechsteVolle = (ab: number) => {
    for (let i = ab; i < zeilen.length; i++) if (zeilen[i].trim()) return zeilen[i];
    return "";
  };

  for (let i = 0; i < zeilen.length; i++) {
    const zeile = zeilen[i];
    if (!zeile.trim()) continue;

    if (!eingerueckt(zeile)) {
      const kopf = zeile.trim();
      /* Eine Gruppe ist eine Ueberschrift MIT Eintraegen darunter. */
      if (kopf.endsWith(":") && eingerueckt(naechsteVolle(i + 1))) {
        blocks.push({ gruppe: kopf, punkte: [] });
      } else {
        /* Alles andere beendet die laufende Gruppe. */
        if (blocks.length && blocks[blocks.length - 1].punkte.length === 0) blocks.pop();
        else if (blocks.length) blocks.push({ gruppe: "", punkte: [] });
      }
      continue;
    }

    const inhalt = zeile.trim();
    const offen = blocks[blocks.length - 1];
    if (!offen?.gruppe) continue;

    /*
      Die Adresse gehoert zum Eintrag darueber. Steht sie allein da, weil
      jemand die Beschreibung vergessen hat, bekommt sie sich selbst als Text —
      besser ein nackter Link als ein verschluckter.
    */
    if (/^https?:\/\//.test(inhalt)) {
      const letzter = offen.punkte[offen.punkte.length - 1];
      if (letzter && !letzter.url) letzter.url = inhalt;
      else offen.punkte.push({ was: inhalt, url: inhalt });
    } else {
      offen.punkte.push({ was: inhalt, url: "" });
    }
  }

  /* Eintraege ohne Adresse sind halbe Saetze und gehoeren nicht aufs Blatt. */
  return blocks
    .filter((b) => b.gruppe)
    .map((b) => ({ gruppe: b.gruppe, punkte: b.punkte.filter((p) => p.url) }))
    .filter((b) => b.punkte.length > 0);
}
