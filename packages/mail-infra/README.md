# E-Mail-Infrastruktur

Auf der Architekturfolie steht dafür ein einziger Kasten: **E-Mail-Infrastruktur**.
Das ist Absicht — kein Category Manager im Saal interessiert sich dafür, über
welche AWS-Dienste eine Mail hereinkommt. Wer es doch wissen will, findet es
hier.

> **In diesem Repository ist nichts davon verdrahtet.** Kein Skript ruft diesen
> Stack auf, `pnpm run deploy` rollt ihn nicht aus. Er steht hier als Vorlage.
> Die produktive Fassung läuft in einem eigenen Repository.

## Warum das überhaupt getrennt ist

Die Adresse des Agenten liegt auf der **übergeordneten** Domain
(`ecr2026@carstenbkoch.de`), nicht auf der Subdomain, unter der der Vortrag
gehostet wird. Empfang braucht einen MX-Eintrag und eine Domainprüfung in der
Zone dieser Domain — und die liegt in einem anderen AWS-Konto.

Dazu kommt: **AWS Blocks kann E-Mails senden, aber nicht empfangen.** Für den
Versand gibt es einen fertigen Baustein; für den Empfang gibt es keinen. Der
läuft deshalb über eine SES-Empfangsregel und liegt außerhalb der Blocks-Welt.

## Der Weg einer Mail

```
Absender
   │
   ▼
SES nimmt an            Catch-all-Regel für die ganze Domain
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

## Zwei Adressen, ein Postfach

Die Regel greift für die ganze Domain, nicht für eine Einzeladresse. Der Vortrag
bedient zwei:

| Adresse | Der Agent hat … |
|---|---|
| `ecr2026@` | Systemprompt **und** die sechs Fachwerkzeuge |
| `ecr2026-probe@` | denselben Systemprompt, **keine** Fachwerkzeuge |

Unterschieden wird über die **Empfängeradresse**, nicht über den Betreff: In
Abschnitt 6 werden die Teilnehmer ausdrücklich aufgefordert, den Mailtext zu
ändern. Wer dabei den Betreff anfasst, bekäme sonst den falschen Agenten — und
würde die Folie nicht verstehen.

## Die Falle, die den Empfang still abschaltet

**Pro Konto und Region ist genau ein SES-Receipt-Rule-Set aktiv.** Ein
bedingungsloses `SetActiveReceiptRuleSet` verdrängt ein bestehendes — und kippt
damit den Mailempfang einer ganz anderen Domain, ohne dass irgendwo etwas rot
wird.

Vor dem ersten Deploy also nachsehen:

```bash
AWS_PROFILE=<profil> aws ses describe-active-receipt-rule-set --region eu-central-1
```

- **Kein aktives Set:** Der Stack darf eines anlegen und aktivieren.
- **Ein aktives Set vorhanden:** Dessen Namen konfigurieren — der Stack hängt
  sich dort nur ein und aktiviert nichts.

Und das ist eine Entscheidung für den **allerersten** Deploy, keine, die man
später gefahrlos nachträgt: Trägt man den fremden Namen nachträglich in einen
Stack ein, der bisher sein eigenes Set aktiviert hatte, entfernt CloudFormation
die eigene Aktivierung und hängt die Regel in das andere, dabei aber nicht
aktive Set. Ergebnis: gar kein aktives Set mehr, und der Empfang stoppt still.

Die produktive Fassung hat dafür eine Guard-Lambda, die beim Abbau nur das
eigene Set deaktiviert und beim Aufbau abbricht, wenn ein fremdes aktiv ist.

## Was noch teuer gelernt wurde

- **Der Bucket steht auf `RETAIN`, ohne Lifecycle-Regel.** Er ist der einzige
  Ort, an dem eine eingegangene Mail liegt. Stilles Löschen wäre hier der
  schlimmste Fehler.
- **`AWS:SourceAccount` in der Bucket-Policy ist kein Beiwerk.** Ohne die
  Bedingung darf jeder SES-Absender in den Bucket schreiben.
- **SES weist Mail über 40 MB ab**, bevor sie den Bucket erreicht. Der Absender
  bekommt einen Bounce, `eingang/` bleibt leer. Eine fehlende große Mail ist
  also kein Zeichen für einen kaputten Empfang.
- **Abgesprochene Rollennamen lösen das Henne-Ei-Problem.** Die Rolle im
  Domain-Konto muss der Lambda im Vortragskonto vertrauen, bevor es sie gibt.
  Beide Namen stehen fest: `ecr2026-mail-access` hier,
  `ecr2026-mail-handler` dort (siehe `packages/infra/config.ts`).

## Was zurückgemeldet wird

Vier Werte, die der Vortrag als GitHub-Secrets braucht:

| Secret | Woher |
|---|---|
| `MAIL_ACCESS_ROLE_ARN` | die Rolle, die das Vortragskonto annimmt |
| `MAIL_BUCKET` | der Bucket mit `eingang/` |
| `MAIL_TOPIC_ARN` | das SNS-Topic, das den Eingang meldet |
| `MAIL_IDENTITY_ARN` | die verifizierte SES-Identität zum Senden |

Ohne sie bleibt der Mailweg im Vortrags-Deployment aus — die CDK-Schicht legt
den Handler gar nicht erst an. Das ist gewollt: Ein halb verdrahteter Mailweg
wäre schlimmer als gar keiner.
