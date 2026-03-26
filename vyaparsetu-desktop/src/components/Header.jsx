import React from 'react';
import { Search, Cloud, User, LogOut, MonitorOff, Globe } from 'lucide-react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useLanguage } from '../context/LanguageContext';

export default function Header({ user, isOffline }) {
  const { language, setLanguage, t } = useLanguage();

  // Handle display name localization
  const displayName = isOffline ? t('guest_owner') : (user?.email?.split('@')[0] || t('guest_owner'));

  const handleAction = async () => {
    if (isOffline) {
      // Exit Guest Mode
      localStorage.removeItem('vs_offline_mode');
      window.dispatchEvent(new Event('storage'));
    } else {
      // Standard Firebase Logout
      try {
        await signOut(auth);
      } catch (error) {
        console.error("Error logging out:", error);
      }
    }
  };

  const languages = [
    { code: 'en', label: 'EN' },
    { code: 'hi', label: 'HI' },
    { code: 'mr', label: 'MR' }
  ];

  return (
    <header className="flex items-center justify-between px-8 py-6 bg-brand-dark shrink-0 border-b border-white/5">
      
      {/* 1. GREETING (Left side context) */}
      <div className="animate-in fade-in slide-in-from-left-4 duration-500">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-semibold text-white tracking-tight capitalize">
            {language === 'en' ? 'Hello' : language === 'hi' ? 'नमस्ते' : 'नमस्कार'}, {displayName}
          </h2>
          {isOffline && (
            <span className="bg-status-orange/10 text-status-orange text-[10px] font-bold px-2 py-0.5 rounded-md border border-status-orange/20 uppercase tracking-tighter">
              {t('offline_badge')}
            </span>
          )}
        </div>
        <p className="text-[#A1A1AA] text-sm mt-0.5 font-medium">
          {isOffline ? t('set_cloud_offline_msg') : t('set_cloud_online_msg')}
        </p>
      </div>

      {/* 2. ACTIONS & STATUS (Right side) */}
      <div className="flex items-center gap-6">
        
        {/* Language Switcher Dropdown/Pill */}
        <div className="flex items-center bg-[#252525] p-1 rounded-xl border border-white/5">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-black transition-all ${
                language === lang.code 
                  ? 'bg-brand-blue text-white shadow-lg' 
                  : 'text-[#666] hover:text-[#A1A1AA]'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>

        {/* Dark Pill Search Bar */}
        <div className="flex items-center gap-2 bg-[#252525] px-4 py-2.5 rounded-full border border-white/5 focus-within:border-brand-blue/30 transition-all w-72 group">
          <Search size={18} className="text-[#A1A1AA] group-focus-within:text-brand-blue transition-colors" />
          <input 
            type="text"
            placeholder={t('search_placeholder')}
            className="bg-transparent border-none outline-none text-[15px] text-white placeholder-[#555] w-full font-medium"
          />
        </div>

        {/* Profile & Cloud Sync Status */}
        <div className="flex items-center gap-4 pl-2 border-l border-white/10">
          
          <div className="flex flex-col items-end">
            <span className="text-[13px] font-semibold text-white capitalize">{displayName}</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              {isOffline ? (
                <>
                  <MonitorOff size={12} className="text-status-orange" />
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-status-orange"></span>
                    <span className="text-[10px] text-status-orange uppercase tracking-widest font-bold">
                      {t('local_only')}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <Cloud size={12} className="text-mac-green" />
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-mac-green animate-pulse shadow-[0_0_8px_#50e3c2]"></span>
                    <span className="text-[10px] text-mac-green uppercase tracking-widest font-bold">
                      {t('synced')}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* Avatar & Action Button */}
          <button 
            onClick={handleAction}
            className="w-10 h-10 rounded-full bg-[#252525] border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all text-white group relative overflow-hidden"
            title={isOffline ? "Exit Guest Mode" : "Log Out"}
          >
            <User size={18} className="group-hover:translate-y-10 transition-all duration-300" />
            <LogOut size={18} className="absolute -top-10 group-hover:top-1/2 group-hover:-translate-y-1/2 text-mac-red transition-all duration-300" />
          </button>

        </div>
      </div>
      
    </header>
  );
}