import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { 
  Search, User, Phone, MessageCircle, 
  ArrowUpRight, ArrowDownRight, Plus, 
  BookOpen, ChevronRight, History
} from 'lucide-react';

// Real-world Kirana initial state structure (Ready for SQLite mapping)
const INITIAL_CUSTOMERS = [
  { id: 1, name: "Ramesh Kumar", phone: "9876543210", totalDue: 1450.00 },
  { id: 2, name: "Suresh Provision", phone: "9123456780", totalDue: 320.00 },
  { id: 3, name: "Anita Sharma", phone: "9988776655", totalDue: 0.00 },
  { id: 4, name: "Vikram Singh", phone: "9876501234", totalDue: 5400.00 },
];

const INITIAL_ENTRIES = {
  1: [
    { id: 101, date: '2023-10-24T10:30:00', type: 'CREDIT_GIVEN', amount: 2000.00, remarks: 'Monthly Groceries' },
    { id: 102, date: '2023-10-26T14:15:00', type: 'PAYMENT_RECEIVED', amount: 550.00, remarks: 'Cash paid via son' },
  ],
  2: [
    { id: 103, date: '2023-10-27T09:00:00', type: 'CREDIT_GIVEN', amount: 320.00, remarks: 'Milk and Bread' },
  ],
  4: [
    { id: 104, date: '2023-10-01T11:20:00', type: 'CREDIT_GIVEN', amount: 5400.00, remarks: 'Festival Bulk Order' },
  ]
};

