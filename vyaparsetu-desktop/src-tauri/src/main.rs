
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
mod db;
mod commands;
fn main() {
    tauri::Builder::default()
        .setup(|_app| { db::init_db().unwrap(); Ok(()) })
        .invoke_handler(tauri::generate_handler![commands::exec_sql, commands::exec_sql_read, commands::post_double_entry])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
