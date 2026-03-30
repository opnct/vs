
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
