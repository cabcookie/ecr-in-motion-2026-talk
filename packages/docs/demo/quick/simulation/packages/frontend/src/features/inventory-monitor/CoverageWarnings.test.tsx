import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CoverageWarnings } from "./CoverageWarnings";
import type { InventoryItem } from "@/entities/inventory";

const mockItems: InventoryItem[] = [
  {
    id: 1,
    sku: "SKU-001",
    product_name: "Bio-Vollmilch 3,5%",
    quantity: 120,
    location: "Lager-A1",
    last_updated: "2025-01-15T10:00:00Z",
    coverage_days: 1,
  },
  {
    id: 2,
    sku: "SKU-002",
    product_name: "Weizenbrötchen 6er",
    quantity: 450,
    location: "Lager-B3",
    last_updated: "2025-01-15T09:30:00Z",
    coverage_days: 2,
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

describe("CoverageWarnings", () => {
  it("shows warning panel with critical items (coverage_days < 3)", () => {
    render(<CoverageWarnings items={mockItems} />);

    expect(screen.getByText(/Kritische Bestände/)).toBeInTheDocument();
    expect(
      screen.getByText(/2 SKUs unter 3 Tage Coverage/),
    ).toBeInTheDocument();
  });

  it("lists each critical SKU with name, coverage days, and location", () => {
    render(<CoverageWarnings items={mockItems} />);

    expect(screen.getByText("SKU-001")).toBeInTheDocument();
    expect(screen.getByText("Bio-Vollmilch 3,5%")).toBeInTheDocument();
    expect(screen.getByText("(Lager-A1)")).toBeInTheDocument();

    expect(screen.getByText("SKU-002")).toBeInTheDocument();
    expect(screen.getByText("Weizenbrötchen 6er")).toBeInTheDocument();
  });

  it("does not list items with sufficient coverage", () => {
    render(<CoverageWarnings items={mockItems} />);

    expect(screen.queryByText("SKU-003")).not.toBeInTheDocument();
    expect(screen.queryByText("Apfelsaft 1L")).not.toBeInTheDocument();
  });

  it("shows success message when no items have critical coverage", () => {
    const safeItems: InventoryItem[] = [
      {
        id: 4,
        sku: "SKU-004",
        product_name: "Mineralwasser",
        quantity: 1000,
        location: "Lager-D1",
        last_updated: "2025-01-15T10:00:00Z",
        coverage_days: 10,
      },
    ];

    render(<CoverageWarnings items={safeItems} />);

    expect(
      screen.getByText(/Alle SKUs haben ausreichende Coverage-Days/),
    ).toBeInTheDocument();
  });
});
