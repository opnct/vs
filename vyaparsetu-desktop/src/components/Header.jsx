import React, { useState, useEffect } from 'react';
import { Search, Cloud, User, LogOut, MonitorOff, ChevronDown, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useLanguage } from '../context/LanguageContext';

export default function Header({ user, staff, isOffline }) {
  const { language, setLanguage, t } = useLanguage();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Live Clock Engine
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const displayName = staff?.username || (isOffline ? t('guest_owner') : (user?.email?.split('@')[0] || t('guest_owner')));
  const initials = displayName.substring(0, 2).toUpperCase();

  // Typography Formatting matching Image Reference
  const smallTopDate = currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }); 
  const timeString = currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }); 
  const largeDateString = currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }); 

  const handleAction = async () => {
    if (isOffline) {
      localStorage.removeItem('vs_offline_mode');
      window.dispatchEvent(new Event('storage'));
    } else {
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
    <header className="flex items-center justify-between px-10 py-10 bg-[#0a0a0a] shrink-0 select-none">
      
      {/* 1. LEFT: Oversized Date Typography Hierarchy */}
      <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-left-6 duration-700">
        <span className="text-[10px] font-black text-[#666] tracking-[0.25em] uppercase">
          {timeString} • {smallTopDate}
        </span>
        <div className="flex items-center gap-4 group cursor-pointer">
          <h1 className="text-4xl font-black text-white tracking-tight leading-none">
            {largeDateString}
          </h1>
          <div className="p-1.5 rounded-full bg-[#1c1c1e] text-[#888] group-hover:text-white group-hover:bg-[#252525] transition-all">
            <ChevronDown size={20} strokeWidth={3} />
          </div>
        </div>
      </div>

      {/* 2. MIDDLE: Staff Pills (Resource Roster Style) */}
      <div className="hidden xl:flex items-center gap-4 animate-in fade-in duration-1000 delay-150">
        <div className="flex items-center gap-3 bg-[#1c1c1e] p-1.5 pr-5 rounded-2xl border border-white/5 shadow-lg group cursor-pointer hover:border-[#007AFF]/30 transition-all">
          <div className="w-10 h-10 rounded-xl bg-[#007AFF] flex items-center justify-center text-[11px] font-black text-white tracking-widest shadow-glow-blue">
            {initials}
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-bold text-white leading-tight">{displayName}</span>
            <span className="text-[9px] font-bold text-[#555] uppercase tracking-widest">Active</span>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-transparent p-1.5 pr-5 rounded-2xl border border-dashed border-white/10 opacity-40 hover:opacity-100 hover:bg-[#1c1c1e] transition-all cursor-pointer group">
          <div className="w-10 h-10 rounded-xl bg-[#252525] flex items-center justify-center text-[11px] font-black text-[#444] group-hover:text-[#888] tracking-widest">
            SYS
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-bold text-[#444] group-hover:text-[#888] leading-tight">Terminal</span>
            <span className="text-[9px] font-bold text-[#333] uppercase tracking-widest">Standby</span>
          </div>
        </div>
      </div>

      {/* 3. RIGHT: Search & Utility Dock */}
      <div className="flex items-center gap-5 animate-in fade-in slide-in-from-right-6 duration-700">
        
        {/* Sleek Dark Pill Search */}
        <div className="relative group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555] group-focus-within:text-[#007AFF] transition-colors" />
          <input 
            type="text"
            placeholder="Universal Search..."
            className="w-72 bg-[#252525] hover:bg-[#2a2a2a] py-3.5 pl-12 pr-6 rounded-2xl border border-transparent focus:border-[#007AFF]/50 focus:ring-4 focus:ring-[#007AFF]/10 outline-none text-[14px] font-bold text-white placeholder-[#555] transition-all"
          />
        </div>

        {/* Language Selection Pill */}
        <div className="flex bg-[#1c1c1e] p-1.5 rounded-2xl border border-white/5">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${
                language === lang.code 
                  ? 'bg-[#007AFF] text-white shadow-glow-blue' 
                  : 'text-[#555] hover:text-[#888]'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>

        {/* System Sync State */}
        <div className="flex items-center justify-center w-12 h-12 bg-[#1c1c1e] border border-white/5 rounded-2xl text-[#888] relative">
          {isOffline ? <MonitorOff size={20} className="text-[#FFBD2E]" /> : <Cloud size={20} className="text-[#27C93F]" />}
          <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-[#0a0a0a] ${isOffline ? 'bg-[#FFBD2E]' : 'bg-[#27C93F] animate-pulse'}`}></div>
        </div>

        {/* Auth Toggle */}
        <button 
          onClick={handleAction}
          className="w-12 h-12 bg-[#1c1c1e] border border-white/5 rounded-2xl flex items-center justify-center text-[#888] hover:text-[#FF5F56] hover:bg-[#FF5F56]/10 transition-all relative group overflow-hidden"
        >
          <User size={20} className="group-hover:translate-y-10 transition-all duration-500" />
          <LogOut size={20} className="absolute -top-10 group-hover:top-1/2 group-hover:-translate-y-1/2 transition-all duration-500" />
        </button>

      </div>
    </header>
  );
}