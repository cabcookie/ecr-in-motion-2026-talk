/**
 * Entity: Supplier
 * Domain-Modell für Lieferanten.
 */

export interface Supplier {
  id: number;
  name: string;
  region: string;
  products: string;
  otd_score: number;
  risk_cluster: string | null;
  contract_status: "active" | "negotiation" | "suspended";
}
