# E-Mail-Infrastruktur

Auf der Architekturfolie steht dafür ein einziger Kasten: **E-Mail-Infrastruktur**.
Das ist Absicht — kein Category Manager im Saal interessiert sich dafür, über
welche AWS-Dienste eine Mail hereinkommt. Wer es doch wissen will, findet es
hier.

> **Dieses Repository rollt den Stack nicht aus.** Es gibt keine CDK-App und
> kein Skript dafür; `pnpm run deploy` fasst das Domain-Konto nicht an. Der
> Stack steht hier als Vorlage für das Konto, in dem die Domain liegt.
>
> Die andere Hälfte ist dagegen verdrahtet: `packages/presentation/aws-blocks/index.cdk.ts`
> legt die Mail-Lambda im Vortragskonto an, sobald die drei Ausgabewerte
> dieses Stacks als Secrets gesetzt sind.

## Warum der Mailweg in einem eigenen Konto liegt

Die Adresse des Agenten liegt auf der **übergeordneten** Domain
(`ecr2026@carstenbkoch.de`), nicht auf der Subdomain, unter der der Vortrag
gehostet wird. Empfang braucht einen MX-Eintrag und eine Domainprüfung in der
Zone dieser Domain — und diese Zone liegt in einem anderen AWS-Konto als der
Vortrag.

Dazu kommt: **AWS Blocks kann E-Mails senden, aber nicht empfangen.** Für den
Versand gibt es einen fertigen Baustein; für den Empfang gibt es keinen. Der
läuft deshalb über eine SES-Empfangsregel und liegt außerhalb der Blocks-Welt.

Wer beides im selben Konto hat, braucht die Trennung nicht — dann fällt die
Cross-Account-Rolle weg und der Stack wird einfacher.

## Der Weg einer Mail

```
Absender
   │
   ▼
SES nimmt an            Empfangsregel für die Domain
   │
   ├──► S3  eingang/    die Rohmail, unverändert
   │
   └──► SNS             meldet: „da liegt was"
                            │
                            ▼
                     Vortragskonto
                     nimmt eine Rolle an und liest die Mail
```

Die Antwort geht denselben Weg zurück: dieselbe Rolle darf als die verifizierte
Identität senden. **Eine** Rolle statt zweier Berechtigungswege — der
EmailClient-Baustein von AWS Blocks reicht kein `SourceArn` durch, also wäre der
getrennte Weg gar nicht nutzbar.

## Eine Adresse, ein Agent

Der Vortrag bedient eine Adresse: `ecr2026@`. Dahinter steht der Blocks-Agent
aus `packages/presentation/aws-blocks/agent` mit allen Fachwerkzeugen.

Bis zum 16.09. gab es daneben `ecr2026-probe@` für denselben Agenten ohne
Werkzeuge. Das Postfach ist entfallen; die Stufe ohne Werkzeuge zeigt der Chat.
Steht die Adresse noch in `adressen`, kommt eine Mail dorthin trotzdem an und
wird vom Standardpostfach `ecr2026@` beantwortet. Entfernen heißt, diesen Stack
in diesem Konto neu auszurollen.

### Wer was tut

1. SES legt die Mail in S3 ab und meldet sie über SNS.
2. Die Mail-Lambda `ecr2026-mail-handler` im Vortragskonto liest sie mit der
   Zugriffsrolle. Im Vortragsfenster übergibt sie sie über die API
   `mailEingang` an den Agenten (geschützt mit `DECK_TOKEN`); außerhalb sendet
   sie selbst eine feste Antwort ohne Agent und ohne Zitat.
3. Der Agent arbeitet in AgentCore und ruft zum Senden die Mail-Lambda auf.
   Nur deren Rolle ist hier zugelassen, deshalb sendet er nicht selbst.
4. Die Lambda hängt Abspann und Zitat an und sendet über SES.

---

## Wenn Du den Mailweg mitverdrahten willst

### Zuerst: die SES-Sandbox

**Das ist die Hürde, an der es sonst am Vortragsabend scheitert.** Ein neues
AWS-Konto steht in der SES-Sandbox, und die beschränkt das **Senden**:

- nur an **verifizierte** Adressen oder Domains,
- höchstens 200 Nachrichten in 24 Stunden,
- höchstens eine pro Sekunde.

**Der Empfang ist davon nicht betroffen.** Die Mails kommen an, der Agent
arbeitet — nur die Antwort geht nicht hinaus, wenn der Empfänger nicht
verifiziert ist. Das sieht im Protokoll aus wie ein Zustellfehler und ist
keiner.

Für einen Saal voller Menschen ist Verifizieren kein Weg: Jede Adresse muss
selbst einen Bestätigungslink anklicken, und das kann man achtzig Teilnehmern
nicht vorher zumuten. Also:

**Produktionszugriff beantragen**, rechtzeitig — die Freigabe dauert in der
Regel etwa einen Werktag:

