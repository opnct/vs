import React, { useState, useEffect } from 'react';
import { Search, Cloud, User, LogOut, MonitorOff, ChevronDown, Users } from 'lucide-react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useLanguage } from '../context/LanguageContext';

export default function Header({ user, staff, isOffline }) {
  const { language, setLanguage, t } = useLanguage();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Live Clock Update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Handle display name & initials localized
  const displayName = staff?.username || (isOffline ? t('guest_owner') : (user?.email?.split('@')[0] || t('guest_owner')));
  const initials = displayName.substring(0, 2).toUpperCase();

  // Formatting identical to the reference images
  const smallTopDate = currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }); // Mon Jun 3
  const timeString = currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }); // 9:41 AM
  const largeDateString = currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }); // Wednesday, October 14

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
    <header className="flex items-center justify-between px-8 py-8 bg-brand-dark shrink-0 select-none">
      
      {/* 1. LEFT: Premium Date & Time Typography */}
      <div className="flex flex-col gap-1 animate-in fade-in slide-in-from-left-4 duration-500">
        <span className="text-[11px] font-bold text-[#888888] tracking-widest uppercase">
          {timeString} • {smallTopDate}
        </span>
        <div className="flex items-center gap-3 cursor-pointer group">
          <h1 className="text-3xl font-bold text-white tracking-tight">{largeDateString}</h1>
          <ChevronDown size={22} className="text-[#888888] group-hover:text-white transition-colors" />
        </div>
      </div>

      {/* 2. MIDDLE: Staff Profile Pills (Mimicking Appointments Roster) */}
      <div className="hidden lg:flex items-center gap-3 animate-in fade-in duration-700">
        <div className="flex items-center justify-center w-11 h-11 rounded-2xl border border-white/5 text-[#888888]">
          <Users size={18} />
        </div>
        
        {/* Active Staff Pill */}
        <div className="flex items-center gap-3 bg-[#1c1c1e] px-2 py-2 rounded-2xl border border-brand-blue/30 cursor-pointer shadow-glow-blue transition-all relative">
          <div className="w-8 h-8 rounded-xl bg-brand-blue flex items-center justify-center text-[10px] font-black text-white tracking-widest">
            {initials}
          </div>
          <span className="text-[13px] font-bold text-white pr-3">{displayName}</span>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-mac-green rounded-full border-2 border-[#1c1c1e]"></div>
        </div>

        {/* Inactive Staff Pill (Visual styling placeholder matching image) */}
        <div className="flex items-center gap-3 bg-transparent px-2 py-2 rounded-2xl border border-transparent cursor-pointer hover:bg-[#1c1c1e] hover:border-white/5 transition-all opacity-50 hover:opacity-100">
          <div className="w-8 h-8 rounded-xl bg-[#2a2a2a] flex items-center justify-center text-[10px] font-black text-[#A1A1AA] tracking-widest">
            SK
          </div>
          <span className="text-[13px] font-bold text-[#A1A1AA] pr-3">System</span>
        </div>
      </div>

      {/* 3. RIGHT: Actions, Search, & Sync */}
      <div className="flex items-center gap-4 animate-in fade-in slide-in-from-right-4 duration-500">
        
        {/* Dark Pill Search Bar */}
        <div className="flex items-center gap-2 bg-[#252525] px-4 py-3 rounded-2xl border border-white/5 focus-within:border-brand-blue/50 focus-within:shadow-glow-blue transition-all w-64 group">
          <Search size={16} className="text-[#888888] group-focus-within:text-brand-blue transition-colors" />
          <input 
            type="text"
            placeholder={t('search_placeholder')}
            className="bg-transparent border-none outline-none text-[13px] text-white placeholder-[#555] w-full font-medium"
          />
        </div>

        {/* Language Pill Options */}
        <div className="flex items-center bg-[#252525] p-1 rounded-2xl border border-white/5">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`px-3 py-2 rounded-xl text-[10px] font-black transition-all uppercase ${
                language === lang.code 
                  ? 'bg-brand-blue text-white shadow-glow-blue' 
                  : 'text-[#888888] hover:text-white'
              }`}
            >
              {lang.code}
            </button>
          ))}
        </div>

        {/* Sync Status Button */}
        <div 
          className="flex items-center justify-center w-11 h-11 rounded-2xl bg-[#252525] border border-white/5 text-[#888888]"
          title={isOffline ? t('local_only') : t('synced')}
        >
          {isOffline ? <MonitorOff size={18} className="text-status-orange" /> : <Cloud size={18} className="text-mac-green" />}
        </div>

        {/* Logout Button */}
        <button 
          onClick={handleAction}
          className="w-11 h-11 rounded-2xl bg-[#252525] border border-white/5 flex items-center justify-center hover:bg-mac-red/10 hover:text-mac-red hover:border-mac-red/20 transition-all text-[#888888] group relative overflow-hidden"
          title={isOffline ? "Exit Guest Mode" : "Log Out"}
        >
          <User size={18} className="group-hover:translate-y-10 transition-all duration-300" />
          <LogOut size={18} className="absolute -top-10 group-hover:top-1/2 group-hover:-translate-y-1/2 transition-all duration-300" />
        </button>

      </div>
    </header>
  );
}