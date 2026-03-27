use rusqlite::params;
use serde::Deserialize;
use tauri::State;
use crate::AppState; // Binds to the high-performance DbPool
use chrono::Utc;

// --- DTOs (Data Transfer Objects) ---

#[derive(Deserialize)]
pub struct CartItemInput {
    pub product_id: String,
    pub quantity: f64,
    pub unit_price: f64,
    pub discount_percent: f64,
    pub cgst_percent: f64,
    pub sgst_percent: f64,
    pub is_tax_inclusive: bool,
}

#[derive(Deserialize)]
pub struct SplitPayment {
    pub mode: String, // 'CASH', 'UPI', 'CARD', 'UDHAAR'
    pub amount: f64,
}

#[derive(Deserialize)]
pub struct CheckoutPayload {
    pub customer_id: Option<String>,
    pub items: Vec<CartItemInput>,
    pub payments: Vec<SplitPayment>,
}

#[derive(Deserialize)]
pub struct RefundPayload {
    pub invoice_id: String,
    pub reason: String,
}

// --- CORE BILLING LOGIC ---

/// Processes a complex checkout, handles inclusive/exclusive taxes, updates stock, and saves the invoice.
#[tauri::command]
pub fn cmd_process_checkout(state: State<AppState>, payload: CheckoutPayload) -> Result<String, String> {
    let mut conn = state.pool.get().map_err(|e| e.to_string())?;
    let tx = conn.transaction().map_err(|e| e.to_string())?;

    let invoice_id = format!("INV-{}", Utc::now().timestamp_millis());
    
    let mut total_gross = 0.0;
    let mut total_discount = 0.0;
    let mut total_tax = 0.0;
    let mut grand_total = 0.0;

    // 1. Process Line Items & Deduct Stock
    for (idx, item) in payload.items.iter().enumerate() {
        let item_id = format!("{}-{}", invoice_id, idx);
        let combined_tax_rate = item.cgst_percent + item.sgst_percent;
        
        // Base amount before any math
        let base_amount = item.quantity * item.unit_price;
        let discount_amount = base_amount * (item.discount_percent / 100.0);
        let amount_after_discount = base_amount - discount_amount;

        let (taxable_value, tax_amount);

        // Inclusive vs Exclusive GST Math
        if item.is_tax_inclusive {
            taxable_value = amount_after_discount / (1.0 + (combined_tax_rate / 100.0));
            tax_amount = amount_after_discount - taxable_value;
        } else {
            taxable_value = amount_after_discount;
            tax_amount = taxable_value * (combined_tax_rate / 100.0);
        }

        let final_line_total = taxable_value + tax_amount;

        total_gross += base_amount;
        total_discount += discount_amount;
        total_tax += tax_amount;
        grand_total += final_line_total;

        // Insert Line Item
        tx.execute(
            "INSERT INTO invoice_items (id, invoice_id, product_id, quantity, unit_price, discount_percent, tax_percent, total_price) 
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
            params![item_id, invoice_id, item.product_id, item.quantity, item.unit_price, item.discount_percent, combined_tax_rate, final_line_total]
        ).map_err(|e| e.to_string())?;

        // Deduct Physical Stock
        tx.execute(
            "UPDATE products SET stock_quantity = stock_quantity - ?1 WHERE id = ?2",
            params![item.quantity, item.product_id]
        ).map_err(|e| e.to_string())?;
    }

    // 2. Process Payments (Handles Split Payments)
    let mut payment_modes = Vec::new();
    let mut udhaar_amount = 0.0;

    for payment in &payload.payments {
        payment_modes.push(format!("{}:{}", payment.mode, payment.amount));
        if payment.mode == "UDHAAR" {
            udhaar_amount += payment.amount;
        }
        
        // Log payment to ledger
        let ledger_id = format!("PAY-{}", Utc::now().timestamp_micros());
        tx.execute(
            "INSERT INTO ledger_entries (id, entity_type, entity_id, entry_type, amount, notes) 
             VALUES (?1, 'INVOICE', ?2, 'CREDIT', ?3, ?4)",
            params![ledger_id, invoice_id, payment.amount, payment.mode]
        ).map_err(|e| e.to_string())?;
    }

    let combined_payment_mode = payment_modes.join(" | ");
    let invoice_status = if udhaar_amount > 0.0 { "UNPAID" } else { "PAID" };

    // 3. Update Customer Khata (if Udhaar exists)
    if udhaar_amount > 0.0 {
        if let Some(ref cust_id) = payload.customer_id {
            tx.execute(
                "UPDATE customers SET current_balance = current_balance + ?1 WHERE id = ?2",
                params![udhaar_amount, cust_id]
            ).map_err(|e| e.to_string())?;
        } else {
            return Err("Cannot process UDHAAR without a linked Customer ID".to_string());
        }
    }

    // 4. Save Master Invoice Record
    tx.execute(
        "INSERT INTO invoices (id, customer_id, total_amount, tax_amount, discount_amount, grand_total, payment_mode, status) 
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
        params![invoice_id, payload.customer_id, total_gross, total_tax, total_discount, grand_total, combined_payment_mode, invoice_status]
    ).map_err(|e| e.to_string())?;

    tx.commit().map_err(|e| e.to_string())?;
    Ok(invoice_id)
}

