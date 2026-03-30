import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ code: '', name: '', stock: '', rate: '' });
  const [log, setLog] = useState('Loading inventory...');
  const [filter, setFilter] = useState('');

  const loadItems = async () => {
    if (typeof window !== 'undefined' && window.__TAURI_INTERNALS__) {
      try {
        const result = await invoke('exec_sql_read', { query: "SELECT * FROM inventory" });
        setItems(result);
        setLog('Ready.');
      } catch (e) {
        setLog(`ERR: ${e}`);
      }
    } else {
      setLog('ERR: Native engine missing. Running in standard browser.');
    }
  };

  useEffect(() => { loadItems(); }, []);

  const handleCreate = async () => {
    if(!form.name) return setLog('ERR: Missing Name');
    if (typeof window === 'undefined' || !window.__TAURI_INTERNALS__) {
      return setLog('ERR: Cannot save. Native engine missing.');
    }

    try {
      const id = `ITM${Date.now()}`;
      await invoke('exec_sql', { query: `INSERT INTO inventory (id, item_code, name, stock, rate, unit) VALUES ('${id}', '${form.code}', '${form.name}', ${form.stock || 0}, ${form.rate || 0}, 'PCS')`});
      setLog(`OK: Created ${form.name}`);
      loadItems();
      setForm({ code: '', name: '', stock: '', rate: '' });
    } catch (e) { 
      setLog(`ERR: ${e}`); 
    }
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
          <button onClick={handleCreate} className="bg-np-actionBg">Save</button>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col border border-np-border overflow-hidden">
        <input type="text" placeholder="Filter inventory..." value={filter} onChange={e=>setFilter(e.target.value)} className="p-2 border-b border-np-border bg-np-actionBg w-full border-none" />
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