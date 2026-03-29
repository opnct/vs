import React, { useState, useEffect, useCallback } from 'react';
import { 
  Store, Printer, Receipt, Save, CheckCircle2, 
  Usb, FileText, Cloud, Download, ShieldCheck,
  Smartphone, MapPin, Info, RefreshCw, Loader2
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Settings() {
  const { t } = useLanguage();
  
  // Detect offline mode from local state
  const isOfflineMode = localStorage.getItem('vs_offline_mode') === 'true';

  // Real Database-backed state
  const [settings, setSettings] = useState({
    shopName: "",
    shopAddress: "",
    phone: "",
    gstEnabled: false,
    gstin: "",
    printerPort: "USB001",
    receiptFooter: ""
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);

  // 1. Fetch real settings from SQLite via Electron IPC
  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // SAFETY CHECK: Verify Electron API is available
      let data = null;
      if (window.electronAPI) {
        data = await window.electronAPI.invoke('get_settings');
      } else {
        console.warn("Running in standard browser. Electron API unavailable.");
      }
      
      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error("Failed to load settings from SQLite:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setIsSaved(false);
  };

  // 2. Persist to SQLite Database via Electron IPC
  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (window.electronAPI) {
        await window.electronAPI.invoke('update_settings', { settings });
      } else {
        console.log("Browser mode: Settings save simulated.");
      }
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
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

  const exportGSTR1 = async () => {
    try {
      if (window.electronAPI) {
        await window.electronAPI.invoke('export_gst_report');
      }
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="animate-spin text-brand-blue" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto h-full pb-10 select-none font-sans">
      
      {/* Header with Production Save Trigger */}
      <div className="flex items-center justify-between mb-10">
        <div className="animate-in fade-in slide-in-from-left-4 duration-500">
          <h1 className="text-3xl font-bold text-white tracking-tight">{t('set_title')}</h1>
          <p className="text-[#A1A1AA] text-sm mt-1 font-medium">{t('set_desc')}</p>
        </div>
        
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className={`px-8 py-4 rounded-2xl font-black tracking-widest flex items-center gap-3 transition-all active:scale-95 shadow-2xl ${
            isSaved 
            ? 'bg-mac-green text-white shadow-mac-green/20' 
            : 'bg-brand-blue text-white shadow-brand-blue/20 hover:bg-brand-blue/80'
          }`}
        >
          {isSaving ? <Loader2 className="animate-spin" size={20} /> : isSaved ? <CheckCircle2 size={20} /> : <Save size={20} />}
          {isSaved ? t('set_synced') : t('set_commit')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* IDENTITY & PORTS */}
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <div className="bg-brand-surface rounded-[2.5rem] p-8 border border-white/5 shadow-xl relative overflow-hidden">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-brand-blue/10 rounded-2xl flex items-center justify-center text-brand-blue border border-brand-blue/20">
                <Store size={24} />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">{t('set_identity')}</h2>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#555] uppercase tracking-[0.2em] ml-1">{t('set_shop_name')}</label>
                <input name="shopName" value={settings.shopName} onChange={handleChange} className="w-full bg-brand-dark p-4 rounded-2xl border border-white/5 text-white font-bold focus:border-brand-blue outline-none transition-all" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#555] uppercase tracking-[0.2em] ml-1">{t('set_address')}</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-4 text-[#333]" size={18} />
                  <textarea name="shopAddress" value={settings.shopAddress} onChange={handleChange} rows="2" className="w-full bg-brand-dark p-4 pl-12 rounded-2xl border border-white/5 text-white font-bold focus:border-brand-blue outline-none resize-none transition-all"></textarea>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#555] uppercase tracking-[0.2em] ml-1">{t('set_phone')}</label>
                <div className="relative">
                  <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#333]" size={18} />
                  <input name="phone" value={settings.phone} onChange={handleChange} className="w-full bg-brand-dark p-4 pl-12 rounded-2xl border border-white/5 text-white font-bold focus:border-brand-blue outline-none transition-all" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-brand-surface rounded-[2.5rem] p-8 border border-white/5 shadow-xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-mac-yellow/10 rounded-2xl flex items-center justify-center text-mac-yellow border border-mac-yellow/20">
                <Printer size={24} />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">{t('set_hardware')}</h2>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#555] uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                  <Usb size={14}/> {t('set_port')}
                </label>
                <select name="printerPort" value={settings.printerPort} onChange={handleChange} className="w-full bg-brand-dark p-4 rounded-2xl border border-white/5 text-white font-bold focus:border-brand-blue outline-none cursor-pointer">
                  <option value="USB001">Auto-Detect USB</option>
                  <option value="COM1">COM1 (Serial)</option>
                  <option value="COM2">COM2 (Serial)</option>
                  <option value="LPT1">LPT1 (Parallel)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#555] uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                  <FileText size={14}/> {t('set_footer')}
                </label>
                <input name="receiptFooter" value={settings.receiptFooter} onChange={handleChange} className="w-full bg-brand-dark p-4 rounded-2xl border border-white/5 text-white font-medium focus:border-brand-blue outline-none" />
              </div>
            </div>
          </div>

        </div>

        {/* TAX & CLOUD */}
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
          
          <div className="bg-brand-surface rounded-[2.5rem] p-8 border border-white/5 shadow-xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-mac-red/10 rounded-2xl flex items-center justify-center text-mac-red border border-mac-red/20">
                <Receipt size={24} />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">{t('set_compliance')}</h2>
            </div>

            <div className="space-y-6">
              <label className="flex items-center justify-between p-5 bg-brand-dark/50 rounded-3xl border border-white/5 cursor-pointer hover:bg-white/5 transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${settings.gstEnabled ? 'bg-mac-green/10 text-mac-green' : 'bg-[#111] text-[#333]'}`}>
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{t('set_gst_active')}</p>
                    <p className="text-[9px] font-black text-[#444] mt-0.5 uppercase tracking-widest">{t('set_gst_desc')}</p>
                  </div>
                </div>
                <input type="checkbox" name="gstEnabled" checked={settings.gstEnabled} onChange={handleChange} className="w-6 h-6 accent-mac-green" />
              </label>

              {settings.gstEnabled && (
                <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                  <label className="text-[10px] font-black text-mac-yellow uppercase tracking-[0.2em] ml-1">{t('set_gstin')}</label>
                  <input name="gstin" value={settings.gstin} onChange={handleChange} placeholder="e.g. 27AAAAA0000A1Z5" className="w-full bg-brand-dark p-4 rounded-2xl border border-mac-yellow/20 text-mac-yellow font-black focus:border-mac-yellow outline-none uppercase tracking-widest" />
                  <div className="flex items-center gap-2 mt-2 px-1">
                    <Info size={12} className="text-[#333]" />
                    <span className="text-[9px] font-bold text-[#333] uppercase tracking-widest">Validated for GSTR-1 Exports</span>
                  </div>
                </div>
              )}

              <button 
                onClick={exportGSTR1}
                className="w-full flex items-center justify-center gap-3 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold border border-white/10 transition-all text-sm uppercase tracking-widest active:scale-95"
              >
                <Download size={18} className="text-mac-green" /> {t('set_download_gstr')}
              </button>
            </div>
          </div>

          <div className="bg-brand-surface rounded-[2.5rem] p-8 border border-white/5 shadow-xl relative overflow-hidden">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-status-purple/10 rounded-2xl flex items-center justify-center text-status-purple border border-status-purple/20">
                <Cloud size={24} />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">{t('set_cloud_status')}</h2>
            </div>

            <div className="p-6 bg-brand-dark/50 rounded-3xl border border-white/5 mb-6">
               <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black text-[#555] uppercase tracking-widest">Ledger Mirroring</span>
                  <span className={`${isOfflineMode ? 'text-status-orange' : 'text-mac-green'} text-[10px] font-black uppercase tracking-widest`}>
                    {isOfflineMode ? t('offline_badge') : t('set_cloud_active')}
                  </span>
               </div>
               <p className="text-xs text-[#A1A1AA] leading-relaxed">
                 {isOfflineMode 
                    ? t('set_cloud_offline_msg') 
                    : t('set_cloud_online_msg')}
               </p>
            </div>

            {!isOfflineMode ? (
              <button 
                onClick={triggerCloudBackup}
                disabled={isBackingUp}
                className="w-full flex items-center justify-center gap-3 py-5 bg-status-purple text-white rounded-2xl font-black tracking-widest hover:bg-status-purple/80 transition-all shadow-xl shadow-status-purple/20 active:scale-95 disabled:opacity-50"
              >
                {isBackingUp ? <RefreshCw size={20} className="animate-spin" /> : <Cloud size={20} />}
                {isBackingUp ? 'FORCING SYNC...' : t('set_force_sync')}
              </button>
            ) : (
              <div className="w-full py-4 px-6 bg-status-orange/10 border border-status-orange/20 rounded-2xl flex items-center gap-3 text-status-orange text-xs font-bold uppercase tracking-widest">
                <Info size={16} />
                {t('local_only')}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}