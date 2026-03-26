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
  LogOut
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, onLock }) {
  // Sync Status State: 'synced' | 'syncing' | 'offline'
  const [syncStatus, setSyncStatus] = useState('synced');

  // Organized production navigation mapping
  const sections = [
    {
      title: "Storefront",
      items: [
        { id: 'pos', label: 'POS Billing', icon: ShoppingCart },
        { id: 'khata', label: 'Udhaar Khata', icon: BookOpen },
        { id: 'inventory', label: 'Inventory', icon: Package },
      ]
    },
    {
      title: "Supply Chain",
      items: [
        { id: 'purchases', label: 'Purchases', icon: ShoppingBag },
        { id: 'suppliers', label: 'Suppliers', icon: Truck },
      ]
    },
    {
      title: "Insights",
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'reports', label: 'Reports', icon: BarChart2 },
      ]
    },
    {
      title: "Administration",
      items: [
        { id: 'staff', label: 'Staff Control', icon: Users },
        { id: 'settings', label: 'Settings', icon: Settings },
      ]
    }
  ];

  return (
    <aside className="w-64 h-full bg-brand-surface flex flex-col shrink-0 z-20 border-r border-white/5 select-none">
      
      {/* 1. Window Decorations */}
      <div className="p-6 flex items-center justify-between">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-mac-red shadow-inner"></div>
          <div className="w-3 h-3 rounded-full bg-mac-yellow shadow-inner"></div>
          <div className="w-3 h-3 rounded-full bg-mac-green shadow-inner"></div>
        </div>
      </div>

      {/* 2. Scrollable Nav Content */}
      <div className="flex-1 px-3 overflow-y-auto custom-scrollbar space-y-8 pb-6">
        {sections.map((section, sIdx) => (
          <div key={sIdx}>
            <h3 className="px-4 mb-2 text-[10px] font-black text-[#444] uppercase tracking-[0.2em]">
              {section.title}
            </h3>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl transition-all duration-200 group ${
                      isActive 
                        ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20' 
                        : 'text-[#A1A1AA] hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <item.icon 
                      size={18} 
                      strokeWidth={isActive ? 2.5 : 2}
                      className={isActive ? 'text-white' : 'text-[#555] group-hover:text-[#A1A1AA]'}
                    />
                    <span className={`text-[14px] ${isActive ? 'font-bold' : 'font-medium'}`}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 3. Production Footer: Sync Status & Security */}
      <div className="p-4 bg-brand-dark/30 border-t border-white/5 space-y-3">
        
        {/* Real-time Cloud Sync Status */}
        <div className="px-3 py-3 bg-white/5 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            {syncStatus === 'synced' && <CloudCheck size={16} className="text-mac-green" />}
            {syncStatus === 'syncing' && <RefreshCw size={16} className="text-brand-blue animate-spin" />}
            {syncStatus === 'offline' && <CloudOff size={16} className="text-mac-red" />}
            <span className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-widest">
              {syncStatus === 'synced' ? 'Cloud Synced' : syncStatus === 'syncing' ? 'Syncing...' : 'Offline'}
            </span>
          </div>
          <div className={`w-1.5 h-1.5 rounded-full ${syncStatus === 'synced' ? 'bg-mac-green shadow-[0_0_8px_#50e3c2]' : 'bg-mac-red'}`}></div>
        </div>

        {/* Quick Session Actions */}
        <div className="flex gap-2">
          <button 
            onClick={onLock}
            title="Lock POS Session"
            className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-[#666] hover:text-mac-yellow rounded-xl transition-all flex items-center justify-center border border-white/5"
          >
            <Lock size={16} />
          </button>
          <button 
            onClick={() => {/* Implement global sign-out */}}
            title="Logout"
            className="flex-1 py-2.5 bg-white/5 hover:bg-mac-red/10 text-[#666] hover:text-mac-red rounded-xl transition-all flex items-center justify-center border border-white/5"
          >
            <LogOut size={16} />
          </button>
        </div>

      </div>

    </aside>
  );
}