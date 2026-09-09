import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmailDetail } from "./EmailDetail";
import type { Message } from "@/entities/message";

const mockMessage: Message = {
  id: 1,
  channel: "outlook",
  sender: "thomas.mueller@freshfood-gmbh.de",
  recipient: "markus.weber@aldi-sued.de",
  subject: "Lieferverzögerung Frischware KW23",
  body: "Sehr geehrter Herr Weber, aufgrund eines Ausfalls in unserer Kühlkette kommt es zu Verzögerungen bei der Lieferung der Frischware für KW23. Wir rechnen mit einer Verspätung von 2-3 Tagen.",
  timestamp: "2025-01-15T09:30:00Z",
  read_status: 0,
  thread_id: "thread-001",
};

describe("EmailDetail", () => {
  it("renders the email detail with sender, subject, and body", () => {
    render(<EmailDetail message={mockMessage} />);

    expect(
      screen.getByText("Lieferverzögerung Frischware KW23"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("thomas.mueller@freshfood-gmbh.de"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/aufgrund eines Ausfalls in unserer Kühlkette/),
    ).toBeInTheDocument();
  });

  it("shows placeholder when message is null", () => {
    render(<EmailDetail message={null} />);

    expect(
      screen.getByText("Wählen Sie eine E-Mail aus, um sie hier anzuzeigen."),
    ).toBeInTheDocument();
  });

  it("displays the recipient", () => {
    render(<EmailDetail message={mockMessage} />);

    expect(
      screen.getByText("An: markus.weber@aldi-sued.de"),
    ).toBeInTheDocument();
  });
});
