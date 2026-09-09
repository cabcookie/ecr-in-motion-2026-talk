/**
 * Seed data generator for the ALDI SÜD Supply Chain Simulation.
 *
 * Generates:
 * - demo_config entries (anchor_date, pre_aged_mode, buyer_role_id, polling_interval_ms, 8 disruption scenarios)
 * - 6 roles in the roles table
 * - 18 realistic seed emails in the Outlook channel
 * - 12 Teams chat messages in 5 threads
 * - 54–60 SKUs in inventory with coverage days and warehouse locations
 * - 30 days KPI history in kpi_states (OTD, OSA, cost, MAPE)
 * - 14 days inventory movements (as inventory entries with varying timestamps)
 * - Suppliers in suppliers table with OTD score and risk cluster
 *
 * All timestamps are calculated relative to the anchor date.
 */

import type Database from "better-sqlite3";
import { computeTimestamp, type SeedOffset } from "./anchor-date.js";

// ─── Interfaces ─────────────────────────────────────────────────────────────

interface SeedEmail {
  channel: "outlook" | "teams";
  sender: string;
  recipient: string;
  subject: string | null;
  body: string;
  offset: SeedOffset;
  read_status: number;
  thread_id: string | null;
}

interface SeedRole {
  id: string;
  name: string;
  display_name: string;
  description: string;
  systems_access: string[];
  polling_interval: number;
}

interface SeedSku {
  sku: string;
  product_name: string;
  quantity: number;
  location: string;
  coverage_days: number;
}

interface SeedSupplier {
  name: string;
  region: string;
  products: string[];
  otd_score: number;
  risk_cluster: string | null;
  contract_status: string;
}

// ─── Role Definitions (Req 4.1–4.7) ────────────────────────────────────────

const SEED_ROLES: SeedRole[] = [
  {
    id: "assortment_planning",
    name: "Assortment Planning",
    display_name: "Peter Hoffmann",
    description: "Access to SAP (master data), SKU decisions and substitutions",
    systems_access: ["sap"],
    polling_interval: 10000,
  },
  {
    id: "buyer",
    name: "Procurement",
    display_name: "Markus Weber",
    description:
      "Responsible for 54-60 SKUs, supplier negotiations, contract management",
    systems_access: ["sap_ariba", "outlook", "teams"],
    polling_interval: 10000,
  },
  {
    id: "sc_coordinator",
    name: "SC Coordinator",
    display_name: "Sandra Klein",
    description:
      "Coordination and logistics expertise for procurement teams, SAP, Manhattan WMS, Teams",
    systems_access: ["sap", "manhattan_wms", "teams"],
    polling_interval: 10000,
  },
  {
    id: "logistics",
    name: "Logistics",
    display_name: "Thomas Müller",
    description:
      "Operational supply chain monitoring, escalation to procurement",
    systems_access: ["manhattan_wms", "sap", "teams"],
    polling_interval: 10000,
  },
  {
    id: "store_replenishment",
    name: "Store Replenishment",
    display_name: "Julia Braun",
    description: "Automated replenishment and OSA monitoring",
    systems_access: ["sap", "manhattan_wms"],
    polling_interval: 10000,
  },
  {
    id: "supplier_agent",
    name: "Supplier Agent",
    display_name: "External Supplier",
    description:
      "Simulates multiple suppliers of the buyer, communicates exclusively via Outlook",
    systems_access: ["outlook"],
    polling_interval: 10000,
  },
];

// ─── SKU Definitions (54 SKUs across VZ-Mülheim and VZ-Duisburg) ───────────

