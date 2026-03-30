
import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useAppStore } from '../store/useAppStore';

export default function Dashboard() {
  const openFile = useAppStore(state => state.openFile);
  const [stats, setStats] = useState([]);

  useEffect(() => {
    // S1: Database Status Fetch
    invoke('exec_sql_read', { query: "SELECT v_type, COUNT(id) as count, SUM(total) as val FROM vouchers GROUP BY v_type" })
      .then(setStats).catch(console.error);
    
    // S2: Global Shortcuts
    const hk = (e) => { if (e.key === 'F8') openFile('POS_Terminal.rs'); };
    window.addEventListener('keydown', hk);
    return () => window.removeEventListener('keydown', hk);
  }, []);

  return (
    <div className="max-w-5xl p-8 font-sans text-vscode-text">
      {/* S3: Header */}
      <h1 className="text-3xl font-normal mb-2">VyaparSetu Workspace</h1>
      <p className="text-vscode-textDark mb-10 text-sm">Double-Entry Engine v2.0. Press F8 anywhere for Rapid POS.</p>
      
      <div className="grid grid-cols-2 gap-12">
        {/* S4: Shortcut Links */}
        <div>
          <h2 className="text-lg mb-4 font-semibold text-vscode-string">Start</h2>
          <ul className="space-y-3 text-sm font-mono">
            <li><button onClick={() => openFile('POS_Terminal.rs')} className="text-vscode-accent hover:underline">1. New POS Sale (F8)</button></li>
            <li><button onClick={() => openFile('Chart_Of_Accounts.json')} className="text-vscode-accent hover:underline">2. Manage Ledgers</button></li>
            <li><button onClick={() => openFile('Inventory_Master.sql')} className="text-vscode-accent hover:underline">3. Add Stock Item</button></li>
            <li><button onClick={() => openFile('Financial_Reports.csv')} className="text-vscode-accent hover:underline">4. View Day Book</button></li>
          </ul>
        </div>

        {/* S5: Live Database Status */}
        <div>
          <h2 className="text-lg mb-4 font-semibold text-vscode-type">Database Status</h2>
          <div className="bg-[#1e1e1e] border border-vscode-border p-5 rounded font-mono text-sm leading-loose">
            <div className="text-vscode-keyword mb-2">// Active Vouchers Summary</div>
            {stats.length > 0 ? stats.map((s,i) => (
              <div key={i} className="flex justify-between border-b border-vscode-border/30 pb-1 mb-1">
                <span>{s.v_type}:</span><span className="text-vscode-func">₹{s.val || 0} ({s.count} tx)</span>
              </div>
            )) : <div className="text-vscode-textDark">No transactions yet. Run POS to generate data.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
