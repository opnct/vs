import os
import pathlib

# =====================================================================
# VYAPARSETU: TALLYPRIME ENGINE x NOTION UI ARCHITECTURE BUILDER
# =====================================================================

FILES = {
    # ---------------------------------------------------------
    # 1. GLOBAL CONFIGURATION & STYLES (Minimalist UI Reset)
    # ---------------------------------------------------------
    "tailwind.config.js": r"""/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          white: '#FFFFFF',      // Main content background
          sidebar: '#F9F9F9',    // Off-White/Sidebar Gray
          text: '#111111',       // Charcoal Text for headings/body
          muted: '#9B9A97',      // Muted Gray Text for secondary labels
          accent: '#0A85D1',     // Accent Blue for primary buttons/links
          border: '#EAEAEA',     // Subtle border grays for dividers
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
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
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <title>VyaparSetu</title>
  </head>
  <body class="bg-brand-white text-brand-text m-0 p-0 overflow-hidden font-sans antialiased">
    <div id="root" class="h-screen w-screen flex flex-col"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
""",

    "src/index.css": r"""@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html, body {
    @apply bg-brand-white text-brand-text font-sans antialiased;
    overscroll-behavior: none; 
  }
}

@layer utilities {
  .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-brand-border rounded-full transition-colors; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { @apply bg-brand-muted; }
  .custom-scrollbar { scrollbar-width: thin; scrollbar-color: #EAEAEA transparent; }
}
""",

    # ---------------------------------------------------------
    # 2. RUST/TAURI BACKEND (TallyPrime Engine)
    # ---------------------------------------------------------
    "src-tauri/src/schema.sql": r"""
CREATE TABLE IF NOT EXISTS company (id TEXT PRIMARY KEY, name TEXT, gstin TEXT, fy_start TEXT, currency TEXT);
CREATE TABLE IF NOT EXISTS ledgers (id TEXT PRIMARY KEY, name TEXT, group_name TEXT, opening_bal REAL, type TEXT);
CREATE TABLE IF NOT EXISTS vouchers (id TEXT PRIMARY KEY, v_type TEXT, date TEXT, total REAL, narration TEXT);
CREATE TABLE IF NOT EXISTS inventory (id TEXT PRIMARY KEY, name TEXT, stock REAL, price REAL, unit TEXT);
CREATE TABLE IF NOT EXISTS transactions (id TEXT PRIMARY KEY, voucher_id TEXT, ledger_id TEXT, debit REAL, credit REAL);
""",

    "src-tauri/src/db.rs": r"""
use rusqlite::{Connection, Result};

pub fn init_db() -> Result<Connection> {
    let db_path = "vyaparsetu_core.db";
    let conn = Connection::open(db_path)?;
    let schema = include_str!("schema.sql");
    conn.execute_batch(schema)?;
    Ok(conn)
}
""",

    "src-tauri/src/commands.rs": r"""
use serde::{Serialize, Deserialize};
use rusqlite::params;
use crate::db::init_db;

#[derive(Serialize, Deserialize)]
pub struct Ledger { pub id: String, pub name: String, pub group_name: String, pub balance: f64 }

#[tauri::command]
pub fn create_ledger(id: String, name: String, group_name: String, balance: f64) -> Result<String, String> {
    let conn = init_db().map_err(|e| e.to_string())?;
    conn.execute("INSERT INTO ledgers (id, name, group_name, opening_bal, type) VALUES (?1, ?2, ?3, ?4, 'AC')", params![id, name, group_name, balance]).map_err(|e| e.to_string())?;
    Ok("Success".to_string())
}

#[tauri::command]
pub fn get_ledgers() -> Result<Vec<Ledger>, String> {
    let conn = init_db().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare("SELECT id, name, group_name, opening_bal FROM ledgers").map_err(|e| e.to_string())?;
    let rows = stmt.query_map([], |row| Ok(Ledger { id: row.get(0)?, name: row.get(1)?, group_name: row.get(2)?, balance: row.get(3)? })).map_err(|e| e.to_string())?;
    let mut ledgers = Vec::new();
    for row in rows { ledgers.push(row.map_err(|e| e.to_string())?); }
    Ok(ledgers)
}
""",

    "src-tauri/src/main.rs": r"""
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
mod db;
mod commands;

fn main() {
    tauri::Builder::default()
        .setup(|_app| { db::init_db().expect("DB Init Failed"); Ok(()) })
        .invoke_handler(tauri::generate_handler![commands::create_ledger, commands::get_ledgers])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
""",

    # ---------------------------------------------------------
    # 3. GLOBAL STATE (Zustand)
    # ---------------------------------------------------------
    "src/store/useAppStore.js": r"""
import { create } from 'zustand';
export const useAppStore = create((set) => ({
  companyName: "Default Kirana Store",
  fyStart: "2025-04-01",
  currency: "INR",
  setCompanyData: (data) => set({ ...data }),
}));
""",

    # ---------------------------------------------------------
    # 4. REUSABLE MINIMALIST UI COMPONENTS
    # ---------------------------------------------------------
    "src/components/ui/NotionButton.jsx": r"""
import React from 'react';
export default function NotionButton({ children, onClick, variant = 'primary', className = '' }) {
  const base = "px-4 py-1.5 text-sm font-medium rounded-md transition-colors select-none";
  const styles = variant === 'primary' 
    ? "bg-brand-accent text-white hover:bg-blue-600" 
    : "bg-transparent text-brand-text border border-brand-border hover:bg-brand-sidebar";
  return <button onClick={onClick} className={`${base} ${styles} ${className}`}>{children}</button>;
}
""",

    "src/components/ui/NotionInput.jsx": r"""
import React from 'react';
export default function NotionInput({ placeholder, value, onChange, type = "text" }) {
  return <input type={type} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} className="w-full bg-brand-sidebar border border-transparent focus:border-brand-border focus:bg-white outline-none rounded-md px-3 py-2 text-sm text-brand-text transition-colors placeholder-brand-muted" />;
}
""",

    "src/components/ui/PageHeader.jsx": r"""
import React from 'react';
export default function PageHeader({ title, description }) {
  return (
    <div className="mb-10 max-w-3xl">
      <h1 className="text-4xl font-bold text-brand-text tracking-tight mb-4">{title}</h1>
      {description && <p className="text-brand-text text-base leading-relaxed">{description}</p>}
      <div className="w-full h-px bg-brand-border mt-8"></div>
    </div>
  );
}
""",

    "src/components/ui/ActionBlock.jsx": r"""
import React from 'react';
import { Link } from 'react-router-dom';
export default function ActionBlock({ title, icon: Icon, to, color = "text-brand-text" }) {
  return (
    <Link to={to} className="flex items-center gap-3 p-2 hover:bg-brand-sidebar rounded-md transition-colors group w-full">
      <div className={`shrink-0 ${color}`}><Icon size={18} /></div>
      <span className="text-brand-text font-medium text-sm group-hover:underline decoration-brand-border underline-offset-4">{title}</span>
    </Link>
  );
}
""",

    # ---------------------------------------------------------
    # 5. LAYOUT & NAVIGATION
    # ---------------------------------------------------------
    "src/components/Header.jsx": r"""
import React from 'react';
import { Search } from 'lucide-react';
import NotionButton from './ui/NotionButton';
export default function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-3 bg-brand-white border-b border-brand-border shrink-0 select-none">
      <div className="flex items-center gap-2"><div className="w-6 h-6 bg-brand-text rounded-sm rotate-45"></div><h1 className="text-lg font-bold text-brand-text tracking-tight ml-2">VyaparSetu</h1></div>
      <div className="flex-1 max-w-xl mx-8 relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
        <input type="text" placeholder="Search" className="w-full bg-brand-sidebar border border-transparent focus:border-brand-border focus:bg-white outline-none rounded-md py-1.5 pl-9 pr-10 text-sm text-brand-text transition-colors" />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1"><kbd className="bg-white border border-brand-border rounded px-1.5 text-[10px] text-brand-muted font-mono">Ctrl</kbd><kbd className="bg-white border border-brand-border rounded px-1.5 text-[10px] text-brand-muted font-mono">K</kbd></div>
      </div>
      <div className="flex items-center gap-3"><NotionButton variant="secondary">Sign up</NotionButton><NotionButton variant="primary">Create voucher</NotionButton></div>
    </header>
  );
}
""",

    "src/components/Sidebar.jsx": r"""
import React from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
export default function Sidebar() {
  const sections = [
    { title: "HELP CENTER", items: [{ label: "Get started", path: "/" }, { label: "Company", path: "/company" }, { label: "Ledgers", path: "/ledgers" }, { label: "Vouchers", path: "/vouchers" }, { label: "Inventory", path: "/inventory" }] },
    { title: "REPORTS & OPS", items: [{ label: "POS Billing", path: "/pos" }, { label: "Banking", path: "/banking" }, { label: "GST Compliance", path: "/gst" }, { label: "Reports", path: "/reports" }] },
    { title: "SYSTEM", items: [{ label: "Settings", path: "/settings" }, { label: "Backup & Restore", path: "/backup" }, { label: "Staff", path: "/staff" }] }
  ];
  return (
    <aside className="w-[260px] h-full bg-brand-sidebar border-r border-brand-border overflow-y-auto custom-scrollbar flex flex-col pt-6 pb-10 select-none">
      {sections.map((sec, i) => (
        <div key={i} className="mb-8">
          <h4 className="px-6 text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-2">{sec.title}</h4>
          <div className="flex flex-col">
            {sec.items.map(item => (
              <NavLink key={item.path} to={item.path} className={({isActive}) => `flex items-center gap-2 px-6 py-1.5 text-sm transition-colors ${isActive ? 'text-brand-text font-bold bg-brand-border/30' : 'text-brand-text hover:bg-brand-border/30'}`}>
                <ChevronRight size={14} className="text-brand-muted" /> {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      ))}
    </aside>
  );
}
""",

    "src/App.jsx": r"""
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Ledgers from './pages/Ledgers';
import Vouchers from './pages/Vouchers';
import POSBilling from './pages/POSBilling';

// Minimal Stub for other modules to prevent crashes
const Stub = ({title}) => <div className="p-12"><h1 className="text-2xl font-bold">{title}</h1><p className="text-brand-muted">Module initializing...</p></div>;

export default function App() {
  return (
    <Router>
      <div className="flex flex-col h-screen w-full bg-brand-white text-brand-text font-sans overflow-hidden">
        <Header />
        <div className="flex-1 flex overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto custom-scrollbar relative px-16 py-12">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/ledgers" element={<Ledgers />} />
              <Route path="/vouchers" element={<Vouchers />} />
              <Route path="/pos" element={<POSBilling />} />
              <Route path="/company" element={<Stub title="Company Setup" />} />
              <Route path="/inventory" element={<Stub title="Inventory Engine" />} />
              <Route path="/banking" element={<Stub title="Banking & Cash" />} />
              <Route path="/gst" element={<Stub title="GST Compliance" />} />
              <Route path="/reports" element={<Stub title="Accounting Reports" />} />
              <Route path="/settings" element={<Stub title="Settings & Format" />} />
              <Route path="/backup" element={<Stub title="Backup & Data Flow" />} />
              <Route path="/staff" element={<Stub title="Staff & Security" />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}
""",

    # ---------------------------------------------------------
    # 6. CORE MODULES (React Pages)
    # ---------------------------------------------------------
    "src/pages/Dashboard.jsx": r"""
import React from 'react';
import PageHeader from '../components/ui/PageHeader';
import ActionBlock from '../components/ui/ActionBlock';
import { Rocket, Keyboard, BookTemplate, PartyPopper, Tag, Palette, LayoutTemplate, XCircle, Columns, Activity } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="max-w-4xl animate-in fade-in duration-300">
      <PageHeader 
        title="Get started" 
        description={<span>VyaparSetu is a new type of retail POS and ERP that <strong>works like a doc</strong>. It makes Tally-level accounting easy, fast, and offers tons of powerful features out of the box. Just navigate the sidebar or use shortcuts to get started!</span>}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-8">
        <div>
          <h3 className="text-lg font-bold text-brand-text mb-4">Start here</h3>
          <div className="space-y-1">
            <ActionBlock title="Create a sales voucher" icon={Rocket} color="text-pink-500" to="/vouchers" />
            <ActionBlock title="Keyboard shortcuts (Tally style)" icon={Keyboard} color="text-pink-600" to="/settings" />
            <ActionBlock title="How to use and create ledgers" icon={BookTemplate} color="text-pink-700" to="/ledgers" />
            <ActionBlock title="Create Thank You POS invoices" icon={PartyPopper} color="text-pink-500" to="/pos" />
            <ActionBlock title="How to name stock items" icon={Tag} color="text-pink-600" to="/inventory" />
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-bold text-brand-text mb-4">Make it your own</h3>
          <div className="space-y-1">
            <ActionBlock title="Customize your invoice layout" icon={Palette} color="text-purple-500" to="/settings" />
            <ActionBlock title="Create a multi-godown setup" icon={LayoutTemplate} color="text-purple-600" to="/inventory" />
            <ActionBlock title="Configure GST parameters" icon={XCircle} color="text-purple-700" to="/gst" />
            <ActionBlock title="Column layout (Day Book)" icon={Columns} color="text-purple-500" to="/reports" />
            <ActionBlock title="Progress bar (Sales Goal)" icon={Activity} color="text-purple-600" to="/reports" />
          </div>
        </div>
      </div>
    </div>
  );
}
""",

    "src/pages/Ledgers.jsx": r"""
import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import PageHeader from '../components/ui/PageHeader';
import NotionInput from '../components/ui/NotionInput';
import NotionButton from '../components/ui/NotionButton';

export default function Ledgers() {
  const [ledgers, setLedgers] = useState([]);
  const [form, setForm] = useState({ name: '', group: 'Sundry Debtors', bal: '' });

  const fetchLedgers = async () => {
    try { const data = await invoke('get_ledgers'); setLedgers(data); } catch (e) { console.error(e); }
  };
  
  useEffect(() => { fetchLedgers(); }, []);

  const handleCreate = async () => {
    if(!form.name) return;
    try {
      await invoke('create_ledger', { id: Date.now().toString(), name: form.name, groupName: form.group, balance: parseFloat(form.bal) || 0 });
      setForm({ name: '', group: 'Sundry Debtors', bal: '' });
      fetchLedgers();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="max-w-4xl animate-in fade-in duration-300">
      <PageHeader title="Chart of Accounts" description="Manage your double-entry accounting ledgers. Create customer accounts, supplier accounts, and expense heads." />
      
      <div className="flex gap-4 mb-8 items-end">
        <div className="flex-1"><label className="text-xs font-bold text-brand-muted mb-1 block">Ledger Name</label><NotionInput value={form.name} onChange={v => setForm({...form, name: v})} placeholder="e.g. Ramesh Traders" /></div>
        <div className="w-48"><label className="text-xs font-bold text-brand-muted mb-1 block">Group</label>
          <select value={form.group} onChange={e => setForm({...form, group: e.target.value})} className="w-full bg-brand-sidebar border border-transparent outline-none rounded-md px-3 py-2 text-sm">
            <option>Sundry Debtors</option><option>Sundry Creditors</option><option>Indirect Expenses</option>
          </select>
        </div>
        <div className="w-32"><label className="text-xs font-bold text-brand-muted mb-1 block">Opening Bal</label><NotionInput type="number" value={form.bal} onChange={v => setForm({...form, bal: v})} placeholder="0.00" /></div>
        <NotionButton onClick={handleCreate} className="mb-[2px]">Create</NotionButton>
      </div>

      <table className="w-full text-left border-collapse">
        <thead><tr className="border-b border-brand-border text-sm text-brand-muted"><th className="pb-2 font-medium">Ledger Name</th><th className="pb-2 font-medium">Under Group</th><th className="pb-2 font-medium text-right">Balance</th></tr></thead>
        <tbody>
          {ledgers.map(l => (
            <tr key={l.id} className="border-b border-brand-border/50 text-sm hover:bg-brand-sidebar">
              <td className="py-3">{l.name}</td><td className="py-3 text-brand-muted">{l.group_name}</td><td className="py-3 text-right font-medium">₹{l.balance.toFixed(2)}</td>
            </tr>
          ))}
          {ledgers.length === 0 && <tr><td colSpan={3} className="py-6 text-center text-brand-muted text-sm">No ledgers created yet. Type / to get started.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
""",

    "src/pages/Vouchers.jsx": r"""
import React from 'react';
import PageHeader from '../components/ui/PageHeader';
export default function Vouchers() {
  return (
    <div className="max-w-4xl animate-in fade-in duration-300">
      <PageHeader title="Accounting Vouchers" description="The transactional core of your business. Press F4 for Contra, F5 for Payment, F6 for Receipt, F7 for Journal, F8 for Sales, and F9 for Purchases." />
      <div className="p-8 border border-brand-border rounded-md bg-brand-sidebar text-center text-brand-muted text-sm">
        Voucher Entry Interface Ready. Connect POS layout to post Sales Vouchers directly to this ledger engine.
      </div>
    </div>
  );
}
""",

    "src/pages/POSBilling.jsx": r"""
import React from 'react';
import PageHeader from '../components/ui/PageHeader';
export default function POSBilling() {
  return (
    <div className="max-w-4xl animate-in fade-in duration-300">
      <PageHeader title="Retail POS" description="Lightning fast barcode billing. Auto-deducts inventory and automatically posts Sales Vouchers to accounting ledgers in real-time." />
      <div className="p-8 border border-brand-border rounded-md bg-brand-sidebar text-center text-brand-muted text-sm">
        POS Scanner Ready. Link to Inventory module to begin billing.
      </div>
    </div>
  );
}
"""
}

# =====================================================================
# EXECUTION LOGIC
# =====================================================================

def build_architecture():
    print("\n🚀 Starting VyaparSetu Minimalist Tally Architecture Build...\n")
    
    for filepath, content in FILES.items():
        # Ensure directories exist
        path = pathlib.Path(filepath)
        path.parent.mkdir(parents=True, exist_ok=True)
        
        # Write file contents
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✅ Generated: {filepath}")

    print("\n🎉 Architecture successfully scaffolded!")
    print("Next step: Run the terminal commands provided to install dependencies and launch the app.")

if __name__ == "__main__":
    build_architecture()