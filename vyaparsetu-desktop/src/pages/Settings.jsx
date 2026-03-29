import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Store, Printer, Receipt, Save, CheckCircle2, 
  Usb, FileText, Cloud, Download, ShieldCheck,
  Smartphone, MapPin, Loader2,
  Camera, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { invoke } from '@tauri-apps/api/core';
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

  // Tauri IPC: Fetch Settings
  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await invoke('get_settings').catch(() => null);
      if (data) setSettings(data);
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

  // Tauri IPC: Save Settings
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await invoke('update_settings', { settings });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (error) {
      console.error("Database Update Error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Tauri IPC: Manual Cloud Sync Trigger
  const triggerCloudBackup = async () => {
    if (isOfflineMode) return;
    setIsBackingUp(true);
    try {
      await invoke('sync_offline_pos', { payload: "manual_trigger" });
    } catch (error) {
      console.error("Backup failed:", error);
    } finally {
      setIsBackingUp(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#141414]">
        <Loader2 className="animate-spin text-[#005FA3]" size={48} />
      </div>
    );
  }

  return (
    <div className="max-w-[1000px] mx-auto h-full pb-20 select-none font-sans text-[#FEFFFE] bg-[#141414] p-6">
      
      {/* HEADER: Action Bar */}
      <div className="flex items-center justify-between mb-8 border-b border-[#58595A] pb-6">
        <div className="animate-in fade-in slide-in-from-left-4 duration-500">
          <h1 className="text-3xl font-black tracking-tight uppercase text-[#FEFFFE]">{t('set_title')}</h1>
          <p className="text-[#A6B5C3] text-xs mt-1 font-bold tracking-widest uppercase">{t('set_desc')}</p>
        </div>
        
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className={`px-8 py-3 rounded-sm font-black tracking-widest flex items-center gap-3 transition-colors text-xs uppercase ${
            isSaved 
            ? 'bg-[#DBE9F2] text-[#141414] border border-[#DBE9F2]' 
            : 'bg-[#005FA3] text-[#FEFFFE] border border-[#005FA3] hover:bg-[#141414] hover:text-[#005FA3]'
          }`}
        >
          {isSaving ? <Loader2 className="animate-spin" size={16} /> : isSaved ? <CheckCircle2 size={16} /> : <Save size={16} />}
          {isSaved ? 'SETTINGS SYNCED' : 'SAVE CHANGES'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        
        {/* SECTION 1: Shop Profile & Identity */}
        <div className="bg-[#1D1F20] rounded-sm p-8 border border-[#58595A] relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col md:flex-row gap-10 items-start">
            
            {/* Logo Workspace */}
            <div className="flex flex-col items-center gap-4 shrink-0">
              <div className="relative group">
                <div className="w-32 h-32 rounded-sm bg-[#141414] border border-[#58595A] flex items-center justify-center overflow-hidden transition-colors group-hover:border-[#005FA3]">
                  {settings.logoBase64 ? (
                    <img src={settings.logoBase64} alt="Shop Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Store size={40} className="text-[#58595A]" />
                  )}
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-3 -right-3 w-10 h-10 bg-[#005FA3] text-[#FEFFFE] rounded-sm flex items-center justify-center border border-[#141414] hover:bg-[#DBE9F2] hover:text-[#141414] hover:border-[#005FA3] transition-colors"
                >
                  <Camera size={16} />
                </button>
                <input type="file" ref={fileInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />
              </div>
              <span className="text-[10px] font-black text-[#A6B5C3] uppercase tracking-widest mt-2">Business Brand</span>
            </div>

            {/* Identity Fields */}
            <div className="flex-1 w-full space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-[#141414] border border-[#58595A] rounded-sm flex items-center justify-center text-[#005FA3]">
                  <Store size={16} />
                </div>
                <h2 className="text-lg font-bold tracking-tight text-[#FEFFFE] uppercase">Business Identity</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <PremiumInput 
                  label="Shop Name" 
                  value={settings.shopName} 
                  onChange={(v) => handleInputChange('shopName', v)}
                  placeholder="e.g. VyaparSetu Retail"
                  icon={Store}
                  className="bg-[#141414] border-[#58595A] text-[#FEFFFE] focus:ring-[#005FA3]"
                />
                <PremiumInput 
                  label="Business Phone" 
                  value={settings.phone} 
                  onChange={(v) => handleInputChange('phone', v)}
                  placeholder="+91 00000 00000"
                  icon={Smartphone}
                  className="bg-[#141414] border-[#58595A] text-[#FEFFFE] focus:ring-[#005FA3]"
                />
              </div>
              <PremiumInput 
                label="Billing Address" 
                value={settings.shopAddress} 
                onChange={(v) => handleInputChange('shopAddress', v)}
                placeholder="Complete physical store location..."
                icon={MapPin}
                multiline
                className="bg-[#141414] border-[#58595A] text-[#FEFFFE] focus:ring-[#005FA3]"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: Compliance & Hardware (Grouped) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Tax Compliance Card */}
          <div className="bg-[#1D1F20] rounded-sm p-8 border border-[#58595A] animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 bg-[#141414] border border-[#58595A] rounded-sm flex items-center justify-center text-[#005FA3]">
                <Receipt size={16} />
              </div>
              <h2 className="text-lg font-bold tracking-tight text-[#FEFFFE] uppercase">Compliance & Tax</h2>
            </div>

            <div className="space-y-6">
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
                    <div className="pt-2">
                      <PremiumInput 
                        label="Store GSTIN" 
                        value={settings.gstin} 
                        onChange={(v) => handleInputChange('gstin', v)}
                        placeholder="27AAAAA0000A1Z5"
                        className="bg-[#141414] border-[#58595A] text-[#FEFFFE] focus:ring-[#005FA3]"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button className="w-full flex items-center justify-center gap-3 py-3 bg-[#141414] hover:bg-[#DBE9F2] text-[#A6B5C3] hover:text-[#141414] rounded-sm font-bold border border-[#58595A] hover:border-[#DBE9F2] transition-colors text-xs uppercase tracking-widest mt-4">
                <Download size={16} className="text-[#005FA3] group-hover:text-[#141414]" /> Export GSTR-1 (Excel)
              </button>
            </div>
          </div>

          {/* Printing Card */}
          <div className="bg-[#1D1F20] rounded-sm p-8 border border-[#58595A] animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 bg-[#141414] border border-[#58595A] rounded-sm flex items-center justify-center text-[#005FA3]">
                <Printer size={16} />
              </div>
              <h2 className="text-lg font-bold tracking-tight text-[#FEFFFE] uppercase">Printing System</h2>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#A6B5C3] uppercase tracking-[0.2em] flex items-center gap-2">
                  <Usb size={14}/> Thermal Printer Port
                </label>
                <div className="relative">
                  <select 
                    value={settings.printerPort} 
                    onChange={(e) => handleInputChange('printerPort', e.target.value)} 
                    className="w-full bg-[#141414] p-3 rounded-sm border border-[#58595A] text-[#FEFFFE] text-sm font-bold focus:border-[#005FA3] outline-none cursor-pointer transition-colors appearance-none"
                  >
                    <option value="USB001">Auto-Detect USB (Recommended)</option>
                    <option value="COM1">Serial Port COM1</option>
                    <option value="LPT1">Parallel Port LPT1</option>
                    <option value="NETWORK">Network / IP Printer</option>
                  </select>
                </div>
              </div>

              <PremiumInput 
                label="Receipt Footer Note" 
                value={settings.receiptFooter} 
                onChange={(v) => handleInputChange('receiptFooter', v)}
                placeholder="Thank you for shopping with us!"
                icon={FileText}
                className="bg-[#141414] border-[#58595A] text-[#FEFFFE] focus:ring-[#005FA3]"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: System & Cloud */}
        <div className="bg-[#1D1F20] rounded-sm p-8 border border-[#58595A] animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-[#141414] border border-[#58595A] rounded-sm flex items-center justify-center text-[#005FA3]">
              <Cloud size={16} />
            </div>
            <h2 className="text-lg font-bold tracking-tight text-[#FEFFFE] uppercase">Cloud & Database Sync</h2>
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="flex-1 p-5 bg-[#141414] rounded-sm border border-[#58595A]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black text-[#A6B5C3] uppercase tracking-widest">Global Ledger Sync</span>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-sm ${isOfflineMode ? 'bg-[#58595A]' : 'bg-[#005FA3] animate-pulse'}`}></div>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${isOfflineMode ? 'text-[#58595A]' : 'text-[#005FA3]'}`}>
                    {isOfflineMode ? 'Local Only' : 'Live Sync Active'}
                  </span>
                </div>
              </div>
              <p className="text-xs text-[#A6B5C3] leading-relaxed font-medium">
                {isOfflineMode 
                  ? 'Your data is strictly saved on this device. Login to enable multi-device mirroring.' 
                  : 'All transactions are currently being mirrored to the secure VyaparSetu cloud vault in real-time.'}
              </p>
            </div>

            <div className="w-full md:w-auto shrink-0">
              <button 
                onClick={triggerCloudBackup}
                disabled={isBackingUp || isOfflineMode}
                className={`w-full md:w-64 flex items-center justify-center gap-2 py-4 rounded-sm font-black tracking-widest transition-colors text-xs uppercase border ${
                  isOfflineMode 
                  ? 'bg-[#141414] text-[#58595A] border-[#58595A] cursor-not-allowed' 
                  : 'bg-[#005FA3] text-[#FEFFFE] border-[#005FA3] hover:bg-[#141414] hover:text-[#005FA3]'
                }`}
              >
                {isBackingUp ? <RefreshCw size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                {isBackingUp ? 'SYNCING...' : 'FORCE MANUAL SYNC'}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}