### Step 10: Create Storyline
- **Mode**: `agentic`
- **Input**: Confirmed demo target from Step 6 + demo use case notes from Step 7 (if any) + schema knowledge from Step 9
- **Output**: A detailed storyline document structured around the chosen demo flow

Build a complete demo storyline that includes:

1. **Central Character** — A fictitious person (with realistic name, job title, department, and company context) who will be the demo persona. This person is NOT the user — they are a character the user will "play" during the demo.

2. **Supporting Cast** — 4-8 other fictitious characters who interact with the central character (managers, team members, cross-functional partners, external contacts). Each should have a name, title, and relationship to the central character.

3. **Scenario Narratives** — For each demo act, write a detailed narrative including:
   - The specific situation/trigger
   - What data exists across channels (emails, Slack messages, meetings)
   - What the demo prompt will be
   - What the expected output should cover

4. **Dataset Schema** — Define the columns for the sample dataset:
   - 8 dimension columns (categorical — with specific category values listed)
   - 3 measure columns (numerical — with descriptions of what they represent)
   - 1 date_offset column (integer, -730 to 0)
   - The dataset should be relevant to the target industry/customer

5. **Activity Feed Plan** — List exactly which items should appear in the Activity Feed, in what order, with enough detail to create them.