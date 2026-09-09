### Step 23: Final Summary & User Instructions (Completion Gate — LAST STEP)
- **Mode**: `deterministic`
- **Input**: All completed steps
- **Output**: Summary for the user with important operational notes AND mandatory next-step instructions (both in the SAME message)

**⚠️ COMPLETION GATE — You MUST verify ALL artifacts exist before generating the summary.**

Call `folder_list` on `DEMO_ARTIFACT_PATH` and check for ALL of the following:

1. ✅ `amazon-quick-features.pptx` — the features presentation
2. ✅ `amazon-quick-features.html` — the interactive HTML features page
3. ✅ `demo-script.md` — the demo script in markdown
4. ✅ `demo-script.docx` — the demo script in Word format
5. ✅ `sample-data-<...>.csv` — the dataset file
6. ✅ `sample-data-<...>-enrichment.txt` — the enrichment file

Also verify:
7. ✅ Activity Feed has been populated
8. ✅ Knowledge graph has been populated

**RECOVERY — If ANY file is missing, generate it before proceeding.**

Only after confirming ALL are present, generate the following summary:

> ✅ **Demo Environment Ready**
>
> **Artifacts created:**
> - amazon-quick-features.pptx — Amazon Quick features presentation (5 slides with speaker notes)
> - amazon-quick-features.html — Interactive HTML features explorer
> - demo-script.md — Full demo walkthrough (markdown)
> - demo-script.docx — Full demo walkthrough (Word document)
> - sample-data-<...>.csv — Fictitious sample dataset (~10K rows, 8 dimensions, 3 measures)
> - sample-data-<...>-enrichment.txt — Dataset enrichment metadata (field descriptions, date offset handling, analysis guidance)
>
> **Activity Feed:** [X] items populated
> **Knowledge Graph:** [X] entities, [X] relationships (includes enrichment layer for realistic graph density)
>
**⚠️ The following block between the VERBATIM markers MUST be output EXACTLY as written into your chat response — no rewording, no reformatting, no summarization, no structure changes. Copy it character-for-character. See "Lessons Learned" section above for why.**

--- BEGIN VERBATIM OUTPUT ---
> ⚠️ **IMPORTANT — Read Before Proceeding:**
>
> 1. **⚠️ Take a QuickSwitch snapshot BEFORE trying demo steps** — Go to QuickSwitch and take a snapshot of the current demo state. This is critical because if you try out the demo steps (e.g., draft an email response, generate prep notes) before taking a snapshot, the data state will change (feed items get marked as handled, new conversations are created, etc.) and **the demo state cannot be recovered for the actual demo run**. Snapshot first, then feel free to rehearse.
>
> 2. **Review the content** — Open the demo script and features deck from the "Demo Readme" conversation. Read through them to make sure the storyline, prompts, and expected results look good for your audience.
>
> 3. **Request modifications here** — If anything needs changing (names, scenarios, talking points, etc.), ask for modifications in THIS conversation. 
>
> 3. **Keep or delete this conversation** — Once you're satisfied with demo state, you can delete this conversation from the left panel. Alternatively, keeping this conversation let's you showcase the power of skills (at end of the demo).
>
> 5. **[Optional] Dataset Q&A setup** — If you plan to demo the Dataset Q&A section, follow the prep steps in the demo script (download files from My Stuff or Demo Readme session files, upload CSV on Quick Web, upload enrichment, create Space, include Space in conversation) before the live demo.
--- END VERBATIM OUTPUT ---