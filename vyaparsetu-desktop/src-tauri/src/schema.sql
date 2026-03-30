
CREATE TABLE IF NOT EXISTS company (id TEXT PRIMARY KEY, name TEXT, gstin TEXT, fy_start TEXT);
CREATE TABLE IF NOT EXISTS ledger_groups (id TEXT PRIMARY KEY, name TEXT, nature TEXT); 
CREATE TABLE IF NOT EXISTS ledgers (id TEXT PRIMARY KEY, name TEXT, group_id TEXT, opening_bal REAL, is_system INTEGER);
CREATE TABLE IF NOT EXISTS inventory (id TEXT PRIMARY KEY, item_code TEXT, name TEXT, stock REAL, rate REAL, unit TEXT);
CREATE TABLE IF NOT EXISTS vouchers (id TEXT PRIMARY KEY, v_type TEXT, date TEXT, total REAL, narration TEXT);
CREATE TABLE IF NOT EXISTS voucher_entries (id TEXT PRIMARY KEY, voucher_id TEXT, ledger_id TEXT, debit REAL, credit REAL);
