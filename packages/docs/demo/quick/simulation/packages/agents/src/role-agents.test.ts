import { describe, it, expect } from "vitest";
import type { SimEvent, AgentAction } from "./orchestrator.js";
import { RoleAgent } from "./role-agent.js";
import {
  SortimentsplanungAgent,
  EinkaufAgent,
  ScCoordinatorAgent,
  LogistikAgent,
  FilialnachbestellungAgent,
  LieferantenAgent,
} from "./agents/index.js";

// ─── Test Helpers ────────────────────────────────────────────────────────────

function makeEvent(overrides: Partial<SimEvent> = {}): SimEvent {
  return {
    id: 1,
    timestamp: "2025-07-14T10:00:00.000Z",
    type: "disruption",
    source_role: "system",
    target_role: null,
    payload: JSON.stringify({
      type: "supply_chain_disruption",
      affected_skus: ["3101", "3102"],
      duration: 7,
      margin_impact: 50,
    }),
    status: "processing",
    scenario_id: "scenario_supply_chain_disruption",
    ...overrides,
  };
}

function getMessagePayloads(
  actions: AgentAction[],
): Array<Record<string, unknown>> {
  return actions.filter((a) => a.type === "message").map((a) => a.payload);
}

// ─── Instantiation Tests ─────────────────────────────────────────────────────

describe("Role Agents – Instantiation", () => {
  it("should instantiate SortimentsplanungAgent with correct config", () => {
    const agent = new SortimentsplanungAgent();
    expect(agent.config.roleId).toBe("assortment_planning");
    expect(agent.config.eventTypes).toContain("disruption");
    expect(agent.config.eventTypes).toContain("kpi_alert");
    expect(agent.config.systemsAccess).toContain("sap");
  });

  it("should instantiate EinkaufAgent with correct config", () => {
    const agent = new EinkaufAgent();
    expect(agent.config.roleId).toBe("buyer");
    expect(agent.config.eventTypes).toContain("disruption");
    expect(agent.config.eventTypes).toContain("escalation");
    expect(agent.config.eventTypes).toContain("communication");
    expect(agent.config.systemsAccess).toEqual([
      "sap_ariba",
      "outlook",
      "teams",
    ]);
  });

  it("should instantiate ScCoordinatorAgent with correct config", () => {
    const agent = new ScCoordinatorAgent();
    expect(agent.config.roleId).toBe("sc_coordinator");
    expect(agent.config.eventTypes).toContain("disruption");
    expect(agent.config.eventTypes).toContain("escalation");
    expect(agent.config.eventTypes).toContain("kpi_alert");
    expect(agent.config.systemsAccess).toEqual([
      "sap",
      "manhattan_wms",
      "teams",
    ]);
  });

  it("should instantiate LogistikAgent with correct config", () => {
    const agent = new LogistikAgent();
    expect(agent.config.roleId).toBe("logistics");
    expect(agent.config.eventTypes).toContain("disruption");
    expect(agent.config.eventTypes).toContain("kpi_alert");
    expect(agent.config.systemsAccess).toEqual([
      "manhattan_wms",
      "sap",
      "teams",
    ]);
  });

  it("should instantiate FilialnachbestellungAgent with correct config", () => {
    const agent = new FilialnachbestellungAgent();
    expect(agent.config.roleId).toBe("store_replenishment");
    expect(agent.config.eventTypes).toContain("kpi_alert");
    expect(agent.config.eventTypes).toContain("disruption");
    expect(agent.config.systemsAccess).toEqual(["sap", "manhattan_wms"]);
  });

  it("should instantiate LieferantenAgent with correct config", () => {
    const agent = new LieferantenAgent();
    expect(agent.config.roleId).toBe("supplier_agent");
    expect(agent.config.eventTypes).toContain("disruption");
    expect(agent.config.eventTypes).toContain("communication");
    expect(agent.config.channels).toEqual(["outlook"]);
  });
});

// ─── Channel Selection Tests ─────────────────────────────────────────────────

describe("Role Agents – Channel Selection", () => {
  it("should use teams channel when resolution time < 24h", async () => {
    const agent = new ScCoordinatorAgent();
    const event = makeEvent({
      type: "kpi_alert",
      payload: JSON.stringify({ kpi_name: "osa", value: 0.93 }),
    });

    const actions = await agent.handleEvent(event);
    const messages = getMessagePayloads(actions);

    // SC Coordinator sends KPI alert with 12h resolution → teams
    expect(messages.length).toBeGreaterThan(0);
    expect(messages[0].channel).toBe("teams");
  });

  it("should use outlook channel when resolution time >= 24h", async () => {
    const agent = new SortimentsplanungAgent();
    const event = makeEvent({
      payload: JSON.stringify({
        type: "supply_chain_disruption",
        affected_skus: ["3101"],
        duration: 7, // 7 days * 24h = 168h >= 24h → outlook
      }),
    });

    const actions = await agent.handleEvent(event);
    const messages = getMessagePayloads(actions);

    expect(messages.length).toBeGreaterThan(0);
    expect(messages[0].channel).toBe("outlook");
  });

  it("LieferantenAgent should ALWAYS use outlook channel regardless of duration", async () => {
    const agent = new LieferantenAgent();
    const event = makeEvent({
      payload: JSON.stringify({
        type: "recall",
        affected_skus: ["2101"],
        duration: 1, // Even for very short disruptions
      }),
    });

    const actions = await agent.handleEvent(event);
    const messages = getMessagePayloads(actions);

    expect(messages.length).toBeGreaterThan(0);
    for (const msg of messages) {
      expect(msg.channel).toBe("outlook");
    }
  });
});

