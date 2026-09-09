# Step 5: Populate Activity Feed Items

## Mode

deterministic

## Tools

- `update_feed`

## Instructions

Iterate over `session.SEED_FEED_ITEMS` and post each item to the Activity Feed:

For each item in `session.SEED_FEED_ITEMS`:

1. Call `update_feed` with:
   - `channel_source`: item.channel_source
   - `sender`: item.sender
   - `subject`: item.subject
   - `body`: item.body
   - `importance`: item.importance
   - `timestamp`: item.timestamp
   - `cta_labels`: item.cta_labels

This posts 8–12 feed items with:

- A mix of Outlook emails and Teams messages
- Internal (ALDI SUED) and external (supplier) senders
- 1–2 items marked as "important", the rest as "fyi"
- At least one CTA per item
- German-language supply chain content
- Relative timestamps (no absolute dates)

If `update_feed` fails for a single item, log a warning, skip that item, and continue. Report the count of skipped items at the end.
