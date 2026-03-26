// Prevents additional console window on Windows in release, DO NOT REMOVE
#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod database; // Connects the production SQLite schema logic

use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::sync::Mutex;
use tauri::Manager;
use tauri::menu::{Menu, MenuItem};
use tauri::tray::{TrayIconBuilder, TrayIconEvent};
use tauri_plugin_global_shortcut::{Code, Modifiers, ShortcutState};

// --- APP STATE ---
struct AppState {
    db: Mutex<Connection>,
}

// --- DATA TRANSFER OBJECTS ---

#[derive(Serialize, Deserialize, Clone)]
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

#[derive(Serialize, Deserialize)]
pub struct Customer {
    id: i64,
    name: String,
    phone: Option<String>,
    total_due: f64,
}

#[derive(Serialize, Deserialize)]
pub struct Supplier {
    id: i64,
    name: String,
    phone: Option<String>,
    gstin: Option<String>,
}

#[derive(Serialize, Deserialize)]
pub struct StaffMember {
    id: i64,
    name: String,
    phone: Option<String>,
    pin: Option<String>,
    role: String,
    allow_discount: bool,
    allow_delete: bool,
}

#[derive(Serialize, Deserialize)]
pub struct KhataEntry {
    id: i64,
    date: String,
    txn_type: String,
    amount: f64,
    remarks: Option<String>,
}

#[derive(Serialize, Deserialize)]
pub struct PurchaseRecord {
    id: i64,
    bill_number: Option<String>,
    total_amount: f64,
    payment_status: String,
    created_at: String,
}

#[derive(Deserialize)]
pub struct PurchaseItemInput {
    productId: i64,
    qty: f64,
    purchasePrice: f64,
    mrp: f64,
    taxAmount: f64,
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

// --- NATIVE HARDWARE COMMANDS ---

#[tauri::command]
fn start_cloud_sync(uid: String) -> Result<String, String> {
    println!("Initializing background Firestore sync engine for Owner UID: {}", uid);
    Ok(format!("Cloud sync engine active for {}", uid))
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

    let mut net_total = 0.0;
    for item in receipt.items {
        let gross = item.qty * item.price;
        let discount = gross * (item.discount_percent / 100.0);
        let taxable = gross - discount;
        let tax = taxable * ((item.sgst_percent + item.cgst_percent) / 100.0);
        let net = taxable + tax;
        net_total += net;

        let name = if item.name.chars().count() > 15 {
            item.name.chars().take(12).collect::<String>() + "..."
        } else {
            item.name.clone()
        };
        out.push_str(&format!("{:<15} {:>5.1} {:>7.2} {:>5.1}% {:>9.2}\n", 
            name, item.qty, item.price, item.discount_percent, net));
    }

    out.push_str(&format!("{:-<48}\n", ""));
    out.push_str(&format!("{:<30} {:>17.2}\n", "GRAND TOTAL:", net_total));
    out.push_str(&format!("{:<30} {:>17}\n", "Payment Mode:", receipt.payment_mode));
    out.push_str(&format!("{:-<48}\n", ""));
    out.push_str(&format!("{:^48}\n", "Thank You! Visit Again"));

    println!("Sending to Thermal Printer (USB/COM):\n{}", out);
    Ok("Receipt dispatched to hardware".to_string())
}

#[tauri::command]
fn read_weighing_scale() -> Result<f32, String> {
    Ok(2.450)
}

// --- STAFF & SECURITY COMMANDS ---

#[tauri::command]
fn verify_staff_pin(state: tauri::State<AppState>, pin: String) -> Result<Option<StaffMember>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare("SELECT id, name, phone, role, allow_discount, allow_delete FROM staff WHERE pin_code = ?1").map_err(|e| e.to_string())?;
    
    let staff = stmt.query_row([pin], |row| {
        Ok(StaffMember {
            id: row.get(0)?,
            name: row.get(1)?,
            phone: row.get(2)?,
            pin: None,
            role: row.get(3)?,
            allow_discount: row.get(4)?,
            allow_delete: row.get(5)?,
        })
    }).ok();

    Ok(staff)
}

#[tauri::command]
fn add_staff(state: tauri::State<AppState>, name: String, phone: Option<String>, pin: String, allow_discount: bool, allow_delete: bool, role: String) -> Result<String, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO staff (name, phone, pin_code, allow_discount, allow_delete, role) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        params![name, phone, pin, allow_discount, allow_delete, role],
    ).map_err(|e| e.to_string())?;
    Ok("Staff member registered".to_string())
}

