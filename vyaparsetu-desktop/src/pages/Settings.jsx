import React, { useState, useEffect } from 'react';
import { Store, Printer, Receipt, Save, CheckCircle2, Usb, FileText } from 'lucide-react';

export default function Settings() {
  // Real Local State (Persisted to localStorage for immediate effect)
  const [settings, setSettings] = useState({
    shopName: "My Kirana Store",
    shopAddress: "Main Market Road, City",
    phone: "9876543210",
    gstEnabled: false,
    gstin: "",
    printerPort: "USB001",
    receiptFooter: "Thank you for shopping!"
  });

  const [isSaved, setIsSaved] = useState(false);

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
    // Save to real browser local storage
    localStorage.setItem('vyaparsetu_settings', JSON.stringify(settings));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-[1200px] mx-auto h-full pb-10">
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-brand-text tracking-tight">System Settings</h1>
          <p className="text-brand-muted font-medium mt-1">Configure your shop details, billing rules, and hardware.</p>
        </div>
        
        <button 
          onClick={handleSave}
          className="bg-brand-text text-white font-black uppercase tracking-widest py-3 px-8 rounded-2xl flex items-center gap-3 transition-transform active:scale-95 shadow-soft-3d"
        >
          {isSaved ? <><CheckCircle2 size={20} className="text-green-400" /> SAVED</> : <><Save size={20} /> SAVE CHANGES</>}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* SHOP DETAILS CARD */}
        <div className="bg-white rounded-4xl p-8 shadow-soft-float border border-gray-50 space-y-6">
          <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
            <div className="w-12 h-12 bg-pastel-blue rounded-2xl flex items-center justify-center">
              <Store size={24} className="text-indigo-900" />
            </div>
            <h2 className="text-xl font-black tracking-tight text-brand-text">Shop Details</h2>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-brand-muted uppercase tracking-widest">Shop Name (Printed on Bill)</label>
            <input name="shopName" value={settings.shopName} onChange={handleChange} className="w-full bg-brand-bg p-4 rounded-2xl border border-gray-200 font-bold focus:outline-none focus:border-indigo-400" />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-brand-muted uppercase tracking-widest">Address</label>
            <textarea name="shopAddress" value={settings.shopAddress} onChange={handleChange} rows="2" className="w-full bg-brand-bg p-4 rounded-2xl border border-gray-200 font-bold focus:outline-none focus:border-indigo-400 resize-none"></textarea>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-brand-muted uppercase tracking-widest">Contact Number</label>
            <input name="phone" value={settings.phone} onChange={handleChange} className="w-full bg-brand-bg p-4 rounded-2xl border border-gray-200 font-bold focus:outline-none focus:border-indigo-400" />
          </div>
        </div>

        <div className="space-y-8">
          {/* GST & BILLING CARD */}
          <div className="bg-white rounded-4xl p-8 shadow-soft-float border border-gray-50 space-y-6">
            <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
              <div className="w-12 h-12 bg-pastel-pink rounded-2xl flex items-center justify-center">
                <Receipt size={24} className="text-rose-900" />
              </div>
              <h2 className="text-xl font-black tracking-tight text-brand-text">Tax & Billing Rules</h2>
            </div>

            <label className="flex items-center justify-between p-4 bg-brand-bg rounded-2xl border border-gray-200 cursor-pointer hover:border-indigo-300 transition-colors">
              <div>
                <p className="font-bold text-brand-text">Enable GST Calculation</p>
                <p className="text-xs font-medium text-brand-muted mt-1">Automatically calculate SGST/CGST on invoices</p>
              </div>
              <div className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" name="gstEnabled" checked={settings.gstEnabled} onChange={handleChange} className="sr-only peer" />
                <div className="w-14 h-8 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-500"></div>
              </div>
            </label>

            {settings.gstEnabled && (
              <div className="space-y-2 animate-in fade-in zoom-in-95 duration-200">
                <label className="text-xs font-black text-brand-muted uppercase tracking-widest">Shop GSTIN Number</label>
                <input name="gstin" value={settings.gstin} onChange={handleChange} placeholder="e.g. 22AAAAA0000A1Z5" className="w-full bg-rose-50 p-4 rounded-2xl border border-rose-200 font-bold text-rose-900 focus:outline-none focus:border-rose-400 uppercase tracking-widest" />
              </div>
            )}
          </div>

          {/* HARDWARE INTEGRATION CARD */}
          <div className="bg-white rounded-4xl p-8 shadow-soft-float border border-gray-50 space-y-6">
            <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
              <div className="w-12 h-12 bg-pastel-peach rounded-2xl flex items-center justify-center">
                <Printer size={24} className="text-orange-900" />
              </div>
              <h2 className="text-xl font-black tracking-tight text-brand-text">Hardware Setup</h2>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-brand-muted uppercase tracking-widest flex items-center gap-2">
                <Usb size={14}/> Thermal Printer Port
              </label>
              <select name="printerPort" value={settings.printerPort} onChange={handleChange} className="w-full bg-brand-bg p-4 rounded-2xl border border-gray-200 font-bold focus:outline-none focus:border-indigo-400 cursor-pointer">
                <option value="USB001">USB001 (Default)</option>
                <option value="USB002">USB002</option>
                <option value="COM1">COM1 (Serial)</option>
                <option value="LPT1">LPT1 (Parallel)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-brand-muted uppercase tracking-widest flex items-center gap-2">
                <FileText size={14}/> Receipt Footer Message
              </label>
              <input name="receiptFooter" value={settings.receiptFooter} onChange={handleChange} className="w-full bg-brand-bg p-4 rounded-2xl border border-gray-200 font-bold focus:outline-none focus:border-indigo-400" />
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}