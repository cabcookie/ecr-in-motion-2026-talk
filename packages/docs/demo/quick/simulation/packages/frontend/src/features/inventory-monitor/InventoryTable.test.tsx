import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { InventoryTable } from "./InventoryTable";
import type { InventoryItem } from "@/entities/inventory";

const mockItems: InventoryItem[] = [
  {
    id: 1,
    sku: "SKU-001",
    product_name: "Bio-Vollmilch 3,5%",
    quantity: 120,
    location: "Lager-A1",
    last_updated: "2025-01-15T10:00:00Z",
    coverage_days: 2,
  },
  {
    id: 2,
    sku: "SKU-002",
    product_name: "Weizenbrötchen 6er",
    quantity: 450,
    location: "Lager-B3",
    last_updated: "2025-01-15T09:30:00Z",
    coverage_days: 4,
  },
  {
    id: 3,
    sku: "SKU-003",
    product_name: "Apfelsaft 1L",
    quantity: 800,
    location: "Lager-C2",
    last_updated: "2025-01-15T08:00:00Z",
    coverage_days: 7,
  },
];

describe("InventoryTable", () => {
  it("renders table headers correctly", () => {
    render(<InventoryTable items={mockItems} />);

    expect(screen.getByText("SKU")).toBeInTheDocument();
    expect(screen.getByText("Produkt")).toBeInTheDocument();
    expect(screen.getByText("Menge")).toBeInTheDocument();
    expect(screen.getByText("Lagerort")).toBeInTheDocument();
    expect(screen.getByText("Coverage Days")).toBeInTheDocument();
    expect(screen.getByText("Letzte Aktualisierung")).toBeInTheDocument();
  });

  it("renders inventory items with SKU, product name, quantity, location", () => {
    render(<InventoryTable items={mockItems} />);

    expect(screen.getByText("SKU-001")).toBeInTheDocument();
    expect(screen.getByText("Bio-Vollmilch 3,5%")).toBeInTheDocument();
    expect(screen.getByText("120")).toBeInTheDocument();
    expect(screen.getByText("Lager-A1")).toBeInTheDocument();

    expect(screen.getByText("SKU-002")).toBeInTheDocument();
    expect(screen.getByText("Weizenbrötchen 6er")).toBeInTheDocument();
  });

  it("shows warning icon for items with coverage_days < 3", () => {
    render(<InventoryTable items={mockItems} />);

    // Item with coverage_days=2 should have warning icon
    const rows = screen.getAllByRole("row");
    // Row 0 is header, Row 1 is first item (coverage_days=2)
    expect(rows[1].textContent).toContain("⚠️");
    expect(rows[1].textContent).toContain("2");

    // Items with coverage_days >= 3 should not have warning icon
    expect(rows[2].textContent).not.toContain("⚠️");
    expect(rows[3].textContent).not.toContain("⚠️");
  });

  it("applies red background to rows with coverage_days < 3", () => {
    const { container } = render(<InventoryTable items={mockItems} />);

    const rows = container.querySelectorAll("tbody tr");
    // First row (coverage_days=2) should have critical background
    expect(rows[0]).toHaveStyle({ backgroundColor: "#fde8e8" });
  });

  it("applies yellow background to rows with coverage_days 3-5", () => {
    const { container } = render(<InventoryTable items={mockItems} />);

    const rows = container.querySelectorAll("tbody tr");
    // Second row (coverage_days=4) should have warning background
    expect(rows[1]).toHaveStyle({ backgroundColor: "#fef3cd" });
  });

  it("shows placeholder when items array is empty", () => {
    render(<InventoryTable items={[]} />);

    expect(
      screen.getByText("Keine Bestandsdaten vorhanden."),
    ).toBeInTheDocument();
  });
});
