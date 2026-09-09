import fc from "fast-check";
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ENTITIES_PATH = resolve(
  __dirname,
  "../../../../../skills/seed-demo/data/kg-entities.json",
);
const FEED_ITEMS_PATH = resolve(
  __dirname,
  "../../../../../skills/seed-demo/data/feed-items.json",
);

const RELATIONSHIPS_PATH = resolve(
  __dirname,
  "../../../../../skills/seed-demo/data/kg-relationships.json",
);

const entities = JSON.parse(readFileSync(ENTITIES_PATH, "utf-8"));
const feedData = JSON.parse(readFileSync(FEED_ITEMS_PATH, "utf-8"));
const relationships = JSON.parse(readFileSync(RELATIONSHIPS_PATH, "utf-8"));

/**
 * **Validates: Requirements 2.4, 3.3**
 *
 * Property 2: Email Domain Invariant
 *
 * For all person entities with company "ALDI SUED": email ends with @aldi-sued.de
 * For all supplier entities: contact_email does NOT end with @aldi-sued.de
 */
describe("Property 2: Email Domain Invariant", () => {
  it("all ALDI SUED person entities have email ending with @aldi-sued.de", () => {
    fc.assert(
      fc.property(fc.constantFrom(...entities.people), (person: any) => {
        if (person.attributes.company === "ALDI SUED") {
          expect(person.attributes.email).toMatch(/@aldi-sued\.de$/);
        }
      }),
    );
  });

  it("no supplier entity has contact_email ending with @aldi-sued.de", () => {
    fc.assert(
      fc.property(fc.constantFrom(...entities.suppliers), (supplier: any) => {
        expect(supplier.attributes.contact_email).not.toMatch(
          /@aldi-sued\.de$/,
        );
      }),
    );
  });
});

/**
 * **Validates: Requirements 7.2, 7.3**
 *
 * Property 10: Day Plan Structure
 *
 * For any generated Day Plan, the meetings array SHALL contain at least 3 entries
 * and the recommendations array SHALL contain at least 1 entry.
 */
describe("Property 10: Day Plan Structure", () => {
  it("day plan meetings array has at least 3 entries", () => {
    expect(feedData.dayPlan).toBeDefined();
    expect(feedData.dayPlan.meetings.length).toBeGreaterThanOrEqual(3);
  });

  it("day plan recommendations array has at least 1 entry", () => {
    expect(feedData.dayPlan.recommendations.length).toBeGreaterThanOrEqual(1);
  });

  it("each meeting has required fields: title, offset, attendees, location", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...feedData.dayPlan.meetings),
        (meeting: any) => {
          expect(meeting).toHaveProperty("title");
          expect(meeting).toHaveProperty("offset");
          expect(meeting).toHaveProperty("attendees");
          expect(Array.isArray(meeting.attendees)).toBe(true);
          expect(meeting).toHaveProperty("location");
        },
      ),
    );
  });
});

/**
 * **Validates: Requirements 5.5**
 *
 * Property 5: Relationship Density
 *
 * For any execution of the seed data transformation, the output SHALL contain
 * at least 15 KG relationships.
 */
describe("Property 5: Relationship Density", () => {
  it("seed data contains at least 15 relationships", () => {
    expect(relationships.length).toBeGreaterThanOrEqual(15);
  });

  it("relationships cover all required types", () => {
    const types = new Set(relationships.map((r: any) => r.type));
    expect(types.has("part_of")).toBe(true);
    expect(types.has("works_on")).toBe(true);
    expect(types.has("supplies_to")).toBe(true);
    expect(types.has("collaborates_with")).toBe(true);
  });
});

/**
 * **Validates: Requirements 6.2, 6.3**
 *
 * Property 7: Feed Channel and Sender Diversity
 *
 * For any generated set of feed items, the set SHALL contain at least one item
 * with channel "outlook" and at least one with channel "teams", AND at least one
 * item from a sender with @aldi-sued.de and at least one from a sender without.
 */
