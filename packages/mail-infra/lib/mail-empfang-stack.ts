/**
 * Die E-Mail-Infrastruktur — der Teil, der im Domain-Konto lebt.
 *
 * **Dieser Stack ist in diesem Repository NICHT verdrahtet.** Er wird von
 * nichts hier aufgerufen, und `pnpm run deploy` rollt ihn nicht aus. Er steht
 * hier, weil das Architekturbild ihn als „E-Mail-Infrastruktur" zeigt und
 * jemand, der das Ganze nachbauen will, wissen muss, was dahintersteckt.
 *
 * Der Grund für die Trennung ist keine Architekturvorliebe: Die Adresse des
 * Agenten liegt auf der ÜBERGEORDNETEN Domain, nicht auf der Subdomain des
 * Vortrags. Empfang braucht MX-Eintrag und Domainprüfung in der Zone dieser
 * Domain — und diese Zone liegt in einem anderen AWS-Konto als der Vortrag.
 *
 * Wer beides im selben Konto hat, braucht die Trennung nicht: Dann entfallen die
 * Cross-Account-Rolle und ihre Konto-ID, und der Stack wird einfacher.
 *
 * SES nimmt die Mail an, legt sie in S3, meldet das über SNS. Eine einzige
 * Rolle erlaubt dem Vortragskonto beides: die Rohmail zu lesen und die Antwort
 * als die verifizierte Identität zu senden. Eine statt zweier Berechtigungs-
 * wege, weil der EmailClient-Baustein von AWS Blocks kein `SourceArn`
 * durchreicht.
 *
 * Bevor jemand das ausrollt: Die README neben dieser Datei nennt zwei Dinge,
 * die den Abend sonst kosten — die SES-Sandbox, die den VERSAND auf
 * verifizierte Adressen beschränkt, und das Receipt Rule Set, von dem je Konto
 * und Region nur eines aktiv sein kann.
 */
