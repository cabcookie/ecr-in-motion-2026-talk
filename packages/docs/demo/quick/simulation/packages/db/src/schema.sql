-- Supply Chain Simulation: Full Schema (8 Tables)
-- Tables: messages, demo_config, roles, events, inventory, kpi_states, suppliers, escalations

-- Tabelle 1: events (Event-Queue)
CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL DEFAULT (datetime('now')),
    type TEXT NOT NULL,
    source_role TEXT NOT NULL,
    target_role TEXT,
    payload TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    scenario_id TEXT
);

-- Tabelle 2: roles
CREATE TABLE IF NOT EXISTS roles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT NOT NULL,
    systems_access TEXT NOT NULL,
    polling_interval INTEGER NOT NULL DEFAULT 10000
);

-- Tabelle 3: messages (Outlook + Teams)
CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    channel TEXT NOT NULL CHECK(channel IN ('outlook', 'teams')),
    sender TEXT NOT NULL,
    recipient TEXT NOT NULL,
    subject TEXT,
    body TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    read_status INTEGER NOT NULL DEFAULT 0,
    thread_id TEXT
);

-- Tabelle 4: inventory
CREATE TABLE IF NOT EXISTS inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sku TEXT NOT NULL,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    location TEXT NOT NULL,
    last_updated TEXT NOT NULL,
    coverage_days REAL NOT NULL
);

-- Tabelle 5: kpi_states
CREATE TABLE IF NOT EXISTS kpi_states (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kpi_name TEXT NOT NULL,
    value REAL NOT NULL,
    timestamp TEXT NOT NULL,
    role_id TEXT
);

-- Tabelle 6: suppliers
CREATE TABLE IF NOT EXISTS suppliers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    region TEXT NOT NULL,
    products TEXT NOT NULL,
    otd_score REAL NOT NULL,
    risk_cluster TEXT,
    contract_status TEXT NOT NULL
);

-- Tabelle 7: escalations
CREATE TABLE IF NOT EXISTS escalations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    level INTEGER NOT NULL CHECK(level BETWEEN 1 AND 3),
    trigger_kpi TEXT NOT NULL,
    trigger_value REAL NOT NULL,
    threshold REAL NOT NULL,
    channel TEXT NOT NULL,
    created_at TEXT NOT NULL,
    resolved_at TEXT
);

-- Tabelle 8: demo_config (Key-Value Store)
CREATE TABLE IF NOT EXISTS demo_config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

-- Tabelle 9: purchase_orders (Bestellungen / SAP-Aufträge)
CREATE TABLE IF NOT EXISTS purchase_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    po_number TEXT NOT NULL UNIQUE,
    supplier_name TEXT NOT NULL,
    sku TEXT NOT NULL,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price REAL,
    requested_delivery_date TEXT NOT NULL,
    confirmed_delivery_date TEXT,
    status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open', 'confirmed', 'shipped', 'delivered', 'cancelled')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