describe("Property 7: Feed Channel and Sender Diversity", () => {
  it("at least one outlook and one teams channel item exists", () => {
    const channels = feedData.items.map((item: any) => item.channel);
    expect(channels).toContain("outlook");
    expect(channels).toContain("teams");
  });

  it("at least one internal (@aldi-sued.de) and one external sender", () => {
    const senders = feedData.items.map((item: any) => item.sender);
    const hasInternal = senders.some((s: string) =>
      s.includes("@aldi-sued.de"),
    );
    const hasExternal = senders.some(
      (s: string) => !s.includes("@aldi-sued.de"),
    );
    expect(hasInternal).toBe(true);
    expect(hasExternal).toBe(true);
  });
});

/**
 * **Validates: Requirements 2.2**
 *
 * Property 3: User Exclusion — No Markus Weber Entity
 *
 * For any KG entity in the seed data output, the entity's name SHALL NOT be
 * "Markus Weber" and its email SHALL NOT be "markus.weber@aldi-sued.de".
 */
describe("Property 3: User Exclusion — No Markus Weber Entity", () => {
  const allEntities = [
    ...entities.people,
    ...entities.suppliers,
    ...entities.projects,
    ...entities.organizations,
  ];

  it("no entity has name 'Markus Weber'", () => {
    fc.assert(
      fc.property(fc.constantFrom(...allEntities), (entity: any) => {
        expect(entity.name).not.toBe("Markus Weber");
      }),
    );
  });

  it("no entity has email 'markus.weber@aldi-sued.de'", () => {
    fc.assert(
      fc.property(fc.constantFrom(...allEntities), (entity: any) => {
        if (entity.attributes.email) {
          expect(entity.attributes.email).not.toBe("markus.weber@aldi-sued.de");
        }
        if (entity.attributes.contact_email) {
          expect(entity.attributes.contact_email).not.toBe(
            "markus.weber@aldi-sued.de",
          );
        }
      }),
    );
  });
});

/**
 * **Validates: Requirements 6.4**
 *
 * Property 8: Feed Importance Distribution
 *
 * For any generated set of feed items, exactly 1 or 2 items SHALL have
 * importance "important" and all remaining items SHALL have importance "fyi".
 */
describe("Property 8: Feed Importance Distribution", () => {
  it("exactly 1 or 2 items have importance 'important', all others 'fyi'", () => {
    const importantItems = feedData.items.filter(
      (item: any) => item.importance === "important",
    );
    const fyiItems = feedData.items.filter(
      (item: any) => item.importance === "fyi",
    );

    expect(importantItems.length).toBeGreaterThanOrEqual(1);
    expect(importantItems.length).toBeLessThanOrEqual(2);
    expect(importantItems.length + fyiItems.length).toBe(feedData.items.length);
  });
});

/**
 * **Validates: Requirements 6.5**
 *
 * Property 9: Feed Item CTA Presence
 *
 * For any feed item in the generated output, the ctas array SHALL have a length
 * of at least 1.
 */
describe("Property 9: Feed Item CTA Presence", () => {
  it("every feed item has at least 1 CTA in its ctas array", () => {
    fc.assert(
      fc.property(fc.constantFrom(...feedData.items), (item: any) => {
        expect(item.ctas).toBeDefined();
        expect(Array.isArray(item.ctas)).toBe(true);
        expect(item.ctas.length).toBeGreaterThanOrEqual(1);
      }),
    );
  });
});

/**
 * **Validates: Requirements 6.1**
 *
 * Property 6: Feed Item Count Bounds
 *
 * For any execution of the seed data transformation, the output SHALL contain
 * between 8 and 12 feed items (inclusive).
 */
describe("Property 6: Feed Item Count Bounds", () => {
  it("feed items count is between 8 and 12 inclusive", () => {
    expect(feedData.items.length).toBeGreaterThanOrEqual(8);
    expect(feedData.items.length).toBeLessThanOrEqual(12);
  });
});

