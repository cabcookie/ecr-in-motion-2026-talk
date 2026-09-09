import { useState, useEffect, useCallback } from "react";
import { DisruptionControl, EventList } from "@/features/disruption-control";
import { api } from "@/shared/api/client";
import type { SimEvent } from "@/entities/event";

interface SimulationStatus {
  running: boolean;
  activeScenarios: string[];
  agentCount: number;
}

const styles = {
  layout: {
    display: "flex",
    flexDirection: "column" as const,
    height: "100vh",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    backgroundColor: "#f8f9fa",
    overflow: "auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 24px",
    borderBottom: "1px solid #e0e0e0",
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: "22px",
    fontWeight: 600 as const,
    color: "#1a1a1a",
    margin: 0,
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  statusIndicator: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
    color: "#5f6368",
  },
  statusDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
  },
  statusRunning: {
    backgroundColor: "#34a853",
  },
  statusStopped: {
    backgroundColor: "#d93025",
  },
  resetButton: {
    padding: "8px 16px",
    fontSize: "13px",
    fontWeight: 500 as const,
    color: "#d93025",
    backgroundColor: "#ffffff",
    border: "1px solid #d93025",
    borderRadius: "4px",
    cursor: "pointer",
  },
  content: {
    flex: 1,
    padding: "24px",
    display: "flex",
    flexDirection: "column" as const,
    gap: "24px",
  },
  error: {
    fontSize: "14px",
    color: "#d93025",
    padding: "12px 16px",
    backgroundColor: "#fce8e6",
    borderRadius: "8px",
  },
  infoBox: {
    backgroundColor: "#f0f4ff",
    border: "1px solid #d2e3fc",
    borderRadius: "10px",
    padding: "20px 24px",
  },
  infoHeading: {
    fontSize: "15px",
    fontWeight: 600,
    color: "#1a1a1a",
    margin: "0 0 8px",
  },
  infoParagraph: {
    fontSize: "14px",
    color: "#3c4043",
    margin: "0 0 12px",
  },
  infoColumns: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginBottom: "12px",
  },
  infoCard: {
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    padding: "14px 16px",
    border: "1px solid #e8eaed",
  },
  infoButtonLabel: {
    display: "inline-block",
    fontSize: "12px",
    fontWeight: 600,
    color: "#ffffff",
    backgroundColor: "#1a73e8",
    padding: "3px 10px",
    borderRadius: "4px",
    marginBottom: "8px",
  },
  infoButtonLabelAlt: {
    display: "inline-block",
    fontSize: "12px",
    fontWeight: 600,
    color: "#1a73e8",
    backgroundColor: "#e8f0fe",
    border: "1px solid #1a73e8",
    padding: "3px 10px",
    borderRadius: "4px",
    marginBottom: "8px",
  },
  infoText: {
    fontSize: "13px",
    color: "#3c4043",
    margin: 0,
    lineHeight: 1.5,
  },
  infoFootnote: {
    fontSize: "13px",
    color: "#5f6368",
    margin: 0,
    lineHeight: 1.5,
  },
};

export function SimulationPage() {
  useEffect(() => {
    document.title = "ALDI Simulation";
  }, []);
  const [events, setEvents] = useState<SimEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [status, setStatus] = useState<SimulationStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);

  const fetchEvents = useCallback(async () => {
    try {
      const data = await api.tables.getRows<SimEvent>("events");
      setEvents(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading events");
    } finally {
      setEventsLoading(false);
    }
  }, []);

  const fetchStatus = useCallback(async () => {
    try {
      const response = await api.simulation.getStatus();
      if (response.ok) {
        const data = await response.json();
        setStatus({
          running: data.status === "running",
          activeScenarios: data.activeScenarios ?? [],
          agentCount: data.agentCount ?? 0,
        });
      }
    } catch {
      // Status endpoint may not be available yet – non-critical
    }
  }, []);

  useEffect(() => {
    fetchEvents();
    fetchStatus();
    const interval = setInterval(() => {
      fetchEvents();
      fetchStatus();
    }, 10_000);
    return () => clearInterval(interval);
  }, [fetchEvents, fetchStatus]);

  const handleReset = useCallback(async () => {
    setResetting(true);
    setError(null);
    try {
      const response = await api.simulation.reset();
      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }
      await fetchEvents();
      await fetchStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error resetting");
    } finally {
      setResetting(false);
    }
  }, [fetchEvents, fetchStatus]);

  return (
    <div style={styles.layout}>
      <header style={styles.header}>
        <h1 style={styles.title}>Simulation Dashboard</h1>
        <div style={styles.headerActions}>
          <div style={styles.statusIndicator}>
            <div
              style={{
                ...styles.statusDot,
                ...(status?.running
                  ? styles.statusRunning
                  : styles.statusStopped),
              }}
            />
            <span>
              {status?.running ? "Simulation active" : "Simulation inactive"}
            </span>
            {status && status.activeScenarios?.length > 0 && (
              <span> · {status.activeScenarios.length} scenarios</span>
            )}
          </div>
          <button
            style={{
              ...styles.resetButton,
              ...(resetting ? { opacity: 0.6, cursor: "not-allowed" } : {}),
            }}
            disabled={resetting}
            onClick={handleReset}
          >
            {resetting ? "Resetting…" : "Reset Simulation"}
          </button>
        </div>
      </header>
      <main style={styles.content}>
        {error && <div style={styles.error}>{error}</div>}
        <div style={styles.infoBox}>
          <h3 style={styles.infoHeading}>How does this page work?</h3>
          <p style={styles.infoParagraph}>
            Choose a disruption scenario and use one of the two buttons:
          </p>
          <div style={styles.infoColumns}>
            <div style={styles.infoCard}>
              <span style={styles.infoButtonLabel}>Trigger</span>
              <p style={styles.infoText}>
                Creates a new disruption event in the queue. The agent engine
                reacts step by step – KPIs deteriorate over time, new emails and
                Teams messages are generated.{" "}
                <strong>Best for showing live reactions.</strong>
              </p>
            </div>
            <div style={styles.infoCard}>
              <span style={styles.infoButtonLabelAlt}>Pre-Aged</span>
              <p style={styles.infoText}>
                Instantly simulates a disruption that has been running for days:
                historical KPI trends, email conversations, warnings, and
                escalations are generated all at once.{" "}
                <strong>
                  The demo button – switch to Amazon Quick right after.
                </strong>
              </p>
            </div>
          </div>
          <p style={styles.infoFootnote}>
            💡 <strong>Demo tip:</strong> Click "Pre-Aged" on a scenario, then
            ask in Amazon Quick: "Do I have new messages?" or "What's the supply
            chain status?" · Use "Reset Simulation" (top right) to return to the
            initial state.
          </p>
        </div>
        <DisruptionControl />
        <EventList events={events} loading={eventsLoading} />
      </main>
    </div>
  );
}
