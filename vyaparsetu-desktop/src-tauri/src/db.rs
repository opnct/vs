
use rusqlite::{Connection, Result};

pub fn init_db() -> Result<Connection> {
    let db_path = "vyaparsetu_core.db";
    let conn = Connection::open(db_path)?;
    let schema = include_str!("schema.sql");
    conn.execute_batch(schema)?;
    Ok(conn)
}
