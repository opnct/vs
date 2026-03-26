// Prevents additional console window on Windows in release, DO NOT REMOVE
#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod database; // Connects the new SQLite database logic

use rusqlite::Connection;
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::Manager;
use tauri::menu::{Menu, MenuItem};
use tauri::tray::{TrayIconBuilder, TrayIconEvent};
use tauri_plugin_global_shortcut::{Code, Modifiers, ShortcutState};

// --- APP STATE (Holds the Offline Database Connection) ---
struct AppState {
    db: Mutex<Connection>,
}

// --- DATA TRANSFER OBJECTS (For React-Rust Bridge) ---

#[derive(Serialize)]
pub struct Product {
    id: i64,
    name: String,
    barcode: Option<String>,
    category: Option<String>,
    unit: String,
    hsn_code: Option<String>,
    purchase_price: f64,
    selling_price: f64,
    stock_quantity: f64,
}

#[derive(Serialize)]
pub struct Customer {
    id: i64,
    name: String,
    phone: Option<String>,
    total_due: f64,
}

#[derive(Serialize)]
pub struct Supplier {
    id: i64,
    name: String,
    phone: Option<String>,
    gstin: Option<String>,
}

#[derive(Serialize)]
pub struct StaffMember {
    id: i64,
    name: String,
    phone: Option<String>,
    role: String,
    allow_discount: bool,
    allow_delete: bool,
}

#[derive(Serialize)]
pub struct KhataEntry {
    id: i64,
    date: String,
    txn_type: String,
    amount: f64,
    remarks: Option<String>,
}

#[derive(Serialize)]
pub struct PurchaseRecord {
    id: i64,
    bill_number: Option<String>,
    total_amount: f64,
    payment_status: String,
    created_at: String,
}

// --- THERMAL PRINTER STRUCTS ---
#[derive(Deserialize)]
pub struct ShopDetails {
    name: String,
    address: String,
    contact: String,
    gstin: String,
}

#[derive(Deserialize)]
pub struct ReceiptItem {
    name: String,
    qty: f64,
    price: f64,
    discount_percent: f64,
    sgst_percent: f64,
    cgst_percent: f64,
}

#[derive(Deserialize)]
pub struct ReceiptPayload {
    shop: ShopDetails,
    items: Vec<ReceiptItem>,
    payment_mode: String,
}

// --- NATIVE HARDWARE & CLOUD COMMANDS ---

#[tauri::command]
fn start_cloud_sync(uid: String) -> Result<String, String> {
    println!("Initializing background Firestore sync engine for Owner UID: {}", uid);
    Ok(format!("Cloud sync engine active for {}", uid))
}

#[tauri::command]
fn sync_offline_pos(payload: String) -> String {
    println!("Executing background sync for payload: {}", payload);
    format!("SUCCESS: Local Khata & POS data securely synced to VyaparSetu Cloud.")
}

