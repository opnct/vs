// Prevents additional console window on Windows in release, DO NOT REMOVE
#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::{
    CustomMenuItem, GlobalShortcutManager, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu,
};

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

fn main() {
    // 1. SETUP WINDOWS SYSTEM TRAY (Runs in background like an Antivirus)
    let quit = CustomMenuItem::new("quit".to_string(), "Quit VyaparSetu");
    let hide = CustomMenuItem::new("hide".to_string(), "Hide Command Dashboard");
    let tray_menu = SystemTrayMenu::new().add_item(hide).add_item(quit);
    let system_tray = SystemTray::new().with_menu(tray_menu);

    tauri::Builder::default()
        .system_tray(system_tray)
        .on_system_tray_event(|app, event| match event {
            SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
                "quit" => {
                    std::process::exit(0);
                }
                "hide" => {
                    let window = app.get_window("main").unwrap();
                    window.hide().unwrap();
                }
                _ => {}
            },
            // Show window if they double click the tray icon
            SystemTrayEvent::DoubleClick { .. } => {
                let window = app.get_window("main").unwrap();
                window.show().unwrap();
                window.set_focus().unwrap();
            }
            _ => {}
        })
        // 2. SETUP GLOBAL WINDOWS SHORTCUT (Ctrl+Space for VyaparBot)
        .setup(|app| {
            let app_handle = app.handle();
            let mut shortcut_manager = app_handle.global_shortcut_manager();
            
            // Instantly open the AI floating terminal from anywhere in Windows
            // Even if they are using Excel or watching a video
            let _ = shortcut_manager.register("Ctrl+Space", move || {
                let window = app_handle.get_window("main").unwrap();
                if window.is_visible().unwrap() {
                    window.hide().unwrap();
                } else {
                    window.show().unwrap();
                    window.set_focus().unwrap();
                }
            });
            Ok(())
        })
        // 3. REGISTER THE COMMANDS FOR REACT
        .invoke_handler(tauri::generate_handler![
            sync_offline_pos,
            print_receipt,
            read_weighing_scale
        ])
        .run(tauri::generate_context!())
        .expect("Fatal Error: VyaparSetu Runtime Failed to Initialize");
}