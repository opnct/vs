import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { 
  Search, Truck, Phone, MapPin, 
  Plus, Hash, FileText, CreditCard,
  ArrowUpRight, Clock, UserPlus, X
} from 'lucide-react';

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [activeSupplier, setActiveSupplier] = useState(null);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);

  // New Supplier Form State
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    phone: '',
    gstin: '',
    address: ''
  });

  // Fetch Suppliers from SQLite via Rust
  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const data = await invoke('get_all_suppliers').catch(() => []);
      setSuppliers(data);
    } catch (error) {
      console.error("Database error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  // Fetch specific history when a supplier is selected
  useEffect(() => {
    if (activeSupplier) {
      const fetchHistory = async () => {
        try {
          const history = await invoke('get_supplier_purchases', { supplierId: activeSupplier.id }).catch(() => []);
          setPurchaseHistory(history);
        } catch (error) {
          console.error("History fetch error:", error);
        }
      };
      fetchHistory();
    }
  }, [activeSupplier]);

  const handleAddSupplier = async (e) => {
    e.preventDefault();
    if (!newSupplier.name || !newSupplier.phone) return;

    try {
      await invoke('add_supplier', { 
        name: newSupplier.name, 
        phone: newSupplier.phone, 
        gstin: newSupplier.gstin || null 
      });
      setIsAdding(false);
      setNewSupplier({ name: '', phone: '', gstin: '', address: '' });
      fetchSuppliers();
    } catch (error) {
      console.error("Add supplier error:", error);
    }
  };

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.phone.includes(searchQuery)
  );

  return (
    <div className="flex h-full gap-6 select-none font-sans overflow-hidden">
      
      {/* LEFT: Supplier List (Reference Style) */}
      <div className="w-[350px] flex flex-col gap-5 shrink-0">
        
        {/* Dark macOS Search Bar */}
        <div className="bg-brand-surface p-2 rounded-2xl border border-white/5 flex items-center gap-3 focus-within:border-brand-blue/40 transition-all">
          <div className="pl-3 text-[#A1A1AA]"><Search size={18} /></div>
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Distributors"
            className="flex-1 bg-transparent border-none outline-none text-[15px] text-white placeholder-[#666] py-1.5"
          />
        </div>

        <button 
          onClick={() => setIsAdding(true)}
          className="w-full bg-brand-blue text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-blue/20 active:scale-95"
        >
          <UserPlus size={18} /> Add New Supplier
        </button>

        <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar pr-1">
          <h3 className="text-[11px] font-bold text-[#A1A1AA] tracking-widest uppercase mb-3 px-2">Registered Suppliers</h3>
          
          {filteredSuppliers.length === 0 ? (
            <div className="p-10 text-center opacity-20 text-white">
              <Truck size={40} className="mx-auto mb-2" />
              <p className="text-[10px] font-bold uppercase">No records</p>
            </div>
          ) : (
            filteredSuppliers.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveSupplier(s)}
                className={`w-full text-left px-4 py-3 rounded-2xl flex items-center gap-4 transition-all ${
                  activeSupplier?.id === s.id 
                    ? 'bg-brand-blue text-white shadow-lg' 
                    : 'text-[#A1A1AA] hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${activeSupplier?.id === s.id ? 'bg-white' : 'bg-status-purple'}`}></div>
                <div className="flex-1 overflow-hidden">
                  <div className="font-semibold text-[15px] truncate">{s.name}</div>
                  <div className={`text-[11px] font-medium mt-0.5 ${activeSupplier?.id === s.id ? 'text-white/70' : 'text-[#555]'}`}>
                    {s.phone}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* RIGHT: Detailed Ledger & History */}
      <div className="flex-1 bg-brand-surface rounded-[2.5rem] border border-white/5 flex flex-col overflow-hidden shadow-2xl relative">
        
        {!activeSupplier && !isAdding ? (
          <div className="flex-1 flex flex-col items-center justify-center text-[#333]">
            <Truck size={64} strokeWidth={1} />
            <p className="mt-4 font-bold tracking-[0.2em] uppercase text-xs text-[#555]">Select a distributor to view balance</p>
          </div>
        ) : isAdding ? (
          /* ADD SUPPLIER FORM */
          <div className="p-12 animate-in fade-in slide-in-from-bottom-4 duration-300">
             <div className="flex justify-between items-center mb-10">
                <h2 className="text-3xl font-bold text-white tracking-tight">Register New Supplier</h2>
                <button onClick={() => setIsAdding(false)} className="p-3 bg-white/5 text-[#A1A1AA] rounded-2xl hover:text-mac-red transition-all">
                   <X size={24} />
                </button>
             </div>

             <form onSubmit={handleAddSupplier} className="max-w-2xl space-y-8">
                <div className="grid grid-cols-2 gap-8">
                   <div className="space-y-2">
                      <label className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-widest ml-1">Company / Person Name *</label>
                      <input required type="text" value={newSupplier.name} onChange={e => setNewSupplier({...newSupplier, name: e.target.value})} className="w-full bg-brand-dark p-4 rounded-xl border border-white/5 text-white font-medium focus:border-brand-blue transition-all" placeholder="e.g. Balaji Agencies" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-widest ml-1">Contact Phone *</label>
                      <input required type="tel" value={newSupplier.phone} onChange={e => setNewSupplier({...newSupplier, phone: e.target.value})} className="w-full bg-brand-dark p-4 rounded-xl border border-white/5 text-white font-medium focus:border-brand-blue transition-all" placeholder="+91" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-widest ml-1">GST Number (GSTIN)</label>
                      <input type="text" value={newSupplier.gstin} onChange={e => setNewSupplier({...newSupplier, gstin: e.target.value})} className="w-full bg-brand-dark p-4 rounded-xl border border-white/5 text-white font-medium focus:border-brand-blue transition-all uppercase" placeholder="27AAAA..." />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-widest ml-1">Operating Address</label>
                      <input type="text" value={newSupplier.address} onChange={e => setNewSupplier({...newSupplier, address: e.target.value})} className="w-full bg-brand-dark p-4 rounded-xl border border-white/5 text-white font-medium focus:border-brand-blue transition-all" placeholder="City, State" />
                   </div>
                </div>

                <button type="submit" className="bg-brand-blue text-white font-black px-12 py-5 rounded-2xl hover:bg-brand-blue/80 transition-all uppercase tracking-widest text-[13px] shadow-2xl shadow-brand-blue/30">
                   Create Supplier Profile
                </button>
             </form>
          </div>
        ) : (
          /* SUPPLIER DETAILS VIEW */
          <>
            <div className="p-8 border-b border-white/5 bg-brand-dark/30 flex justify-between items-center">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-brand-dark rounded-3xl flex items-center justify-center border border-white/5 text-brand-blue">
                  <Truck size={32} />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white tracking-tight">{activeSupplier.name}</h2>
                  <div className="flex items-center gap-6 mt-1.5">
                    <span className="text-[13px] font-medium text-[#A1A1AA] flex items-center gap-2"><Phone size={14} /> {activeSupplier.phone}</span>
                    {activeSupplier.gstin && (
                      <span className="text-[11px] font-black px-2.5 py-1 rounded-md bg-white/5 text-mac-yellow border border-mac-yellow/20 flex items-center gap-1.5 uppercase tracking-widest">
                        <Hash size={12} /> {activeSupplier.gstin}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-10">
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#666] mb-1">Total Outstanding</p>
                  <p className="text-4xl font-black text-mac-red tracking-tighter leading-none">
                    ₹0.00
                  </p>
                </div>
              </div>
            </div>

            {/* Purchase Timeline */}
            <div className="flex-1 overflow-y-auto p-8 space-y-4 bg-brand-dark/20 custom-scrollbar">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#555] flex items-center gap-2">
                  <History size={14}/> Purchase Records
                </h3>
              </div>

              {purchaseHistory.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-[#222]">
                  <FileText size={48} strokeWidth={1} />
                  <p className="mt-4 font-bold tracking-widest uppercase text-[10px]">No bills recorded for this supplier</p>
                </div>
              ) : (
                purchaseHistory.map(bill => (
                  <div key={bill.id} className="bg-brand-dark/40 p-5 rounded-3xl flex items-center justify-between border border-white/5 hover:border-white/10 transition-all group">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 text-brand-blue flex items-center justify-center">
                        <FileText size={22} />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-[15px]">Bill #{bill.bill_number || bill.id}</h4>
                        <p className="text-[11px] font-medium text-[#666] flex items-center gap-1.5 mt-0.5">
                          <Clock size={10} /> {new Date(bill.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="text-xl font-black text-white">₹{bill.total_amount.toFixed(2)}</p>
                        <span className={`text-[9px] font-bold uppercase tracking-widest mt-1 px-2 py-0.5 rounded-md ${
                          bill.payment_status === 'PAID' ? 'bg-mac-green/10 text-mac-green' : 'bg-mac-red/10 text-mac-red'
                        }`}>
                          {bill.payment_status}
                        </span>
                      </div>
                      <ChevronRight size={18} className="text-[#333] group-hover:text-[#666] transition-colors" />
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Quick Actions Footer */}
            <div className="p-6 bg-brand-dark/40 border-t border-white/5 flex gap-4">
               <button className="flex-1 py-4 bg-brand-blue/10 hover:bg-brand-blue/20 text-brand-blue rounded-2xl font-black tracking-widest flex items-center justify-center gap-2 transition-all border border-brand-blue/20">
                  <CreditCard size={18} /> RECORD PAYMENT
               </button>
               <button className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black tracking-widest flex items-center justify-center gap-2 transition-all border border-white/10">
                  <ArrowUpRight size={18} /> STOCK IN (NEW BILL)
               </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}