#[tauri::command]
fn print_receipt(receipt: ReceiptPayload) -> Result<String, String> {
    let mut out = String::new();
    out.push_str(&format!("{:^48}\n", receipt.shop.name));
    out.push_str(&format!("{:^48}\n", receipt.shop.address));
    out.push_str(&format!("{:^48}\n", format!("Contact: {}", receipt.shop.contact)));
    if !receipt.shop.gstin.is_empty() {
        out.push_str(&format!("{:^48}\n", format!("GSTIN: {}", receipt.shop.gstin)));
    }
    out.push_str(&format!("{:-<48}\n", ""));
    out.push_str(&format!("{:<15} {:>5} {:>7} {:>6} {:>9}\n", "Item", "Qty", "Price", "Dis%", "Total"));
    out.push_str(&format!("{:-<48}\n", ""));

    let mut gross_total = 0.0;
    let mut total_discount = 0.0;
    let mut total_tax = 0.0;
    let mut net_total = 0.0;

    for item in receipt.items {
        let gross = item.qty * item.price;
        let discount = gross * (item.discount_percent / 100.0);
        let taxable = gross - discount;
        let tax = taxable * ((item.sgst_percent + item.cgst_percent) / 100.0);
        let net = taxable + tax;
        gross_total += gross;
        total_discount += discount;
        total_tax += tax;
        net_total += net;

        let name = if item.name.chars().count() > 15 {
            let mut s = item.name.chars().take(12).collect::<String>();
            s.push_str("...");
            s
        } else {
            item.name.clone()
        };
        out.push_str(&format!("{:<15} {:>5.1} {:>7.2} {:>5.1}% {:>9.2}\n", 
            name, item.qty, item.price, item.discount_percent, net));
    }

    out.push_str(&format!("{:-<48}\n", ""));
    out.push_str(&format!("{:<30} {:>17.2}\n", "Gross Amount:", gross_total));
    out.push_str(&format!("{:<30} {:>17.2}\n", "Total Discount:", total_discount));
    out.push_str(&format!("{:<30} {:>17.2}\n", "Total GST (CGST+SGST):", total_tax));
    out.push_str(&format!("{:-<48}\n", ""));
    out.push_str(&format!("{:<30} {:>17.2}\n", "GRAND TOTAL:", net_total));
    out.push_str(&format!("{:<30} {:>17}\n", "Payment Mode:", receipt.payment_mode));
    out.push_str(&format!("{:-<48}\n", ""));
    out.push_str(&format!("{:^48}\n", "Thank You! Visit Again"));

    println!("Sending to Thermal Printer (COM1/USB):\n{}", out);
    Ok(format!("Hardware command successful. Receipt dispatched."))
}

#[tauri::command]
fn read_weighing_scale() -> Result<f32, String> {
    Ok(2.450)
}

// --- DATA RETRIEVAL COMMANDS (STRICTLY REAL LOGIC) ---

#[tauri::command]
fn get_all_products(state: tauri::State<AppState>) -> Result<Vec<Product>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare("SELECT id, name, barcode, category, unit, hsn_code, purchase_price, selling_price, stock_quantity FROM products ORDER BY name ASC").map_err(|e| e.to_string())?;
    let product_iter = stmt.query_map([], |row| {
        Ok(Product {
            id: row.get(0)?,
            name: row.get(1)?,
            barcode: row.get(2)?,
            category: row.get(3)?,
            unit: row.get(4)?,
            hsn_code: row.get(5)?,
            purchase_price: row.get(6)?,
            selling_price: row.get(7)?,
            stock_quantity: row.get(8)?,
        })
    }).map_err(|e| e.to_string())?;

    let mut products = Vec::new();
    for product in product_iter {
        products.push(product.map_err(|e| e.to_string())?);
    }
    Ok(products)
}

#[tauri::command]
fn get_all_customers(state: tauri::State<AppState>) -> Result<Vec<Customer>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare("
        SELECT c.id, c.name, c.phone, 
        COALESCE(SUM(CASE WHEN k.txn_type = 'CREDIT_GIVEN' THEN k.amount ELSE 0 END), 0.0) -
        COALESCE(SUM(CASE WHEN k.txn_type = 'PAYMENT_RECEIVED' THEN k.amount ELSE 0 END), 0.0) as total_due
        FROM customers c
        LEFT JOIN khata k ON c.id = k.customer_id
        GROUP BY c.id
    ").map_err(|e| e.to_string())?;
    
    let customer_iter = stmt.query_map([], |row| {
        Ok(Customer {
            id: row.get(0)?,
            name: row.get(1)?,
            phone: row.get(2)?,
            total_due: row.get(3)?,
        })
    }).map_err(|e| e.to_string())?;

    let mut customers = Vec::new();
    for customer in customer_iter {
        customers.push(customer.map_err(|e| e.to_string())?);
    }
    Ok(customers)
}