const SEED_SKUS: SeedSku[] = [
  // Dairy Products (12 SKUs)
  {
    sku: "2101",
    product_name: "Frische Vollmilch 3,5% 1L",
    quantity: 4800,
    location: "VZ-Mülheim",
    coverage_days: 5.2,
  },
  {
    sku: "2102",
    product_name: "Fettarme Milch 1,5% 1L",
    quantity: 3200,
    location: "VZ-Mülheim",
    coverage_days: 4.8,
  },
  {
    sku: "2103",
    product_name: "H-Milch 3,5% 1L",
    quantity: 8500,
    location: "VZ-Duisburg",
    coverage_days: 18.5,
  },
  {
    sku: "2104",
    product_name: "H-Milch 1,5% 1L",
    quantity: 7200,
    location: "VZ-Duisburg",
    coverage_days: 16.0,
  },
  {
    sku: "2105",
    product_name: "Frische Vollmilch 1L Bio",
    quantity: 1200,
    location: "VZ-Mülheim",
    coverage_days: 2.1,
  },
  {
    sku: "2107",
    product_name: "Sahne 200ml",
    quantity: 1600,
    location: "VZ-Mülheim",
    coverage_days: 2.9,
  },
  {
    sku: "2201",
    product_name: "Naturjoghurt 500g",
    quantity: 3600,
    location: "VZ-Mülheim",
    coverage_days: 6.1,
  },
  {
    sku: "2202",
    product_name: "Fruchtjoghurt Erdbeere 150g 4er",
    quantity: 2800,
    location: "VZ-Duisburg",
    coverage_days: 4.5,
  },
  {
    sku: "2203",
    product_name: "Bio-Joghurt natur 500g",
    quantity: 900,
    location: "VZ-Mülheim",
    coverage_days: 1.8,
  },
  {
    sku: "2301",
    product_name: "Deutsche Markenbutter 250g",
    quantity: 1400,
    location: "VZ-Mülheim",
    coverage_days: 2.5,
  },
  {
    sku: "2302",
    product_name: "Gouda jung 200g",
    quantity: 4200,
    location: "VZ-Duisburg",
    coverage_days: 8.4,
  },
  {
    sku: "2303",
    product_name: "Mozzarella 125g",
    quantity: 2600,
    location: "VZ-Mülheim",
    coverage_days: 5.0,
  },
  // Beverages - Coffee/Tea (8 SKUs)
  {
    sku: "3101",
    product_name: "Bio Arabica Ganze Bohne 500g",
    quantity: 6000,
    location: "VZ-Duisburg",
    coverage_days: 22.0,
  },
  {
    sku: "3102",
    product_name: "Filterkaffee gemahlen 500g",
    quantity: 7500,
    location: "VZ-Mülheim",
    coverage_days: 25.0,
  },
  {
    sku: "3103",
    product_name: "Espresso Ganze Bohne 1kg",
    quantity: 3200,
    location: "VZ-Duisburg",
    coverage_days: 18.0,
  },
  {
    sku: "3104",
    product_name: "Kaffee-Pads Classic 36er",
    quantity: 4100,
    location: "VZ-Mülheim",
    coverage_days: 14.5,
  },
  {
    sku: "3201",
    product_name: "Schwarzer Tee English Breakfast 20er",
    quantity: 5800,
    location: "VZ-Duisburg",
    coverage_days: 35.0,
  },
  {
    sku: "3202",
    product_name: "Grüner Tee Sencha 20er",
    quantity: 4200,
    location: "VZ-Duisburg",
    coverage_days: 30.0,
  },
  {
    sku: "3203",
    product_name: "Pfefferminztee 25er",
    quantity: 6100,
    location: "VZ-Mülheim",
    coverage_days: 40.0,
  },
  {
    sku: "3204",
    product_name: "Kamillentee 25er",
    quantity: 5500,
    location: "VZ-Mülheim",
    coverage_days: 38.0,
  },
  // Confectionery (8 SKUs)
  {
    sku: "4101",
    product_name: "Vollmilch Schokolade 100g",
    quantity: 9200,
    location: "VZ-Duisburg",
    coverage_days: 28.0,
  },
  {
    sku: "4102",
    product_name: "Zartbitter Schokolade 100g",
    quantity: 5600,
    location: "VZ-Duisburg",
    coverage_days: 24.0,
  },
  {
    sku: "4103",
    product_name: "Merci Finest Selection 250g",
    quantity: 3800,
    location: "VZ-Mülheim",
    coverage_days: 15.0,
  },
  {
    sku: "4104",
    product_name: "Toffifee 125g",
    quantity: 4500,
    location: "VZ-Mülheim",
    coverage_days: 18.0,
  },
  {
    sku: "4105",
    product_name: "Knoppers 8er",
    quantity: 5100,
    location: "VZ-Duisburg",
    coverage_days: 20.0,
  },
  {
    sku: "4106",
    product_name: "Gummibärchen 300g",
    quantity: 7800,
    location: "VZ-Mülheim",
    coverage_days: 32.0,
  },
  {
    sku: "4107",
    product_name: "Kekse Butterkeks 400g",
    quantity: 4800,
    location: "VZ-Duisburg",
    coverage_days: 22.0,
  },
  {
    sku: "4108",
    product_name: "Müsliriegel Schoko 6er",
    quantity: 3600,
    location: "VZ-Mülheim",
    coverage_days: 16.0,
  },
  // Fruit & Vegetables (8 SKUs)
  {
    sku: "5101",
    product_name: "Bananen 1kg",
    quantity: 2400,
    location: "VZ-Mülheim",
    coverage_days: 3.5,
  },
  {
    sku: "5102",
    product_name: "Äpfel Elstar 1kg",
    quantity: 3100,
    location: "VZ-Duisburg",
    coverage_days: 7.0,
  },
  {
    sku: "5103",
    product_name: "Tomaten Rispen 500g",
    quantity: 1800,
    location: "VZ-Mülheim",
    coverage_days: 3.2,
  },
  {
    sku: "5104",
    product_name: "Gurke Stück",
    quantity: 2200,
    location: "VZ-Duisburg",
    coverage_days: 4.0,
  },
  {
    sku: "5105",
    product_name: "Paprika Mix 500g",
    quantity: 1600,
    location: "VZ-Mülheim",
    coverage_days: 3.8,
  },
  {
    sku: "5106",
    product_name: "Salat Eisberg Stück",
    quantity: 1400,
    location: "VZ-Mülheim",
    coverage_days: 2.8,
  },
  {
    sku: "5107",
    product_name: "Zitronen 500g Netz",
    quantity: 3500,
    location: "VZ-Duisburg",
    coverage_days: 12.0,
  },
  {
    sku: "5108",
    product_name: "Kartoffeln festkochend 2kg",
    quantity: 4600,
    location: "VZ-Duisburg",
    coverage_days: 14.0,
  },
  // Frozen Products (6 SKUs)
  {
    sku: "3401",
    product_name: "Buttergemüse TK 450g",
    quantity: 3800,
    location: "VZ-Mülheim",
    coverage_days: 12.0,
  },
  {
    sku: "3402",
    product_name: "Rahmspinat TK 450g",
    quantity: 3200,
    location: "VZ-Duisburg",
    coverage_days: 15.0,
  },
  {
    sku: "3403",
    product_name: "Pizza Margherita TK 3er",
    quantity: 4500,
    location: "VZ-Mülheim",
    coverage_days: 18.0,
  },
  {
    sku: "3404",
    product_name: "Fischstäbchen TK 15er",
    quantity: 3000,
    location: "VZ-Duisburg",
    coverage_days: 20.0,
  },
  {
    sku: "3405",
    product_name: "Pommes Frites TK 1kg",
    quantity: 5200,
    location: "VZ-Mülheim",
    coverage_days: 22.0,
  },
  {
    sku: "3406",
    product_name: "Eis Vanille 500ml",
    quantity: 2800,
    location: "VZ-Duisburg",
    coverage_days: 25.0,
  },
  // Staples (6 SKUs)
  {
    sku: "6101",
    product_name: "Spaghetti 500g",
    quantity: 8500,
    location: "VZ-Mülheim",
    coverage_days: 45.0,
  },
  {
    sku: "6102",
    product_name: "Basmati-Reis 1kg",
    quantity: 5200,
    location: "VZ-Duisburg",
    coverage_days: 35.0,
  },
  {
    sku: "6103",
    product_name: "Weizenmehl Type 405 1kg",
    quantity: 6800,
    location: "VZ-Mülheim",
    coverage_days: 40.0,
  },
  {
    sku: "6104",
    product_name: "Sonnenblumenöl 1L",
    quantity: 4100,
    location: "VZ-Duisburg",
    coverage_days: 28.0,
  },
  {
    sku: "6105",
    product_name: "Zucker 1kg",
    quantity: 7200,
    location: "VZ-Mülheim",
    coverage_days: 50.0,
  },
  {
    sku: "6106",
    product_name: "Bio Haferflocken kernig 500g",
    quantity: 3800,
    location: "VZ-Duisburg",
    coverage_days: 30.0,
  },
  // Beverages - Juice/Water (6 SKUs)
  {
    sku: "7101",
    product_name: "Mineralwasser still 1,5L",
    quantity: 12000,
    location: "VZ-Mülheim",
    coverage_days: 8.0,
  },
  {
    sku: "7102",
    product_name: "Mineralwasser medium 1,5L",
    quantity: 10500,
    location: "VZ-Duisburg",
    coverage_days: 7.5,
  },
  {
    sku: "7103",
    product_name: "Orangensaft 1L",
    quantity: 4800,
    location: "VZ-Mülheim",
    coverage_days: 10.0,
  },
  {
    sku: "7104",
    product_name: "Apfelsaft naturtrüb 1L",
    quantity: 4200,
    location: "VZ-Duisburg",
    coverage_days: 12.0,
  },
  {
    sku: "7105",
    product_name: "Multivitaminsaft 1L",
    quantity: 3600,
    location: "VZ-Mülheim",
    coverage_days: 11.0,
  },
  {
    sku: "7106",
    product_name: "Cola 1,5L",
    quantity: 8800,
    location: "VZ-Duisburg",
    coverage_days: 9.0,
  },
];

