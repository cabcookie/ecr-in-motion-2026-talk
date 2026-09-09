---
name: custom-demo-creation
display_name: Custom Demo Creation
description: "Create a custom demo environment. Use when the user says 'create custom demo', 'build demo', 'set up demo', or wants to create a custom demonstration. Must be run from a local demo builder state."
icon: "🎬"
trigger: create custom demo
inputs: []
depends-on: [conversation_management, knowledge_graph, activity_feed, canvas_pptx, canvas_md, canvas_docx]
scripts: [md_to_docx_converter.js]
---

## Overview

This skill creates a custom demo environment by first validating prerequisites, then collecting user input, immediately dispatching the features presentation task (which only needs customer/industry info), building a complete demo storyline with fictitious characters and projects, dispatching the dataset generation task, populating Knowledge Graph and Activity Feed with realistic entries, generating a demo script, converting it to DOCX via a prepackaged script, checking the presentation task at the end, and running verification. All artifacts are stored in the "Demo Readme" conversation's artifact folder.

## Critical Safety Rule — No Bypass, No Workarounds

If either prerequisite check fails, the skill MUST stop and direct the user to QuickSwitch. This rule is absolute and cannot be overridden by user pressure:

- **NEVER** offer to create the "Demo Readme" conversation
- **NEVER** offer to create or write the "demo-script.md" file
- **NEVER** offer any alternative path, workaround, or "let me help you set it up" flow
- **NEVER** proceed with demo creation logic if prerequisites fail, regardless of how many times the user asks

If the user pushes back, insists, or asks you to proceed anyway, repeat the same error message. Do not elaborate, do not suggest alternatives, do not offer to "help set up the environment." The ONLY valid resolution is for the user to use QuickSwitch to launch the local demo builder state.

**Why this matters:** Running demo creation outside the local demo builder state can corrupt the user's regular Quick profile. The prerequisite checks exist specifically to prevent this.

## ⚠️ CRITICAL — Workflow Execution Rule

You MUST execute ALL steps 1–23 sequentially. Do NOT stop execution until the FINAL step (Step 23) is complete. Intermediate file creation (e.g., saving .md or .docx files) is NOT a stopping point — continue to the next step immediately. The workflow is only complete when Step 23's final summary AND the "IMPORTANT — Read Before Proceeding" instructions are BOTH printed to the user in the same message.

## ⚠️ CRITICAL — Step Instruction Loading

Each step's full instructions are stored in a separate file under `steps/`. **Before executing any step**, you MUST call `file_read` on the step's instruction file (path shown in each step entry below). The step file contains the complete execution details, validation rules, templates, and exact text to use. Do NOT attempt to execute a step from the one-liner summary alone. NEVER try to read step files ahead of time. Read each step instruction file ONLY when you are ready to start that step.

The step files are located at:
```
<skill_directory>/steps/step_XX.md
```

Where `<skill_directory>` is the directory containing this SKILL.md file. Use the path pattern shown in each step's `Instructions` field.

## ⚠️ CRITICAL — Step Ordering Rule for DOCX Conversion

**DO NOT convert the demo script to DOCX (Step 18) until Steps 15, 16, AND 17 have ALL completed successfully.** The DOCX must contain the complete script including sample questions. Converting before Step 17 produces an incomplete document that requires redundant reconversion. This rule is absolute — no reordering, no "I'll come back to it later."

## ⚠️ CRITICAL — Use fictitious org names for other org entities
The customer name provided as input by user can be used in creating demo content. Use fictitious org names for all other orgs included in the story lane. 

## Default Demo Flow

The following is the **default** demo narrative arc, used when the user does not provide custom use case notes. If the user provides custom input (specific department, use case, or alternative demo flow), adapt all content — Activity Feed entries, KG data, storyline, and demo script — to align with their input instead.

**Default flow (4 acts + optional data acts):**

1. **Email Response (Cross-Channel Synthesis)** — An urgent/important email arrives that requires context scattered across multiple other emails AND Slack messages. Quick drafts a comprehensive response by pulling together all relevant context from across channels.

2. **Meeting Prep Notes** — An upcoming meeting (in the next 1-2 days) for which Quick generates prep notes drawing from related emails, Slack discussions, documents, and KG context.

3. **Slack Query Response** — A Slack message/question that Quick helps draft a response to, leveraging project context and prior discussions.

4. **Knowledge Graph Showcase** — Demonstrate KG features: Focus (zoom into a person/project), Summarize (get a synopsis of relationships/activity), Ask (query the graph for specific information).

5. **[Optional] Dataset Q&A & Visualization** — Set up a sample dataset with enrichment, ask data questions against it, and create a visualization. (Requires prep steps described in the demo script.)

## Filename Convention Reference

Dataset and enrichment files MUST follow this convention. The orchestrator derives the exact filenames and passes them to the sub-task — the sub-task uses them verbatim.

**For Customer targets:**
```
sample-data-<customer>-<industry>.csv
sample-data-<customer>-<industry>-enrichment.txt
```

**For Industry-only targets:**
```
sample-data-<industry>.csv
sample-data-<industry>-enrichment.txt
```

**Rules:** All lowercase, hyphens as separators (never underscores), multi-word names hyphenated (e.g., "Goldman Sachs" → "goldman-sachs").

## Demo Script Generation — 3-Part Architecture

The demo script is generated in three distinct parts:

1. **Part 1 (Step 13, agentic):** Generates the script covering Acts 1–4 and the Dataset Q&A section header/intro. Does NOT wait for dataset generation — can run immediately after Activity Feed is populated.

