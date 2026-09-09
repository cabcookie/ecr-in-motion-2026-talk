### Step 16: Quick Dataset Validation
- **Mode**: `deterministic`
- **Input**: The dataset CSV file at `DEMO_ARTIFACT_PATH`
- **Output**: Confirmation that the dataset meets quality requirements

Validate:
1. File exists at `DEMO_ARTIFACT_PATH/[EXPECTED_CSV_FILENAME]`
2. Has approximately 10,000 rows (±500)
3. Has exactly 11 columns (8 dimensions + 3 measures) + date_offset = 12 total, OR 11 if date_offset is counted as one of the dimensions
4. The `date_offset` column ranges approximately from -730 to 0
5. All three measure columns show positive values

If validation fails, report the issue and attempt to fix inline.