/**
 * Bündelt die Mail-Lambda genauso, wie es NodejsFunction beim Deployment tut.
 *
 * Die Lambda nimmt nur noch Mail an und sendet sie; der Agent läuft in
 * AgentCore (aws-blocks/agent). Was sie dafür braucht — S3, SES, die
 * angenommene Rolle im Domain-Konto und den MIME-Leser — muss im Bündel
 * stecken: Die Lambda-Laufzeit bringt nicht zwingend jedes SDK-Modul mit,
 * und ein fehlendes zeigt sich erst beim ersten Aufruf. Am Vortragsabend ist
 * das die schlechteste Stelle für eine Überraschung.
 *
 * Und umgekehrt: Handelswelt und Bedrock gehören NICHT hinein. Tauchen sie
 * wieder auf, rechnet die Lambda wieder selbst, und es gibt zwei Agenten.
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
  pruefe('Der S3-Client ist mit im Bündel', buendel.includes('S3Client'));
  pruefe('Der SES-Client ist mit im Bündel', buendel.includes('SESv2Client'));
  pruefe('Die Rolle im Domain-Konto lässt sich annehmen', buendel.includes('AssumeRoleCommand'));
  pruefe('Der MIME-Leser ist mit im Bündel', buendel.includes('postal-mime') || buendel.includes('PostalMime'));
  pruefe('Die Lambda fragt nach dem Vortragsfenster', buendel.includes('api.vortragsfenster'));

  /* Marker, die es nur in der Handelswelt und im Bedrock-SDK gibt. */
  pruefe('Die Handelswelt ist NICHT im Bündel', !buendel.includes('mindestRohertrag'));
  pruefe('Das Bedrock-SDK ist NICHT im Bündel', !buendel.includes('BedrockRuntimeClient'));

  console.log(`\nBündel: ${groesse} MB`);
  if (fehler > 0) process.exitCode = 1;
} finally {
  await rm(ordner, { recursive: true, force: true });
}
