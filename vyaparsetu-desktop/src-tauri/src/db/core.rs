use r2d2::Pool;
use r2d2_sqlite::SqliteConnectionManager;
use std::fs;
use std::path::Path;

// Define a type alias for our highly concurrent connection pool
pub type DbPool = Pool<SqliteConnectionManager>;

/// Initializes the SQLite Connection Pool and executes Schema Migrations.
pub fn init_db(app_data_dir: &Path) -> Result<DbPool, r2d2::Error> {
    
    // 1. Ensure the persistent data directory exists
    if !app_data_dir.exists() {
        fs::create_dir_all(app_data_dir).expect("Failed to create app data directory");
    }

    let db_path = app_data_dir.join("vyaparsetu_pos.db");
    
    // 2. Configure the SQLite Connection Manager with High-Performance PRAGMAs
    let manager = SqliteConnectionManager::file(&db_path)
        .with_init(|c| {
            // Write-Ahead Logging (WAL) prevents the database from locking 
            // when reads (POS Billing) and writes (Cloud Sync) happen simultaneously.
            c.execute_batch(
                "PRAGMA journal_mode = WAL;
                 PRAGMA synchronous = NORMAL;
                 PRAGMA temp_store = MEMORY;
                 PRAGMA foreign_keys = ON;"
            )
        });

    // 3. Build the r2d2 Connection Pool (Allows up to 10 concurrent DB connections)
    let pool = r2d2::Pool::builder()
        .max_size(10) 
        .build(manager)?;

    // 4. Automatic Database Migration Engine
    // Pulls a connection from the pool and strictly enforces our 200-feature schema
    let conn = pool.get().expect("Failed to get DB connection for migrations");
    conn.execute_batch(crate::db::schema::SCHEMA).expect("Database schema migration failed");

    Ok(pool)
}