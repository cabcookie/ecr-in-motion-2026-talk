#!/usr/bin/env node
// Erzeugt storyboard.html aus den Foliendaten der Live-View.
//
// Die App ist die Quelle der Wahrheit. Dieses Skript spiegelt ihren Inhalt in
// das Artefakt, damit beide nicht auseinanderlaufen — von Hand gepflegt wären
// sie nach zwei Änderungen wieder verschieden.
//
// Aufruf: node build-storyboard.mjs

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const DATA = join(HERE, "../../presentation/src/slides/data.ts");

/** Holt ein Array-Literal per Klammerzählung aus dem TypeScript-Quelltext. */
function grabArray(src, name) {
  const i = src.indexOf(`export const ${name}`);
  if (i < 0) throw new Error(`${name} nicht gefunden in ${DATA}`);
  // Ab dem Gleichheitszeichen suchen, sonst trifft die eckige Klammer
  // die Typ-Annotation (Block[]) statt des Array-Literals.
  const start = src.indexOf("[", src.indexOf("=", i));
  let depth = 0;
  let j = start;
  for (; j < src.length; j++) {
    if (src[j] === "[") depth++;
    else if (src[j] === "]") {
      depth--;
      if (depth === 0) {
        j++;
        break;
      }
    }
  }
  return JSON.parse(src.slice(start, j));
}

const ts = await readFile(DATA, "utf8");
const BLOCKS = grabArray(ts, "BLOCKS");
const SECTIONS = grabArray(ts, "SECTIONS");

const template = await readFile(join(HERE, "storyboard.template.html"), "utf8");
const data =
  `const BLOCKS = ${JSON.stringify(BLOCKS, null, 2)};\n\n` +
  `const SECTIONS = ${JSON.stringify(SECTIONS, null, 2)};`;

await writeFile(join(HERE, "storyboard.html"), template.replace("/*__DATA__*/", data));

console.log(`storyboard.html erzeugt — ${BLOCKS.length} Blöcke, ${SECTIONS.length} Abschnitte, ${SECTIONS.reduce((a, s) => a + s.panels.length, 0)} Panels`);