export default function KhataLedger() {
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCustomer, setActiveCustomer] = useState(null);
  const [ledgerEntries, setLedgerEntries] = useState(INITIAL_ENTRIES);

  // Filter customers based on search
  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.phone.includes(searchQuery)
  );

  // Action: Open WhatsApp natively to send a reminder
  const sendWhatsAppReminder = () => {
    if (!activeCustomer) return;
    const message = `Hello ${activeCustomer.name}, your total pending due at our shop is Rs. ${activeCustomer.totalDue}. Please clear it at your earliest convenience. Thank you!`;
    const waUrl = `https://wa.me/91${activeCustomer.phone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  // Action: Add a new ledger entry (Credit or Payment)
  const addEntry = (type) => {
    if (!activeCustomer) return;
    
    const amountStr = prompt(`Enter ${type === 'CREDIT_GIVEN' ? 'Udhaar' : 'Payment'} Amount:`);
    if (!amountStr) return;
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) return alert("Invalid amount entered.");

    const remarks = prompt("Enter Remarks (Optional):") || (type === 'CREDIT_GIVEN' ? 'Items taken' : 'Cash Received');

    const newEntry = {
      id: Date.now(),
      date: new Date().toISOString(),
      type: type,
      amount: amount,
      remarks: remarks
    };

    // Update Ledger State
    setLedgerEntries(prev => ({
      ...prev,
      [activeCustomer.id]: [newEntry, ...(prev[activeCustomer.id] || [])]
    }));

    // Update Customer Due State
    setCustomers(prev => prev.map(c => {
      if (c.id === activeCustomer.id) {
        const newDue = type === 'CREDIT_GIVEN' ? c.totalDue + amount : Math.max(0, c.totalDue - amount);
        setActiveCustomer({ ...c, totalDue: newDue }); // Update active view
        return { ...c, totalDue: newDue };
      }
      return c;
    }));
  };

  return (
    <div className="flex h-full gap-6 max-w-[1600px] mx-auto">
      
      {/* LEFT PANE: Customer List */}
      <div className="w-[380px] flex flex-col gap-6 shrink-0">
        
        {/* Search Bar */}
        <div className="bg-white p-4 rounded-4xl shadow-soft-float border border-gray-100 flex items-center gap-4 transition-all focus-within:ring-4 ring-brand-bg">
          <div className="w-12 h-12 bg-pastel-blue rounded-2xl flex items-center justify-center shrink-0">
            <Search size={24} className="text-indigo-900" />
          </div>
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customer name or phone..."
            className="flex-1 bg-transparent text-lg font-bold text-brand-text placeholder-brand-muted/50 border-none outline-none"
          />
        </div>

        {/* New Customer Button */}
        <button className="bg-brand-bg border-2 border-dashed border-gray-200 hover:border-indigo-300 hover:bg-pastel-blue text-brand-text font-bold py-4 rounded-3xl flex items-center justify-center gap-2 transition-colors">
          <Plus size={20} /> Add New Customer
        </button>

        {/* Customer List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {filteredCustomers.map(customer => (
            <button
              key={customer.id}
              onClick={() => setActiveCustomer(customer)}
              className={`w-full text-left p-5 rounded-3xl transition-all border ${
                activeCustomer?.id === customer.id 
                  ? 'bg-white border-white shadow-soft-float ring-2 ring-indigo-100 scale-[1.02]' 
                  : 'bg-brand-bg border-gray-100 hover:bg-white hover:shadow-sm text-brand-text'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-lg tracking-tight text-brand-text leading-none">{customer.name}</h4>
                <span className={`text-sm font-black ${customer.totalDue > 0 ? 'text-rose-600' : 'text-green-600'}`}>
                  ₹{customer.totalDue.toFixed(2)}
                </span>
              </div>
              <p className="text-xs font-bold text-brand-muted flex items-center gap-1 opacity-70">
                <Phone size={12} /> {customer.phone}
              </p>
            </button>
          ))}
        </div>

      </div>

      {/* RIGHT PANE: Active Khata Notebook */}
      <div className="flex-1 bg-white rounded-4xl shadow-soft-float border border-gray-50 flex flex-col overflow-hidden relative">
        
        {!activeCustomer ? (
          // Empty State
          <div className="flex-1 flex flex-col items-center justify-center text-brand-muted opacity-60">
            <div className="w-24 h-24 bg-brand-bg rounded-full flex items-center justify-center mb-6 border-2 border-dashed border-gray-200">
              <BookOpen size={40} className="text-gray-400" />
            </div>
            <h3 className="text-2xl font-black text-brand-text tracking-tighter mb-2">Select a Customer</h3>
            <p className="font-medium tracking-wide">Open their digital ledger to view Udhaar and Payments.</p>
          </div>
        ) : (
          // Active Ledger State
          <>
            {/* Header */}
            <div className="p-8 border-b border-gray-50 bg-gray-50/30 flex justify-between items-center">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-pastel-blue rounded-full flex items-center justify-center border-4 border-white shadow-sm">
                  <User size={28} className="text-indigo-900" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-brand-text tracking-tight mb-1">{activeCustomer.name}</h2>
                  <p className="text-sm font-bold text-brand-muted flex items-center gap-2">
                    <Phone size={14} /> {activeCustomer.phone}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-muted mb-1">Total Due</p>
                  <p className={`text-4xl font-black tracking-tighter ${activeCustomer.totalDue > 0 ? 'text-rose-600' : 'text-green-600'}`}>
                    ₹{activeCustomer.totalDue.toFixed(2)}
                  </p>
                </div>
                {activeCustomer.totalDue > 0 && (
                  <button 
                    onClick={sendWhatsAppReminder}
                    className="w-14 h-14 bg-[#25D366] hover:bg-[#1ebe57] text-white rounded-2xl flex items-center justify-center shadow-soft-float transition-transform active:scale-95"
                    title="Send WhatsApp Reminder"
                  >
                    <MessageCircle size={26} />
                  </button>
                )}
              </div>
            </div>

            {/* Transactions List */}
            <div className="flex-1 overflow-y-auto p-8 space-y-4 bg-brand-bg/30">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-brand-muted mb-6 flex items-center gap-2">
                <History size={14} /> Transaction History
              </h3>
              
              {(!ledgerEntries[activeCustomer.id] || ledgerEntries[activeCustomer.id].length === 0) ? (
                <p className="text-center text-brand-muted font-bold mt-10">No transactions recorded yet.</p>
              ) : (
                ledgerEntries[activeCustomer.id].map(entry => (
                  <div key={entry.id} className="bg-white p-5 rounded-3xl flex items-center justify-between border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                        entry.type === 'CREDIT_GIVEN' ? 'bg-rose-50' : 'bg-green-50'
                      }`}>
                        {entry.type === 'CREDIT_GIVEN' ? (
                          <ArrowUpRight size={20} className="text-rose-600" strokeWidth={3} />
                        ) : (
                          <ArrowDownRight size={20} className="text-green-600" strokeWidth={3} />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-brand-text tracking-wide">{entry.remarks}</h4>
                        <p className="text-xs font-bold text-brand-muted mt-0.5">
                          {new Date(entry.date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                        </p>
                      </div>
                    </div>
                    
                    <div className={`text-xl font-black tracking-tight ${
                      entry.type === 'CREDIT_GIVEN' ? 'text-rose-600' : 'text-green-600'
                    }`}>
                      {entry.type === 'CREDIT_GIVEN' ? '-' : '+'} ₹{entry.amount.toFixed(2)}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Actions Footer */}
            <div className="p-6 bg-white border-t border-gray-100 grid grid-cols-2 gap-4">
              <button 
                onClick={() => addEntry('CREDIT_GIVEN')}
                className="py-5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-3xl text-lg font-black tracking-wide flex items-center justify-center gap-2 transition-colors border border-rose-200 shadow-sm"
              >
                <ArrowUpRight size={24} /> GIVE UDHAAR
              </button>
              <button 
                onClick={() => addEntry('PAYMENT_RECEIVED')}
                className="py-5 bg-green-50 hover:bg-green-100 text-green-700 rounded-3xl text-lg font-black tracking-wide flex items-center justify-center gap-2 transition-colors border border-green-200 shadow-sm"
              >
                <ArrowDownRight size={24} /> RECEIVE PAYMENT
              </button>
            </div>
          </>
        )}

      </div>

    </div>
  );
}