#!/usr/bin/env node
/**
 * Einmalige Grundlage: Deploy-Rolle und Hosted Zone.
 *
 *   pnpm --filter @ecr-talk/infra deploy
 *
 * Läuft mit persönlichen Zugangsdaten, nicht über GitHub Actions — die Rolle,
 * die der Workflow annimmt, entsteht ja gerade erst hier.
 */
import { App } from "aws-cdk-lib";
import { BootstrapStack } from "../lib/bootstrap-stack";
import { REGION } from "../config";

const app = new App();

new BootstrapStack(app, "ecr2026-bootstrap", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION ?? REGION,
  },
  description: "Deploy-Rolle für GitHub Actions und die Hosted Zone des Vortrags",
});
