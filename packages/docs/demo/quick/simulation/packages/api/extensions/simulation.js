/**
 * Simulation API Extensions – ALDI SÜD Supply Chain Simulation
 *
 * Custom Endpoints für simulationsspezifische Operationen:
 *   GET  /api/simulation/status              – Basis-Statusabfrage
 *   POST /api/simulation/trigger-disruption  – Disruption-Event auslösen
 *   POST /api/simulation/activate-pre-aged   – Pre-Aged-Modus aktivieren
 *   GET  /api/simulation/kpi-history/:kpiName – 30-Tage KPI-Verlauf
 *   POST /api/simulation/reset               – Seed-Daten neu laden
 *
 * Anforderungen: 7.4, 10.2, 10.5
 */

// --- Disruption Scenarios (repliziert aus packages/agents/src/disruption.ts) ---

const DISRUPTION_SCENARIOS = [
  {
    id: "rueckruf",
    name: "Recall",
    marginImpactBps: 18,
    riskCluster: null,
    defaultDuration: 14,
    affectedKpis: ["osa", "cost_deviation"],
  },
  {
    id: "verpackungsaenderung",
    name: "Packaging Change",
    marginImpactBps: 18,
    riskCluster: null,
    defaultDuration: 21,
    affectedKpis: ["cost_deviation", "mape"],
  },
  {
    id: "saisonale_spitzen",
    name: "Seasonal Peaks",
    marginImpactBps: 22,
    riskCluster: null,
    defaultDuration: 30,
    affectedKpis: ["osa", "mape"],
  },
  {
    id: "it_ausfall",
    name: "IT Outage",
    marginImpactBps: 25,
    riskCluster: null,
    defaultDuration: 3,
    affectedKpis: ["otd", "osa", "mape"],
  },
  {
    id: "extremwetter",
    name: "Extreme Weather",
    marginImpactBps: 30,
    riskCluster: "climate_agri_fresh",
    defaultDuration: 7,
    affectedKpis: ["otd", "osa", "cost_deviation"],
  },
  {
    id: "mindestlohnerhoehung",
    name: "Minimum Wage Increase",
    marginImpactBps: 45,
    riskCluster: "geo_energy_transport",
    defaultDuration: 90,
    affectedKpis: ["cost_deviation"],
  },
  {
    id: "lieferketten_disruption",
    name: "Supply Chain Disruption",
    marginImpactBps: 50,
    riskCluster: "geo_energy_transport",
    defaultDuration: 30,
    affectedKpis: ["otd", "osa", "cost_deviation", "mape"],
  },
  {
    id: "pandemie",
    name: "Pandemic",
    marginImpactBps: 125,
    riskCluster: "geo_energy_transport",
    defaultDuration: 180,
    affectedKpis: ["otd", "osa", "cost_deviation", "mape"],
  },
];

// --- Pre-Aged Logic (repliziert aus packages/agents/src/pre-aged.ts für CommonJS) ---

const BPS_TO_KPI_SCALE = 0.001;
const MAX_KPI_IMPACT = { otd: 0.25, osa: 0.2, cost_deviation: 0.15, mape: 0.3 };
const KPI_BASELINES = {
  otd: 0.96,
  osa: 0.975,
  cost_deviation: 0.02,
  mape: 0.11,
};

const INTERNAL_CONTACTS = {
  sc_coordinator: { name: "Sandra Klein", email: "sandra.klein@aldi-sued.de" },
  logistics: { name: "Thomas Müller", email: "thomas.mueller@aldi-sued.de" },
  assortment_planning: {
    name: "Peter Hoffmann",
    email: "peter.hoffmann@aldi-sued.de",
  },
  store_replenishment: {
    name: "Julia Braun",
    email: "julia.braun@aldi-sued.de",
  },
};

const SUPPLIER_CONTACTS = {
  geo_energy_transport: {
    name: "NewCoffee Trading GmbH",
    email: "kontakt@newcoffee-trading.com",
  },
  climate_agri_fresh: {
    name: "FreshFruit Import GmbH",
    email: "info@freshfruit-import.com",
  },
  default: { name: "External Supplier", email: "kontakt@lieferant.de" },
};

const DEFAULT_ESCALATION_RULES = [
  {
    kpi: "otd",
    threshold: 0.9,
    level: 1,
    direction: "below",
    channel: "teams",
  },
  {
    kpi: "mape",
    threshold: 0.2,
    level: 1,
    direction: "above",
    channel: "teams",
  },
  {
    kpi: "osa",
    threshold: 0.95,
    level: 2,
    direction: "below",
    channel: "outlook",
  },
  {
    kpi: "cost_deviation",
    threshold: 0.05,
    level: 2,
    direction: "above",
    channel: "outlook",
  },
];

