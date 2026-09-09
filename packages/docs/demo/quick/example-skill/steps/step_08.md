### Step 8: Dispatch Presentation Task (Early Kick-off)
- **Mode**: `deterministic`
- **Tool**: `start_task`
- **Input**: Demo target info from Step 6 + `DEMO_ARTIFACT_PATH` from Step 1b
- **Output**: Running background task for features presentation

The presentation only needs customer/industry info (no storyline, no characters, no demo acts). Dispatch it now so it runs in the background while the storyline and other heavy work proceed.

Call `start_task` with:
- `tools`: `"all"` (sub-task needs `load_skill("demo-presentation-generation")` + `load_skill("amazon_quick_guide")` + `load_skill("canvas_pptx")`)
- `mode`: `"continue_then_receive"`
- `share_workspace`: `true`

**Objective template:**
```
Load the `demo-presentation-generation` skill by calling load_skill("demo-presentation-generation") and follow its instructions to generate the Amazon Quick features presentation.

PARAMETERS:
- Customer: [customer name or "N/A"]
- Industry: [industry name]
- Output path: [exact DEMO_ARTIFACT_PATH]
- Output filenames: amazon-quick-features.pptx and amazon-quick-features.html (EXACTLY these names)

Follow the skill's workflow completely.
```

**Store the task's thread_id** as `PRESENTATION_TASK_ID` for use in Step 22.

**⚠️ DO NOT STOP HERE.** Proceed to Step 9.