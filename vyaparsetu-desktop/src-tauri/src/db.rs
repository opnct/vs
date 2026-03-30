
use rusqlite::{Connection, Result};
pub fn init_db() -> Result<Connection> {
    let conn = Connection::open("vyaparsetu_workspace.db")?;
    let schema = include_str!("schema.sql");
    conn.execute_batch(schema)?;
    // Seed default groups/ledgers if empty
    conn.execute("INSERT OR IGNORE INTO ledger_groups (id, name, nature) VALUES ('G1', 'Cash-in-Hand', 'Assets'), ('G2', 'Sales Accounts', 'Income')", [])?;
    conn.execute("INSERT OR IGNORE INTO ledgers (id, name, group_id, opening_bal, is_system) VALUES ('L1', 'Main Cash', 'G1', 0, 1), ('L2', 'Local Sales', 'G2', 0, 1)", [])?;
    Ok(conn)
}
