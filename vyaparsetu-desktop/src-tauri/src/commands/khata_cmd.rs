use rusqlite::params;
use serde::Deserialize;
use serde_json::{json, Value};
use tauri::State;
use crate::AppState; // Binds to the DbPool
use chrono::Utc;

#[derive(Deserialize)]
pub struct CreditInvoiceInput {
    pub invoice_id: String,
    pub customer_id: String,
    pub total_amount: f64,
    pub tax_amount: f64,
    pub discount_amount: f64,
    pub grand_total: f64,
    pub items: Vec<CreditInvoiceItemInput>,
}

#[derive(Deserialize)]
pub struct CreditInvoiceItemInput {
    pub id: String,
    pub product_id: String,
    pub quantity: f64,
    pub unit_price: f64,
    pub discount_percent: f64,
    pub tax_percent: f64,
    pub total_price: f64,
}

/// A STRICT ACID transaction that completely processes an Udhaar (Credit) sale.
/// If any step fails (e.g., limit exceeded), the entire sale cancels and nothing saves.
#[tauri::command]
pub fn cmd_process_credit_sale(state: State<AppState>, sale: CreditInvoiceInput) -> Result<String, String> {
    let mut conn = state.pool.get().map_err(|e| e.to_string())?;
    
    // Begin strict ACID Transaction
    let tx = conn.transaction().map_err(|e| e.to_string())?;

    // 1. Verify Credit Limits (Risk Management)
    let current_credit: (f64, f64) = tx.query_row(
        "SELECT current_balance, credit_limit FROM customers WHERE id = ?1",
        params![sale.customer_id],
        |row| Ok((row.get(0)?, row.get(1)?))
    ).map_err(|_| "Customer not found in Khata system".to_string())?;

    if current_credit.1 > 0.0 && (current_credit.0 + sale.grand_total) > current_credit.1 {
        return Err("Transaction Denied: Customer credit limit exceeded".to_string());
    }

    // 2. Lock-in the core Invoice
    tx.execute(
        "INSERT INTO invoices (id, customer_id, total_amount, tax_amount, discount_amount, grand_total, payment_mode, status) 
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, 'UDHAAR', 'UNPAID')",
        params![sale.invoice_id, sale.customer_id, sale.total_amount, sale.tax_amount, sale.discount_amount, sale.grand_total]
    ).map_err(|e| e.to_string())?;

    // 3. Write Line Items & Deduct Physical Inventory
    for item in sale.items {
        tx.execute(
            "INSERT INTO invoice_items (id, invoice_id, product_id, quantity, unit_price, discount_percent, tax_percent, total_price) 
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
            params![item.id, sale.invoice_id, item.product_id, item.quantity, item.unit_price, item.discount_percent, item.tax_percent, item.total_price]
        ).map_err(|e| e.to_string())?;
        
        tx.execute(
            "UPDATE products SET stock_quantity = stock_quantity - ?1 WHERE id = ?2",
            params![item.quantity, item.product_id]
        ).map_err(|e| e.to_string())?;
    }

    // 4. Update Global Khata Balance
    tx.execute(
        "UPDATE customers SET current_balance = current_balance + ?1 WHERE id = ?2",
        params![sale.grand_total, sale.customer_id]
    ).map_err(|e| e.to_string())?;

    // 5. Generate Official Ledger Entry
    let ledger_id = Utc::now().timestamp_millis().to_string();
    tx.execute(
        "INSERT INTO ledger_entries (id, entity_type, entity_id, entry_type, amount, notes) 
         VALUES (?1, 'CUSTOMER', ?2, 'DEBIT', ?3, ?4)",
        params![ledger_id, sale.customer_id, sale.grand_total, format!("Udhaar Bill #{}", sale.invoice_id)]
    ).map_err(|e| e.to_string())?;

    // Commit all queries simultaneously
    tx.commit().map_err(|e| e.to_string())?;

    Ok("Credit sale successfully finalized and ledger updated".into())
}

/// Registers when a customer pays back part of their Udhaar.
#[tauri::command]
pub fn cmd_record_khata_payment(state: State<AppState>, payment_id: String, customer_id: String, amount: f64, notes: String) -> Result<String, String> {
    let mut conn = state.pool.get().map_err(|e| e.to_string())?;
    let tx = conn.transaction().map_err(|e| e.to_string())?;

    // 1. Insert official payment credit ledger log
    tx.execute(
        "INSERT INTO ledger_entries (id, entity_type, entity_id, entry_type, amount, notes) VALUES (?1, 'CUSTOMER', ?2, 'CREDIT', ?3, ?4)",
        params![payment_id, customer_id, amount, notes]
    ).map_err(|e| e.to_string())?;

    // 2. Decrease the outstanding Khata balance
    tx.execute(
        "UPDATE customers SET current_balance = current_balance - ?1 WHERE id = ?2",
        params![amount, customer_id]
    ).map_err(|e| e.to_string())?;

    tx.commit().map_err(|e| e.to_string())?;

    Ok("Khata repayment successfully registered".into())
}