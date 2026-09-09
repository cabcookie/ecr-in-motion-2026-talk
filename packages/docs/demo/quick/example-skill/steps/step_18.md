### Step 18: Convert Demo Script to DOCX
- **Mode**: `deterministic`
- **Tool**: `run_javascript` (using prepackaged conversion script)
- **Input**: The markdown file saved at `DEMO_ARTIFACT_PATH/demo-script.md`
- **Output**: Word document saved at `artifacts/demo-script.docx`, then copied to `DEMO_ARTIFACT_PATH/demo-script.docx`

**⚠️ PRE-CONDITION: Steps 15, 16, and 17 MUST ALL be complete before executing this step. If you have not yet waited for the dataset task, validated it, and appended sample questions, STOP and go back. The DOCX must contain the FULL script including sample questions.**

This step uses the prepackaged `md_to_docx_converter.js` script bundled with this skill. Execute it by calling `run_javascript` with `file: "scripts/md_to_docx_converter.js"` and passing variables via inline code:

```javascript
// Set these before running the script
session.MD_INPUT_PATH = '<DEMO_ARTIFACT_PATH>/demo-script.md';
session.DOCX_OUTPUT_PATH = WORKSPACE_DIR + '/artifacts/demo-script.docx';
```

Then run the script file:
```javascript
// run_javascript with file: "scripts/md_to_docx_converter.js"
```

After the script completes successfully, copy the output to the Demo Readme artifact folder:
- Use `file_copy` to copy `artifacts/demo-script.docx` to `DEMO_ARTIFACT_PATH/demo-script.docx`

**⚠️ DO NOT use `run_python_with_write` for this conversion.** The script + `file_copy` approach avoids any write permission prompts.

**⚠️ DO NOT STOP HERE.** Once this step is complete, proceed to Step 19.