
import React, { useState, useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core'; // TAURI v2 IMPORT

export default function Ledgers() {
  const [ledgers, setLedgers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [form, setForm] = useState({ name: '', group: 'G3', bal: '' });
  const [log, setLog] = useState('// Ledger engine ready.');
  const [filter, setFilter] = useState('');
  
  const nameRef = useRef(null);

  // S1: Complex Join Fetch
  const loadData = async () => {
    try {
      const gs = await invoke('exec_sql_read', { query: "SELECT * FROM ledger_groups" });
      setGroups(gs);
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

  // S4: Filtering
  const filtered = ledgers.filter(l => l.name.toLowerCase().includes(filter.toLowerCase()) || l.group_name.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="flex flex-col h-full gap-4 pb-10 font-mono text-sm">
      {/* S5: Action Form */}
      <div className="p-4 border border-vscode-border bg-[#1e1e1e]">
        <div className="text-vscode-keyword mb-4">// Create New Ledger (Ctrl+S)</div>
        <div className="flex gap-4">
          <input ref={nameRef} type="text" placeholder="Ledger Name" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} className="flex-1" />
          <select value={form.group} onChange={e=>setForm({...form, group: e.target.value})} className="w-64">
            {groups.map(g => <option key={g.id} value={g.id}>{g.name} ({g.nature})</option>)}
          </select>
          <input type="number" placeholder="Open Bal" value={form.bal} onChange={e=>setForm({...form, bal: e.target.value})} className="w-32" />
          <button onClick={handleCreate} className="bg-vscode-accent px-6 py-1.5 text-white rounded hover:bg-blue-600 font-bold">save()</button>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col border border-vscode-border bg-[#1e1e1e] overflow-hidden">
        <div className="p-3 bg-[#252526] border-b border-vscode-border">
          <input type="text" placeholder="Filter ledgers by name or group..." value={filter} onChange={e=>setFilter(e.target.value)} className="w-full bg-[#1e1e1e]" />
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
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
