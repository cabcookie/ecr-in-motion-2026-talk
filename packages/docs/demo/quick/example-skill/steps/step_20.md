### Step 20: Knowledge Graph Enrichment (Neural Network Effect)
- **Mode**: `agentic`
- **Tools**: Knowledge Graph tools (kg_add, etc. from loaded skill)
- **Input**: Confirmed industry/company from Step 6 + KG entities from Step 12
- **Output**: Additional KG entities and edges that create a richer, more interconnected graph

**Purpose:** The storyline-related KG entries from Step 12 tend to create a small, circular node graph centered on the main character. This step adds broader industry/company context that makes the Knowledge Graph look more like a realistic neural network — with multiple clusters, cross-connections, and peripheral nodes.

**What to add (30-50 additional entities + corresponding edges):**

Split into two `kg_add` calls if needed to avoid overly large payloads. Target:
- **At least 30 new entities** beyond what was added in Step 12
- **At least 50 new edges** connecting these entities to each other and to existing storyline entities

**Entity categories to cover:**

- **Industry context (8-10 entities)**: Industry trends, regulatory bodies, market events, competitor companies, industry standards/frameworks, professional associations, certification bodies
- **Organizational depth (6-8 entities)**: Additional departments, teams, business units, internal platforms, shared services
- **Peripheral people (6-8 entities)**: HR contacts, IT support, conference speakers, one-off interactions, mentors, advisory board members, vendor contacts
- **Adjacent projects (4-6 entities)**: Projects the central character is aware of but not directly involved in, past completed initiatives, company-wide programs
- **External ecosystem (6-8 entities)**: Industry partners, analyst firms, conference events, tools/platforms, consulting firms, industry publications
- **Historical context (4-6 entities)**: Past initiatives, completed projects, former team structures, legacy systems being replaced

**Edge creation strategy:**
- Connect new entities to BOTH existing storyline entities AND to each other
- At least 2-3 edges per new entity (aim for 50+ total new edges)
- Varied relationship types: "relatedTo", "attendee", "memberOf", "worksFor", "dependsOn", "isPartOf", "manages", "about", etc.
- Create multiple clusters and cross-cluster bridges
- Ensure some new people entities have connections to multiple clusters (bridge nodes)

**Graph topology goal:**
- At least 5-6 distinct clusters (main storyline + 4-5 industry/peripheral clusters)
- Clusters bridged by shared entities (at least 3 bridge nodes)
- Mix of high-degree nodes (3+ connections) and peripheral nodes (1-2 connections)
- Total graph should have 45-65+ entities and 75-100+ edges after this step
