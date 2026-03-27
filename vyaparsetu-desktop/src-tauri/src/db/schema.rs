/// MASTER DATABASE SCHEMA
/// Defines the strict relational tables for the 200-feature VyaparSetu MVP.
/// Includes foreign key constraints, default states, and strict typing.

pub const SCHEMA: &str = r#"
    -- Enforce foreign key constraints for data integrity
    PRAGMA foreign_keys = ON;

    -- 1. RBAC & STAFF CONTROL
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        pin TEXT NOT NULL,
        role TEXT NOT NULL,
        permissions TEXT NOT NULL, -- JSON string of booleans
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 2. INVENTORY & STOCK
    CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        sku TEXT,
        barcode TEXT UNIQUE,
        category TEXT,
        unit TEXT NOT NULL,
        cost_price REAL NOT NULL DEFAULT 0.0,
        selling_price REAL NOT NULL DEFAULT 0.0,
        stock_quantity REAL NOT NULL DEFAULT 0.0,
        min_stock REAL NOT NULL DEFAULT 0.0,
        hsn_code TEXT,
        tax_rate REAL NOT NULL DEFAULT 0.0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 3. CUSTOMER MANAGEMENT (KHATA)
    CREATE TABLE IF NOT EXISTS customers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT UNIQUE,
        address TEXT,
        credit_limit REAL NOT NULL DEFAULT 0.0,
        current_balance REAL NOT NULL DEFAULT 0.0,
        trust_score INTEGER DEFAULT 100,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 4. SUPPLY CHAIN
    CREATE TABLE IF NOT EXISTS suppliers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT UNIQUE,
        gst_number TEXT,
        balance REAL NOT NULL DEFAULT 0.0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 5. POS INVOICING ENGINE
    CREATE TABLE IF NOT EXISTS invoices (
        id TEXT PRIMARY KEY,
        customer_id TEXT,
        total_amount REAL NOT NULL,
        tax_amount REAL NOT NULL,
        discount_amount REAL NOT NULL,
        grand_total REAL NOT NULL,
        payment_mode TEXT NOT NULL,
        status TEXT NOT NULL, -- 'PAID', 'UNPAID', 'VOID'
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
    );

    -- 6. LINE ITEMS FOR INVOICES
    CREATE TABLE IF NOT EXISTS invoice_items (
        id TEXT PRIMARY KEY,
        invoice_id TEXT NOT NULL,
        product_id TEXT,
        quantity REAL NOT NULL,
        unit_price REAL NOT NULL,
        discount_percent REAL NOT NULL DEFAULT 0.0,
        tax_percent REAL NOT NULL DEFAULT 0.0,
        total_price REAL NOT NULL,
        FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
    );

    -- 7. LEDGER LOGS (PAYMENTS / UDHAAR)
    CREATE TABLE IF NOT EXISTS ledger_entries (
        id TEXT PRIMARY KEY,
        entity_type TEXT NOT NULL, -- 'CUSTOMER' or 'SUPPLIER'
        entity_id TEXT NOT NULL,
        entry_type TEXT NOT NULL, -- 'CREDIT' or 'DEBIT'
        amount REAL NOT NULL,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 8. SECURITY & AUDIT LOGS
    CREATE TABLE IF NOT EXISTS activity_logs (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        action TEXT NOT NULL,
        target_table TEXT NOT NULL,
        target_id TEXT,
        details TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );
"#;