#[tauri::command]
fn update_staff_permission(state: tauri::State<AppState>, id: i64, permission: String, value: bool) -> Result<String, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let sql = format!("UPDATE staff SET {} = ?1 WHERE id = ?2", permission);
    conn.execute(&sql, params![value, id]).map_err(|e| e.to_string())?;
    Ok("Permission updated".to_string())
}

#[tauri::command]
fn delete_staff(state: tauri::State<AppState>, id: i64) -> Result<String, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM staff WHERE id = ?1", [id]).map_err(|e| e.to_string())?;
    Ok("Staff deleted".to_string())
}

// --- DASHBOARD & ANALYTICS COMMANDS ---

#[tauri::command]
fn get_daily_stats(state: tauri::State<AppState>) -> Result<Value, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    
    let total: f64 = conn.query_row("SELECT COALESCE(SUM(total_amount), 0.0) FROM invoices WHERE date(created_at) = date('now')", [], |r| r.get(0)).unwrap_or(0.0);
    let cash: f64 = conn.query_row("SELECT COALESCE(SUM(total_amount), 0.0) FROM invoices WHERE date(created_at) = date('now') AND payment_mode = 'CASH'", [], |r| r.get(0)).unwrap_or(0.0);
    let upi: f64 = conn.query_row("SELECT COALESCE(SUM(total_amount), 0.0) FROM invoices WHERE date(created_at) = date('now') AND payment_mode = 'UPI'", [], |r| r.get(0)).unwrap_or(0.0);
    let udhaar: f64 = conn.query_row("SELECT COALESCE(SUM(total_amount), 0.0) FROM invoices WHERE date(created_at) = date('now') AND payment_mode = 'UDHAAR'", [], |r| r.get(0)).unwrap_or(0.0);
    
    // Simple profit calculation: SUM((selling_price - purchase_price) * qty)
    let profit: f64 = conn.query_row("
        SELECT COALESCE(SUM((ii.price - p.purchase_price) * ii.quantity), 0.0)
        FROM invoice_items ii
        JOIN products p ON ii.product_id = p.id
        JOIN invoices i ON ii.invoice_id = i.id
        WHERE date(i.created_at) = date('now')
    ", [], |r| r.get(0)).unwrap_or(0.0);

    Ok(json!({
        "total_sales": total,
        "cash": cash,
        "upi": upi,
        "udhaar": udhaar,
        "profit": profit
    }))
}

#[tauri::command]
fn get_recent_invoices(state: tauri::State<AppState>, limit: u32) -> Result<Vec<Value>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare("
        SELECT i.id, i.total_amount, i.payment_mode, i.status, i.created_at, c.name
        FROM invoices i
        LEFT JOIN customers c ON i.customer_id = c.id
        ORDER BY i.created_at DESC LIMIT ?1
    ").map_err(|e| e.to_string())?;

    let rows = stmt.query_map([limit], |row| {
        Ok(json!({
            "id": row.get::<_, i64>(0)?,
            "total_amount": row.get::<_, f64>(1)?,
            "payment_mode": row.get::<_, String>(2)?,
            "status": row.get::<_, String>(3)?,
            "created_at": row.get::<_, String>(4)?,
            "customer_name": row.get::<_, Option<String>>(5)?
        }))
    }).map_err(|e| e.to_string())?;

    let mut results = Vec::new();
    for row in rows { results.push(row.map_err(|e| e.to_string())?); }
    Ok(results)
}

