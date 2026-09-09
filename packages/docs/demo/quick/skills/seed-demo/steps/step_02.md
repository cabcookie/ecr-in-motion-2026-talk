# Step 2: Execute Data Transformation Script

## Mode

deterministic

## Tools

- `run_javascript`

## Instructions

Execute the bundled data transformation script:

1. Call `run_javascript("load-seed-data.mjs")`

This script reads the bundled JSON data files (`data/kg-entities.json`, `data/kg-relationships.json`, `data/feed-items.json`), transforms them into the formats required by Quick's tools, and sets the following session variables:

- `session.SEED_ENTITIES` — Array of KG entity objects (entity_type, name, attributes)
- `session.SEED_RELATIONSHIPS` — Array of KG relationship objects (source, target, relationship_type, attributes)
- `session.SEED_FEED_ITEMS` — Array of feed item objects (channel_source, sender, subject, body, importance, timestamp, cta_labels)
- `session.SEED_DAY_PLAN` — Day plan object (meetings, recommendations)

If the script fails, report the error and stop execution.
