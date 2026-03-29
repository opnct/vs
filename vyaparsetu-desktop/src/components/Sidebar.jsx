import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  LayoutDashboard, 
  BookOpen, 
  Package, 
  ShoppingBag,
  Truck,
  BarChart2,
  Users,
  Settings,
  CloudCheck,
  CloudOff,
  RefreshCw,
  Lock,
  LogOut,
  UserCircle,
  CalendarDays
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

export default function Sidebar({ activeTab, setActiveTab, onLock, isOffline }) {
  const { t } = useLanguage();
  
  // Sync Status State: 'synced' | 'syncing' | 'offline'
  // Real logic: We check the window.navigator.onLine status in real-time
  const [syncStatus, setSyncStatus] = useState(isOffline ? 'offline' : 'synced');

  useEffect(() => {
    if (isOffline) return;
    
    const handleOnline = () => setSyncStatus('synced');
    const handleOffline = () => setSyncStatus('offline');
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOffline]);

  // Handle exiting guest mode to sign in
  const handleSignInRequest = () => {
    localStorage.removeItem('vs_offline_mode');
    window.dispatchEvent(new Event('storage'));
  };

  // Organized production navigation mapping
  const sections = [
    {
      items: [
        { id: 'pos', label: t('nav_pos'), icon: ShoppingCart },
        { id: 'khata', label: t('nav_khata'), icon: BookOpen },
        { id: 'inventory', label: t('nav_inventory'), icon: Package },
      ]
    },
    {
      items: [
        { id: 'daily-ops', label: 'Daily Ops', icon: CalendarDays },
        { id: 'purchases', label: t('nav_purchases'), icon: ShoppingBag },
        { id: 'suppliers', label: t('nav_suppliers'), icon: Truck },
      ]
    },
    {
      items: [
        { id: 'dashboard', label: t('nav_dashboard'), icon: LayoutDashboard },
        { id: 'reports', label: t('nav_reports'), icon: BarChart2 },
      ]
    },
    {
      items: [
        { id: 'staff', label: t('nav_staff'), icon: Users },
        { id: 'settings', label: t('nav_settings'), icon: Settings },
      ]
    }
  ];

  return (
    <aside className="w-[100px] h-full bg-[#0a0a0a] flex flex-col items-center py-8 shrink-0 z-20 select-none border-none">
      
      {/* 1. macOS Window Decorations */}
      <div className="flex gap-2 mb-12">
        <div className="w-3 h-3 rounded-full bg-[#FF5F56] shadow-inner opacity-80 hover:opacity-100 transition-opacity"></div>
        <div className="w-3 h-3 rounded-full bg-[#FFBD2E] shadow-inner opacity-80 hover:opacity-100 transition-opacity"></div>
        <div className="w-3 h-3 rounded-full bg-[#27C93F] shadow-inner opacity-80 hover:opacity-100 transition-opacity"></div>
      </div>

      {/* 2. Scrollable Icon Nav */}
      <div className="flex-1 w-full flex flex-col items-center gap-8 overflow-y-auto custom-scrollbar px-2">
        {sections.map((section, sIdx) => (
          <div key={sIdx} className="w-full flex flex-col items-center gap-4">
            {section.items.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className="group relative flex flex-col items-center"
                >
                  <motion.div
                    initial={false}
                    animate={{
                      backgroundColor: isActive ? '#007AFF' : 'transparent',
                      scale: isActive ? 1.05 : 1,
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 relative ${
                      isActive 
                        ? 'text-white shadow-glow-blue' 
                        : 'text-[#A1A1AA] hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <item.icon 
                      size={24} 
                      strokeWidth={isActive ? 2.5 : 2}
                      className="transition-transform group-hover:scale-110"
                    />
                    
                    {/* Active Floating Indicator */}
                    {isActive && (
                      <motion.div 
                        layoutId="active-pill"
                        className="absolute -right-1 w-1 h-6 bg-[#007AFF] rounded-full shadow-[0_0_10px_#007AFF]"
                      />
                    )}
                  </motion.div>
                  
                  {/* Tooltip Label (Visible on hover) */}
                  <div className="absolute left-[70px] bg-[#1c1c1e] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all pointer-events-none whitespace-nowrap z-50 shadow-2xl border border-white/5">
                    {item.label}
                  </div>
                </button>
              );
            })}
            
            {/* Section Divider */}
            {sIdx !== sections.length - 1 && (
              <div className="w-6 h-px bg-white/5 rounded-full mt-2"></div>
            )}
          </div>
        ))}
      </div>

      {/* 3. Action Footer */}
      <div className="mt-8 flex flex-col items-center gap-5 w-full">
        
        {/* Sync / Connectivity Status */}
        <div className="relative group">
          <div 
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 bg-[#1c1c1e] border border-white/5 ${
              syncStatus === 'synced' ? 'text-[#27C93F]' : syncStatus === 'offline' ? 'text-[#FF5F56]' : 'text-[#007AFF]'
            }`}
          >
            {syncStatus === 'synced' && <CloudCheck size={20} />}
            {syncStatus === 'syncing' && <RefreshCw size={20} className="animate-spin" />}
            {syncStatus === 'offline' && <CloudOff size={20} />}
          </div>
          
          {/* Status Glow Dot */}
          <div className={`absolute top-0 right-0 w-3 h-3 rounded-full border-2 border-[#0a0a0a] ${
            syncStatus === 'synced' ? 'bg-[#27C93F] shadow-[0_0_8px_#27C93F]' : 'bg-[#FF5F56] shadow-[0_0_8px_#FF5F56]'
          }`}></div>
        </div>

        {/* Lock & Security Controls */}
        <div className="flex flex-col gap-3 bg-[#1c1c1e]/50 p-2 rounded-3xl border border-white/5">
          <button 
            onClick={onLock}
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-[#A1A1AA] hover:text-[#FFBD2E] hover:bg-[#FFBD2E]/10 transition-all active:scale-90"
            title="Lock Terminal"
          >
            <Lock size={18} />
          </button>
          
          <button 
            onClick={() => {/* Global Sign-out logic */}}
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-[#A1A1AA] hover:text-[#FF5F56] hover:bg-[#FF5F56]/10 transition-all active:scale-90"
            title="Sign Out"
          >
            <LogOut size={18} />
          </button>
        </div>

      </div>

    </aside>
  );
}