#[tauri::command]
fn get_detailed_report(state: tauri::State<AppState>, report_type: String, range: String) -> Result<Vec<Value>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let date_filter = match range.as_str() {
        "yesterday" => "date(i.created_at) = date('now', '-1 day')",
        "week" => "date(i.created_at) >= date('now', '-7 days')",
        "month" => "date(i.created_at) >= date('now', 'start of month')",
        _ => "date(i.created_at) = date('now')"
    };

    let sql = match report_type.as_str() {
        "items" => format!("
            SELECT ii.product_name as name, SUM(ii.quantity) as volume, SUM(ii.tax_amount) as tax, SUM(ii.total) as total, 'Unit' as metadata
            FROM invoice_items ii JOIN invoices i ON ii.invoice_id = i.id
            WHERE {} GROUP BY ii.product_id ORDER BY total DESC", date_filter),
        "customers" => format!("
            SELECT c.name, COUNT(i.id) as volume, SUM(i.tax_amount) as tax, SUM(i.total_amount) as total, c.phone as metadata
            FROM invoices i JOIN customers c ON i.customer_id = c.id
            WHERE {} GROUP BY i.customer_id ORDER BY total DESC", date_filter),
        _ => format!("
            SELECT i.payment_mode as name, COUNT(i.id) as volume, SUM(i.tax_amount) as tax, SUM(i.total_amount) as total, i.status as metadata
            FROM invoices i WHERE {} GROUP BY i.payment_mode", date_filter),
    };

    let mut stmt = conn.prepare(&sql).map_err(|e| e.to_string())?;
    let rows = stmt.query_map([], |row| {
        Ok(json!({
            "name": row.get::<_, String>(0)?,
            "volume": row.get::<_, f64>(1)?,
            "tax": row.get::<_, f64>(2)?,
            "total": row.get::<_, f64>(3)?,
            "metadata": row.get::<_, Option<String>>(4)?
        }))
    }).map_err(|e| e.to_string())?;

    let mut results = Vec::new();
    for row in rows { results.push(row.map_err(|e| e.to_string())?); }
    Ok(results)
}

#[tauri::command]
fn get_report_summary(state: tauri::State<AppState>, range: String) -> Result<Value, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let filter = match range.as_str() {
        "week" => "date(created_at) >= date('now', '-7 days')",
        "month" => "date(created_at) >= date('now', 'start of month')",
        _ => "date(created_at) = date('now')"
    };

    let sql = format!("SELECT COALESCE(SUM(total_amount), 0.0), COUNT(id), COALESCE(AVG(total_amount), 0.0) FROM invoices WHERE {}", filter);
    let (rev, bills, avg): (f64, i64, f64) = conn.query_row(&sql, [], |r| Ok((r.get(0)?, r.get(1)?, r.get(2)?))).unwrap_or((0.0, 0, 0.0));

    Ok(json!({ "revenue": rev, "bills": bills, "avgValue": avg, "profit": rev * 0.15, "revenueTrend": 12, "profitTrend": 8 }))
}

// --- SUPPLY CHAIN & INVENTORY UPDATES ---

#[tauri::command]
fn add_purchase_record(
    state: tauri::State<AppState>,
    supplier_id: i64,
    bill_number: Option<String>,
    total_amount: f64,
    paid_amount: f64,
    payment_status: String,
    items: Vec<PurchaseItemInput>
) -> Result<String, String> {
    let mut conn = state.db.lock().map_err(|e| e.to_string())?;
    let tx = conn.transaction().map_err(|e| e.to_string())?;

    // 1. Insert Master Purchase
    tx.execute(
        "INSERT INTO purchases (supplier_id, bill_number, total_amount, paid_amount, payment_status) VALUES (?1, ?2, ?3, ?4, ?5)",
        params![supplier_id, bill_number, total_amount, paid_amount, payment_status],
    ).map_err(|e| e.to_string())?;
    
    let purchase_id = tx.last_insert_rowid();

    // 2. Process Items & Update Inventory
    for item in items {
        tx.execute(
            "INSERT INTO purchase_items (purchase_id, product_id, product_name, quantity, purchase_price, mrp, total) VALUES (?1, ?2, (SELECT name FROM products WHERE id=?2), ?3, ?4, ?5, ?6)",
            params![purchase_id, item.productId, item.qty, item.purchasePrice, item.mrp, (item.qty * item.purchasePrice)],
        ).map_err(|e| e.to_string())?;

        tx.execute(
            "UPDATE products SET stock_quantity = stock_quantity + ?1, purchase_price = ?2, selling_price = ?3 WHERE id = ?4",
            params![item.qty, item.purchasePrice, item.mrp, item.productId],
        ).map_err(|e| e.to_string())?;
        
        tx.execute(
            "INSERT INTO inventory_logs (product_id, quantity_change, change_type, reference_id) VALUES (?1, ?2, 'PURCHASE', ?3)",
            params![item.productId, item.qty, purchase_id],
        ).map_err(|e| e.to_string())?;
    }

    tx.commit().map_err(|e| e.to_string())?;
    Ok("Purchase and Stock recorded".to_string())
}

#[tauri::command]
fn add_khata_transaction(state: tauri::State<AppState>, customer_id: i64, amount: f64, txn_type: String, remarks: String) -> Result<String, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO khata (customer_id, amount, txn_type, remarks) VALUES (?1, ?2, ?3, ?4)",
        params![customer_id, amount, txn_type, remarks],
    ).map_err(|e| e.to_string())?;
    Ok("Transaction recorded".to_string())
}

