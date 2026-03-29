import db from '../db/core.js';

export function processCheckout(payload) {
  const invoiceId = `INV-${Date.now()}`;
  let totalGross = 0;
  let totalTax = 0;
  let totalDiscount = 0;
  let grandTotal = 0;

  // better-sqlite3 uses synchronous transactions for extreme speed and strict ACID compliance
  const performCheckout = db.transaction((data) => {
    
    // 1. Process Line Items
    const insertItem = db.prepare(`
      INSERT INTO invoice_items (id, invoice_id, product_id, quantity, unit_price, discount_percent, tax_percent, total_price) 
      VALUES (@id, @invoice_id, @product_id, @quantity, @unit_price, @discount_percent, @tax_percent, @total_price)
    `);
    
    const updateStock = db.prepare(`
      UPDATE products SET stock_quantity = stock_quantity - @qty WHERE id = @product_id
    `);

    data.items.forEach((item, index) => {
      const combinedTaxRate = item.cgst_percent + item.sgst_percent;
      const baseAmount = item.quantity * item.unit_price;
      const discountAmt = baseAmount * (item.discount_percent / 100.0);
      const afterDiscount = baseAmount - discountAmt;

      let taxableValue, taxAmt;
      if (item.is_tax_inclusive) {
        taxableValue = afterDiscount / (1.0 + (combinedTaxRate / 100.0));
        taxAmt = afterDiscount - taxableValue;
      } else {
        taxableValue = afterDiscount;
        taxAmt = taxableValue * (combinedTaxRate / 100.0);
      }

      const finalTotal = taxableValue + taxAmt;
      
      totalGross += baseAmount;
      totalDiscount += discountAmt;
      totalTax += taxAmt;
      grandTotal += finalTotal;

      insertItem.run({
        id: `${invoiceId}-${index}`,
        invoice_id: invoiceId,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount_percent: item.discount_percent,
        tax_percent: combinedTaxRate,
        total_price: finalTotal
      });

      updateStock.run({ qty: item.quantity, product_id: item.product_id });
    });

    // 2. Handle Split Payments & Ledger
    let paymentModesStr = "";
    let udhaarAmount = 0;

    const insertLedger = db.prepare(`
      INSERT INTO ledger_entries (id, entity_type, entity_id, entry_type, amount, notes) 
      VALUES (@id, 'INVOICE', @entity_id, 'CREDIT', @amount, @notes)
    `);

    data.payments.forEach((payment, idx) => {
      paymentModesStr += `${payment.mode}:${payment.amount} | `;
      if (payment.mode === 'UDHAAR') udhaarAmount += payment.amount;

      insertLedger.run({
        id: `PAY-${Date.now()}-${idx}`,
        entity_id: invoiceId,
        amount: payment.amount,
        notes: payment.mode
      });
    });

    // 3. Handle Customer Khata Udhaar
    if (udhaarAmount > 0) {
      if (!data.customer_id) throw new Error("UDHAAR requires a valid Customer ID.");
      const updateKhata = db.prepare(`
        UPDATE customers SET current_balance = current_balance + @amount WHERE id = @customer_id
      `);
      updateKhata.run({ amount: udhaarAmount, customer_id: data.customer_id });
    }

    // 4. Save Master Invoice
    const insertInvoice = db.prepare(`
      INSERT INTO invoices (id, customer_id, total_amount, tax_amount, discount_amount, grand_total, payment_mode, status) 
      VALUES (@id, @customer_id, @total_amount, @tax_amount, @discount_amount, @grand_total, @payment_mode, @status)
    `);

    insertInvoice.run({
      id: invoiceId,
      customer_id: data.customer_id || null,
      total_amount: totalGross,
      tax_amount: totalTax,
      discount_amount: totalDiscount,
      grand_total: grandTotal,
      payment_mode: paymentModesStr,
      status: udhaarAmount > 0 ? 'UNPAID' : 'PAID'
    });
  });

  performCheckout(payload);
  return invoiceId;
}