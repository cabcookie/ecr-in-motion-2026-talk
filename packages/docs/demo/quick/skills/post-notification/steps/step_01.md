# Step 1: Validate, Format, and Post Notification

## Mode

deterministic

## Tools

- `load_skill`
- `update_feed`

## Instructions

### 1. Validate Required Inputs

Check that the following required inputs are present:

- `channel` — must be provided and must be "email" or "teams"
- `sender` — must be provided (non-empty string)
- `body` — must be provided (non-empty string)

If any required field is missing, report an error:
"Missing required input: {field_name}. Cannot post notification."
Do NOT call `update_feed`. Stop execution.

If `channel` is not "email" or "teams", report an error:
"Invalid channel '{value}'. Must be 'email' or 'teams'."
Do NOT call `update_feed`. Stop execution.

### 2. Load Activity Feed Skill

Call `load_skill("activity_feed")`

If loading fails, report: "Activity Feed skill not available." Stop execution.

### 3. Map and Format the Notification

**Channel mapping:**

- Input "email" → `channel_source`: "outlook"
- Input "teams" → `channel_source`: "teams"

**Importance mapping:**

- "important" → "important"
- "informational" → "fyi"
- "fyi" → "fyi"
- undefined/missing → "fyi"

**CTA labels:**

- If `suggested_actions` is provided: split by comma, trim whitespace from each → `cta_labels` array
- If `suggested_actions` is empty or not provided: `cta_labels` = []

**Format the feed item:**

- `channel_source`: mapped channel value
- `sender`: input.sender (as-is)
- `subject`: input.subject or null
- `body`: input.body
- `importance`: mapped importance value
- `timestamp`: "gerade eben"
- `cta_labels`: processed CTA labels array

### 4. Post to Activity Feed

Call `update_feed` with the formatted feed item.

No user interaction is required. This step completes the entire skill execution.
