use rusqlite::{params, Connection};
use reqwest::Client;
use serde_json::{json, Value};
use std::sync::{Arc, Mutex};
use std::time::Duration;
use tokio::time::sleep;

/// The SyncEngine manages the background replication of local SQLite rows to Firestore.
pub struct SyncEngine {
    db: Arc<Mutex<Connection>>,
    client: Client,
    firebase_uid: String,
    project_id: String,
}

impl SyncEngine {
    pub fn new(db: Arc<Mutex<Connection>>, firebase_uid: String) -> Self {
        Self {
            db,
            client: Client::new(),
            firebase_uid,
            // In production, this is pulled from a config or environment variable
            project_id: "vyaparsetu-production".to_string(), 
        }
    }

    /// Primary background loop that monitors for new local data
    pub async fn run_loop(&self) {
        println!("🚀 VyaparSetu Sync Engine: Background worker started for UID: {}", self.firebase_uid);
        
        // Ensure sync tracking table exists
        let _ = self.init_sync_metadata();

        loop {
            // Process core tables in order of dependency
            let _ = self.sync_table("products", "products").await;
            let _ = self.sync_table("customers", "customers").await;
            let _ = self.sync_table("invoices", "sales").await;
            let _ = self.sync_table("khata", "ledger").await;

            // Wait 10 seconds before next check to preserve CPU/Battery
            sleep(Duration::from_secs(10)).await;
        }
    }

    fn init_sync_metadata(&self) -> Result<(), String> {
        let conn = self.db.lock().map_err(|e| e.to_string())?;
        conn.execute(
            "CREATE TABLE IF NOT EXISTS sync_metadata (
                table_name TEXT PRIMARY KEY,
                last_synced_id INTEGER DEFAULT 0
            )",
            [],
        ).map_err(|e| e.to_string())?;
        Ok(())
    }

    async fn sync_table(&self, sqlite_table: &str, firestore_collection: &str) -> Result<(), String> {
        let (last_id, rows) = self.get_unsynced_rows(sqlite_table)?;

        if rows.is_empty() {
            return Ok(());
        }

        for row in rows {
            let doc_id = format!("{}_{}", sqlite_table, row["id"]);
            let url = format!(
                "https://firestore.googleapis.com/v1/projects/{}/databases/(default)/documents/users/{}/{}?documentId={}",
                self.project_id, self.firebase_uid, firestore_collection, doc_id
            );

            // Convert SQL row to Firestore 'fields' format
            let payload = self.map_to_firestore_payload(row);

            match self.client.patch(url).json(&payload).send().await {
                Ok(resp) if resp.status().is_success() => {
                    let current_row_id = doc_id.split('_').last().unwrap().parse::<i64>().unwrap();
                    self.update_watermark(sqlite_table, current_row_id)?;
                }
                _ => {
                    // Log error and retry in next loop iteration
                    return Err(format!("Cloud push failed for table {}", sqlite_table));
                }
            }
        }

        Ok(())
    }

    fn get_unsynced_rows(&self, table: &str) -> Result<(i64, Vec<serde_json::Map<String, Value>>), String> {
        let conn = self.db.lock().map_err(|e| e.to_string())?;
        
        let last_id: i64 = conn.query_row(
            "SELECT last_synced_id FROM sync_metadata WHERE table_name = ?1",
            [table],
            |r| r.get(0),
        ).unwrap_or(0);

        let sql = format!("SELECT * FROM {} WHERE id > ?1 ORDER BY id ASC LIMIT 50", table);
        let mut stmt = conn.prepare(&sql).map_err(|e| e.to_string())?;
        
        // Dynamically map SQL columns to JSON Map
        let col_count = stmt.column_count();
        let col_names: Vec<String> = stmt.column_names().iter().map(|n| n.to_string()).collect();

        let rows_iter = stmt.query_map([last_id], |row| {
            let mut map = serde_json::Map::new();
            for i in 0..col_count {
                let value: Value = match row.get_ref(i)? {
                    rusqlite::types::ValueRef::Integer(v) => json!(v),
                    rusqlite::types::ValueRef::Real(v) => json!(v),
                    rusqlite::types::ValueRef::Text(v) => json!(String::from_utf8_lossy(v)),
                    rusqlite::types::ValueRef::Null => Value::Null,
                    _ => Value::Null,
                };
                map.insert(col_names[i].clone(), value);
            }
            Ok(map)
        }).map_err(|e| e.to_string())?;

        let mut results = Vec::new();
        for row in rows_iter {
            results.push(row.map_err(|e| e.to_string())?);
        }

        Ok((last_id, results))
    }

    fn update_watermark(&self, table: &str, id: i64) -> Result<(), String> {
        let conn = self.db.lock().map_err(|e| e.to_string())?;
        conn.execute(
            "INSERT INTO sync_metadata (table_name, last_synced_id) 
             VALUES (?1, ?2) 
             ON CONFLICT(table_name) DO UPDATE SET last_synced_id = ?2",
            params![table, id],
        ).map_err(|e| e.to_string())?;
        Ok(())
    }

    fn map_to_firestore_payload(&self, sql_row: serde_json::Map<String, Value>) -> Value {
        let mut fields = serde_json::Map::new();

        for (key, value) in sql_row {
            let firestore_val = match value {
                Value::String(s) => json!({ "stringValue": s }),
                Value::Number(n) if n.is_f64() => json!({ "doubleValue": n.as_f64().unwrap() }),
                Value::Number(n) => json!({ "integerValue": n.to_string() }),
                Value::Bool(b) => json!({ "booleanValue": b }),
                _ => json!({ "nullValue": null }),
            };
            fields.insert(key, firestore_val);
        }

        json!({ "fields": fields })
    }
}

/// Helper function to spawn the sync worker into a tokio background thread
pub fn spawn_sync_worker(db: Arc<Mutex<Connection>>, uid: String) {
    tokio::spawn(async move {
        let engine = SyncEngine::new(db, uid);
        engine.run_loop().await;
    });
}