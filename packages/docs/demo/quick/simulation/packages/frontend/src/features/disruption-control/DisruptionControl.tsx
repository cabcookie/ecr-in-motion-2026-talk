import { useState, useCallback } from "react";
import { api } from "@/shared/api/client";

export interface DisruptionScenario {
  id: string;
  name: string;
  marginImpactBps: number;
}

const SCENARIOS: DisruptionScenario[] = [
  { id: "rueckruf", name: "Recall", marginImpactBps: 18 },
  {
    id: "verpackungsaenderung",
    name: "Packaging Change",
    marginImpactBps: 18,
  },
  { id: "saisonale_spitzen", name: "Seasonal Peaks", marginImpactBps: 22 },
  { id: "it_ausfall", name: "IT Outage", marginImpactBps: 25 },
  { id: "extremwetter", name: "Extreme Weather", marginImpactBps: 30 },
  {
    id: "mindestlohnerhoehung",
    name: "Minimum Wage Increase",
    marginImpactBps: 45,
  },
  {
    id: "lieferketten_disruption",
    name: "Supply Chain Disruption",
    marginImpactBps: 50,
  },
  { id: "pandemie", name: "Pandemic", marginImpactBps: 125 },
];

const styles = {
  container: {
    padding: "16px",
  },
  heading: {
    fontSize: "18px",
    fontWeight: 600 as const,
    marginBottom: "16px",
    color: "#1a1a1a",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "12px",
  },
  card: {
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    padding: "16px",
    backgroundColor: "#ffffff",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
  },
  scenarioName: {
    fontSize: "14px",
    fontWeight: 500 as const,
    color: "#1a1a1a",
  },
  badge: {
    fontSize: "12px",
    fontWeight: 500 as const,
    color: "#d93025",
    backgroundColor: "#fce8e6",
    padding: "2px 8px",
    borderRadius: "12px",
  },
  buttonRow: {
    display: "flex",
    gap: "8px",
    marginTop: "12px",
  },
  triggerButton: {
    flex: 1,
    padding: "8px 12px",
    fontSize: "13px",
    fontWeight: 500 as const,
    color: "#ffffff",
    backgroundColor: "#1a73e8",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  preAgedButton: {
    flex: 1,
    padding: "8px 12px",
    fontSize: "13px",
    fontWeight: 500 as const,
    color: "#1a73e8",
    backgroundColor: "#e8f0fe",
    border: "1px solid #1a73e8",
    borderRadius: "4px",
    cursor: "pointer",
  },
  disabledButton: {
    opacity: 0.6,
    cursor: "not-allowed" as const,
  },
  feedback: {
    marginTop: "8px",
    fontSize: "12px",
    padding: "4px 8px",
    borderRadius: "4px",
  },
  feedbackSuccess: {
    color: "#137333",
    backgroundColor: "#e6f4ea",
  },
  feedbackError: {
    color: "#d93025",
    backgroundColor: "#fce8e6",
  },
};

interface FeedbackState {
  scenarioId: string;
  type: "success" | "error";
  message: string;
}

export function DisruptionControl() {
  const [loading, setLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  const handleTrigger = useCallback(async (scenario: DisruptionScenario) => {
    setLoading(scenario.id);
    setFeedback(null);
    try {
      const response = await api.simulation.triggerDisruption(scenario.id);
      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }
      setFeedback({
        scenarioId: scenario.id,
        type: "success",
        message: `${scenario.name} triggered`,
      });
    } catch (err) {
      setFeedback({
        scenarioId: scenario.id,
        type: "error",
        message: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setLoading(null);
    }
  }, []);

  const handlePreAged = useCallback(async (scenario: DisruptionScenario) => {
    setLoading(`preaged-${scenario.id}`);
    setFeedback(null);
    try {
      const response = await api.simulation.activatePreAged(scenario.id);
      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }
      setFeedback({
        scenarioId: scenario.id,
        type: "success",
        message: `Pre-aged mode activated for ${scenario.name}`,
      });
    } catch (err) {
      setFeedback({
        scenarioId: scenario.id,
        type: "error",
        message: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setLoading(null);
    }
  }, []);

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Disruption Scenarios</h2>
      <div style={styles.grid}>
        {SCENARIOS.map((scenario) => {
          const isLoading =
            loading === scenario.id || loading === `preaged-${scenario.id}`;
          const scenarioFeedback =
            feedback?.scenarioId === scenario.id ? feedback : null;

          return (
            <div key={scenario.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={styles.scenarioName}>{scenario.name}</span>
                <span style={styles.badge}>{scenario.marginImpactBps} bps</span>
              </div>
              <div style={styles.buttonRow}>
                <button
                  style={{
                    ...styles.triggerButton,
                    ...(isLoading ? styles.disabledButton : {}),
                  }}
                  disabled={isLoading}
                  onClick={() => handleTrigger(scenario)}
                >
                  {loading === scenario.id ? "…" : "Trigger"}
                </button>
                <button
                  style={{
                    ...styles.preAgedButton,
                    ...(isLoading ? styles.disabledButton : {}),
                  }}
                  disabled={isLoading}
                  onClick={() => handlePreAged(scenario)}
                >
                  {loading === `preaged-${scenario.id}` ? "…" : "Pre-Aged"}
                </button>
              </div>
              {scenarioFeedback && (
                <div
                  style={{
                    ...styles.feedback,
                    ...(scenarioFeedback.type === "success"
                      ? styles.feedbackSuccess
                      : styles.feedbackError),
                  }}
                >
                  {scenarioFeedback.message}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