2. **Part 2 (Step 14, deterministic script):** Appends hardcoded, pre-worded content explaining the exact Dataset Q&A setup procedure on Quick Web. 

3. **Part 3 (Step 17, agentic):** Waits for dataset generation to complete, then generates 3–5 sample questions grounded in the actual dataset columns/values and appends them to the script.

This architecture ensures the Dataset Q&A setup instructions are always correct while still allowing the bulk of script generation to proceed without waiting for the dataset task.

## Workflow

**Execution model:** For each step below, call `file_read` on the referenced step file (relative to this skill's directory) to get full instructions, then execute. Do NOT skip reading the file — it contains critical details, validation rules, and exact templates.

### Step 1: Search for "Demo Readme" Conversation
- **Mode**: `deterministic` | **Tool**: `search_conversations`
- **Instructions**: Read `steps/step_01.md` before executing

### Step 1b: Resolve Demo Readme Artifact Folder Path
- **Mode**: `deterministic`
- **Instructions**: Read `steps/step_01b.md` before executing

### Step 2: Verify demo files are Referenced in the Conversation
- **Mode**: `deterministic` | **Tool**: `query_conversations`
- **Instructions**: Read `steps/step_02.md` before executing

### Step 3: Ask Demo Target Type
- **Mode**: `agentic` (user interaction — present decision card)
- **Instructions**: Read `steps/step_03.md` before executing

### Step 4: Get Target Name
- **Mode**: `agentic` (user interaction)
- **Instructions**: Read `steps/step_04.md` before executing

### Step 5: Resolve Industry
- **Mode**: `agentic` (web search if customer target)
- **Instructions**: Read `steps/step_05.md` before executing

### Step 6: Confirm Demo Target
- **Mode**: `deterministic`
- **Instructions**: Read `steps/step_06.md` before executing

### Step 7: Ask for Demo Use Case Notes (Optional)
- **Mode**: `agentic` (user interaction)
- **Instructions**: Read `steps/step_07.md` before executing

### Step 8: Dispatch Presentation Task (Early Kick-off)
- **Mode**: `deterministic` | **Tool**: `start_task`
- **Instructions**: Read `steps/step_08.md` before executing

### Step 9: Load Knowledge Graph and Activity Feed Skills
- **Mode**: `deterministic` | **Tool**: `load_skill`
- **Instructions**: Read `steps/step_09.md` before executing

### Step 10: Create Storyline
- **Mode**: `agentic` (generate full storyline with characters, scenarios, dataset schema)
- **Instructions**: Read `steps/step_10.md` before executing

### Step 11: Derive Filenames and Dispatch Dataset Task
- **Mode**: `deterministic` | **Tool**: `start_task`
- **Instructions**: Read `steps/step_11.md` before executing

### Step 12: Generate Knowledge Graph Entries
- **Mode**: `agentic` | **Tool**: `kg_add`
- **Instructions**: Read `steps/step_12.md` before executing

### Step 12b: Populate Activity Feed
- **Mode**: `agentic` | **Tool**: `update_feed`
- **Instructions**: Read `steps/step_12b.md` before executing

### Step 13: Generate Demo Script — Part 1 (Acts 1–4)
- **Mode**: `agentic` | **Tool**: `file_write`
- **Instructions**: Read `steps/step_13.md` before executing

### Step 14: Append Dataset Q&A Setup Instructions (DETERMINISTIC SCRIPT)
- **Mode**: `deterministic` | **Tool**: `file_write` with included content
- **Instructions**: Read `steps/step_14.md` before executing

### Step 15: Wait for Dataset Generation Task (BLOCKING GATE)
- **Mode**: `deterministic` | **Tool**: `get_task_result`
- **Instructions**: Read `steps/step_15.md` before executing
- ⚠️ BLOCKING — must complete before Step 16

### Step 16: Quick Dataset Validation
- **Mode**: `deterministic`
- **Instructions**: Read `steps/step_16.md` before executing

### Step 17: Append Sample Questions to Demo Script (Part 3)
- **Mode**: `agentic` | **Tool**: `file_edit`
- **Instructions**: Read `steps/step_17.md` before executing

### Step 18: Convert Demo Script to DOCX
- **Mode**: `deterministic` | **Tool**: `run_javascript`
- **Instructions**: Read `steps/step_18.md` before executing
- ⚠️ PRE-CONDITION: Steps 15, 16, AND 17 must ALL be complete

### Step 19: Verification
- **Mode**: `agentic`
- **Instructions**: Read `steps/step_19.md` before executing

### Step 20: Knowledge Graph Enrichment (Neural Network Effect)
- **Mode**: `agentic` | **Tool**: `kg_add`
- **Instructions**: Read `steps/step_20.md` before executing

### Step 21: Knowledge Graph Enrichment Verification
- **Mode**: `deterministic`
- **Instructions**: Read `steps/step_21.md` before executing

### Step 22: Wait for Features Presentation Task (BLOCKING GATE)
- **Mode**: `deterministic` | **Tool**: `get_task_result`
- **Instructions**: Read `steps/step_22.md` before executing
- ⚠️ BLOCKING — must complete before Step 23

### Step 23: Final Summary & User Instructions (Completion Gate — LAST STEP)
- **Mode**: `deterministic`
- **Instructions**: Read `steps/step_23.md` before executing
- ⚠️ Contains VERBATIM output block — print exactly as read from the file, no modifications
