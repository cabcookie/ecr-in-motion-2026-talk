/**
 * Shared User Identity Resolution for all MCP Servers
 *
 * Resolves the current user identity from demo_config (buyer_role_id) → roles table.
 * Email is derived from display_name: "Vorname Nachname" → "vorname.nachname@aldi-sued.de"
 *
 * Requirements: 9.8, 11.1, 11.2, 11.3, 11.4
 */

import type Database from "better-sqlite3";

export interface UserIdentity {
  name: string;
  role: string;
  email: string;
  responsibilities: string;
  systems: string[];
}

/**
 * Resolves the current user identity from demo_config (buyer_role_id) → roles table.
 * Email is derived from display_name: "Vorname Nachname" → "vorname.nachname@aldi-sued.de"
 */
export function resolveCurrentUser(db: Database.Database): UserIdentity {
  const configRow = db
    .prepare("SELECT value FROM demo_config WHERE key = ?")
    .get("buyer_role_id") as { value: string } | undefined;

  const roleId = configRow ? JSON.parse(configRow.value) : "buyer";

  const role = db.prepare("SELECT * FROM roles WHERE id = ?").get(roleId) as
    | {
        id: string;
        name: string;
        display_name: string;
        description: string;
        systems_access: string;
        polling_interval: number;
      }
    | undefined;

  if (!role) {
    return {
      name: "Unknown",
      role: "Unknown",
      email: "unknown@aldi-sued.de",
      responsibilities: "",
      systems: [],
    };
  }

  // Derive email from display_name: "Markus Weber" → "markus.weber@aldi-sued.de"
  const emailParts = role.display_name.toLowerCase().split(" ");
  const email = `${emailParts.join(".")}@aldi-sued.de`;

  return {
    name: role.display_name,
    role: role.name,
    email,
    responsibilities: role.description,
    systems: JSON.parse(role.systems_access),
  };
}
