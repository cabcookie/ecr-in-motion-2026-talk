import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useMessages, useMarkAsRead } from "./index";

vi.mock("@/shared/api", () => ({
  api: {
    tables: {
      getRows: vi.fn(),
      updateRow: vi.fn(),
    },
  },
}));

import { api } from "@/shared/api";

const mockMessages = [
  {
    id: 1,
    channel: "outlook" as const,
    sender: "thomas.mueller@freshfood-gmbh.de",
    recipient: "markus.weber@aldi-sued.de",
    subject: "Lieferverzögerung Frischware KW23",
    body: "Sehr geehrter Herr Weber, aufgrund eines Ausfalls...",
    timestamp: "2025-01-15T09:30:00Z",
    read_status: 0 as const,
    thread_id: "thread-001",
  },
  {
    id: 2,
    channel: "outlook" as const,
    sender: "anna.schmidt@aldi-sued.de",
    recipient: "markus.weber@aldi-sued.de",
    subject: "KPI-Report: OTD unter Schwellenwert",
    body: "Hallo Markus, die OTD-Rate ist auf 87% gefallen.",
    timestamp: "2025-01-14T14:15:00Z",
    read_status: 1 as const,
    thread_id: null,
  },
];

describe("useMessages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches data from the API and returns messages", async () => {
    vi.mocked(api.tables.getRows).mockResolvedValue(mockMessages);

    const { result } = renderHook(() => useMessages());

    // Initially loading
    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.messages).toEqual(mockMessages);
    expect(result.current.error).toBeNull();
    expect(api.tables.getRows).toHaveBeenCalledWith("messages", {
      filter: "channel:outlook",
      _sort: "timestamp",
      _order: "DESC",
    });
  });

  it("sets error when API call fails", async () => {
    vi.mocked(api.tables.getRows).mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useMessages());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("Network error");
    expect(result.current.messages).toEqual([]);
  });
});

describe("useMarkAsRead", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls the API to update read_status", async () => {
    vi.mocked(api.tables.updateRow).mockResolvedValue(new Response());

    const { result } = renderHook(() => useMarkAsRead());

    await result.current(5);

    expect(api.tables.updateRow).toHaveBeenCalledWith("messages", 5, {
      read_status: 1,
    });
  });
});
