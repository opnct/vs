import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { 
  Search, User, Phone, MessageCircle, 
  ArrowUpRight, ArrowDownRight, Plus, 
  BookOpen, History, Calendar, AlertCircle,
  CheckCircle, Clock
} from 'lucide-react';

// Real-world Kirana initial state structure with Due Date & Status tracking
const INITIAL_CUSTOMERS = [
  { id: 1, name: "Ramesh Kumar", phone: "9876543210", totalDue: 1450.00, dueDate: '2023-11-15', status: 'due', dot: 'bg-status-orange' },
  { id: 2, name: "Suresh Provision", phone: "9123456780", totalDue: 0.00, dueDate: null, status: 'paid', dot: 'bg-status-green' },
  { id: 3, name: "Anita Sharma", phone: "9988776655", totalDue: 320.00, dueDate: '2023-10-10', status: 'overdue', dot: 'bg-status-purple' },
  { id: 4, name: "Vikram Singh", phone: "9876501234", totalDue: 5400.00, dueDate: '2023-11-20', status: 'due', dot: 'bg-status-orange' },
];

const INITIAL_ENTRIES = {
  1: [
    { id: 101, date: '2023-10-24T10:30:00', type: 'CREDIT_GIVEN', amount: 2000.00, remarks: 'Monthly Groceries', status: 'unpaid' },
    { id: 102, date: '2023-10-26T14:15:00', type: 'PAYMENT_RECEIVED', amount: 550.00, remarks: 'Cash paid via son', status: 'paid' },
  ],
  3: [
    { id: 103, date: '2023-10-27T09:00:00', type: 'CREDIT_GIVEN', amount: 320.00, remarks: 'Milk and Bread', status: 'unpaid' },
  ]
};