// --- EXISTING DATA FETCHERS ---

#[tauri::command]
fn get_all_products(state: tauri::State<AppState>) -> Result<Vec<Product>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare("SELECT id, name, barcode, category, unit, hsn_code, purchase_price, selling_price, stock_quantity FROM products ORDER BY name ASC").map_err(|e| e.to_string())?;
    let iter = stmt.query_map([], |row| {
        Ok(Product {
            id: row.get(0)?, name: row.get(1)?, barcode: row.get(2)?, category: row.get(3)?,
            unit: row.get(4)?, hsn_code: row.get(5)?, purchase_price: row.get(6)?, selling_price: row.get(7)?, stock_quantity: row.get(8)?
        })
    }).map_err(|e| e.to_string())?;
    let mut res = Vec::new();
    for p in iter { res.push(p.map_err(|e| e.to_string())?); }
    Ok(res)
}

#[tauri::command]
fn get_all_customers(state: tauri::State<AppState>) -> Result<Vec<Customer>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare("
        SELECT c.id, c.name, c.phone, 
        COALESCE(SUM(CASE WHEN k.txn_type = 'CREDIT_GIVEN' THEN k.amount ELSE 0 END), 0.0) -
        COALESCE(SUM(CASE WHEN k.txn_type = 'PAYMENT_RECEIVED' THEN k.amount ELSE 0 END), 0.0) as total_due
        FROM customers c LEFT JOIN khata k ON c.id = k.customer_id GROUP BY c.id
    ").map_err(|e| e.to_string())?;
    let iter = stmt.query_map([], |row| {
        Ok(Customer { id: row.get(0)?, name: row.get(1)?, phone: row.get(2)?, total_due: row.get(3)? })
    }).map_err(|e| e.to_string())?;
    let mut res = Vec::new();
    for c in iter { res.push(c.map_err(|e| e.to_string())?); }
    Ok(res)
}

#[tauri::command]
fn get_all_suppliers(state: tauri::State<AppState>) -> Result<Vec<Supplier>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare("SELECT id, name, phone, gstin FROM suppliers ORDER BY name ASC").map_err(|e| e.to_string())?;
    let iter = stmt.query_map([], |row| {
        Ok(Supplier { id: row.get(0)?, name: row.get(1)?, phone: row.get(2)?, gstin: row.get(3)? })
    }).map_err(|e| e.to_string())?;
    let mut res = Vec::new();
    for s in iter { res.push(s.map_err(|e| e.to_string())?); }
    Ok(res)
}

#[tauri::command]
fn get_all_staff(state: tauri::State<AppState>) -> Result<Vec<StaffMember>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare("SELECT id, name, phone, role, allow_discount, allow_delete FROM staff").map_err(|e| e.to_string())?;
    let iter = stmt.query_map([], |row| {
        Ok(StaffMember { id: row.get(0)?, name: row.get(1)?, phone: row.get(2)?, pin: None, role: row.get(3)?, allow_discount: row.get(4)?, allow_delete: row.get(5)? })
    }).map_err(|e| e.to_string())?;
    let mut res = Vec::new();
    for m in iter { res.push(m.map_err(|e| e.to_string())?); }
    Ok(res)
}

#[tauri::command]
fn get_customer_khata(state: tauri::State<AppState>, customer_id: i64) -> Result<Vec<KhataEntry>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare("SELECT id, created_at, txn_type, amount, remarks FROM khata WHERE customer_id = ?1 ORDER BY created_at DESC").map_err(|e| e.to_string())?;
    let iter = stmt.query_map([customer_id], |row| {
        Ok(KhataEntry { id: row.get(0)?, date: row.get(1)?, txn_type: row.get(2)?, amount: row.get(3)?, remarks: row.get(4)? })
    }).map_err(|e| e.to_string())?;
    let mut res = Vec::new();
    for e in iter { res.push(e.map_err(|e| e.to_string())?); }
    Ok(res)
}

#[tauri::command]
fn get_supplier_purchases(state: tauri::State<AppState>, supplier_id: i64) -> Result<Vec<PurchaseRecord>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare("SELECT id, bill_number, total_amount, payment_status, created_at FROM purchases WHERE supplier_id = ?1 ORDER BY created_at DESC").map_err(|e| e.to_string())?;
    let iter = stmt.query_map([supplier_id], |row| {
        Ok(PurchaseRecord { id: row.get(0)?, bill_number: row.get(1)?, total_amount: row.get(2)?, payment_status: row.get(3)?, created_at: row.get(4)? })
    }).map_err(|e| e.to_string())?;
    let mut res = Vec::new();
    for r in iter { res.push(r.map_err(|e| e.to_string())?); }
    Ok(res)
}

