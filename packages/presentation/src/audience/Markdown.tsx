import type { ReactNode } from "react";

/**
 * Markdown für den Gedankengang des Agenten — gerade so viel, wie er schreibt.
 *
 * Überschriften, Aufzählungen, nummerierte Listen, Absätze, Codeblöcke und
 * im Text **fett**, *kursiv* und `Code`. Unterstriche zeichnen NICHT aus:
 * Werkzeugnamen wie antworte_im_chat würden sonst kursiv.
 *
 * Keine Tabellen, keine Links, kein HTML: Der Text kommt von einem Modell,
 * und hier entstehen ausschließlich React-Elemente. Nichts davon wird als
 * HTML eingesetzt.
 *
 * Eine Bibliothek wäre vollständiger. Sie wäre aber eine neue Abhängigkeit im
 * Bündel, für einen aufklappbaren Kasten auf dem Handy.
 */
export function Markdown({ text }: { text: string }) {
  return <div className="grid gap-2">{bloecke(text)}</div>;
}

type Block =
  | { art: "titel"; text: string }
  | { art: "absatz"; zeilen: string[] }
  | { art: "liste"; geordnet: boolean; punkte: string[] }
  | { art: "code"; zeilen: string[] };

const PUNKT = /^\s*[-*•]\s+(.*)$/;
const NUMMER = /^\s*\d+[.)]\s+(.*)$/;
const TITEL = /^\s*#{1,6}\s+(.*)$/;

function zerlege(text: string): Block[] {
  const out: Block[] = [];
  let code: string[] | null = null;
  for (const zeile of text.replace(/\r\n?/g, "\n").split("\n")) {
    if (/^\s*```/.test(zeile)) {
      if (code) {
        out.push({ art: "code", zeilen: code });
        code = null;
      } else {
        code = [];
      }
      continue;
    }
    if (code) {
      code.push(zeile);
      continue;
    }
    const letzter = out[out.length - 1];
    if (!zeile.trim()) {
      /* Eine Leerzeile beendet Absatz und Liste. */
      if (letzter && letzter.art !== "titel") out.push({ art: "absatz", zeilen: [] });
      continue;
    }
    const titel = TITEL.exec(zeile);
    if (titel) {
      out.push({ art: "titel", text: titel[1] });
      continue;
    }
    const punkt = PUNKT.exec(zeile);
    const nummer = punkt ? null : NUMMER.exec(zeile);
    if (punkt || nummer) {
      const geordnet = Boolean(nummer);
      const inhalt = (punkt ?? nummer)![1];
      if (letzter?.art === "liste" && letzter.geordnet === geordnet) letzter.punkte.push(inhalt);
      else out.push({ art: "liste", geordnet, punkte: [inhalt] });
      continue;
    }
    if (letzter?.art === "absatz") letzter.zeilen.push(zeile);
    else if (letzter?.art === "liste") {
      /* Eingerückte Fortsetzung eines Listenpunkts. */
      letzter.punkte[letzter.punkte.length - 1] += ` ${zeile.trim()}`;
    } else out.push({ art: "absatz", zeilen: [zeile] });
  }
  if (code) out.push({ art: "code", zeilen: code });
  return out.filter((b) => b.art !== "absatz" || b.zeilen.length > 0);
}

function bloecke(text: string): ReactNode[] {
  return zerlege(text).map((b, i) => {
    switch (b.art) {
      case "titel":
        return (
          <p key={i} className="m-0 font-semibold text-fg-2">
            {zeile(b.text)}
          </p>
        );
      case "absatz":
        return (
          <p key={i} className="m-0">
            {b.zeilen.map((z, j) => (
              <span key={j}>
                {j > 0 && <br />}
                {zeile(z)}
              </span>
            ))}
          </p>
        );
      case "liste": {
        const Liste = b.geordnet ? "ol" : "ul";
        return (
          <Liste key={i} className={`m-0 grid gap-1 pl-5 ${b.geordnet ? "list-decimal" : "list-disc"}`}>
            {b.punkte.map((p, j) => (
              <li key={j}>{zeile(p)}</li>
            ))}
          </Liste>
        );
      }
      case "code":
        return (
          <pre key={i} className="m-0 overflow-x-auto rounded-lg bg-stage-3 px-3 py-2 font-mono text-xs">
            {b.zeilen.join("\n")}
          </pre>
        );
    }
  });
}

/** `Code`, **fett**, *kursiv* — in dieser Reihenfolge. */
const INLINE = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*\s][^*]*\*)/g;

function zeile(text: string): ReactNode[] {
  return text.split(INLINE).map((teil, i) => {
    if (i % 2 === 0) return teil;
    if (teil.startsWith("`")) {
      return (
        <code key={i} className="rounded bg-stage-3 px-1 font-mono text-[0.9em]">
          {teil.slice(1, -1)}
        </code>
      );
    }
    if (teil.startsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-fg-2">
          {teil.slice(2, -2)}
        </strong>
      );
    }
    return <em key={i}>{teil.slice(1, -1)}</em>;
  });
}
