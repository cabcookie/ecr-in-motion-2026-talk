/**
 * Entity: Inventory
 * Domain-Modell für Bestandsdaten.
 */

export interface InventoryItem {
  id: number;
  sku: string;
  product_name: string;
  quantity: number;
  location: string;
  last_updated: string;
  coverage_days: number;
}
