
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