- [Produktionszugriff für SES beantragen](https://docs.aws.amazon.com/ses/latest/dg/request-production-access.html)
- [Was die Sandbox einschränkt](https://docs.aws.amazon.com/ses/latest/dg/request-production-access.html#sandbox-limits)
- [Identitäten verifizieren](https://docs.aws.amazon.com/ses/latest/dg/creating-identities.html)

**Die Alternative für eine Probe:** In der Sandbox bleiben und die Handvoll
Adressen verifizieren, von denen Du selbst testest. Das trägt für die
Generalprobe und trägt nicht für den Vortrag.

### Dann: das Rule Set

**Pro Konto und Region ist genau ein SES-Receipt-Rule-Set aktiv.** Der Stack
legt ein eigenes an (`ecr2026`) und hängt die Regel dort ein. Aktivieren tut
er es **nicht** — das bleibt ein Handgriff, und das ist Absicht: Ein
Aktivieren verdrängt ein bestehendes Set und kippt damit den Mailempfang einer
ganz anderen Domain im selben Konto, ohne dass irgendwo etwas rot wird.

Vor dem ersten Deploy also nachsehen:

```bash
AWS_PROFILE=<dein-profil> aws ses describe-active-receipt-rule-set --region eu-central-1
```

- **Kein aktives Set:** Den Stack so ausrollen und danach das neue Set
  aktivieren:
  `aws ses set-active-receipt-rule-set --rule-set-name ecr2026 --region eu-central-1`
- **Ein aktives Set vorhanden:** Dann nichts aktivieren. Stattdessen im Code
  das bestehende Set mit `ReceiptRuleSet.fromReceiptRuleSetName` holen und die
  Regel dort einhängen — ein Schalter dafür ist nicht eingebaut. Sonst steht
  das eigene Set zwar da, ist aber inaktiv, und es kommt nichts an.

### Die Schritte

1. **MX-Eintrag** für die Domain auf den SES-Endpunkt der Region setzen, und die
   Domain als SES-Identität verifizieren (Easy DKIM).
2. **Diesen Stack ausrollen**, aus einer eigenen CDK-App im Domain-Konto. Er
   braucht die Konto-ID des Vortragskontos, die Adressen, die er bedienen
   soll, und die verifizierte Domain:

   ```ts
   new MailEmpfangStack(app, "Ecr2026MailEmpfang", {
     env: { account: "<domain-konto>", region: "eu-central-1" },
     vortragsKonto: "<vortragskonto>",
     adressen: ["ecr2026@example.org"],
     domain: "example.org",
   });
   ```

   Läuft beides im selben Konto, entfallen die Cross-Account-Rolle und ihre
   Konto-ID — dann den Stack entsprechend vereinfachen.
3. **Das Rule Set aktivieren** oder die Regel in ein bestehendes hängen (siehe
   oben).
4. **Drei Ausgabewerte** als GitHub-Secrets im Vortrags-Repository
   hinterlegen:

   | Secret | Ausgabe | Was |
   |---|---|---|
   | `MAIL_ACCESS_ROLE_ARN` | `AccessRoleArn` | die Rolle, die das Vortragskonto annimmt |
   | `MAIL_BUCKET` | `BucketName` | der Bucket mit `eingang/` |
   | `MAIL_TOPIC_ARN` | `TopicArn` | das SNS-Topic, das den Eingang meldet |

   Die vierte Ausgabe, `IdentityArn`, ist nur zur Auskunft; niemand liest sie.

5. **Deployen.** `packages/presentation/aws-blocks/index.cdk.ts` legt die
   Mail-Lambda nur an, wenn alle drei Werte da sind. Fehlt einer, passiert
   nichts — kein Fehler, keine Lambda. Das ist gewollt: Ein halb verdrahteter
   Mailweg wäre schlimmer als gar keiner.

Die Adresse des Postfachs steht außerdem im Code des Vortrags, nicht nur
hier: `packages/presentation/aws-blocks/mail/konfig.ts`. Wer eine andere
Domain nimmt, ändert sie dort mit.

Die abgesprochenen Rollennamen lösen dabei ein Henne-Ei-Problem. Die Rolle hier
muss der Lambda im Vortragskonto vertrauen, bevor es sie gibt. Beide Namen
stehen deshalb fest und an einer Stelle: `ecr2026-mail-access` hier,
`ecr2026-mail-handler` in `packages/infra/config.ts`.

## Zwei Dinge, die sonst überraschen

- **Eingegangene Mails leben sieben Tage.** Eine Lifecycle-Regel löscht sie
  danach, und der Bucket hängt am Stack (`DESTROY`, samt Inhalt): Wer den
  Stack entfernt, entfernt alle Mails darin. Wer sie länger braucht, ändert
  beides vor dem ersten Deploy.
- **SES weist Mail über 40 MB ab**, bevor sie den Bucket erreicht. Der Absender
  bekommt einen Bounce, `eingang/` bleibt leer. Eine fehlende große Mail ist
  also kein Zeichen für einen kaputten Empfang.