// ─── Supplier Definitions ───────────────────────────────────────────────────

const SEED_SUPPLIERS: SeedSupplier[] = [
  {
    name: "NewCoffee Trading GmbH",
    region: "Südamerika/Hamburg",
    products: ["3101", "3102", "3103", "3104"],
    otd_score: 0.962,
    risk_cluster: "geo_energy_transport",
    contract_status: "active",
  },
  {
    name: "Storck GmbH & Co. KG",
    region: "Deutschland",
    products: ["4103", "4104", "4105"],
    otd_score: 0.914,
    risk_cluster: null,
    contract_status: "active",
  },
  {
    name: "Müller Milch GmbH",
    region: "Deutschland/Bayern",
    products: ["2101", "2102", "2105", "2107", "2201", "2203", "2301"],
    otd_score: 0.981,
    risk_cluster: "climate_agri_fresh",
    contract_status: "active",
  },
  {
    name: "FreshFruit Import GmbH",
    region: "Ecuador/Kolumbien",
    products: ["5101", "5102", "5103"],
    otd_score: 0.853,
    risk_cluster: "geo_energy_transport",
    contract_status: "active",
  },
  {
    name: "Kölln GmbH & Co. KGaA",
    region: "Deutschland/Elmshorn",
    products: ["6106"],
    otd_score: 0.875,
    risk_cluster: "climate_agri_fresh",
    contract_status: "negotiation",
  },
  {
    name: "Bauckhof GmbH",
    region: "Deutschland/Niedersachsen",
    products: ["6106"],
    otd_score: 0.945,
    risk_cluster: "climate_agri_fresh",
    contract_status: "active",
  },
  {
    name: "Dole Europe GmbH",
    region: "Mittelamerika/Hamburg",
    products: ["5101", "5104"],
    otd_score: 0.932,
    risk_cluster: "geo_energy_transport",
    contract_status: "active",
  },
  {
    name: "Teekanne GmbH & Co. KG",
    region: "Deutschland/Düsseldorf",
    products: ["3201", "3202", "3203", "3204"],
    otd_score: 0.978,
    risk_cluster: null,
    contract_status: "active",
  },
  {
    name: "Südfrüchte Logistik AG",
    region: "Spanien/Valencia",
    products: ["5107", "5105", "5106"],
    otd_score: 0.921,
    risk_cluster: "climate_agri_fresh",
    contract_status: "active",
  },
  {
    name: "NordGrain Handels GmbH",
    region: "Deutschland/Bremen",
    products: ["6101", "6102", "6103", "6105"],
    otd_score: 0.956,
    risk_cluster: "geo_energy_transport",
    contract_status: "active",
  },
];

// ─── Disruption Scenario Configurations (Req 5.1, 5.6, 12.2) ───────────────

interface DisruptionScenarioConfig {
  key: string;
  type: string;
  label: string;
  margin_impact_bps: number;
  duration_days: number;
  probability: number;
  risk_cluster: string | null;
  affected_skus: string[];
}

const DISRUPTION_SCENARIOS: DisruptionScenarioConfig[] = [
  {
    key: "scenario_recall",
    type: "recall",
    label: "Recall",
    margin_impact_bps: 18,
    duration_days: 7,
    probability: 0.05,
    risk_cluster: null,
    affected_skus: ["2101", "2102", "2105"],
  },
  {
    key: "scenario_packaging_change",
    type: "packaging_change",
    label: "Packaging Change",
    margin_impact_bps: 18,
    duration_days: 14,
    probability: 0.15,
    risk_cluster: null,
    affected_skus: ["4101", "4102", "4103"],
  },
  {
    key: "scenario_seasonal_peaks",
    type: "seasonal_peaks",
    label: "Seasonal Peaks",
    margin_impact_bps: 22,
    duration_days: 21,
    probability: 0.4,
    risk_cluster: "climate_agri_fresh",
    affected_skus: ["5101", "5102", "5103", "5104", "5105"],
  },
  {
    key: "scenario_it_outage",
    type: "it_outage",
    label: "IT Outage",
    margin_impact_bps: 25,
    duration_days: 3,
    probability: 0.1,
    risk_cluster: null,
    affected_skus: ["7101", "7102", "7103", "7104"],
  },
  {
    key: "scenario_extreme_weather",
    type: "extreme_weather",
    label: "Extreme Weather",
    margin_impact_bps: 30,
    duration_days: 14,
    probability: 0.2,
    risk_cluster: "climate_agri_fresh",
    affected_skus: ["5101", "5102", "5103", "5106", "5108"],
  },
  {
    key: "scenario_minimum_wage",
    type: "minimum_wage_increase",
    label: "Minimum Wage Increase",
    margin_impact_bps: 45,
    duration_days: 90,
    probability: 0.3,
    risk_cluster: "geo_energy_transport",
    affected_skus: ["6101", "6102", "6103", "6104", "6105", "6106"],
  },
  {
    key: "scenario_supply_chain_disruption",
    type: "supply_chain_disruption",
    label: "Supply Chain Disruption",
    margin_impact_bps: 50,
    duration_days: 30,
    probability: 0.15,
    risk_cluster: "geo_energy_transport",
    affected_skus: ["3101", "3102", "3103", "5101", "5107"],
  },
  {
    key: "scenario_pandemic",
    type: "pandemic",
    label: "Pandemic",
    margin_impact_bps: 125,
    duration_days: 180,
    probability: 0.02,
    risk_cluster: null,
    affected_skus: ["7101", "7102", "6101", "6103", "6105", "2101", "2102"],
  },
];

