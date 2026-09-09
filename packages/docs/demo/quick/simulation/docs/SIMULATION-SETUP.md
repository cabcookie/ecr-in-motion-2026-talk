# ALDI SUED Supply Chain Simulation – Setup & Start Guide

## Prerequisites

- Node.js ≥ 18
- npm ≥ 9
- Amazon Quick Desktop App (for MCP integration)

## Installation

```bash
cd quick/simulation
npm install
```

## Buyer Name Configuration

The simulation uses a configurable buyer persona. By default, the buyer is "Markus Weber". To personalize the simulation for a demo, set the `BUYER_NAME` environment variable **before** starting any server:

```bash
export BUYER_NAME="Max Mustermann"
```

This affects:

- The buyer role entry in the database (`roles.display_name`)
- The derived email address (e.g. `max.mustermann@aldi-sued.de`)
- Sender/recipient fields in all seed emails
- Name references in email bodies ("Hallo Max", "Herr Mustermann", etc.)

If you change the name after the database was already created, delete `simulation.db` first so it gets re-seeded with the new name.

## Starting the Simulation

### Option A: Outlook MCP Server Only (for Amazon Quick)

Amazon Quick starts the MCP server automatically when configured correctly (see "Amazon Quick MCP Configuration" section). You do not need to start anything manually.

To test the server manually:

```bash
cd quick/simulation
BUYER_NAME="Max Mustermann" npx tsx packages/mcp-outlook/src/server-stdio.ts
```

### Option B: HTTP Variant (for development/debugging)

```bash
cd quick/simulation
BUYER_NAME="Max Mustermann" npx tsx packages/mcp-outlook/src/server.ts
```

Starts the Outlook MCP on `http://localhost:3001/mcp` with:

- Health check: `http://localhost:3001/health`
- OAuth metadata: `http://localhost:3001/.well-known/oauth-authorization-server`

### Option C: Full Simulation (when all slices are implemented)

```bash
cd quick/simulation
npm run dev
```

Starts in parallel: Soul API (8000), Vite Frontend (5173), all 4 MCP servers (3001–3004), Agent Engine.

## Amazon Quick MCP Configuration

### Setting up the Outlook MCP

1. Open Amazon Quick
2. Go to Settings → MCP → "Add MCP"
3. Select **Connection type: Local**
4. Fill in the fields:

| Field           | Value                                                                                                                                                                                                     |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Name**        | `ALDI SUED Microsoft Outlook`                                                                                                                                                                             |
| **Command**     | `npx`                                                                                                                                                                                                     |
| **Arguments**   | `tsx /Users/carskoch/Development/aldi/quick-demo/quick/simulation/packages/mcp-outlook/src/server-stdio.ts`                                                                                               |
| **Environment** | `BUYER_NAME=<Your Name>` (optional, defaults to "Markus Weber")                                                                                                                                           |
| **Description** | `Email system (Microsoft Outlook) for ALDI SUED. Reads emails from the inbox, shows unread message count, and enables sending emails. Tools: get_emails, get_unread_count, send_email, get_user_identity` |
| **Timeout**     | `30`                                                                                                                                                                                                      |

5. Click "Save"
6. Quick starts the process automatically

### Available MCP Tools After Connection

- **get_emails** – Read emails (filters: limit, unread_only, sender, since)
- **get_unread_count** – Count of unread emails
- **send_email** – Send an email (to, subject, body)
- **get_user_identity** – Get current user identity and role

### Test Questions for Amazon Quick

After connecting, ask these questions in Amazon Quick to verify the integration:

- "How many unread emails do I have?"
- "Show me my latest emails"
- "Who sent me emails?"
- "Show me emails from NewCoffee"
- "Who am I and what is my role?"

## Running Tests

```bash
cd quick/simulation
npx vitest run
```

Expected: 34 tests passing (6 files, including property-based tests with fast-check).

## Resetting the Database

The SQLite database `simulation.db` is automatically created and seeded on first start. To reset:

```bash
cd quick/simulation
rm -f simulation.db
# It will be recreated on next start
```

## Project Structure

```
quick/simulation/
├── packages/
│   ├── db/                    # SQLite schema, seed data, anchor-date logic
│   │   └── src/
│   │       ├── schema.sql     # Database schema (3 tables in Slice 1)
│   │       ├── init-db.ts     # getDb() factory
│   │       ├── anchor-date.ts # Relative time computation
│   │       └── seed.ts        # seedDatabase() with 18 emails
│   ├── mcp-outlook/           # Outlook MCP Server
│   │   └── src/
│   │       ├── server.ts      # HTTP variant (port 3001)
│   │       └── server-stdio.ts # stdio variant (for Amazon Quick)
│   ├── api/                   # Soul REST API (Slice 2)
│   └── frontend/              # Vite+React Frontend (Slice 2)
├── simulation.db              # SQLite file (auto-generated)
├── package.json               # Monorepo root
├── vitest.config.ts           # Test configuration
└── docs/
    └── SIMULATION-SETUP.md    # This file
```

## Troubleshooting

### "Cannot find module" error

```bash
cd quick/simulation && npm install
```

### Port 3001 in use

```bash
lsof -i :3001 | grep LISTEN
kill -9 <PID>
```

### SQLite "database is locked"

Make sure multiple processes are not accessing `simulation.db` simultaneously. If in doubt: `rm simulation.db` and restart.

### Amazon Quick cannot find the tools

- Verify the path in "Arguments" is absolute and correct
- Verify `npm install` has been run in the `quick/simulation` directory
- Test manually: `echo '{}' | npx tsx packages/mcp-outlook/src/server-stdio.ts` (should output JSON)