// ─── Message Generation Tests ────────────────────────────────────────────────

describe("Role Agents – Message Generation", () => {
  it("internal agents should use @aldi-sued.de sender addresses", async () => {
    const agents = [
      new SortimentsplanungAgent(),
      new EinkaufAgent(),
      new ScCoordinatorAgent(),
      new LogistikAgent(),
      new FilialnachbestellungAgent(),
    ];

    const event = makeEvent();

    for (const agent of agents) {
      const actions = await agent.handleEvent(event);
      const messages = getMessagePayloads(actions);

      for (const msg of messages) {
        const sender = msg.sender as string;
        expect(sender).toMatch(/@aldi-sued\.de$/);
        // Verify vorname.nachname format
        expect(sender).toMatch(/^[a-z]+\.[a-z]+@aldi-sued\.de$/);
      }
    }
  });

  it("LieferantenAgent should NEVER use @aldi-sued.de sender", async () => {
    const agent = new LieferantenAgent();
    const event = makeEvent();

    const actions = await agent.handleEvent(event);
    const messages = getMessagePayloads(actions);

    expect(messages.length).toBeGreaterThan(0);
    for (const msg of messages) {
      const sender = msg.sender as string;
      expect(sender).not.toMatch(/@aldi-sued\.de$/);
    }
  });

  it("LieferantenAgent should use external supplier addresses", async () => {
    const agent = new LieferantenAgent();

    // Test with specific supplier in payload
    const event = makeEvent({
      payload: JSON.stringify({
        type: "supply_chain_disruption",
        affected_skus: ["3101"],
        duration: 5,
        supplier_id: "newcoffee",
      }),
    });

    const actions = await agent.handleEvent(event);
    const messages = getMessagePayloads(actions);

    expect(messages.length).toBeGreaterThan(0);
    expect(messages[0].sender).toBe("kontakt@newcoffee-trading.com");
  });
});

// ─── handleEvent Produces Valid Actions ──────────────────────────────────────

describe("Role Agents – handleEvent produces valid actions", () => {
  it("SortimentsplanungAgent produces message actions on disruption", async () => {
    const agent = new SortimentsplanungAgent();
    const actions = await agent.handleEvent(makeEvent());

    expect(actions.length).toBeGreaterThan(0);
    expect(actions.every((a) => a.type === "message")).toBe(true);
  });

  it("EinkaufAgent produces message actions on disruption", async () => {
    const agent = new EinkaufAgent();
    const actions = await agent.handleEvent(makeEvent());

    expect(actions.length).toBeGreaterThan(0);
    expect(actions.every((a) => a.type === "message")).toBe(true);
  });

  it("ScCoordinatorAgent produces multiple messages on disruption", async () => {
    const agent = new ScCoordinatorAgent();
    const actions = await agent.handleEvent(makeEvent());

    // Should notify both buyer and logistics
    expect(actions.length).toBe(2);
    const recipients = getMessagePayloads(actions).map((m) => m.recipient);
    expect(recipients).toContain("markus.weber@aldi-sued.de");
    expect(recipients).toContain("thomas.mueller@aldi-sued.de");
  });

  it("LogistikAgent produces messages on disruption", async () => {
    const agent = new LogistikAgent();
    const actions = await agent.handleEvent(makeEvent());

    expect(actions.length).toBe(2);
    const recipients = getMessagePayloads(actions).map((m) => m.recipient);
    expect(recipients).toContain("markus.weber@aldi-sued.de");
    expect(recipients).toContain("sandra.klein@aldi-sued.de");
  });

  it("FilialnachbestellungAgent produces message on kpi_alert (OSA)", async () => {
    const agent = new FilialnachbestellungAgent();
    const event = makeEvent({
      type: "kpi_alert",
      payload: JSON.stringify({ kpi_name: "osa", value: 0.93 }),
    });

    const actions = await agent.handleEvent(event);
    expect(actions.length).toBe(1);
    expect(actions[0].type).toBe("message");

    const msg = actions[0].payload;
    expect(msg.recipient).toBe("markus.weber@aldi-sued.de");
    expect((msg.subject as string).toLowerCase()).toContain("osa");
  });

  it("LieferantenAgent produces message on disruption", async () => {
    const agent = new LieferantenAgent();
    const actions = await agent.handleEvent(makeEvent());

    expect(actions.length).toBe(1);
    expect(actions[0].type).toBe("message");

    const msg = actions[0].payload;
    expect(msg.channel).toBe("outlook");
    expect(msg.recipient).toBe("markus.weber@aldi-sued.de");
  });

  it("EinkaufAgent handles escalation events", async () => {
    const agent = new EinkaufAgent();
    const event = makeEvent({
      type: "escalation",
      payload: JSON.stringify({
        level: 2,
        trigger_kpi: "osa",
        trigger_value: 0.93,
      }),
    });

    const actions = await agent.handleEvent(event);
    expect(actions.length).toBeGreaterThan(0);
    expect(actions[0].type).toBe("message");
  });

  it("FilialnachbestellungAgent handles disruption events", async () => {
    const agent = new FilialnachbestellungAgent();
    const event = makeEvent({
      type: "disruption",
      payload: JSON.stringify({
        type: "recall",
        affected_skus: ["2101", "2102"],
        duration: 7,
      }),
    });

    const actions = await agent.handleEvent(event);
    expect(actions.length).toBe(1);
    expect(actions[0].type).toBe("message");
  });

  it("LieferantenAgent handles communication events", async () => {
    const agent = new LieferantenAgent();
    const event = makeEvent({
      type: "communication",
      payload: JSON.stringify({
        subject: "Rückmeldung zu PO-4471",
        body: "Ihre Bestellung wurde bestätigt.",
        supplier_id: "storck",
      }),
    });

    const actions = await agent.handleEvent(event);
    expect(actions.length).toBe(1);

    const msg = actions[0].payload;
    expect(msg.channel).toBe("outlook");
    expect(msg.sender).toBe("vertrieb@storck-gmbh.de");
    expect(msg.sender).not.toMatch(/@aldi-sued\.de/);
  });
});