function findScenario(scenarioId) {
  const scenarioType = scenarioId.replace("scenario_", "");
  return DISRUPTION_SCENARIOS.find(
    (s) => s.id === scenarioType || s.id === scenarioId,
  );
}

function getScenarioConfig(scenarioId, db) {
  const row = db
    .prepare("SELECT value FROM demo_config WHERE key = ?")
    .get(scenarioId);
  if (row) return JSON.parse(row.value);

  const found = findScenario(scenarioId);
  if (found) {
    return {
      type: found.id,
      label: found.name,
      margin_impact_bps: found.marginImpactBps,
      duration_days: found.defaultDuration,
      probability: 0.1,
      risk_cluster: found.riskCluster,
      affected_skus: [],
    };
  }
  throw new Error(`Unknown scenario: ${scenarioId}`);
}

function getAnchorDate(db) {
  const row = db
    .prepare("SELECT value FROM demo_config WHERE key = 'anchor_date'")
    .get();
  if (row) {
    const dateStr = JSON.parse(row.value);
    return new Date(dateStr + "T00:00:00.000Z");
  }
  const now = new Date();
  return new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0),
  );
}

function computeMaxImpactForKpi(kpi, marginImpactBps) {
  const rawImpact = marginImpactBps * BPS_TO_KPI_SCALE;
  return Math.min(rawImpact, MAX_KPI_IMPACT[kpi]);
}

