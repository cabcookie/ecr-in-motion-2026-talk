// load-seed-data.mjs
// Reads bundled JSON data files and transforms them into the format
// required by Quick's kg_add, update_feed, and publish_day_plan tools.
// Output is assigned to session variables for subsequent skill steps.
//
// NOTE: This script runs in Quick's sandboxed JavaScript runtime.
// Quick provides readFile() as a global function to access bundled data files.

const entities = JSON.parse(readFile("data/kg-entities.json"));
const relationships = JSON.parse(readFile("data/kg-relationships.json"));
const feedData = JSON.parse(readFile("data/feed-items.json"));

/**
 * Computes a German relative timestamp string from a time offset.
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
  const timeStr =
    String(hours).padStart(2, "0") + ":" + String(minutes).padStart(2, "0");

  if (diffDays === 0) return "heute um " + timeStr;
  if (diffDays === 1) return "gestern um " + timeStr;
  return "vor " + diffDays + " Tagen um " + timeStr;
}

/**
 * Computes a German relative time string for future events.
 */
function computeRelativeTime(offset) {
  if (offset.hours > 0)
    return "in " + offset.hours + " Stunde" + (offset.hours > 1 ? "n" : "");
  if (offset.minutes > 0) return "in " + offset.minutes + " Minuten";
  return "jetzt";
}

// Transform entities into kg_add format
session.SEED_ENTITIES = []
  .concat(
    entities.people,
    entities.suppliers,
    entities.projects,
    entities.organizations,
  )
  .map(function (e) {
    return { entity_type: e.type, name: e.name, attributes: e.attributes };
  });

// Transform relationships into kg_add relationship format
session.SEED_RELATIONSHIPS = relationships.map(function (r) {
  return {
    source: r.source,
    target: r.target,
    relationship_type: r.type,
    attributes: r.attributes || {},
  };
});

// Transform feed items with relative timestamps and short summaries
session.SEED_FEED_ITEMS = feedData.items.map(function (item) {
  var sentences = item.body
    .split(/[.\n]/)
    .map(function (s) {
      return s.trim();
    })
    .filter(function (s) {
      return s.length > 15;
    });
  var summary = sentences.length > 0 ? sentences[0] : item.body.slice(0, 120);

  return {
    channel_source: item.channel,
    sender: item.sender,
    subject: item.subject || null,
    body: summary,
    importance: item.importance,
    timestamp: computeRelativeTimestamp(item.offset),
    cta_labels: item.ctas,
  };
});

// Transform day plan with relative meeting times
session.SEED_DAY_PLAN = {
  meetings: feedData.dayPlan.meetings.map(function (m) {
    return {
      title: m.title,
      time: computeRelativeTime(m.offset),
      attendees: m.attendees,
      location: m.location,
    };
  }),
  recommendations: feedData.dayPlan.recommendations,
};
