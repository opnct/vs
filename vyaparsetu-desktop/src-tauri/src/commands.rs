
use serde::{Serialize, Deserialize};
use rusqlite::params;
use crate::db::init_db;

#[derive(Serialize)]
pub struct Ledger { pub id: String, pub name: String, pub balance: f64 }
#[derive(Serialize)]
pub struct Item { pub id: String, pub code: String, pub name: String, pub stock: f64, pub rate: f64 }

#[tauri::command]
pub fn exec_sql(query: String) -> Result<String, String> {
    let conn = init_db().map_err(|e| e.to_string())?;
    conn.execute(&query, []).map_err(|e| e.to_string())?;
    Ok("Executed".to_string())
}

#[tauri::command]
pub fn get_ledgers() -> Result<Vec<Ledger>, String> {
    let conn = init_db().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare("SELECT l.id, l.name, l.opening_bal + COALESCE(SUM(ve.debit) - SUM(ve.credit), 0) FROM ledgers l LEFT JOIN voucher_entries ve ON l.id = ve.ledger_id GROUP BY l.id").unwrap();
    let rows = stmt.query_map([], |row| Ok(Ledger { id: row.get(0)?, name: row.get(1)?, balance: row.get(2)? })).unwrap();
    Ok(rows.filter_map(Result::ok).collect())
}

#[tauri::command]
pub fn get_inventory() -> Result<Vec<Item>, String> {
    let conn = init_db().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare("SELECT id, item_code, name, stock, rate FROM inventory").unwrap();
    let rows = stmt.query_map([], |row| Ok(Item { id: row.get(0)?, code: row.get(1)?, name: row.get(2)?, stock: row.get(3)?, rate: row.get(4)? })).unwrap();
    Ok(rows.filter_map(Result::ok).collect())
}

// REAL DOUBLE ENTRY POS POSTING LOGIC
#[tauri::command]
pub fn post_pos_sale(total: f64, items: Vec<serde_json::Value>) -> Result<String, String> {
    let conn = init_db().map_err(|e| e.to_string())?;
    let v_id = format!("VCH-{}", chrono::Local::now().timestamp());
    
    // 1. Create Voucher
    conn.execute("INSERT INTO vouchers (id, v_type, date, total, narration) VALUES (?1, 'Sales', date('now'), ?2, 'POS Cash Sale')", params![v_id, total]).map_err(|e| e.to_string())?;
    
    // 2. Double Entry: Debit Cash (L1), Credit Sales (L2)
    conn.execute("INSERT INTO voucher_entries (id, voucher_id, ledger_id, debit, credit) VALUES (?1, ?2, 'L1', ?3, 0)", params![format!("{}-D", v_id), v_id, total]).map_err(|e| e.to_string())?;
    conn.execute("INSERT INTO voucher_entries (id, voucher_id, ledger_id, debit, credit) VALUES (?1, ?2, 'L2', 0, ?3)", params![format!("{}-C", v_id), v_id, total]).map_err(|e| e.to_string())?;
    
    // 3. Update Inventory Stock
    for item in items {
        let id: String = serde_json::from_value(item["id"].clone()).unwrap();
        let qty: f64 = serde_json::from_value(item["qty"].clone()).unwrap();
        conn.execute("UPDATE inventory SET stock = stock - ?1 WHERE id = ?2", params![qty, id]).map_err(|e| e.to_string())?;
    }
    
    Ok(v_id)
}