// ─── Seed Emails (unchanged from Slice 1) ───────────────────────────────────
const SEED_EMAILS: SeedEmail[] = [
  // --- Older emails (read) ---
  {
    channel: "outlook",
    sender: "thomas.mueller@aldi-sued.de",
    recipient: "markus.weber@aldi-sued.de",
    subject: "Weekly Logistics Status Report CW 27",
    body: "Hi Markus,\n\nplease find attached the weekly status report for CW 27. Utilization at VZ Mülheim is currently at 87%. Two truck loads from Rotterdam were delayed by one day (traffic jam on A3). No critical bottlenecks.\n\nRegards,\nThomas",
    offset: { days: -12, hours: 9, minutes: 15 },
    read_status: 1,
    thread_id: "thread-logistik-kw27",
  },
  {
    channel: "outlook",
    sender: "newsletter@rohstoffpreise-aktuell.de",
    recipient: "markus.weber@aldi-sued.de",
    subject: "Commodity Price Report: Coffee, Cocoa, Sugar – CW 27",
    body: "Dear Mr. Weber,\n\ncurrent commodity prices at a glance:\n- Arabica coffee: +3.2% (frost warning Brazil)\n- Cocoa: -1.1% (stable harvest Ivory Coast)\n- Sugar: +0.8% (slightly above previous week)\n\nDetails in the attached PDF.\n\nBest regards,\nYour Commodity Price Team",
    offset: { days: -11, hours: 8, minutes: 30 },
    read_status: 1,
    thread_id: null,
  },
  {
    channel: "outlook",
    sender: "kontakt@newcoffee-trading.com",
    recipient: "markus.weber@aldi-sued.de",
    subject: "Order Confirmation PO-2025-4471 – Bio Arabica 500g",
    body: "Dear Mr. Weber,\n\nwe hereby confirm your order PO-2025-4471:\n- Item: Bio Arabica Ganze Bohne 500g\n- Quantity: 12,000 units\n- Delivery date: expected 18.07.2025\n- Shipping from warehouse Hamburg\n\nPlease do not hesitate to contact us if you have any questions.\n\nBest regards,\nStefan Hartmann\nNewCoffee Trading GmbH",
    offset: { days: -10, hours: 10, minutes: 45 },
    read_status: 1,
    thread_id: "thread-po-4471",
  },
  {
    channel: "outlook",
    sender: "sandra.klein@aldi-sued.de",
    recipient: "markus.weber@aldi-sued.de",
    subject: "SC Coordinator Update – Supplier Performance Q2",
    body: "Hi Markus,\n\nquick update on supplier performance in Q2:\n- NewCoffee: OTD 96.2% (stable)\n- Storck: OTD 91.4% (slight decline, monitoring)\n- Müller Milch: OTD 98.1% (very good)\n- FreshFruit Import: OTD 88.7% (below threshold, recommend discussion)\n\nCan we have a quick call about this on Thursday?\n\nBest, Sandra",
    offset: { days: -9, hours: 14, minutes: 20 },
    read_status: 1,
    thread_id: "thread-performance-q2",
  },
  {
    channel: "outlook",
    sender: "peter.hoffmann@aldi-sued.de",
    recipient: "markus.weber@aldi-sued.de",
    subject: "Assortment Planning: Item Substitution Proposal Oat Flakes",
    body: "Hi Markus,\n\ndue to the ongoing delivery issues with Kölln, I suggest temporarily substituting the item 'Bio Haferflocken kernig 500g' (SKU 4820) with the secondary supplier Bauckhof. Price difference: +2 cents/unit.\n\nPlease share your assessment from a procurement perspective.\n\nRegards, Peter",
    offset: { days: -8, hours: 11, minutes: 0 },
    read_status: 1,
    thread_id: "thread-substitution-hafer",
  },
  {
    channel: "outlook",
    sender: "vertrieb@storck-gmbh.de",
    recipient: "markus.weber@aldi-sued.de",
    subject: "Price Adjustment Confectionery Assortment from 01.08.2025",
    body: "Dear Mr. Weber,\n\ndue to increased raw material and energy costs, we need to adjust our prices for the confectionery assortment effective 01.08.2025:\n- Merci Finest Selection: +4.5%\n- Toffifee: +3.8%\n- Knoppers: +3.2%\n\nWe would be happy to discuss the details in a personal meeting. Would you have time next week?\n\nBest regards,\nAndreas Becker\nStorck GmbH & Co. KG",
    offset: { days: -7, hours: 9, minutes: 30 },
    read_status: 1,
    thread_id: "thread-storck-preise",
  },
  {
    channel: "outlook",
    sender: "markus.weber@aldi-sued.de",
    recipient: "vertrieb@storck-gmbh.de",
    subject: "RE: Price Adjustment Confectionery Assortment from 01.08.2025",
    body: "Dear Mr. Becker,\n\nthank you for the advance notice. I have received your breakdown and will review the terms internally.\n\nI am available for a meeting next week on Wednesday or Thursday.\n\nBest regards,\nMarkus Weber\nALDI SUED – Procurement",
    offset: { days: -7, hours: 15, minutes: 10 },
    read_status: 1,
    thread_id: "thread-storck-preise",
  },
  {
    channel: "outlook",
    sender: "julia.braun@aldi-sued.de",
    recipient: "markus.weber@aldi-sued.de",
    subject: "Store Replenishment: OSA Warning Fresh Products South Region",
    body: "Hi Markus,\n\nthe automated replenishment system is reporting OSA values below 96% for 3 SKUs in the South region:\n- Frische Vollmilch 1L (SKU 2105): OSA 94.2%\n- Bio-Joghurt natur (SKU 2203): OSA 93.8%\n- Buttergemüse TK (SKU 3401): OSA 95.1%\n\nThe cause appears to be a capacity bottleneck at Müller Milch. Please advise whether escalation is needed.\n\nBest, Julia",
    offset: { days: -6, hours: 8, minutes: 45 },
    read_status: 1,
    thread_id: "thread-osa-warnung",
  },
  {
    channel: "outlook",
    sender: "thomas.mueller@aldi-sued.de",
    recipient: "markus.weber@aldi-sued.de",
    subject: "Weekly Logistics Status Report CW 28",
    body: "Hi Markus,\n\nstatus report CW 28:\n- VZ Mülheim: utilization 91% (slightly above plan)\n- VZ Duisburg: utilization 78% (within range)\n- 1 container from Vietnam delayed (Port of Hamburg, ETA +3 days)\n- Cold chain alarm: no incidents\n\nI'm keeping an eye on the Vietnam container.\n\nRegards, Thomas",
    offset: { days: -5, hours: 9, minutes: 0 },
    read_status: 1,
    thread_id: "thread-logistik-kw28",
  },
  {
    channel: "outlook",
    sender: "info@freshfruit-import.com",
    recipient: "markus.weber@aldi-sued.de",
    subject: "Delivery Delay – Bananas, Container MSKU-7281904",
    body: "Dear Mr. Weber,\n\nunfortunately we must inform you that the delivery of container MSKU-7281904 (24 pallets bananas, origin Ecuador) will be delayed by approximately 5 days.\n\nReason: Port strike in Guayaquil since July 10.\n\nWe will keep you updated on further developments.\n\nBest regards,\nMaria Gonzalez\nFreshFruit Import GmbH",
    offset: { days: -4, hours: 11, minutes: 20 },
    read_status: 1,
    thread_id: "thread-freshfruit-delay",
  },
  {
    channel: "outlook",
    sender: "sandra.klein@aldi-sued.de",
    recipient: "markus.weber@aldi-sued.de",
    subject: "RE: SC Coordinator Update – Supplier Performance Q2",
    body: "Hi Markus,\n\none more follow-up: FreshFruit Import has now dropped to 85.3% OTD due to the port strike in Ecuador. I recommend a call with the supplier next week.\n\nAlternatively, we could fill the gap short-term via the secondary supplier Dole.\n\nBest, Sandra",
    offset: { days: -3, hours: 16, minutes: 30 },
    read_status: 1,
    thread_id: "thread-performance-q2",
  },
  // --- Newer emails (partially unread) ---
  {
    channel: "outlook",
    sender: "kontakt@newcoffee-trading.com",
    recipient: "markus.weber@aldi-sued.de",
    subject: "Shipping Confirmation PO-2025-4471 – Shipped Today",
    body: "Dear Mr. Weber,\n\nwe are pleased to inform you that your order PO-2025-4471 (Bio Arabica Ganze Bohne 500g, 12,000 units) has left our Hamburg warehouse today.\n\nTracking no.: DHL-4892716340\nExpected arrival VZ Mülheim: day after tomorrow\n\nBest regards,\nStefan Hartmann\nNewCoffee Trading GmbH",
    offset: { days: -2, hours: 14, minutes: 0 },
    read_status: 1,
    thread_id: "thread-po-4471",
  },
  {
    channel: "outlook",
    sender: "qualitaet@muellermilch.de",
    recipient: "markus.weber@aldi-sued.de",
    subject: "Quality Report Batch 2025-07-B12 – Frische Vollmilch",
    body: "Dear Mr. Weber,\n\nplease find attached the quality report for batch 2025-07-B12 (Frische Vollmilch 1L):\n- Microbiology: all parameters within spec\n- Fat content: 3.52% (specification: 3.5% ± 0.1%)\n- Best before: 14 days from production\n- Sensory: flawless\n\nThe batch is cleared for shipment.\n\nBest regards,\nDr. Katharina Schmid\nMüller Milch Quality Assurance",
    offset: { days: -2, hours: 10, minutes: 15 },
    read_status: 0,
    thread_id: null,
  },
  {
    channel: "outlook",
    sender: "peter.hoffmann@aldi-sued.de",
    recipient: "markus.weber@aldi-sued.de",
    subject: "RE: Assortment Planning: Item Substitution Proposal Oat Flakes",
    body: "Hi Markus,\n\nthanks for your OK on the substitution. I have entered the switch to Bauckhof for the next 4 weeks in the system. Once Kölln can deliver again, we'll switch back.\n\nRegards, Peter",
    offset: { days: -1, hours: 8, minutes: 30 },
    read_status: 0,
    thread_id: "thread-substitution-hafer",
  },
  {
    channel: "outlook",
    sender: "info@freshfruit-import.com",
    recipient: "markus.weber@aldi-sued.de",
    subject: "Update Delivery Delay – Port Strike Ended",
    body: "Dear Mr. Weber,\n\ngood news: The port strike in Guayaquil has ended today. Container MSKU-7281904 is expected to reach VZ Mülheim in 3 days (instead of the originally stated 5-day delay).\n\nWe apologize for the inconvenience.\n\nBest regards,\nMaria Gonzalez\nFreshFruit Import GmbH",
    offset: { days: -1, hours: 15, minutes: 45 },
    read_status: 0,
    thread_id: "thread-freshfruit-delay",
  },
  {
    channel: "outlook",
    sender: "thomas.mueller@aldi-sued.de",
    recipient: "markus.weber@aldi-sued.de",
    subject: "Urgent: Temperature Alarm Cold Storage VZ Duisburg",
    body: "Hi Markus,\n\nquick heads-up: The cold storage at VZ Duisburg had a temperature alarm last night (rise to +6°C for approx. 45 min). Affects Section C (dairy products). Technicians are working on the repair.\n\nAffected SKUs are currently being checked. Will follow up with an update.\n\nRegards, Thomas",
    offset: { days: -1, hours: 8, minutes: 15 },
    read_status: 0,
    thread_id: "thread-tempalarm-duisburg",
  },
  {
    channel: "outlook",
    sender: "sandra.klein@aldi-sued.de",
    recipient: "markus.weber@aldi-sued.de",
    subject: "Coverage Days Warning: 4 SKUs Below Threshold",
    body: "Hi Markus,\n\nthe WMS is reporting coverage days below 3 for the following SKUs:\n- Frische Vollmilch 1L (SKU 2105): 2.1 days\n- Bio-Joghurt natur (SKU 2203): 1.8 days\n- Butter 250g (SKU 2301): 2.5 days\n- Sahne 200ml (SKU 2107): 2.9 days\n\nCause: The capacity bottleneck at Müller Milch is now impacting stock levels. Recommend escalation.\n\nBest, Sandra",
    offset: { days: -1, hours: 10, minutes: 30 },
    read_status: 0,
    thread_id: "thread-coverage-warnung",
  },
  {
    channel: "outlook",
    sender: "newsletter@lebensmittelzeitung.net",
    recipient: "markus.weber@aldi-sued.de",
    subject: "LZ Daily: Discount Price War – Private Labels Under Pressure",
    body: "Good morning Mr. Weber,\n\ntoday's top headlines:\n\n1. Private label prices: Aldi and Lidl under pressure from rising raw material costs\n2. Sustainability: EU Supply Chain Act – New requirements from 2026\n3. Logistics: Deutsche Bahn plans special schedule for food transport\n\nRead more at lebensmittelzeitung.net\n\nBest regards,\nYour Lebensmittel Zeitung",
    offset: { days: -1, hours: 8, minutes: 0 },
    read_status: 0,
    thread_id: null,
  },
  // --- Teams messages ---
  {
    channel: "teams",
    sender: "sandra.klein@aldi-sued.de",
    recipient: "einkauf-team@aldi-sued.de",
    subject: null,
    body: "Quick info for the team: The port strike in Ecuador is over. The delayed containers from FreshFruit Import should arrive in 3 days. @Markus – can you confirm the bridging order with Dole anyway?",
    offset: { days: -3, hours: 10, minutes: 15 },
    read_status: 1,
    thread_id: "thread-teams-hafenstreik",
  },
  {
    channel: "teams",
    sender: "markus.weber@aldi-sued.de",
    recipient: "einkauf-team@aldi-sued.de",
    subject: null,
    body: "Thanks Sandra. Yes, Dole order stays – better safe than sorry. Banana coverage at VZ Mülheim is currently only 1.5 days.",
    offset: { days: -3, hours: 10, minutes: 42 },
    read_status: 1,
    thread_id: "thread-teams-hafenstreik",
  },
  {
    channel: "teams",
    sender: "thomas.mueller@aldi-sued.de",
    recipient: "einkauf-team@aldi-sued.de",
    subject: null,
    body: "FYI: Dole has sent the order confirmation. 18 pallets bananas, ETA Wednesday VZ Mülheim. Tracking to follow.",
    offset: { days: -3, hours: 14, minutes: 5 },
    read_status: 1,
    thread_id: "thread-teams-hafenstreik",
  },
  {
    channel: "teams",
    sender: "thomas.mueller@aldi-sued.de",
    recipient: "logistik-scm@aldi-sued.de",
    subject: null,
    body: "Team, the cooling in Section C (VZ Duisburg) had an alarm last night. Technicians are on site. Please no new storage in Section C for now.",
    offset: { days: -1, hours: 7, minutes: 30 },
    read_status: 0,
    thread_id: "thread-teams-kuehlung",
  },
  {
    channel: "teams",
    sender: "julia.braun@aldi-sued.de",
    recipient: "logistik-scm@aldi-sued.de",
    subject: null,
    body: "Which SKUs are affected? I may need to reroute the automated replenishment to VZ Mülheim.",
    offset: { days: -1, hours: 7, minutes: 48 },
    read_status: 0,
    thread_id: "thread-teams-kuehlung",
  },
  {
    channel: "teams",
    sender: "thomas.mueller@aldi-sued.de",
    recipient: "logistik-scm@aldi-sued.de",
    subject: null,
    body: "Affected are: Gouda jung (2302), H-Milch 3.5% (2103), H-Milch 1.5% (2104), Fruchtjoghurt (2202). Temperature was at +6°C for 45 min. QA is currently checking whether the goods can still be released.",
    offset: { days: -1, hours: 8, minutes: 5 },
    read_status: 0,
    thread_id: "thread-teams-kuehlung",
  },
  {
    channel: "teams",
    sender: "sandra.klein@aldi-sued.de",
    recipient: "einkauf-team@aldi-sued.de",
    subject: null,
    body: "Reminder: Tomorrow at 10 AM we have the quarterly review with the top 5 suppliers. Please bring current OTD figures and open escalations. Agenda is on SharePoint.",
    offset: { days: -2, hours: 16, minutes: 0 },
    read_status: 1,
    thread_id: "thread-teams-quartalsreview",
  },
  {
    channel: "teams",
    sender: "peter.hoffmann@aldi-sued.de",
    recipient: "einkauf-team@aldi-sued.de",
    subject: null,
    body: "Quick question: Does anyone have the updated price lists from Storck? I need to enter the adjustment for 01.08. into the assortment planning.",
    offset: { days: -2, hours: 11, minutes: 20 },
    read_status: 1,
    thread_id: "thread-teams-storck-preise",
  },
  {
    channel: "teams",
    sender: "markus.weber@aldi-sued.de",
    recipient: "einkauf-team@aldi-sued.de",
    subject: null,
    body: "Peter, I'll forward you the email from Storck. Merci +4.5%, Toffifee +3.8%, Knoppers +3.2%. Still in negotiations – final terms coming next week.",
    offset: { days: -2, hours: 11, minutes: 45 },
    read_status: 1,
    thread_id: "thread-teams-storck-preise",
  },
  {
    channel: "teams",
    sender: "sandra.klein@aldi-sued.de",
    recipient: "logistik-scm@aldi-sued.de",
    subject: null,
    body: "Update coverage days warning: Frische Vollmilch (2105) now at 2.1 days, Bio-Joghurt (2203) at 1.8 days. @Markus please check escalation to Müller Milch – the bottleneck has been going on for three weeks now.",
    offset: { days: -1, hours: 11, minutes: 0 },
    read_status: 0,
    thread_id: "thread-teams-coverage",
  },
  {
    channel: "teams",
    sender: "markus.weber@aldi-sued.de",
    recipient: "logistik-scm@aldi-sued.de",
    subject: null,
    body: "Just spoke with Müller Milch. Capacity bottleneck will last about 1 more week (maintenance on production line 3). They'll increase output on lines 1+2 starting Monday. Until then we need to manage with existing stock.",
    offset: { days: -1, hours: 14, minutes: 20 },
    read_status: 0,
    thread_id: "thread-teams-coverage",
  },
];
// ─── Helper Functions ────────────────────────────────────────────────────────

