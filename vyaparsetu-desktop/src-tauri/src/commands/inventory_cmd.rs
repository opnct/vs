use rusqlite::params;
use serde::Deserialize;
use serde_json::{json, Value};
use tauri::State;
use crate::AppState; // Binds to the DbPool created in main.rs

#[derive(Deserialize)]
pub struct ProductEntry {
    pub id: String,
    pub name: String,
    pub sku: Option<String>,
    pub barcode: Option<String>,
    pub category: Option<String>,
    pub unit: String,
    pub cost_price: f64,
    pub selling_price: f64,
    pub stock_quantity: f64,
    pub min_stock: f64,
    pub hsn_code: Option<String>,
    pub tax_rate: f64,
}

/// Creates a new product directly in the SQLite Database
#[tauri::command]
pub fn cmd_add_product(state: State<AppState>, p: ProductEntry) -> Result<String, String> {
    let conn = state.pool.get().map_err(|e| e.to_string())?;
    
    conn.execute(
        "INSERT INTO products (id, name, sku, barcode, category, unit, cost_price, selling_price, stock_quantity, min_stock, hsn_code, tax_rate) 
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)",
        params![p.id, p.name, p.sku, p.barcode, p.category, p.unit, p.cost_price, p.selling_price, p.stock_quantity, p.min_stock, p.hsn_code, p.tax_rate]
    ).map_err(|e| e.to_string())?;
    
    Ok("Product successfully added to inventory".into())
}

/// Safely adjusts stock (e.g., manual stock audits, damaged goods)
#[tauri::command]
pub fn cmd_adjust_stock(state: State<AppState>, product_id: String, adjustment: f64, reason: String) -> Result<String, String> {
    let mut conn = state.pool.get().map_err(|e| e.to_string())?;
    let tx = conn.transaction().map_err(|e| e.to_string())?;
    
    // Update the physical stock
    tx.execute(
        "UPDATE products SET stock_quantity = stock_quantity + ?1 WHERE id = ?2",
        params![adjustment, product_id]
    ).map_err(|e| e.to_string())?;

    // Log the adjustment to the immutable audit trail
    tx.execute(
        "INSERT INTO activity_logs (id, user_id, action, target_table, target_id, details) VALUES (?1, 'SYSTEM_AUDIT', 'STOCK_ADJUSTMENT', 'products', ?2, ?3)",
        params![chrono::Utc::now().timestamp_millis().to_string(), product_id, format!("Stock shifted by {}: {}", adjustment, reason)]
    ).map_err(|e| e.to_string())?;

    tx.commit().map_err(|e| e.to_string())?;
    Ok("Stock level adjusted and audited successfully".into())
}

/// Analytics: Identifies highly profitable/fast-moving items from the last 30 days
#[tauri::command]
pub fn cmd_get_fast_moving_items(state: State<AppState>, limit: u32) -> Result<Vec<Value>, String> {
    let conn = state.pool.get().map_err(|e| e.to_string())?;
    
    // Complex JOIN fetching actual sales velocity directly from the DB engine
    let mut stmt = conn.prepare(
        "SELECT p.id, p.name, SUM(ii.quantity) as total_sold, SUM(ii.total_price) as revenue
         FROM invoice_items ii 
         JOIN products p ON ii.product_id = p.id 
         JOIN invoices i ON ii.invoice_id = i.id 
         WHERE i.created_at >= date('now', '-30 days')
         GROUP BY p.id 
         ORDER BY total_sold DESC 
         LIMIT ?1"
    ).map_err(|e| e.to_string())?;

    let rows = stmt.query_map([limit], |r| {
        Ok(json!({
            "id": r.get::<_, String>(0)?,
            "name": r.get::<_, String>(1)?,
            "total_sold": r.get::<_, f64>(2)?,
            "revenue": r.get::<_, f64>(3)?
        }))
    }).map_err(|e| e.to_string())?;

    Ok(rows.filter_map(Result::ok).collect())
}