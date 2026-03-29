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
  CalendarDays
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

export default function Sidebar({ activeTab, setActiveTab, onLock, isOffline }) {
  const { t } = useLanguage();
  
  // Sync Status State: 'synced' | 'syncing' | 'offline'
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
    <aside className="w-[100px] h-full bg-[#000000] flex flex-col items-center py-6 shrink-0 z-20 select-none border-r border-white/10">
      
      {/* Scrollable Icon Nav */}
      <div className="flex-1 w-full flex flex-col items-center gap-6 overflow-y-auto custom-scrollbar px-0 mt-4">
        {sections.map((section, sIdx) => (
          <div key={sIdx} className="w-full flex flex-col items-center gap-2">
            {section.items.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className="group relative flex flex-col items-center w-full py-2"
                >
                  <div className="relative w-12 h-12 flex items-center justify-center transition-all duration-200">
                    <item.icon 
                      size={22} 
                      strokeWidth={isActive ? 2.5 : 2}
                      className={`transition-colors duration-200 z-10 ${
                        isActive ? 'text-brand-blue' : 'text-gray-500 group-hover:text-white'
                      }`}
                    />
                    
                    {/* Flat Geometric Active Highlight */}
                    {isActive && (
                      <motion.div 
                        layoutId="active-highlight"
                        className="absolute inset-0 bg-brand-blue/10 border border-brand-blue/20 rounded-sm"
                        transition={{ type: 'tween', duration: 0.2 }}
                      />
                    )}
                  </div>
                  
                  {/* Flat Corporate Edge Indicator */}
                  {isActive && (
                    <motion.div 
                      layoutId="active-edge"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-brand-blue"
                      transition={{ type: 'tween', duration: 0.2 }}
                    />
                  )}
                  
                  {/* Tooltip Label (Stark, Flat Style) */}
                  <div className="absolute left-[85px] bg-white text-black text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-sm opacity-0 group-hover:opacity-100 translate-x-[-5px] group-hover:translate-x-0 transition-all pointer-events-none whitespace-nowrap z-50 shadow-corporate border border-gray-200">
                    {item.label}
                  </div>
                </button>
              );
            })}
            
            {/* Minimal Section Divider */}
            {sIdx !== sections.length - 1 && (
              <div className="w-8 h-px bg-white/10 my-2"></div>
            )}
          </div>
        ))}
      </div>

      {/* Action Footer */}
      <div className="mt-6 flex flex-col items-center gap-5 w-full">
        
        {/* Flat Sync/Connectivity Status */}
        <div className="relative group">
          <div 
            className={`w-10 h-10 rounded-sm flex items-center justify-center transition-all duration-300 bg-[#111111] border border-white/10 ${
              syncStatus === 'synced' ? 'text-status-green' : syncStatus === 'offline' ? 'text-status-orange' : 'text-brand-blue'
            }`}
          >
            {syncStatus === 'synced' && <CloudCheck size={18} />}
            {syncStatus === 'syncing' && <RefreshCw size={18} className="animate-spin" />}
            {syncStatus === 'offline' && <CloudOff size={18} />}
          </div>
          
          {/* Solid Status Dot (No Glow) */}
          <div className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border border-black ${
            syncStatus === 'synced' ? 'bg-status-green' : 'bg-status-orange'
          }`}></div>
        </div>

        {/* Flat Security Controls */}
        <div className="flex flex-col gap-2 bg-[#111111] p-1.5 rounded-sm border border-white/10 w-12 items-center">
          <button 
            onClick={onLock}
            className="w-9 h-9 rounded-sm flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
            title="Lock Terminal"
          >
            <Lock size={16} />
          </button>
          
          <div className="w-6 h-px bg-white/10"></div>
          
          <button 
            onClick={handleSignOut}
            className="w-9 h-9 rounded-sm flex items-center justify-center text-gray-500 hover:text-status-red hover:bg-status-red/10 transition-colors"
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>

      </div>

    </aside>
  );
}