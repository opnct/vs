
use rusqlite::{Connection, Result};
pub fn init_db() -> Result<Connection> {
    let conn = Connection::open("vyaparsetu_data.db")?;
    let schema = include_str!("schema.sql");
    conn.execute_batch(schema)?;
    // Core Tally Ledgers & Groups Seed
    conn.execute_batch("
        INSERT OR IGNORE INTO ledger_groups (id, name, nature) VALUES 
        ('G1', 'Cash-in-Hand', 'Assets'), ('G2', 'Sales Accounts', 'Income'), 
        ('G3', 'Sundry Debtors', 'Assets'), ('G4', 'Sundry Creditors', 'Liabilities'),
        ('G5', 'Purchase Accounts', 'Expenses'), ('G6', 'Bank Accounts', 'Assets');
        INSERT OR IGNORE INTO ledgers (id, name, group_id, opening_bal, is_system) VALUES 
        ('L1', 'Main Cash', 'G1', 0, 1), ('L2', 'Local Sales', 'G2', 0, 1), ('L3', 'Purchases', 'G5', 0, 1);
    ")?;
    Ok(conn)
}
