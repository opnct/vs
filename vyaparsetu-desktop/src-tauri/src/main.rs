
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
mod db;
mod commands;

fn main() {
    tauri::Builder::default()
        .setup(|_app| { db::init_db().expect("DB Init Failed"); Ok(()) })
        .invoke_handler(tauri::generate_handler![commands::create_ledger, commands::get_ledgers])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
