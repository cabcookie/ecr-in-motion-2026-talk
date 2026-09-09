### Step 1: Search for "Demo Readme" Conversation
- **Mode**: `deterministic`
- **Tool**: `search_conversations` (from conversation_management skill)
- **Input**: Search query "Demo Readme"
- **Output**: List of matching conversations
- **Validate**: At least one conversation with the exact name "Demo Readme" is found
- **On failure**: Output the following message and STOP (do not proceed to any further steps):
  > "Demo Readme conversation not found. This skill is supposed to be run in only local demo builder state to avoid corrupting your regular Quick profile. Please use QuickSwitch to launch local demo build state and try from there"