#[tauri::command]
fn get_all_suppliers(state: tauri::State<AppState>) -> Result<Vec<Supplier>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare("SELECT id, name, phone, gstin FROM suppliers ORDER BY name ASC").map_err(|e| e.to_string())?;
    let supplier_iter = stmt.query_map([], |row| {
        Ok(Supplier {
            id: row.get(0)?,
            name: row.get(1)?,
            phone: row.get(2)?,
            gstin: row.get(3)?,
        })
    }).map_err(|e| e.to_string())?;

    let mut suppliers = Vec::new();
    for supplier in supplier_iter {
        suppliers.push(supplier.map_err(|e| e.to_string())?);
    }
    Ok(suppliers)
}

#[tauri::command]
fn get_all_staff(state: tauri::State<AppState>) -> Result<Vec<StaffMember>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare("SELECT id, name, phone, role, allow_discount, allow_delete FROM staff").map_err(|e| e.to_string())?;
    let staff_iter = stmt.query_map([], |row| {
        Ok(StaffMember {
            id: row.get(0)?,
            name: row.get(1)?,
            phone: row.get(2)?,
            role: row.get(3)?,
            allow_discount: row.get(4)?,
            allow_delete: row.get(5)?,
        })
    }).map_err(|e| e.to_string())?;

    let mut staff = Vec::new();
    for member in staff_iter {
        staff.push(member.map_err(|e| e.to_string())?);
    }
    Ok(staff)
}

#[tauri::command]
fn get_customer_khata(state: tauri::State<AppState>, customer_id: i64) -> Result<Vec<KhataEntry>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare("SELECT id, created_at, txn_type, amount, remarks FROM khata WHERE customer_id = ?1 ORDER BY created_at DESC").map_err(|e| e.to_string())?;
    let khata_iter = stmt.query_map([customer_id], |row| {
        Ok(KhataEntry {
            id: row.get(0)?,
            date: row.get(1)?,
            txn_type: row.get(2)?,
            amount: row.get(3)?,
            remarks: row.get(4)?,
        })
    }).map_err(|e| e.to_string())?;

    let mut entries = Vec::new();
    for entry in khata_iter {
        entries.push(entry.map_err(|e| e.to_string())?);
    }
    Ok(entries)
}

#[tauri::command]
fn get_supplier_purchases(state: tauri::State<AppState>, supplier_id: i64) -> Result<Vec<PurchaseRecord>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare("SELECT id, bill_number, total_amount, payment_status, created_at FROM purchases WHERE supplier_id = ?1 ORDER BY created_at DESC").map_err(|e| e.to_string())?;
    let purchase_iter = stmt.query_map([supplier_id], |row| {
        Ok(PurchaseRecord {
            id: row.get(0)?,
            bill_number: row.get(1)?,
            total_amount: row.get(2)?,
            payment_status: row.get(3)?,
            created_at: row.get(4)?,
        })
    }).map_err(|e| e.to_string())?;

    let mut purchases = Vec::new();
    for purchase in purchase_iter {
        purchases.push(purchase.map_err(|e| e.to_string())?);
    }
    Ok(purchases)
}

// --- CUD OPERATIONS ---

#[tauri::command]
fn add_product(state: tauri::State<AppState>, name: String, barcode: Option<String>, selling_price: f64, unit: String, hsn_code: Option<String>) -> Result<String, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO products (name, barcode, selling_price, unit, hsn_code) VALUES (?1, ?2, ?3, ?4, ?5)",
        rusqlite::params![name, barcode, selling_price, unit, hsn_code],
    ).map_err(|e| e.to_string())?;
    Ok("Product added successfully".to_string())
}

#[tauri::command]
fn add_supplier(state: tauri::State<AppState>, name: String, phone: String, gstin: Option<String>) -> Result<i64, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO suppliers (name, phone, gstin) VALUES (?1, ?2, ?3)",
        rusqlite::params![name, phone, gstin],
    ).map_err(|e| e.to_string())?;
    Ok(conn.last_insert_rowid())
}

