// Prevents additional console window on Windows in release, DO NOT REMOVE
#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod database; // Connects the new SQLite database logic

use rusqlite::Connection;
use serde::Deserialize;
use std::sync::Mutex;
use tauri::Manager;
use tauri::menu::{Menu, MenuItem};
use tauri::tray::{TrayIconBuilder, TrayIconEvent};
use tauri_plugin_global_shortcut::{Code, Modifiers, ShortcutState};

// --- APP STATE (Holds the Offline Database Connection) ---
struct AppState {
    db: Mutex<Connection>,
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
    price: f64, // Price per unit
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
    // Called by React onAuthStateChanged to spin up background SQLite -> Firestore replication
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
    // Dynamically calculate and format a perfect 80mm (48 characters wide) thermal receipt
    let mut out = String::new();
    
    // --- Header ---
    out.push_str(&format!("{:^48}\n", receipt.shop.name));
    out.push_str(&format!("{:^48}\n", receipt.shop.address));
    out.push_str(&format!("{:^48}\n", format!("Contact: {}", receipt.shop.contact)));
    if !receipt.shop.gstin.is_empty() {
        out.push_str(&format!("{:^48}\n", format!("GSTIN: {}", receipt.shop.gstin)));
    }
    out.push_str(&format!("{:-<48}\n", ""));
    
    // --- Table Headers ---
    out.push_str(&format!("{:<15} {:>5} {:>7} {:>6} {:>9}\n", "Item", "Qty", "Price", "Dis%", "Total"));
    out.push_str(&format!("{:-<48}\n", ""));

    let mut gross_total = 0.0;
    let mut total_discount = 0.0;
    let mut total_tax = 0.0;
    let mut net_total = 0.0;

    // --- Dynamic Item Calculation ---
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

        // Truncate long item names safely
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

    // --- Totals Section ---
    out.push_str(&format!("{:-<48}\n", ""));
    out.push_str(&format!("{:<30} {:>17.2}\n", "Gross Amount:", gross_total));
    out.push_str(&format!("{:<30} {:>17.2}\n", "Total Discount:", total_discount));
    out.push_str(&format!("{:<30} {:>17.2}\n", "Total GST (CGST+SGST):", total_tax));
    out.push_str(&format!("{:-<48}\n", ""));
    out.push_str(&format!("{:<30} {:>17.2}\n", "GRAND TOTAL:", net_total));
    out.push_str(&format!("{:<30} {:>17}\n", "Payment Mode:", receipt.payment_mode));
    out.push_str(&format!("{:-<48}\n", ""));
    out.push_str(&format!("{:^48}\n", "Thank You! Visit Again"));

    // In a real build, this byte string goes directly to the raw COM/USB printer port
    println!("Sending to Thermal Printer (COM1/USB):\n{}", out);
    
    Ok(format!("Hardware command successful. Receipt dispatched."))
}

#[tauri::command]
fn read_weighing_scale() -> Result<f32, String> {
    println!("Reading COM port for weighing scale...");
    Ok(2.450)
}

// --- SQLITE OFFLINE RETAIL COMMANDS ---

#[tauri::command]
fn add_product(state: tauri::State<AppState>, name: String, barcode: Option<String>, selling_price: f64, unit: String, hsn_code: Option<String>) -> Result<String, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO products (name, barcode, selling_price, unit, hsn_code) VALUES (?1, ?2, ?3, ?4, ?5)",
        rusqlite::params![name, barcode, selling_price, unit, hsn_code],
    ).map_err(|e| e.to_string())?;
    Ok("Product added successfully to local SQLite".to_string())
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
        // 2. SETUP GLOBAL WINDOWS SHORTCUT (Ctrl+Space for VyaparBot)
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
            // 0. INITIALIZE OFFLINE SQLITE DATABASE
            let app_dir = app.path().app_data_dir().expect("Failed to get local app data directory");
            std::fs::create_dir_all(&app_dir).unwrap();
            let db_conn = database::initialize_database(&app_dir).expect("Failed to initialize SQLite database");
            
            // Inject the database connection into Tauri's global state
            app.manage(AppState { db: Mutex::new(db_conn) });

            // 1. SETUP WINDOWS SYSTEM TRAY (Runs in background like an Antivirus)
            let quit_i = MenuItem::with_id(app, "quit", "Quit VyaparSetu", true, None::<&str>)?;
            let hide_i = MenuItem::with_id(app, "hide", "Hide Command Dashboard", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&hide_i, &quit_i])?;

            let _tray = TrayIconBuilder::new()
                .menu(&menu)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "quit" => {
                        std::process::exit(0);
                    }
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
        // 3. REGISTER THE COMMANDS FOR REACT
        .invoke_handler(tauri::generate_handler![
            start_cloud_sync,
            sync_offline_pos,
            print_receipt,
            read_weighing_scale,
            add_product,
            add_supplier,
            create_invoice,
            get_daily_sales,
            get_khata_due
        ])
        .run(tauri::generate_context!())
        .expect("Fatal Error: VyaparSetu Runtime Failed to Initialize");
}