export default function KhataLedger() {
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCustomer, setActiveCustomer] = useState(null);
  const [ledgerEntries, setLedgerEntries] = useState(INITIAL_ENTRIES);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.phone.includes(searchQuery)
  );

  const sendWhatsAppReminder = () => {
    if (!activeCustomer) return;
    const message = `Hello ${activeCustomer.name}, your pending balance at our shop is ₹${activeCustomer.totalDue}. Due date: ${activeCustomer.dueDate || 'N/A'}. Please clear it soon.`;
    const waUrl = `https://wa.me/91${activeCustomer.phone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  const toggleEntryStatus = (id) => {
    setLedgerEntries(prev => {
      const entries = prev[activeCustomer.id] || [];
      const updated = entries.map(e => e.id === id ? { ...e, status: e.status === 'paid' ? 'unpaid' : 'paid' } : e);
      return { ...prev, [activeCustomer.id]: updated };
    });
  };

  const addEntry = (type) => {
    if (!activeCustomer) return;
    const amountStr = prompt(`Enter ${type === 'CREDIT_GIVEN' ? 'Udhaar' : 'Payment'} Amount:`);
    if (!amountStr || isNaN(parseFloat(amountStr))) return;
    
    const amount = parseFloat(amountStr);
    const remarks = prompt("Enter Remarks:") || (type === 'CREDIT_GIVEN' ? 'Items taken' : 'Payment');
    const dueDateInput = type === 'CREDIT_GIVEN' ? prompt("Enter Due Date (YYYY-MM-DD):", "2023-12-01") : null;

    const newEntry = {
      id: Date.now(),
      date: new Date().toISOString(),
      type: type,
      amount: amount,
      remarks: remarks,
      status: type === 'PAYMENT_RECEIVED' ? 'paid' : 'unpaid'
    };

    setLedgerEntries(prev => ({
      ...prev,
      [activeCustomer.id]: [newEntry, ...(prev[activeCustomer.id] || [])]
    }));

    setCustomers(prev => prev.map(c => {
      if (c.id === activeCustomer.id) {
        const newDue = type === 'CREDIT_GIVEN' ? c.totalDue + amount : Math.max(0, c.totalDue - amount);
        const newStatus = newDue === 0 ? 'paid' : 'due';
        const newDot = newDue === 0 ? 'bg-status-green' : 'bg-status-orange';
        const updated = { ...c, totalDue: newDue, status: newStatus, dot: newDot, dueDate: dueDateInput || c.dueDate };
        setActiveCustomer(updated);
        return updated;
      }
      return c;
    }));
  };

  return (
    <div className="flex h-full gap-6 select-none font-sans overflow-hidden">
      
      {/* LEFT: Customer List matching Reference Image Sidebar style */}
      <div className="w-[350px] flex flex-col gap-5 shrink-0">
        
        {/* Dark macOS Search */}
        <div className="bg-brand-surface p-2 rounded-2xl border border-white/5 flex items-center gap-3 focus-within:border-brand-blue/40 transition-all">
          <div className="pl-3 text-[#A1A1AA]"><Search size={18} /></div>
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Khata"
            className="flex-1 bg-transparent border-none outline-none text-[15px] text-white placeholder-[#666] py-1.5"
          />
        </div>

        <button className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all border border-dashed border-white/10">
          <Plus size={18} /> New Customer
        </button>

        <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar pr-1">
          <h3 className="text-[13px] font-bold text-[#A1A1AA] tracking-widest uppercase mb-3 px-2">All Customers</h3>
          {filteredCustomers.map(customer => (
            <button
              key={customer.id}
              onClick={() => setActiveCustomer(customer)}
              className={`w-full text-left px-4 py-3 rounded-2xl flex items-center gap-4 transition-all ${
                activeCustomer?.id === customer.id 
                  ? 'bg-brand-blue text-white shadow-lg' 
                  : 'text-[#A1A1AA] hover:bg-white/5 hover:text-white'
              }`}
            >
              {/* Reference Image Colored Dot Style */}
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${customer.dot}`}></span>
              <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-[15px] truncate">{customer.name}</span>
                  <span className={`text-[13px] font-black ${activeCustomer?.id === customer.id ? 'text-white' : customer.totalDue > 0 ? 'text-mac-red' : 'text-mac-green'}`}>
                    ₹{customer.totalDue.toFixed(0)}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* RIGHT: Detailed Ledger View */}
      <div className="flex-1 bg-brand-surface rounded-[2.5rem] border border-white/5 flex flex-col overflow-hidden shadow-2xl relative">
        
        {!activeCustomer ? (
          <div className="flex-1 flex flex-col items-center justify-center text-[#444]">
            <BookOpen size={64} strokeWidth={1} />
            <p className="mt-4 font-bold tracking-[0.2em] uppercase text-xs">Open a Customer Khata</p>
          </div>
        ) : (
          <>
            {/* Ledger Header */}
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-brand-dark/30">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-brand-blue/20 rounded-[1.5rem] flex items-center justify-center border border-brand-blue/30 text-brand-blue">
                  <User size={32} />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white tracking-tight">{activeCustomer.name}</h2>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-sm font-medium text-[#A1A1AA] flex items-center gap-1.5"><Phone size={14} /> {activeCustomer.phone}</span>
                    {activeCustomer.dueDate && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-mac-yellow/10 text-mac-yellow border border-mac-yellow/20 flex items-center gap-1">
                        <Calendar size={10} /> DUE: {activeCustomer.dueDate}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A1A1AA] mb-1">Outstanding Balance</p>
                  <p className={`text-4xl font-black tracking-tighter ${activeCustomer.totalDue > 0 ? 'text-mac-red' : 'text-mac-green'}`}>
                    ₹{activeCustomer.totalDue.toFixed(2)}
                  </p>
                </div>
                <button 
                  onClick={sendWhatsAppReminder}
                  className="w-14 h-14 bg-[#25D366] hover:scale-105 text-white rounded-2xl flex items-center justify-center shadow-lg transition-all"
                  title="WhatsApp Reminder"
                >
                  <MessageCircle size={24} />
                </button>
              </div>
            </div>

            {/* History List matching Reference Note Style */}
            <div className="flex-1 overflow-y-auto p-8 space-y-4 custom-scrollbar bg-brand-dark/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#666] flex items-center gap-2"><History size={14}/> Transaction Timeline</h3>
              </div>
              
              {(ledgerEntries[activeCustomer.id] || []).map(entry => (
                <div key={entry.id} className="bg-brand-dark/40 p-5 rounded-3xl flex items-center justify-between border border-white/5 hover:border-white/10 transition-all group">
                  <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      entry.type === 'CREDIT_GIVEN' ? 'bg-mac-red/10 text-mac-red' : 'bg-mac-green/10 text-mac-green'
                    }`}>
                      {entry.type === 'CREDIT_GIVEN' ? <ArrowUpRight size={22} /> : <ArrowDownRight size={22} />}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-[15px]">{entry.remarks}</h4>
                      <p className="text-[11px] font-medium text-[#666] flex items-center gap-1.5 mt-0.5">
                        <Clock size={10} /> {new Date(entry.date).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className={`text-xl font-black ${entry.type === 'CREDIT_GIVEN' ? 'text-mac-red' : 'text-mac-green'}`}>
                        {entry.type === 'CREDIT_GIVEN' ? '-' : '+'} ₹{entry.amount.toFixed(2)}
                      </p>
                      <button 
                        onClick={() => toggleEntryStatus(entry.id)}
                        className={`text-[9px] font-bold uppercase tracking-widest mt-1 px-2 py-0.5 rounded-md ${
                          entry.status === 'paid' ? 'bg-mac-green/10 text-mac-green' : 'bg-mac-yellow/10 text-mac-yellow'
                        }`}
                      >
                        {entry.status}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="p-6 bg-brand-dark/40 border-t border-white/5 grid grid-cols-2 gap-4">
              <button 
                onClick={() => addEntry('CREDIT_GIVEN')}
                className="py-5 bg-mac-red/10 hover:bg-mac-red/20 text-mac-red rounded-3xl text-lg font-black tracking-widest flex items-center justify-center gap-3 transition-all border border-mac-red/20"
              >
                <AlertCircle size={22} /> GIVE UDHAAR
              </button>
              <button 
                onClick={() => addEntry('PAYMENT_RECEIVED')}
                className="py-5 bg-mac-green/10 hover:bg-mac-green/20 text-mac-green rounded-3xl text-lg font-black tracking-widest flex items-center justify-center gap-3 transition-all border border-mac-green/20"
              >
                <CheckCircle size={22} /> RECEIVE PAYMENT
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}