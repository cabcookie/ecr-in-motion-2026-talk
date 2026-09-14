import { IOpenIdConnectProvider, OpenIdConnectPrincipal } from "aws-cdk-lib/aws-iam";

/**
 * Vertrauensanker für GitHub Actions.
 *
 * Festgenagelt sind zwei Dinge: `aud` auf sts.amazonaws.com und `sub` auf eine
 * Positivliste, die `repo:<besitzer>/<repo>:…` enthält. Damit ist das
 * Repository — und über den Pfad auch sein Besitzer — vollständig eingegrenzt.
 *
 * Bewusst OHNE eine zusätzliche Bedingung auf `repository_owner`: In einem
 * anderen nxsflow-Konto führte genau die dazu, dass
 * `sts:AssumeRoleWithWebIdentity` verweigert wurde. Die `sub`-Liste leistet
 * dasselbe, ohne diese Falle.
 */
export function githubOidcPrincipal(
  provider: IOpenIdConnectProvider,
  subjects: readonly string[],
): OpenIdConnectPrincipal {
  return new OpenIdConnectPrincipal(provider, {
    StringEquals: { "token.actions.githubusercontent.com:aud": "sts.amazonaws.com" },
    StringLike: { "token.actions.githubusercontent.com:sub": [...subjects] },
  });
}
