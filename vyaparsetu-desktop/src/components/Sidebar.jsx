import React, { useState } from 'react';
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
  UserCircle
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Sidebar({ activeTab, setActiveTab, onLock, isOffline }) {
  const { t } = useLanguage();
  // Sync Status State: 'synced' | 'syncing' | 'offline'
  const [syncStatus, setSyncStatus] = useState(isOffline ? 'offline' : 'synced');

  // Handle exiting guest mode to sign in
  const handleSignInRequest = () => {
    localStorage.removeItem('vs_offline_mode');
    window.dispatchEvent(new Event('storage'));
  };

  // Organized production navigation mapping using translation keys
  const sections = [
    {
      title: t('nav_storefront'),
      items: [
        { id: 'pos', label: t('nav_pos'), icon: ShoppingCart },
        { id: 'khata', label: t('nav_khata'), icon: BookOpen },
        { id: 'inventory', label: t('nav_inventory'), icon: Package },
      ]
    },
    {
      title: t('nav_supply_chain'),
      items: [
        { id: 'purchases', label: t('nav_purchases'), icon: ShoppingBag },
        { id: 'suppliers', label: t('nav_suppliers'), icon: Truck },
      ]
    },
    {
      title: t('nav_insights'),
      items: [
        { id: 'dashboard', label: t('nav_dashboard'), icon: LayoutDashboard },
        { id: 'reports', label: t('nav_reports'), icon: BarChart2 },
      ]
    },
    {
      title: t('nav_admin'),
      items: [
        { id: 'staff', label: t('nav_staff'), icon: Users },
        { id: 'settings', label: t('nav_settings'), icon: Settings },
      ]
    }
  ];

  return (
    <aside className="w-[100px] h-full bg-brand-dark flex flex-col items-center py-8 shrink-0 z-20 select-none border-r border-white/5 rounded-l-6xl">
      
      {/* 1. Window Decorations (macOS Dots) */}
      <div className="flex gap-1.5 mb-10">
        <div className="w-3.5 h-3.5 rounded-full bg-mac-red shadow-inner"></div>
        <div className="w-3.5 h-3.5 rounded-full bg-mac-yellow shadow-inner"></div>
        <div className="w-3.5 h-3.5 rounded-full bg-mac-green shadow-inner"></div>
      </div>

      {/* 2. Scrollable Icon Nav */}
      <div className="flex-1 w-full flex flex-col items-center gap-6 overflow-y-auto custom-scrollbar px-2">
        {sections.map((section, sIdx) => (
          <div key={sIdx} className="w-full flex flex-col items-center gap-3">
            {/* Minimal Section Divider */}
            {sIdx !== 0 && <div className="w-6 h-px bg-white/10 my-1 rounded-full"></div>}
            
            {section.items.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  title={item.label}
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 group relative ${
                    isActive 
                      ? 'bg-brand-surface text-white shadow-soft-float border border-white/5' 
                      : 'text-[#888888] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <item.icon 
                    size={22} 
                    strokeWidth={isActive ? 2.5 : 2}
                    className={isActive ? 'text-white' : 'group-hover:scale-110 transition-transform'}
                  />
                  
                  {/* Active Indicator Dot */}
                  {isActive && (
                    <div className="absolute -left-3 w-1.5 h-6 bg-brand-blue rounded-r-full"></div>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* 3. Production Footer: Minimal Sync & Security Icons */}
      <div className="mt-6 flex flex-col items-center gap-4 w-full">
        
        {/* Offline Login Prompt OR Cloud Sync Status Indicator */}
        {isOffline ? (
          <button 
            onClick={handleSignInRequest}
            title={`${t('offline_badge')} - Click to Sign In`}
            className="w-14 h-14 rounded-full bg-status-orange/10 hover:bg-status-orange/20 text-status-orange flex items-center justify-center transition-all group border border-status-orange/20 relative"
          >
            <UserCircle size={22} className="group-hover:scale-110 transition-transform" />
            <div className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-status-orange border-2 border-brand-dark"></div>
          </button>
        ) : (
          <div 
            title={syncStatus === 'synced' ? t('synced') : syncStatus === 'syncing' ? 'Syncing...' : t('offline_badge')}
            className="w-14 h-14 rounded-full bg-brand-surface flex items-center justify-center text-[#888888] relative border border-white/5"
          >
            {syncStatus === 'synced' && <CloudCheck size={22} className="text-mac-green" />}
            {syncStatus === 'syncing' && <RefreshCw size={22} className="text-brand-blue animate-spin" />}
            {syncStatus === 'offline' && <CloudOff size={22} className="text-mac-red" />}
            <div className={`absolute top-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-brand-dark ${syncStatus === 'synced' ? 'bg-mac-green' : 'bg-mac-red'}`}></div>
          </div>
        )}

        {/* Lock Session */}
        <button 
          onClick={onLock}
          title="Lock POS Session"
          className="w-14 h-14 rounded-full bg-white/5 hover:bg-white/10 text-[#888888] hover:text-mac-yellow flex items-center justify-center transition-all"
        >
          <Lock size={20} />
        </button>

        {/* Logout */}
        <button 
          onClick={() => {/* Implement global sign-out */}}
          title="Logout"
          className="w-14 h-14 rounded-full bg-white/5 hover:bg-mac-red/10 text-[#888888] hover:text-mac-red flex items-center justify-center transition-all"
        >
          <LogOut size={20} />
        </button>

      </div>

    </aside>
  );
}