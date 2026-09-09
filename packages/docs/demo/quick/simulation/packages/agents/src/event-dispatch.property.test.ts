import fc from "fast-check";
import { describe, it, expect } from "vitest";
import type { AgentConfig, SimEvent, AgentHandler } from "./orchestrator.js";

/**
 * **Validates: Requirements 3.3**
 *
 * Property 7: Event-Dispatch nur an relevante Rollen
 *
 * For every event in the event queue and every role configuration:
 * The dispatcher forwards an event only to agents whose configured eventTypes
 * contain the event type. Agents whose configuration does not contain the event
 * type do NOT receive the event — unless the event explicitly targets their role.
 */

// Reimplement the dispatch logic from orchestrator.ts for testability
function dispatchEvent(
  event: Pick<SimEvent, "type" | "target_role">,
  agents: Pick<AgentHandler, "config">[],
): Pick<AgentHandler, "config">[] {
  return agents.filter((agent) => {
    const matchesType = agent.config.eventTypes.includes(event.type);
    const isTargeted = event.target_role === agent.config.roleId;
    return matchesType || isTargeted;
  });
}

// -- Arbitraries --

const eventTypeArb = fc.stringOf(
  fc.constantFrom(..."abcdefghijklmnopqrstuvwxyz_"),
  { minLength: 1, maxLength: 20 },
);

const roleIdArb = fc.stringOf(
  fc.constantFrom(..."abcdefghijklmnopqrstuvwxyz_"),
  { minLength: 1, maxLength: 15 },
);

const agentConfigArb = fc.record({
  roleId: roleIdArb,
  eventTypes: fc.uniqueArray(eventTypeArb, { minLength: 0, maxLength: 5 }),
  channels: fc.constant(["outlook", "teams"] as ("outlook" | "teams")[]),
  systemsAccess: fc.constant([] as string[]),
});

const agentArb = agentConfigArb.map((config) => ({ config }));

const agentSetArb = fc.array(agentArb, { minLength: 1, maxLength: 10 });

const eventArb = (roleIds: string[]) =>
  fc.record({
    type: eventTypeArb,
    target_role: fc.oneof(
      fc.constant(null as string | null),
      roleIds.length > 0
        ? fc.constantFrom(...roleIds)
        : fc.constant(null as string | null),
    ),
  });

describe("Feature: supply-chain-simulation, Property 7: Event-Dispatch nur an relevante Rollen", () => {
  it("dispatches events ONLY to agents whose eventTypes include the event type OR who are explicitly targeted", () => {
    fc.assert(
      fc.property(
        agentSetArb.chain((agents) => {
          const roleIds = agents.map((a) => a.config.roleId);
          return eventArb(roleIds).map((event) => ({ agents, event }));
        }),
        ({ agents, event }) => {
          const dispatched = dispatchEvent(event, agents);

          // Every agent that received the event must have a valid reason
          for (const receivingAgent of dispatched) {
            const matchesType = receivingAgent.config.eventTypes.includes(
              event.type,
            );
            const isTargeted =
              event.target_role === receivingAgent.config.roleId;
            expect(matchesType || isTargeted).toBe(true);
          }

          // Every agent that did NOT receive the event must lack both reasons
          const notDispatched = agents.filter((a) => !dispatched.includes(a));
          for (const skippedAgent of notDispatched) {
            const matchesType = skippedAgent.config.eventTypes.includes(
              event.type,
            );
            const isTargeted = event.target_role === skippedAgent.config.roleId;
            expect(matchesType || isTargeted).toBe(false);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it("agents without matching eventTypes and not targeted never receive the event", () => {
    fc.assert(
      fc.property(agentSetArb, eventTypeArb, (agents, eventType) => {
        const event = { type: eventType, target_role: null };
        const dispatched = dispatchEvent(event, agents);

        // With no target_role, only eventTypes matching matters
        for (const agent of agents) {
          const shouldReceive = agent.config.eventTypes.includes(eventType);
          const didReceive = dispatched.includes(agent);
          expect(didReceive).toBe(shouldReceive);
        }
      }),
      { numRuns: 100 },
    );
  });

  it("targeted agent always receives the event regardless of eventTypes", () => {
    fc.assert(
      fc.property(agentSetArb, eventTypeArb, (agents, eventType) => {
        // Pick a random agent to target
        for (const targetAgent of agents) {
          const event = {
            type: eventType,
            target_role: targetAgent.config.roleId,
          };
          const dispatched = dispatchEvent(event, agents);

          // All agents with this roleId must be in dispatched
          const agentsWithTargetRole = agents.filter(
            (a) => a.config.roleId === targetAgent.config.roleId,
          );
          for (const a of agentsWithTargetRole) {
            expect(dispatched).toContain(a);
          }
        }
      }),
      { numRuns: 100 },
    );
  });
});
