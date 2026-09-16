# Grundlage für das Deployment

Zwei Dinge, die einmal von Hand entstehen und danach stehen bleiben: die Rolle,
die GitHub Actions annimmt, und die Hosted Zone für `ecr2026.carstenbkoch.de`.

Beides liegt bewusst nicht im Anwendungs-Stack.

Die **Rolle** nicht, weil ein Workflow nicht die Rolle anlegen kann, die er zum
Anlegen braucht.

Die **Zone** nicht, weil sie vor dem ersten Anwendungs-Deployment existieren
muss. Das Zertifikat für CloudFront wird über einen DNS-Eintrag geprüft. Läge die
Zone im selben Deployment, schriebe AWS diesen Eintrag in eine Zone, die vom
übergeordneten Namensserver noch niemand delegiert hat — die Prüfung liefe bis
zum Zeitlimit und das Deployment bräche ab.

## Reihenfolge

**1. OIDC-Anbieter, falls im Konto noch keiner ist.** Er ist kontoglobal und wird
hier eingebunden, nicht angelegt:

```bash
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com
```

Schon vorhanden? Dann meldet der Aufruf `EntityAlreadyExists`, und das ist die
richtige Antwort.

**2. CDK im Konto vorbereiten**, einmal je Konto und Region:

```bash
npx cdk bootstrap aws://<konto>/eu-central-1
```

**3. Diesen Stack ausrollen**, mit persönlichen Zugangsdaten:

```bash
pnpm --filter @ecr-talk/infra run deploy
```

Er gibt zwei Werte aus:

- `DeployRoleArn` — kommt als Repository-Secret `AWS_DEPLOY_ROLE` nach GitHub.
- `ZoneNameServers` — die vier Namensserver der neuen Zone.

**4. Delegation eintragen.** In der Zone von `carstenbkoch.de` — die in einem
anderen Konto liegt — einen NS-Eintrag für `ecr2026` auf genau diese vier
Namensserver setzen. Prüfen mit:

```bash
dig +short NS ecr2026.carstenbkoch.de
```

Kommen die vier Namen zurück, ist der Weg frei. Vorher nicht weitermachen: das
Zertifikat im nächsten Schritt hängt daran.

**4b. Schrift und Logo in den Eimer spiegeln.** Beides gehört Amazon und liegt
nicht im Repository; der Deploy-Lauf holt es sich von dort. Einmal von der
Maschine, auf der `packages/brand-material` liegt:

```bash
python3 packages/presentation/scripts/markenmaterial.py
aws s3 sync packages/presentation/public/brand/ s3://ecr2026-brand-carstenbkoch-de/ --delete
```

Ohne diesen Schritt bricht der Deploy-Lauf ab — mit Absicht. Eine Seite, die
grün meldet und ohne Marke herauskommt, fällt sonst erst am Beamer auf.

**5. Zwei Secrets in GitHub setzen** (Repository → Settings → Secrets → Actions):

| Secret | Inhalt |
| --- | --- |
| `AWS_DEPLOY_ROLE` | der ARN aus Schritt 3 |
| `DECK_TOKEN` | frei gewähltes Geheimnis für die Fernsteuerung der Folien |

Ohne `DECK_TOKEN` könnte jeder mit der Adresse die Folien weiterklicken. Es geht
als Umgebungsvariable in die Lambda-Funktion und **nicht** über `backendConfig` —
das landet in einer öffentlich lesbaren `config.json`.

**6. Ausrollen.** Ein Push auf `main`, der `packages/presentation/**` berührt,
startet `.github/workflows/deploy.yml`. Von Hand geht es über „Run workflow".

## Was die Rolle darf

Wenig. Sie darf ausschließlich die CDK-Bootstrap-Rollen annehmen und die
Bootstrap-Version lesen. Die eigentliche Arbeit tun die Bootstrap-Rollen — so
ist CDK gebaut, und so bleibt diese Rolle klein genug, um sie in einem Blick zu
prüfen.

Angenommen werden darf sie nur von `refs/heads/main` dieses Repositories. Keine
Pull Requests, keine Forks.

## Noch offen: die E-Mail-Adresse

`ecr2026@carstenbkoch.de` liegt auf der **übergeordneten** Domain, nicht auf der
Subdomain dieses Stacks. Der Empfang braucht deshalb Einträge in der Zone von
`carstenbkoch.de`, also im anderen Konto:

- einen MX-Eintrag auf den SES-Eingang der Region,
- die Bestätigungseinträge der Domainprüfung.

Das ist nicht Teil dieses Stacks und steht als eigener Vorgang auf dem Board
(`fx1t`).