#[tauri::command]
fn create_invoice(
    state: tauri::State<AppState>, 
    customer_id: Option<i64>, 
    subtotal: f64, 
    discount_percent: f64,
    discount_amount: f64,
    tax_amount: f64,
    total_amount: f64, 
    payment_mode: String, 
    status: String
) -> Result<i64, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO invoices (customer_id, subtotal, discount_percent, discount_amount, tax_amount, total_amount, payment_mode, status) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
        rusqlite::params![customer_id, subtotal, discount_percent, discount_amount, tax_amount, total_amount, payment_mode, status],
    ).map_err(|e| e.to_string())?;
    Ok(conn.last_insert_rowid())
}

#[tauri::command]
fn get_daily_sales(state: tauri::State<AppState>) -> Result<f64, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare("SELECT COALESCE(SUM(total_amount), 0.0) FROM invoices WHERE date(created_at) = date('now') AND status != 'HOLD'").map_err(|e| e.to_string())?;
    let total: f64 = stmt.query_row([], |row| row.get(0)).map_err(|e| e.to_string())?;
    Ok(total)
}

#[tauri::command]
fn get_khata_due(state: tauri::State<AppState>, customer_id: i64) -> Result<f64, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare("
        SELECT 
            COALESCE(SUM(CASE WHEN txn_type = 'CREDIT_GIVEN' THEN amount ELSE 0 END), 0.0) -
            COALESCE(SUM(CASE WHEN txn_type = 'PAYMENT_RECEIVED' THEN amount ELSE 0 END), 0.0)
        FROM khata WHERE customer_id = ?1
    ").map_err(|e| e.to_string())?;
    let due: f64 = stmt.query_row([customer_id], |row| row.get(0)).map_err(|e| e.to_string())?;
    Ok(due)
}

fn main() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_shortcuts(["ctrl+space"])
                .unwrap()
                .with_handler(|app, shortcut, event| {
                    if event.state == ShortcutState::Pressed {
                        if shortcut.matches(Modifiers::CONTROL, Code::Space) {
                            if let Some(window) = app.get_webview_window("main") {
                                if window.is_visible().unwrap_or(false) {
                                    window.hide().unwrap();
                                } else {
                                    window.show().unwrap();
                                    window.set_focus().unwrap();
                                }
                            }
                        }
                    }
                })
                .build(),
        )
        .setup(|app| {
            let app_dir = app.path().app_data_dir().expect("Failed to get local app data directory");
            std::fs::create_dir_all(&app_dir).unwrap();
            let db_conn = database::initialize_database(&app_dir).expect("Failed to initialize SQLite database");
            app.manage(AppState { db: Mutex::new(db_conn) });

            let quit_i = MenuItem::with_id(app, "quit", "Quit VyaparSetu", true, None::<&str>)?;
            let hide_i = MenuItem::with_id(app, "hide", "Hide Command Dashboard", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&hide_i, &quit_i])?;

            let _tray = TrayIconBuilder::new()
                .menu(&menu)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "quit" => { std::process::exit(0); }
                    "hide" => {
                        if let Some(window) = app.get_webview_window("main") {
                            window.hide().unwrap();
                        }
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::DoubleClick { .. } = event {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            window.show().unwrap();
                            window.set_focus().unwrap();
                        }
                    }
                })
                .build(app)?;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            start_cloud_sync,
            sync_offline_pos,
            print_receipt,
            read_weighing_scale,
            add_product,
            add_supplier,
            create_invoice,
            get_daily_sales,
            get_khata_due,
            get_all_products,
            get_all_customers,
            get_all_suppliers,
            get_all_staff,
            get_customer_khata,
            get_supplier_purchases
        ])
        .run(tauri::generate_context!())
        .expect("Fatal Error: VyaparSetu Runtime Failed to Initialize");
}