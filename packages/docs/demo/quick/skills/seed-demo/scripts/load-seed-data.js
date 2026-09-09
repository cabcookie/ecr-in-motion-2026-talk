// load-seed-data.js
// Reads bundled JSON data files and transforms them into the format
// required by Quick's kg_add, update_feed, and publish_day_plan tools.
// Output is assigned to session variables for subsequent skill steps.

const entities = require("../data/kg-entities.json");
const relationships = require("../data/kg-relationships.json");
const feedData = require("../data/feed-items.json");

/**
 * Computes a German relative timestamp string from a time offset.
 * @param {object} offset - { days: number, hours: number, minutes: number }
 *   For past days (days < 0), hours/minutes represent the absolute clock time on that day.
 *   For today (days === 0) with negative hours, it represents a relative offset from now.
 * @returns {string} German relative timestamp (e.g., "heute um 09:15", "gestern um 14:30", "vor 3 Tagen um 10:00")
 */
function computeRelativeTimestamp(offset) {
  const now = new Date();
  const target = new Date(now);
  target.setDate(target.getDate() + offset.days);
  target.setHours(offset.hours || 0);
  target.setMinutes(offset.minutes || 0);

  const diffMs = now - target;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = target.getHours();
  const minutes = target.getMinutes();
  const timeStr = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

  if (diffDays === 0) return `heute um ${timeStr}`;
  if (diffDays === 1) return `gestern um ${timeStr}`;
  return `vor ${diffDays} Tagen um ${timeStr}`;
}

/**
 * Computes a German relative time string for future events (Day Plan meetings).
 * @param {object} offset - { hours: number, minutes: number }
 * @returns {string} German relative future time (e.g., "in 2 Stunden", "in 30 Minuten", "jetzt")
 */
function computeRelativeTime(offset) {
  if (offset.hours > 0)
    return `in ${offset.hours} Stunde${offset.hours > 1 ? "n" : ""}`;
  if (offset.minutes > 0) return `in ${offset.minutes} Minuten`;
  return "jetzt";
}

// Transform entities into kg_add format
session.SEED_ENTITIES = [
  ...entities.people,
  ...entities.suppliers,
  ...entities.projects,
  ...entities.organizations,
].map((e) => ({
  entity_type: e.type,
  name: e.name,
  attributes: e.attributes,
}));

// Transform relationships into kg_add relationship format
session.SEED_RELATIONSHIPS = relationships.map((r) => ({
  source: r.source,
  target: r.target,
  relationship_type: r.type,
  attributes: r.attributes || {},
}));

// Transform feed items with relative timestamps
session.SEED_FEED_ITEMS = feedData.items.map((item) => ({
  channel_source: item.channel,
  sender: item.sender,
  subject: item.subject || null,
  body: item.body,
  importance: item.importance,
  timestamp: computeRelativeTimestamp(item.offset),
  cta_labels: item.ctas,
}));

// Transform day plan with relative meeting times
session.SEED_DAY_PLAN = {
  meetings: feedData.dayPlan.meetings.map((m) => ({
    title: m.title,
    time: computeRelativeTime(m.offset),
    attendees: m.attendees,
    location: m.location,
  })),
  recommendations: feedData.dayPlan.recommendations,
};
