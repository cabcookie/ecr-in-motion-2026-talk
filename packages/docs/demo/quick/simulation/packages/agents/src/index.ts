export { createAgentEngine } from "./orchestrator.js";

export type {
  AgentEngine,
  AgentConfig,
  AgentHandler,
  AgentAction,
  SimEvent,
  DisruptionParams,
} from "./orchestrator.js";

export { RoleAgent } from "./role-agent.js";
export type { MessageParams } from "./role-agent.js";

export {
  SortimentsplanungAgent,
  EinkaufAgent,
  ScCoordinatorAgent,
  LogistikAgent,
  FilialnachbestellungAgent,
  LieferantenAgent,
} from "./agents/index.js";

export {
  DISRUPTION_SCENARIOS,
  createDisruptionEvent,
  propagateRiskCluster,
  computeKpiAdjustment,
} from "./disruption.js";

export type {
  DisruptionScenario,
  DisruptionEventParams,
  DisruptionEventPayload,
  PropagatedEffect,
  RiskCluster,
  KpiType,
} from "./disruption.js";

export {
  activatePreAgedMode,
  getScenarioConfig,
  getAnchorDate,
  computeKpiDeclineEntries,
  computeHistoricMessages,
  computeHistoricEscalations,
  generateHistoricKpiDecline,
  generateHistoricMessages,
  generateHistoricEscalations,
  setCurrentStateForBuyer,
} from "./pre-aged.js";

export type { ScenarioConfig } from "./pre-aged.js";
