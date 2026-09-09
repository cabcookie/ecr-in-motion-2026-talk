import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChannelList } from "./ChannelList";
import type { Message } from "@/entities/message";

function makeMessage(overrides: Partial<Message> = {}): Message {
  return {
    id: 1,
    channel: "teams",
    sender: "alice@aldi-sued.de",
    recipient: "bob@aldi-sued.de",
    subject: null,
    body: "Hallo",
    timestamp: "2025-01-15T10:00:00Z",
    read_status: 0,
    thread_id: "thread-1",
    ...overrides,
  };
}

describe("ChannelList", () => {
  it("renders channel list from thread_id grouping", () => {
    const threads = new Map<string, Message[]>([
      ["Logistik-Team", [makeMessage({ id: 1 }), makeMessage({ id: 2 })]],
      ["Einkauf", [makeMessage({ id: 3 })]],
    ]);

    render(
      <ChannelList
        threads={threads}
        selectedThreadId={null}
        onSelectThread={vi.fn()}
      />,
    );

    expect(screen.getByText("Logistik-Team")).toBeInTheDocument();
    expect(screen.getByText("Einkauf")).toBeInTheDocument();
  });

  it("shows message count per channel", () => {
    const threads = new Map<string, Message[]>([
      ["Logistik-Team", [makeMessage({ id: 1 }), makeMessage({ id: 2 })]],
      ["Einkauf", [makeMessage({ id: 3 })]],
    ]);

    render(
      <ChannelList
        threads={threads}
        selectedThreadId={null}
        onSelectThread={vi.fn()}
      />,
    );

    expect(screen.getByText("2 Nachrichten")).toBeInTheDocument();
    expect(screen.getByText("1 Nachricht")).toBeInTheDocument();
  });

  it("shows empty state when no channels", () => {
    const threads = new Map<string, Message[]>();

    render(
      <ChannelList
        threads={threads}
        selectedThreadId={null}
        onSelectThread={vi.fn()}
      />,
    );

    expect(screen.getByText("Keine Kanäle vorhanden.")).toBeInTheDocument();
  });
});
