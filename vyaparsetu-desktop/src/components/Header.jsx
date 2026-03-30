import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useLanguage } from '../context/LanguageContext';

const TopNavButton = ({ shortcut, label, onClick }) => (
  <button 
    onClick={onClick} 
    className="flex items-center gap-0.5 text-tally-headerText hover:text-white transition-colors cursor-pointer outline-none text-[13px]"
  >
    <span className="underline decoration-1 underline-offset-[3px] font-bold">{shortcut}</span>
    <span>:</span>
    <span className="ml-0.5">{label}</span>
  </button>
);

export default function Header({ user, staff, isOffline }) {
  const { language, setLanguage } = useLanguage();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Live Clock Engine
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const displayName = staff?.username || (user?.email?.split('@')[0] || 'GUEST');
  
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

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  return (
    <header className="flex flex-col w-full shrink-0 select-none font-sans">
      
      {/* 1. TOP TIER: Dark Blue Main Navigation */}
      <div className="bg-tally-darkBlue flex items-center justify-between px-4 py-1.5 min-h-[40px]">
        
        <div className="flex items-center gap-10">
          {/* Logo Mimicking TallyPrime */}
          <div className="flex items-baseline gap-1.5 cursor-pointer">
            <h1 className="text-white text-xl font-bold italic tracking-tighter leading-none">VyaparSetu</h1>
            <span className="text-white text-[10px] tracking-widest leading-none font-bold">POS</span>
          </div>
          
          {/* Classic Shortcut Navigation Links */}
          <div className="flex items-center gap-5">
            <TopNavButton shortcut="K" label="Company" />
            <TopNavButton shortcut="Y" label="Data" />
            <TopNavButton shortcut="Z" label="Exchange" />
            <TopNavButton shortcut="O" label="Import" />
            <TopNavButton shortcut="E" label="Export" />
            <TopNavButton shortcut="M" label="Share" />
            <TopNavButton shortcut="P" label="Print" />
            <TopNavButton shortcut="F1" label="Help" />
          </div>
        </div>

        {/* System Actions (Language & Quit) */}
        <div className="flex items-center gap-6">
          <TopNavButton shortcut="L" label={language.toUpperCase()} onClick={toggleLanguage} />
          <TopNavButton shortcut="Q" label="Quit" onClick={handleAction} />
        </div>
      </div>

      {/* 2. SECOND TIER: Cyan Gateway & Search */}
      <div className="bg-tally-cyan text-white flex items-center justify-between px-4 py-1 min-h-[36px] border-b border-tally-border shadow-sm">
        
        {/* Active Path Tracker */}
        <div className="font-bold text-[13px] flex items-center gap-3 w-1/4">
          Gateway of VyaparSetu
          {isOffline && (
            <span className="text-tally-yellow border border-tally-yellow px-1.5 py-0.5 text-[9px] rounded-sm font-black uppercase">
              Offline Mode
            </span>
          )}
        </div>

        {/* Go To Master Search Bar */}
        <div className="flex items-center w-1/2 max-w-[600px]">
          <button className="bg-tally-bg text-tally-black px-4 py-1 border border-tally-border flex items-center justify-center font-bold text-xs hover:bg-gray-200 transition-colors shadow-sm whitespace-nowrap">
            <span className="underline decoration-1 underline-offset-[3px]">G</span>: Go To
          </button>
          <div className="flex-1 flex items-center bg-white px-2 py-1 ml-1 border border-tally-border shadow-inner">
            <Search size={14} className="text-gray-400 mr-2 shrink-0" />
            <input 
              type="text" 
              placeholder="Find details entered in masters and transactions. (Alt+F)" 
              className="w-full outline-none text-xs text-tally-black placeholder-gray-400 bg-transparent font-sans"
            />
          </div>
        </div>

        {/* User Session & Time */}
        <div className="flex items-center justify-end gap-5 text-[11px] font-bold w-1/4 text-white/90 uppercase tracking-wide">
          <span>{timeString} • {smallTopDate}</span>
          <span className="text-white">{displayName}</span>
        </div>

      </div>
    </header>
  );
}