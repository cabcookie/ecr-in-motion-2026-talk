---
name: post-notification
display_name: Post Supply Chain Notification
description: "Post a single notification to the Activity Feed. Used by the simulation agent engine to deliver disruption alerts and messages. Use when told 'post supply chain notification'."
icon: "📬"
trigger: post supply chain notification
inputs:
  - name: channel
    description: "Channel type: 'email' or 'teams'"
    required: true
  - name: sender
    description: "Sender display name and address (e.g., 'Thomas Müller <thomas.mueller@aldi-sued.de>')"
    required: true
  - name: subject
    description: "Subject line (required for email, optional for teams)"
    required: false
  - name: body
    description: "Message body text"
    required: true
  - name: importance
    description: "Importance level: 'important', 'informational', or 'fyi'"
    required: false
  - name: suggested_actions
    description: "Comma-separated CTA labels (e.g., 'Antworten, Eskalieren, Ignorieren')"
    required: false
depends-on: [activity_feed]
---

## Overview

This skill posts a single notification to the Activity Feed on behalf of the simulation's agent engine. It is designed for programmatic invocation — when the simulation detects a supply chain disruption or generates a message, it invokes this skill to deliver the notification as a proactive feed item.

The skill executes in a single step with no user interaction, making it suitable for automated workflows.

## Steps

| Step | File             | Mode          | Tools                       | Purpose                                                           |
| ---- | ---------------- | ------------- | --------------------------- | ----------------------------------------------------------------- |
| 1    | steps/step_01.md | deterministic | `load_skill`, `update_feed` | Validate inputs, load activity_feed, format and post notification |