function activatePreAgedMode(scenarioId, db) {
  const scenario = getScenarioConfig(scenarioId, db);
  const anchorDate = getAnchorDate(db);
  const disruptionScenario =
    findScenario(scenario.type) || findScenario(scenarioId);

  if (!disruptionScenario) {
    throw new Error(`Cannot resolve disruption scenario for: ${scenarioId}`);
  }

  const declineDays = Math.min(scenario.duration_days, 14);
  const buyerEmail = "markus.weber@aldi-sued.de";
  const supplier =
    SUPPLIER_CONTACTS[scenario.risk_cluster || "default"] ||
    SUPPLIER_CONTACTS.default;

  // 1. Generate historic KPI decline
  const insertKpi = db.prepare(
    "INSERT INTO kpi_states (kpi_name, value, timestamp, role_id) VALUES (?, ?, ?, ?)",
  );

  const generateKpiDecline = db.transaction(() => {
    for (const kpi of disruptionScenario.affectedKpis) {
      const baseline = KPI_BASELINES[kpi];
      const maxImpact = computeMaxImpactForKpi(kpi, scenario.margin_impact_bps);

      for (let day = -declineDays; day <= -1; day++) {
        const progress = (day + declineDays) / declineDays;
        const degradation = maxImpact * Math.pow(progress, 1.5);
        let value =
          kpi === "otd" || kpi === "osa"
            ? baseline - degradation
            : baseline + degradation;
        value = Math.round(value * 10000) / 10000;

        const timestamp = computeTimestamp(anchorDate, {
          days: day,
          hours: 9,
          minutes: 0,
        });
        insertKpi.run(kpi, value, timestamp, null);
      }
    }
  });
  generateKpiDecline();

  // 2. Generate historic messages
  const insertMsg = db.prepare(
    "INSERT INTO messages (channel, sender, recipient, subject, body, timestamp, read_status, thread_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
  );
  const threadId = `thread-preaged-${scenario.type}`;

  const generateMessages = db.transaction(() => {
    // Message 1: Initial supplier notification
    insertMsg.run(
      "outlook",
      supplier.email,
      buyerEmail,
      `Supplier Notice: ${scenario.label}`,
      `Dear Mr. Weber,\n\nwe would like to inform you about a potential disruption in our supply chain.\n\nType of disruption: ${scenario.label}\nExpected duration: ${scenario.duration_days} days\n\nBest regards,\n${supplier.name}`,
      computeTimestamp(anchorDate, {
        days: -declineDays,
        hours: 10,
        minutes: 15,
      }),
      1,
      threadId,
    );

    // Message 2: Logistics notices
    insertMsg.run(
      "teams",
      INTERNAL_CONTACTS.logistics.email,
      buyerEmail,
      null,
      `Hi Markus, quick heads-up: We're seeing initial supply chain impacts from "${scenario.label}". OTD values in that area are slightly weakening. Keeping an eye on it.`,
      computeTimestamp(anchorDate, {
        days: -declineDays + 1,
        hours: 11,
        minutes: 30,
      }),
      1,
      `thread-preaged-teams-${scenario.type}`,
    );

    // Message 3: SC Coordinator assessment
    const midpoint = Math.max(-Math.floor(declineDays / 2), -declineDays + 2);
    insertMsg.run(
      "outlook",
      INTERNAL_CONTACTS.sc_coordinator.email,
      buyerEmail,
      `SC Coordinator Update: ${scenario.label} – Situation Assessment`,
      `Hi Markus,\n\nI've analyzed the situation. The disruption "${scenario.label}" is affecting multiple items.\n\nRecommendation: Please check alternative suppliers.\n\nBest, Sandra`,
      computeTimestamp(anchorDate, { days: midpoint, hours: 14, minutes: 45 }),
      1,
      threadId,
    );

    // Message 4: Supplier follow-up
    const followUpDay = Math.max(
      -Math.floor(declineDays / 3),
      -declineDays + 3,
    );
    insertMsg.run(
      "outlook",
      supplier.email,
      buyerEmail,
      `Update: ${scenario.label} – Current Development`,
      `Dear Mr. Weber,\n\nunfortunately the situation has not improved yet. We expect an improvement in ${Math.ceil(scenario.duration_days / 2)} days.\n\nBest regards,\n${supplier.name}`,
      computeTimestamp(anchorDate, {
        days: followUpDay,
        hours: 9,
        minutes: 30,
      }),
      1,
      threadId,
    );

    // Message 5: Coverage warning
    insertMsg.run(
      "outlook",
      INTERNAL_CONTACTS.store_replenishment.email,
      buyerEmail,
      `Coverage Days Warning: ${scenario.label}`,
      `Hi Markus,\n\nthe WMS reports coverage days below threshold (< 3 days) for several affected SKUs.\n\nBest, Julia`,
      computeTimestamp(anchorDate, { days: -2, hours: 8, minutes: 45 }),
      0,
      threadId,
    );

    // Message 6: Escalation
    insertMsg.run(
      "outlook",
      INTERNAL_CONTACTS.sc_coordinator.email,
      buyerEmail,
      `ESCALATION: ${scenario.label} – Thresholds Exceeded`,
      `Hi Markus,\n\nKPI thresholds have been exceeded and an escalation has been triggered.\n\nPlease review the situation.\n\nBest, Sandra`,
      computeTimestamp(anchorDate, { days: -1, hours: 9, minutes: 15 }),
      0,
      threadId,
    );
  });
  generateMessages();

  // 3. Generate historic escalations
  const insertEsc = db.prepare(
    "INSERT INTO escalations (level, trigger_kpi, trigger_value, threshold, channel, created_at) VALUES (?, ?, ?, ?, ?, ?)",
  );

  const generateEscalations = db.transaction(() => {
    for (const kpi of disruptionScenario.affectedKpis) {
      const rule = DEFAULT_ESCALATION_RULES.find((r) => r.kpi === kpi);
      if (!rule) continue;

      const baseline = KPI_BASELINES[kpi];
      const maxImpact = computeMaxImpactForKpi(kpi, scenario.margin_impact_bps);

      // Find day when threshold is crossed
      let crossingDay = null;
      let triggerValue = null;
      for (let day = -declineDays; day <= -1; day++) {
        const progress = (day + declineDays) / declineDays;
        const degradation = maxImpact * Math.pow(progress, 1.5);
        const value =
          kpi === "otd" || kpi === "osa"
            ? baseline - degradation
            : baseline + degradation;
        const breached =
          rule.direction === "below"
            ? value < rule.threshold
            : value > rule.threshold;
        if (breached) {
          crossingDay = day;
          triggerValue = Math.round(value * 10000) / 10000;
          break;
        }
      }

      if (crossingDay === null) continue;

      const channel = scenario.duration_days < 3 ? "teams" : "outlook";
      const timestamp = computeTimestamp(anchorDate, {
        days: crossingDay,
        hours: 9,
        minutes: 30,
      });
      insertEsc.run(
        rule.level,
        kpi,
        triggerValue,
        rule.threshold,
        channel,
        timestamp,
      );
    }
  });
  generateEscalations();

  // 4. Set current state for buyer
  const eventPayload = JSON.stringify({
    type: scenario.type,
    affected_skus: scenario.affected_skus || [],
    duration: scenario.duration_days,
    margin_impact: scenario.margin_impact_bps,
  });

  const eventTimestamp = computeTimestamp(anchorDate, {
    days: -declineDays,
    hours: 8,
    minutes: 0,
  });
  db.prepare(
    "INSERT INTO events (timestamp, type, source_role, target_role, payload, status, scenario_id) VALUES (?, 'disruption', 'system', NULL, ?, 'completed', ?)",
  ).run(eventTimestamp, eventPayload, scenario.type);

  // Set current degraded KPI values
  const nowTimestamp = computeTimestamp(anchorDate, {
    days: 0,
    hours: 8,
    minutes: 0,
  });
  for (const kpi of disruptionScenario.affectedKpis) {
    const baseline = KPI_BASELINES[kpi];
    const maxImpact = computeMaxImpactForKpi(kpi, scenario.margin_impact_bps);
    let currentValue =
      kpi === "otd" || kpi === "osa"
        ? baseline - maxImpact
        : baseline + maxImpact;
    currentValue = Math.round(currentValue * 10000) / 10000;
    insertKpi.run(kpi, currentValue, nowTimestamp, null);
  }

  // Mark pre-aged mode as active
  db.prepare(
    "INSERT OR REPLACE INTO demo_config (key, value) VALUES ('pre_aged_mode', 'true')",
  ).run();
  db.prepare(
    "INSERT OR REPLACE INTO demo_config (key, value) VALUES ('pre_aged_scenario', ?)",
  ).run(JSON.stringify(scenarioId));
}

