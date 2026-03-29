import db from '../db/core.js';

export function getAllProducts() {
  const stmt = db.prepare('SELECT * FROM products ORDER BY name ASC');
  return stmt.all();
}

export function createProduct(p) {
  const stmt = db.prepare(`
    INSERT INTO products (id, name, sku, barcode, category, unit, cost_price, selling_price, stock_quantity, min_stock, hsn_code, tax_rate) 
    VALUES (@id, @name, @sku, @barcode, @category, @unit, @cost_price, @selling_price, @stock_quantity, @min_stock, @hsn_code, @tax_rate)
  `);
  
  const info = stmt.run(p);
  return info.changes > 0 ? "Product created" : "Failed to create";
}