/**
 * Resolves the buyer display name from the environment variable BUYER_NAME.
 * Falls back to "Markus Weber" if not set.
 */
export function getBuyerName(): string {
  return process.env.BUYER_NAME?.trim() || "Markus Weber";
}

/**
 * Derives an email address from a display name.
 * "Markus Weber" → "markus.weber@aldi-sued.de"
 */
function deriveEmail(displayName: string): string {
  return displayName.toLowerCase().split(" ").join(".") + "@aldi-sued.de";
}

/**
 * Generates a pseudo-random number based on a simple seed for reproducibility.
 * Uses a seeded approach so tests produce deterministic results.
 */
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

/**
 * Generates 30 daily KPI data points with realistic normal variations.
 * Each KPI has a baseline value and fluctuates within a reasonable range.
 */
function generateKpiHistory(anchorDate: Date): Array<{
  kpi_name: string;
  value: number;
  offset: SeedOffset;
}> {
  const kpiConfigs = [
    { name: "otd", baseline: 0.95, variance: 0.03, min: 0.85, max: 1.0 },
    { name: "osa", baseline: 0.97, variance: 0.02, min: 0.9, max: 1.0 },
    {
      name: "cost_deviation",
      baseline: 0.02,
      variance: 0.015,
      min: 0.0,
      max: 0.1,
    },
    { name: "mape", baseline: 0.12, variance: 0.04, min: 0.05, max: 0.3 },
  ];

  const entries: Array<{
    kpi_name: string;
    value: number;
    offset: SeedOffset;
  }> = [];
  const rand = seededRandom(42);

  for (const config of kpiConfigs) {
    for (let day = -30; day < 0; day++) {
      // Box-Muller-ish variation using seeded random
      const u1 = rand();
      const u2 = rand();
      const normalRandom =
        Math.sqrt(-2 * Math.log(Math.max(u1, 0.0001))) *
        Math.cos(2 * Math.PI * u2);
      let value = config.baseline + normalRandom * config.variance;
      value = Math.max(config.min, Math.min(config.max, value));
      value = Math.round(value * 10000) / 10000;

      entries.push({
        kpi_name: config.name,
        value,
        offset: { days: day, hours: 9, minutes: 0 },
      });
    }
  }

  return entries;
}