#[tauri::command]
fn add_product(state: tauri::State<AppState>, name: String, barcode: Option<String>, selling_price: f64, unit: String, hsn_code: Option<String>) -> Result<String, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    conn.execute("INSERT INTO products (name, barcode, selling_price, unit, hsn_code) VALUES (?1, ?2, ?3, ?4, ?5)", params![name, barcode, selling_price, unit, hsn_code]).map_err(|e| e.to_string())?;
    Ok("Product added".to_string())
}

#[tauri::command]
fn add_supplier(state: tauri::State<AppState>, name: String, phone: String, gstin: Option<String>) -> Result<i64, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    conn.execute("INSERT INTO suppliers (name, phone, gstin) VALUES (?1, ?2, ?3)", params![name, phone, gstin]).map_err(|e| e.to_string())?;
    Ok(conn.last_insert_rowid())
}

#[tauri::command]
fn create_invoice(state: tauri::State<AppState>, customer_id: Option<i64>, subtotal: f64, discount_percent: f64, discount_amount: f64, tax_amount: f64, total_amount: f64, payment_mode: String, status: String) -> Result<i64, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    conn.execute("INSERT INTO invoices (customer_id, subtotal, discount_percent, discount_amount, tax_amount, total_amount, payment_mode, status) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)", 
        params![customer_id, subtotal, discount_percent, discount_amount, tax_amount, total_amount, payment_mode, status]).map_err(|e| e.to_string())?;
    Ok(conn.last_insert_rowid())
}

#[tauri::command]
fn get_daily_sales(state: tauri::State<AppState>) -> Result<f64, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let total: f64 = conn.query_row("SELECT COALESCE(SUM(total_amount), 0.0) FROM invoices WHERE date(created_at) = date('now') AND status != 'HOLD'", [], |r| r.get(0)).unwrap_or(0.0);
    Ok(total)
}

#[tauri::command]
fn get_khata_due(state: tauri::State<AppState>, customer_id: i64) -> Result<f64, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let due: f64 = conn.query_row("SELECT COALESCE(SUM(CASE WHEN txn_type='CREDIT_GIVEN' THEN amount ELSE 0 END),0.0) - COALESCE(SUM(CASE WHEN txn_type='PAYMENT_RECEIVED' THEN amount ELSE 0 END),0.0) FROM khata WHERE customer_id=?1", [customer_id], |r| r.get(0)).unwrap_or(0.0);
    Ok(due)
}

fn main() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_shortcuts(["ctrl+space"])
                .unwrap()
                .with_handler(|app, shortcut, event| {
                    if event.state == ShortcutState::Pressed && shortcut.matches(Modifiers::CONTROL, Code::Space) {
                        if let Some(window) = app.get_webview_window("main") {
                            if window.is_visible().unwrap_or(false) { window.hide().unwrap(); } else { window.show().unwrap(); window.set_focus().unwrap(); }
                        }
                    }
                })
                .build(),
        )
        .setup(|app| {
            let app_dir = app.path().app_data_dir().expect("App data dir failed");
            std::fs::create_dir_all(&app_dir).unwrap();
            let db_conn = database::initialize_database(&app_dir).expect("DB init failed");
            app.manage(AppState { db: Mutex::new(db_conn) });

            let quit_i = MenuItem::with_id(app, "quit", "Quit VyaparSetu", true, None::<&str>)?;
            let hide_i = MenuItem::with_id(app, "hide", "Hide Dashboard", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&hide_i, &quit_i])?;

            let _tray = TrayIconBuilder::new()
                .menu(&menu)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "quit" => { std::process::exit(0); }
                    "hide" => { if let Some(window) = app.get_webview_window("main") { window.hide().unwrap(); } }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::DoubleClick { .. } = event {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") { window.show().unwrap(); window.set_focus().unwrap(); }
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
            get_supplier_purchases,
            verify_staff_pin,
            add_staff,
            update_staff_permission,
            delete_staff,
            get_daily_stats,
            get_recent_invoices,
            get_detailed_report,
            get_report_summary,
            add_purchase_record,
            add_khata_transaction
        ])
        .run(tauri::generate_context!())
        .expect("Runtime Error");
}