### Step 14: Append Dataset Q&A Setup Instructions (DETERMINISTIC SCRIPT)
- **Mode**: `deterministic`
- **Tool**: `file_write`
- **Input**: Demo script path + derived names from Step 11
- **Output**: Hardcoded dataset setup instructions appended to the demo script

**⚠️ PRE-CONDITION — Step 13 MUST be complete before this step runs.** 

**⚠️ The following block between the VERBATIM markers MUST be appended EXACTLY as written to the demo-script file — no rewording, no reformatting, no summarization, no structure changes. Copy it character-for-character. This append must be done with `file_write`. Do NOT try to use `run python with write option` for this.**

--- BEGIN VERBATIM OUTPUT ---
## [Optional] Act 5: Dataset Q&A & Visualization

> **Note:** This section is optional. It requires setup steps below before it can be demonstrated.

### Prep Steps (complete before demo):

> ⚠️ These steps use **Amazon Quick Web** (not Desktop). The dataset is uploaded and queried through Quick Web's Space and dataset features.

1. Click on **My Stuff** and download these two files to your local machine:
   - \`${csvFilename}\` (the sample dataset)
   - \`${enrichmentFilename}\` (the enrichment metadata)
2. Open **Amazon Quick Web** in your browser and login to **quicksight-sales-demo** account.  
3. Create a dataset (upload file option) using the \`${csvFilename}\` file.  
4. In the edit dataset view, select output tab and upload \`${enrichmentFilename}\` under custom instructions. 
5. Navigate to **Spaces** → **Create Space** → name it \`${spaceName}\`
6. In the Space, click **Add Knowledge** → **Datasets** → Choose the dataset created above.
7. The Space is now ready and can be used from Quick desktop to ask data questions

### How to demo Dataset Q&A:

1. In Quick desktop, start a **new conversation**
2. Click the **"+" button** to include the \`${spaceName}\` Space in the conversation
3. With the Space active in the conversation, ask natural language questions about the data (see sample questions below)
4. Quick will query the dataset and return answers with accurate date calculations (thanks to the enrichment file)
--- END VERBATIM OUTPUT ---

**⚠️ DO NOT STOP HERE.** Once this step is complete, proceed to Step 15.