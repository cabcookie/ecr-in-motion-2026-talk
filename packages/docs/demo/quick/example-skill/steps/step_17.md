### Step 17: Append Sample Questions to Demo Script (Part 3)
- **Mode**: `agentic`
- **Tool**: `file_edit` (append to `DEMO_ARTIFACT_PATH/demo-script.md`)
- **Input**: The validated dataset from Step 16 (actual column names, dimension values, measure names) + enrichment file content
- **Output**: 3–5 tailored sample questions appended to the demo script

**This step runs AFTER dataset generation is complete**, ensuring the sample questions are grounded in real data.

1. Read the dataset CSV header and a few sample rows to understand the actual column names and dimension values
2. Read the enrichment file to understand what context is available
3. Generate 3–5 compelling natural-language questions that:
   - Use actual column names and dimension values from the dataset
   - Would produce interesting answers (leverage the date_offset for time-based queries)
   - Demonstrate different question types: trend analysis, comparison, top-N, aggregation
   - Are phrased naturally (as a real user would ask)

4. Append the questions as a numbered list to the end of `DEMO_ARTIFACT_PATH/demo-script.md`

**Example format to append:**
```markdown
### Sample Questions:
1. "What was the total [measure1] by [dimension1] over the last 6 months?"
2. "Which [dimension2] had the highest [measure2] growth last quarter?"
3. "Show me the trend of [measure3] for [specific dimension value] over the past year"
4. "Compare [measure1] across all [dimension3] categories for the last 3 months"
5. "What are the top 5 [dimension4] by [measure2] this year?"
```

**RULES:**
- Questions must reference ACTUAL column names and dimension values from the generated dataset — not generic placeholders
- Each question should demonstrate a different analytical angle
- Questions should be answerable from the dataset (don't ask about data that doesn't exist)

**⚠️ DO NOT STOP HERE.** Once this step is complete, Proceed to Step 18.