// --- Seed-Daten (repliziert aus packages/db/src/seed.ts für CommonJS-Kompatibilität) ---

/**
 * Computes an ISO timestamp from anchor date + offset.
 * Mirrors packages/db/src/anchor-date.ts computeTimestamp().
 */
function computeTimestamp(anchorDate, offset) {
  const offsetMs =
    offset.days * 24 * 60 * 60 * 1000 +
    (offset.hours || 0) * 60 * 60 * 1000 +
    (offset.minutes || 0) * 60 * 1000;
  return new Date(anchorDate.getTime() + offsetMs).toISOString();
}

const SEED_EMAILS = [
  {
    channel: "outlook",
    sender: "thomas.mueller@aldi-sued.de",
    recipient: "markus.weber@aldi-sued.de",
    subject: "Weekly Logistics Status Report CW 27",
    body: "Hi Markus,\n\nattached is the weekly status report for CW 27. The utilization at DC Mülheim is currently at 87%. Two truck loads from Rotterdam have been delayed by one day (traffic jam on A3). No critical shortages.\n\nBest,\nThomas",
    offset: { days: -12, hours: 9, minutes: 15 },
    read_status: 1,
    thread_id: "thread-logistik-kw27",
  },
  {
    channel: "outlook",
    sender: "newsletter@rohstoffpreise-aktuell.de",
    recipient: "markus.weber@aldi-sued.de",
    subject: "Commodity Price Report: Coffee, Cocoa, Sugar – CW 27",
    body: "Dear Mr. Weber,\n\ncurrent commodity prices at a glance:\n- Arabica coffee: +3.2% (frost warning Brazil)\n- Cocoa: -1.1% (stable harvest Ivory Coast)\n- Sugar: +0.8% (slightly above previous week)\n\nDetails in the attached PDF.\n\nBest regards,\nYour Commodity Price Team",
    offset: { days: -11, hours: 8, minutes: 30 },
    read_status: 1,
    thread_id: null,
  },
  {
    channel: "outlook",
    sender: "kontakt@newcoffee-trading.com",
    recipient: "markus.weber@aldi-sued.de",
    subject: "Order Confirmation PO-2025-4471 – Bio Arabica 500g",
    body: "Dear Mr. Weber,\n\nwe hereby confirm your order PO-2025-4471:\n- Item: Bio Arabica Whole Bean 500g\n- Quantity: 12,000 units\n- Delivery date: expected 18.07.2025\n- Shipping from Hamburg warehouse\n\nPlease don't hesitate to contact us if you have any questions.\n\nBest regards,\nStefan Hartmann\nNewCoffee Trading GmbH",
    offset: { days: -10, hours: 10, minutes: 45 },
    read_status: 1,
    thread_id: "thread-po-4471",
  },
  {
    channel: "outlook",
    sender: "sandra.klein@aldi-sued.de",
    recipient: "markus.weber@aldi-sued.de",
    subject: "SC Coordinator Update – Supplier Performance Q2",
    body: "Hi Markus,\n\nquick update on supplier performance in Q2:\n- NewCoffee: OTD 96.2% (stable)\n- Storck: OTD 91.4% (slight decline, monitoring)\n- Müller Milch: OTD 98.1% (very good)\n- FreshFruit Import: OTD 88.7% (below threshold, recommend discussion)\n\nCan we have a quick call on Thursday?\n\nBest, Sandra",
    offset: { days: -9, hours: 14, minutes: 20 },
    read_status: 1,
    thread_id: "thread-performance-q2",
  },
  {
    channel: "outlook",
    sender: "peter.hoffmann@aldi-sued.de",
    recipient: "markus.weber@aldi-sued.de",
    subject: "Assortment Planning: Item Substitution Proposal – Oat Flakes",
    body: "Hi Markus,\n\ndue to ongoing delivery issues with Kölln, I propose temporarily substituting the item 'Bio Oat Flakes coarse 500g' (SKU 4820) with secondary supplier Bauckhof. Price difference: +2 cents/unit.\n\nPlease share your assessment from a procurement perspective.\n\nBest, Peter",
    offset: { days: -8, hours: 11, minutes: 0 },
    read_status: 1,
    thread_id: "thread-substitution-hafer",
  },
  {
    channel: "outlook",
    sender: "vertrieb@storck-gmbh.de",
    recipient: "markus.weber@aldi-sued.de",
    subject: "Price Adjustment Confectionery Assortment effective 01.08.2025",
    body: "Dear Mr. Weber,\n\ndue to increased raw material and energy costs, we must adjust our prices for the confectionery assortment effective 01.08.2025:\n- Merci Finest Selection: +4.5%\n- Toffifee: +3.8%\n- Knoppers: +3.2%\n\nWe would be happy to discuss the details in a personal meeting. Would you have time next week?\n\nBest regards,\nAndreas Becker\nStorck GmbH & Co. KG",
    offset: { days: -7, hours: 9, minutes: 30 },
    read_status: 1,
    thread_id: "thread-storck-preise",
  },
  {
    channel: "outlook",
    sender: "markus.weber@aldi-sued.de",
    recipient: "vertrieb@storck-gmbh.de",
    subject:
      "RE: Price Adjustment Confectionery Assortment effective 01.08.2025",
    body: "Dear Mr. Becker,\n\nthank you for the advance information. I've received your breakdown and will review the terms internally.\n\nI'm available for a meeting next week on Wednesday or Thursday.\n\nBest regards,\nMarkus Weber\nALDI SUED – Procurement",
    offset: { days: -7, hours: 15, minutes: 10 },
    read_status: 1,
    thread_id: "thread-storck-preise",
  },
  {
    channel: "outlook",
    sender: "julia.braun@aldi-sued.de",
    recipient: "markus.weber@aldi-sued.de",
    subject: "Store Replenishment: OSA Warning Fresh Products Region South",
    body: "Hi Markus,\n\nauto-replenishment reports OSA values below 96% for 3 SKUs in Region South:\n- Fresh Whole Milk 1L (SKU 2105): OSA 94.2%\n- Bio Yogurt natural (SKU 2203): OSA 93.8%\n- Frozen Mixed Vegetables (SKU 3401): OSA 95.1%\n\nThe cause appears to be a capacity bottleneck at Müller Milch. Please advise if escalation is needed.\n\nBest, Julia",
    offset: { days: -6, hours: 8, minutes: 45 },
    read_status: 1,
    thread_id: "thread-osa-warnung",
  },
  {
    channel: "outlook",
    sender: "thomas.mueller@aldi-sued.de",
    recipient: "markus.weber@aldi-sued.de",
    subject: "Weekly Logistics Status Report CW 28",
    body: "Hi Markus,\n\nStatus report CW 28:\n- DC Mülheim: Utilization 91% (slightly above plan)\n- DC Duisburg: Utilization 78% (within range)\n- 1 container from Vietnam delayed (Port of Hamburg, ETA +3 days)\n- Cold chain alert: no incidents\n\nI'm keeping an eye on the Vietnam container.\n\nBest,\nThomas",
    offset: { days: -5, hours: 9, minutes: 0 },
    read_status: 1,
    thread_id: "thread-logistik-kw28",
  },
  {
    channel: "outlook",
    sender: "info@freshfruit-import.com",
    recipient: "markus.weber@aldi-sued.de",
    subject: "Delivery Delay – Bananas, Container MSKU-7281904",
    body: "Dear Mr. Weber,\n\nwe regret to inform you that the delivery of container MSKU-7281904 (24 pallets bananas, origin Ecuador) will be delayed by approximately 5 days.\n\nReason: Port strike in Guayaquil since July 10.\n\nWe will keep you updated on further developments.\n\nBest regards,\nMaria Gonzalez\nFreshFruit Import GmbH",
    offset: { days: -4, hours: 11, minutes: 20 },
    read_status: 1,
    thread_id: "thread-freshfruit-delay",
  },
  {
    channel: "outlook",
    sender: "sandra.klein@aldi-sued.de",
    recipient: "markus.weber@aldi-sued.de",
    subject: "RE: SC Coordinator Update – Supplier Performance Q2",
    body: "Hi Markus,\n\none more update: FreshFruit Import has now dropped to an OTD of 85.3% due to the port strike in Ecuador. I recommend a meeting with the supplier next week.\n\nAlternatively, we could fill the gap short-term via secondary supplier Dole.\n\nBest, Sandra",
    offset: { days: -3, hours: 16, minutes: 30 },
    read_status: 1,
    thread_id: "thread-performance-q2",
  },
  {
    channel: "outlook",
    sender: "kontakt@newcoffee-trading.com",
    recipient: "markus.weber@aldi-sued.de",
    subject: "Shipping Confirmation PO-2025-4471 – Shipped Today",
    body: "Dear Mr. Weber,\n\nwe are pleased to inform you that your order PO-2025-4471 (Bio Arabica Whole Bean 500g, 12,000 units) has left our Hamburg warehouse today.\n\nTracking No.: DHL-4892716340\nExpected arrival DC Mülheim: day after tomorrow\n\nBest regards,\nStefan Hartmann\nNewCoffee Trading GmbH",
    offset: { days: -2, hours: 14, minutes: 0 },
    read_status: 1,
    thread_id: "thread-po-4471",
  },
  {
    channel: "outlook",
    sender: "qualitaet@muellermilch.de",
    recipient: "markus.weber@aldi-sued.de",
    subject: "Quality Report Batch 2025-07-B12 – Fresh Whole Milk",
    body: "Dear Mr. Weber,\n\nattached is the quality report for batch 2025-07-B12 (Fresh Whole Milk 1L):\n- Microbiology: all parameters within spec\n- Fat content: 3.52% (specification: 3.5% ± 0.1%)\n- Best before: 14 days from production\n- Sensory: flawless\n\nThe batch is cleared for shipping.\n\nBest regards,\nDr. Katharina Schmid\nMüller Milch Quality Assurance",
    offset: { days: -2, hours: 10, minutes: 15 },
    read_status: 0,
    thread_id: null,
  },
  {
    channel: "outlook",
    sender: "peter.hoffmann@aldi-sued.de",
    recipient: "markus.weber@aldi-sued.de",
    subject: "RE: Assortment Planning: Item Substitution Proposal – Oat Flakes",
    body: "Hi Markus,\n\nthanks for your OK on the substitution. I've entered the switch to Bauckhof in the system for the next 4 weeks. Once Kölln can deliver again, we'll switch back.\n\nBest, Peter",
    offset: { days: -1, hours: 8, minutes: 30 },
    read_status: 0,
    thread_id: "thread-substitution-hafer",
  },
  {
    channel: "outlook",
    sender: "info@freshfruit-import.com",
    recipient: "markus.weber@aldi-sued.de",
    subject: "Update Delivery Delay – Port Strike Ended",
    body: "Dear Mr. Weber,\n\ngood news: The port strike in Guayaquil has ended today. Container MSKU-7281904 is expected to reach DC Mülheim in 3 days (instead of the originally stated 5-day delay).\n\nWe apologize for the inconvenience.\n\nBest regards,\nMaria Gonzalez\nFreshFruit Import GmbH",
    offset: { days: -1, hours: 15, minutes: 45 },
    read_status: 0,
    thread_id: "thread-freshfruit-delay",
  },
  {
    channel: "outlook",
    sender: "thomas.mueller@aldi-sued.de",
    recipient: "markus.weber@aldi-sued.de",
    subject: "Urgent: Temperature Alarm Cold Storage DC Duisburg",
    body: "Hi Markus,\n\nquick info: There was a temperature alarm in the cold storage at DC Duisburg last night (rise to +6°C for approx. 45 min). Affects section C (dairy products). Technicians are working on the repair.\n\nAffected SKUs are being checked. I'll follow up with an update.\n\nBest,\nThomas",
    offset: { days: -1, hours: 8, minutes: 15 },
    read_status: 0,
    thread_id: "thread-tempalarm-duisburg",
  },
  {
    channel: "outlook",
    sender: "sandra.klein@aldi-sued.de",
    recipient: "markus.weber@aldi-sued.de",
    subject: "Coverage Days Warning: 4 SKUs Below Threshold",
    body: "Hi Markus,\n\nthe WMS reports coverage days below 3 for the following SKUs:\n- Fresh Whole Milk 1L (SKU 2105): 2.1 days\n- Bio Yogurt natural (SKU 2203): 1.8 days\n- Butter 250g (SKU 2301): 2.5 days\n- Cream 200ml (SKU 2107): 2.9 days\n\nCause: The capacity bottleneck at Müller Milch is now affecting inventory levels. I recommend escalation.\n\nBest, Sandra",
    offset: { days: -1, hours: 10, minutes: 30 },
    read_status: 0,
    thread_id: "thread-coverage-warnung",
  },
  {
    channel: "outlook",
    sender: "newsletter@lebensmittelzeitung.net",
    recipient: "markus.weber@aldi-sued.de",
    subject: "LZ Daily: Discounter Price War – Private Labels Under Pressure",
    body: "Good morning Mr. Weber,\n\ntoday's key headlines:\n\n1. Private label prices: Aldi and Lidl under pressure from rising commodity costs\n2. Sustainability: EU Supply Chain Act – New requirements from 2026\n3. Logistics: Deutsche Bahn plans special schedule for food transport\n\nRead more at lebensmittelzeitung.net\n\nBest regards,\nYour Lebensmittel Zeitung",
    offset: { days: -1, hours: 8, minutes: 0 },
    read_status: 0,
    thread_id: null,
  },
];

