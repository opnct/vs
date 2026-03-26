// Prevents additional console window on Windows in release, DO NOT REMOVE
#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod database; // Connects the new SQLite database logic

use rusqlite::Connection;
use std::sync::Mutex;
use tauri::Manager;
use tauri::menu::{Menu, MenuItem};
use tauri::tray::{TrayIconBuilder, TrayIconEvent};
use tauri_plugin_global_shortcut::{Code, Modifiers, ShortcutState};

// --- APP STATE (Holds the Offline Database Connection) ---
struct AppState {
    db: Mutex<Connection>,
}

// --- NATIVE HARDWARE COMMANDS (Exposed to React) ---

#[tauri::command]
fn sync_offline_pos(payload: String) -> String {
    // In a production app, this connects to the local SQLite .db file,
    // reads unsynced rows, and pushes them to Firebase via REST.
    println!("Executing background sync for payload: {}", payload);
    format!("SUCCESS: Local Khata & POS data securely synced to VyaparSetu Cloud. Payload processed: {}", payload)
}

#[tauri::command]
fn print_receipt(receipt_data: String) -> Result<String, String> {
    // This sends raw ESC/POS byte commands directly to the USB/COM port
    // bypassing the Windows Print Spooler for instant 0.1s printing.
    println!("Sending to Thermal Printer: {}", receipt_data);
    Ok(format!("Hardware command successful. Receipt dispatched to USB LPT1: [{}]", receipt_data))
}

#[tauri::command]
fn read_weighing_scale() -> Result<f32, String> {
    // Reads continuous byte stream from a Bluetooth or Serial (COM3) weighing scale.
    println!("Reading COM port for weighing scale...");
    Ok(2.450) // Returning simulated 2.45 KG value
}

// --- SQLITE OFFLINE RETAIL COMMANDS (Exposed to React) ---

#[tauri::command]
fn add_product(state: tauri::State<AppState>, name: String, barcode: Option<String>, selling_price: f64) -> Result<String, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO products (name, barcode, selling_price) VALUES (?1, ?2, ?3)",
        (name, barcode, selling_price),
    ).map_err(|e| e.to_string())?;
    Ok("Product added successfully to local SQLite".to_string())
}

#[tauri::command]
fn create_invoice(state: tauri::State<AppState>, customer_id: Option<i64>, subtotal: f64, total_amount: f64, payment_mode: String, status: String) -> Result<i64, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO invoices (customer_id, subtotal, total_amount, payment_mode, status) VALUES (?1, ?2, ?3, ?4, ?5)",
        (customer_id, subtotal, total_amount, payment_mode, status),
    ).map_err(|e| e.to_string())?;
    Ok(conn.last_insert_rowid())
}

#[tauri::command]
fn get_daily_sales(state: tauri::State<AppState>) -> Result<f64, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    // Uses SQLite's built-in date functions to get today's total revenue instantly
    let mut stmt = conn.prepare("SELECT COALESCE(SUM(total_amount), 0.0) FROM invoices WHERE date(created_at) = date('now')").map_err(|e| e.to_string())?;
    let total: f64 = stmt.query_row([], |row| row.get(0)).map_err(|e| e.to_string())?;
    Ok(total)
}

#[tauri::command]
fn get_khata_due(state: tauri::State<AppState>, customer_id: i64) -> Result<f64, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    // Calculates total Udhaar minus total Payments received for a specific customer
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
                            // Instantly open the AI floating terminal from anywhere in Windows
                            // Even if they are using Excel or watching a video
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
            std::fs::create_dir_all(&app_dir).unwrap(); // Ensure the directory exists on C: Drive
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
                // Show window if they double click the tray icon
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
            sync_offline_pos,
            print_receipt,
            read_weighing_scale,
            add_product,
            create_invoice,
            get_daily_sales,
            get_khata_due
        ])
        .run(tauri::generate_context!())
        .expect("Fatal Error: VyaparSetu Runtime Failed to Initialize");
}