/**
 * Generates 14 days of inventory movement records.
 * For each day, a subset of SKUs will have their quantities adjusted
 * to simulate stock in (deliveries), stock out (sales), and corrections.
 */
function generateInventoryMovements(
  anchorDate: Date,
  skus: SeedSku[],
): Array<{
  sku: string;
  product_name: string;
  quantity: number;
  location: string;
  coverage_days: number;
  offset: SeedOffset;
}> {
  const movements: Array<{
    sku: string;
    product_name: string;
    quantity: number;
    location: string;
    coverage_days: number;
    offset: SeedOffset;
  }> = [];

  const rand = seededRandom(123);

  for (let day = -14; day < 0; day++) {
    // Select ~15 SKUs per day for movements
    for (const sku of skus) {
      if (rand() > 0.27) continue; // ~27% chance per SKU per day

      // Simulate daily consumption reducing quantity
      const dailyConsumption = Math.ceil(
        sku.quantity / (sku.coverage_days + 14),
      );
      const variation = Math.floor((rand() - 0.5) * dailyConsumption * 0.4);
      const netChange = -dailyConsumption + variation;
      const adjustedQty = Math.max(50, sku.quantity + netChange * (14 + day));
      const adjustedCoverage = Math.max(0.5, sku.coverage_days + day * 0.1);

      movements.push({
        sku: sku.sku,
        product_name: sku.product_name,
        quantity: Math.round(adjustedQty),
        location: sku.location,
        coverage_days: Math.round(adjustedCoverage * 10) / 10,
        offset: {
          days: day,
          hours: 8 + Math.floor(rand() * 9),
          minutes: Math.floor(rand() * 60),
        },
      });
    }
  }

  return movements;
}

