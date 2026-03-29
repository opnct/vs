#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use rusqlite::{params, Connection, OptionalExtension};
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::State;
use chrono::Local;

// --- STATE MANAGEMENT ---
struct AppState {
    db: Mutex<Connection>,
}

// --- DATA STRUCTURES (Serialized to JSON for React) ---
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Settings {
    pub shop_name: String,
    pub shop_address: String,
    pub phone: String,
    pub gst_enabled: bool,
    pub gstin: String,
    pub printer_port: String,
    pub receipt_footer: String,
    pub logo_base64: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct DailyStats {
    pub total_sales: f64,
    pub cash: f64,
    pub upi: f64,
    pub udhaar: f64,
    pub profit: f64,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct PulseData {
    pub name: String,
    pub value: f64,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Invoice {
    pub id: String,
    pub customer_name: Option<String>,
    pub total_amount: f64,
    pub status: String,
    pub created_at: String,
}

// --- TAURI COMMANDS (Exposed to React Frontend) ---

#[tauri::command]
fn get_settings(state: State<AppState>) -> Result<Settings, String> {
    let conn = state.db.lock().unwrap();
    let mut stmt = conn.prepare(
        "SELECT shop_name, shop_address, phone, gst_enabled, gstin, printer_port, receipt_footer, logo_base64 FROM settings WHERE id = 1"
    ).map_err(|e| e.to_string())?;

    let settings = stmt.query_row([], |row| {
        Ok(Settings {
            shop_name: row.get(0)?,
            shop_address: row.get(1)?,
            phone: row.get(2)?,
            gst_enabled: row.get(3)?,
            gstin: row.get(4)?,
            printer_port: row.get(5)?,
            receipt_footer: row.get(6)?,
            logo_base64: row.get(7)?,
        })
    }).optional().map_err(|e| e.to_string())?;

    match settings {
        Some(s) => Ok(s),
        None => Ok(Settings {
            shop_name: "".to_string(),
            shop_address: "".to_string(),
            phone: "".to_string(),
            gst_enabled: false,
            gstin: "".to_string(),
            printer_port: "USB001".to_string(),
            receipt_footer: "".to_string(),
            logo_base64: None,
        })
    }
}

#[tauri::command]
fn update_settings(settings: Settings, state: State<AppState>) -> Result<(), String> {
    let conn = state.db.lock().unwrap();
    conn.execute(
        "INSERT OR REPLACE INTO settings (id, shop_name, shop_address, phone, gst_enabled, gstin, printer_port, receipt_footer, logo_base64)
         VALUES (1, ?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
        params![
            settings.shop_name,
            settings.shop_address,
            settings.phone,
            settings.gst_enabled,
            settings.gstin,
            settings.printer_port,
            settings.receipt_footer,
            settings.logo_base64,
        ],
    ).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn get_daily_stats(state: State<AppState>) -> Result<DailyStats, String> {
    let conn = state.db.lock().unwrap();
    let today = Local::now().format("%Y-%m-%d").to_string();
    
    // Real SQL aggregation logic for the Dashboard
    let mut stmt = conn.prepare(
        "SELECT status, SUM(total_amount) FROM invoices WHERE date(created_at) = ?1 GROUP BY status"
    ).map_err(|e| e.to_string())?;

    let mut rows = stmt.query(params![today]).map_err(|e| e.to_string())?;
    
    let mut stats = DailyStats { total_sales: 0.0, cash: 0.0, upi: 0.0, udhaar: 0.0, profit: 0.0 };
    
    while let Some(row) = rows.next().map_err(|e| e.to_string())? {
        let status: String = row.get(0).map_err(|e| e.to_string())?;
        let amount: f64 = row.get(1).map_err(|e| e.to_string())?;
        
        stats.total_sales += amount;
        stats.profit += amount * 0.15; // Estimating 15% margin for POS

        match status.as_str() {
            "PAID" | "CASH" => stats.cash += amount,
            "UPI" => stats.upi += amount,
            "UDHAAR" | "UNPAID" => stats.udhaar += amount,
            _ => {}
        }
    }
    
    Ok(stats)
}

#[tauri::command]
fn get_sales_pulse(state: State<AppState>) -> Result<Vec<PulseData>, String> {
    let conn = state.db.lock().unwrap();
    
    // Aggregate past 7 days of sales for the chart
    let mut stmt = conn.prepare(
        "SELECT strftime('%w', created_at) as day_of_week, SUM(total_amount) 
         FROM invoices 
         WHERE created_at >= date('now', '-7 days')
         GROUP BY day_of_week
         ORDER BY day_of_week ASC"
    ).map_err(|e| e.to_string())?;

    let day_names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    let mut pulse = Vec::new();
    
    let mut rows = stmt.query([]).map_err(|e| e.to_string())?;
    while let Some(row) = rows.next().map_err(|e| e.to_string())? {
        let day_index: String = row.get(0).unwrap_or_else(|_| "0".to_string());
        let amount: f64 = row.get(1).unwrap_or(0.0);
        let idx: usize = day_index.parse().unwrap_or(0);
        
        pulse.push(PulseData {
            name: day_names[idx].to_string(),
            value: amount,
        });
    }

    Ok(pulse)
}

#[tauri::command]
fn get_recent_invoices(limit: u32, state: State<AppState>) -> Result<Vec<Invoice>, String> {
    let conn = state.db.lock().unwrap();
    let mut stmt = conn.prepare(
        "SELECT id, customer_name, total_amount, status, created_at FROM invoices ORDER BY created_at DESC LIMIT ?1"
    ).map_err(|e| e.to_string())?;

    let invoices = stmt.query_map(params![limit], |row| {
        Ok(Invoice {
            id: row.get(0)?,
            customer_name: row.get(1)?,
            total_amount: row.get(2)?,
            status: row.get(3)?,
            created_at: row.get(4)?,
        })
    }).map_err(|e| e.to_string())?;

    let mut result = Vec::new();
    for invoice in invoices {
        result.push(invoice.map_err(|e| e.to_string())?);
    }
    
    Ok(result)
}

#[tauri::command]
fn sync_offline_pos(payload: String) -> Result<String, String> {
    // Placeholder for cloud sync logic execution
    println!("Cloud Sync Triggered with payload: {}", payload);
    Ok("SYNC_SUCCESS".to_string())
}

// --- INITIALIZATION ---

fn init_db(conn: &Connection) -> rusqlite::Result<()> {
    conn.execute_batch(
        "CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY,
            shop_name TEXT NOT NULL,
            shop_address TEXT NOT NULL,
            phone TEXT NOT NULL,
            gst_enabled BOOLEAN NOT NULL DEFAULT 0,
            gstin TEXT NOT NULL,
            printer_port TEXT NOT NULL,
            receipt_footer TEXT NOT NULL,
            logo_base64 TEXT
        );
        CREATE TABLE IF NOT EXISTS invoices (
            id TEXT PRIMARY KEY,
            customer_name TEXT,
            total_amount REAL NOT NULL,
            status TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );"
    )?;
    Ok(())
}

fn main() {
    // 1. Setup SQLite Database File
    let db_path = "vyaparsetu_local.db";
    let conn = Connection::open(db_path).expect("Failed to establish SQLite connection.");
    
    // 2. Initialize Tables
    init_db(&conn).expect("Failed to initialize database schemas.");

    // 3. Launch Tauri Application
    tauri::Builder::default()
        .manage(AppState {
            db: Mutex::new(conn),
        })
        .invoke_handler(tauri::generate_handler![
            get_settings,
            update_settings,
            get_daily_stats,
            get_sales_pulse,
            get_recent_invoices,
            sync_offline_pos
        ])
        .run(tauri::generate_context!())
        .expect("Error while running Tauri VyaparSetu application");
}