/**
 * Re-seeds the database with fresh Slice 1 data.
 * Mirrors the logic from packages/db/src/seed.ts.
 */
function reseedDatabase(db) {
  // Normalize anchor date to midnight
  const now = new Date();
  const anchorDate = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
    0,
  );

  // Clear existing data
  db.exec("DELETE FROM messages");
  db.exec("DELETE FROM demo_config");
  db.exec("DELETE FROM roles");

  // Reset autoincrement
  db.exec("DELETE FROM sqlite_sequence WHERE name IN ('messages')");

  // --- demo_config entries ---
  const insertConfig = db.prepare(
    "INSERT OR REPLACE INTO demo_config (key, value) VALUES (?, ?)",
  );

  const configEntries = [
    ["anchor_date", JSON.stringify(anchorDate.toISOString().split("T")[0])],
    ["pre_aged_mode", "false"],
    ["buyer_role_id", JSON.stringify("buyer")],
    ["polling_interval_ms", "10000"],
  ];

  for (const [key, value] of configEntries) {
    insertConfig.run(key, value);
  }

  // --- roles entry: Buyer (Markus Weber) ---
  const insertRole = db.prepare(
    `INSERT OR REPLACE INTO roles (id, name, display_name, description, systems_access, polling_interval)
     VALUES (?, ?, ?, ?, ?, ?)`,
  );

  insertRole.run(
    "buyer",
    "Procurement",
    "Markus Weber",
    "Responsible for 54-60 SKUs, supplier negotiations, contract management",
    JSON.stringify(["sap_ariba", "outlook", "teams"]),
    10000,
  );

  // --- Seed emails ---
  const insertMessage = db.prepare(
    `INSERT INTO messages (channel, sender, recipient, subject, body, timestamp, read_status, thread_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  );

  const insertMany = db.transaction(() => {
    for (const email of SEED_EMAILS) {
      const timestamp = computeTimestamp(anchorDate, email.offset);
      insertMessage.run(
        email.channel,
        email.sender,
        email.recipient,
        email.subject,
        email.body,
        timestamp,
        email.read_status,
        email.thread_id,
      );
    }
  });

  insertMany();
}

// --- Extension Endpoints ---

const status = {
  method: "GET",
  path: "/api/simulation/status",
  handler: (req, res, db) => {
    try {
      // List all tables
      const tables = db
        .prepare(
          "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
        )
        .all()
        .map((t) => t.name);

      // Row counts for key tables
      const counts = {};
      for (const table of tables) {
        try {
          const row = db
            .prepare(`SELECT COUNT(*) as count FROM "${table}"`)
            .get();
          counts[table] = row ? row.count : 0;
        } catch {
          counts[table] = 0;
        }
      }

      // Active scenario info from demo_config
      const configRows = db.prepare("SELECT key, value FROM demo_config").all();
      const config = {};
      for (const row of configRows) {
        config[row.key] = row.value;
      }

      res.status(200).json({
        status: "running",
        tables,
        counts,
        config: {
          anchor_date: config.anchor_date || null,
          pre_aged_mode: config.pre_aged_mode || "false",
          buyer_role_id: config.buyer_role_id || null,
          polling_interval_ms: config.polling_interval_ms || "10000",
        },
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        error: error.message,
      });
    }
  },
};

const triggerDisruption = {
  method: "POST",
  path: "/api/simulation/trigger-disruption",
  handler: (req, res, db) => {
    try {
      const { scenarioId, params } = req.body || {};

      if (!scenarioId) {
        return res.status(400).json({
          success: false,
          error: "Missing required field: scenarioId",
        });
      }

      // Resolve scenario from predefined list or demo_config
      const scenario = findScenario(scenarioId);
      if (!scenario) {
        return res.status(400).json({
          success: false,
          error: `Unknown scenario: ${scenarioId}`,
        });
      }

      // Build disruption event payload
      const affectedSkus = (params && params.affectedSkus) || [];
      const duration = (params && params.duration) || scenario.defaultDuration;
      const payload = JSON.stringify({
        type: scenario.id,
        affected_skus: affectedSkus,
        duration: duration,
        margin_impact: scenario.marginImpactBps,
      });

      // Insert disruption event into events table
      const anchorDate = getAnchorDate(db);
      const timestamp = computeTimestamp(anchorDate, {
        days: 0,
        hours: 0,
        minutes: 0,
      });

      const result = db
        .prepare(
          "INSERT INTO events (timestamp, type, source_role, target_role, payload, status, scenario_id) VALUES (?, 'disruption', 'system', NULL, ?, 'pending', ?)",
        )
        .run(timestamp, payload, scenario.id);

      res.status(200).json({
        success: true,
        message: "Disruption event created",
        scenarioId: scenario.id,
        eventId: result.lastInsertRowid,
        payload: JSON.parse(payload),
      });
      console.log(
        `[soul-api] 🔥 Disruption ausgelöst: "${scenario.name}" (${scenario.id}), Event #${result.lastInsertRowid}, Margin-Impact: ${scenario.marginImpactBps} bps`,
      );
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },
};