import { Duration, RemovalPolicy, Stack, StackProps, CfnOutput } from "aws-cdk-lib";
import { AccountPrincipal, PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { BlockPublicAccess, Bucket, BucketEncryption } from "aws-cdk-lib/aws-s3";
import { ReceiptRuleSet } from "aws-cdk-lib/aws-ses";
import { S3 } from "aws-cdk-lib/aws-ses-actions";
import { Topic } from "aws-cdk-lib/aws-sns";
import { Construct } from "constructs";

export interface MailEmpfangProps extends StackProps {
  /** Konto-ID des Vortrags — dort läuft die Lambda, die die Mail verarbeitet. */
  readonly vortragsKonto: string;
  /**
   * Adressen, die der Vortrag bedient.
   *
   * Zwei, nicht eine: Abschnitt 6 schreibt an Lisas Assistenten (mit
   * Systemprompt und Werkzeugen), Abschnitt 15 an einen Agenten, der nichts hat
   * als sein Training. Unterschieden wird über die Adresse und nicht über den
   * Betreff — beim ersten fordern wir die Teilnehmer ausdrücklich auf, den Text
   * zu ändern, und wer dabei den Betreff anfasst, bekäme den falschen Agenten.
   */
  readonly adressen: readonly string[];
  /** Domain, die in SES verifiziert ist. */
  readonly domain: string;
}

/**
 * Name der Rolle im Vortragskonto, die diese Rolle hier annehmen darf.
 *
 * Fest verdrahtet und auf beiden Seiten gleich. Der Grund ist ein Henne-Ei:
 * Diese Rolle muss der Lambda-Rolle vertrauen, bevor es sie gibt; das Vortragskonto
 * braucht die ARN der Rolle hier, bevor es deployt. Ein abgesprochener Name
 * bricht den Kreis — deshalb vergibt das Vortragskonto den Rollennamen
 * ausdrücklich selbst statt ihn CDK überlassen.
 */
const HANDLER_ROLLE = "ecr2026-mail-handler";

export class MailEmpfangStack extends Stack {
  constructor(scope: Construct, id: string, props: MailEmpfangProps) {
    super(scope, id, props);
    const { vortragsKonto, adressen, domain } = props;

    /*
      Die Rohmails. Bewusst mit SSE-S3 und nicht mit KMS: ein KMS-Schlüssel
      bräuchte eine dritte Handreichung (Key Policy für das fremde Konto,
      kms:Decrypt in dessen Rolle), und für Mails, die nach einem Tag gelöscht
      werden, ist der Gegenwert gering.
    */
    const bucket = new Bucket(this, "MailBucket", {
      encryption: BucketEncryption.S3_MANAGED,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      lifecycleRules: [{ expiration: Duration.days(7) }],
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // SES schreibt als Dienst in den Bucket. Die Bedingung auf die eigene
    // Konto-ID verhindert, dass ein fremdes SES-Konto hier ablegen kann.
    bucket.addToResourcePolicy(
      new PolicyStatement({
        principals: [new ServicePrincipal("ses.amazonaws.com")],
        actions: ["s3:PutObject"],
        resources: [bucket.arnForObjects("eingang/*")],
        conditions: { StringEquals: { "aws:Referer": this.account } },
      }),
    );

    /*
      Die Benachrichtigung. Sie kommt nicht aus einer S3-Event-Notification:
      die kann keine Lambda in einem fremden Konto auslösen. Die S3-Aktion von
      SES nimmt stattdessen selbst eine Topic-ARN entgegen — eine Aktion legt
      also die Mail ab und meldet sie, und SNS darf kontoübergreifend zustellen.
    */
    const topic = new Topic(this, "MailTopic", {
      displayName: "Eingehende Mail für den ECR-Vortrag",
    });

    // Das Vortragskonto legt die Subscription selbst an — dafür braucht es hier
    // die Erlaubnis. Andersherum (A abonniert die fremde Lambda) ginge auch,
    // wäre aber eine Reihenfolge mehr: die Lambda müsste vorher existieren.
    topic.addToResourcePolicy(
      new PolicyStatement({
        principals: [new AccountPrincipal(vortragsKonto)],
        actions: ["sns:Subscribe", "sns:GetTopicAttributes"],
        resources: [topic.topicArn],
      }),
    );

    /*
      Die Empfangsregel.

      ACHTUNG: Je Konto und Region kann nur EIN Regelsatz aktiv sein. Gibt es im
      Konto schon einen, dann diesen hier NICHT anlegen, sondern eine Regel in
      den bestehenden hängen (ReceiptRuleSet.fromReceiptRuleSetName) — sonst
      steht der neue Satz zwar da, ist aber inaktiv und es kommt nichts an.

      Und: Der Regelsatz muss nach dem Deployment noch aktiviert werden. CDK
      kann das nicht; in der Konsole oder mit
      `aws ses set-active-receipt-rule-set --rule-set-name <name>`.
    */
    const ruleSet = new ReceiptRuleSet(this, "RuleSet", {
      receiptRuleSetName: "ecr2026",
    });

    ruleSet.addRule("Eingang", {
      recipients: [...adressen],
      enabled: true,
      scanEnabled: true,
      actions: [new S3({ bucket, objectKeyPrefix: "eingang/", topic })],
    });

    /*
      Die eine Rolle, die das Vortragskonto annimmt.

      Sie kann beides: die Rohmail lesen und als die verifizierte Identität
      antworten. Zwei getrennte Wege (Bucket Policy für das Lesen, SES Sending
      Authorization für das Senden) wären zwei Handreichungen statt einer — und
      der EmailClient-Baustein von AWS Blocks reicht kein SourceArn durch, was
      den lehrbuchmäßigen Weg ohnehin unbequem macht.

      Das Vertrauen steht als Konto-Principal mit einer Bedingung auf die ARN,
      NICHT als ArnPrincipal. Der Unterschied ist wichtig: IAM prüft bei einem
      ArnPrincipal, ob die Rolle existiert, und lehnt sonst mit "Invalid
      principal in policy" ab. Die Rolle im Vortragskonto gibt es beim ersten
      Deployment hier aber noch nicht.
    */
    const zugriff = new Role(this, "MailAccessRole", {
      roleName: "ecr2026-mail-access",
      description: "Vom Vortragskonto angenommen: Rohmail lesen, Antwort senden",
      // withConditions ersetzt die Vertrauensaussage, statt eine zweite daneben
      // zu stellen. Ohne die Bedingung vertraute die Rolle dem ganzen fremden
      // Konto; mit ihr genau einer Rolle darin.
      assumedBy: new AccountPrincipal(vortragsKonto).withConditions({
        ArnLike: {
          "aws:PrincipalArn": `arn:aws:iam::${vortragsKonto}:role/${HANDLER_ROLLE}`,
        },
      }),
      maxSessionDuration: Duration.hours(1),
    });

    bucket.grantRead(zugriff, "eingang/*");

    zugriff.addToPolicy(
      new PolicyStatement({
        actions: ["ses:SendEmail", "ses:SendRawEmail"],
        resources: [`arn:aws:ses:${this.region}:${this.account}:identity/${domain}`],
      }),
    );

    new CfnOutput(this, "BucketName", { value: bucket.bucketName });
    new CfnOutput(this, "TopicArn", { value: topic.topicArn });
    new CfnOutput(this, "AccessRoleArn", { value: zugriff.roleArn });
    new CfnOutput(this, "IdentityArn", {
      value: `arn:aws:ses:${this.region}:${this.account}:identity/${domain}`,
    });
  }
}
