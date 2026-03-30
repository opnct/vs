
use serde::{Serialize, Deserialize};
use rusqlite::params;
use crate::db::init_db;

#[derive(Serialize, Deserialize)]
pub struct Ledger { pub id: String, pub name: String, pub group_name: String, pub balance: f64 }

#[tauri::command]
pub fn create_ledger(id: String, name: String, group_name: String, balance: f64) -> Result<String, String> {
    let conn = init_db().map_err(|e| e.to_string())?;
    conn.execute("INSERT INTO ledgers (id, name, group_name, opening_bal, type) VALUES (?1, ?2, ?3, ?4, 'AC')", params![id, name, group_name, balance]).map_err(|e| e.to_string())?;
    Ok("Success".to_string())
}

#[tauri::command]
pub fn get_ledgers() -> Result<Vec<Ledger>, String> {
    let conn = init_db().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare("SELECT id, name, group_name, opening_bal FROM ledgers").map_err(|e| e.to_string())?;
    let rows = stmt.query_map([], |row| Ok(Ledger { id: row.get(0)?, name: row.get(1)?, group_name: row.get(2)?, balance: row.get(3)? })).map_err(|e| e.to_string())?;
    let mut ledgers = Vec::new();
    for row in rows { ledgers.push(row.map_err(|e| e.to_string())?); }
    Ok(ledgers)
}
