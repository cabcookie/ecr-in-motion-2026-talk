### Step 13: Generate Demo Script — Part 1 (Acts 1–4)
- **Mode**: `agentic`
- **Tools**: `file_write`
- **Input**: Full storyline from Step 10 + populated KG (Step 12) + populated Activity Feed (Step 12b)
- **Output**: Demo script covering Acts 1–4 and the opening of the Dataset Q&A section

**⚠️ This step does NOT wait for dataset generation.** It writes the bulk of the demo script immediately after the Activity Feed is populated.

Generate the demo script with the following structure and save it to `DEMO_ARTIFACT_PATH/demo-script.md`:

```markdown
# [Customer/Industry] Demo Script

## Setup & Context
- Brief description of the demo persona and their role
- Overview of the demo narrative arc

## Act 1: [First Scenario Title]
### What the audience sees:
- Describe the Activity Feed state (list the exact items visible, in the exact order they appear in the feed)
- Describe the trigger item

### Demo Action:
- Exact prompt to use (e.g., "Draft a response to this email")
- What Quick will do (pull from which sources)

### Expected Result:
- The FULL expected response Quick will generate (write this out completely — this is your verification that enough data exists)
- Key points the response covers and where each came from

### Talking Points:
- What to highlight for the audience

## Act 2: [Second Scenario Title]
[Same structure as above]

## Act 3: [Third Scenario Title]
[Same structure as above]

## Act 4: [Fourth Scenario Title — KG Showcase]
[Same structure as above, adapted for KG showcase: Focus, Summarize, Ask]

```

**CRITICAL RULES FOR PART 1:**
1. **Feed items listed in the script MUST match the order they appear in the Activity Feed.**
2. **Every demo prompt included must yield a perfect, complete result.** Write out the full expected response in the script. If you cannot write a complete expected response, it means there is insufficient data — go back and add more KG/feed entries before finalizing the script.
3. **No placeholders, no "fill in" sections, no "[add details here]" in expected results.** Every expected result must be written out in full as if Quick generated it perfectly.
4. **Prompts must be simple and natural.** They should be the kind of thing a real user would type — not overly specific or engineered.
5. **Cross-reference check**: Every fact mentioned in an expected result must be traceable to a specific Activity Feed item or KG entity. If a fact appears in the expected result but isn't in the data, either add it to the data or remove it from the expected result.
6. **End the file after the Dataset Q&A section header and note.** Do NOT write any dataset setup instructions or sample questions — those come in Steps 14 and 17.

**Saving:** Save directly to `DEMO_ARTIFACT_PATH/demo-script.md` using `file_write` with the absolute path (overwriting the placeholder).

**⚠️ DO NOT STOP HERE.** Once this step is complete, Proceed to Step 14.