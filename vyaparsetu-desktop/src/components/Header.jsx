import React, { useState, useEffect } from 'react';
import { Search, Cloud, User, LogOut, MonitorOff, Clock } from 'lucide-react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useLanguage } from '../context/LanguageContext';
import PremiumButton from './ui/PremiumButton';

export default function Header({ user, staff, isOffline }) {
  const { language, setLanguage, t } = useLanguage();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Live Clock Engine
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const displayName = staff?.username || (isOffline ? t('guest_owner') : (user?.email?.split('@')[0] || t('guest_owner')));
  
  const smallTopDate = currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }); 
  const timeString = currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }); 

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
    <header className="flex items-center justify-between px-10 py-6 bg-[#000000] border-b border-white/10 shrink-0 select-none">
      
      {/* 1. LEFT: Corporate VyaparSetu Logo */}
      <div className="flex items-center animate-in fade-in slide-in-from-left-6 duration-700">
        <h1 className="text-3xl font-black text-white tracking-tighter">
          VyaparSetu
        </h1>
      </div>

      {/* 2. MIDDLE: Nav-style Corporate Links */}
      <div className="hidden xl:flex items-center gap-8 animate-in fade-in duration-1000 delay-150">
        <div className="flex items-center gap-2 text-sm font-bold text-white hover:text-brand-blue transition-colors cursor-pointer">
          <User size={16} /> <span className="uppercase tracking-widest">{displayName}</span>
        </div>
        <div className="flex items-center gap-2 text-sm font-bold text-gray-400">
          <Clock size={16} /> <span className="uppercase tracking-widest">{timeString} • {smallTopDate}</span>
        </div>
        <div className={`flex items-center gap-2 text-sm font-bold uppercase tracking-widest ${isOffline ? 'text-status-orange' : 'text-brand-green'}`}>
          {isOffline ? <><MonitorOff size={16}/> Local Session</> : <><Cloud size={16}/> Cloud Synced</>}
        </div>
      </div>

      {/* 3. RIGHT: Search, Lang, and Primary Action */}
      <div className="flex items-center gap-6 animate-in fade-in slide-in-from-right-6 duration-700">
        
        {/* Sleek Dark Corporate Search */}
        <div className="relative group hidden md:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-blue transition-colors" />
          <input 
            type="text"
            placeholder="Universal Search..."
            className="w-64 bg-[#111111] hover:bg-[#1a1a1a] py-2.5 pl-10 pr-4 rounded-sm border border-white/10 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none text-sm font-bold text-white placeholder-gray-500 transition-all"
          />
        </div>

        {/* Flat Language Selection Nav */}
        <div className="flex gap-1">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`px-3 py-1.5 rounded-sm text-xs font-black tracking-widest transition-all ${
                language === lang.code 
                  ? 'bg-white text-black' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>

        {/* Primary Auth Action (GET STARTED Style) */}
        <PremiumButton 
          onClick={handleAction}
          variant="primary"
          icon={isOffline ? Cloud : LogOut}
          className="rounded-sm px-8 py-3 text-xs tracking-widest shadow-none border-none"
        >
          {isOffline ? 'GO ONLINE' : 'SYSTEM LOGOUT'}
        </PremiumButton>

      </div>
    </header>
  );
}