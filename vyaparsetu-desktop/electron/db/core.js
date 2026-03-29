import Database from 'better-sqlite3';
import { app } from 'electron';
import path from 'path';

// Store the database securely in the user's AppData/Roaming folder
const dbPath = path.join(app.getPath('userData'), 'vyaparsetu_pos.db');

const db = new Database(dbPath, { 
    // verbose: console.log // Uncomment to see all SQL queries in the console
});

// PRAGMA Enforcement for High Performance and ACID Compliance
db.pragma('journal_mode = WAL'); // Write-Ahead Logging prevents read/write locks
db.pragma('synchronous = NORMAL');
db.pragma('foreign_keys = ON');

export default db;