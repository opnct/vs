
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
