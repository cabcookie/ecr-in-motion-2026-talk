/**
 * Die festen Größen des Deployments.
 *
 * Eine Datei, damit Domain und Repo-Kennung nicht an drei Stellen leicht
 * verschieden dastehen. Die Werte hier gelten sowohl für die Bootstrap-App in
 * diesem Paket als auch für die Anwendung in packages/presentation.
 */

/** Öffentlich erreichbare Adresse des Vortrags. */
export const DOMAIN = "ecr2026.carstenbkoch.de";

/** GitHub-Repository, dessen Actions die Rolle annehmen dürfen. */
export const REPO = "cabcookie/ecr-in-motion-2026-talk";

/** Region der Anwendung. Das Zertifikat legt AWS Blocks selbst in us-east-1 an. */
export const REGION = "eu-central-1";

/** Name der Rolle, die der Workflow annimmt. */
export const DEPLOY_ROLE = "ecr2026-deploy";

/**
 * Unveränderliche Kennungen von Besitzer und Repository.
 *
 * GitHub setzt sie in den `sub`-Anspruch: nicht `repo:cabcookie/…`, sondern
 * `repo:cabcookie@2454422/ecr-in-motion-2026-talk@1363255134:…`. Das schützt
 * gegen Umbenennungen — ein Repository, das später so heißt wie unseres,
 * bekommt trotzdem keine Anmeldedaten.
 *
 * Gegengeprüft mit `gh api repos/<repo> --jq '{id, owner:.owner.id}'`.
 */
const OWNER_ID = 2454422;
const REPO_ID = 1363255134;

/**
 * Wer darf die Rolle annehmen.
 *
 * Nur der Hauptzweig dieses Repositories. Kein Pull Request, kein Fork: dieser
 * Vortrag läuft einmal, an einem Abend.
 *
 * Vier Einträge für zwei Fälle, und beide sind teuer gelernt:
 *
 * Erstens die Umgebung. Der Deploy-Job nennt `environment: prod`, und sobald
 * ein Job eine Umgebung nennt, setzt GitHub den Anspruch auf
 * `…:environment:<name>` statt auf `…:ref:refs/heads/<zweig>`. Weil der
 * Umgebungs-Anspruch den Zweig nicht mehr enthält, ist die Umgebung prod
 * zusätzlich auf main eingeschränkt:
 *
 *   gh api -X PUT repos/<repo>/environments/prod --input <(echo \
 *     '{"deployment_branch_policy":{"protected_branches":false,"custom_branch_policies":true}}')
 *   gh api -X POST repos/<repo>/environments/prod/deployment-branch-policies -f name=main
 *
 * Zweitens die Kennungen. Beide Formen stehen hier, weil GitHub die kurze in
 * manchen Zusammenhängen noch sendet. Jede ist eine genaue Zeichenkette, keine
 * Abkürzung mit Stern — vier exakte Einträge sind enger als ein Muster.
 *
 * Die Diagnose lief über CloudTrail: Das abgelehnte Ereignis nennt unter
 * userIdentity.userName den Anspruch, der tatsächlich ankam. Die Fehlermeldung
 * von STS ("Not authorized to perform sts:AssumeRoleWithWebIdentity") sagt das
 * nicht — sie sieht bei einer nicht passenden Positivliste genauso aus wie bei
 * einer Sperre durch eine Kontenrichtlinie.
 */
export const DEPLOY_SUBJECTS = [
  `repo:${REPO.replace("/", `@${OWNER_ID}/`)}@${REPO_ID}:environment:prod`,
  `repo:${REPO.replace("/", `@${OWNER_ID}/`)}@${REPO_ID}:ref:refs/heads/main`,
  `repo:${REPO}:environment:prod`,
  `repo:${REPO}:ref:refs/heads/main`,
];

/**
 * Adresse, die der Agent bedient. Sie liegt auf der übergeordneten Domain und
 * wird deshalb in einem anderen Konto empfangen — siehe packages/mail-infra.
 */
export const MAIL_FROM = "ecr2026@carstenbkoch.de";

/**
 * Rollenname der Lambda, die die eingehende Mail verarbeitet.
 *
 * Fest vergeben statt von CDK erzeugt, und das mit Absicht: Die Rolle im
 * Domain-Konto muss dieser hier vertrauen, bevor es sie gibt. Ein abgesprochener
 * Name bricht das Henne-Ei. Auf der anderen Seite steht derselbe Name in
 * packages/mail-infra/lib/mail-empfang-stack.ts.
 */
export const MAIL_HANDLER_ROLE = "ecr2026-mail-handler";

/**
 * Eimer für Schrift und Logo.
 *
 * Beides gehört Amazon und liegt deshalb nicht im Repository — das war die
 * Vorgabe, und sie ist richtig. Nur checkt GitHub Actions damit ein Repo ohne
 * die Dateien aus, und die ausgerollte Seite kam ohne Logo und in der
 * Ersatzschrift heraus, ohne dass irgendetwas rot wurde.
 *
 * Also der Weg, der von Anfang an vorgeschlagen war: Die Dateien liegen in
 * einem privaten Eimer, der Deploy-Lauf holt sie sich vor dem Bauen. Der Name
 * enthält bewusst keine Konto-Nummer, weil dieses Repository öffentlich wird.
 */
export const BRAND_BUCKET = "ecr2026-brand-carstenbkoch-de";
