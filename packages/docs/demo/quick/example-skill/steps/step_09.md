### Step 9: Load Knowledge Graph and Activity Feed Skills
- **Mode**: `deterministic`
- **Tools**: `load_skill`
- **Input**: None
- **Output**: Skills loaded and ready to use

Call `load_skill("knowledge_graph")` and `load_skill("activity_feed")` to load the tools needed for KG population and Activity Feed creation. Also review the KG schema (`kg_schema`) to understand valid entity categories and relationship types.