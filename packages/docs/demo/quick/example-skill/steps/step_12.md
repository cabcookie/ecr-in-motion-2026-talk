### Step 12: Generate Knowledge Graph Entries
- **Mode**: `agentic`
- **Tools**: Knowledge Graph tools (kg_add from loaded skill)
- **Input**: Storyline from Step 10
- **Output**: Populated knowledge graph with entities and relationships

Create KG entities for ALL characters and projects in the storyline:
## ⚠️ CRITICAL — Do not use any hardcoded date references. 
Once the demo is generated, it's current state will be saved for future reuse. Including hard coded physical dates (full or partial like year, quarter, month etc) will cause the demo to get stale. Do NOT use end/start of year, Quarter n, Qn, nth Quarter as well. Instead, USE relative references - 2 weeks from now, 3 months out,  next quarter, 3 quarters from now etc. 

1. **People entities**: Central character + all supporting cast. Include name, role/title, department, company.
2. **Project entities**: Any projects, initiatives, or workstreams mentioned in the storyline.
3. **Organization entities**: Teams, departments, companies.
4. **Event entities**: Meetings, deadlines, milestones referenced in the scenarios.
5. **Relationships**: Connect all entities with meaningful edges (reports_to, works_on, collaborates_with, attends, owns, etc.)

Use `kg_add` for each entity and relationship. Ensure the graph has enough density for the KG Showcase demo act.