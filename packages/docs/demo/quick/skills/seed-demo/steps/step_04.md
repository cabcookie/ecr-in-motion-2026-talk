# Step 4: Populate Knowledge Graph Relationships

## Mode

deterministic

## Tools

- `kg_add`

## Instructions

Iterate over `session.SEED_RELATIONSHIPS` and create each relationship in the Knowledge Graph:

For each relationship in `session.SEED_RELATIONSHIPS`:

1. Call `kg_add` with:
   - `source`: relationship.source
   - `target`: relationship.target
   - `relationship_type`: relationship.relationship_type
   - `attributes`: relationship.attributes

This creates at least 20 relationships covering:

- `part_of` — People to organizations, organizations to parent
- `works_on` — People to projects, suppliers to projects
- `supplies_to` — Suppliers to ALDI SUED Holding
- `collaborates_with` — People to people across teams

If `kg_add` fails for a single relationship (e.g., referenced entity not found), log a warning, skip that relationship, and continue. Report the count of skipped relationships at the end.
