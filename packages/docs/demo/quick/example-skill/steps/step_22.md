### Step 22: Wait for Features Presentation Task (BLOCKING GATE)
- **Mode**: `deterministic`
- **Tool**: `get_task_result` (using `PRESENTATION_TASK_ID` stored in Step 8)
- **Input**: The background task thread_id from Step 8
- **Output**: Confirmation that `amazon-quick-features.pptx` was generated successfully

**⚠️ BLOCKING GATE — You MUST NOT proceed to Step 23 until this gate passes.**

Call `get_task_result` with `PRESENTATION_TASK_ID`. Check the returned status:

- **If status = `completed`**: Gate passes. Proceed to file verification below.
- **If status = `running` or `in_progress`**: Wait 20 seconds and poll again. Repeat until resolved.
- **If status = `failed`**: Fall back to inline generation:
  1. Call `load_skill("amazon_quick_guide")` to get current feature information
  2. Categorize features into Desktop vs. Web
  3. Call `load_skill("canvas_pptx")` for presentation building instructions
  4. Build the 5-slide deck
  5. Save as `DEMO_ARTIFACT_PATH/amazon-quick-features.pptx`

**Maximum retries:** Poll up to 15 times (5 minutes total). If not completed, fall back to inline generation.

**Post-completion file verification (MANDATORY):**

Once the task completes:
1. Call `folder_list` on `DEMO_ARTIFACT_PATH`
2. Verify `amazon-quick-features.pptx` exists
3. **If missing**: Fall back to inline generation immediately

**⚠️ DO NOT STOP HERE.** Only after the gate passes AND the file exists, proceed to Step 23.