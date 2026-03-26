import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { 
  Users, UserPlus, Shield, ShieldCheck, 
  Lock, Key, Trash2, Edit3, X, 
  CheckCircle2, Ban, Eye, EyeOff
} from 'lucide-react';

export default function Staff() {
  const [staffList, setStaffList] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [showPin, setShowPin] = useState(false);
  
  // New Staff State
  const [newStaff, setNewStaff] = useState({
    name: '',
    phone: '',
    pin: '',
    allowDiscounts: false,
    allowDeleteBill: false,
    role: 'CASHIER'
  });

  // Load staff from local SQLite
  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      // const data = await invoke('get_all_staff');
      // setStaffList(data);
    } catch (error) {
      console.error("Staff fetch failed:", error);
    }
  };

  const togglePermission = (id, permission) => {
    setStaffList(prev => prev.map(s => {
      if (s.id === id) {
        const updated = { ...s, [permission]: !s[permission] };
        // Sync with SQLite: await invoke('update_staff_permission', { id, permission, value: updated[permission] });
        return updated;
      }
      return s;
    }));
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (newStaff.pin.length !== 4) return alert("PIN must be 4 digits");

    try {
      // await invoke('add_staff', { ...newStaff });
      setStaffList([...staffList, { id: Date.now(), ...newStaff }]);
      setIsAdding(false);
      setNewStaff({ name: '', phone: '', pin: '', allowDiscounts: false, allowDeleteBill: false, role: 'CASHIER' });
    } catch (error) {
      console.error("Add staff failed:", error);
    }
  };

  const PermissionToggle = ({ active, label, onClick }) => (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${
        active 
          ? 'bg-mac-green/10 border-mac-green/30 text-mac-green' 
          : 'bg-white/5 border-white/5 text-[#666]'
      }`}
    >
      {active ? <CheckCircle2 size={12} /> : <Ban size={12} />}
      <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
    </button>
  );

  return (
    <div className="flex h-full gap-6 select-none font-sans overflow-hidden">
      
      {/* 1. Left Section: Management Info */}
      <div className="w-[350px] flex flex-col gap-6 shrink-0">
        <div className="bg-brand-surface p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
          <div className="w-16 h-16 bg-brand-blue/10 rounded-3xl flex items-center justify-center border border-brand-blue/20 text-brand-blue mb-6">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight mb-2">Staff Control</h2>
          <p className="text-sm text-[#A1A1AA] leading-relaxed">
            Manage your shop attendants and restrict sensitive POS operations like bill deletion and manual discounts.
          </p>
          <div className="mt-8 space-y-4">
             <div className="flex items-center gap-3 text-xs font-bold text-mac-green">
                <Shield size={16} /> Restricted Deletion Active
             </div>
             <div className="flex items-center gap-3 text-xs font-bold text-mac-yellow">
                <Lock size={16} /> Encrypted PIN Access
             </div>
          </div>
        </div>

        <button 
          onClick={() => setIsAdding(true)}
          className="w-full bg-brand-blue text-white font-black py-5 rounded-[2rem] flex items-center justify-center gap-3 shadow-xl shadow-brand-blue/20 hover:bg-brand-blue/80 transition-all active:scale-95"
        >
          <UserPlus size={20} /> REGISTER STAFF
        </button>
      </div>

      {/* 2. Right Section: Staff Grid */}
      <div className="flex-1 bg-brand-surface rounded-[2.5rem] border border-white/5 flex flex-col overflow-hidden shadow-2xl relative">
        
        {isAdding ? (
          /* ADD STAFF FORM (Reference Modal Style) */
          <div className="p-12 animate-in fade-in slide-in-from-bottom-4 duration-300">
             <div className="flex justify-between items-center mb-10">
                <h2 className="text-3xl font-bold text-white tracking-tight">Add New Attendant</h2>
                <button onClick={() => setIsAdding(false)} className="p-3 bg-white/5 text-[#A1A1AA] rounded-2xl hover:text-mac-red transition-all">
                   <X size={24} />
                </button>
             </div>

             <form onSubmit={handleAddStaff} className="max-w-2xl space-y-8">
                <div className="grid grid-cols-2 gap-8">
                   <div className="space-y-2">
                      <label className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-widest ml-1">Attendant Name *</label>
                      <input required type="text" value={newStaff.name} onChange={e => setNewStaff({...newStaff, name: e.target.value})} className="w-full bg-brand-dark p-4 rounded-xl border border-white/5 text-white font-medium focus:border-brand-blue outline-none" placeholder="e.g. Rahul Singh" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-widest ml-1">4-Digit Login PIN *</label>
                      <input required type="password" maxLength="4" value={newStaff.pin} onChange={e => setNewStaff({...newStaff, pin: e.target.value})} className="w-full bg-brand-dark p-4 rounded-xl border border-white/5 text-white font-black tracking-[1em] focus:border-brand-blue outline-none text-center" placeholder="••••" />
                   </div>
                </div>

                <div className="p-6 bg-brand-dark/50 rounded-3xl border border-white/5 space-y-6">
                   <h3 className="text-[11px] font-black text-[#666] uppercase tracking-widest">Access Permissions</h3>
                   <div className="flex gap-4">
                      <label className="flex-1 flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 cursor-pointer hover:bg-white/10 transition-all">
                         <span className="text-sm font-bold text-white">Allow Bill Discounts</span>
                         <input type="checkbox" checked={newStaff.allowDiscounts} onChange={e => setNewStaff({...newStaff, allowDiscounts: e.target.checked})} className="w-5 h-5 accent-brand-blue" />
                      </label>
                      <label className="flex-1 flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 cursor-pointer hover:bg-white/10 transition-all">
                         <span className="text-sm font-bold text-white">Allow Bill Deletion</span>
                         <input type="checkbox" checked={newStaff.allowDeleteBill} onChange={e => setNewStaff({...newStaff, allowDeleteBill: e.target.checked})} className="w-5 h-5 accent-mac-red" />
                      </label>
                   </div>
                </div>

                <button type="submit" className="bg-brand-blue text-white font-black px-12 py-5 rounded-2xl hover:bg-brand-blue/80 transition-all uppercase tracking-widest text-[13px] shadow-2xl shadow-brand-blue/30">
                   Register Attendant Profile
                </button>
             </form>
          </div>
        ) : (
          /* STAFF DIRECTORY VIEW */
          <>
            <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-brand-dark/30">
               <h3 className="text-white font-bold text-lg flex items-center gap-3">
                  <Users size={20} className="text-brand-blue" /> Active Staff Profiles
               </h3>
               <button onClick={() => setShowPin(!showPin)} className="text-[#A1A1AA] hover:text-white flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                  {showPin ? <><EyeOff size={14}/> Hide PINs</> : <><Eye size={14}/> Show PINs</>}
               </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4 custom-scrollbar">
              {staffList.length === 0 ? (
                <div className="col-span-2 h-full flex flex-col items-center justify-center text-[#222]">
                   <Users size={64} strokeWidth={1} />
                   <p className="mt-4 font-bold tracking-widest uppercase text-xs">No staff registered</p>
                </div>
              ) : (
                staffList.map(s => (
                  <div key={s.id} className="bg-brand-dark/30 p-6 rounded-[2rem] border border-white/5 hover:border-white/10 transition-all relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4">
                       <button className="text-[#333] hover:text-mac-red transition-colors"><Trash2 size={16} /></button>
                    </div>

                    <div className="flex items-center gap-5 mb-6">
                       <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-white font-black text-xl border border-white/10">
                          {s.name.charAt(0)}
                       </div>
                       <div>
                          <h4 className="text-white font-bold text-lg">{s.name}</h4>
                          <div className="flex items-center gap-2 text-[#666] text-[11px] font-bold uppercase tracking-widest mt-0.5">
                             <Key size={10} /> PIN: {showPin ? s.pin : '••••'}
                          </div>
                       </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                       <PermissionToggle 
                        active={s.allowDiscounts} 
                        label="Discount" 
                        onClick={() => togglePermission(s.id, 'allowDiscounts')} 
                       />
                       <PermissionToggle 
                        active={s.allowDeleteBill} 
                        label="Delete" 
                        onClick={() => togglePermission(s.id, 'allowDeleteBill')} 
                       />
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}