// ─── Main Seed Function ─────────────────────────────────────────────────────

/**
 * Seeds a fresh database with complete simulation data:
 * - demo_config entries (including 8 disruption scenarios)
 * - 6 roles
 * - 18 seed emails
 * - 54 SKUs in inventory with coverage days
 * - 30 days KPI history
 * - 14 days inventory movements
 * - 10 suppliers with OTD scores and risk clusters
 *
 * The buyer name is read from the BUYER_NAME environment variable.
 * If not set, defaults to "Markus Weber".
 */
export function seedDatabase(db: Database.Database): void {
  // Normalize anchor date to midnight so hour offsets map directly to business hours
  const now = new Date();
  const anchorDate = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
    0,
  );

  const buyerName = getBuyerName();
  const buyerEmail = deriveEmail(buyerName);

  // --- demo_config entries ---
  seedDemoConfig(db, anchorDate);

  // --- roles entries (6 roles) ---
  seedRoles(db, buyerName);

  // --- Seed emails (only if no messages exist yet) ---
  seedMessages(db, anchorDate, buyerName, buyerEmail);

  // --- Inventory (54 SKUs + 14 days movements) ---
  seedInventory(db, anchorDate);

  // --- KPI history (30 days, 4 KPIs) ---
  seedKpiStates(db, anchorDate);

  // --- Suppliers ---
  seedSuppliers(db);

  // --- Purchase Orders (example orders for demo) ---
  seedPurchaseOrders(db, anchorDate);
}

function seedDemoConfig(db: Database.Database, anchorDate: Date): void {
  const insertConfig = db.prepare(
    "INSERT OR REPLACE INTO demo_config (key, value) VALUES (?, ?)",
  );

  const configEntries: [string, string][] = [
    ["anchor_date", JSON.stringify(anchorDate.toISOString().split("T")[0])],
    ["pre_aged_mode", "false"],
    ["buyer_role_id", JSON.stringify("buyer")],
    ["polling_interval_ms", "10000"],
    // Escalation thresholds (Req 12.1)
    ["threshold_otd", "0.90"],
    ["threshold_osa", "0.95"],
    ["threshold_cost_deviation", "0.05"],
    ["threshold_mape", "0.20"],
  ];

  for (const [key, value] of configEntries) {
    insertConfig.run(key, value);
  }

  // Insert 8 disruption scenario configurations (Req 5.1, 5.6, 12.2)
  for (const scenario of DISRUPTION_SCENARIOS) {
    insertConfig.run(
      scenario.key,
      JSON.stringify({
        type: scenario.type,
        label: scenario.label,
        margin_impact_bps: scenario.margin_impact_bps,
        duration_days: scenario.duration_days,
        probability: scenario.probability,
        risk_cluster: scenario.risk_cluster,
        affected_skus: scenario.affected_skus,
      }),
    );
  }
}

function seedRoles(db: Database.Database, buyerName: string): void {
  const insertRole = db.prepare(
    `INSERT OR REPLACE INTO roles (id, name, display_name, description, systems_access, polling_interval)
     VALUES (?, ?, ?, ?, ?, ?)`,
  );

  for (const role of SEED_ROLES) {
    const displayName = role.id === "buyer" ? buyerName : role.display_name;
    insertRole.run(
      role.id,
      role.name,
      displayName,
      role.description,
      JSON.stringify(role.systems_access),
      role.polling_interval,
    );
  }
}

