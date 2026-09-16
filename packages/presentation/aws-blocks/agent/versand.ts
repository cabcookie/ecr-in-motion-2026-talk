/**
 * Der Versand — was `antworte_per_mail` tatsächlich tut.
 *
 * Steht getrennt vom Werkzeug, weil es der einzige Teil ist, der AWS braucht.
 * Im Test steckt stattdessen eine Attrappe im selben Werkzeug, und die
 * Werkzeugbeschreibung bleibt Wort für Wort dieselbe.
 *
 * Gesendet wird NICHT von hier aus, sondern von der Mail-Lambda. Der Grund
 * liegt im anderen Konto: Die Adresse des Agenten hängt an der übergeordneten
 * Domain, und die Rolle dort, die als verifizierte Identität senden darf,
 * vertraut genau einer Rolle in diesem Konto — der der Mail-Lambda. Der Agent
 * läuft in AgentCore unter der gemeinsamen Blocks-Rolle und bekäme
 * AccessDenied. Statt das fremde Konto umzubauen, reicht er den fertigen
 * Brief an die Lambda weiter, die ohnehin die Rohmail liest.
 */
import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda';
import { baueRumpf } from '../mail/brief';
import { MAIL_FUNKTION, POSTFAECHER, type Sendeauftrag } from '../mail/konfig';
import type { Versand } from './antwort';

const REGION = process.env.AWS_REGION ?? 'eu-central-1';

let lambda: LambdaClient | undefined;

/**
 * Übergibt den Brief der Mail-Lambda.
 *
 * Synchron aufgerufen und nicht als Ereignis: Scheitert der Versand, soll der
 * Agent es als Fehler seines Werkzeugs sehen — und nicht glauben, die Mail sei
 * draußen.
 */
export const perMailLambda: Versand = async (kontext, brief, akte) => {
  /*
    Welches Postfach geantwortet hat, steht im Kontext des Vorgangs. Fällt auf
    das erste zurück — dieselbe Regel wie beim Empfang.
  */
  const postfach =
    POSTFAECHER.find((p) => p.adresse === kontext.postfach) ?? POSTFAECHER[0];

  const auftrag: Sendeauftrag = {
    art: 'senden',
    postfach: postfach.adresse,
    an: kontext.absender,
    betreff: brief.betreff,
    rumpf: baueRumpf(brief, akte),
    inAntwortAuf: kontext.nachrichtId,
    eingang: kontext.eingang
      ? { absender: kontext.absender, absenderName: kontext.absenderName, text: kontext.eingang }
      : undefined,
  };

  /*
    Lokal gibt es keine Mail-Lambda. Der Brief geht dann ins Protokoll — der
    Agent läuft trotzdem vollständig durch, und man sieht, was er geschickt
    hätte.
  */
  if (!process.env.BLOCKS_CONFIG_BUCKET) {
    console.log(`[lokal, nicht gesendet] an ${auftrag.an}: ${auftrag.betreff}\n\n${auftrag.rumpf}`);
    return;
  }

  lambda ??= new LambdaClient({ region: REGION });
  const antwort = await lambda.send(
    new InvokeCommand({
      FunctionName: MAIL_FUNKTION,
      InvocationType: 'RequestResponse',
      Payload: Buffer.from(JSON.stringify(auftrag), 'utf8'),
    }),
  );
  if (antwort.FunctionError) {
    const grund = antwort.Payload ? Buffer.from(antwort.Payload).toString('utf8') : '';
    throw new Error(`Die Mail-Lambda konnte nicht senden: ${antwort.FunctionError} ${grund}`);
  }
  console.log(`[${postfach.adresse}] Antwort an ${auftrag.an} übergeben.`);
};
