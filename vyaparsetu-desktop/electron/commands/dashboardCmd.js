import db from '../db/core.js';

export function getDailyStats() {
  const stmt = db.prepare(`
    SELECT 
      COALESCE(SUM(grand_total), 0) as total_sales,
      COALESCE(SUM(CASE WHEN payment_mode LIKE '%CASH%' THEN grand_total ELSE 0 END), 0) as cash,
      COALESCE(SUM(CASE WHEN payment_mode LIKE '%UPI%' THEN grand_total ELSE 0 END), 0) as upi,
      COALESCE(SUM(CASE WHEN payment_mode LIKE '%UDHAAR%' THEN grand_total ELSE 0 END), 0) as udhaar,
      COALESCE(SUM((ii.unit_price - p.cost_price) * ii.quantity), 0) as profit
    FROM invoices i
    LEFT JOIN invoice_items ii ON i.id = ii.invoice_id
    LEFT JOIN products p ON ii.product_id = p.id
    WHERE date(i.created_at) = date('now')
  `);
  
  return stmt.get();
}

export function getRecentInvoices(limit = 10) {
  const stmt = db.prepare(`
    SELECT i.id, i.grand_total as total_amount, i.status, i.created_at, c.name as customer_name 
    FROM invoices i 
    LEFT JOIN customers c ON i.customer_id = c.id 
    ORDER BY i.created_at DESC LIMIT ?
  `);
  return stmt.all(limit);
}