/// Processes a full refund, restores physical inventory, and voids the invoice.
#[tauri::command]
pub fn cmd_process_refund(state: State<AppState>, payload: RefundPayload) -> Result<String, String> {
    let mut conn = state.pool.get().map_err(|e| e.to_string())?;
    let tx = conn.transaction().map_err(|e| e.to_string())?;

    // 1. Fetch original items to restore stock
    let mut stmt = tx.prepare("SELECT product_id, quantity FROM invoice_items WHERE invoice_id = ?1").unwrap();
    let items_to_restore = stmt.query_map([&payload.invoice_id], |row| {
        Ok((row.get::<_, String>(0)?, row.get::<_, f64>(1)?))
    }).map_err(|e| e.to_string())?;

    for item_result in items_to_restore {
        if let Ok((product_id, qty)) = item_result {
            tx.execute(
                "UPDATE products SET stock_quantity = stock_quantity + ?1 WHERE id = ?2",
                params![qty, product_id]
            ).map_err(|e| e.to_string())?;
        }
    }

    // 2. Check if invoice was part of Udhaar, reverse Khata balance
    let invoice_info: (Option<String>, String, f64) = tx.query_row(
        "SELECT customer_id, payment_mode, grand_total FROM invoices WHERE id = ?1",
        params![&payload.invoice_id],
        |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?))
    ).map_err(|_| "Invoice not found".to_string())?;

    if invoice_info.1.contains("UDHAAR") {
        if let Some(cust_id) = invoice_info.0 {
            tx.execute(
                "UPDATE customers SET current_balance = current_balance - ?1 WHERE id = ?2",
                params![invoice_info.2, cust_id]
            ).map_err(|e| e.to_string())?;
        }
    }

    // 3. Mark invoice as VOID/REFUNDED
    tx.execute(
        "UPDATE invoices SET status = 'REFUNDED' WHERE id = ?1",
        params![payload.invoice_id]
    ).map_err(|e| e.to_string())?;

    // 4. Log the audit trail
    tx.execute(
        "INSERT INTO activity_logs (id, user_id, action, target_table, target_id, details) VALUES (?1, 'SYSTEM', 'REFUND', 'invoices', ?2, ?3)",
        params![Utc::now().timestamp_millis().to_string(), payload.invoice_id, payload.reason]
    ).map_err(|e| e.to_string())?;

    tx.commit().map_err(|e| e.to_string())?;
    Ok("Invoice successfully refunded and stock restored".into())
}

/// Generates a raw ESC/POS string buffer for thermal printing based on an invoice ID
#[tauri::command]
pub fn cmd_generate_receipt_buffer(state: State<AppState>, invoice_id: String) -> Result<String, String> {
    let conn = state.pool.get().map_err(|e| e.to_string())?;

    // Fetch Shop Settings
    let (shop_name, shop_address, phone, footer): (String, String, String, String) = conn.query_row(
        "SELECT shop_name, shop_address, phone, receipt_footer FROM settings WHERE id = 1",
        [],
        |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?, row.get(3)?))
    ).unwrap_or(("VyaparSetu Store".into(), "Local Address".into(), "0000000".into(), "Thank you!".into()));

    // Fetch Invoice Master
    let (grand_total, payment_mode, created_at): (f64, String, String) = conn.query_row(
        "SELECT grand_total, payment_mode, created_at FROM invoices WHERE id = ?1",
        params![invoice_id],
        |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?))
    ).map_err(|_| "Invoice not found".to_string())?;

    // Build thermal string buffer (48 character width standard for 80mm printers)
    let mut out = String::new();
    out.push_str(&format!("{:^48}\n", shop_name));
    out.push_str(&format!("{:^48}\n", shop_address));
    out.push_str(&format!("{:^48}\n", format!("Ph: {}", phone)));
    out.push_str(&format!("{:-<48}\n", ""));
    out.push_str(&format!("Receipt No: {:<20} Date: {}\n", invoice_id, &created_at[0..10]));
    out.push_str(&format!("{:-<48}\n", ""));
    
    out.push_str(&format!("{:<20} {:>6} {:>8} {:>10}\n", "Item", "Qty", "Price", "Total"));
    out.push_str(&format!("{:-<48}\n", ""));

    // Fetch Line Items
    let mut stmt = conn.prepare(
        "SELECT p.name, i.quantity, i.unit_price, i.total_price 
         FROM invoice_items i 
         JOIN products p ON i.product_id = p.id 
         WHERE i.invoice_id = ?1"
    ).unwrap();

    let items_iter = stmt.query_map([&invoice_id], |row| {
        Ok((row.get::<_, String>(0)?, row.get::<_, f64>(1)?, row.get::<_, f64>(2)?, row.get::<_, f64>(3)?))
    }).unwrap();

    for item in items_iter.flatten() {
        let (name, qty, price, total) = item;
        let short_name = if name.chars().count() > 18 { name.chars().take(15).collect::<String>() + "..." } else { name };
        out.push_str(&format!("{:<20} {:>6.1} {:>8.2} {:>10.2}\n", short_name, qty, price, total));
    }

    out.push_str(&format!("{:-<48}\n", ""));
    out.push_str(&format!("{:<30} {:>17.2}\n", "GRAND TOTAL:", grand_total));
    out.push_str(&format!("{:<30} {:>17}\n", "Payment Mode:", payment_mode));
    out.push_str(&format!("{:-<48}\n", ""));
    out.push_str(&format!("{:^48}\n", footer));
    out.push_str(&format!("{:^48}\n\n\n\n", "Powered by VyaparSetu"));

    Ok(out)
}