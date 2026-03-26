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
            hsn_code TEXT,                    -- Support for GST Settings
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
            discount_percent REAL DEFAULT 0.0,
            discount_amount REAL DEFAULT 0.0,
            tax_amount REAL DEFAULT 0.0,
            total_amount REAL NOT NULL,
            payment_mode TEXT NOT NULL, -- 'CASH', 'UPI', 'CARD', 'UDHAAR', 'SPLIT'
            status TEXT NOT NULL,       -- 'PAID', 'UNPAID', 'PARTIAL', 'HOLD'
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(customer_id) REFERENCES customers(id)
        );

        -- 3b. INVOICE ITEMS (The items inside the bill)
        CREATE TABLE IF NOT EXISTS invoice_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            invoice_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            product_name TEXT NOT NULL, -- Saved as text in case product is deleted later
            hsn_code TEXT,              -- Support for GSTR-1 item-wise tracking
            quantity REAL NOT NULL,
            price REAL NOT NULL,
            discount_percent REAL DEFAULT 0.0, -- Item-wise % discount
            discount_amount REAL DEFAULT 0.0,  -- Item-wise ₹ discount
            sgst_percent REAL DEFAULT 0.0,     -- State GST %
            cgst_percent REAL DEFAULT 0.0,     -- Central GST %
            tax_amount REAL DEFAULT 0.0,       -- Calculated total tax for row
            total REAL NOT NULL,               -- Final Net Total
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

        -- 5. SUPPLIERS (For Stock-in & Distributor Management)
        CREATE TABLE IF NOT EXISTS suppliers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT UNIQUE,
            gstin TEXT,
            address TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- 6. PURCHASES (Stock In & Purchase Bills)
        CREATE TABLE IF NOT EXISTS purchases (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            supplier_id INTEGER,
            bill_number TEXT,
            total_amount REAL NOT NULL,
            paid_amount REAL DEFAULT 0.0,
            payment_status TEXT NOT NULL, -- 'PAID', 'PARTIAL', 'UNPAID'
            remarks TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(supplier_id) REFERENCES suppliers(id)
        );

        -- 7. STAFF (Role-based access controls)
        CREATE TABLE IF NOT EXISTS staff (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            firebase_uid TEXT UNIQUE,    -- Linked directly to Firebase Cloud Auth
            name TEXT NOT NULL,
            phone TEXT UNIQUE,
            role TEXT DEFAULT 'CASHIER', -- 'OWNER' or 'CASHIER'
            pin_code TEXT,               -- For fast offline profile switching without internet
            allow_discount BOOLEAN DEFAULT 0,
            allow_delete BOOLEAN DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- 8. GST RECORDS (For easy GSTR-1 export and Tax accounting)
        CREATE TABLE IF NOT EXISTS gst_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            invoice_id INTEGER,
            purchase_id INTEGER,
            hsn_code TEXT NOT NULL,
            taxable_amount REAL NOT NULL,
            cgst_amount REAL DEFAULT 0.0,
            sgst_amount REAL DEFAULT 0.0,
            igst_amount REAL DEFAULT 0.0,
            total_tax REAL NOT NULL,
            record_type TEXT NOT NULL, -- 'SALE' or 'PURCHASE'
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(invoice_id) REFERENCES invoices(id),
            FOREIGN KEY(purchase_id) REFERENCES purchases(id)
        );
    ";

    conn.execute_batch(schema)?;

    println!("✅ Offline Database Initialized Successfully with 16-Module Support at: {:?}", db_path);

    Ok(conn)
}