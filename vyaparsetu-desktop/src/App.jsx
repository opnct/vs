import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { 
  Calculator, HardDrive, BookOpen, Bot, ScanLine, 
  Globe, ShieldCheck, WifiOff, Printer, DownloadCloud, 
  ChevronRight, Activity, Terminal
} from 'lucide-react';

// --- TRANSLATION DICTIONARY (Real Content) ---
const translations = {
  en: {
    appTitle: "VyaparSetu Retail Desk",
    tier: "Active Plan: Kirana Starter",
    pos: "POS Billing",
    hardware: "Devices & Hardware",
    khata: "Smart Khata",
    bot: "VyaparBot AI",
    cctv: "CCTV Scanner",
    offline: "System Offline - Local Mode Active",
    printBtn: "Print Thermal Receipt",
    syncBtn: "Force Cloud Sync",
    scanPrompt: "SCAN BARCODE OR TYPE ITEM CODE...",
    invoiceTitle: "Current Invoice Total",
    rustLogs: "Tauri Rust Backend Logs"
  },
  hi: {
    appTitle: "व्यापारसेतु रिटेल डेस्क",
    tier: "सक्रिय प्लान: किराना स्टार्टर",
    pos: "पीओएस बिलिंग (POS)",
    hardware: "हार्डवेयर और डिवाइस",
    khata: "स्मार्ट खाता",
    bot: "व्यापारबॉट एआई (AI)",
    cctv: "सीसीटीवी स्कैनर",
    offline: "सिस्टम ऑफ़लाइन - लोकल मोड सक्रिय",
    printBtn: "थर्मल रसीद प्रिंट करें",
    syncBtn: "क्लाउड सिंक करें",
    scanPrompt: "बारकोड स्कैन करें या आइटम कोड टाइप करें...",
    invoiceTitle: "वर्तमान चालान कुल (Invoice Total)",
    rustLogs: "टौरी रस्ट बैकएंड लॉग्स"
  },
  mr: {
    appTitle: "व्यापारसेतू रिटेल डेस्क",
    tier: "सक्रिय प्लॅन: किराणा स्टार्टर",
    pos: "पीओएस बिलिंग (POS)",
    hardware: "हार्डवेअर आणि डिव्हाइसेस",
    khata: "स्मार्ट खाते",
    bot: "व्यापारबॉट एआय (AI)",
    cctv: "सीसीटीव्ही स्कॅनर",
    offline: "सिस्टम ऑफलाइन - लोकल मोड सक्रिय",
    printBtn: "थर्मल पावती प्रिंट करा",
    syncBtn: "क्लाउड सिंक करा",
    scanPrompt: "बारकोड स्कॅन करा किंवा आयटम कोड टाइप करा...",
    invoiceTitle: "चालू बिलाची एकूण रक्कम (Invoice Total)",
    rustLogs: "टौरी रस्ट बॅकएंड लॉग्स"
  }
};

