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
import { DOMAIN, MAIL_HANDLER_ROLE, REGION } from '../../infra/config';
import { Duration } from 'aws-cdk-lib';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { LambdaSubscription } from 'aws-cdk-lib/aws-sns-subscriptions';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = new cdk.App();

const sandboxMode = app.node.tryGetContext('sandboxMode') === 'true';
const projectRoot = app.node.tryGetContext('projectRoot') || process.cwd();

const stackName = getStackName({ sandbox: sandboxMode, projectRoot });
/*
  Konto und Region müssen am Stack stehen, weil Hosting die Hosted Zone beim
  Synthetisieren nachschlägt — ein Lookup braucht beides.
*/
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION ?? REGION,
};

export const blocksStack = await BlocksStack.create(app, stackName, {
  backendHandlerPath: join(__dirname, 'index.handler.ts'),
  backendCDKPath: join(__dirname, 'index.ts'),
  defaults: sandboxMode ? BlocksPresets.sandbox : BlocksPresets.production,
  env,
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

/*
  Statisches Hosting nur beim echten Deployment, nicht in der Sandbox.

  Die Hosted Zone liegt im Bootstrap-Stack (packages/infra) und muss stehen,
  bevor das hier zum ersten Mal läuft: Hosting legt das CloudFront-Zertifikat
  an und lässt es über DNS prüfen. Ist die Zone noch nicht vom übergeordneten
  Namensserver delegiert, wartet die Prüfung bis zum Zeitlimit.
*/
if (!sandboxMode) {
  new Hosting(blocksStack, 'Hosting', {
    root: join(__dirname, '..'),
    buildCommand: 'pnpm build',
    buildOutputDir: 'dist',
    api: blocksStack,
    domain: { domainName: DOMAIN, hostedZone: DOMAIN },
  });
}

/*
  Der Postfach-Agent.

  Er hängt an einem SNS-Topic im Konto der Domain und nimmt dort eine Rolle an,
  um die Rohmail zu lesen und die Antwort als die verifizierte Identität zu
  senden. Die vier Werte kommen aus den GitHub-Secrets; fehlen sie, bleibt der
  Agent aus — der Rest des Vortrags läuft dann trotzdem.

  Die Reihenfolge zwischen den Konten steht in examples/konto-a/README.md.
*/
const mailRolle = process.env.MAIL_ACCESS_ROLE_ARN ?? '';
const mailBucket = process.env.MAIL_BUCKET ?? '';
const mailTopic = process.env.MAIL_TOPIC_ARN ?? '';

if (!sandboxMode && mailRolle && mailBucket && mailTopic) {
  /*
    Der Rollenname ist fest vergeben, nicht von CDK erzeugt. Die Rolle im
    Domain-Konto muss ihr vertrauen, bevor es sie gibt — ein abgesprochener Name
    bricht dieses Henne-Ei. Auf der anderen Seite steht derselbe Name in
    examples/konto-a/mail-empfang-stack.ts.
  */
  const rolle = new Role(blocksStack, 'MailHandlerRole', {
    roleName: MAIL_HANDLER_ROLE,
    assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
    description: 'Postfach-Agent: nimmt die Zugriffsrolle im Domain-Konto an',
  });
  rolle.addToPolicy(
    new PolicyStatement({
      actions: ['logs:CreateLogGroup', 'logs:CreateLogStream', 'logs:PutLogEvents'],
      resources: ['arn:aws:logs:*:*:*'],
    }),
  );
  rolle.addToPolicy(new PolicyStatement({ actions: ['sts:AssumeRole'], resources: [mailRolle] }));
  // Das Modell läuft in unserem Konto, nicht im fremden — der Agent ist unsere
  // Arbeit, nur Postfach und Absenderidentität sind es nicht.
  rolle.addToPolicy(
    new PolicyStatement({
      actions: ['bedrock:InvokeModel'],
      resources: ['arn:aws:bedrock:*::foundation-model/anthropic.claude-*', 'arn:aws:bedrock:*:*:inference-profile/*'],
    }),
  );

  const postfachAgent = new NodejsFunction(blocksStack, 'MailHandler', {
    entry: join(__dirname, 'mail', 'handler.ts'),
    handler: 'handler',
    runtime: Runtime.NODEJS_22_X,
    role: rolle,
    /*
      Großzügig bemessen: Ein Lauf mit Werkzeugen sind mehrere Modellaufrufe
      nacheinander, und am Abend schreiben alle gleichzeitig. Lieber eine
      Minute zu viel als eine abgeschnittene Antwort.
    */
    timeout: Duration.minutes(5),
    memorySize: 1024,
    /*
      Alles mit ins Bündel, auch das AWS-SDK.

      Die Lambda-Laufzeit bringt zwar ein SDK v3 mit, aber nicht zwingend
      client-bedrock-runtime und credential-providers — und ein fehlendes Modul
      zeigt sich erst beim ersten Aufruf. Das wäre am Vortragsabend die
      schlechteste Stelle für eine Überraschung. Ein paar Megabyte mehr und ein
      paar Millisekunden Kaltstart sind der Preis.
    */
    bundling: {
      externalModules: [],
      /*
        anhang.md muss neben dem Bundle liegen.

        esbuild buendelt nur, was importiert wird, und eine Textdatei wird
        nicht importiert - der Handler liest sie zur Laufzeit aus __dirname.
        Ohne diesen Schritt faende er dort nichts. `cp` bricht ab, wenn die
        Quelle fehlt, und damit bricht das Deployment ab statt still eine
        Lambda ohne Fusszeile auszurollen.
      */
      commandHooks: {
        beforeBundling: () => [],
        beforeInstall: () => [],
        afterBundling: (quelle: string, ziel: string) => [
          `cp ${join(quelle, 'packages', 'presentation', 'aws-blocks', 'mail', 'anhang.md')} ${ziel}`,
        ],
      },
    },
    environment: {
      MAIL_ACCESS_ROLE_ARN: mailRolle,
      MAIL_BUCKET: mailBucket,
      MAIL_PREFIX: 'eingang/',
    },
  });

  // Das Topic gehört dem anderen Konto; wir legen nur die Subscription an.
  // Dass wir das dürfen, steht in dessen Topic-Policy.
  Topic.fromTopicArn(blocksStack, 'MailTopic', mailTopic).addSubscription(
    new LambdaSubscription(postfachAgent),
  );
}
