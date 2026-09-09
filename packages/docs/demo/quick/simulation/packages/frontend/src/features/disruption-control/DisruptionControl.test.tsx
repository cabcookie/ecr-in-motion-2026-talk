import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DisruptionControl } from "./DisruptionControl";

vi.mock("@/shared/api/client", () => ({
  api: {
    simulation: {
      triggerDisruption: vi.fn(),
      activatePreAged: vi.fn(),
    },
  },
}));

import { api } from "@/shared/api/client";

const mockedApi = vi.mocked(api);

const EXPECTED_SCENARIOS = [
  { name: "Rückruf", bps: 18 },
  { name: "Verpackungsänderung", bps: 18 },
  { name: "Saisonale Spitzen", bps: 22 },
  { name: "IT-Ausfall", bps: 25 },
  { name: "Extremwetter", bps: 30 },
  { name: "Mindestlohnerhöhung", bps: 45 },
  { name: "Lieferketten-Disruption", bps: 50 },
  { name: "Pandemie", bps: 125 },
];

describe("DisruptionControl", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all 8 disruption scenarios", () => {
    render(<DisruptionControl />);

    for (const scenario of EXPECTED_SCENARIOS) {
      expect(screen.getByText(scenario.name)).toBeInTheDocument();
    }
  });

  it("shows bps value for each scenario card", () => {
    render(<DisruptionControl />);

    // Each scenario card shows its name alongside the bps value
    for (const scenario of EXPECTED_SCENARIOS) {
      const nameEl = screen.getByText(scenario.name);
      const card = nameEl.closest('[style*="border"]')!;
      expect(card.textContent).toContain(`${scenario.bps} bps`);
    }
  });

  it("calls api.simulation.triggerDisruption when Trigger button is clicked", async () => {
    mockedApi.simulation.triggerDisruption.mockResolvedValue(
      new Response(null, { status: 200 }),
    );

    render(<DisruptionControl />);

    const triggerButtons = screen.getAllByText("Trigger");
    fireEvent.click(triggerButtons[0]);

    await waitFor(() => {
      expect(mockedApi.simulation.triggerDisruption).toHaveBeenCalledWith(
        "rueckruf",
      );
    });
  });

  it("calls api.simulation.activatePreAged when Pre-Aged button is clicked", async () => {
    mockedApi.simulation.activatePreAged.mockResolvedValue(
      new Response(null, { status: 200 }),
    );

    render(<DisruptionControl />);

    const preAgedButtons = screen.getAllByText("Pre-Aged");
    fireEvent.click(preAgedButtons[0]);

    await waitFor(() => {
      expect(mockedApi.simulation.activatePreAged).toHaveBeenCalledWith(
        "rueckruf",
      );
    });
  });
});
