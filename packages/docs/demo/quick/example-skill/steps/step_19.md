### Step 19: Verification
- **Mode**: `agentic`
- **Input**: All generated artifacts (Activity Feed, KG entries, demo script, dataset, enrichment file)
- **Output**: Verification report confirming consistency and completeness

Perform a thorough check of all generated content:

1. **Feed-Script Consistency**: Verify that every Activity Feed item referenced in the demo script exists in the feed and appears in the same order
2. **Data Completeness**: For each demo prompt in the script, verify that all facts in the expected result can be traced to KG entities or Activity Feed items
3. **No Gaps**: Confirm that no expected result in the script contains placeholders, blanks, or "fill in" instructions
4. **KG Coverage**: Verify the Knowledge Graph has sufficient entities and relationships for all demo scenarios
5. **Dataset Validation**: Verify that the sample dataset CSV exists at `DEMO_ARTIFACT_PATH` with the correct naming convention, contains approximately 10,000 rows, has exactly 11 columns, the `date_offset` column spans approximately -730 to 0, and all three measures show a positive overall trend
6. **Enrichment File Validation**: Verify that the enrichment TXT file exists with the correct naming convention (matching the CSV base name + `-enrichment.txt`), includes descriptions of all 11 columns, contains the `date_offset` handling instructions, and **contains ZERO hard-coded calendar dates**
7. **Filename Convention Check**: Verify that BOTH filenames follow the exact convention. All lowercase, hyphens, no underscores or CamelCase.
8. **Dataset Q&A Section Check**: Verify that the demo script's Dataset Q&A section describes the Quick Web upload workflow (upload CSV, upload enrichment, create Space, include Space in conversation) and does NOT reference file indexing, `index_directory`, `register_file_for_rag`, or adding files directly to chat.
9. **Sample Questions Check**: Verify the sample questions at the end of the script use actual column names and dimension values from the generated dataset.

If any issue is found, fix it immediately. Do NOT proceed until all checks pass.

> ✅ Verification complete — all demo data is consistent and complete.

Proceed directly to Step 20.