/**
 * Bündelt den Mail-Handler genauso, wie es NodejsFunction beim Deployment tut.
 *
 * Der Grund für dieses Skript: `packages/handelswelt` ist ein zweites
 * Workspace-Paket, und esbuild muss es über den pnpm-Symlink finden und seine
 * TypeScript-Quellen mit ins Bündel nehmen. Ob das geht, zeigt sich sonst erst
 * beim Deployment — und am Vortragsabend ist das die schlechteste Stelle für
 * eine Überraschung (siehe die Notiz `blocks-deployment-fallen`).
 *
 * Geprüft wird dreierlei: dass das Bündel entsteht, dass die Handelswelt
 * wirklich darin gelandet ist, und dass sie darin rechnet.
 */
import { build } from 'esbuild';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const hier = fileURLToPath(new URL('.', import.meta.url));
const eintritt = join(hier, '..', 'aws-blocks', 'mail', 'handler.ts');

let fehler = 0;
function pruefe(was: string, bedingung: boolean): void {
  if (bedingung) {
    console.log(`  ok   ${was}`);
  } else {
    fehler += 1;
    console.error(`  FEHL ${was}`);
  }
}

const ordner = await mkdtemp(join(tmpdir(), 'buendel-'));
const ziel = join(ordner, 'index.mjs');

try {
  /*
    Dieselben Einstellungen wie in index.cdk.ts: Node 22, alles ins Bündel,
    auch das AWS-SDK (`externalModules: []`).
  */
  await build({
    entryPoints: [eintritt],
    outfile: ziel,
    bundle: true,
    platform: 'node',
    target: 'node22',
    format: 'esm',
    // Lambda erwartet CJS-freundliche Namen; für den Test reicht ESM.
    banner: { js: "import{createRequire}from'module';const require=createRequire(import.meta.url);" },
    logLevel: 'error',
  });

  const buendel = await readFile(ziel, 'utf8');
  const groesse = (buendel.length / 1024 / 1024).toFixed(1);

  pruefe('Das Bündel ist entstanden', buendel.length > 0);
  /*
    Marker aus `handelswelt`, die esbuild nicht wegkürzen kann und die es
    sonst nirgends gibt. Nicht auf den Text „Kalkulation Schokolade &
    Pralinen" prüfen — der wird erst zur Laufzeit zusammengesetzt.
  */
  pruefe('Die Handelswelt ist mit im Bündel', buendel.includes('mindestRohertrag'));
  pruefe('Die Kategorievorgabe ist mit im Bündel', buendel.includes('vorlaufWochen'));
  pruefe('Die feste Marge ist verschwunden', !buendel.includes('34,2 %'));

  /*
    Und das, wovor der Kommentar in index.cdk.ts warnt: Die Lambda-Laufzeit
    bringt nicht zwingend client-bedrock-runtime mit, und ein fehlendes Modul
    zeigt sich erst beim ersten Aufruf. `externalModules: []` soll das
    verhindern — hier steht, ob es das tut.
  */
  pruefe('Das Bedrock-SDK ist mit im Bündel', buendel.includes('BedrockRuntimeClient'));
  pruefe('Der MIME-Leser ist mit im Bündel', buendel.includes('postal-mime') || buendel.includes('PostalMime'));

  /*
    Und rechnet sie auch? Aus dem Bündel selbst lässt sich das nicht aufrufen,
    ohne den Handler zu starten — deshalb hier gegen die Quelle, mit den Zahlen
    des Szenarios.
  */
  const { marge } = await import('@ecr-talk/handelswelt');
  const befund = marge(2.89, 4.49);
  pruefe('Die Kalkulation antwortet', befund.ok);
  if (befund.ok) {
    const prozent = (befund.daten.rohertrag * 100).toFixed(1);
    pruefe(`Rohertrag 31,1 % statt 34,2 % (gerechnet: ${prozent} %)`, prozent === '31.1');
    pruefe('Die Vorgabe ist erfüllt, aber knapp', befund.daten.erfuellt && befund.daten.luftInPunkten < 2);
  }

  const andere = marge(1.89, 2.19);
  pruefe(
    'Andere Preise ergeben eine andere Marge',
    andere.ok && !andere.daten.erfuellt,
  );
  pruefe('Unsinnige Preise ergeben einen Grund, keine Zahl', !marge(0, 4.49).ok);

  console.log(`\nBündel: ${groesse} MB`);
  if (fehler > 0) process.exitCode = 1;
} finally {
  await rm(ordner, { recursive: true, force: true });
}

