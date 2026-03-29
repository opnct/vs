import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Store, Printer, Receipt, Save, CheckCircle2, 
  Usb, FileText, Cloud, Download, ShieldCheck,
  Smartphone, MapPin, Info, RefreshCw, Loader2,
  Camera, Trash2, Globe, ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import PremiumInput from '../components/ui/PremiumInput';
import PremiumToggle from '../components/ui/PremiumToggle';

export default function Settings() {
  const { t } = useLanguage();
  const fileInputRef = useRef(null);
  
  const isOfflineMode = localStorage.getItem('vs_offline_mode') === 'true';

  const [settings, setSettings] = useState({
    shopName: "",
    shopAddress: "",
    phone: "",
    gstEnabled: false,
    gstin: "",
    printerPort: "USB001",
    receiptFooter: "",
    logoBase64: null
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      if (window.electronAPI) {
        const data = await window.electronAPI.invoke('get_settings');
        if (data) setSettings(data);
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleInputChange = (name, value) => {
    setSettings(prev => ({ ...prev, [name]: value }));
    setIsSaved(false);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings(prev => ({ ...prev, logoBase64: reader.result }));
        setIsSaved(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (window.electronAPI) {
        await window.electronAPI.invoke('update_settings', { settings });
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
      }
    } catch (error) {
      console.error("Database Update Error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const triggerCloudBackup = async () => {
    if (isOfflineMode) return;
    setIsBackingUp(true);
    try {
      if (window.electronAPI) {
        await window.electronAPI.invoke('sync_offline_pos', { payload: "manual_trigger" });
      }
    } catch (error) {
      console.error("Backup failed:", error);
    } finally {
      setIsBackingUp(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#0a0a0a]">
        <Loader2 className="animate-spin text-[#007AFF]" size={48} />
      </div>
    );
  }

  return (
    <div className="max-w-[1000px] mx-auto h-full pb-20 select-none font-sans text-white">
      
      {/* HEADER: Action Bar */}
      <div className="flex items-center justify-between mb-12">
        <div className="animate-in fade-in slide-in-from-left-4 duration-500">
          <h1 className="text-4xl font-black tracking-tight">{t('set_title')}</h1>
          <p className="text-[#888888] text-sm mt-1 font-medium">{t('set_desc')}</p>
        </div>
        
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className={`px-10 py-4 rounded-[2rem] font-black tracking-widest flex items-center gap-3 transition-all active:scale-95 shadow-2xl ${
            isSaved 
            ? 'bg-[#4ade80] text-white shadow-[#4ade80]/20' 
            : 'bg-[#007AFF] text-white shadow-[0_10px_30px_-10px_rgba(0,122,255,0.5)] hover:bg-[#0084FF]'
          }`}
        >
          {isSaving ? <Loader2 className="animate-spin" size={20} /> : isSaved ? <CheckCircle2 size={20} /> : <Save size={20} />}
          {isSaved ? 'SETTINGS SYNCED' : 'SAVE CHANGES'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        
        {/* SECTION 1: Shop Profile & Identity */}
        <div className="bg-[#1c1c1e] rounded-[3rem] p-10 shadow-2xl border border-white/5 relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col md:flex-row gap-12 items-start">
            
            {/* Logo Workspace */}
            <div className="flex flex-col items-center gap-4 shrink-0">
              <div className="relative group">
                <div className="w-40 h-40 rounded-full bg-[#0a0a0a] border-4 border-[#252525] flex items-center justify-center overflow-hidden shadow-inner transition-transform group-hover:scale-[1.02]">
                  {settings.logoBase64 ? (
                    <img src={settings.logoBase64} alt="Shop Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Store size={48} className="text-[#333]" />
                  )}
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-1 right-1 w-12 h-12 bg-[#007AFF] text-white rounded-full flex items-center justify-center shadow-lg border-4 border-[#1c1c1e] hover:bg-[#0084FF] transition-all active:scale-90"
                >
                  <Camera size={20} />
                </button>
                <input type="file" ref={fileInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />
              </div>
              <span className="text-[10px] font-black text-[#555] uppercase tracking-widest">Business Brand</span>
            </div>

            {/* Identity Fields */}
            <div className="flex-1 w-full space-y-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 bg-[#007AFF]/10 rounded-xl flex items-center justify-center text-[#007AFF]">
                  <Store size={20} />
                </div>
                <h2 className="text-xl font-bold tracking-tight">Business Identity</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <PremiumInput 
                  label="Shop Name" 
                  value={settings.shopName} 
                  onChange={(v) => handleInputChange('shopName', v)}
                  placeholder="e.g. VyaparSetu Retail"
                  icon={Store}
                />
                <PremiumInput 
                  label="Business Phone" 
                  value={settings.phone} 
                  onChange={(v) => handleInputChange('phone', v)}
                  placeholder="+91 00000 00000"
                  icon={Smartphone}
                />
              </div>
              <PremiumInput 
                label="Billing Address" 
                value={settings.shopAddress} 
                onChange={(v) => handleInputChange('shopAddress', v)}
                placeholder="Complete physical store location..."
                icon={MapPin}
                multiline
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: Compliance & Hardware (Grouped) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Tax Compliance Card */}
          <div className="bg-[#1c1c1e] rounded-[3rem] p-10 shadow-2xl border border-white/5 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-10 h-10 bg-[#f87171]/10 rounded-xl flex items-center justify-center text-[#f87171]">
                <Receipt size={20} />
              </div>
              <h2 className="text-xl font-bold tracking-tight">Compliance & Tax</h2>
            </div>

            <div className="space-y-8">
              <PremiumToggle 
                label="GST Compliance" 
                description="Enable automated GST calculations on invoices"
                isActive={settings.gstEnabled}
                onToggle={(val) => handleInputChange('gstEnabled', val)}
                icon={ShieldCheck}
              />
              
              <AnimatePresence>
                {settings.gstEnabled && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }} 
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <PremiumInput 
                      label="Store GSTIN" 
                      value={settings.gstin} 
                      onChange={(v) => handleInputChange('gstin', v)}
                      placeholder="27AAAAA0000A1Z5"
                      icon={Hash}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <button className="w-full flex items-center justify-center gap-3 py-4 bg-[#0a0a0a] hover:bg-[#252525] text-[#888] hover:text-white rounded-2xl font-bold border border-white/5 transition-all text-sm uppercase tracking-widest active:scale-95">
                <Download size={18} className="text-[#4ade80]" /> Export GSTR-1 (Excel)
              </button>
            </div>
          </div>

          {/* Printing Card */}
          <div className="bg-[#1c1c1e] rounded-[3rem] p-10 shadow-2xl border border-white/5 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-10 h-10 bg-[#FFBD2E]/10 rounded-xl flex items-center justify-center text-[#FFBD2E]">
                <Printer size={20} />
              </div>
              <h2 className="text-xl font-bold tracking-tight">Printing System</h2>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#555] uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                  <Usb size={14}/> Thermal Printer Port
                </label>
                <select 
                  value={settings.printerPort} 
                  onChange={(e) => handleInputChange('printerPort', e.target.value)} 
                  className="w-full bg-[#0a0a0a] p-4 rounded-2xl border-none text-white font-bold focus:ring-2 focus:ring-[#007AFF] outline-none cursor-pointer"
                >
                  <option value="USB001">Auto-Detect USB (Recommended)</option>
                  <option value="COM1">Serial Port COM1</option>
                  <option value="LPT1">Parallel Port LPT1</option>
                  <option value="NETWORK">Network / IP Printer</option>
                </select>
              </div>

              <PremiumInput 
                label="Receipt Footer Note" 
                value={settings.receiptFooter} 
                onChange={(v) => handleInputChange('receiptFooter', v)}
                placeholder="Thank you for shopping with us!"
                icon={FileText}
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: System & Cloud */}
        <div className="bg-[#1c1c1e] rounded-[3rem] p-10 shadow-2xl border border-white/5 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 bg-[#7c3aed]/10 rounded-xl flex items-center justify-center text-[#7c3aed]">
              <Cloud size={20} />
            </div>
            <h2 className="text-xl font-bold tracking-tight">Cloud & Database Sync</h2>
          </div>

          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1 p-6 bg-[#0a0a0a] rounded-3xl border border-white/5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black text-[#555] uppercase tracking-widest">Global Ledger Sync</span>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isOfflineMode ? 'bg-[#FF5F56]' : 'bg-[#4ade80] animate-pulse'}`}></div>
                  <span className={`${isOfflineMode ? 'text-[#f87171]' : 'text-[#4ade80]'} text-[10px] font-black uppercase tracking-widest`}>
                    {isOfflineMode ? 'Local Only' : 'Live Sync Active'}
                  </span>
                </div>
              </div>
              <p className="text-xs text-[#888888] leading-relaxed">
                {isOfflineMode 
                  ? 'Your data is strictly saved on this device. Login to enable multi-device mirroring.' 
                  : 'All transactions are currently being mirrored to the secure VyaparSetu cloud vault in real-time.'}
              </p>
            </div>

            <div className="w-full md:w-auto">
              <button 
                onClick={triggerCloudBackup}
                disabled={isBackingUp || isOfflineMode}
                className={`w-full md:w-72 flex items-center justify-center gap-3 py-5 rounded-2xl font-black tracking-widest transition-all shadow-xl active:scale-95 disabled:opacity-30 ${
                  isOfflineMode 
                  ? 'bg-[#252525] text-[#555] cursor-not-allowed' 
                  : 'bg-[#7c3aed] text-white shadow-[#7c3aed]/20 hover:bg-[#6d28d9]'
                }`}
              >
                {isBackingUp ? <RefreshCw size={20} className="animate-spin" /> : <RefreshCw size={20} />}
                {isBackingUp ? 'SYNCING...' : 'FORCE MANUAL SYNC'}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}