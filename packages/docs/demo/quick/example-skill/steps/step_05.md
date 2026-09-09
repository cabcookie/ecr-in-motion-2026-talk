### Step 5: Resolve Industry
- **Mode**: `agentic`
- **Input**: Target type and target name from Steps 3–4
- **Output**: Confirmed industry name

**If target type is Customer:**
1. Perform a web search to determine what industry the customer operates in
2. Present your finding to the user and ask them to confirm. For example:
   > "Based on my research, [Customer Name] appears to be in the **[Industry]** industry. Is that correct?"
3. If the web search doesn't yield clear results, tell the user you couldn't determine the industry and ask them to provide it manually
4. Wait for user confirmation or correction

**If target type is Industry:**
- The industry is already known from Step 4 — no web search needed. Proceed directly.