// ─── RoleAgent Base Class Tests ──────────────────────────────────────────────

describe("RoleAgent – Base Class", () => {
  // Create a concrete test implementation to test base methods
  class TestAgent extends RoleAgent {
    async handleEvent(_event: SimEvent): Promise<AgentAction[]> {
      return [];
    }

    // Expose protected methods for testing
    public testSelectChannel(hours: number) {
      return this.selectChannel(hours);
    }

    public testGenerateBusinessHoursTimestamp(date: Date) {
      return this.generateBusinessHoursTimestamp(date);
    }

    public testCreateMessageAction(params: any) {
      return this.createMessageAction(params);
    }
  }

  const agent = new TestAgent(
    {
      roleId: "test",
      eventTypes: ["disruption"],
      channels: ["teams", "outlook"],
      systemsAccess: ["sap"],
    },
    "test.agent@aldi-sued.de",
  );

  it("selectChannel returns teams for < 24h", () => {
    expect(agent.testSelectChannel(0)).toBe("teams");
    expect(agent.testSelectChannel(1)).toBe("teams");
    expect(agent.testSelectChannel(12)).toBe("teams");
    expect(agent.testSelectChannel(23)).toBe("teams");
    expect(agent.testSelectChannel(23.99)).toBe("teams");
  });

  it("selectChannel returns outlook for >= 24h", () => {
    expect(agent.testSelectChannel(24)).toBe("outlook");
    expect(agent.testSelectChannel(48)).toBe("outlook");
    expect(agent.testSelectChannel(168)).toBe("outlook");
  });

  it("generateBusinessHoursTimestamp clamps early hours to 08:00", () => {
    const earlyMorning = new Date();
    earlyMorning.setHours(5, 30, 0, 0);
    const result = agent.testGenerateBusinessHoursTimestamp(earlyMorning);
    const ts = new Date(result);
    expect(ts.getHours()).toBe(8);
    expect(ts.getMinutes()).toBe(0);
  });

  it("generateBusinessHoursTimestamp clamps late hours to before 18:00", () => {
    const lateEvening = new Date();
    lateEvening.setHours(20, 30, 0, 0);
    const result = agent.testGenerateBusinessHoursTimestamp(lateEvening);
    const ts = new Date(result);
    expect(ts.getHours()).toBeLessThan(18);
  });

  it("generateBusinessHoursTimestamp preserves hours within business range", () => {
    // Create a date at 14:30 local time
    const midDay = new Date();
    midDay.setHours(14, 30, 0, 0);
    const result = agent.testGenerateBusinessHoursTimestamp(midDay);
    const ts = new Date(result);
    expect(ts.getHours()).toBe(14);
    expect(ts.getMinutes()).toBe(30);
  });

  it("createMessageAction uses channel from resolutionTimeHours", () => {
    const action = agent.testCreateMessageAction({
      recipient: "someone@example.com",
      body: "test",
      resolutionTimeHours: 10,
    });
    expect(action.payload.channel).toBe("teams");

    const action2 = agent.testCreateMessageAction({
      recipient: "someone@example.com",
      body: "test",
      resolutionTimeHours: 48,
    });
    expect(action2.payload.channel).toBe("outlook");
  });

  it("poll is a no-op by default", async () => {
    await expect(agent.poll()).resolves.toBeUndefined();
  });
});
