/**
 * CDK-Schicht — hier kommt das Hosting dazu.
 *
 * Hosting gibt es nur in dieser Schicht, nicht in index.ts. Beim Sandbox-
 * Deployment wird es übersprungen, weil die Sandbox nur das Backend
 * heißtauscht.
 */
import * as cdk from 'aws-cdk-lib';

import { Hosting, BlocksStack, BlocksPresets } from '@aws-blocks/blocks/cdk';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { getStackName } from '@aws-blocks/blocks/scripts';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = new cdk.App();

const sandboxMode = app.node.tryGetContext('sandboxMode') === 'true';
const projectRoot = app.node.tryGetContext('projectRoot') || process.cwd();

const stackName = getStackName({ sandbox: sandboxMode, projectRoot });
export const blocksStack = await BlocksStack.create(app, stackName, {
  backendHandlerPath: join(__dirname, 'index.handler.ts'),
  backendCDKPath: join(__dirname, 'index.ts'),
  defaults: sandboxMode ? BlocksPresets.sandbox : BlocksPresets.production,
});

if (sandboxMode) {
  blocksStack.handler.addEnvironment('BLOCKS_SANDBOX', 'true');
}

/**
 * Das Steuerungsgeheimnis kommt aus der Umgebung des Deployments, nicht aus
 * dem Repository und nicht aus backendConfig — letzteres landet in einer
 * öffentlich lesbaren config.json.
 *
 *   DECK_TOKEN="..." npm run deploy
 *
 * Ohne gesetztes Token kann jeder mit der Adresse die Folien weiterklicken.
 */
const deckToken = process.env.DECK_TOKEN ?? '';
blocksStack.handler.addEnvironment('DECK_TOKEN', deckToken);
if (!deckToken) {
  console.warn(
    '\n  ⚠  DECK_TOKEN ist nicht gesetzt — die Fernsteuerung wäre öffentlich.\n' +
      '     Abbrechen und mit DECK_TOKEN="..." npm run deploy erneut starten.\n',
  );
}

// Statisches Hosting nur beim echten Deployment, nicht in der Sandbox
if (!sandboxMode) {
  new Hosting(blocksStack, 'Hosting', {
    root: join(__dirname, '..'),
    buildCommand: 'pnpm build',
    buildOutputDir: 'dist',
    api: blocksStack,
  });
}
