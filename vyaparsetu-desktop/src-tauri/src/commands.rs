
use serde::{Serialize, Deserialize};
use rusqlite::params;
use crate::db::init_db;

#[tauri::command]
pub fn exec_sql(query: String) -> Result<String, String> {
    let conn = init_db().map_err(|e| e.to_string())?;
    conn.execute(&query, []).map_err(|e| e.to_string())?;
    Ok("Executed".to_string())
}

#[tauri::command]
pub fn exec_sql_read(query: String) -> Result<Vec<serde_json::Value>, String> {
    let conn = init_db().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare(&query).map_err(|e| e.to_string())?;
    let cols: Vec<String> = stmt.column_names().into_iter().map(|s| s.to_string()).collect();
    
    let rows = stmt.query_map([], |row| {
        let mut map = serde_json::Map::new();
        for (i, col) in cols.iter().enumerate() {
            let val: rusqlite::types::Value = row.get(i).unwrap();
            let json_val = match val {
                rusqlite::types::Value::Null => serde_json::Value::Null,
                rusqlite::types::Value::Integer(i) => serde_json::Value::Number(i.into()),
                rusqlite::types::Value::Real(f) => serde_json::json!(f),
                rusqlite::types::Value::Text(t) => serde_json::Value::String(t),
                rusqlite::types::Value::Blob(_) => serde_json::Value::String("[BLOB]".to_string()),
            };
            map.insert(col.clone(), json_val);
        }
        Ok(serde_json::Value::Object(map))
    }).map_err(|e| e.to_string())?;

    let mut res = Vec::new();
    for r in rows { res.push(r.map_err(|e| e.to_string())?); }
    Ok(res)
}

#[tauri::command]
pub fn post_pos_sale(total: f64, items: Vec<serde_json::Value>, customer_id: Option<String>) -> Result<String, String> {
    let conn = init_db().map_err(|e| e.to_string())?;
    let v_id = format!("VCH-{}", chrono::Local::now().timestamp());
    
    // 1. Sales Voucher Header
    conn.execute("INSERT INTO vouchers (id, v_type, date, total, narration) VALUES (?1, 'Sales', date('now'), ?2, 'POS Sale')", params![v_id, total]).map_err(|e| e.to_string())?;
    
    // 2. Double-Entry: Debit Customer/Cash & Credit Sales
    let dr_ledger = customer_id.unwrap_or_else(|| "L1".to_string());
    conn.execute("INSERT INTO voucher_entries (id, voucher_id, ledger_id, debit, credit) VALUES (?1, ?2, ?3, ?4, 0)", params![format!("{}-D", v_id), v_id, dr_ledger, total]).map_err(|e| e.to_string())?;
    conn.execute("INSERT INTO voucher_entries (id, voucher_id, ledger_id, debit, credit) VALUES (?1, ?2, 'L2', 0, ?3)", params![format!("{}-C", v_id), v_id, total]).map_err(|e| e.to_string())?;
    
    // 3. Update Inventory Stock Levels
    for item in items {
        let id: String = serde_json::from_value(item["id"].clone()).unwrap();
        let qty: f64 = serde_json::from_value(item["qty"].clone()).unwrap();
        conn.execute("UPDATE inventory SET stock = stock - ?1 WHERE id = ?2", params![qty, id]).map_err(|e| e.to_string())?;
    }
    Ok(v_id)
}
