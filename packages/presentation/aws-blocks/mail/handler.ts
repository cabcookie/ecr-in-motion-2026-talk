import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { SendEmailCommand, SESv2Client } from "@aws-sdk/client-sesv2";
import { fromTemporaryCredentials } from "@aws-sdk/credential-providers";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { anhangText } from "./anhang";
import { baueRohmail, lies, mitAnhang } from "./brief";
import { POSTFAECHER, postfachFuer, type Sendeauftrag } from "./konfig";
import { ruheRumpf } from "./ruhe";
import type { Fensterstand } from "../fenster";

/**
 * Die Mail-Lambda — Ein- und Ausgang des Postfachs, aber nicht mehr der Agent.
 *
 * Bis zum 16.09. lief hier eine eigene Werkzeugschleife. Jetzt beantwortet
 * der Blocks-Agent die Mail (aws-blocks/agent), und diese Lambda tut die zwei
 * Dinge, die nur sie kann:
 *
 *   1. EINGANG. Ausgelöst über SNS aus dem Konto, in dem die Domain liegt. SES
 *      hat die Mail dort in S3 abgelegt; die Lambda liest sie und übergibt sie
 *      über die API `mailEingang` an den Agenten — aber nur im
 *      Vortragsfenster. Außerhalb sendet sie selbst eine feste Antwort
 *      (siehe ruhe.ts), und kein Modell läuft an.
 *
 *   2. AUSGANG. Der Agent ruft sie mit einem `Sendeauftrag` auf, und sie sendet
 *      als die verifizierte Identität.
 *
 * Beides läuft über EINE angenommene Rolle im fremden Konto, und die vertraut
 * genau der Rolle dieser Lambda (siehe packages/mail-infra). Deshalb sendet
 * der Agent nicht selbst: Unter seiner Rolle bekäme er AccessDenied.
 */

/**
 * Der feste Teil der Mail, einmal beim Kaltstart gelesen.
 *
 * anhang.md liegt neben dem Bundle — index.cdk.ts legt sie dort ab, und wenn
 * das misslingt, bricht schon das Deployment ab. Hier wird trotzdem
 * aufgefangen: Eine Antwort ohne Fusszeile ist schlecht, eine Lambda, die beim
 * Laden stirbt und gar nichts schickt, ist schlimmer.
 */
const ANHANG = (() => {
  try {
    return anhangText(readFileSync(join(__dirname, "anhang.md"), "utf8"));
  } catch (fehler) {
    console.error("anhang.md nicht lesbar - die Antwort geht ohne Fusszeile raus:", fehler);
    return "Diese Antwort kommt von einem KI-Agenten, nicht von einem Menschen.";
  }
})();

const ROLLE = process.env.MAIL_ACCESS_ROLE_ARN ?? "";
const BUCKET = process.env.MAIL_BUCKET ?? "";
const PRAEFIX = process.env.MAIL_PREFIX ?? "eingang/";
/** Der RPC-Endpunkt des Blocks-Backends, von CDK gesetzt. */
const API_URL = process.env.API_URL ?? "";
/**
 * Das Geheimnis, mit dem `mailEingang` geschützt ist.
 *
 * Ohne Schutz könnte jeder über die öffentliche API einen Agentenlauf mit
 * beliebigem Absender anstoßen — und der Agent schickte seine Antwort an eine
 * Adresse, die nie geschrieben hat.
 */
const TOKEN = process.env.MAIL_EINGANG_TOKEN ?? "";