function seedMessages(
  db: Database.Database,
  anchorDate: Date,
  buyerName: string,
  buyerEmail: string,
): void {
  const existingCount = db
    .prepare("SELECT COUNT(*) as cnt FROM messages")
    .get() as { cnt: number };

  if (existingCount.cnt === 0) {
    const insertMessage = db.prepare(
      `INSERT INTO messages (channel, sender, recipient, subject, body, timestamp, read_status, thread_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    );

    const insertMany = db.transaction(() => {
      for (const email of SEED_EMAILS) {
        const timestamp = computeTimestamp(anchorDate, email.offset);
        const sender =
          email.sender === "markus.weber@aldi-sued.de"
            ? buyerEmail
            : email.sender;
        const recipient =
          email.recipient === "markus.weber@aldi-sued.de"
            ? buyerEmail
            : email.recipient;
        let body = email.body;
        if (buyerName !== "Markus Weber") {
          const [firstName, ...lastParts] = buyerName.split(" ");
          const lastName = lastParts.join(" ");
          body = body
            .replace(/Markus Weber/g, buyerName)
            .replace(/Mr\. Weber/g, `Mr. ${lastName}`)
            .replace(/Hi Markus/g, `Hi ${firstName}`)
            .replace(/@Markus/g, `@${firstName}`)
            .replace(/\nMarkus Weber\n/g, `\n${buyerName}\n`)
            .replace(/\nMarkus\n/g, `\n${firstName}\n`);
        }
        insertMessage.run(
          email.channel,
          sender,
          recipient,
          email.subject,
          body,
          timestamp,
          email.read_status,
          email.thread_id,
        );
      }
    });

    insertMany();
  }
}

function seedInventory(db: Database.Database, anchorDate: Date): void {
  const existingCount = db
    .prepare("SELECT COUNT(*) as cnt FROM inventory")
    .get() as { cnt: number };

  if (existingCount.cnt > 0) return;

  const insertInventory = db.prepare(
    `INSERT INTO inventory (sku, product_name, quantity, location, last_updated, coverage_days)
     VALUES (?, ?, ?, ?, ?, ?)`,
  );

  const insertMany = db.transaction(() => {
    // Insert current state for all 54 SKUs
    for (const sku of SEED_SKUS) {
      const timestamp = computeTimestamp(anchorDate, {
        days: 0,
        hours: 6,
        minutes: 0,
      });
      insertInventory.run(
        sku.sku,
        sku.product_name,
        sku.quantity,
        sku.location,
        timestamp,
        sku.coverage_days,
      );
    }

    // Insert 14 days of historical movements
    const movements = generateInventoryMovements(anchorDate, SEED_SKUS);
    for (const movement of movements) {
      const timestamp = computeTimestamp(anchorDate, movement.offset);
      insertInventory.run(
        movement.sku,
        movement.product_name,
        movement.quantity,
        movement.location,
        timestamp,
        movement.coverage_days,
      );
    }
  });

  insertMany();
}

function seedKpiStates(db: Database.Database, anchorDate: Date): void {
  const existingCount = db
    .prepare("SELECT COUNT(*) as cnt FROM kpi_states")
    .get() as { cnt: number };

  if (existingCount.cnt > 0) return;

  const insertKpi = db.prepare(
    `INSERT INTO kpi_states (kpi_name, value, timestamp, role_id)
     VALUES (?, ?, ?, ?)`,
  );

  const kpiHistory = generateKpiHistory(anchorDate);

  const insertMany = db.transaction(() => {
    for (const entry of kpiHistory) {
      const timestamp = computeTimestamp(anchorDate, entry.offset);
      insertKpi.run(entry.kpi_name, entry.value, timestamp, null);
    }
  });

  insertMany();
}

function seedSuppliers(db: Database.Database): void {
  const existingCount = db
    .prepare("SELECT COUNT(*) as cnt FROM suppliers")
    .get() as { cnt: number };

  if (existingCount.cnt > 0) return;

  const insertSupplier = db.prepare(
    `INSERT INTO suppliers (name, region, products, otd_score, risk_cluster, contract_status)
     VALUES (?, ?, ?, ?, ?, ?)`,
  );

  const insertMany = db.transaction(() => {
    for (const supplier of SEED_SUPPLIERS) {
      insertSupplier.run(
        supplier.name,
        supplier.region,
        JSON.stringify(supplier.products),
        supplier.otd_score,
        supplier.risk_cluster,
        supplier.contract_status,
      );
    }
  });

  insertMany();
}

function seedPurchaseOrders(db: Database.Database, anchorDate: Date): void {
  const existingCount = db
    .prepare("SELECT COUNT(*) as cnt FROM purchase_orders")
    .get() as { cnt: number };

  if (existingCount.cnt > 0) return;

  const insertPO = db.prepare(
    `INSERT INTO purchase_orders (po_number, supplier_name, sku, product_name, quantity, unit_price, requested_delivery_date, confirmed_delivery_date, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );

  const year = anchorDate.getFullYear();

  const seedOrders = [
    {
      po_number: `PO-${year}-0001`,
      supplier_name: "NewCoffee Trading GmbH",
      sku: "3101",
      product_name: "Bio Arabica Ganze Bohne 500g",
      quantity: 12000,
      unit_price: 4.85,
      requested_offset: { days: 5 },
      confirmed_offset: { days: 4 },
      status: "confirmed",
      created_offset: { days: -10 },
    },
    {
      po_number: `PO-${year}-0002`,
      supplier_name: "Müller Milch GmbH",
      sku: "2101",
      product_name: "Frische Vollmilch 3,5% 1L",
      quantity: 8000,
      unit_price: 0.89,
      requested_offset: { days: 2 },
      confirmed_offset: { days: 2 },
      status: "shipped",
      created_offset: { days: -7 },
    },
    {
      po_number: `PO-${year}-0003`,
      supplier_name: "FreshFruit Import GmbH",
      sku: "5101",
      product_name: "Bananen Klasse 1",
      quantity: 6000,
      unit_price: 1.29,
      requested_offset: { days: 3 },
      confirmed_offset: null,
      status: "open",
      created_offset: { days: -2 },
    },
    {
      po_number: `PO-${year}-0004`,
      supplier_name: "Storck GmbH & Co. KG",
      sku: "4103",
      product_name: "Merci Finest Selection 250g",
      quantity: 5000,
      unit_price: 2.49,
      requested_offset: { days: 10 },
      confirmed_offset: { days: 9 },
      status: "confirmed",
      created_offset: { days: -5 },
    },
  ];

  const insertMany = db.transaction(() => {
    for (const order of seedOrders) {
      const requestedDate = new Date(anchorDate);
      requestedDate.setDate(
        requestedDate.getDate() + order.requested_offset.days,
      );

      const confirmedDate = order.confirmed_offset
        ? new Date(anchorDate)
        : null;
      if (confirmedDate && order.confirmed_offset) {
        confirmedDate.setDate(
          confirmedDate.getDate() + order.confirmed_offset.days,
        );
      }

      const createdDate = new Date(anchorDate);
      createdDate.setDate(createdDate.getDate() + order.created_offset.days);

      insertPO.run(
        order.po_number,
        order.supplier_name,
        order.sku,
        order.product_name,
        order.quantity,
        order.unit_price,
        requestedDate.toISOString().split("T")[0],
        confirmedDate?.toISOString().split("T")[0] ?? null,
        order.status,
        createdDate.toISOString(),
        createdDate.toISOString(),
      );
    }
  });

  insertMany();
}
