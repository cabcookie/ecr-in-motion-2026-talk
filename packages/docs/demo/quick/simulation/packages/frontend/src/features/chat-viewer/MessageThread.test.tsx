import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MessageThread } from "./MessageThread";
import type { Message } from "@/entities/message";

function makeMessage(overrides: Partial<Message> = {}): Message {
  return {
    id: 1,
    channel: "teams",
    sender: "alice@aldi-sued.de",
    recipient: "bob@aldi-sued.de",
    subject: null,
    body: "Nachricht Inhalt",
    timestamp: "2025-01-15T10:00:00Z",
    read_status: 0,
    thread_id: "thread-1",
    ...overrides,
  };
}

describe("MessageThread", () => {
  it("shows empty state when no thread is selected", () => {
    render(<MessageThread threadId={null} messages={[]} />);

    expect(
      screen.getByText(
        "Wählen Sie einen Kanal aus, um die Nachrichten zu sehen.",
      ),
    ).toBeInTheDocument();
  });

  it("renders messages for selected thread with sender and body", () => {
    const messages: Message[] = [
      makeMessage({
        id: 1,
        sender: "thomas.mueller@freshfood.de",
        body: "Lieferung kommt morgen",
      }),
      makeMessage({
        id: 2,
        sender: "anna.schmidt@aldi-sued.de",
        body: "Danke für die Info",
      }),
    ];

    render(<MessageThread threadId="Logistik-Team" messages={messages} />);

    expect(screen.getByText("Logistik-Team")).toBeInTheDocument();
    expect(screen.getByText("thomas.mueller@freshfood.de")).toBeInTheDocument();
    expect(screen.getByText("Lieferung kommt morgen")).toBeInTheDocument();
    expect(screen.getByText("anna.schmidt@aldi-sued.de")).toBeInTheDocument();
    expect(screen.getByText("Danke für die Info")).toBeInTheDocument();
  });

  it("shows empty messages state when thread is selected but has no messages", () => {
    render(<MessageThread threadId="Leerer-Kanal" messages={[]} />);

    expect(
      screen.getByText("Keine Nachrichten in diesem Kanal."),
    ).toBeInTheDocument();
  });
});
