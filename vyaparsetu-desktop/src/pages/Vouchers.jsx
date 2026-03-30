import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

export default function Vouchers() {
  const [ledgers, setLedgers] = useState([]);
  const [form, setForm] = useState({ vType: 'Contra', dr: '', cr: '', amount: '', narration: '' });
  const [log, setLog] = useState('Loading voucher engine...');
  const [recent, setRecent] = useState([]);

  // S1: Initialization with Native Safety Check
  const loadData = async () => {
    if (typeof window !== 'undefined' && window.__TAURI_INTERNALS__) {
      try {
        const ls = await invoke('exec_sql_read', { query: "SELECT * FROM ledgers" });
        setLedgers(ls);
        if(ls.length > 0 && !form.dr) setForm(f => ({...f, dr: ls[0].id, cr: ls[0].id}));
        
        const rec = await invoke('exec_sql_read', { query: "SELECT v.date, v.v_type, v.total, l.name FROM vouchers v JOIN voucher_entries ve ON v.id = ve.voucher_id JOIN ledgers l ON ve.ledger_id = l.id WHERE ve.debit > 0 ORDER BY v.date DESC LIMIT 10" });
        setRecent(rec);
        setLog('Voucher Engine Ready.');
      } catch(e) { 
        setLog(`ERR: ${e}`); 
      }
    } else {
      setLog('ERR: Native engine missing. Running in standard browser.');
    }
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

  // S3: Post Double Entry with Native Safety Check
  const handlePost = async () => {
    if(!form.amount || form.dr === form.cr) return setLog('ERR: Invalid Entry. Check accounts/amount.');
    if (typeof window === 'undefined' || !window.__TAURI_INTERNALS__) return setLog('ERR: Cannot post. Native engine missing.');

    try {
      const vchId = await invoke('post_double_entry', { v_type: form.vType, total: parseFloat(form.amount), dr_ledger: form.dr, cr_ledger: form.cr, narration: form.narration, items: [] });
      setLog(`OK: Voucher ${vchId} Posted.`);
      setForm({...form, amount: '', narration: ''});
      loadData();
    } catch (e) { 
      setLog(`ERR: ${e}`); 
    }
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
          <button onClick={handlePost} className="bg-np-accent text-black font-bold px-6 border-none">Save</button>
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