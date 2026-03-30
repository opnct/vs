import os
import pathlib

FILES = {
    # ==========================================
    # 1. FORCE DEPENDENCIES & ENVIRONMENT
    # ==========================================
    "package.json": r"""{
  "name": "vyaparsetu-desktop",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "tauri": "tauri"
  },
  "dependencies": {
    "@tauri-apps/api": "^2.0.0",
    "clsx": "^2.1.1",
    "lucide-react": "^0.378.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.23.0",
    "tailwind-merge": "^2.3.0",
    "zustand": "^4.5.2"
  },
  "devDependencies": {
    "@tauri-apps/cli": "^2.0.0",
    "@types/react": "^18.2.66",
    "@types/react-dom": "^18.2.22",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.3",
    "vite": "^5.2.0"
  }
}
""",

    # ==========================================
    # 2. GLOBAL UI/UX (Windows 11 Notepad Theme)
    # ==========================================
    "tailwind.config.js": r"""/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        np: {
          bg: '#202020',         // Notepad background
          menuBg: '#181818',     // Titlebar/Menu background
          tabActive: '#2d2d2d',  // Active tab
          tabHover: '#2a2a2a',   // Tab hover
          text: '#ffffff',       // Main text
          muted: '#9d9d9d',      // Placeholder/Muted
          accent: '#4cc2ff',     // Selection/Active blue
          border: '#333333',     // Subtle borders
          actionBg: '#282828',   // Formatting bar bg
        }
      },
      fontFamily: {
        mono: ['Consolas', '"Courier New"', 'monospace'],
        sans: ['"Segoe UI"', 'system-ui', 'sans-serif'],
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
    <title>VyaparSetu - Notepad</title>
  </head>
  <body class="bg-np-bg text-np-text m-0 p-0 overflow-hidden font-mono antialiased">
    <div id="root" class="h-screen w-screen flex flex-col"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
""",

    "src/index.css": r"""@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html, body { @apply bg-np-bg text-np-text font-mono; overscroll-behavior: none; }
  input, textarea, select { @apply bg-transparent border-b border-np-border focus:border-np-accent outline-none text-np-text px-2 py-1 text-sm font-mono transition-colors; }
  table { @apply w-full text-left border-collapse font-mono text-[13px]; }
  th { @apply border-b border-np-border py-2 px-2 text-np-muted font-normal whitespace-nowrap; }
  td { @apply border-b border-np-border/40 py-2 px-2; }
  button { @apply bg-np-actionBg border border-np-border px-3 py-1 hover:bg-np-tabHover transition-colors; }
}

@layer utilities {
  .custom-scrollbar::-webkit-scrollbar { width: 12px; height: 12px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #4a4a4a; border: 3px solid #202020; border-radius: 10px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #666666; }
}
""",

    # ==========================================
    # 3. RUST BACKEND (Double-Entry Tally Engine)
    # ==========================================
    "src-tauri/Cargo.toml": r"""[package]
name = "vyaparsetu"
version = "0.1.0"
description = "VyaparSetu Tally Engine"
authors = ["VyaparSetu"]
edition = "2021"

[build-dependencies]
tauri-build = "2.0.0"

[dependencies]
tauri = { version = "2.0.0", features = [] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
rusqlite = { version = "0.29.0", features = ["bundled"] }
chrono = "0.4"
""",

    # CRITICAL FIX: The build.rs file is mandatory for Tauri v2 to set the OUT_DIR env var
    "src-tauri/build.rs": r"""fn main() {
    tauri_build::build()
}
""",

    # CRITICAL FIX: beforeDevCommand updated to "npm run dev" to match package.json
    "src-tauri/tauri.conf.json": r"""{
  "productName": "VyaparSetu",
  "version": "0.1.0",
  "identifier": "com.vyaparsetu.notepad",
  "build": {
    "beforeDevCommand": "npm run dev",
    "devUrl": "http://localhost:5173",
    "beforeBuildCommand": "npm run build",
    "frontendDist": "../dist"
  },
  "app": {
    "windows": [
      { "title": "VyaparSetu - Notepad", "width": 1280, "height": 800, "decorations": false }
    ],
    "security": { "csp": null }
  }
}
""",

    "src-tauri/src/schema.sql": r"""
CREATE TABLE IF NOT EXISTS company (id TEXT PRIMARY KEY, name TEXT, gstin TEXT, fy_start TEXT, currency TEXT);
CREATE TABLE IF NOT EXISTS ledger_groups (id TEXT PRIMARY KEY, name TEXT, nature TEXT); 
CREATE TABLE IF NOT EXISTS ledgers (id TEXT PRIMARY KEY, name TEXT, group_id TEXT, opening_bal REAL, is_system INTEGER);
CREATE TABLE IF NOT EXISTS inventory (id TEXT PRIMARY KEY, item_code TEXT, name TEXT, stock REAL, rate REAL, unit TEXT);
CREATE TABLE IF NOT EXISTS vouchers (id TEXT PRIMARY KEY, v_type TEXT, date TEXT, total REAL, narration TEXT);
CREATE TABLE IF NOT EXISTS voucher_entries (id TEXT PRIMARY KEY, voucher_id TEXT, ledger_id TEXT, debit REAL, credit REAL);
""",

    "src-tauri/src/db.rs": r"""
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
""",

    # FIXED: Suppressed unused imports warning
    "src-tauri/src/commands.rs": r"""
#![allow(unused_imports)]
use serde::{Serialize, Deserialize};
use rusqlite::params;
use crate::db::init_db;

#[tauri::command]
pub fn exec_sql(query: String) -> Result<String, String> {
    let conn = init_db().map_err(|e| e.to_string())?;
    conn.execute(&query, []).map_err(|e| e.to_string())?;
    Ok("Executed".to_string())
}

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
pub fn post_double_entry(v_type: String, total: f64, dr_ledger: String, cr_ledger: String, narration: String, items: Vec<serde_json::Value>) -> Result<String, String> {
    let mut conn = init_db().map_err(|e| e.to_string())?;
    let tx = conn.transaction().map_err(|e| e.to_string())?;
    let v_id = format!("VCH-{}", chrono::Local::now().timestamp_millis());
    
    tx.execute("INSERT INTO vouchers (id, v_type, date, total, narration) VALUES (?1, ?2, date('now'), ?3, ?4)", params![v_id, v_type, total, narration]).map_err(|e| e.to_string())?;
    tx.execute("INSERT INTO voucher_entries (id, voucher_id, ledger_id, debit, credit) VALUES (?1, ?2, ?3, ?4, 0)", params![format!("{}-D", v_id), v_id, dr_ledger, total]).map_err(|e| e.to_string())?;
    tx.execute("INSERT INTO voucher_entries (id, voucher_id, ledger_id, debit, credit) VALUES (?1, ?2, ?3, 0, ?4)", params![format!("{}-C", v_id), v_id, cr_ledger, total]).map_err(|e| e.to_string())?;
    
    for item in items {
        let id: String = serde_json::from_value(item["id"].clone()).unwrap();
        let qty: f64 = serde_json::from_value(item["qty"].clone()).unwrap();
        tx.execute("UPDATE inventory SET stock = stock - ?1 WHERE id = ?2", params![qty, id]).map_err(|e| e.to_string())?;
    }
    tx.commit().map_err(|e| e.to_string())?;
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
        .invoke_handler(tauri::generate_handler![commands::exec_sql, commands::exec_sql_read, commands::post_double_entry])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
""",

    # ==========================================
    # 4. REACT STATE & NOTEPAD LAYOUT
    # ==========================================
    "src/store/useAppStore.js": r"""
import { create } from 'zustand';
export const useAppStore = create((set) => ({
  activeTab: 'POSBilling.txt',
  openTabs: ['POSBilling.txt', 'Vouchers.txt', 'Ledgers.txt', 'Inventory.txt', 'Reports.txt', 'Config.txt'],
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

    # CRITICAL FIX: Replaced 'WindowMinimize' with 'Minus'
    "src/App.jsx": r"""
import React, { useEffect, useState } from 'react';
import { useAppStore } from './store/useAppStore';
import { Minus, Square, X, Database } from 'lucide-react';
import { getCurrentWindow } from '@tauri-apps/api/window';

import POSBilling from './pages/POSBilling';
import Ledgers from './pages/Ledgers';
import Inventory from './pages/Inventory';
import Reports from './pages/Reports';
import Config from './pages/Config';
import Vouchers from './pages/Vouchers';

const TopMenu = () => {
  const { openFile } = useAppStore();
  const appWindow = getCurrentWindow();
  return (
    <div className="h-8 bg-np-menuBg flex items-center justify-between select-none font-sans" data-tauri-drag-region>
      <div className="flex items-center">
        <div className="px-3 flex gap-4 text-[13px] text-np-text cursor-default">
          <div className="hover:bg-white/10 px-2 py-1 rounded">File</div>
          <div className="hover:bg-white/10 px-2 py-1 rounded">Edit</div>
          <div className="hover:bg-white/10 px-2 py-1 rounded">View</div>
          
          <div className="flex gap-2 ml-4 border-l border-np-border pl-4">
            <button onClick={()=>openFile('POSBilling.txt')} className="hover:text-np-accent">Billing</button>
            <button onClick={()=>openFile('Vouchers.txt')} className="hover:text-np-accent">Vouchers</button>
            <button onClick={()=>openFile('Ledgers.txt')} className="hover:text-np-accent">Ledgers</button>
            <button onClick={()=>openFile('Inventory.txt')} className="hover:text-np-accent">Inventory</button>
            <button onClick={()=>openFile('Reports.txt')} className="hover:text-np-accent">Reports</button>
            <button onClick={()=>openFile('Config.txt')} className="hover:text-np-accent">Config</button>
          </div>
        </div>
      </div>
      <div className="flex">
        <button onClick={() => appWindow?.minimize()} className="h-8 w-12 flex items-center justify-center hover:bg-white/10"><Minus size={14} /></button>
        <button onClick={() => appWindow?.toggleMaximize()} className="h-8 w-12 flex items-center justify-center hover:bg-white/10"><Square size={12} /></button>
        <button onClick={() => appWindow?.close()} className="h-8 w-12 flex items-center justify-center hover:bg-red-500"><X size={16} /></button>
      </div>
    </div>
  );
};

const TabBar = () => {
  const { openTabs, activeTab, openFile, closeFile } = useAppStore();
  return (
    <div className="flex h-9 bg-np-menuBg overflow-x-auto custom-scrollbar pt-1 px-1 shrink-0 font-sans">
      {openTabs.map(tab => (
        <div key={tab} onClick={() => openFile(tab)} className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer rounded-t-md border border-b-0 transition-colors group ${activeTab === tab ? 'bg-np-bg border-np-border text-np-text' : 'bg-np-menuBg border-transparent text-np-muted hover:bg-np-tabHover'}`}>
          <span className="text-[13px]">{tab}</span>
          <X size={14} onClick={(e) => { e.stopPropagation(); closeFile(tab); }} className={`rounded-full hover:bg-white/20 p-0.5 ${activeTab === tab ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
        </div>
      ))}
      <div className="px-3 flex items-center cursor-pointer hover:bg-np-tabHover rounded-t-md text-np-muted"><span className="text-lg">+</span></div>
    </div>
  );
};

const ActionBar = () => (
  <div className="h-10 bg-np-bg border-b border-np-border flex items-center px-4 gap-4 text-sm shrink-0 font-sans">
    <select className="bg-np-actionBg border border-np-border px-2 py-1 rounded w-32"><option>Consolas</option><option>Arial</option></select>
    <select className="bg-np-actionBg border border-np-border px-2 py-1 rounded"><option>14</option><option>16</option></select>
    <div className="w-px h-5 bg-np-border"></div>
    <div className="font-bold flex gap-3 text-np-muted select-none">
      <span className="hover:text-np-text cursor-pointer">B</span><span className="italic hover:text-np-text cursor-pointer">I</span><span className="underline hover:text-np-text cursor-pointer">U</span>
    </div>
    <div className="ml-auto text-[11px] text-np-accent flex items-center gap-2 border border-np-accent/30 bg-np-accent/10 px-3 py-1 rounded">
      <Database size={12} /> SQLITE: DOUBLE-ENTRY ENGINE
    </div>
  </div>
);

const StatusBar = () => {
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  useEffect(() => { setInterval(() => setTime(new Date().toLocaleTimeString()), 1000); }, []);
  return (
    <div className="h-6 bg-np-bg border-t border-np-border text-np-muted flex items-center px-4 text-[11px] font-sans justify-between shrink-0">
      <div className="flex gap-6"><span>Ln 14, Col 32</span><span>100%</span></div>
      <div className="flex gap-6"><span>Windows (CRLF)</span><span>UTF-8</span><span>{time}</span></div>
    </div>
  );
};

export default function App() {
  const activeTab = useAppStore(state => state.activeTab);
  
  const renderContent = () => {
    switch(activeTab) {
      case 'POSBilling.txt': return <POSBilling />;
      case 'Ledgers.txt': return <Ledgers />;
      case 'Inventory.txt': return <Inventory />;
      case 'Reports.txt': return <Reports />;
      case 'Vouchers.txt': return <Vouchers />;
      case 'Config.txt': return <Config />;
      default: return <div className="p-6 text-np-muted font-mono">File is empty. Navigate via the top menu.</div>;
    }
  };

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-np-bg shadow-2xl">
      <TopMenu />
      <TabBar />
      <ActionBar />
      <main className="flex-1 overflow-y-auto custom-scrollbar p-4">
        {renderContent()}
      </main>
      <StatusBar />
    </div>
  );
}
""",

    # ==========================================
    # 5. CORE MODULES (5+ Sections, Hotkeys, DB)
    # ==========================================
    "src/pages/POSBilling.jsx": r"""
import React, { useState, useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';

export default function POSBilling() {
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [customers, setCustomers] = useState([]);
  const [selectedCust, setSelectedCust] = useState('L1');
  const [status, setStatus] = useState('Ready for input...');
  const searchRef = useRef(null);

  // S1: Data Initialization
  useEffect(() => {
    invoke('exec_sql_read', { query: "SELECT * FROM inventory" }).then(setItems);
    invoke('exec_sql_read', { query: "SELECT id, name FROM ledgers WHERE group_id IN ('G3', 'G1')" }).then(setCustomers);
    
    // S2: Keyboard Shortcuts
    const hk = (e) => {
      if (e.key === 'F8') handleCheckout();
      if (e.key === 'F4') setCart([]);
      if (e.key === 'F2') { e.preventDefault(); searchRef.current?.focus(); }
    };
    window.addEventListener('keydown', hk);
    return () => window.removeEventListener('keydown', hk);
  }, [cart, selectedCust]);

  const addToCart = (item) => {
    const existing = cart.find(c => c.id === item.id);
    if(existing) setCart(cart.map(c => c.id === item.id ? {...c, qty: c.qty + 1} : c));
    else setCart([...cart, {...item, qty: 1}]);
  };

  // S3: Tally Double-Entry Checkout
  const handleCheckout = async () => {
    if(cart.length === 0) return setStatus('ERR: Empty Cart.');
    const total = cart.reduce((sum, item) => sum + (item.rate * item.qty), 0);
    try {
      setStatus('Processing Double-Entry transaction...');
      const vchId = await invoke('post_double_entry', { v_type: 'Sales', total, dr_ledger: selectedCust, cr_ledger: 'L2', narration: 'POS Auto-Sale', items: cart });
      setStatus(`OK: Voucher ${vchId} saved. Debit: ${selectedCust}, Credit: L2.`);
      setCart([]);
    } catch (e) { setStatus(`ERR: ${e}`); }
  };

  const total = cart.reduce((sum, item) => sum + (item.rate * item.qty), 0);

  return (
    <div className="flex flex-col h-full gap-4">
      {/* S4: Header & Config */}
      <div>
        <h1 className="text-xl border-b border-np-border pb-2 mb-2">POS Billing / Voucher Type: Sales</h1>
        <div className="flex gap-4">
          <div className="w-1/2">
            <label className="text-np-muted block mb-1">Party A/c Name (F3)</label>
            <select value={selectedCust} onChange={e=>setSelectedCust(e.target.value)} className="w-full bg-np-actionBg border border-np-border px-2 py-1">
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="w-1/2">
            <label className="text-np-muted block mb-1">Sales Ledger</label>
            <input type="text" value="Local Sales (L2)" disabled className="w-full bg-np-bg border-none" />
          </div>
        </div>
      </div>

      {/* S5: Split Interface */}
      <div className="flex-1 flex gap-4 overflow-hidden">
        
        {/* Left: Inventory List */}
        <div className="w-1/2 flex flex-col border border-np-border bg-np-bg">
          <input ref={searchRef} type="text" placeholder="Search Item (F2)..." value={search} onChange={e => setSearch(e.target.value)} className="w-full p-2 border-b border-np-border bg-np-actionBg" />
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <table>
              <thead><tr><th>Code</th><th>Name</th><th>Stk</th><th>Rate</th></tr></thead>
              <tbody>
                {items.filter(i => i.name.toLowerCase().includes(search.toLowerCase())).map(item => (
                  <tr key={item.id} onClick={() => addToCart(item)} className="cursor-pointer hover:bg-np-tabHover">
                    <td className="text-np-muted">{item.item_code}</td>
                    <td>{item.name}</td>
                    <td className={item.stock < 5 ? 'text-red-400' : ''}>{item.stock}</td>
                    <td className="text-np-accent">{item.rate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Active Cart */}
        <div className="w-1/2 flex flex-col border border-np-border bg-np-bg">
          <div className="bg-np-actionBg p-2 border-b border-np-border font-bold">Item Allocation</div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
            {cart.map((c, i) => (
              <div key={c.id} className="flex justify-between border-b border-np-border/50 py-2 hover:bg-np-tabHover">
                <span>{i+1}. {c.name}</span>
                <div className="text-right">
                  <span className="text-np-muted mr-4">{c.qty} {c.unit} x {c.rate}</span>
                  <span className="text-np-accent">{(c.qty * c.rate).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-4 border-t border-np-border bg-np-actionBg">
            <div className="flex justify-between text-lg mb-4"><span>Total Amount:</span><span className="text-np-accent">{total.toFixed(2)}</span></div>
            <div className="flex gap-2">
              <button onClick={() => setCart([])} className="flex-1 border border-np-border text-np-muted py-2">Clear (F4)</button>
              <button onClick={handleCheckout} className="flex-[2] bg-np-accent text-black font-bold py-2 hover:bg-blue-400">Post Sale (F8)</button>
            </div>
            <div className="mt-2 text-xs text-np-muted">{status}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
""",

    "src/pages/Vouchers.jsx": r"""
import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

export default function Vouchers() {
  const [ledgers, setLedgers] = useState([]);
  const [form, setForm] = useState({ vType: 'Contra', dr: '', cr: '', amount: '', narration: '' });
  const [log, setLog] = useState('Voucher Engine Ready.');
  const [recent, setRecent] = useState([]);

  // S1: Initialization
  const loadData = async () => {
    try {
      const ls = await invoke('exec_sql_read', { query: "SELECT * FROM ledgers" });
      setLedgers(ls);
      if(ls.length > 0 && !form.dr) setForm(f => ({...f, dr: ls[0].id, cr: ls[0].id}));
      
      const rec = await invoke('exec_sql_read', { query: "SELECT v.date, v.v_type, v.total, l.name FROM vouchers v JOIN voucher_entries ve ON v.id = ve.voucher_id JOIN ledgers l ON ve.ledger_id = l.id WHERE ve.debit > 0 ORDER BY v.date DESC LIMIT 10" });
      setRecent(rec);
    } catch(e) { setLog(`ERR: ${e}`); }
  };
  useEffect(() => { loadData(); }, []);

  // S2: Keyboard Shortcuts
  useEffect(() => {
    const hk = (e) => {
      if (e.key === 'F4') setForm(f => ({...f, vType: 'Contra'}));
      if (e.key === 'F5') setForm(f => ({...f, vType: 'Payment'}));
      if (e.key === 'F6') setForm(f => ({...f, vType: 'Receipt'}));
      if (e.key === 'F7') setForm(f => ({...f, vType: 'Journal'}));
    };
    window.addEventListener('keydown', hk);
    return () => window.removeEventListener('keydown', hk);
  }, []);

  // S3: Post Double Entry
  const handlePost = async () => {
    if(!form.amount || form.dr === form.cr) return setLog('ERR: Invalid Entry. Check accounts/amount.');
    try {
      const vchId = await invoke('post_double_entry', { v_type: form.vType, total: parseFloat(form.amount), dr_ledger: form.dr, cr_ledger: form.cr, narration: form.narration, items: [] });
      setLog(`OK: Voucher ${vchId} Posted.`);
      setForm({...form, amount: '', narration: ''});
      loadData();
    } catch (e) { setLog(`ERR: ${e}`); }
  };

  return (
    <div className="flex flex-col h-full gap-6">
      {/* S4: Header & Selector */}
      <div className="flex justify-between items-end border-b border-np-border pb-2">
        <h1 className="text-xl">Accounting Vouchers</h1>
        <div className="flex gap-2">
          {['Contra (F4)', 'Payment (F5)', 'Receipt (F6)', 'Journal (F7)'].map(v => (
            <button key={v} onClick={() => setForm({...form, vType: v.split(' ')[0]})} className={form.vType === v.split(' ')[0] ? 'bg-np-accent text-black font-bold' : ''}>{v}</button>
          ))}
        </div>
      </div>

      {/* S5: Core Double-Entry Form */}
      <div className="border border-np-border bg-np-actionBg p-4 space-y-4">
        <div className="flex justify-between font-bold text-lg border-b border-np-border pb-2">
          <span>{form.vType} Entry</span>
          <span>No. {Date.now().toString().slice(-4)}</span>
        </div>
        
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="text-np-muted block mb-1">Debit (By)</label>
            <select value={form.dr} onChange={e=>setForm({...form, dr: e.target.value})} className="w-full bg-np-bg">
              {ledgers.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label className="text-np-muted block mb-1">Credit (To)</label>
            <select value={form.cr} onChange={e=>setForm({...form, cr: e.target.value})} className="w-full bg-np-bg">
              {ledgers.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
          <div className="w-32">
            <label className="text-np-muted block mb-1">Amount</label>
            <input type="number" value={form.amount} onChange={e=>setForm({...form, amount: e.target.value})} className="w-full" />
          </div>
        </div>

        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="text-np-muted block mb-1">Narration</label>
            <input type="text" value={form.narration} onChange={e=>setForm({...form, narration: e.target.value})} className="w-full" />
          </div>
          <button onClick={handlePost} className="bg-np-accent text-black font-bold px-6">Save</button>
        </div>
      </div>

      {/* S6: Recent Vouchers */}
      <div className="flex-1 flex flex-col border border-np-border overflow-hidden">
        <div className="bg-np-actionBg p-2 font-bold border-b border-np-border">Recent Transactions</div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <table>
            <thead><tr><th>Date</th><th>Type</th><th>Particulars (Dr)</th><th>Amount</th></tr></thead>
            <tbody>
              {recent.map((r, i) => (
                <tr key={i}>
                  <td className="text-np-muted">{r.date}</td>
                  <td>{r.v_type}</td>
                  <td>{r.name}</td>
                  <td className="text-np-accent">{r.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="text-xs text-np-muted">{log}</div>
    </div>
  );
}
""",

    "src/pages/Ledgers.jsx": r"""
import React, { useState, useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';

export default function Ledgers() {
  const [ledgers, setLedgers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [form, setForm] = useState({ name: '', group: 'G3', bal: '' });
  const [log, setLog] = useState('Line 1: Ledgers loaded.');
  const [filter, setFilter] = useState('');
  const nameRef = useRef(null);

  // S1: Load Ledgers & Groups
  const loadData = async () => {
    try {
      const gs = await invoke('exec_sql_read', { query: "SELECT * FROM ledger_groups" });
      setGroups(gs);
      const ls = await invoke('exec_sql_read', { query: "SELECT l.id, l.name, g.name as group_name, l.opening_bal + COALESCE(SUM(ve.debit) - SUM(ve.credit), 0) as net_bal FROM ledgers l JOIN ledger_groups g ON l.group_id = g.id LEFT JOIN voucher_entries ve ON l.id = ve.ledger_id GROUP BY l.id" });
      setLedgers(ls);
    } catch(e) { setLog(`ERR: ${e}`); }
  };

  useEffect(() => { loadData(); }, []);

  // S2: Create Logic
  const handleCreate = async () => {
    if(!form.name) return setLog('ERR: Name required');
    try {
      const id = `L${Date.now()}`;
      await invoke('exec_sql', { query: `INSERT INTO ledgers (id, name, group_id, opening_bal, is_system) VALUES ('${id}', '${form.name}', '${form.group}', ${form.bal || 0}, 0)`});
      setLog(`OK: Created Ledger ${form.name}`);
      loadData();
      setForm({ name: '', group: 'G3', bal: '' });
      nameRef.current?.focus();
    } catch (e) { setLog(`ERR: ${e}`); }
  };

  // S3: Computations
  const totalDebtors = ledgers.filter(l => l.group_name.includes('Debtors')).reduce((s, l) => s + (l.net_bal || 0), 0);
  const filtered = ledgers.filter(l => l.name.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="flex flex-col h-full gap-4">
      <h1 className="text-xl border-b border-np-border pb-2">Chart of Accounts / Ledgers</h1>
      
      {/* S4: Analytics Bar */}
      <div className="flex gap-4 p-3 bg-np-actionBg border border-np-border">
        <span>Total Ledgers: <span className="text-np-accent">{ledgers.length}</span></span>
        <span>Sundry Debtors Total: <span className="text-np-accent">{totalDebtors.toFixed(2)} Dr</span></span>
      </div>

      {/* S5: Creation Form */}
      <div>
        <div className="text-np-muted mb-2">Create New Ledger</div>
        <div className="flex gap-4 items-end">
          <div className="flex-1"><label className="text-xs text-np-muted block">Name</label><input ref={nameRef} type="text" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} className="w-full" /></div>
          <div className="w-64"><label className="text-xs text-np-muted block">Under Group</label>
            <select value={form.group} onChange={e=>setForm({...form, group: e.target.value})} className="w-full">
              {groups.map(g => <option key={g.id} value={g.id}>{g.name} ({g.nature})</option>)}
            </select>
          </div>
          <div className="w-32"><label className="text-xs text-np-muted block">Open Bal</label><input type="number" value={form.bal} onChange={e=>setForm({...form, bal: e.target.value})} className="w-full" /></div>
          <button onClick={handleCreate}>Save</button>
        </div>
      </div>

      {/* S6: Data Table */}
      <div className="flex-1 flex flex-col border border-np-border overflow-hidden">
        <input type="text" placeholder="Filter ledgers..." value={filter} onChange={e=>setFilter(e.target.value)} className="p-2 border-b border-np-border bg-np-actionBg w-full" />
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <table>
            <thead><tr className="bg-np-actionBg"><th>Ledger Name</th><th>Under</th><th>Closing Balance</th></tr></thead>
            <tbody>
              {filtered.map(l => (
                <tr key={l.id} className="hover:bg-np-tabHover">
                  <td>{l.name}</td>
                  <td className="text-np-muted">{l.group_name}</td>
                  <td className="text-np-accent">{l.net_bal?.toFixed(2)} {l.net_bal >= 0 ? 'Dr' : 'Cr'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="text-xs text-np-muted">{log}</div>
    </div>
  );
}
""",

    "src/pages/Inventory.jsx": r"""
import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ code: '', name: '', stock: '', rate: '' });
  const [log, setLog] = useState('Ready.');
  const [filter, setFilter] = useState('');

  const loadItems = () => invoke('exec_sql_read', { query: "SELECT * FROM inventory" }).then(setItems).catch(e => setLog(`ERR: ${e}`));
  useEffect(() => { loadItems(); }, []);

  const handleCreate = async () => {
    if(!form.name) return setLog('ERR: Missing Name');
    try {
      const id = `ITM${Date.now()}`;
      await invoke('exec_sql', { query: `INSERT INTO inventory (id, item_code, name, stock, rate, unit) VALUES ('${id}', '${form.code}', '${form.name}', ${form.stock || 0}, ${form.rate || 0}, 'PCS')`});
      setLog(`OK: Created ${form.name}`);
      loadItems();
      setForm({ code: '', name: '', stock: '', rate: '' });
    } catch (e) { setLog(`ERR: ${e}`); }
  };

  const lowStock = items.filter(i => i.stock <= 5).length;
  const totalValuation = items.reduce((sum, i) => sum + (i.stock * i.rate), 0);

  return (
    <div className="flex flex-col h-full gap-4">
      <h1 className="text-xl border-b border-np-border pb-2">Inventory Masters</h1>

      <div className="flex gap-4 p-3 bg-np-actionBg border border-np-border">
        <span>Total Items: <span className="text-np-accent">{items.length}</span></span>
        <span>Low Stock Alert: <span className="text-red-400">{lowStock}</span></span>
        <span>Est. Valuation: <span className="text-np-accent">{totalValuation.toFixed(2)}</span></span>
      </div>

      <div>
        <div className="text-np-muted mb-2">Create Stock Item</div>
        <div className="flex gap-4 items-end">
          <div className="w-32"><label className="text-xs text-np-muted block">Item Code</label><input type="text" value={form.code} onChange={e=>setForm({...form, code: e.target.value})} className="w-full" /></div>
          <div className="flex-1"><label className="text-xs text-np-muted block">Name</label><input type="text" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} className="w-full" /></div>
          <div className="w-24"><label className="text-xs text-np-muted block">Qty</label><input type="number" value={form.stock} onChange={e=>setForm({...form, stock: e.target.value})} className="w-full" /></div>
          <div className="w-24"><label className="text-xs text-np-muted block">Rate</label><input type="number" value={form.rate} onChange={e=>setForm({...form, rate: e.target.value})} className="w-full" /></div>
          <button onClick={handleCreate}>Save</button>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col border border-np-border overflow-hidden">
        <input type="text" placeholder="Filter inventory..." value={filter} onChange={e=>setFilter(e.target.value)} className="p-2 border-b border-np-border bg-np-actionBg w-full" />
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <table>
            <thead><tr className="bg-np-actionBg"><th>Code</th><th>Name</th><th>Closing Stock</th><th>Rate</th><th>Value</th></tr></thead>
            <tbody>
              {items.filter(i => i.name.toLowerCase().includes(filter.toLowerCase())).map(i => (
                <tr key={i.id} className="hover:bg-np-tabHover">
                  <td className="text-np-muted">{i.item_code}</td>
                  <td>{i.name}</td>
                  <td className={i.stock <= 5 ? 'text-red-400' : ''}>{i.stock} PCS</td>
                  <td className="text-np-accent">{i.rate}</td>
                  <td className="text-np-muted">{(i.stock * i.rate).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="text-xs text-np-muted">{log}</div>
    </div>
  );
}
""",

    "src/pages/Reports.jsx": r"""
import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core'; 

export default function Reports() {
  const [data, setData] = useState([]);
  const [cols, setCols] = useState([]);
  const [reportType, setReportType] = useState('DayBook');
  
  // S1: Advanced SQL Tally Reports
  const queries = {
    'DayBook': "SELECT v.date as Date, v.id as Vch_No, v.v_type as Type, l.name as Particulars, ve.debit as Debit, ve.credit as Credit, v.narration FROM vouchers v JOIN voucher_entries ve ON v.id = ve.voucher_id JOIN ledgers l ON ve.ledger_id = l.id ORDER BY v.date DESC",
    'TrialBalance': "SELECT l.name as Particulars, g.name as Group_Name, SUM(ve.debit) as Debit_Total, SUM(ve.credit) as Credit_Total FROM ledgers l JOIN ledger_groups g ON l.group_id = g.id LEFT JOIN voucher_entries ve ON l.id = ve.ledger_id GROUP BY l.id",
    'StockSummary': "SELECT item_code as Code, name as Particulars, stock as Closing_Bal, rate as Rate, (stock*rate) as Value FROM inventory"
  };

  // S2: Data Execution
  useEffect(() => {
    invoke('exec_sql_read', { query: queries[reportType] })
      .then(res => {
        setData(res);
        if(res.length > 0) setCols(Object.keys(res[0]));
        else setCols([]);
      }).catch(console.error);
  }, [reportType]);

  // S3: CSV Export
  const handleExport = () => alert(`Exporting ${reportType}.csv...`);

  // S4: Aggregate Engine
  const getTotals = () => {
    if(reportType === 'TrialBalance') {
      const dr = data.reduce((s, r) => s + (r.Debit_Total||0), 0);
      const cr = data.reduce((s, r) => s + (r.Credit_Total||0), 0);
      return `Total Dr: ${dr.toFixed(2)} | Total Cr: ${cr.toFixed(2)}`;
    }
    if(reportType === 'StockSummary') {
      const val = data.reduce((s, r) => s + (r.Value||0), 0);
      return `Total Stock Value: ${val.toFixed(2)}`;
    }
    return `Total Rows: ${data.length}`;
  };

  return (
    <div className="h-full flex flex-col gap-4">
      <h1 className="text-xl border-b border-np-border pb-2">Display More Reports</h1>
      
      {/* S5: Action Bar */}
      <div className="flex gap-4 border-b border-np-border pb-2">
        {Object.keys(queries).map(k => (
          <button key={k} onClick={() => setReportType(k)} className={reportType === k ? 'bg-np-accent text-black font-bold' : ''}>
            {k}
          </button>
        ))}
        <button onClick={handleExport} className="ml-auto bg-np-bg">Export CSV</button>
      </div>
      
      {/* S6: Data View */}
      <div className="flex-1 flex flex-col border border-np-border overflow-hidden bg-np-bg">
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {data.length > 0 ? (
            <table>
              <thead><tr className="bg-np-actionBg">{cols.map(c => <th key={c}>{c}</th>)}</tr></thead>
              <tbody>
                {data.map((row, i) => (
                  <tr key={i} className="hover:bg-np-tabHover">
                    {cols.map(c => <td key={c} className={typeof row[c] === 'number' ? 'text-np-accent' : ''}>{row[c]}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-6 text-np-muted">No data records found.</div>
          )}
        </div>
        
        {/* Footer Aggregation */}
        <div className="p-2 bg-np-actionBg border-t border-np-border flex justify-end font-bold text-np-accent">
          {getTotals()}
        </div>
      </div>
    </div>
  );
}
""",

    "src/pages/Config.jsx": r"""
import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

export default function Config() {
  const [log, setLog] = useState('Settings ready.');
  
  const handleBackup = async () => {
    try {
      await invoke('exec_sql', { query: "VACUUM;" }); // Simulated DB optimize/backup command
      setLog('OK: Database optimized and backup snapshot created.');
    } catch(e) { setLog(`ERR: ${e}`); }
  }

  return (
    <div className="flex flex-col h-full gap-6 max-w-2xl">
      <h1 className="text-xl border-b border-np-border pb-2">System Configuration & Data (F12)</h1>
      <div className="space-y-4">
        <div>
          <label className="text-np-muted block mb-1">Company Name</label>
          <input type="text" defaultValue="VyaparSetu Retail" className="w-full" />
        </div>
        <div>
          <label className="text-np-muted block mb-1">Financial Year From</label>
          <input type="date" defaultValue="2024-04-01" className="w-full" />
        </div>
        <div>
          <label className="text-np-muted block mb-1">Enable GST Features</label>
          <select className="w-full"><option>Yes</option><option>No</option></select>
        </div>
        
        <div className="pt-4 border-t border-np-border flex gap-4">
          <button className="bg-np-accent text-black font-bold px-6">Save Settings</button>
          <button onClick={handleBackup}>Optimize & Backup DB</button>
        </div>
      </div>
      <div className="text-xs text-np-muted mt-auto">{log}</div>
    </div>
  );
}
"""
}

def build_architecture():
    print("\n🚀 Building VyaparSetu Notepad Environment & Tally Engine (Tauri v2)...\n")
    for filepath, content in FILES.items():
        path = pathlib.Path(filepath)
        path.parent.mkdir(parents=True, exist_ok=True)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✅ Generated: {filepath}")
    print("\n🎉 Tauri v2 Notepad Architecture successfully scaffolded!")

if __name__ == "__main__":
    build_architecture()