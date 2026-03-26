import React, { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { 
  Search, User, Phone, MessageCircle, 
  ArrowUpRight, ArrowDownRight, Plus, 
  BookOpen, History, Calendar, AlertCircle,
  CheckCircle, Clock, Loader2, UserPlus
} from 'lucide-react';

export default function KhataLedger() {
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCustomer, setActiveCustomer] = useState(null);
  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ledgerLoading, setLedgerLoading] = useState(false);

  // 1. Fetch All Customers with Balances from SQLite
  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await invoke('get_all_customers');
      setCustomers(data || []);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Fetch Ledger History for selected customer
  const fetchLedger = useCallback(async (customerId) => {
    try {
      setLedgerLoading(true);
      const data = await invoke('get_customer_khata', { customerId });
      setLedgerEntries(data || []);
    } catch (error) {
      console.error("Failed to fetch ledger:", error);
    } finally {
      setLedgerLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  useEffect(() => {
    if (activeCustomer?.id) {
      fetchLedger(activeCustomer.id);
    }
  }, [activeCustomer?.id, fetchLedger]);

  const sendWhatsAppReminder = () => {
    if (!activeCustomer) return;
    const message = `Hello ${activeCustomer.name}, your pending balance at our shop is ₹${activeCustomer.total_due}. Please clear it at your earliest convenience.`;
    const waUrl = `https://wa.me/91${activeCustomer.phone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  const addEntry = async (type) => {
    if (!activeCustomer) return;
    const amountStr = prompt(`Enter ${type === 'CREDIT_GIVEN' ? 'Udhaar' : 'Payment'} Amount:`);
    if (!amountStr || isNaN(parseFloat(amountStr))) return;
    
    const amount = parseFloat(amountStr);
    const remarks = prompt("Enter Remarks:") || (type === 'CREDIT_GIVEN' ? 'Items taken' : 'Payment Received');

    try {
      // Logic: Send transaction to SQLite
      await invoke('add_khata_transaction', { 
        customerId: activeCustomer.id,
        amount,
        txnType: type,
        remarks
      });

      // Refresh data
      await fetchLedger(activeCustomer.id);
      await fetchCustomers();
      
      // Update active balance in UI immediately
      const updatedCustomers = await invoke('get_all_customers');
      const me = updatedCustomers.find(c => c.id === activeCustomer.id);
      if (me) setActiveCustomer(me);

    } catch (error) {
      console.error("Transaction failed:", error);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (c.phone && c.phone.includes(searchQuery))
  );

  return (
    <div className="flex h-full gap-6 select-none font-sans overflow-hidden">
      
      {/* LEFT: Customer List */}
      <div className="w-[350px] flex flex-col gap-5 shrink-0">
        
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

        <button 
          onClick={() => {/* Implement add_customer invoke here */}}
          className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all border border-dashed border-white/10"
        >
          <UserPlus size={18} /> New Customer
        </button>

        <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar pr-1 relative">
          {loading && (
            <div className="absolute inset-0 bg-brand-dark/20 backdrop-blur-sm flex items-center justify-center z-10">
              <Loader2 className="animate-spin text-brand-blue" size={24} />
            </div>
          )}
          
          <h3 className="text-[11px] font-bold text-[#A1A1AA] tracking-widest uppercase mb-3 px-2">Customer Base</h3>
          
          {filteredCustomers.length === 0 && !loading ? (
             <div className="p-10 text-center opacity-20 text-white">
                <User size={40} className="mx-auto mb-2" />
                <p className="text-[10px] font-bold uppercase tracking-widest">No khata found</p>
             </div>
          ) : (
            filteredCustomers.map(customer => {
              const hasDue = customer.total_due > 0;
              const isOverdue = customer.total_due > 5000; // Example business logic for purple dot

              return (
                <button
                  key={customer.id}
                  onClick={() => setActiveCustomer(customer)}
                  className={`w-full text-left px-4 py-3 rounded-2xl flex items-center gap-4 transition-all ${
                    activeCustomer?.id === customer.id 
                      ? 'bg-brand-blue text-white shadow-lg' 
                      : 'text-[#A1A1AA] hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full shrink-0 ${
                    !hasDue ? 'bg-mac-green' : isOverdue ? 'bg-status-purple' : 'bg-mac-yellow'
                  }`}></span>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-[15px] truncate">{customer.name}</span>
                      <span className={`text-[13px] font-black ${
                        activeCustomer?.id === customer.id ? 'text-white' : hasDue ? 'text-mac-red' : 'text-mac-green'
                      }`}>
                        ₹{Math.abs(customer.total_due).toFixed(0)}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT: Detailed Ledger View */}
      <div className="flex-1 bg-brand-surface rounded-[2.5rem] border border-white/5 flex flex-col overflow-hidden shadow-2xl relative">
        
        {!activeCustomer ? (
          <div className="flex-1 flex flex-col items-center justify-center text-[#333]">
            <BookOpen size={64} strokeWidth={1} />
            <p className="mt-4 font-bold tracking-[0.2em] uppercase text-xs text-[#555]">Open a Digital Notebook</p>
          </div>
        ) : (
          <>
            {/* Ledger Header */}
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-brand-dark/30">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-brand-blue/10 rounded-[1.5rem] flex items-center justify-center border border-brand-blue/20 text-brand-blue">
                  <User size={32} />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white tracking-tight">{activeCustomer.name}</h2>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-sm font-medium text-[#A1A1AA] flex items-center gap-1.5">
                      <Phone size={14} /> {activeCustomer.phone || 'No phone'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#666] mb-1">Live Balance</p>
                  <p className={`text-4xl font-black tracking-tighter ${activeCustomer.total_due > 0 ? 'text-mac-red' : 'text-mac-green'}`}>
                    ₹{activeCustomer.total_due.toFixed(2)}
                  </p>
                </div>
                <button 
                  onClick={sendWhatsAppReminder}
                  className="w-14 h-14 bg-[#25D366] hover:scale-105 text-white rounded-2xl flex items-center justify-center shadow-lg transition-all"
                >
                  <MessageCircle size={24} />
                </button>
              </div>
            </div>

            {/* History List */}
            <div className="flex-1 overflow-y-auto p-8 space-y-4 custom-scrollbar bg-brand-dark/20 relative">
              {ledgerLoading && (
                 <div className="absolute inset-0 bg-brand-dark/40 backdrop-blur-xs z-10 flex items-center justify-center">
                    <Loader2 className="animate-spin text-brand-blue" size={32} />
                 </div>
              )}
              
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#555] flex items-center gap-2">
                  <History size={14}/> Transaction History
                </h3>
              </div>
              
              {ledgerEntries.length === 0 && !ledgerLoading ? (
                <div className="h-full flex flex-col items-center justify-center text-[#222]">
                   <Clock size={48} strokeWidth={1} />
                   <p className="mt-4 font-bold tracking-widest uppercase text-[10px]">No ledger entries yet</p>
                </div>
              ) : (
                ledgerEntries.map(entry => (
                  <div key={entry.id} className="bg-brand-dark/40 p-5 rounded-3xl flex items-center justify-between border border-white/5 hover:border-white/10 transition-all group">
                    <div className="flex items-center gap-5">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                        entry.txn_type === 'CREDIT_GIVEN' ? 'bg-mac-red/10 text-mac-red' : 'bg-mac-green/10 text-mac-green'
                      }`}>
                        {entry.txn_type === 'CREDIT_GIVEN' ? <ArrowUpRight size={22} /> : <ArrowDownRight size={22} />}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-[15px]">{entry.remarks || 'General Entry'}</h4>
                        <p className="text-[11px] font-medium text-[#666] flex items-center gap-1.5 mt-0.5">
                          <Clock size={10} /> {new Date(entry.date).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className={`text-xl font-black ${entry.txn_type === 'CREDIT_GIVEN' ? 'text-mac-red' : 'text-mac-green'}`}>
                        {entry.txn_type === 'CREDIT_GIVEN' ? '-' : '+'} ₹{entry.amount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))
              )}
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