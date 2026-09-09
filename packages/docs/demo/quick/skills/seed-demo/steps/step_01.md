# Step 1: Load Dependent Skills

## Mode

deterministic

## Tools

- `load_skill`

## Instructions

Load the required dependent skills:

1. Call `load_skill("knowledge_graph")`
2. Call `load_skill("activity_feed")`

Both skills must load successfully before proceeding. If either fails, report the error:
"Required skill not available: {skill_name}. Ensure Knowledge Graph and Activity Feed skills are installed."
