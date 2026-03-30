
CREATE TABLE IF NOT EXISTS company (id TEXT PRIMARY KEY, name TEXT, gstin TEXT, fy_start TEXT, currency TEXT);
CREATE TABLE IF NOT EXISTS ledgers (id TEXT PRIMARY KEY, name TEXT, group_name TEXT, opening_bal REAL, type TEXT);
CREATE TABLE IF NOT EXISTS vouchers (id TEXT PRIMARY KEY, v_type TEXT, date TEXT, total REAL, narration TEXT);
CREATE TABLE IF NOT EXISTS inventory (id TEXT PRIMARY KEY, name TEXT, stock REAL, price REAL, unit TEXT);
CREATE TABLE IF NOT EXISTS transactions (id TEXT PRIMARY KEY, voucher_id TEXT, ledger_id TEXT, debit REAL, credit REAL);
