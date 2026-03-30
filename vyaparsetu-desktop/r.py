import os
import pathlib

FILES = {
    # ==========================================
    # 1. GLOBAL UI/UX (VS Code Dark Theme)
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
  /* Terminal/Editor Input Resets */
  input, textarea, select { @apply bg-[#3c3c3c] border border-transparent focus:border-vscode-accent outline-none text-vscode-text px-2 py-1 text-sm font-mono transition-colors; }
  table { @apply w-full text-left border-collapse font-mono text-sm; }
  th { @apply border-b border-vscode-border py-2 text-vscode-textDark font-normal; }
  td { @apply border-b border-vscode-border/50 py-2; }
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
""",

    "src-tauri/src/schema.sql": r"""
-- Core Tally Architecture
CREATE TABLE IF NOT EXISTS company (id TEXT PRIMARY KEY, name TEXT, gstin TEXT, fy_start TEXT);
CREATE TABLE IF NOT EXISTS ledger_groups (id TEXT PRIMARY KEY, name TEXT, nature TEXT); -- Assets, Liabilities, Income, Expenses
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
    // Seed default groups/ledgers if empty
    conn.execute("INSERT OR IGNORE INTO ledger_groups (id, name, nature) VALUES ('G1', 'Cash-in-Hand', 'Assets'), ('G2', 'Sales Accounts', 'Income')", [])?;
    conn.execute("INSERT OR IGNORE INTO ledgers (id, name, group_id, opening_bal, is_system) VALUES ('L1', 'Main Cash', 'G1', 0, 1), ('L2', 'Local Sales', 'G2', 0, 1)", [])?;
    Ok(conn)
}
""",

    "src-tauri/src/commands.rs": r"""
use serde::{Serialize, Deserialize};
use rusqlite::params;
use crate::db::init_db;

#[derive(Serialize)]
pub struct Ledger { pub id: String, pub name: String, pub balance: f64 }
#[derive(Serialize)]
pub struct Item { pub id: String, pub code: String, pub name: String, pub stock: f64, pub rate: f64 }

#[tauri::command]
pub fn exec_sql(query: String) -> Result<String, String> {
    let conn = init_db().map_err(|e| e.to_string())?;
    conn.execute(&query, []).map_err(|e| e.to_string())?;
    Ok("Executed".to_string())
}

#[tauri::command]
pub fn get_ledgers() -> Result<Vec<Ledger>, String> {
    let conn = init_db().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare("SELECT l.id, l.name, l.opening_bal + COALESCE(SUM(ve.debit) - SUM(ve.credit), 0) FROM ledgers l LEFT JOIN voucher_entries ve ON l.id = ve.ledger_id GROUP BY l.id").unwrap();
    let rows = stmt.query_map([], |row| Ok(Ledger { id: row.get(0)?, name: row.get(1)?, balance: row.get(2)? })).unwrap();
    Ok(rows.filter_map(Result::ok).collect())
}

#[tauri::command]
pub fn get_inventory() -> Result<Vec<Item>, String> {
    let conn = init_db().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare("SELECT id, item_code, name, stock, rate FROM inventory").unwrap();
    let rows = stmt.query_map([], |row| Ok(Item { id: row.get(0)?, code: row.get(1)?, name: row.get(2)?, stock: row.get(3)?, rate: row.get(4)? })).unwrap();
    Ok(rows.filter_map(Result::ok).collect())
}

// REAL DOUBLE ENTRY POS POSTING LOGIC
#[tauri::command]
pub fn post_pos_sale(total: f64, items: Vec<serde_json::Value>) -> Result<String, String> {
    let conn = init_db().map_err(|e| e.to_string())?;
    let v_id = format!("VCH-{}", chrono::Local::now().timestamp());
    
    // 1. Create Voucher
    conn.execute("INSERT INTO vouchers (id, v_type, date, total, narration) VALUES (?1, 'Sales', date('now'), ?2, 'POS Cash Sale')", params![v_id, total]).map_err(|e| e.to_string())?;
    
    // 2. Double Entry: Debit Cash (L1), Credit Sales (L2)
    conn.execute("INSERT INTO voucher_entries (id, voucher_id, ledger_id, debit, credit) VALUES (?1, ?2, 'L1', ?3, 0)", params![format!("{}-D", v_id), v_id, total]).map_err(|e| e.to_string())?;
    conn.execute("INSERT INTO voucher_entries (id, voucher_id, ledger_id, debit, credit) VALUES (?1, ?2, 'L2', 0, ?3)", params![format!("{}-C", v_id), v_id, total]).map_err(|e| e.to_string())?;
    
    // 3. Update Inventory Stock
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
        .invoke_handler(tauri::generate_handler![commands::exec_sql, commands::get_ledgers, commands::get_inventory, commands::post_pos_sale])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
""",

    # ==========================================
    # 3. REACT STATE & LAYOUT (VS Code Style)
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
import { Files, Search, Database, Settings, Play, X, Check, Box, Users, FileText, LayoutDashboard, Shield } from 'lucide-react';

// Import the 15 Modules (Simulated imports for script compactness, all mapped in render logic)
import Dashboard from './pages/Dashboard';
import POSBilling from './pages/POSBilling';
import Ledgers from './pages/Ledgers';
import Inventory from './pages/Inventory';
import Reports from './pages/Reports';

const ActivityBar = () => (
  <div className="w-12 h-full bg-vscode-activity flex flex-col items-center py-4 gap-6 shrink-0 border-r border-vscode-border">
    <Files size={24} className="text-vscode-text cursor-pointer" />
    <Search size={24} className="text-vscode-textDark hover:text-vscode-text cursor-pointer" />
    <Database size={24} className="text-vscode-textDark hover:text-vscode-text cursor-pointer" />
    <div className="mt-auto"><Settings size={24} className="text-vscode-textDark hover:text-vscode-text cursor-pointer" /></div>
  </div>
);

const Explorer = () => {
  const openFile = useAppStore(state => state.openFile);
  const activeTab = useAppStore(state => state.activeTab);
  
  const files = [
    { name: 'Welcome.md', icon: LayoutDashboard, color: 'text-vscode-keyword' },
    { name: 'POS_Terminal.rs', icon: Play, color: 'text-vscode-type' },
    { name: 'Chart_Of_Accounts.json', icon: Database, color: 'text-vscode-string' },
    { name: 'Inventory_Master.sql', icon: Box, color: 'text-yellow-500' },
    { name: 'Financial_Reports.csv', icon: FileText, color: 'text-green-500' },
    { name: 'Parties_Ledger.ts', icon: Users, color: 'text-vscode-keyword' },
    { name: 'Banking.go', icon: Database, color: 'text-vscode-accent' },
    { name: 'Voucher_Entry.rs', icon: FileText, color: 'text-vscode-type' },
    { name: 'GST_Computation.yml', icon: FileText, color: 'text-purple-400' },
    { name: 'User_Security.env', icon: Shield, color: 'text-red-400' },
    { name: 'Backup_Restore.sh', icon: Database, color: 'text-gray-400' },
    { name: 'Settings.json', icon: Settings, color: 'text-yellow-600' },
    { name: 'Daily_Ops.log', icon: FileText, color: 'text-gray-500' },
    { name: 'Smart_Insights.py', icon: LayoutDashboard, color: 'text-vscode-keyword' },
    { name: 'Company_Setup.ini', icon: Settings, color: 'text-blue-300' },
  ];

  return (
    <div className="w-60 h-full bg-vscode-sidebar border-r border-vscode-border flex flex-col shrink-0 select-none">
      <div className="px-4 py-3 text-[11px] font-bold tracking-widest text-vscode-textDark">EXPLORER</div>
      <div className="px-4 py-1 text-[11px] font-bold text-vscode-text flex items-center gap-1"><span className="rotate-90 text-vscode-textDark">›</span> VYAPARSETU_WORKSPACE</div>
      <div className="flex-1 overflow-y-auto custom-scrollbar mt-1">
        {files.map(f => (
          <div key={f.name} onClick={() => openFile(f.name)} className={`flex items-center gap-2 px-6 py-1 cursor-pointer text-[13px] ${activeTab === f.name ? 'bg-[#37373d] text-white' : 'text-vscode-text hover:bg-[#2a2d2e]'}`}>
            <f.icon size={14} className={f.color} /> {f.name}
          </div>
        ))}
      </div>
    </div>
  );
};

const TabBar = () => {
  const { openTabs, activeTab, openFile, closeFile } = useAppStore();
  return (
    <div className="flex h-9 bg-vscode-sidebar shrink-0 overflow-x-auto custom-scrollbar">
      {openTabs.map(tab => (
        <div key={tab} onClick={() => openFile(tab)} className={`flex items-center gap-2 px-3 py-2 cursor-pointer border-r border-vscode-border border-t border-t-transparent group ${activeTab === tab ? 'bg-vscode-bg text-vscode-accent border-t-vscode-accent' : 'bg-vscode-tabInactive text-vscode-textDark hover:bg-[#2b2b2b]'}`}>
          <span className="text-[13px] font-sans">{tab}</span>
          <X size={14} onClick={(e) => { e.stopPropagation(); closeFile(tab); }} className={`rounded hover:bg-vscode-border ${activeTab === tab ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
        </div>
      ))}
    </div>
  );
};

const StatusBar = () => {
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  useEffect(() => { setInterval(() => setTime(new Date().toLocaleTimeString()), 1000); }, []);
  return (
    <div className="h-6 bg-vscode-statusBg text-white flex items-center justify-between px-3 text-[11px] font-sans shrink-0">
      <div className="flex items-center gap-4"><div className="flex items-center gap-1"><Check size={12}/> Tauri IPC Ready</div><div>sqlite3: vyaparsetu_workspace.db</div></div>
      <div className="flex items-center gap-4"><div>FY: 24-25</div><div>UTF-8</div><div>Rust/React</div><div>{time}</div></div>
    </div>
  );
};

export default function App() {
  const activeTab = useAppStore(state => state.activeTab);
  
  // Render Engine
  const renderContent = () => {
    switch(activeTab) {
      case 'Welcome.md': return <Dashboard />;
      case 'POS_Terminal.rs': return <POSBilling />;
      case 'Chart_Of_Accounts.json': return <Ledgers />;
      case 'Inventory_Master.sql': return <Inventory />;
      case 'Financial_Reports.csv': return <Reports />;
      default: return <div className="p-10 font-mono text-vscode-textDark">// Module {activeTab} initializing...<br/>// Tally Engine mapping pending.</div>;
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-vscode-bg">
      <ActivityBar />
      <Explorer />
      <div className="flex-1 flex flex-col min-w-0">
        <TabBar />
        <main className="flex-1 overflow-y-auto custom-scrollbar relative p-2">
          {activeTab ? renderContent() : <div className="h-full flex items-center justify-center text-vscode-textDark font-mono text-xl">vyaparsetu_workspace</div>}
        </main>
      </div>
      <div className="absolute bottom-0 w-full"><StatusBar /></div>
    </div>
  );
}
""",

    # ==========================================
    # 4. CORE MODULE PAGES (React logic + SQL)
    # ==========================================
    "src/pages/Dashboard.jsx": r"""
import React from 'react';
import { useAppStore } from '../store/useAppStore';

export default function Dashboard() {
  const openFile = useAppStore(state => state.openFile);
  return (
    <div className="max-w-4xl p-8 font-sans">
      <h1 className="text-3xl font-normal text-vscode-text mb-2">VyaparSetu Workspace</h1>
      <p className="text-vscode-textDark mb-8 text-sm">TallyPrime Desktop Engine built on Rust + Tauri + VS Code UI.</p>
      
      <div className="grid grid-cols-2 gap-10">
        <div>
          <h2 className="text-lg text-vscode-text mb-4 font-semibold">Start</h2>
          <ul className="space-y-2 text-sm">
            <li><button onClick={() => openFile('POS_Terminal.rs')} className="text-vscode-accent hover:underline">New POS Sale (F8)</button></li>
            <li><button onClick={() => openFile('Chart_Of_Accounts.json')} className="text-vscode-accent hover:underline">Create Ledger (Ctrl+L)</button></li>
            <li><button onClick={() => openFile('Inventory_Master.sql')} className="text-vscode-accent hover:underline">Add Stock Item</button></li>
          </ul>
        </div>
        <div>
          <h2 className="text-lg text-vscode-text mb-4 font-semibold">Recent Reports</h2>
          <ul className="space-y-2 text-sm">
            <li className="flex gap-2"><span className="text-vscode-type">day_book</span><span className="text-vscode-textDark">src/reports</span></li>
            <li className="flex gap-2"><span className="text-vscode-type">profit_loss</span><span className="text-vscode-textDark">src/reports</span></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
""",

    "src/pages/POSBilling.jsx": r"""
import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';

export default function POSBilling() {
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('// Status: Ready (F8 to Checkout)');

  useEffect(() => {
    invoke('get_inventory').then(setItems).catch(e => setStatus(`// Error: ${e}`));
    
    const handleKey = (e) => {
      if (e.key === 'F8') handleCheckout();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [cart]); // Dependency on cart to ensure checkout gets latest data

  const addToCart = (item) => {
    const existing = cart.find(c => c.id === item.id);
    if(existing) setCart(cart.map(c => c.id === item.id ? {...c, qty: c.qty + 1} : c));
    else setCart([...cart, {...item, qty: 1}]);
  };

  const handleCheckout = async () => {
    if(cart.length === 0) return setStatus('// Error: Cart is empty');
    const total = cart.reduce((sum, item) => sum + (item.rate * item.qty), 0);
    try {
      setStatus('// Processing double-entry transaction...');
      const vchId = await invoke('post_pos_sale', { total, items: cart });
      setStatus(`// Success: Voucher [${vchId}] posted to DB. Cash debited, Sales credited.`);
      setCart([]);
    } catch (e) {
      setStatus(`// Error: ${e}`);
    }
  };

  const total = cart.reduce((sum, item) => sum + (item.rate * item.qty), 0);

  return (
    <div className="flex h-full gap-4 pb-10">
      <div className="flex-1 flex flex-col border border-vscode-border bg-[#1e1e1e]">
        <div className="bg-[#252526] px-4 py-2 text-xs font-mono text-vscode-keyword border-b border-vscode-border">pos_scanner.rs</div>
        <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
          <input type="text" placeholder="Scan Barcode or Search Item..." value={search} onChange={e => setSearch(e.target.value)} className="w-full mb-4" autoFocus />
          <table className="w-full">
            <thead><tr><th>Code</th><th>Item Name</th><th>Stock</th><th>Rate</th></tr></thead>
            <tbody>
              {items.filter(i => i.name.toLowerCase().includes(search.toLowerCase())).map(item => (
                <tr key={item.id} onClick={() => addToCart(item)} className="cursor-pointer hover:bg-[#2a2d2e]">
                  <td className="text-vscode-string">"{item.code}"</td>
                  <td className="text-vscode-text">{item.name}</td>
                  <td className="text-vscode-type">{item.stock}</td>
                  <td className="text-vscode-func">₹{item.rate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="w-[400px] flex flex-col border border-vscode-border bg-[#1e1e1e]">
        <div className="bg-[#252526] px-4 py-2 text-xs font-mono text-vscode-keyword border-b border-vscode-border">active_cart.json</div>
        <div className="p-4 flex-1 overflow-y-auto custom-scrollbar font-mono text-sm">
          <span className="text-vscode-keyword">const</span> <span className="text-vscode-func">cart</span> = [
          {cart.map((c, i) => (
            <div key={c.id} className="pl-4">
              {'{'} <span className="text-vscode-textDark">id:</span> <span className="text-vscode-string">"{c.id}"</span>, <span className="text-vscode-textDark">name:</span> <span className="text-vscode-string">"{c.name}"</span>, <span className="text-vscode-textDark">qty:</span> <span className="text-vscode-type">{c.qty}</span>, <span className="text-vscode-textDark">rate:</span> <span className="text-vscode-type">{c.rate}</span> {'}'}{i < cart.length - 1 ? ',' : ''}
            </div>
          ))}
          ];
        </div>
        <div className="p-4 border-t border-vscode-border bg-[#252526]">
          <div className="flex justify-between font-mono text-lg mb-4 text-vscode-text"><span>Total:</span><span className="text-vscode-func">₹{total.toFixed(2)}</span></div>
          <button onClick={handleCheckout} className="w-full bg-vscode-accent text-white font-sans py-2 rounded-sm hover:bg-blue-600 focus:outline-none">Post Sale (F8)</button>
          <div className="mt-2 text-xs font-mono text-vscode-textDark">{status}</div>
        </div>
      </div>
    </div>
  );
}
""",

    "src/pages/Ledgers.jsx": r"""
import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';

export default function Ledgers() {
  const [ledgers, setLedgers] = useState([]);
  const [form, setForm] = useState({ id: '', name: '', group: 'G3', bal: '' });
  const [log, setLog] = useState('// Output console ready.');

  const loadLedgers = () => invoke('get_ledgers').then(setLedgers).catch(e => setLog(`// Error: ${e}`));
  useEffect(() => { loadLedgers(); }, []);

  const handleCreate = async () => {
    try {
      const id = `L${Date.now()}`;
      await invoke('exec_sql', { query: `INSERT INTO ledgers (id, name, group_id, opening_bal, is_system) VALUES ('${id}', '${form.name}', '${form.group}', ${form.bal || 0}, 0)`});
      setLog(`// Created ledger: ${form.name} [${id}]`);
      loadLedgers();
      setForm({ id: '', name: '', group: 'G3', bal: '' });
    } catch (e) { setLog(`// Error: ${e}`); }
  };

  return (
    <div className="flex flex-col h-full gap-4 pb-10 font-mono text-sm">
      <div className="p-4 border border-vscode-border bg-[#1e1e1e]">
        <div className="text-vscode-keyword mb-4">// Create New Ledger</div>
        <div className="flex gap-4">
          <input type="text" placeholder="Ledger Name" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} className="flex-1" />
          <select value={form.group} onChange={e=>setForm({...form, group: e.target.value})} className="w-48">
            <option value="G3">Sundry Debtors</option>
            <option value="G4">Sundry Creditors</option>
            <option value="G5">Direct Expenses</option>
          </select>
          <input type="number" placeholder="Opening Bal" value={form.bal} onChange={e=>setForm({...form, bal: e.target.value})} className="w-32" />
          <button onClick={handleCreate} className="bg-vscode-accent px-4 py-1 text-white hover:bg-blue-600">execute()</button>
        </div>
      </div>
      <div className="flex-1 p-4 border border-vscode-border bg-[#1e1e1e] overflow-y-auto custom-scrollbar">
        <table>
          <thead><tr><th>id</th><th>name</th><th>net_balance</th></tr></thead>
          <tbody>
            {ledgers.map(l => (
              <tr key={l.id}>
                <td className="text-vscode-string">"{l.id}"</td>
                <td className="text-vscode-text">{l.name}</td>
                <td className="text-vscode-type">{l.balance.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
  const [log, setLog] = useState('// Inventory engine online.');

  const loadItems = () => invoke('get_inventory').then(setItems).catch(e => setLog(`// Error: ${e}`));
  useEffect(() => { loadItems(); }, []);

  const handleCreate = async () => {
    try {
      const id = `ITM${Date.now()}`;
      await invoke('exec_sql', { query: `INSERT INTO inventory (id, item_code, name, stock, rate, unit) VALUES ('${id}', '${form.code}', '${form.name}', ${form.stock || 0}, ${form.rate || 0}, 'PCS')`});
      setLog(`// Created stock item: ${form.name}`);
      loadItems();
      setForm({ code: '', name: '', stock: '', rate: '' });
    } catch (e) { setLog(`// Error: ${e}`); }
  };

  return (
    <div className="flex flex-col h-full gap-4 pb-10 font-mono text-sm">
      <div className="p-4 border border-vscode-border bg-[#1e1e1e]">
        <div className="text-vscode-keyword mb-4">// Insert Inventory Item</div>
        <div className="flex gap-4">
          <input type="text" placeholder="Barcode/Code" value={form.code} onChange={e=>setForm({...form, code: e.target.value})} className="w-32" />
          <input type="text" placeholder="Item Name" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} className="flex-1" />
          <input type="number" placeholder="Qty" value={form.stock} onChange={e=>setForm({...form, stock: e.target.value})} className="w-24" />
          <input type="number" placeholder="Rate" value={form.rate} onChange={e=>setForm({...form, rate: e.target.value})} className="w-24" />
          <button onClick={handleCreate} className="bg-vscode-accent px-4 py-1 text-white hover:bg-blue-600">execute()</button>
        </div>
      </div>
      <div className="flex-1 p-4 border border-vscode-border bg-[#1e1e1e] overflow-y-auto custom-scrollbar">
        <table>
          <thead><tr><th>item_code</th><th>name</th><th>closing_stock</th><th>rate</th></tr></thead>
          <tbody>
            {items.map(i => (
              <tr key={i.id}>
                <td className="text-vscode-string">"{i.code}"</td>
                <td className="text-vscode-text">{i.name}</td>
                <td className="text-vscode-type">{i.stock}</td>
                <td className="text-vscode-func">{i.rate}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
  const [data, setData] = useState(null);
  
  useEffect(() => {
    // Simulated fetch of complex join query for Day Book
    invoke('get_ledgers').then(res => setData(JSON.stringify(res, null, 2)));
  }, []);

  return (
    <div className="h-full flex flex-col pb-10 font-mono text-sm">
      <div className="p-2 border border-vscode-border bg-[#252526] text-vscode-keyword">SELECT * FROM financial_reports WHERE date = 'today';</div>
      <div className="flex-1 p-4 border border-t-0 border-vscode-border bg-[#1e1e1e] overflow-y-auto custom-scrollbar text-vscode-string whitespace-pre">
        {data || '// Compiling report data...'}
      </div>
    </div>
  );
}
"""
}

def build_architecture():
    print("\n🚀 Building VyaparSetu Code Editor Environment (Tally Engine)...\n")
    
    for filepath, content in FILES.items():
        path = pathlib.Path(filepath)
        path.parent.mkdir(parents=True, exist_ok=True)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✅ Generated: {filepath}")

    print("\n🎉 Architecture successfully scaffolded!")

if __name__ == "__main__":
    build_architecture()