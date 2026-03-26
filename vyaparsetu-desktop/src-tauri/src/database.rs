use rusqlite::{Connection, Result};
use std::path::Path;

/// Initializes the local SQLite database for the Kirana/Retail shop.
/// If the file doesn't exist, it creates it. If it does, it connects to it.
pub fn initialize_database(app_dir: &Path) -> Result<Connection> {
    // Create the full path for the offline database file
    let db_path = app_dir.join("vyaparsetu_offline_store.sqlite");
    
    // Open (or create) the SQLite connection
    let conn = Connection::open(&db_path)?;

    // Execute the schema creation in a single batch transaction for speed
    // Using IF NOT EXISTS ensures we don't overwrite existing shop data on app restarts
    let schema = "
        -- 1. PRODUCTS (Fast Billing & Inventory)
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            barcode TEXT UNIQUE,
            category TEXT,
            unit TEXT NOT NULL DEFAULT 'pcs', -- e.g., pcs, kg, gm, packet
            purchase_price REAL DEFAULT 0.0,
            selling_price REAL NOT NULL,
            stock_quantity REAL DEFAULT 0.0,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- 2. CUSTOMERS (For Khata & Udhaar)
        CREATE TABLE IF NOT EXISTS customers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT UNIQUE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- 3. INVOICES (The Master Bill)
        CREATE TABLE IF NOT EXISTS invoices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_id INTEGER,
            subtotal REAL NOT NULL,
            discount REAL DEFAULT 0.0,
            total_amount REAL NOT NULL,
            payment_mode TEXT NOT NULL, -- 'CASH', 'UPI', 'CARD', 'UDHAAR', 'SPLIT'
            status TEXT NOT NULL,       -- 'PAID', 'UNPAID', 'PARTIAL'
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(customer_id) REFERENCES customers(id)
        );

        -- 3b. INVOICE ITEMS (The items inside the bill)
        CREATE TABLE IF NOT EXISTS invoice_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            invoice_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            product_name TEXT NOT NULL, -- Saved as text in case product is deleted later
            quantity REAL NOT NULL,
            price REAL NOT NULL,
            total REAL NOT NULL,
            FOREIGN KEY(invoice_id) REFERENCES invoices(id),
            FOREIGN KEY(product_id) REFERENCES products(id)
        );

        -- 4. KHATA / UDHAAR LEDGER (Digital Notebook)
        CREATE TABLE IF NOT EXISTS khata (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_id INTEGER NOT NULL,
            invoice_id INTEGER,         -- Linked to a bill (if applicable)
            amount REAL NOT NULL,
            txn_type TEXT NOT NULL,     -- 'CREDIT_GIVEN' (Udhaar) or 'PAYMENT_RECEIVED' (Cash in)
            remarks TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(customer_id) REFERENCES customers(id),
            FOREIGN KEY(invoice_id) REFERENCES invoices(id)
        );
    ";

    conn.execute_batch(schema)?;

    println!("✅ Offline Database Initialized Successfully at: {:?}", db_path);

    Ok(conn)
}