/**
 * **Validates: Requirements 8.1, 8.2, 8.3, 8.4**
 *
 * Property 4: No Absolute Dates in Generated Content
 *
 * For any text field in the generated output, the text SHALL NOT contain
 * patterns matching absolute dates.
 */
describe("Property 4: No Absolute Dates in Generated Content", () => {
  // Re-implement the transformation logic from load-seed-data.js for testing
  function computeRelativeTimestamp(offset: {
    days: number;
    hours: number;
    minutes: number;
  }): string {
    const now = new Date();
    const target = new Date(now);
    target.setDate(target.getDate() + offset.days);
    target.setHours(offset.hours || 0);
    target.setMinutes(offset.minutes || 0);

    const diffMs = now.getTime() - target.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = target.getHours();
    const minutes = target.getMinutes();
    const timeStr = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

    if (diffDays === 0) return `heute um ${timeStr}`;
    if (diffDays === 1) return `gestern um ${timeStr}`;
    return `vor ${diffDays} Tagen um ${timeStr}`;
  }

  function computeRelativeTime(offset: {
    hours?: number;
    minutes?: number;
  }): string {
    if (offset.hours && offset.hours > 0)
      return `in ${offset.hours} Stunde${offset.hours > 1 ? "n" : ""}`;
    if (offset.minutes && offset.minutes > 0)
      return `in ${offset.minutes} Minuten`;
    return "jetzt";
  }

  // Regex patterns for absolute dates
  const ABSOLUTE_DATE_PATTERNS = [
    /\d{4}-\d{2}-\d{2}/, // YYYY-MM-DD
    /\d{2}\.\d{2}\.\d{4}/, // DD.MM.YYYY (German format)
    /Q[1-4]\s+20\d{2}/, // Q1 2024, Q2 2025, etc.
    /KW\s*\d{1,2}\s+20\d{2}/i, // KW 42 2024
    /(Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember)\s+20\d{2}/i,
    /(January|February|March|April|May|June|July|August|September|October|November|December)\s+20\d{2}/i,
  ];

  function containsAbsoluteDate(text: string): boolean {
    return ABSOLUTE_DATE_PATTERNS.some((pattern) => pattern.test(text));
  }

  it("transformed feed item timestamps contain no absolute dates", () => {
    fc.assert(
      fc.property(fc.constantFrom(...feedData.items), (item: any) => {
        const timestamp = computeRelativeTimestamp(item.offset);
        expect(containsAbsoluteDate(timestamp)).toBe(false);
      }),
    );
  });

  it("feed item bodies and subjects contain no absolute dates", () => {
    fc.assert(
      fc.property(fc.constantFrom(...feedData.items), (item: any) => {
        expect(containsAbsoluteDate(item.body)).toBe(false);
        if (item.subject) {
          expect(containsAbsoluteDate(item.subject)).toBe(false);
        }
      }),
    );
  });

  it("day plan meeting titles contain no absolute dates", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...feedData.dayPlan.meetings),
        (meeting: any) => {
          const timeStr = computeRelativeTime(meeting.offset);
          expect(containsAbsoluteDate(timeStr)).toBe(false);
          expect(containsAbsoluteDate(meeting.title)).toBe(false);
        },
      ),
    );
  });

  it("day plan recommendations contain no absolute dates", () => {
    for (const rec of feedData.dayPlan.recommendations) {
      expect(containsAbsoluteDate(rec)).toBe(false);
    }
  });

  it("computeRelativeTimestamp produces relative strings for various anchor dates", () => {
    fc.assert(
      fc.property(
        fc.record({
          days: fc.integer({ min: -14, max: -1 }),
          hours: fc.integer({ min: 0, max: 23 }),
          minutes: fc.integer({ min: 0, max: 59 }),
        }),
        (offset) => {
          const result = computeRelativeTimestamp(offset);
          expect(containsAbsoluteDate(result)).toBe(false);
          // Should contain German relative keywords
          expect(result).toMatch(/(heute um|gestern um|vor \d+ Tagen um)/);
        },
      ),
      { numRuns: 100 },
    );
  });
});

