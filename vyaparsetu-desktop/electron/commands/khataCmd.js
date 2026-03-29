import db from '../db/core.js';

export function getAllCustomers() {
  // Alias current_balance to balance, credit_limit to limit for frontend map
  const stmt = db.prepare('SELECT id, name, phone, current_balance as balance, credit_limit as limit FROM customers ORDER BY name ASC');
  return stmt.all();
}

export function createCustomer(c) {
  const stmt = db.prepare(`
    INSERT INTO customers (id, name, phone, address, credit_limit) 
    VALUES (@id, @name, @phone, @address, @credit_limit)
  `);
  stmt.run(c);
  return "Customer created";
}

export function getCustomerLedger(customerId) {
  const stmt = db.prepare(`
    SELECT id, entity_id, entry_type as type, amount, notes, created_at as date 
    FROM ledger_entries 
    WHERE entity_type = 'CUSTOMER' AND entity_id = ? 
    ORDER BY created_at DESC
  `);
  return stmt.all(customerId);
}

// Strict ACID transaction for Logging Payments/Udhaar
export function logKhataPayment(p) {
  const processLog = db.transaction((payload) => {
    // 1. Insert Ledger Entry
    const insertLog = db.prepare(`
      INSERT INTO ledger_entries (id, entity_type, entity_id, entry_type, amount, notes) 
      VALUES (@id, @entity_type, @entity_id, 'CREDIT', @amount, @notes)
    `);
    insertLog.run(payload);

    // 2. Adjust Balance
    // If payload.amount is negative (Udhaar given), this adds to the balance (debt increases).
    // If payload.amount is positive (Payment received), this subtracts from balance (debt decreases).
    const updateBal = db.prepare(`
      UPDATE customers SET current_balance = current_balance - (@amount) WHERE id = @entity_id
    `);
    updateBal.run({ amount: payload.amount, entity_id: payload.entity_id });
  });

  processLog(p);
  return "Payment Processed";
}