import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, User, Phone, MessageCircle, 
  ArrowUpRight, ArrowDownRight, Plus, 
  BookOpen, History, Calendar, AlertCircle,
  CheckCircle, Clock, Loader2, UserPlus, X, IndianRupee,
  MoreVertical
} from 'lucide-react';
import ClientProfilePanel from '../components/khata/ClientProfilePanel';

export default function KhataLedger() {
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCustomer, setActiveCustomer] = useState(null);
  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ledgerLoading, setLedgerLoading] = useState(false);

  // Sliding Profile State
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Modal States
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', limit: '' });

  const [txnModal, setTxnModal] = useState({ isOpen: false, type: null }); // type: 'CREDIT_GIVEN' | 'PAYMENT_RECEIVED'
  const [newTxn, setNewTxn] = useState({ amount: '', remarks: '' });

  // 1. Fetch All Customers with Balances from SQLite via Electron IPC
  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      if (window.electronAPI) {
        const data = await window.electronAPI.invoke('get_all_customers');
        setCustomers(data || []);
        
        // Update active customer balance silently if it was open
        if (activeCustomer) {
          const updatedMe = data.find(c => c.id === activeCustomer.id);
          if (updatedMe) setActiveCustomer(updatedMe);
        }
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
      if (window.electronAPI) {
        const data = await window.electronAPI.invoke('get_customer_ledger', { customerId });
        setLedgerEntries(data || []);
      }
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
      if (window.electronAPI) {
        await window.electronAPI.invoke('create_customer', {
          c: {
            id: Date.now().toString(),
            name: newCustomer.name,
            phone: newCustomer.phone || null,
            address: null,
            credit_limit: parseFloat(newCustomer.limit) || 0.0
          }
        });
      }
      
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
    const payloadAmount = txnModal.type === 'CREDIT_GIVEN' ? -Math.abs(amount) : Math.abs(amount);
    const defaultRemark = txnModal.type === 'CREDIT_GIVEN' ? 'Manual Udhaar / Items Taken' : 'Payment Received';

    try {
      if (window.electronAPI) {
        await window.electronAPI.invoke('log_payment', {
          p: {
            id: Date.now().toString(),
            entity_type: 'CUSTOMER',
            entity_id: activeCustomer.id,
            amount: payloadAmount,
            notes: newTxn.remarks || defaultRemark
          }
        });
      }

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
    <div className="flex h-full gap-6 select-none font-sans overflow-hidden relative text-white">
      
      {/* --- ADD CUSTOMER MODAL (Frosted Glass iOS Style) --- */}
      {isAddingCustomer && (
        <div className="fixed inset-0 bg-[#0a0a0a]/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
          <div className="bg-[#1c1c1e] w-[450px] rounded-[2.5rem] border border-white/5 shadow-[0_20px_60px_-15px_rgba(0,0,0,1)] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-[#252525]/50">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <UserPlus size={20} className="text-[#007AFF]" /> Register Customer
              </h3>
              <button onClick={() => setIsAddingCustomer(false)} className="text-[#888888] hover:text-white transition-colors"><X size={20}/></button>
            </div>
            <form onSubmit={handleAddCustomer} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#888888] uppercase tracking-widest ml-1">Customer Name *</label>
                <input required type="text" value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} className="w-full bg-[#0a0a0a] p-4 rounded-2xl border-none text-white font-bold focus:ring-2 focus:ring-[#007AFF] outline-none transition-all" placeholder="e.g. Ramesh Bhai" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#888888] uppercase tracking-widest ml-1">Phone Number</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555]" />
                  <input type="text" value={newCustomer.phone} onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})} className="w-full bg-[#0a0a0a] p-4 pl-12 rounded-2xl border-none text-white font-medium focus:ring-2 focus:ring-[#007AFF] outline-none transition-all" placeholder="10-digit number" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#888888] uppercase tracking-widest ml-1 flex justify-between">
                  <span>Credit Limit (₹)</span>
                  <span className="text-[#FFBD2E]">Risk Cap</span>
                </label>
                <input type="number" step="0.01" value={newCustomer.limit} onChange={e => setNewCustomer({...newCustomer, limit: e.target.value})} className="w-full bg-[#0a0a0a] p-4 rounded-2xl border border-[#FFBD2E]/20 text-[#FFBD2E] font-bold focus:ring-2 focus:ring-[#FFBD2E] outline-none transition-all" placeholder="0.00" />
              </div>
              <button type="submit" className="w-full bg-[#007AFF] text-white font-black py-5 rounded-[2rem] hover:bg-[#007AFF]/80 transition-all uppercase tracking-widest text-[13px] shadow-[0_10px_40px_-10px_rgba(0,122,255,0.8)] mt-4 active:scale-95">
                Save Customer
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- ADD TRANSACTION MODAL (Frosted Glass iOS Style) --- */}
      {txnModal.isOpen && (
        <div className="fixed inset-0 bg-[#0a0a0a]/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
          <div className="bg-[#1c1c1e] w-[450px] rounded-[2.5rem] border border-white/5 shadow-[0_20px_60px_-15px_rgba(0,0,0,1)] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className={`flex items-center justify-between p-8 border-b border-white/5 ${txnModal.type === 'CREDIT_GIVEN' ? 'bg-[#f87171]/10' : 'bg-[#4ade80]/10'}`}>
              <h3 className={`font-bold text-xl tracking-tight flex items-center gap-3 ${txnModal.type === 'CREDIT_GIVEN' ? 'text-[#f87171]' : 'text-[#4ade80]'}`}>
                {txnModal.type === 'CREDIT_GIVEN' ? <AlertCircle size={24} /> : <CheckCircle size={24} />}
                {txnModal.type === 'CREDIT_GIVEN' ? 'Give Udhaar (Debit)' : 'Receive Payment (Credit)'}
              </h3>
              <button onClick={() => setTxnModal({isOpen: false, type: null})} className="text-[#888888] hover:text-white transition-colors"><X size={24}/></button>
            </div>
            <form onSubmit={handleAddTransaction} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#888888] uppercase tracking-widest ml-1">Amount (₹) *</label>
                <div className="relative">
                  <IndianRupee size={20} className={`absolute left-5 top-1/2 -translate-y-1/2 ${txnModal.type === 'CREDIT_GIVEN' ? 'text-[#f87171]' : 'text-[#4ade80]'}`} />
                  <input required autoFocus type="number" step="0.01" value={newTxn.amount} onChange={e => setNewTxn({...newTxn, amount: e.target.value})} className={`w-full bg-[#0a0a0a] p-5 pl-14 rounded-[1.5rem] border-none font-black text-2xl outline-none transition-all ${txnModal.type === 'CREDIT_GIVEN' ? 'text-[#f87171] focus:ring-2 focus:ring-[#f87171]' : 'text-[#4ade80] focus:ring-2 focus:ring-[#4ade80]'}`} placeholder="0.00" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#888888] uppercase tracking-widest ml-1">Remarks / Notes</label>
                <input type="text" value={newTxn.remarks} onChange={e => setNewTxn({...newTxn, remarks: e.target.value})} className="w-full bg-[#0a0a0a] p-4 rounded-2xl border-none text-white font-medium focus:ring-2 focus:ring-white/20 outline-none transition-all" placeholder="Optional notes..." />
              </div>
              <button type="submit" className={`w-full text-white font-black py-5 rounded-[2rem] transition-all uppercase tracking-widest text-[13px] shadow-lg mt-4 active:scale-95 ${txnModal.type === 'CREDIT_GIVEN' ? 'bg-[#f87171] hover:bg-[#f87171]/80 shadow-[#f87171]/30' : 'bg-[#4ade80] hover:bg-[#4ade80]/80 shadow-[#4ade80]/30'}`}>
                Confirm Transaction
              </button>
            </form>
          </div>
        </div>
      )}


      {/* LEFT: Customer List */}
      <div className="w-[350px] flex flex-col gap-6 shrink-0">
        
        {/* Search Bar */}
        <div className="bg-[#1c1c1e] p-2 rounded-[1.5rem] flex items-center gap-3 focus-within:shadow-[0_0_20px_rgba(0,122,255,0.1)] focus-within:ring-1 focus-within:ring-[#007AFF]/50 transition-all">
          <div className="pl-3 text-[#888888]"><Search size={20} /></div>
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Khata"
            className="flex-1 bg-transparent border-none outline-none text-[15px] font-medium text-white placeholder-[#555] py-2"
          />
        </div>

        <button 
          onClick={() => setIsAddingCustomer(true)}
          className="w-full bg-[#0a0a0a] hover:bg-[#1c1c1e] text-white font-bold py-4 rounded-[1.5rem] flex items-center justify-center gap-2 transition-all border border-dashed border-white/20 active:scale-95"
        >
          <UserPlus size={18} /> New Customer
        </button>

        <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2 relative">
          {loading && (
            <div className="absolute inset-0 bg-[#0a0a0a]/60 backdrop-blur-sm flex items-center justify-center z-10 rounded-2xl">
              <Loader2 className="animate-spin text-[#007AFF]" size={32} />
            </div>
          )}
          
          <h3 className="text-[11px] font-bold text-[#888888] tracking-widest uppercase mb-4 px-2">Customer Base</h3>
          
          {filteredCustomers.length === 0 && !loading ? (
             <div className="p-10 text-center opacity-20 text-white">
                <User size={48} className="mx-auto mb-3" />
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
                  onClick={() => {
                    setActiveCustomer(customer);
                    setIsProfileOpen(true);
                  }}
                  className={`w-full text-left p-4 rounded-3xl flex items-center gap-4 transition-all duration-300 border ${
                    activeCustomer?.id === customer.id 
                      ? 'bg-[#1c1c1e] border-[#007AFF] shadow-[0_10px_30px_-10px_rgba(0,122,255,0.4)]' 
                      : 'bg-[#1c1c1e] border-transparent hover:bg-[#252525]'
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-[#0a0a0a] flex items-center justify-center text-white font-black text-[15px] shrink-0 border border-white/5 relative">
                    {customer.name.charAt(0).toUpperCase()}
                    <span className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[#1c1c1e] ${
                      !hasDue ? 'bg-[#4ade80]' : isOverdue ? 'bg-[#FFBD2E] animate-pulse' : 'bg-[#f87171]'
                    }`}></span>
                  </div>
                  
                  <div className="flex-1 overflow-hidden">
                    <div className="font-bold text-[15px] text-white truncate mb-1">{customer.name}</div>
                    <span className={`text-[12px] font-black ${hasDue ? 'text-[#f87171]' : 'text-[#4ade80]'}`}>
                      {hasDue ? 'Due: ' : 'Advance: '}₹{Math.abs(bal).toFixed(0)}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT: Detailed Ledger View */}
      <div className="flex-1 bg-[#1c1c1e] rounded-[2.5rem] border border-white/5 flex flex-col overflow-hidden shadow-[0_20px_40px_-15px_rgba(0,0,0,0.8)] relative">
        
        {!activeCustomer ? (
          <div className="flex-1 flex flex-col items-center justify-center text-[#333]">
            <BookOpen size={80} strokeWidth={1} />
            <p className="mt-6 font-bold tracking-[0.2em] uppercase text-xs text-[#555]">Open a Digital Notebook</p>
          </div>
        ) : (
          <>
            {/* Ledger Header */}
            <div className="p-8 border-b border-[#2a2a2a] bg-[#1c1c1e] flex justify-between items-center z-10 shrink-0 shadow-sm">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-[#007AFF] rounded-2xl flex items-center justify-center text-white shadow-glow-blue">
                  <User size={32} />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white tracking-tight">{activeCustomer.name}</h2>
                  <div className="flex items-center gap-4 mt-1.5">
                    <span className="text-[13px] font-medium text-[#888888] flex items-center gap-2">
                      <Phone size={14} /> {activeCustomer.phone || 'No phone'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#888888] mb-1">Live Balance</p>
                  <p className={`text-4xl font-black tracking-tighter ${activeCustomer.balance > 0 ? 'text-[#f87171]' : 'text-[#4ade80]'}`}>
                    ₹{activeCustomer.balance.toFixed(2)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={sendWhatsAppReminder}
                    className="w-14 h-14 bg-[#25D366] hover:bg-[#25D366]/80 text-white rounded-2xl flex items-center justify-center shadow-lg transition-all active:scale-95"
                    title="Send WhatsApp Reminder"
                  >
                    <MessageCircle size={24} />
                  </button>
                  <button 
                    onClick={() => setIsProfileOpen(true)}
                    className="w-14 h-14 bg-[#252525] hover:bg-[#333] text-white rounded-2xl flex items-center justify-center transition-all active:scale-95"
                    title="View Profile Details"
                  >
                    <MoreVertical size={24} />
                  </button>
                </div>
              </div>
            </div>

            {/* History List */}
            <div className="flex-1 overflow-y-auto p-8 space-y-3 custom-scrollbar bg-[#0a0a0a] relative">
              {ledgerLoading && (
                 <div className="absolute inset-0 bg-[#0a0a0a]/60 backdrop-blur-sm z-10 flex items-center justify-center">
                    <Loader2 className="animate-spin text-[#007AFF]" size={40} />
                 </div>
              )}
              
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#555] flex items-center gap-2">
                  <History size={14}/> Transaction History
                </h3>
              </div>
              
              {ledgerEntries.length === 0 && !ledgerLoading ? (
                <div className="h-full flex flex-col items-center justify-center text-[#222]">
                   <Clock size={64} strokeWidth={1} />
                   <p className="mt-4 font-bold tracking-widest uppercase text-[10px]">No ledger entries yet</p>
                </div>
              ) : (
                ledgerEntries.map(entry => {
                  const isCreditGiven = entry.type === 'DEBIT' || entry.amount < 0;
                  const absAmount = Math.abs(entry.amount);

                  return (
                    <div key={entry.id} className="bg-[#1c1c1e] p-5 rounded-3xl flex items-center justify-between border border-white/5 hover:border-white/10 transition-all group animate-in slide-in-from-right-4 duration-300 shadow-sm">
                      <div className="flex items-center gap-5">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                          isCreditGiven ? 'bg-[#f87171]/10 text-[#f87171]' : 'bg-[#4ade80]/10 text-[#4ade80]'
                        }`}>
                          {isCreditGiven ? <ArrowUpRight size={22} /> : <ArrowDownRight size={22} />}
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-[15px]">{entry.notes || 'General Entry'}</h4>
                          <p className="text-[11px] font-medium text-[#666] flex items-center gap-1.5 mt-1">
                            <Clock size={10} /> {new Date(entry.date).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className={`text-xl font-black ${isCreditGiven ? 'text-[#f87171]' : 'text-[#4ade80]'}`}>
                          {isCreditGiven ? '-' : '+'} ₹{absAmount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Action Buttons */}
            <div className="p-8 bg-[#1c1c1e] border-t border-[#2a2a2a] grid grid-cols-2 gap-6 shrink-0">
              <button 
                onClick={() => setTxnModal({isOpen: true, type: 'CREDIT_GIVEN'})}
                className="py-5 bg-[#f87171]/10 hover:bg-[#f87171]/20 text-[#f87171] rounded-3xl text-lg font-black tracking-widest flex items-center justify-center gap-3 transition-all border border-[#f87171]/20 active:scale-95"
              >
                <AlertCircle size={22} /> GIVE UDHAAR
              </button>
              <button 
                onClick={() => setTxnModal({isOpen: true, type: 'PAYMENT_RECEIVED'})}
                className="py-5 bg-[#4ade80]/10 hover:bg-[#4ade80]/20 text-[#4ade80] rounded-3xl text-lg font-black tracking-widest flex items-center justify-center gap-3 transition-all border border-[#4ade80]/20 active:scale-95"
              >
                <CheckCircle size={22} /> RECEIVE PAYMENT
              </button>
            </div>
          </>
        )}
      </div>

      {/* --- SLIDING CLIENT PROFILE PANEL --- */}
      <ClientProfilePanel 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
        customer={activeCustomer} 
        onSendReminder={sendWhatsAppReminder}
        onAddTransaction={(type) => setTxnModal({isOpen: true, type})}
      />

    </div>
  );
}