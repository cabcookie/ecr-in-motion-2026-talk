### Step 15: Wait for Dataset Generation Task (BLOCKING GATE)
- **Mode**: `deterministic`
- **Tool**: `get_task_result` (using `DATASET_TASK_ID` stored in Step 11)
- **Input**: The background task thread_id from Step 11
- **Output**: Confirmation that dataset and enrichment files were generated successfully

**⚠️ BLOCKING GATE — You MUST NOT proceed to Step 16 until this gate passes. You MUST NOT skip ahead to Step 18 (DOCX conversion) or any later step. The DOCX conversion requires the COMPLETE markdown file including sample questions from Step 17. Proceeding out of order produces an incomplete document.**

Call `get_task_result` with `DATASET_TASK_ID`. Check the returned status:

- **If status = `completed`**: Gate passes. Proceed to Step 16.
- **If status = `running` or `in_progress`**: Wait 20 seconds and poll again. Repeat until resolved.
- **If status = `failed`**: Attempt inline generation — generate the dataset CSV (~10K rows) and enrichment TXT directly using `run_python_with_write`, following the same schema from the storyline.

**Maximum retries:** Poll up to 15 times (5 minutes total). If not completed after 15 polls, fall back to inline generation.