import { CfnOutput, Fn, Stack, StackProps } from "aws-cdk-lib";
import { OpenIdConnectProvider, PolicyStatement, Role } from "aws-cdk-lib/aws-iam";
import { HostedZone } from "aws-cdk-lib/aws-route53";
import { BlockPublicAccess, Bucket, BucketEncryption } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import { BRAND_BUCKET, DEPLOY_ROLE, DEPLOY_SUBJECTS, DOMAIN } from "../config";
import { githubOidcPrincipal } from "./github-oidc";

/**
 * Was einmal von Hand aufgesetzt wird und danach stehen bleibt.
 *
 * Zwei Dinge, die beide nicht in den Anwendungs-Stack gehören:
 *
 * Die Deploy-Rolle, weil ein Workflow nicht die Rolle anlegen kann, die er zum
 * Anlegen braucht — Henne und Ei. Sie darf wenig: ausschließlich die
 * CDK-Bootstrap-Rollen annehmen und die Bootstrap-Version lesen. Die eigentliche
 * Arbeit tun die Bootstrap-Rollen, das ist bei CDK so vorgesehen und hält diese
 * Rolle klein.
 *
 * Die Hosted Zone, weil sie VOR dem ersten Anwendungs-Deployment existieren
 * muss. Das Zertifikat für CloudFront wird über DNS geprüft; liegt die Zone im
 * selben Deployment, schreibt AWS den Prüfeintrag in eine Zone, die vom
 * übergeordneten Namensserver noch nicht delegiert ist. Die Prüfung läuft dann
 * bis zum Zeitlimit und das Deployment bricht ab. Zuerst die Zone, dann die
 * Delegation eintragen, dann die Anwendung.
 */
export class BootstrapStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    // Kontoglobal und möglicherweise schon vorhanden — deshalb eingebunden,
    // nicht angelegt. Fehlt er, siehe README.
    const provider = OpenIdConnectProvider.fromOpenIdConnectProviderArn(
      this,
      "GitHubOidc",
      `arn:aws:iam::${this.account}:oidc-provider/token.actions.githubusercontent.com`,
    );

    const deployRole = new Role(this, "DeployRole", {
      roleName: DEPLOY_ROLE,
      description: "Von GitHub Actions angenommen, um den Vortrag auszurollen",
      assumedBy: githubOidcPrincipal(provider, DEPLOY_SUBJECTS),
    });

    deployRole.addToPolicy(
      new PolicyStatement({
        actions: ["sts:AssumeRole"],
        resources: [`arn:aws:iam::${this.account}:role/cdk-hnb659fds-*-${this.account}-*`],
      }),
    );
    deployRole.addToPolicy(
      new PolicyStatement({
        actions: ["ssm:GetParameter", "ssm:GetParameters"],
        resources: [`arn:aws:ssm:*:${this.account}:parameter/cdk-bootstrap/hnb659fds/version`],
      }),
    );

    /*
      Schrift und Logo. Privat, versioniert, und vom Deploy-Lauf lesbar — mehr
      braucht es nicht. Er holt sie sich vor dem Bauen; im Repository liegen sie
      nicht, weil sie Amazon gehören.
    */
    const marke = new Bucket(this, "Brand", {
      bucketName: BRAND_BUCKET,
      encryption: BucketEncryption.S3_MANAGED,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      versioned: true,
    });
    marke.grantRead(deployRole);

    const zone = new HostedZone(this, "Zone", {
      zoneName: DOMAIN,
      comment: "ECR in Motion 2026 — Vortrag",
    });

    new CfnOutput(this, "DeployRoleArn", {
      value: deployRole.roleArn,
      description: "Als AWS_DEPLOY_ROLE in die GitHub-Secrets eintragen",
    });
    new CfnOutput(this, "BrandBucket", {
      value: marke.bucketName,
      description: "Schrift und Logo hierhin spiegeln, siehe README",
    });
    new CfnOutput(this, "ZoneNameServers", {
      value: Fn.join(" ", zone.hostedZoneNameServers ?? []),
      description: `Als NS-Eintrag für ${DOMAIN} in die übergeordnete Zone eintragen`,
    });
  }
}