/**
 * Anmeldedaten des fremden Kontos. Einmal gebaut und wiederverwendet: Der
 * Provider hält die Sitzung und erneuert sie erst, wenn sie abläuft.
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

type Ereignis = { Records?: Array<{ Sns?: { Message?: string } }> } | Sendeauftrag;

export async function handler(event: Ereignis): Promise<{ gesendet: boolean } | void> {
  if ("art" in event && event.art === "senden") {
    /*
      Hier NICHT fangen: Scheitert der Versand, soll der Agent das als Fehler
      seines Werkzeugs sehen und nicht glauben, die Mail sei draußen.
    */
    await sende(event);
    return { gesendet: true };
  }

  for (const satz of ("Records" in event ? event.Records : undefined) ?? []) {
    const roh = satz.Sns?.Message;
    if (!roh) continue;
    try {
      await uebergib(JSON.parse(roh) as SesMeldung);
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

async function uebergib(meldung: SesMeldung): Promise<void> {
  const schluessel = meldung.receipt?.action?.objectKey;
  const empfaenger = meldung.mail?.destination ?? [];
  if (!schluessel) throw new Error("Die Meldung nennt kein Objekt in S3.");
  if (!API_URL) throw new Error("API_URL fehlt - ich weiss nicht, wo der Agent steht.");

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

  console.log(`[${postfach.adresse}] von ${eingang.absender}: ${eingang.betreff}`);

  /*
    Erst das Fenster. Ist es zu, antwortet die Lambda selbst und fest — ohne
    Agent und ohne Zitat. Scheitert schon diese Frage, geht gar nichts raus:
    Dann stünde auch der Agent nicht zur Verfügung.
  */
  const fenster = await rufe<Fensterstand>("api.vortragsfenster", []);
  if (!fenster.aktiv) {
    await sende({
      art: "senden",
      postfach: postfach.adresse,
      an: eingang.absender,
      betreff: eingang.betreff,
      rumpf: ruheRumpf(),
      inAntwortAuf: eingang.messageId,
    });
    console.log(`[${postfach.adresse}] außerhalb des Vortragsfensters fest beantwortet.`);
    return;
  }

  /*
    Die Antwort kommt sofort: Der Agent läuft danach in AgentCore weiter, und
    das Senden ist sein eigenes Werkzeug.
  */
  const ergebnis = await rufe<{ kanal?: string }>("api.mailEingang", [
    TOKEN,
    {
      absender: eingang.absender,
      absenderName: eingang.absenderName,
      betreff: eingang.betreff,
      text: eingang.text,
      nachrichtId: eingang.messageId,
      postfach: postfach.adresse,
    },
  ]);
  console.log(`[${postfach.adresse}] an den Agenten übergeben, Kanal ${ergebnis.kanal}`);
}

/** JSON-RPC, so wie der generierte Client im Browser auch aufruft. */
async function rufe<T>(methode: string, parameter: unknown[]): Promise<T> {
  const antwort = await fetch(API_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: methode, params: parameter }),
  });
  const ergebnis = (await antwort.json().catch(() => ({}))) as {
    result?: T;
    error?: { message?: string };
  };
  if (!antwort.ok || ergebnis.error || ergebnis.result === undefined) {
    throw new Error(
      `${methode} abgelehnt (${antwort.status}): ${ergebnis.error?.message ?? "ohne Grund"}`,
    );
  }
  return ergebnis.result;
}

async function sende(auftrag: Sendeauftrag): Promise<void> {
  /*
    Nur als eines der eigenen Postfächer. Wer die Lambda aufrufen darf, soll
    damit nicht als beliebige Adresse der Domain schreiben können.
  */
  const postfach = POSTFAECHER.find((p) => p.adresse === auftrag.postfach) ?? POSTFAECHER[0];
  /* Die Adresse landet in einer Kopfzeile; ein Zeilenumbruch darin schriebe eigene. */
  if (!/^[^\s<>@]+@[^\s<>@]+$/.test(auftrag.an)) {
    throw new Error(`Keine brauchbare Empfängeradresse: ${JSON.stringify(auftrag.an)}`);
  }

  await ses.send(
    new SendEmailCommand({
      FromEmailAddress: postfach.adresse,
      Destination: { ToAddresses: [auftrag.an] },
      Content: {
        Raw: {
          Data: Buffer.from(
            baueRohmail({
              von: postfach.adresse,
              vonName: postfach.anzeigename,
              an: auftrag.an,
              betreff: auftrag.betreff,
              text: mitAnhang(auftrag.rumpf, ANHANG, auftrag.eingang),
              inAntwortAuf: auftrag.inAntwortAuf,
            }),
            "utf8",
          ),
        },
      },
    }),
  );

  console.log(`[${postfach.adresse}] Antwort an ${auftrag.an} gesendet.`);
}
