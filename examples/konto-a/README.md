# Mailempfang in Konto A

Der Vortrag läuft in einem Konto, die Domain `carstenbkoch.de` liegt in einem
anderen. Diese Vorlage beschreibt den Teil im **Domain-Konto**: SES nimmt die
Mails an die beiden Vortragsadressen an, legt sie in S3, meldet das über SNS —
und eine Rolle erlaubt dem Vortragskonto, die Mail zu lesen und die Antwort als die
verifizierte Identität zu verschicken.

`mail-empfang-stack.ts` ist ein CDK-Stack zum Übernehmen und Anpassen. Er ist
nicht Teil des Deployments dieses Repositories.

## Der Weg

```
Konto A (carstenbkoch.de)                   Konto B (Vortrag)
─────────────────────────                   ─────────────────
MX-Eintrag
  └─ SES Receipt Rule
       └─ S3Action ─┬─ Bucket (eingang/)
                    └─ SNS-Topic ──────────→ Lambda (Subscription)
                                               │ sts:AssumeRole
       Rolle ecr2026-mail-access ←─────────────┘
         ├─ s3:GetObject  auf eingang/*
         └─ ses:SendEmail auf die Identität
```

Warum nicht einfacher: **Eine S3-Event-Notification kann keine Lambda in einem
fremden Konto auslösen.** S3 stellt nur an SNS, SQS, Lambda oder EventBridge im
eigenen Konto zu. Die S3-Aktion von SES nimmt aber selbst eine Topic-ARN
entgegen — eine Aktion legt die Mail ab und meldet sie, und SNS darf
kontoübergreifend zustellen.

Warum **eine** Rolle statt zweier Berechtigungswege: Lesen ginge auch über eine
Bucket Policy, Senden über SES Sending Authorization. Das wären zwei
Handreichungen statt einer — und der `EmailClient`-Baustein von AWS Blocks reicht
kein `SourceArn` durch, was den zweiten Weg ohnehin unbequem macht.

## Zwei Adressen

Der Vortrag braucht zwei Agenten, und sie werden über die Empfängeradresse
auseinandergehalten:

| Adresse | Agent |
| --- | --- |
| `ecr2026@carstenbkoch.de` | Lisas Assistent — Systemprompt, Werkzeuge, arbeitet den Vorgang ab |
| `ecr2026-probe@carstenbkoch.de` | nur Trainingsdaten, keine Systeme — der erfindet die Marge, und das ist der Punkt |

Nicht über den Betreff: Beim ersten fordert der Vortrag die Teilnehmer
ausdrücklich auf, den Text zu ändern. Wer dabei auch den Betreff anfasst, bekäme
sonst den falschen Agenten — und würde die Folie nicht verstehen.

## Voraussetzungen im Konto

- `carstenbkoch.de` ist in SES **verifiziert**, in derselben Region, in der die
  Empfangsregel läuft.
- Das Konto ist in dieser Region **aus der Sandbox** — sonst gehen Antworten nur
  an ebenfalls verifizierte Adressen, und die Teilnehmer bekommen nichts.
- Region: **eu-central-1**. Der Empfang wird dort unterstützt
  (`inbound-smtp.eu-central-1.amazonaws.com`). Alles, was die Empfangsregel
  anfasst — SNS-Topic, ein etwaiger KMS-Schlüssel — muss in derselben Region
  liegen wie der SES-Endpunkt. Nur der S3-Bucket ist davon ausgenommen.

## Was vorher abgesprochen sein muss

Es gibt ein Henne-Ei: Konto A muss der Lambda-Rolle vertrauen, bevor es sie gibt,
und das Vortragskonto braucht die ARN der Rolle aus A, bevor es deployt. Gelöst
über **zwei fest abgesprochene Namen**:

| Wert | Festgelegt auf |
| --- | --- |
| Rollenname der Lambda in Konto B | `ecr2026-mail-handler` |
| Rollenname des Zugriffs in Konto A | `ecr2026-mail-access` |

Konto A braucht außerdem die **Konto-ID des Vortragskontos**. Sonst nichts.

## Schritte

**1. Stack anpassen und ausrollen.**

```ts
new MailEmpfangStack(app, "ecr2026-mail", {
  env: { account: "<konto-a>", region: "eu-central-1" },
  vortragsKonto: "<konto-b>",
  adressen: ["ecr2026@carstenbkoch.de", "ecr2026-probe@carstenbkoch.de"],
  domain: "carstenbkoch.de",
});
```

**2. Regelsatz aktivieren.** Je Konto und Region kann nur **ein** Regelsatz aktiv
sein, und CDK kann ihn nicht aktivieren:

```bash
aws ses set-active-receipt-rule-set --rule-set-name ecr2026 --region eu-central-1
```

> Gibt es im Konto schon einen aktiven Regelsatz, dann diesen hier **nicht**
> anlegen. Stattdessen eine Regel in den bestehenden hängen
> (`ReceiptRuleSet.fromReceiptRuleSetName`) — sonst steht der neue Satz zwar da,
> ist aber inaktiv und es kommt nichts an.

**3. MX-Eintrag setzen**, in der Zone von `carstenbkoch.de`:

```
carstenbkoch.de.   MX   10 inbound-smtp.eu-central-1.amazonaws.com.
```

Prüfen mit `dig +short MX carstenbkoch.de`.

> Läuft auf der Domain schon Mailempfang über einen anderen Anbieter, dann **nicht
> überschreiben**. Dann besser eine eigene Subdomain für den Vortrag nehmen
> (`mail.ecr2026.carstenbkoch.de`) und die Adresse entsprechend ändern — ein
> zweiter MX-Eintrag mit niedrigerer Priorität ist kein Ersatz, weil sich
> absendende Server dann für den einen oder den anderen entscheiden.

**4. Ende-zu-Ende prüfen**, noch ohne das Vortragskonto:

```bash
# Mail von Hand schicken, dann:
aws s3 ls s3://<bucket>/eingang/ --region eu-central-1
```

Liegt dort ein Objekt, steht der Empfang. Kommt nichts, ist es fast immer eines
von dreien: Regelsatz nicht aktiv, MX zeigt woanders hin, oder die Bucket Policy
lässt SES nicht schreiben.

## Was zurückgemeldet wird

Die vier Ausgaben des Stacks kommen als **GitHub-Secrets** ins Vortrags-Repo
(Settings → Secrets and variables → Actions):

| Secret | Ausgabe | Beispiel |
| --- | --- | --- |
| `MAIL_ACCESS_ROLE_ARN` | `AccessRoleArn` | `arn:aws:iam::<A>:role/ecr2026-mail-access` |
| `MAIL_BUCKET` | `BucketName` | `ecr2026-mail-mailbucket-abc123` |
| `MAIL_TOPIC_ARN` | `TopicArn` | `arn:aws:sns:eu-central-1:<A>:ecr2026-mail-MailTopic-xyz` |
| `MAIL_IDENTITY_ARN` | `IdentityArn` | `arn:aws:ses:eu-central-1:<A>:identity/carstenbkoch.de` |

Sie sind keine Geheimnisse im engeren Sinn — eine ARN erlaubt nichts —, gehören
aber trotzdem nicht ins Repository: Sie nennen Konto-IDs, und die muss man nicht
veröffentlichen.

## Abräumen nach dem Vortrag

Der Bucket löscht seine Objekte nach sieben Tagen von selbst. Der Rest geht mit
`cdk destroy`. Der **MX-Eintrag bleibt** stehen, bis er von Hand entfernt wird —
danach laufen Mails an die Adresse ins Leere, was nach dem Abend richtig ist.
