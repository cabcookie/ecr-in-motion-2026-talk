### Step 2: Verify demo files are Referenced in the Conversation
- **Mode**: `deterministic`
- **Tool**: `query_conversations` (from conversation_management skill)
- **Input**: Query the Demo Readme conversation (using the conversation/session ID found in Step 1) for messages that reference "demo-script.md", "demo-script.docx", "amazon-quick-features.pptx" and "amazon-quick-features.html"
- **Output**: Messages from the conversation that mention all four files
- **Validate**: At least one message in the conversation contains a reference to  all four files - "demo-script.md", "demo-script.docx", "amazon-quick-features.pptx" and "amazon-quick-features.html" (e.g., a `qw-file://` link, a markdown mention, or any text reference to the filename)
- **On failure**: If no messages reference these files in the conversation, output the following message and STOP (do not proceed to any further steps):
  > "Placeholder demo content files were not found. Seems like you are not running this skill from the correct local demo build environment. Please use QuickSwitch to launch local demo build state and try again."

**RULES for Step 2:**
- Use `query_conversations` to search within the Demo Readme conversation for reference to "demo-script.md", "demo-script.docx", "amazon-quick-features.pptx" and "amazon-quick-features.html"
- Any mention of the filename in conversation messages (qw-file links, text references) counts as valid evidence for each file.
- All four files mentioned above should be referenced in the conversation for this check to pass.
- Do NOT use `file_read` to check the file on disk — the files do not exist on disk yet.