# Step 3: Populate Knowledge Graph Entities

## Mode

deterministic

## Tools

- `kg_add`

## Instructions

Iterate over `session.SEED_ENTITIES` and create each entity in the Knowledge Graph:

For each entity in `session.SEED_ENTITIES`:

1. Call `kg_add` with:
   - `entity_type`: entity.entity_type
   - `name`: entity.name
   - `attributes`: entity.attributes

This populates the Knowledge Graph with:

- 4 people entities (Thomas Müller, Sandra Klein, Peter Hoffmann, Julia Braun)
- 4 supplier entities (NewCoffee Trading GmbH, Storck GmbH & Co. KG, FreshFruit Import GmbH, Müller Milch)
- 3 project entities (Q3 Cost Optimization, Dual-Sourcing Kaffee, Verpackungsumstellung 2025)
- 4 organization entities (ALDI SUED Holding, Einkauf Team, Logistik ISCM, Sortimentsplanung)

If `kg_add` fails for a single entity, log a warning, skip that entity, and continue with the remaining entities. Report the count of skipped entities at the end.
