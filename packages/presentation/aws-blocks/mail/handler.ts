import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { SendEmailCommand, SESv2Client } from "@aws-sdk/client-sesv2";
import { fromTemporaryCredentials } from "@aws-sdk/credential-providers";
import { beantworte } from "./agent";
import { baueAntwort, baueRohmail, lies } from "./brief";
import { postfachFuer } from "./konfig";

/**
 * Der Postfach-Agent.
 *
 * Ausgelöst über SNS aus dem Konto, in dem die Domain liegt. SES hat die Mail
 * dort schon in S3 abgelegt; die Benachrichtigung nennt den Schlüssel.
 *
 * Alles, was das fremde Konto betrifft — die Rohmail lesen und die Antwort als
 * die verifizierte Identität senden —, läuft über EINE angenommene Rolle.
 * Details und Begründung in examples/konto-a/README.md.
 */

const ROLLE = process.env.MAIL_ACCESS_ROLE_ARN ?? "";
const BUCKET = process.env.MAIL_BUCKET ?? "";
const PRAEFIX = process.env.MAIL_PREFIX ?? "eingang/";

/**
 * Anmeldedaten des fremden Kontos. Einmal gebaut und wiederverwendet: Der
 * Provider hält die Sitzung und erneuert sie erst, wenn sie abläuft — bei einem
 * Saal, der gleichzeitig schreibt, spart das ein AssumeRole je Mail.
 */
const fremd = fromTemporaryCredentials({
  params: { RoleArn: ROLLE, RoleSessionName: "ecr2026-mail" },
});

const s3 = new S3Client({ credentials: fremd });
const ses = new SESv2Client({ credentials: fremd });

/** Was SES in die SNS-Nachricht legt. Nur die Felder, die wir lesen. */
interface SesMeldung {
  readonly mail?: { readonly destination?: string[]; readonly messageId?: string };
  readonly receipt?: { readonly action?: { readonly objectKey?: string } };
}

export async function handler(event: {
  Records?: Array<{ Sns?: { Message?: string } }>;
}): Promise<void> {
  for (const satz of event.Records ?? []) {
    const roh = satz.Sns?.Message;
    if (!roh) continue;
    try {
      await verarbeite(JSON.parse(roh) as SesMeldung);
    } catch (fehler) {
      /*
        Eine Mail, die scheitert, darf die nächsten nicht mitreißen — und ein
        erneuter Zustellversuch von SNS würde dieselbe Mail ein zweites Mal
        beantworten. Deshalb hier fangen und weitermachen; was schiefging,
        steht im Protokoll.
      */
      console.error("Mail nicht verarbeitet:", fehler);
    }
  }
}

async function verarbeite(meldung: SesMeldung): Promise<void> {
  const schluessel = meldung.receipt?.action?.objectKey;
  const empfaenger = meldung.mail?.destination ?? [];
  if (!schluessel) throw new Error("Die Meldung nennt kein Objekt in S3.");

  const postfach = postfachFuer(empfaenger);

  const objekt = await s3.send(
    new GetObjectCommand({
      Bucket: BUCKET,
      Key: schluessel.startsWith(PRAEFIX) ? schluessel : `${PRAEFIX}${schluessel}`,
    }),
  );
  const bytes = await objekt.Body?.transformToByteArray();
  if (!bytes) throw new Error(`Objekt ${schluessel} ist leer.`);

  const eingang = await lies(bytes);
  if (!eingang.absender) throw new Error("Die Mail hat keinen brauchbaren Absender.");

  console.log(`[${postfach.modus}] von ${eingang.absender}: ${eingang.betreff}`);

  const lauf = await beantworte(postfach.modus, briefing(eingang.betreff, eingang.text));

  await ses.send(
    new SendEmailCommand({
      FromEmailAddress: postfach.adresse,
      Destination: { ToAddresses: [eingang.absender] },
      Content: {
        Raw: {
          Data: Buffer.from(
            baueRohmail({
              von: postfach.adresse,
              vonName: postfach.anzeigename,
              an: eingang.absender,
              /*
                Der Betreff kommt vom Agenten, wenn er einen gesetzt hat.
                Vorher wurde immer der eingehende gespiegelt — und die vom
                Modell selbst geschriebene Betreffzeile landete im Rumpf.
              */
              betreff: lauf.antwort?.betreff || eingang.betreff,
              text: baueAntwort(postfach.modus, lauf),
              inAntwortAuf: eingang.messageId,
            }),
            "utf8",
          ),
        },
      },
    }),
  );

  console.log(`[${postfach.modus}] beantwortet, ${lauf.schritte.length} Systeme abgefragt`);

  /*
    Die Fragen an Lisa gehen nicht mit der Mail hinaus — sie hätten dort auch
    nichts zu suchen. Bis es einen Weg zu ihr gibt, landen sie wenigstens im
    Protokoll, statt still verlorenzugehen. Ein Agent, der etwas braucht und es
    niemandem sagen kann, ist schlimmer als einer, der nichts braucht.
  */
  for (const f of lauf.fragenAnLisa) {
    console.log(`[an Lisa] ${f.frage} — ${f.warum}`);
  }
}

/** Betreff und Text so vorlegen, wie sie im Postfach stünden. */
function briefing(betreff: string, text: string): string {
  return `Betreff: ${betreff}\n\n${text}`;
}
