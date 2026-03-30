import os
import pathlib

FILES = {
    # ==========================================
    # 1. GLOBAL UI/UX (Strict VS Code Theme)
    # ==========================================
    "tailwind.config.js": r"""/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        vscode: {
          bg: '#1e1e1e',         // Editor background
          sidebar: '#252526',    // Explorer background
          activity: '#333333',   // Leftmost icon bar
          accent: '#007acc',     // VS Code Blue highlight
          text: '#cccccc',       // Default text
          textDark: '#858585',   // Muted text/comments
          string: '#ce9178',     // Syntax: string
          keyword: '#569cd6',    // Syntax: keyword
          func: '#dcdcaa',       // Syntax: function
          type: '#4ec9b0',       // Syntax: type/success
          border: '#3c3c3c',     // Editor borders
          tabActive: '#1e1e1e',
          tabInactive: '#2d2d2d',
          statusBg: '#007acc',
        }
      },
      fontFamily: {
        mono: ['"Fira Code"', 'Consolas', 'monospace'],
        sans: ['Inter', 'Segoe UI', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
""",

    "index.html": r"""<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Fira+Code:wght@400;500;600&display=swap" rel="stylesheet">
    <title>VyaparSetu - Workspace</title>
  </head>
  <body class="bg-vscode-bg text-vscode-text m-0 p-0 overflow-hidden font-sans antialiased">
    <div id="root" class="h-screen w-screen flex flex-col"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
""",

    "src/index.css": r"""@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html, body { @apply bg-vscode-bg text-vscode-text font-sans; overscroll-behavior: none; }
  input, textarea, select { @apply bg-[#3c3c3c] border border-transparent focus:border-vscode-accent outline-none text-vscode-text px-3 py-1.5 text-sm font-mono transition-colors rounded-sm; }
  table { @apply w-full text-left border-collapse font-mono text-[13px]; }
  th { @apply border-b border-vscode-border py-2 px-2 text-vscode-textDark font-normal whitespace-nowrap; }
  td { @apply border-b border-vscode-border/40 py-2 px-2; }
}

@layer utilities {
  .custom-scrollbar::-webkit-scrollbar { width: 10px; height: 10px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: #1e1e1e; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #424242; border: 2px solid #1e1e1e; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #4f4f4f; }
}
""",

    # ==========================================
    # 2. RUST BACKEND (Double-Entry Engine)
    # ==========================================
    "src-tauri/Cargo.toml": r"""[package]
name = "vyaparsetu"
version = "0.1.0"
description = "TallyPrime Engine Desktop App"
authors = ["VyaparSetu"]
edition = "2021"

[build-dependencies]
tauri-build = { version = "1", features = [] }

[dependencies]
tauri = { version = "1", features = ["shell-open"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
rusqlite = { version = "0.29.0", features = ["bundled"] }
chrono = "0.4"
""",

    "src-tauri/src/schema.sql": r"""
CREATE TABLE IF NOT EXISTS company (id TEXT PRIMARY KEY, name TEXT, gstin TEXT, fy_start TEXT);
CREATE TABLE IF NOT EXISTS ledger_groups (id TEXT PRIMARY KEY, name TEXT, nature TEXT); 
CREATE TABLE IF NOT EXISTS ledgers (id TEXT PRIMARY KEY, name TEXT, group_id TEXT, opening_bal REAL, is_system INTEGER);
CREATE TABLE IF NOT EXISTS inventory (id TEXT PRIMARY KEY, item_code TEXT, name TEXT, stock REAL, rate REAL, unit TEXT);
CREATE TABLE IF NOT EXISTS vouchers (id TEXT PRIMARY KEY, v_type TEXT, date TEXT, total REAL, narration TEXT);
CREATE TABLE IF NOT EXISTS voucher_entries (id TEXT PRIMARY KEY, voucher_id TEXT, ledger_id TEXT, debit REAL, credit REAL);
""",

    "src-tauri/src/db.rs": r"""
use rusqlite::{Connection, Result};
pub fn init_db() -> Result<Connection> {
    let conn = Connection::open("vyaparsetu_workspace.db")?;
    let schema = include_str!("schema.sql");
    conn.execute_batch(schema)?;
    // Seed default double-entry structure
    conn.execute("INSERT OR IGNORE INTO ledger_groups (id, name, nature) VALUES ('G1', 'Cash-in-Hand', 'Assets'), ('G2', 'Sales Accounts', 'Income'), ('G3', 'Sundry Debtors', 'Assets'), ('G4', 'Sundry Creditors', 'Liabilities')", [])?;
    conn.execute("INSERT OR IGNORE INTO ledgers (id, name, group_id, opening_bal, is_system) VALUES ('L1', 'Main Cash', 'G1', 0, 1), ('L2', 'Local Sales', 'G2', 0, 1)", [])?;
    Ok(conn)
}
""",

    "src-tauri/src/commands.rs": r"""
use serde::{Serialize, Deserialize};
use rusqlite::params;
use crate::db::init_db;

#[derive(Serialize)]
pub struct Ledger { pub id: String, pub name: String, pub balance: f64, pub group_name: String }
#[derive(Serialize)]
pub struct Item { pub id: String, pub code: String, pub name: String, pub stock: f64, pub rate: f64 }

#[tauri::command]
pub fn exec_sql(query: String) -> Result<String, String> {
    let conn = init_db().map_err(|e| e.to_string())?;
    conn.execute(&query, []).map_err(|e| e.to_string())?;
    Ok("Executed".to_string())
}

// POWERFUL: Read ANY SQL Query directly into React JSON
#[tauri::command]
pub fn exec_sql_read(query: String) -> Result<Vec<serde_json::Value>, String> {
    let conn = init_db().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare(&query).map_err(|e| e.to_string())?;
    let cols: Vec<String> = stmt.column_names().into_iter().map(|s| s.to_string()).collect();
    
    let rows = stmt.query_map([], |row| {
        let mut map = serde_json::Map::new();
        for (i, col) in cols.iter().enumerate() {
            let val: rusqlite::types::Value = row.get(i).unwrap();
            let json_val = match val {
                rusqlite::types::Value::Null => serde_json::Value::Null,
                rusqlite::types::Value::Integer(i) => serde_json::Value::Number(i.into()),
                rusqlite::types::Value::Real(f) => serde_json::json!(f),
                rusqlite::types::Value::Text(t) => serde_json::Value::String(t),
                rusqlite::types::Value::Blob(_) => serde_json::Value::String("[BLOB]".to_string()),
            };
            map.insert(col.clone(), json_val);
        }
        Ok(serde_json::Value::Object(map))
    }).map_err(|e| e.to_string())?;

    let mut res = Vec::new();
    for r in rows { res.push(r.map_err(|e| e.to_string())?); }
    Ok(res)
}

#[tauri::command]
pub fn post_pos_sale(total: f64, items: Vec<serde_json::Value>, customer_id: Option<String>) -> Result<String, String> {
    let conn = init_db().map_err(|e| e.to_string())?;
    let v_id = format!("VCH-{}", chrono::Local::now().timestamp());
    
    conn.execute("INSERT INTO vouchers (id, v_type, date, total, narration) VALUES (?1, 'Sales', date('now'), ?2, 'POS Sale')", params![v_id, total]).map_err(|e| e.to_string())?;
    
    // Debit Cash OR Customer Account
    let dr_ledger = customer_id.unwrap_or_else(|| "L1".to_string());
    conn.execute("INSERT INTO voucher_entries (id, voucher_id, ledger_id, debit, credit) VALUES (?1, ?2, ?3, ?4, 0)", params![format!("{}-D", v_id), v_id, dr_ledger, total]).map_err(|e| e.to_string())?;
    
    // Credit Sales Account
    conn.execute("INSERT INTO voucher_entries (id, voucher_id, ledger_id, debit, credit) VALUES (?1, ?2, 'L2', 0, ?3)", params![format!("{}-C", v_id), v_id, total]).map_err(|e| e.to_string())?;
    
    for item in items {
        let id: String = serde_json::from_value(item["id"].clone()).unwrap();
        let qty: f64 = serde_json::from_value(item["qty"].clone()).unwrap();
        conn.execute("UPDATE inventory SET stock = stock - ?1 WHERE id = ?2", params![qty, id]).map_err(|e| e.to_string())?;
    }
    Ok(v_id)
}
""",

    "src-tauri/src/main.rs": r"""
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
mod db;
mod commands;
fn main() {
    tauri::Builder::default()
        .setup(|_app| { db::init_db().unwrap(); Ok(()) })
        .invoke_handler(tauri::generate_handler![commands::exec_sql, commands::exec_sql_read, commands::post_pos_sale])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
""",

    # ==========================================
    # 3. REACT STATE & LAYOUT
    # ==========================================
    "src/store/useAppStore.js": r"""
import { create } from 'zustand';
export const useAppStore = create((set) => ({
  activeTab: 'Welcome.md',
  openTabs: ['Welcome.md'],
  openFile: (fileName) => set((state) => ({ 
    activeTab: fileName, 
    openTabs: state.openTabs.includes(fileName) ? state.openTabs : [...state.openTabs, fileName] 
  })),
  closeFile: (fileName) => set((state) => {
    const newTabs = state.openTabs.filter(t => t !== fileName);
    return { openTabs: newTabs, activeTab: state.activeTab === fileName ? (newTabs[0] || '') : state.activeTab };
  })
}));
""",

    "src/App.jsx": r"""
import React, { useEffect, useState } from 'react';
import { useAppStore } from './store/useAppStore';
import { Files, Search, Database, Settings, Play, X, Check, Box, Users, FileText, LayoutDashboard } from 'lucide-react';

import Dashboard from './pages/Dashboard';
import POSBilling from './pages/POSBilling';
import Ledgers from './pages/Ledgers';
import Inventory from './pages/Inventory';
import Reports from './pages/Reports';

const Explorer = () => {
  const { openFile, activeTab } = useAppStore();
  const files = [
    { name: 'Welcome.md', icon: LayoutDashboard, color: 'text-vscode-keyword' },
    { name: 'POS_Terminal.rs', icon: Play, color: 'text-vscode-type' },
    { name: 'Chart_Of_Accounts.json', icon: Database, color: 'text-vscode-string' },
    { name: 'Inventory_Master.sql', icon: Box, color: 'text-yellow-500' },
    { name: 'Financial_Reports.csv', icon: FileText, color: 'text-green-500' }
  ];

  return (
    <div className="w-64 h-full bg-vscode-sidebar border-r border-vscode-border flex flex-col shrink-0 select-none">
      <div className="px-4 py-3 text-[11px] font-bold tracking-widest text-vscode-textDark">EXPLORER</div>
      <div className="px-4 py-1 text-[11px] font-bold text-vscode-text flex items-center gap-1"><span className="rotate-90 text-vscode-textDark">›</span> VYAPARSETU_WORKSPACE</div>
      <div className="flex-1 overflow-y-auto mt-2">
        {files.map(f => (
          <div key={f.name} onClick={() => openFile(f.name)} className={`flex items-center gap-2 px-6 py-1 cursor-pointer text-[13px] ${activeTab === f.name ? 'bg-[#37373d] text-white' : 'text-vscode-text hover:bg-[#2a2d2e]'}`}>
            <f.icon size={14} className={f.color} /> {f.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  const { activeTab, openTabs, openFile, closeFile } = useAppStore();
  
  const renderContent = () => {
    switch(activeTab) {
      case 'Welcome.md': return <Dashboard />;
      case 'POS_Terminal.rs': return <POSBilling />;
      case 'Chart_Of_Accounts.json': return <Ledgers />;
      case 'Inventory_Master.sql': return <Inventory />;
      case 'Financial_Reports.csv': return <Reports />;
      default: return <div className="p-10 font-mono text-vscode-textDark">// Module initializing...</div>;
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-vscode-bg">
      <div className="w-12 h-full bg-vscode-activity flex flex-col items-center py-4 gap-6 border-r border-vscode-border shrink-0">
        <Files size={24} className="text-vscode-text cursor-pointer" />
        <Settings size={24} className="text-vscode-textDark mt-auto cursor-pointer" />
      </div>
      <Explorer />
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex h-9 bg-vscode-sidebar shrink-0 overflow-x-auto">
          {openTabs.map(tab => (
            <div key={tab} onClick={() => openFile(tab)} className={`flex items-center gap-2 px-3 py-2 cursor-pointer border-r border-vscode-border border-t border-t-transparent group ${activeTab === tab ? 'bg-vscode-bg text-vscode-accent border-t-vscode-accent' : 'bg-vscode-tabInactive text-vscode-textDark hover:bg-[#2b2b2b]'}`}>
              <span className="text-[13px] font-sans">{tab}</span>
              <X size={14} onClick={(e) => { e.stopPropagation(); closeFile(tab); }} className="hover:bg-vscode-border rounded" />
            </div>
          ))}
        </div>
        <main className="flex-1 overflow-y-auto relative custom-scrollbar p-1">{renderContent()}</main>
      </div>
      <div className="absolute bottom-0 w-full h-6 bg-vscode-statusBg text-white flex items-center px-3 text-[11px] font-sans justify-between z-50">
        <div className="flex items-center gap-4"><Check size={12}/> Tauri v1 IPC Locked</div>
        <div>sqlite3: workspace.db</div>
      </div>
    </div>
  );
}
""",

    # ==========================================
    # 4. CORE REACT MODULES (5+ Sections, Hotkeys, Logic)
    # ==========================================
    "src/pages/Dashboard.jsx": r"""
import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { useAppStore } from '../store/useAppStore';

export default function Dashboard() {
  const openFile = useAppStore(state => state.openFile);
  const [stats, setStats] = useState([]);

  useEffect(() => {
    // S4: Real DB Analytics Query
    invoke('exec_sql_read', { query: "SELECT v_type, COUNT(id) as count, SUM(total) as val FROM vouchers GROUP BY v_type" })
      .then(setStats).catch(console.error);
    
    // S5: Keyboard Shortcut Listener
    const hk = (e) => { if (e.key === 'F8') openFile('POS_Terminal.rs'); };
    window.addEventListener('keydown', hk);
    return () => window.removeEventListener('keydown', hk);
  }, []);

  return (
    <div className="max-w-4xl p-8 font-sans text-vscode-text">
      {/* SECTION 1: Welcome Header */}
      <h1 className="text-3xl font-normal mb-2">VyaparSetu Workspace</h1>
      <p className="text-vscode-textDark mb-8 text-sm">Double-Entry Engine v1.0. Press F8 anywhere for Rapid POS.</p>
      
      <div className="grid grid-cols-2 gap-10">
        {/* SECTION 2: Quick Actions */}
        <div>
          <h2 className="text-lg mb-4 font-semibold text-vscode-string">Start</h2>
          <ul className="space-y-3 text-sm font-mono">
            <li><button onClick={() => openFile('POS_Terminal.rs')} className="text-vscode-accent hover:underline">1. New POS Sale (F8)</button></li>
            <li><button onClick={() => openFile('Chart_Of_Accounts.json')} className="text-vscode-accent hover:underline">2. Manage Ledgers</button></li>
            <li><button onClick={() => openFile('Inventory_Master.sql')} className="text-vscode-accent hover:underline">3. Add Stock Item</button></li>
          </ul>
        </div>

        {/* SECTION 3: Realtime Analytics */}
        <div>
          <h2 className="text-lg mb-4 font-semibold text-vscode-type">Database Status</h2>
          <div className="bg-[#1e1e1e] border border-vscode-border p-4 rounded font-mono text-xs">
            <div className="text-vscode-keyword mb-2">// Active Vouchers</div>
            {stats.length > 0 ? stats.map((s,i) => (
              <div key={i} className="flex justify-between">
                <span>{s.v_type}:</span><span className="text-vscode-func">₹{s.val || 0} ({s.count} tx)</span>
              </div>
            )) : <div className="text-vscode-textDark">No transactions yet.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
""",

    "src/pages/POSBilling.jsx": r"""
import React, { useState, useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/tauri';

export default function POSBilling() {
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [customers, setCustomers] = useState([]);
  const [selectedCust, setSelectedCust] = useState('');
  const [status, setStatus] = useState('// S1: Engine Ready. Press F8 to Post.');
  const searchRef = useRef(null);

  useEffect(() => {
    // S2: Load Dependencies
    invoke('exec_sql_read', { query: "SELECT * FROM inventory" }).then(setItems).catch(e => setStatus(`// Err: ${e}`));
    invoke('exec_sql_read', { query: "SELECT id, name FROM ledgers WHERE group_id = 'G3'" }).then(setCustomers);
    
    // S3: Keyboard Shortcuts
    const handleKey = (e) => {
      if (e.key === 'F8') handleCheckout();
      if (e.key === 'F4') setCart([]);
      if (e.key === 'F2') searchRef.current?.focus();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [cart, selectedCust]);

  const addToCart = (item) => {
    const existing = cart.find(c => c.id === item.id);
    if(existing) setCart(cart.map(c => c.id === item.id ? {...c, qty: c.qty + 1} : c));
    else setCart([...cart, {...item, qty: 1}]);
  };

  const handleCheckout = async () => {
    if(cart.length === 0) return setStatus('// Error: Cart is empty');
    const total = cart.reduce((sum, item) => sum + (item.rate * item.qty), 0);
    try {
      setStatus('// Processing Double-Entry...');
      // S4: Execute Complex Transaction
      const vchId = await invoke('post_pos_sale', { total, items: cart, customerId: selectedCust || null });
      setStatus(`// Success: Voucher [${vchId}] posted. Press F4 to clear.`);
      setCart([]);
    } catch (e) { setStatus(`// Error: ${e}`); }
  };

  const total = cart.reduce((sum, item) => sum + (item.rate * item.qty), 0);

  return (
    <div className="flex h-full gap-4 pb-10">
      {/* S5: Inventory & Search Pane */}
      <div className="flex-1 flex flex-col border border-vscode-border bg-[#1e1e1e]">
        <div className="bg-[#252526] px-4 py-2 text-xs font-mono text-vscode-keyword border-b border-vscode-border">scanner_module.rs</div>
        <div className="p-4 flex-1 flex flex-col min-h-0">
          <input ref={searchRef} type="text" placeholder="Scan Barcode or Search (F2)..." value={search} onChange={e => setSearch(e.target.value)} className="w-full mb-4" />
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <table>
              <thead><tr><th>Code</th><th>Name</th><th>Stock</th><th>Rate</th></tr></thead>
              <tbody>
                {items.filter(i => i.name.toLowerCase().includes(search.toLowerCase())).map(item => (
                  <tr key={item.id} onClick={() => addToCart(item)} className="cursor-pointer hover:bg-[#2a2d2e]">
                    <td className="text-vscode-string">"{item.item_code}"</td>
                    <td className="text-vscode-text">{item.name}</td>
                    <td className="text-vscode-type">{item.stock}</td>
                    <td className="text-vscode-func">₹{item.rate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* S6: Cart & Checkout Pane */}
      <div className="w-[400px] flex flex-col border border-vscode-border bg-[#1e1e1e]">
        <div className="bg-[#252526] px-4 py-2 text-xs font-mono text-vscode-keyword border-b border-vscode-border">transaction_cart.json</div>
        
        <div className="p-4 border-b border-vscode-border">
          <select value={selectedCust} onChange={e=>setSelectedCust(e.target.value)} className="w-full">
            <option value="">Cash Customer (L1)</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="p-4 flex-1 overflow-y-auto custom-scrollbar font-mono text-sm">
          <span className="text-vscode-keyword">const</span> <span className="text-vscode-func">cart</span> = [
          {cart.map((c, i) => (
            <div key={c.id} className="pl-4">
              {'{'} <span className="text-vscode-textDark">id:</span> <span className="text-vscode-string">"{c.id}"</span>, <span className="text-vscode-textDark">qty:</span> <span className="text-vscode-type">{c.qty}</span>, <span className="text-vscode-textDark">rate:</span> <span className="text-vscode-type">{c.rate}</span> {'}'}{i < cart.length - 1 ? ',' : ''}
            </div>
          ))}
          ];
        </div>
        
        <div className="p-4 border-t border-vscode-border bg-[#252526]">
          <div className="flex justify-between font-mono text-lg mb-4 text-vscode-text"><span>Total:</span><span className="text-vscode-func">₹{total.toFixed(2)}</span></div>
          <button onClick={handleCheckout} className="w-full bg-vscode-accent text-white font-sans py-2 rounded hover:bg-blue-600 font-bold mb-2">Post Sale (F8)</button>
          <button onClick={() => setCart([])} className="w-full border border-vscode-border text-vscode-text font-sans py-1.5 rounded hover:bg-vscode-border text-xs">Clear Cart (F4)</button>
          <div className="mt-4 text-xs font-mono text-vscode-textDark break-all">{status}</div>
        </div>
      </div>
    </div>
  );
}
""",

    "src/pages/Ledgers.jsx": r"""
import React, { useState, useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/tauri';

export default function Ledgers() {
  const [ledgers, setLedgers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [form, setForm] = useState({ name: '', group: 'G3', bal: '' });
  const [log, setLog] = useState('// Ready.');
  const [filter, setFilter] = useState('');
  
  const nameRef = useRef(null);

  // S1: Dynamic Initialization
  const loadData = async () => {
    try {
      const gs = await invoke('exec_sql_read', { query: "SELECT * FROM ledger_groups" });
      setGroups(gs);
      // Complex Join to get Ledgers with Groups and Current Balances
      const ls = await invoke('exec_sql_read', { query: "SELECT l.id, l.name, g.name as group_name, l.opening_bal + COALESCE(SUM(ve.debit) - SUM(ve.credit), 0) as net_bal FROM ledgers l JOIN ledger_groups g ON l.group_id = g.id LEFT JOIN voucher_entries ve ON l.id = ve.ledger_id GROUP BY l.id" });
      setLedgers(ls);
    } catch(e) { setLog(`// Error: ${e}`); }
  };

  useEffect(() => {
    loadData();
    // S2: Hotkeys
    const hk = (e) => { if(e.ctrlKey && e.key === 's') { e.preventDefault(); handleCreate(); }};
    window.addEventListener('keydown', hk);
    return () => window.removeEventListener('keydown', hk);
  }, [form]);

  // S3: DB Insertion
  const handleCreate = async () => {
    if(!form.name) return setLog('// Error: Name required');
    try {
      const id = `L${Date.now()}`;
      await invoke('exec_sql', { query: `INSERT INTO ledgers (id, name, group_id, opening_bal, is_system) VALUES ('${id}', '${form.name}', '${form.group}', ${form.bal || 0}, 0)`});
      setLog(`// Created: ${form.name}`);
      loadData();
      setForm({ name: '', group: 'G3', bal: '' });
      nameRef.current?.focus();
    } catch (e) { setLog(`// Error: ${e}`); }
  };

  // S4: Filtering Logic
  const filtered = ledgers.filter(l => l.name.toLowerCase().includes(filter.toLowerCase()) || l.group_name.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="flex flex-col h-full gap-4 pb-10 font-mono text-sm">
      {/* S5: Form Section */}
      <div className="p-4 border border-vscode-border bg-[#1e1e1e]">
        <div className="text-vscode-keyword mb-4">// Create New Ledger (Ctrl+S)</div>
        <div className="flex gap-4">
          <input ref={nameRef} type="text" placeholder="Ledger Name" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} className="flex-1" />
          <select value={form.group} onChange={e=>setForm({...form, group: e.target.value})} className="w-64">
            {groups.map(g => <option key={g.id} value={g.id}>{g.name} ({g.nature})</option>)}
          </select>
          <input type="number" placeholder="Open Bal" value={form.bal} onChange={e=>setForm({...form, bal: e.target.value})} className="w-32" />
          <button onClick={handleCreate} className="bg-vscode-accent px-4 py-1 text-white rounded hover:bg-blue-600">save()</button>
        </div>
      </div>
      
      {/* S6: Data Table & Filters */}
      <div className="flex-1 flex flex-col border border-vscode-border bg-[#1e1e1e] overflow-hidden">
        <div className="p-2 bg-[#252526] border-b border-vscode-border">
          <input type="text" placeholder="Filter ledgers..." value={filter} onChange={e=>setFilter(e.target.value)} className="w-full bg-[#1e1e1e]" />
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
          <table>
            <thead><tr><th>id</th><th>name</th><th>group</th><th>net_balance</th></tr></thead>
            <tbody>
              {filtered.map(l => (
                <tr key={l.id} className="hover:bg-[#2a2d2e]">
                  <td className="text-vscode-string">"{l.id}"</td>
                  <td className="text-vscode-text">{l.name}</td>
                  <td className="text-vscode-textDark">{l.group_name}</td>
                  <td className="text-vscode-type">₹{l.net_bal?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="p-2 border border-vscode-border bg-[#252526] text-vscode-textDark text-xs">{log}</div>
    </div>
  );
}
""",

    "src/pages/Inventory.jsx": r"""
import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ code: '', name: '', stock: '', rate: '' });
  const [log, setLog] = useState('// Status: Engine Online');
  const [filter, setFilter] = useState('');

  // S1: Initialization
  const loadItems = () => invoke('exec_sql_read', { query: "SELECT * FROM inventory" }).then(setItems).catch(e => setLog(`// Error: ${e}`));
  useEffect(() => { loadItems(); }, []);

  // S2: Data Insertion
  const handleCreate = async () => {
    if(!form.name) return setLog('// Error: Missing Name');
    try {
      const id = `ITM${Date.now()}`;
      await invoke('exec_sql', { query: `INSERT INTO inventory (id, item_code, name, stock, rate, unit) VALUES ('${id}', '${form.code}', '${form.name}', ${form.stock || 0}, ${form.rate || 0}, 'PCS')`});
      setLog(`// Created: ${form.name}`);
      loadItems();
      setForm({ code: '', name: '', stock: '', rate: '' });
    } catch (e) { setLog(`// Error: ${e}`); }
  };

  // S3: Analytics (Low Stock)
  const lowStock = items.filter(i => i.stock <= 5).length;
  // S4: Analytics (Valuation)
  const totalValuation = items.reduce((sum, i) => sum + (i.stock * i.rate), 0);

  return (
    <div className="flex flex-col h-full gap-4 pb-10 font-mono text-sm">
      {/* S5: Status & Metrics */}
      <div className="flex gap-4">
        <div className="flex-1 p-3 border border-vscode-border bg-[#252526] flex justify-between">
          <span className="text-vscode-textDark">Total Items: <span className="text-vscode-type">{items.length}</span></span>
          <span className="text-vscode-textDark">Low Stock Alert: <span className="text-red-400">{lowStock}</span></span>
          <span className="text-vscode-textDark">Est. Valuation: <span className="text-vscode-func">₹{totalValuation.toFixed(2)}</span></span>
        </div>
      </div>

      <div className="p-4 border border-vscode-border bg-[#1e1e1e]">
        <div className="text-vscode-keyword mb-4">// Insert Inventory Item</div>
        <div className="flex gap-4">
          <input type="text" placeholder="Barcode/Code" value={form.code} onChange={e=>setForm({...form, code: e.target.value})} className="w-32" />
          <input type="text" placeholder="Item Name" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} className="flex-1" />
          <input type="number" placeholder="Qty" value={form.stock} onChange={e=>setForm({...form, stock: e.target.value})} className="w-24" />
          <input type="number" placeholder="Rate" value={form.rate} onChange={e=>setForm({...form, rate: e.target.value})} className="w-24" />
          <button onClick={handleCreate} className="bg-vscode-accent px-4 py-1 text-white rounded hover:bg-blue-600">insert()</button>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col border border-vscode-border bg-[#1e1e1e] overflow-hidden">
        <div className="p-2 bg-[#252526] border-b border-vscode-border">
          <input type="text" placeholder="Filter items..." value={filter} onChange={e=>setFilter(e.target.value)} className="w-full bg-[#1e1e1e]" />
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
          <table>
            <thead><tr><th>item_code</th><th>name</th><th>closing_stock</th><th>rate</th><th>valuation</th></tr></thead>
            <tbody>
              {items.filter(i => i.name.toLowerCase().includes(filter.toLowerCase())).map(i => (
                <tr key={i.id} className="hover:bg-[#2a2d2e]">
                  <td className="text-vscode-string">"{i.item_code}"</td>
                  <td className="text-vscode-text">{i.name}</td>
                  <td className={`font-bold ${i.stock <= 5 ? 'text-red-400' : 'text-vscode-type'}`}>{i.stock}</td>
                  <td className="text-vscode-func">₹{i.rate}</td>
                  <td className="text-vscode-textDark">₹{(i.stock * i.rate).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="p-2 border border-vscode-border bg-[#252526] text-vscode-textDark text-xs">{log}</div>
    </div>
  );
}
""",

    "src/pages/Reports.jsx": r"""
import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';

export default function Reports() {
  const [data, setData] = useState([]);
  const [cols, setCols] = useState([]);
  const [reportType, setReportType] = useState('DayBook');
  
  // S1: Dynamic SQL Engine for Reports
  const queries = {
    'DayBook': "SELECT v.date, v.id as voucher_no, v.v_type, l.name as ledger, ve.debit, ve.credit FROM vouchers v JOIN voucher_entries ve ON v.id = ve.voucher_id JOIN ledgers l ON ve.ledger_id = l.id ORDER BY v.date DESC",
    'TrialBalance': "SELECT l.name, g.name as grp, SUM(ve.debit) as total_dr, SUM(ve.credit) as total_cr FROM ledgers l JOIN ledger_groups g ON l.group_id = g.id LEFT JOIN voucher_entries ve ON l.id = ve.ledger_id GROUP BY l.id",
    'StockSummary': "SELECT item_code, name, stock, rate, (stock*rate) as value FROM inventory"
  };

  // S2: Data Execution
  useEffect(() => {
    invoke('exec_sql_read', { query: queries[reportType] })
      .then(res => {
        setData(res);
        if(res.length > 0) setCols(Object.keys(res[0]));
        else setCols([]);
      })
      .catch(console.error);
  }, [reportType]);

  // S3: Download Export Logic (Simulated trigger)
  const handleExport = () => alert(`Exporting ${reportType}.csv...`);

  return (
    <div className="h-full flex flex-col pb-10 font-mono text-sm gap-4">
      {/* S4: Top Action Bar */}
      <div className="flex justify-between p-3 border border-vscode-border bg-[#252526]">
        <div className="flex gap-2">
          {Object.keys(queries).map(k => (
            <button key={k} onClick={() => setReportType(k)} className={`px-3 py-1 rounded ${reportType === k ? 'bg-vscode-accent text-white' : 'bg-[#1e1e1e] text-vscode-text'}`}>
              {k}
            </button>
          ))}
        </div>
        <button onClick={handleExport} className="bg-[#1e1e1e] text-vscode-type px-3 py-1 border border-vscode-border rounded hover:bg-[#333]">Export CSV</button>
      </div>

      <div className="p-2 border border-vscode-border bg-[#1e1e1e] text-vscode-keyword flex items-center">
        <span className="text-vscode-func mr-2">EXEC:</span> {queries[reportType]}
      </div>
      
      {/* S5: Dynamic Grid Renderer */}
      <div className="flex-1 p-2 border border-vscode-border bg-[#1e1e1e] overflow-y-auto custom-scrollbar">
        {data.length > 0 ? (
          <table>
            <thead><tr>{cols.map(c => <th key={c} className="text-vscode-keyword">{c}</th>)}</tr></thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} className="hover:bg-[#2a2d2e]">
                  {cols.map(c => <td key={c} className={typeof row[c] === 'number' ? 'text-vscode-type' : 'text-vscode-string'}>{row[c]}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-vscode-textDark p-4">// No data records found.</div>
        )}
      </div>
    </div>
  );
}
"""
}

def build_architecture():
    print("\n🚀 Building VyaparSetu VS Code Environment (Tally Engine)...\n")
    for filepath, content in FILES.items():
        path = pathlib.Path(filepath)
        path.parent.mkdir(parents=True, exist_ok=True)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✅ Generated: {filepath}")
    print("\n🎉 Architecture successfully scaffolded!")

if __name__ == "__main__":
    build_architecture()