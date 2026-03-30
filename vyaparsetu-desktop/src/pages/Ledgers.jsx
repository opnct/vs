
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
          <button onClick={handleCreate} className="bg-np-actionBg">Save</button>
        </div>
      </div>

      {/* S6: Data Table */}
      <div className="flex-1 flex flex-col border border-np-border overflow-hidden">
        <input type="text" placeholder="Filter ledgers..." value={filter} onChange={e=>setFilter(e.target.value)} className="p-2 border-b border-np-border bg-np-actionBg w-full border-none" />
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
