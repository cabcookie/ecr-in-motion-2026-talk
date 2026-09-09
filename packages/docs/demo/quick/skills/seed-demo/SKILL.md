---
name: seed-demo
display_name: ALDI SUED Demo Setup
description: "Populate Knowledge Graph and Activity Feed with ALDI SUED supply chain demo data. Use when the user says 'set up ALDI demo', 'seed demo environment', or 'prepare ALDI demo'."
icon: "🏪"
trigger: set up ALDI demo
inputs: []
depends-on: [knowledge_graph, activity_feed]
scripts: [load-seed-data.mjs]
---

## Overview

This skill populates Amazon Quick's Knowledge Graph and Activity Feed with realistic ALDI SUED supply chain demo data. It creates people, suppliers, projects, and organizations in the Knowledge Graph, establishes relationships between them, and fills the Activity Feed with German-language emails and Teams messages reflecting typical supply chain operations.

The skill is designed for demo presentations where the user persona is Markus Weber (Einkauf/Buyer at ALDI SUED).

## Steps

| Step | File             | Mode          | Tools              | Purpose                                                |
| ---- | ---------------- | ------------- | ------------------ | ------------------------------------------------------ |
| 1    | steps/step_01.md | deterministic | `load_skill`       | Load `knowledge_graph` and `activity_feed` skills      |
| 2    | steps/step_02.md | deterministic | `run_javascript`   | Execute `load-seed-data.mjs` to transform bundled JSON |
| 3    | steps/step_03.md | deterministic | `kg_add`           | Create all KG entities from script output              |
| 4    | steps/step_04.md | deterministic | `kg_add`           | Create all KG relationships from script output         |
| 5    | steps/step_05.md | deterministic | `update_feed`      | Post all feed items from script output                 |
| 6    | steps/step_06.md | deterministic | `publish_day_plan` | Publish the day plan card                              |
