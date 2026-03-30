
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
