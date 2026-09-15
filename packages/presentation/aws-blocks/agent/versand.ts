/**
 * Der Versand — was `antworte_per_mail` tatsächlich tut.
 *
 * Steht getrennt vom Werkzeug, weil es der einzige Teil ist, der AWS braucht.
 * Im Sandkasten und im Test steckt stattdessen eine Attrappe im selben
 * Werkzeug, und die Werkzeugbeschreibung bleibt Wort für Wort dieselbe.
 *
 * Die Rolle liegt in einem anderen Konto: Die Adresse des Agenten hängt an der
 * übergeordneten Domain, und der Empfang läuft deshalb dort. Eine Rolle statt
 * zweier Berechtigungswege — sie darf sowohl die Rohmail aus S3 lesen als auch
 * als die verifizierte Identität senden.
 */
import { SendEmailCommand, SESv2Client } from '@aws-sdk/client-sesv2';
import { fromTemporaryCredentials } from '@aws-sdk/credential-providers';
import { baueRohmail } from '../mail/brief';
import { POSTFAECHER } from '../mail/konfig';
import type { Versand, Vorgangskontext } from './antwort';

const ROLLE = process.env.MAIL_ACCESS_ROLE_ARN ?? '';
const REGION = process.env.AWS_REGION ?? 'eu-central-1';

/*
  Erst beim ersten Versand aufgebaut, nicht beim Laden des Moduls: Ohne
  gesetzte Rolle soll der Agent trotzdem starten — nur senden kann er dann
  nicht, und das sagt er auch.
*/
let ses: SESv2Client | undefined;

function client(): SESv2Client {
  if (!ses) {
    ses = new SESv2Client({
      region: REGION,
      credentials: fromTemporaryCredentials({
        params: { RoleArn: ROLLE, RoleSessionName: 'ecr2026-agent-versand' },
      }),
    });
  }
  return ses;
}

/**
 * Sendet als das Postfach, an das geschrieben wurde.
 *
 * `inAntwortAuf` hängt die Antwort an den Gesprächsfaden — sonst erscheint sie
 * im Postfach des Teilnehmers als neue Mail und nicht als Antwort auf seine.
 */
export const perSes: Versand = async (kontext: Vorgangskontext, betreff, text) => {
  if (!ROLLE) {
    throw new Error(
      'Ohne MAIL_ACCESS_ROLE_ARN kann ich keine Mail senden. Der Entwurf ist fertig, der Weg hinaus fehlt.',
    );
  }

  /*
    Welches Postfach geantwortet hat, steht im Kontext des Vorgangs. Fällt auf
    das erste zurück — dieselbe Regel wie beim Empfang, und aus demselben Grund:
    Eine Antwort von der falschen Adresse ist schlimmer als eine vom
    Standardpostfach.
  */
  const postfach =
    POSTFAECHER.find((p) => p.adresse === kontext.postfach) ?? POSTFAECHER[0];

  await client().send(
    new SendEmailCommand({
      FromEmailAddress: postfach.adresse,
      Destination: { ToAddresses: [kontext.absender] },
      Content: {
        Raw: {
          Data: Buffer.from(
            baueRohmail({
              von: postfach.adresse,
              vonName: postfach.anzeigename,
              an: kontext.absender,
              betreff,
              text,
              inAntwortAuf: kontext.nachrichtId,
            }),
            'utf8',
          ),
        },
      },
    }),
  );

  console.log(`[${postfach.adresse}] Antwort an ${kontext.absender} gesendet.`);
};
