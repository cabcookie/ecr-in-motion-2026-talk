### Step 11: Derive Filenames and Dispatch Dataset Task
- **Mode**: `deterministic`
- **Tool**: `start_task`
- **Input**: Demo target info from Step 6 + dataset context from Step 10's storyline + `DEMO_ARTIFACT_PATH`
- **Output**: Running background task for dataset generation

**Step 11a — Derive exact filenames NOW (before dispatching):**

Apply the naming convention to derive the exact filenames:
1. Take the customer name (if applicable) and industry name
2. Convert to lowercase
3. Replace spaces with hyphens
4. Remove special characters (keep only lowercase letters, digits, hyphens)
5. Construct:
   - `EXPECTED_CSV_FILENAME` = `sample-data-<formatted-customer>-<formatted-industry>.csv` (or `sample-data-<formatted-industry>.csv` for industry-only)
   - `EXPECTED_ENRICHMENT_FILENAME` = same base + `-enrichment.txt`
   - `SPACE_NAME` = `sample-space-<formatted-customer>-<formatted-industry>` (or `sample-space-<formatted-industry>` for industry-only)

Print the derived filenames for the record:
```
Derived filenames:
  CSV: <EXPECTED_CSV_FILENAME>
  Enrichment: <EXPECTED_ENRICHMENT_FILENAME>
```

**Step 11b — Dispatch dataset generation task:**

Call `start_task` with:
- `tools`: `"all"` (sub-task needs `load_skill("demo-dataset-generation")`)
- `mode`: `"continue_then_receive"`
- `share_workspace`: `true`

**Objective template:**
```
Load the `demo-dataset-generation` skill by calling load_skill("demo-dataset-generation") and follow its instructions to generate a demo dataset and enrichment file.

PARAMETERS:
- Customer: [customer name or "N/A"]
- Industry: [industry name]
- Output path: [exact DEMO_ARTIFACT_PATH]
- Expected CSV filename: [EXPECTED_CSV_FILENAME — use this EXACTLY]
- Expected enrichment filename: [EXPECTED_ENRICHMENT_FILENAME — use this EXACTLY]

DATASET SCHEMA:
- Dimensions: [list all 8 column names with their category values from the storyline]
- Measures: [list all 3 column names with descriptions from the storyline]
- date_offset: integer, range -730 to 0 (0=today)

Follow the skill's workflow completely. The skill contains all rules for naming, generation, and validation.
```

**Store the task's thread_id** as `DATASET_TASK_ID` for use in Step 15.

**⚠️ DO NOT STOP HERE.** Proceed to Step 12 (KG + Activity Feed generation). The dataset task runs in the background while you continue.