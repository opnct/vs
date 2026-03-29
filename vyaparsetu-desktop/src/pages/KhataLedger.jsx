import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, User, Phone, MessageCircle, 
  ArrowUpRight, ArrowDownRight, Plus, 
  BookOpen, History, Calendar, AlertCircle,
  CheckCircle, Clock, Loader2, UserPlus, X, IndianRupee
} from 'lucide-react';

export default function KhataLedger() {
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCustomer, setActiveCustomer] = useState(null);
  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ledgerLoading, setLedgerLoading] = useState(false);

  // Modal States
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', limit: '' });

  const [txnModal, setTxnModal] = useState({ isOpen: false, type: null }); // type: 'CREDIT_GIVEN' | 'PAYMENT_RECEIVED'
  const [newTxn, setNewTxn] = useState({ amount: '', remarks: '' });

  // 1. Fetch All Customers with Balances from SQLite via Electron IPC
  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await window.electronAPI.invoke('get_all_customers');
      setCustomers(data || []);
      
      // Update active customer balance silently if it was open
      if (activeCustomer) {
        const updatedMe = data.find(c => c.id === activeCustomer.id);
        if (updatedMe) setActiveCustomer(updatedMe);
      }
    } catch (error) {
      console.error("Failed to fetch customers:", error);
    } finally {
      setLoading(false);
    }
  }, [activeCustomer]);

  // 2. Fetch Ledger History for selected customer
  const fetchLedger = useCallback(async (customerId) => {
    try {
      setLedgerLoading(true);
      const data = await window.electronAPI.invoke('get_customer_ledger', { customerId });
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
    const message = `Hello ${activeCustomer.name}, your pending balance at our shop is ₹${activeCustomer.balance.toFixed(2)}. Please clear it at your earliest convenience.`;
    const waUrl = `https://wa.me/91${activeCustomer.phone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  // --- SQLite Transactors ---

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    if (!newCustomer.name) return;
    
    try {
      await window.electronAPI.invoke('create_customer', {
        c: {
          id: Date.now().toString(),
          name: newCustomer.name,
          phone: newCustomer.phone || null,
          address: null,
          credit_limit: parseFloat(newCustomer.limit) || 0.0
        }
      });
      
      setIsAddingCustomer(false);
      setNewCustomer({ name: '', phone: '', limit: '' });
      await fetchCustomers();
    } catch (error) {
      console.error("Failed to create customer:", error);
    }
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!activeCustomer || !newTxn.amount || isNaN(parseFloat(newTxn.amount))) return;

    const amount = parseFloat(newTxn.amount);
    // Logic: In backend, log_payment decreases balance. 
    // So to GIVE Udhaar (increase balance), we pass a negative amount.
    const payloadAmount = txnModal.type === 'CREDIT_GIVEN' ? -Math.abs(amount) : Math.abs(amount);
    const defaultRemark = txnModal.type === 'CREDIT_GIVEN' ? 'Manual Udhaar / Items Taken' : 'Payment Received';

    try {
      await window.electronAPI.invoke('log_payment', {
        p: {
          id: Date.now().toString(),
          entity_type: 'CUSTOMER',
          entity_id: activeCustomer.id,
          amount: payloadAmount,
          notes: newTxn.remarks || defaultRemark
        }
      });

      setTxnModal({ isOpen: false, type: null });
      setNewTxn({ amount: '', remarks: '' });
      
      await fetchLedger(activeCustomer.id);
      await fetchCustomers();
    } catch (error) {
      console.error("Transaction failed:", error);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (c.phone && c.phone.includes(searchQuery))
  );

  return (
    <div className="flex h-full gap-6 select-none font-sans overflow-hidden relative">
      
      {/* --- ADD CUSTOMER MODAL --- */}
      {isAddingCustomer && (
        <div className="fixed inset-0 bg-brand-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-brand-surface w-[450px] rounded-[2rem] border border-white/5 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-brand-dark/50">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <UserPlus size={20} className="text-brand-blue" /> Register Customer
              </h3>
              <button onClick={() => setIsAddingCustomer(false)} className="text-[#666] hover:text-white transition-colors"><X size={20}/></button>
            </div>
            <form onSubmit={handleAddCustomer} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-widest ml-1">Customer Name *</label>
                <input required type="text" value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} className="w-full bg-brand-dark p-3.5 rounded-xl border border-white/5 text-white font-bold focus:border-brand-blue outline-none transition-all" placeholder="e.g. Ramesh Bhai" />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-widest ml-1">Phone Number</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#555]" />
                  <input type="text" value={newCustomer.phone} onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})} className="w-full bg-brand-dark p-3.5 pl-9 rounded-xl border border-white/5 text-white font-medium focus:border-brand-blue outline-none transition-all" placeholder="10-digit number" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-widest ml-1 flex justify-between">
                  <span>Credit Limit (₹)</span>
                  <span className="text-mac-yellow">Risk Cap</span>
                </label>
                <input type="number" step="0.01" value={newCustomer.limit} onChange={e => setNewCustomer({...newCustomer, limit: e.target.value})} className="w-full bg-brand-dark/50 p-3.5 rounded-xl border border-mac-yellow/20 text-mac-yellow font-bold focus:border-mac-yellow outline-none transition-all" placeholder="0.00" />
              </div>
              <button type="submit" className="w-full bg-brand-blue text-white font-black py-4 rounded-xl hover:bg-brand-blue/80 transition-all uppercase tracking-widest text-[13px] shadow-xl shadow-brand-blue/20 mt-4 active:scale-95">
                Save Customer
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- ADD TRANSACTION MODAL --- */}
      {txnModal.isOpen && (
        <div className="fixed inset-0 bg-brand-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-brand-surface w-[450px] rounded-[2rem] border border-white/5 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className={`flex items-center justify-between p-6 border-b border-white/5 ${txnModal.type === 'CREDIT_GIVEN' ? 'bg-mac-red/10' : 'bg-mac-green/10'}`}>
              <h3 className={`font-bold text-lg flex items-center gap-2 ${txnModal.type === 'CREDIT_GIVEN' ? 'text-mac-red' : 'text-mac-green'}`}>
                {txnModal.type === 'CREDIT_GIVEN' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
                {txnModal.type === 'CREDIT_GIVEN' ? 'Give Udhaar (Debit)' : 'Receive Payment (Credit)'}
              </h3>
              <button onClick={() => setTxnModal({isOpen: false, type: null})} className="text-[#666] hover:text-white transition-colors"><X size={20}/></button>
            </div>
            <form onSubmit={handleAddTransaction} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-widest ml-1">Amount (₹) *</label>
                <div className="relative">
                  <IndianRupee size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 ${txnModal.type === 'CREDIT_GIVEN' ? 'text-mac-red' : 'text-mac-green'}`} />
                  <input required autoFocus type="number" step="0.01" value={newTxn.amount} onChange={e => setNewTxn({...newTxn, amount: e.target.value})} className={`w-full bg-brand-dark p-4 pl-10 rounded-xl border font-black text-xl outline-none transition-all ${txnModal.type === 'CREDIT_GIVEN' ? 'border-mac-red/30 text-mac-red focus:border-mac-red' : 'border-mac-green/30 text-mac-green focus:border-mac-green'}`} placeholder="0.00" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-widest ml-1">Remarks / Notes</label>
                <input type="text" value={newTxn.remarks} onChange={e => setNewTxn({...newTxn, remarks: e.target.value})} className="w-full bg-brand-dark p-3.5 rounded-xl border border-white/5 text-white font-medium focus:border-white/20 outline-none transition-all" placeholder="Optional notes..." />
              </div>
              <button type="submit" className={`w-full text-white font-black py-4 rounded-xl transition-all uppercase tracking-widest text-[13px] shadow-xl mt-4 active:scale-95 ${txnModal.type === 'CREDIT_GIVEN' ? 'bg-mac-red hover:bg-mac-red/80 shadow-mac-red/20' : 'bg-mac-green hover:bg-mac-green/80 shadow-mac-green/20'}`}>
                Confirm Transaction
              </button>
            </form>
          </div>
        </div>
      )}


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
          onClick={() => setIsAddingCustomer(true)}
          className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all border border-dashed border-white/10 active:scale-95"
        >
          <UserPlus size={18} /> New Customer
        </button>

        <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar pr-1 relative">
          {loading && (
            <div className="absolute inset-0 bg-brand-dark/20 backdrop-blur-sm flex items-center justify-center z-10 rounded-2xl">
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
              const bal = parseFloat(customer.balance || 0);
              const hasDue = bal > 0;
              const limit = parseFloat(customer.limit || 0);
              const isOverdue = limit > 0 && bal >= limit;

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
                    !hasDue ? 'bg-mac-green' : isOverdue ? 'bg-status-purple animate-pulse' : 'bg-mac-yellow'
                  }`}></span>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-[15px] truncate">{customer.name}</span>
                      <span className={`text-[13px] font-black ${
                        activeCustomer?.id === customer.id ? 'text-white' : hasDue ? 'text-mac-red' : 'text-mac-green'
                      }`}>
                        ₹{Math.abs(bal).toFixed(0)}
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
                  <p className={`text-4xl font-black tracking-tighter ${activeCustomer.balance > 0 ? 'text-mac-red' : 'text-mac-green'}`}>
                    ₹{activeCustomer.balance.toFixed(2)}
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
                ledgerEntries.map(entry => {
                  // Determine if this entry represents Credit Given (Udhaar) or Payment Received
                  const isCreditGiven = entry.type === 'DEBIT' || entry.amount < 0;
                  const absAmount = Math.abs(entry.amount);

                  return (
                    <div key={entry.id} className="bg-brand-dark/40 p-5 rounded-3xl flex items-center justify-between border border-white/5 hover:border-white/10 transition-all group animate-in slide-in-from-right-4 duration-300">
                      <div className="flex items-center gap-5">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                          isCreditGiven ? 'bg-mac-red/10 text-mac-red' : 'bg-mac-green/10 text-mac-green'
                        }`}>
                          {isCreditGiven ? <ArrowUpRight size={22} /> : <ArrowDownRight size={22} />}
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-[15px]">{entry.notes || 'General Entry'}</h4>
                          <p className="text-[11px] font-medium text-[#666] flex items-center gap-1.5 mt-0.5">
                            <Clock size={10} /> {new Date(entry.date).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className={`text-xl font-black ${isCreditGiven ? 'text-mac-red' : 'text-mac-green'}`}>
                          {isCreditGiven ? '-' : '+'} ₹{absAmount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Action Buttons */}
            <div className="p-6 bg-brand-dark/40 border-t border-white/5 grid grid-cols-2 gap-4">
              <button 
                onClick={() => setTxnModal({isOpen: true, type: 'CREDIT_GIVEN'})}
                className="py-5 bg-mac-red/10 hover:bg-mac-red/20 text-mac-red rounded-3xl text-lg font-black tracking-widest flex items-center justify-center gap-3 transition-all border border-mac-red/20 active:scale-95"
              >
                <AlertCircle size={22} /> GIVE UDHAAR
              </button>
              <button 
                onClick={() => setTxnModal({isOpen: true, type: 'PAYMENT_RECEIVED'})}
                className="py-5 bg-mac-green/10 hover:bg-mac-green/20 text-mac-green rounded-3xl text-lg font-black tracking-widest flex items-center justify-center gap-3 transition-all border border-mac-green/20 active:scale-95"
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