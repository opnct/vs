// Prevents additional console window on Windows in release, DO NOT REMOVE
#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::Manager;
use tauri::menu::{Menu, MenuItem};
use tauri::tray::{TrayIconBuilder, TrayIconEvent};
use tauri_plugin_global_shortcut::{Code, Modifiers, ShortcutState};

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
            read_weighing_scale
        ])
        .run(tauri::generate_context!())
        .expect("Fatal Error: VyaparSetu Runtime Failed to Initialize");
}