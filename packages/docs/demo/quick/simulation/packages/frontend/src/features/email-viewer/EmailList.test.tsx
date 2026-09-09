import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EmailList } from "./EmailList";
import type { Message } from "@/entities/message";

const mockMessages: Message[] = [
  {
    id: 1,
    channel: "outlook",
    sender: "thomas.mueller@freshfood-gmbh.de",
    recipient: "markus.weber@aldi-sued.de",
    subject: "Lieferverzögerung Frischware KW23",
    body: "Sehr geehrter Herr Weber, aufgrund eines Ausfalls in unserer Kühlkette kommt es zu Verzögerungen bei der Lieferung der Frischware für KW23.",
    timestamp: "2025-01-15T09:30:00Z",
    read_status: 0,
    thread_id: "thread-001",
  },
  {
    id: 2,
    channel: "outlook",
    sender: "anna.schmidt@aldi-sued.de",
    recipient: "markus.weber@aldi-sued.de",
    subject: "KPI-Report: OTD unter Schwellenwert",
    body: "Hallo Markus, die On-Time-Delivery-Rate ist auf 87% gefallen. Bitte prüfe die betroffenen Lieferanten.",
    timestamp: "2025-01-14T14:15:00Z",
    read_status: 1,
    thread_id: null,
  },
  {
    id: 3,
    channel: "outlook",
    sender: "logistics@spedition-schneider.de",
    recipient: "markus.weber@aldi-sued.de",
    subject: "Transportbestätigung Auftrag #4521",
    body: "Die Ladung wurde planmäßig abgeholt und befindet sich auf dem Weg zum Zentrallager Mülheim.",
    timestamp: "2025-01-14T08:00:00Z",
    read_status: 1,
    thread_id: "thread-003",
  },
];

describe("EmailList", () => {
  it("renders a list of messages with correct sender, subject, and timestamp", () => {
    render(
      <EmailList
        messages={mockMessages}
        selectedId={null}
        onSelect={vi.fn()}
      />,
    );

    expect(
      screen.getByText("thomas.mueller@freshfood-gmbh.de"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Lieferverzögerung Frischware KW23"),
    ).toBeInTheDocument();

    expect(screen.getByText("anna.schmidt@aldi-sued.de")).toBeInTheDocument();
    expect(
      screen.getByText("KPI-Report: OTD unter Schwellenwert"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("logistics@spedition-schneider.de"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Transportbestätigung Auftrag #4521"),
    ).toBeInTheDocument();
  });

  it("shows unread indicator (blue dot) for unread messages", () => {
    const { container } = render(
      <EmailList
        messages={mockMessages}
        selectedId={null}
        onSelect={vi.fn()}
      />,
    );

    // The unread dot has a specific style: 8px round blue element
    const dots = container.querySelectorAll(
      '[style*="background-color: rgb(0, 120, 212)"]',
    );
    // Only message id=1 is unread
    expect(dots.length).toBe(1);
  });

  it('shows placeholder text "Keine E-Mails vorhanden." when messages array is empty', () => {
    render(<EmailList messages={[]} selectedId={null} onSelect={vi.fn()} />);

    expect(screen.getByText("Keine E-Mails vorhanden.")).toBeInTheDocument();
  });

  it("calls onSelect when a message item is clicked", () => {
    const onSelect = vi.fn();
    render(
      <EmailList
        messages={mockMessages}
        selectedId={null}
        onSelect={onSelect}
      />,
    );

    fireEvent.click(screen.getByText("Lieferverzögerung Frischware KW23"));
    expect(onSelect).toHaveBeenCalledWith(mockMessages[0]);
  });
});