export default function App() {
  const [lang, setLang] = useState('en');
  const [activeTab, setActiveTab] = useState('pos');
  const [sysLog, setSysLog] = useState('OS Initialized. System Boot Sequence Complete.');
  const [isSyncing, setIsSyncing] = useState(false);
  
  const t = translations[lang];

  // Hardware Command execution via Rust Backend
  const handlePrintReceipt = async () => {
    try {
      setSysLog('Dispatching ESC/POS command to hardware...');
      // Communicates securely with Rust
      const response = await invoke('print_receipt', { receiptData: "BILL_001 | TOTAL: 540 INR" });
      setSysLog(response);
    } catch (error) {
      setSysLog(`Printer Error: ${error}`);
    }
  };

  const handleCloudSync = async () => {
    setIsSyncing(true);
    setSysLog('Initiating secure SQLite-to-Firebase sync...');
    try {
      const response = await invoke('sync_offline_pos', { payload: "15 Pending Invoices" });
      setTimeout(() => {
        setSysLog(response);
        setIsSyncing(false);
      }, 1000); // Simulated delay for visual feedback
    } catch (error) {
      setSysLog(`Sync Failed: ${error}`);
      setIsSyncing(false);
    }
  };

  // Standard Modules Configuration (Tier Locking logic handled here)
  const modules = [
    { id: 'pos', name: t.pos, icon: Calculator, locked: false },
    { id: 'khata', name: t.khata, icon: BookOpen, locked: false },
    { id: 'hardware', name: t.hardware, icon: HardDrive, locked: false },
    { id: 'bot', name: t.bot, icon: Bot, locked: false },
    { id: 'cctv', name: t.cctv, icon: ScanLine, locked: true } // Locked based on Starter Tier
  ];

  return (
    <div className="flex h-screen w-full bg-[#0a0a0a] text-white font-sans overflow-hidden selection:bg-[#0d6efd] selection:text-white">
      
      {/* 1. SIDEBAR NAVIGATION */}
      <div className="w-72 bg-[#0d0d0d] border-r border-[#222] flex flex-col shrink-0 relative z-20 shadow-2xl">
        <div className="p-6 border-b border-[#222] bg-[#111]">
          <h1 className="text-xl font-black tracking-tighter uppercase text-[#0d6efd] flex items-center gap-2">
            <Activity size={20} /> {t.appTitle}
          </h1>
          <p className="text-[10px] text-gray-500 font-mono mt-2 tracking-widest uppercase border border-[#333] inline-block px-2 py-1 rounded-sm bg-[#1a1a1a]">
            {t.tier}
          </p>
        </div>

        <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          {modules.map((mod) => (
            <button
              key={mod.id}
              onClick={() => !mod.locked && setActiveTab(mod.id)}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-sm transition-all border ${
                activeTab === mod.id 
                  ? 'bg-[#0d6efd] text-white border-[#0d6efd] shadow-[0_0_15px_rgba(13,110,253,0.3)]' 
                  : mod.locked 
                    ? 'opacity-40 cursor-not-allowed text-gray-600 border-transparent bg-transparent' 
                    : 'text-gray-400 hover:bg-[#1a1a1a] hover:text-white hover:border-[#333] border-transparent'
              }`}
            >
              <div className="flex items-center gap-3 text-xs font-black tracking-widest uppercase">
                <mod.icon size={18} className={activeTab === mod.id ? 'text-white' : 'text-gray-500'} /> 
                {mod.name}
              </div>
              {mod.locked && <ShieldCheck size={14} className="text-red-900" />}
            </button>
          ))}
        </div>

        {/* LANGUAGE SWITCHER */}
        <div className="p-5 border-t border-[#222] bg-[#111]">
          <div className="flex items-center gap-2 mb-3 text-[10px] font-black uppercase text-gray-500 tracking-widest">
            <Globe size={12} className="text-[#0d6efd]"/> Interface Translation
          </div>
          <select 
            value={lang} 
            onChange={(e) => setLang(e.target.value)}
            className="w-full bg-black border border-[#333] text-white text-xs font-bold p-3 uppercase tracking-wider focus:outline-none focus:border-[#0d6efd] cursor-pointer"
          >
            <option value="en">English (EN)</option>
            <option value="hi">हिंदी (HI)</option>
            <option value="mr">मराठी (MR)</option>
          </select>
        </div>
      </div>

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col bg-[#050505] overflow-hidden relative">
        
        {/* Top Status Bar */}
        <div className="h-12 shrink-0 bg-[#0a0a0a] border-b border-[#222] flex items-center justify-between px-8">
          <div className="flex items-center gap-2 text-[10px] font-black tracking-widest uppercase text-red-500 bg-red-500/10 px-3 py-1 border border-red-500/20 rounded-sm">
            <WifiOff size={14} /> {t.offline}
          </div>
          <div className="text-[10px] text-gray-500 font-mono tracking-widest uppercase flex items-center gap-2">
            <Terminal size={12}/> Press <span className="text-white font-bold bg-[#222] px-1 rounded">CTRL + SPACE</span> for Global VyaparBot
          </div>
        </div>

        {/* Dynamic Module Rendering Area */}
        <div className="flex-1 p-8 lg:p-12 overflow-y-auto">
          <h2 className="text-3xl font-black uppercase tracking-tighter text-white mb-8 border-b border-[#222] pb-6">
            {modules.find(m => m.id === activeTab)?.name}
          </h2>

          {/* === MODULE: POS BILLING === */}
          {activeTab === 'pos' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
              <div className="col-span-1 lg:col-span-2 bg-[#111] border border-[#222] p-8 rounded-sm shadow-xl flex flex-col">
                <div className="text-[10px] text-[#0d6efd] uppercase tracking-[0.3em] font-black mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#0d6efd] rounded-full animate-pulse"></span> Barcode Scanner Input Ready
                </div>
                <input 
                  type="text" 
                  placeholder={t.scanPrompt} 
                  className="w-full bg-[#1a1a1a] border-2 border-[#333] p-6 text-white font-mono text-xl focus:outline-none focus:border-[#0d6efd] transition-colors shadow-inner"
                  autoFocus
                />
                
                {/* Empty Cart Placeholder */}
                <div className="flex-1 border-2 border-dashed border-[#222] mt-6 flex items-center justify-center text-gray-600 font-mono text-sm uppercase tracking-widest">
                  [ Cart is Empty - Awaiting Scan ]
                </div>
              </div>

              <div className="col-span-1 bg-[#111] border border-[#222] p-8 rounded-sm shadow-xl flex flex-col justify-between min-h-[400px]">
                <div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-[0.3em] font-black mb-4">{t.invoiceTitle}</div>
                  <div className="text-6xl font-black text-white tracking-tighter border-b border-[#333] pb-6">₹0.00</div>
                  <div className="mt-6 space-y-3">
                    <div className="flex justify-between text-xs font-bold text-gray-500 uppercase"><span className="tracking-widest">Subtotal</span> <span>₹0.00</span></div>
                    <div className="flex justify-between text-xs font-bold text-gray-500 uppercase"><span className="tracking-widest">GST (18%)</span> <span>₹0.00</span></div>
                  </div>
                </div>
                <button 
                  onClick={handlePrintReceipt}
                  className="w-full bg-[#0d6efd] hover:bg-[#0b5ed7] text-white font-black uppercase tracking-widest py-5 flex items-center justify-center gap-3 transition-colors mt-8 shadow-[0_0_20px_rgba(13,110,253,0.2)] hover:shadow-[0_0_30px_rgba(13,110,253,0.4)]"
                >
                  <Printer size={20} /> {t.printBtn}
                </button>
              </div>
            </div>
          )}

          {/* === MODULE: HARDWARE DEVICES === */}
          {activeTab === 'hardware' && (
            <div className="space-y-6 max-w-3xl">
              <div className="bg-[#111] border border-[#222] p-8 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:border-[#333] transition-colors">
                <div className="flex items-center gap-6">
                  <div className="bg-[#1a1a1a] p-4 border border-[#333]"><Printer size={24} className="text-white"/></div>
                  <div>
                    <h3 className="font-bold uppercase tracking-widest text-white text-lg">Thermal Receipt Printer</h3>
                    <p className="text-xs text-[#0d6efd] mt-1 uppercase font-mono tracking-wider">USB / LPT1 Port Direct Access</p>
                  </div>
                </div>
                <span className="bg-green-500/10 text-green-500 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] border border-green-500/20 w-max shadow-[0_0_10px_rgba(34,197,94,0.1)]">Connected Online</span>
              </div>

              <div className="bg-[#111] border border-[#222] p-8 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:border-[#333] transition-colors opacity-70">
                <div className="flex items-center gap-6">
                  <div className="bg-[#1a1a1a] p-4 border border-[#333]"><Activity size={24} className="text-gray-500"/></div>
                  <div>
                    <h3 className="font-bold uppercase tracking-widest text-gray-400 text-lg">IoT Weighing Scale</h3>
                    <p className="text-xs text-gray-600 mt-1 uppercase font-mono tracking-wider">COM3 / Serial Port Protocol</p>
                  </div>
                </div>
                <span className="bg-red-500/10 text-red-500 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] border border-red-500/20 w-max shadow-[0_0_10px_rgba(239,68,68,0.1)]">Disconnected</span>
              </div>
            </div>
          )}

          {/* === MODULE: SMART KHATA === */}
          {activeTab === 'khata' && (
            <div className="bg-[#111] border border-[#222] p-12 rounded-sm h-[60vh] flex flex-col justify-center items-center text-center shadow-xl">
              <div className="w-24 h-24 bg-[#1a1a1a] rounded-full border-2 border-[#333] flex items-center justify-center mb-8 relative">
                <BookOpen size={40} className="text-[#0d6efd]" />
                {isSyncing && <div className="absolute inset-0 border-t-2 border-[#0d6efd] rounded-full animate-spin"></div>}
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tighter text-white mb-4">Local SQLite Khata Active</h3>
              <p className="text-gray-400 text-sm max-w-lg mx-auto mb-10 leading-relaxed font-light tracking-wide">
                All ledger entries and customer dues are currently being saved to the local Windows C: Drive. Cloud synchronization will resume automatically when a stable network connection is restored.
              </p>
              <button 
                onClick={handleCloudSync}
                disabled={isSyncing}
                className="bg-transparent border-2 border-[#0d6efd] text-[#0d6efd] hover:bg-[#0d6efd] hover:text-white font-black py-4 px-10 uppercase tracking-[0.2em] text-[11px] flex items-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <DownloadCloud size={18} /> 
                {isSyncing ? 'SYNCING DATABASE...' : t.syncBtn}
              </button>
            </div>
          )}
          
          {/* === MODULE: VYAPARBOT AI === */}
          {activeTab === 'bot' && (
             <div className="bg-[#111] border border-[#222] p-12 rounded-sm h-[60vh] flex flex-col justify-center items-center text-center shadow-xl">
               <Bot size={64} className="text-gray-600 mb-6" />
               <h3 className="text-2xl font-black uppercase tracking-tighter text-white mb-2">VyaparBot Terminal</h3>
               <p className="text-gray-500 text-sm max-w-md mx-auto font-mono tracking-widest uppercase mb-8">
                 Awaiting query input...
               </p>
               <div className="text-[10px] text-gray-500 font-bold tracking-[0.2em] uppercase bg-[#1a1a1a] border border-[#333] px-4 py-2">
                 Hint: Use <span className="text-white">CTRL + SPACE</span> to open anywhere.
               </div>
             </div>
          )}

        </div>

        {/* 3. RUST SYSTEM LOG TERMINAL */}
        <div className="h-48 shrink-0 bg-[#000] border-t border-[#222] p-6 font-mono overflow-y-auto relative z-10">
          <div className="text-[#0d6efd] text-[10px] font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
            <Terminal size={14}/> {t.rustLogs}
          </div>
          <div className="text-xs text-gray-300 flex items-start gap-3 bg-[#0a0a0a] p-3 border border-[#111] rounded-sm">
            <ChevronRight size={16} className="text-green-500 mt-0 shrink-0" />
            <span className="leading-relaxed break-all">{sysLog}</span>
          </div>
        </div>
      </div>

    </div>
  );
}