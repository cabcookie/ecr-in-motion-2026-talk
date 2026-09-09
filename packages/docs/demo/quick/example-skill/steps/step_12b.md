### Step 12b: Populate Activity Feed
- **Mode**: `agentic`
- **Tools**: Activity Feed tools (from loaded skill)
- **Input**: Storyline from Step 10 + Activity Feed plan
- **Output**: Populated Activity Feed with realistic items + Day Plan card

Create Activity Feed items matching the storyline's plan. The feed should look like a realistic, active inbox — not just the minimum items needed for the demo acts.
## ⚠️ CRITICAL — Do not use any hardcoded date references. 
Once the demo is generated, it's current state will be saved for future reuse. Including hard coded physical dates (full or partial like year, quarter, month etc) will cause the demo to get stale. Do NOT use end/start of year, Quarter n, Qn, nth Quarter as well. Instead, USE relative references - 2 weeks from now, 3 months out,  next quarter, 3 quarters from now etc. 

**Quantity requirement: 11-13 total feed items (including Day Plan)**

**Ordering & priority rules:**
- The **top 3 items** (created last, so they appear at the top) MUST be the demo-critical items referenced in the demo script (Acts 1-3). These are the items with CTAs that the presenter will click during the demo.
- Before creating the top 3, first create **7-9 background filler items** to create the impression of an active workday. These appear below the demo items in the feed.
- Finally, publish a **Day Plan card** using `publish_day_plan` showing the demo persona's calendar for the day.

**Background filler items should include a realistic mix of:**
- Slack messages from supporting cast about project updates, technical issues resolved, quick questions
- Emails about administrative topics (HR updates, contract items, cross-team requests, document reviews)
- Mix of importance levels (mostly `fyi`, occasionally one `important`)
- Each should have at least one CTA choice button
- Content should be plausible for the persona's role and reference real storyline characters/projects

**Day Plan card requirements:**
Use `publish_day_plan` with:
- At minimum, include the meeting from the demo storyline (e.g., the meeting referenced in Act 2)
- Add 2-3 other fictional meetings to make the calendar look realistic (e.g., a 1:1, a standup, a cross-functional sync)
- Include at least 1 recommendation (e.g., prep reminder for the demo meeting, a focus time block suggestion, or a conflict alert)

**Creation order (IMPORTANT — feed shows most recent on top):**
1. First: Create 7-9 background filler items
2. Then: Publish the Day Plan card
3. Last: Create the 3 demo-critical items (so they appear at the TOP of the feed)

The feed items ARE the data source for demo acts 1-3. Every fact that appears in an expected demo response must be traceable to a feed item or KG entity.