/**
 * **Validates: Requirements 9.2, 9.3**
 *
 * Property 11: Seed Data Transformation Round-Trip Validity
 *
 * Execute load-seed-data.js transformation logic and verify output conforms
 * to kg_add schema (entity_type, name, attributes) and update_feed schema
 * (channel_source, sender, body, importance, cta_labels).
 */
describe("Property 11: Seed Data Transformation Round-Trip Validity", () => {
  // Re-implement transformation from load-seed-data.js
  function computeRelativeTimestamp(offset: {
    days: number;
    hours: number;
    minutes: number;
  }): string {
    const now = new Date();
    const target = new Date(now);
    target.setDate(target.getDate() + offset.days);
    target.setHours(offset.hours || 0);
    target.setMinutes(offset.minutes || 0);
    const diffMs = now.getTime() - target.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = target.getHours();
    const minutes = target.getMinutes();
    const timeStr = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    if (diffDays === 0) return `heute um ${timeStr}`;
    if (diffDays === 1) return `gestern um ${timeStr}`;
    return `vor ${diffDays} Tagen um ${timeStr}`;
  }

  // Transform entities
  const transformedEntities = [
    ...entities.people,
    ...entities.suppliers,
    ...entities.projects,
    ...entities.organizations,
  ].map((e: any) => ({
    entity_type: e.type,
    name: e.name,
    attributes: e.attributes,
  }));

  // Transform feed items
  const transformedFeedItems = feedData.items.map((item: any) => ({
    channel_source: item.channel,
    sender: item.sender,
    subject: item.subject || null,
    body: item.body,
    importance: item.importance,
    timestamp: computeRelativeTimestamp(item.offset),
    cta_labels: item.ctas,
  }));

  it("all transformed entities conform to kg_add schema (entity_type, name, attributes)", () => {
    fc.assert(
      fc.property(fc.constantFrom(...transformedEntities), (entity: any) => {
        expect(entity).toHaveProperty("entity_type");
        expect(["person", "organization", "project", "event"]).toContain(
          entity.entity_type,
        );
        expect(entity).toHaveProperty("name");
        expect(typeof entity.name).toBe("string");
        expect(entity.name.length).toBeGreaterThan(0);
        expect(entity).toHaveProperty("attributes");
        expect(typeof entity.attributes).toBe("object");
      }),
    );
  });

  it("all transformed feed items conform to update_feed schema (channel_source, sender, body, importance, cta_labels)", () => {
    fc.assert(
      fc.property(fc.constantFrom(...transformedFeedItems), (item: any) => {
        expect(item).toHaveProperty("channel_source");
        expect(["outlook", "teams"]).toContain(item.channel_source);
        expect(item).toHaveProperty("sender");
        expect(typeof item.sender).toBe("string");
        expect(item).toHaveProperty("body");
        expect(typeof item.body).toBe("string");
        expect(item).toHaveProperty("importance");
        expect(["fyi", "important"]).toContain(item.importance);
        expect(item).toHaveProperty("cta_labels");
        expect(Array.isArray(item.cta_labels)).toBe(true);
        expect(item).toHaveProperty("timestamp");
        expect(typeof item.timestamp).toBe("string");
      }),
    );
  });

  it("all transformed relationships conform to kg_add relationship schema", () => {
    const transformedRelationships = relationships.map((r: any) => ({
      source: r.source,
      target: r.target,
      relationship_type: r.type,
      attributes: r.attributes || {},
    }));

    fc.assert(
      fc.property(fc.constantFrom(...transformedRelationships), (rel: any) => {
        expect(rel).toHaveProperty("source");
        expect(typeof rel.source).toBe("string");
        expect(rel).toHaveProperty("target");
        expect(typeof rel.target).toBe("string");
        expect(rel).toHaveProperty("relationship_type");
        expect(typeof rel.relationship_type).toBe("string");
        expect(rel).toHaveProperty("attributes");
        expect(typeof rel.attributes).toBe("object");
      }),
    );
  });
});
