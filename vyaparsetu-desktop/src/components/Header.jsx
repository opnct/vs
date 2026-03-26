import React from 'react';
import { Search, Cloud, User, LogOut, MonitorOff, Link as LinkIcon } from 'lucide-react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

export default function Header({ user, isOffline }) {
  // Extract a display name from the email, or default based on mode
  const displayName = isOffline ? 'Guest Owner' : (user?.email?.split('@')[0] || 'Owner');

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

  return (
    <header className="flex items-center justify-between px-8 py-6 bg-brand-dark shrink-0">
      
      {/* 1. GREETING (Left side context) */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-semibold text-white tracking-tight capitalize">
            Hello, {displayName}
          </h2>
          {isOffline && (
            <span className="bg-status-orange/10 text-status-orange text-[10px] font-bold px-2 py-0.5 rounded-md border border-status-orange/20 uppercase tracking-tighter">
              Offline
            </span>
          )}
        </div>
        <p className="text-[#A1A1AA] text-sm mt-0.5">
          {isOffline ? "Your data is stored locally on this machine." : "Your retail desk is live and synced."}
        </p>
      </div>

      {/* 2. ACTIONS & STATUS (Right side) */}
      <div className="flex items-center gap-6">
        
        {/* Dark Pill Search Bar */}
        <div className="flex items-center gap-2 bg-[#252525] px-4 py-2.5 rounded-full border border-white/5 focus-within:border-white/20 transition-all w-72">
          <Search size={18} className="text-[#A1A1AA]" />
          <input 
            type="text"
            placeholder="Search transactions..."
            className="bg-transparent border-none outline-none text-[15px] text-white placeholder-[#A1A1AA] w-full font-medium"
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
                    <span className="text-[10px] text-status-orange uppercase tracking-widest font-bold">Local Only</span>
                  </div>
                </>
              ) : (
                <>
                  <Cloud size={12} className="text-[#A1A1AA]" />
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-mac-green animate-pulse"></span>
                    <span className="text-[10px] text-[#A1A1AA] uppercase tracking-widest font-bold">Synced</span>
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* Avatar & Action Button */}
          <button 
            onClick={handleAction}
            className="w-10 h-10 rounded-full bg-[#252525] border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors text-white group relative"
            title={isOffline ? "Exit Guest Mode" : "Log Out"}
          >
            <User size={18} className="group-hover:hidden transition-all" />
            <LogOut size={18} className="hidden group-hover:block text-mac-red transition-all pl-0.5" />
          </button>

        </div>
      </div>
      
    </header>
  );
}