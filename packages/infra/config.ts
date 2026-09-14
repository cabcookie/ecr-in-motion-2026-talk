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
 * Wer darf die Rolle annehmen.
 *
 * Der Deploy-Job nennt `environment: prod`, und sobald ein Job eine Umgebung
 * nennt, setzt GitHub den `sub`-Anspruch auf `…:environment:<name>` statt auf
 * `…:ref:refs/heads/<zweig>`. Wer nur den Zweig einträgt, bekommt beim ersten
 * Lauf ein wortkarges "Not authorized to perform sts:AssumeRoleWithWebIdentity"
 * — so geschehen am 14. September.
 *
 * Der Umgebungs-Anspruch trägt den Zweig nicht mehr in sich. Dass trotzdem nur
 * `main` ausrollen kann, sichert die Zweigregel der Umgebung selbst:
 *
 *   gh api -X PUT repos/<repo>/environments/prod \
 *     -f 'deployment_branch_policy[protected_branches]=false' \
 *     -f 'deployment_branch_policy[custom_branch_policies]=true'
 *   gh api -X POST repos/<repo>/environments/prod/deployment-branch-policies \
 *     -f name=main
 *
 * Der Zweig-Anspruch bleibt daneben stehen, damit ein Job ohne Umgebung — etwa
 * ein späterer Hilfslauf — nicht stillschweigend scheitert.
 */
export const DEPLOY_SUBJECTS = [
  `repo:${REPO}:environment:prod`,
  `repo:${REPO}:ref:refs/heads/main`,
];

/**
 * Adresse, die der Agent bedient. Sie liegt auf der übergeordneten Domain und
 * wird deshalb in einem anderen Konto empfangen — siehe examples/konto-a.
 */
export const MAIL_FROM = "ecr2026@carstenbkoch.de";

/**
 * Rollenname der Lambda, die die eingehende Mail verarbeitet.
 *
 * Fest vergeben statt von CDK erzeugt, und das mit Absicht: Die Rolle im
 * Domain-Konto muss dieser hier vertrauen, bevor es sie gibt. Ein abgesprochener
 * Name bricht das Henne-Ei. Auf der anderen Seite steht derselbe Name in
 * examples/konto-a/mail-empfang-stack.ts.
 */
export const MAIL_HANDLER_ROLE = "ecr2026-mail-handler";
