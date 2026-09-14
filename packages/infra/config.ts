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
 * Nur der Hauptzweig dieses Repositories. Kein Pull Request, kein Fork: dieser
 * Vortrag läuft einmal, an einem Abend — ein Staging-Zweig mit eigener
 * Vertrauenskette wäre Aufwand ohne Gegenwert.
 */
export const DEPLOY_SUBJECTS = [`repo:${REPO}:ref:refs/heads/main`];
