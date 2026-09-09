/**
 * Shared OAuth 2.1 Logic for all MCP Servers
 *
 * Provides simplified OAuth 2.1 endpoints for the local demo:
 * - GET  /.well-known/oauth-authorization-server → Server Metadata
 * - POST /oauth/register → Dynamic Client Registration
 * - GET  /oauth/authorize → Authorization with PKCE S256
 * - POST /oauth/token → Token Exchange
 *
 * Requirements: 9.3
 */

import { randomUUID } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";

// In-memory stores for the simplified OAuth flow
const registeredClients = new Map<
  string,
  { client_id: string; redirect_uris: string[] }
>();
const authorizationCodes = new Map<
  string,
  { client_id: string; code_challenge: string }
>();
const accessTokens = new Set<string>();

export interface OAuthConfig {
  port: number;
  serverName: string;
}

/**
 * OAuth 2.1 Server Metadata (RFC 8414)
 */
export function getOAuthMetadata(config: OAuthConfig): object {
  const issuer = `http://localhost:${config.port}`;
  return {
    issuer,
    authorization_endpoint: `${issuer}/oauth/authorize`,
    token_endpoint: `${issuer}/oauth/token`,
    registration_endpoint: `${issuer}/oauth/register`,
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code"],
    code_challenge_methods_supported: ["S256"],
    token_endpoint_auth_methods_supported: ["none"],
  };
}

/**
 * Parse request body as JSON (for POST requests).
 */
export function parseBody(
  req: IncomingMessage,
): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk: Buffer) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}

/**
 * Handles OAuth 2.1 endpoints. Returns true if the request was handled, false otherwise.
 */
export async function handleOAuthRequest(
  req: IncomingMessage,
  res: ServerResponse,
  url: URL,
  config: OAuthConfig,
): Promise<boolean> {
  // GET /.well-known/oauth-authorization-server → Server Metadata
  if (
    url.pathname === "/.well-known/oauth-authorization-server" &&
    req.method === "GET"
  ) {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(getOAuthMetadata(config)));
    return true;
  }

  // POST /oauth/register → Dynamic Client Registration
  if (url.pathname === "/oauth/register" && req.method === "POST") {
    try {
      const body = await parseBody(req);
      const clientId = randomUUID();
      const redirectUris = (body.redirect_uris as string[]) ?? [];
      registeredClients.set(clientId, {
        client_id: clientId,
        redirect_uris: redirectUris,
      });

      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          client_id: clientId,
          client_id_issued_at: Math.floor(Date.now() / 1000),
          redirect_uris: redirectUris,
          grant_types: ["authorization_code"],
          response_types: ["code"],
          token_endpoint_auth_method: "none",
        }),
      );
    } catch {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "invalid_request" }));
    }
    return true;
  }

  // GET /oauth/authorize → Authorization with PKCE S256 (simplified: immediately returns code)
  if (url.pathname === "/oauth/authorize" && req.method === "GET") {
    const clientId = url.searchParams.get("client_id") ?? "";
    const redirectUri = url.searchParams.get("redirect_uri") ?? "";
    const codeChallenge = url.searchParams.get("code_challenge") ?? "";
    const state = url.searchParams.get("state") ?? "";

    // Generate authorization code immediately (no login screen for local demo)
    const code = randomUUID();
    authorizationCodes.set(code, {
      client_id: clientId,
      code_challenge: codeChallenge,
    });

    // Redirect with authorization code
    const separator = redirectUri.includes("?") ? "&" : "?";
    const location = `${redirectUri}${separator}code=${code}${state ? `&state=${state}` : ""}`;
    res.writeHead(302, { Location: location });
    res.end();
    return true;
  }

  // POST /oauth/token → Token Exchange (permissive for local demo)
  if (url.pathname === "/oauth/token" && req.method === "POST") {
    try {
      const body = await parseBody(req);
      const code = body.code as string | undefined;
      const grantType = body.grant_type as string | undefined;

      if (grantType !== "authorization_code" || !code) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "unsupported_grant_type" }));
        return true;
      }

      // For local demo: accept any valid code
      authorizationCodes.delete(code as string);

      const tokenPrefix = config.serverName.toLowerCase().replace(/\s+/g, "-");
      const token = `mcp-${tokenPrefix}-${randomUUID()}`;
      accessTokens.add(token);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          access_token: token,
          token_type: "Bearer",
          expires_in: 3600,
        }),
      );
    } catch {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "invalid_request" }));
    }
    return true;
  }

  return false;
}
