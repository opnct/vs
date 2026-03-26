import React from 'react';
import { Search, Cloud, User, LogOut } from 'lucide-react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

export default function Header({ user }) {
  // Extract a display name from the email, or default to Owner
  const displayName = user?.email?.split('@')[0] || 'Owner';

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <header className="flex items-center justify-between px-8 py-6 bg-brand-dark shrink-0">
      
      {/* 1. GREETING (Left side context) */}
      <div>
        <h2 className="text-2xl font-semibold text-white tracking-tight capitalize">
          Hello, {displayName}
        </h2>
        <p className="text-[#A1A1AA] text-sm mt-0.5">
          Ready to manage your retail desk.
        </p>
      </div>

      {/* 2. ACTIONS & STATUS (Right side matching reference image) */}
      <div className="flex items-center gap-6">
        
        {/* Dark Pill Search Bar */}
        <div className="flex items-center gap-2 bg-[#252525] px-4 py-2.5 rounded-full border border-white/5 focus-within:border-white/20 transition-all w-72">
          <Search size={18} className="text-[#A1A1AA]" />
          <input 
            type="text"
            placeholder="Search"
            className="bg-transparent border-none outline-none text-[15px] text-white placeholder-[#A1A1AA] w-full font-medium"
          />
        </div>

        {/* Profile & Cloud Sync Status */}
        <div className="flex items-center gap-4 pl-2 border-l border-white/10">
          
          <div className="flex flex-col items-end">
            <span className="text-[13px] font-semibold text-white capitalize">{displayName}</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Cloud size={12} className="text-[#A1A1AA]" />
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-mac-green animate-pulse"></span>
                <span className="text-[10px] text-[#A1A1AA] uppercase tracking-widest font-bold">Synced</span>
              </div>
            </div>
          </div>
          
          {/* Avatar & Logout Toggle Action */}
          <button 
            onClick={handleLogout}
            className="w-10 h-10 rounded-full bg-[#252525] border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors text-white group relative"
            title="Log Out"
          >
            <User size={18} className="group-hover:hidden transition-all" />
            <LogOut size={18} className="hidden group-hover:block text-mac-red transition-all pl-0.5" />
          </button>

        </div>
      </div>
      
    </header>
  );
}