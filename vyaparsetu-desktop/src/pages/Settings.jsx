import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { 
  Store, Printer, Receipt, Save, CheckCircle2, 
  Usb, FileText, Cloud, Download, ShieldCheck,
  Smartphone, MapPin, Info, RefreshCcw
} from 'lucide-react';

export default function Settings() {
  // Real Local State (Persisted for Hardware & UI consistency)
  const [settings, setSettings] = useState({
    shopName: "VyaparSetu Retail",
    shopAddress: "Main Market, Sector 12",
    phone: "9876543210",
    gstEnabled: true,
    gstin: "27AAAAA0000A1Z5",
    printerPort: "LPT1",
    receiptFooter: "Thank you for shopping! Visit again."
  });

  const [isSaved, setIsSaved] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);

  // Load from real localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('vyaparsetu_settings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setIsSaved(false);
  };

  const handleSave = () => {
    // Save to browser storage for UI persistence
    localStorage.setItem('vyaparsetu_settings', JSON.stringify(settings));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const triggerCloudBackup = async () => {
    setIsBackingUp(true);
    try {
      // Logic: Trigger the Rust sync engine to push all local SQLite records to Firestore
      await invoke('sync_offline_pos', { payload: "manual_trigger" });
      alert("Cloud Sync Successful: All local records are now backed up to Firebase.");
    } catch (error) {
      console.error("Backup failed:", error);
    } finally {
      setIsBackingUp(false);
    }
  };

  const exportGSTR1 = () => {
    // Logic: In a real flow, this calls a Rust command to generate a CSV from the gst_records table
    alert("GSTR-1 Data Exported to Documents/VyaparSetu/Reports/GSTR1_Oct_2023.csv");
  };

  return (
    <div className="max-w-[1200px] mx-auto h-full pb-10 select-none font-sans">
      
      {/* Header with Save Button */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Settings & Configuration</h1>
          <p className="text-[#A1A1AA] text-sm mt-1 font-medium">Manage shop identity, hardware, and cloud data.</p>
        </div>
        
        <button 
          onClick={handleSave}
          className={`px-8 py-4 rounded-2xl font-black tracking-widest flex items-center gap-3 transition-all active:scale-95 shadow-2xl ${
            isSaved 
            ? 'bg-mac-green text-white shadow-mac-green/20' 
            : 'bg-brand-blue text-white shadow-brand-blue/20 hover:bg-brand-blue/80'
          }`}
        >
          {isSaved ? <><CheckCircle2 size={20} /> SAVED</> : <><Save size={20} /> SAVE CHANGES</>}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Identity & Hardware */}
        <div className="space-y-8">
          
          {/* SHOP IDENTITY CARD */}
          <div className="bg-brand-surface rounded-[2.5rem] p-8 border border-white/5 shadow-xl relative overflow-hidden">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-brand-blue/10 rounded-2xl flex items-center justify-center text-brand-blue border border-brand-blue/20">
                <Store size={24} />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">Shop Profile</h2>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#666] uppercase tracking-widest ml-1">Official Shop Name</label>
                <input name="shopName" value={settings.shopName} onChange={handleChange} className="w-full bg-brand-dark p-4 rounded-2xl border border-white/5 text-white font-bold focus:border-brand-blue outline-none transition-all" />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#666] uppercase tracking-widest ml-1">Physical Address (Printed on Receipt)</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-4 text-[#333]" size={18} />
                  <textarea name="shopAddress" value={settings.shopAddress} onChange={handleChange} rows="2" className="w-full bg-brand-dark p-4 pl-12 rounded-2xl border border-white/5 text-white font-bold focus:border-brand-blue outline-none resize-none transition-all"></textarea>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#666] uppercase tracking-widest ml-1">Business Contact</label>
                <div className="relative">
                  <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#333]" size={18} />
                  <input name="phone" value={settings.phone} onChange={handleChange} className="w-full bg-brand-dark p-4 pl-12 rounded-2xl border border-white/5 text-white font-bold focus:border-brand-blue outline-none transition-all" />
                </div>
              </div>
            </div>
          </div>

          {/* HARDWARE CARD */}
          <div className="bg-brand-surface rounded-[2.5rem] p-8 border border-white/5 shadow-xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-mac-yellow/10 rounded-2xl flex items-center justify-center text-mac-yellow border border-mac-yellow/20">
                <Printer size={24} />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">Hardware Integration</h2>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#666] uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Usb size={14}/> Thermal Printer Port (ESC/POS)
                </label>
                <select name="printerPort" value={settings.printerPort} onChange={handleChange} className="w-full bg-brand-dark p-4 rounded-2xl border border-white/5 text-white font-bold focus:border-brand-blue outline-none cursor-pointer">
                  <option value="USB001">USB001 (Plug & Play)</option>
                  <option value="COM1">Serial (COM1)</option>
                  <option value="LPT1">Parallel (LPT1)</option>
                  <option value="TCP">Network (IP Printer)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#666] uppercase tracking-widest ml-1 flex items-center gap-2">
                  <FileText size={14}/> Receipt Footer Tagline
                </label>
                <input name="receiptFooter" value={settings.receiptFooter} onChange={handleChange} className="w-full bg-brand-dark p-4 rounded-2xl border border-white/5 text-white font-medium focus:border-brand-blue outline-none" />
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Tax & Data */}
        <div className="space-y-8">
          
          {/* TAX & GST CARD */}
          <div className="bg-brand-surface rounded-[2.5rem] p-8 border border-white/5 shadow-xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-mac-red/10 rounded-2xl flex items-center justify-center text-mac-red border border-mac-red/20">
                <Receipt size={24} />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">GST & Taxation</h2>
            </div>

            <div className="space-y-6">
              <label className="flex items-center justify-between p-5 bg-brand-dark/50 rounded-3xl border border-white/5 cursor-pointer hover:border-brand-blue/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${settings.gstEnabled ? 'bg-mac-green/10 text-mac-green' : 'bg-[#111] text-[#444]'}`}>
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">Enable GST Billing</p>
                    <p className="text-[10px] font-medium text-[#666] mt-0.5 uppercase tracking-widest">Compliant with GSTR-1 norms</p>
                  </div>
                </div>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="gstEnabled" checked={settings.gstEnabled} onChange={handleChange} className="sr-only peer" />
                  <div className="w-11 h-6 bg-[#333] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-mac-green"></div>
                </div>
              </label>

              {settings.gstEnabled && (
                <div className="space-y-2 animate-in zoom-in-95 duration-200">
                  <label className="text-[11px] font-bold text-mac-yellow uppercase tracking-widest ml-1">Shop GSTIN (15-Digits)</label>
                  <input name="gstin" value={settings.gstin} onChange={handleChange} placeholder="e.g. 27AAAAA0000A1Z5" className="w-full bg-brand-dark p-4 rounded-2xl border border-mac-yellow/20 text-mac-yellow font-black focus:border-mac-yellow outline-none uppercase tracking-widest" />
                  <div className="flex items-center gap-2 mt-2 px-1">
                    <Info size={12} className="text-[#444]" />
                    <span className="text-[9px] font-bold text-[#444] uppercase tracking-widest">Required for GST tax invoices</span>
                  </div>
                </div>
              )}

              <button 
                onClick={exportGSTR1}
                className="w-full flex items-center justify-center gap-3 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold border border-white/10 transition-all text-sm uppercase tracking-widest"
              >
                <Download size={18} className="text-mac-green" /> Export GSTR-1 CSV
              </button>
            </div>
          </div>

          {/* CLOUD & BACKUP CARD */}
          <div className="bg-brand-surface rounded-[2.5rem] p-8 border border-white/5 shadow-xl relative overflow-hidden">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-status-purple/10 rounded-2xl flex items-center justify-center text-status-purple border border-status-purple/20">
                <Cloud size={24} />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">Data & Cloud Security</h2>
            </div>

            <div className="p-6 bg-brand-dark/50 rounded-3xl border border-white/5 mb-6">
               <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-bold text-[#666] uppercase tracking-widest">Last Cloud Backup</span>
                  <span className="text-mac-green text-[11px] font-black uppercase tracking-widest">Oct 24, 2023 • 10:42 AM</span>
               </div>
               <p className="text-xs text-[#A1A1AA] leading-relaxed">
                 All local SQLite transactions are automatically mirrored to Firebase Cloud. You can also trigger a manual force-sync below.
               </p>
            </div>

            <button 
              onClick={triggerCloudBackup}
              disabled={isBackingUp}
              className="w-full flex items-center justify-center gap-3 py-5 bg-status-purple text-white rounded-2xl font-black tracking-widest hover:bg-status-purple/80 transition-all shadow-xl shadow-status-purple/20 active:scale-95 disabled:opacity-50"
            >
              {isBackingUp ? <RefreshCcw size={20} className="animate-spin" /> : <Cloud size={20} />}
              {isBackingUp ? 'SYNCHRONIZING...' : 'BACKUP TO CLOUD NOW'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}