const reset = {
  method: "POST",
  path: "/api/simulation/reset",
  handler: (req, res, db) => {
    try {
      reseedDatabase(db);

      res.status(200).json({
        success: true,
        message: "Seed data reloaded",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },
};

const activatePreAged = {
  method: "POST",
  path: "/api/simulation/activate-pre-aged",
  handler: (req, res, db) => {
    try {
      const { scenarioId } = req.body || {};

      if (!scenarioId) {
        return res.status(400).json({
          success: false,
          error: "Missing required field: scenarioId",
        });
      }

      activatePreAgedMode(scenarioId, db);

      res.status(200).json({
        success: true,
        message: "Pre-aged mode activated",
        scenarioId,
      });
      console.log(
        `[soul-api] ⏩ Pre-Aged Modus aktiviert: "${scenarioId}" – historische KPIs, Nachrichten und Eskalationen erzeugt`,
      );
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },
};

const kpiHistory = {
  method: "GET",
  path: "/api/simulation/kpi-history/:kpiName",
  handler: (req, res, db) => {
    try {
      const { kpiName } = req.params;
      const validKpis = ["otd", "osa", "cost_deviation", "mape"];

      if (!validKpis.includes(kpiName)) {
        return res.status(400).json({
          success: false,
          error: `Invalid KPI name: ${kpiName}. Valid values: ${validKpis.join(", ")}`,
        });
      }

      // Query last 30 days of KPI data
      const anchorDate = getAnchorDate(db);
      const thirtyDaysAgo = new Date(
        anchorDate.getTime() - 30 * 24 * 60 * 60 * 1000,
      );

      const rows = db
        .prepare(
          "SELECT id, kpi_name, value, timestamp, role_id FROM kpi_states WHERE kpi_name = ? AND timestamp >= ? ORDER BY timestamp ASC",
        )
        .all(kpiName, thirtyDaysAgo.toISOString());

      res.status(200).json({
        kpiName,
        data: rows,
        count: rows.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },
};

module.exports = {
  status,
  triggerDisruption,
  activatePreAged,
  kpiHistory,
  reset,
};
