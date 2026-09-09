### Step 1b: Resolve Demo Readme Artifact Folder Path
- **Mode**: `deterministic`
- **Input**: The session/conversation ID returned by `search_conversations` in Step 1 for the "Demo Readme" conversation
- **Output**: An absolute filesystem path to the Demo Readme conversation's artifact folder, stored as `DEMO_ARTIFACT_PATH`
- **Validate**: `DEMO_ARTIFACT_PATH` is well formed.
- **On failure**: Output the following message and STOP (do not proceed to any further steps):
  > "Demo artifact path to the Demo Readme conversation couldn't be generated. Please try again later."

Construct the absolute path using this pattern:
```
~/.quickwork/profiles/<profile_id>/sessions/<demo_readme_session_id>/workspace/artifacts/
```

Where:
- `<profile_id>` is the current profile directory name 
- `<demo_readme_session_id>` is the session ID from the "Demo Readme" conversation found in Step 1

**Store this resolved path as `DEMO_ARTIFACT_PATH`.** All subsequent steps that save files MUST use this exact path. Do NOT write to the current session's workspace and copy later — always write directly to `DEMO_ARTIFACT_PATH`.

Verify the path exists by calling `folder_list` on it. If the folder doesn't exist, create it with `folder_create`.