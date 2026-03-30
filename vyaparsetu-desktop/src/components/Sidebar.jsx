import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

// Classic Tally Action Button Component
const TallyMenuButton = ({ shortcut, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-2 py-2 text-xs font-bold border-b border-tally-border/40 transition-none outline-none focus:outline-none ${
      isActive 
        ? 'bg-tally-yellow text-tally-black shadow-[inset_3px_0_0_#000]' 
        : 'bg-transparent text-tally-darkBlue hover:bg-white'
    }`}
  >
    <div className="flex items-center gap-1.5 whitespace-nowrap overflow-hidden">
      <span className={`${isActive ? 'text-tally-black' : 'text-tally-cyan'}`}>{shortcut}:</span>
      <span className="truncate">{label}</span>
    </div>
    <span className={`ml-1 text-[10px] font-black ${isActive ? 'text-tally-black' : 'text-tally-cyan'}`}>{'<'}</span>
  </button>
);

export default function Sidebar({ activeTab, setActiveTab, onLock, isOffline }) {
  const { t } = useLanguage();
  
  // Sync Status State (Simplified for classic UI)
  const [syncStatus, setSyncStatus] = useState(isOffline ? 'Offline' : 'Online');

  useEffect(() => {
    if (isOffline) return;
    const handleOnline = () => setSyncStatus('Online');
    const handleOffline = () => setSyncStatus('Offline');
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOffline]);

  const handleSignOut = async () => {
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

  // Mapped to classic Tally function keys
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', shortcut: 'F2' },
    { id: 'pos', label: 'Vouchers', shortcut: 'F4' },
    { id: 'khata', label: 'Ledgers', shortcut: 'F5' },
    { id: 'inventory', label: 'Stock Item', shortcut: 'F6' },
    { id: 'daily-ops', label: 'Day Book', shortcut: 'F7' },
    { id: 'purchases', label: 'Purchases', shortcut: 'F8' },
    { id: 'suppliers', label: 'Suppliers', shortcut: 'F9' },
    { id: 'reports', label: 'Reports', shortcut: 'F10' },
    { id: 'staff', label: 'Payroll', shortcut: 'F11' },
    { id: 'settings', label: 'Features', shortcut: 'F12' },
  ];

  return (
    <aside className="w-[160px] h-full bg-tally-lightBlue flex flex-col shrink-0 z-20 select-none border-l border-tally-border font-sans">
      
      {/* Scrollable Action Menu */}
      <div className="flex-1 w-full flex flex-col overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => (
          <TallyMenuButton
            key={item.id}
            shortcut={item.shortcut}
            label={item.label}
            isActive={activeTab === item.id}
            onClick={() => setActiveTab(item.id)}
          />
        ))}
      </div>

      {/* System Status & Bottom Actions */}
      <div className="w-full border-t border-tally-border bg-tally-bg flex flex-col mt-auto">
        <div className="px-2 py-1 text-[9px] font-bold text-tally-darkBlue flex justify-between border-b border-tally-border/40">
          <span>TallySync:</span>
          <span className={syncStatus === 'Online' ? 'text-green-700' : 'text-red-600'}>{syncStatus}</span>
        </div>
        
        <TallyMenuButton
          shortcut="L"
          label="Lock System"
          isActive={false}
          onClick={onLock}
        />
        <TallyMenuButton
          shortcut="Q"
          label={isOffline ? "Go Online" : "Quit"}
          isActive={false}
          onClick={handleSignOut}
        />
      </div>

    </aside>
  );
}