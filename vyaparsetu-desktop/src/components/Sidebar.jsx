import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  BookOpen, 
  Package, 
  Settings, 
  Store 
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  // Navigation mapping linked directly to App.jsx state
  // We utilize the custom pastel colors from our updated tailwind.config.js
  const navItems = [
    { 
      id: 'dashboard', 
      label: 'Daily Reports', 
      icon: LayoutDashboard, 
      activeClass: 'bg-pastel-purple text-brand-text font-bold' 
    },
    { 
      id: 'pos', 
      label: 'POS Billing', 
      icon: ShoppingCart, 
      activeClass: 'bg-pastel-pink text-brand-text font-bold shadow-sm' 
    },
    { 
      id: 'khata', 
      label: 'Udhaar Khata', 
      icon: BookOpen, 
      activeClass: 'bg-pastel-blue text-brand-text font-bold' 
    },
    { 
      id: 'inventory', 
      label: 'Inventory', 
      icon: Package, 
      activeClass: 'bg-pastel-peach text-brand-text font-bold' 
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: Settings, 
      activeClass: 'bg-gray-100 text-brand-text font-bold' 
    }
  ];

  return (
    <aside className="w-64 h-full bg-white border-r border-gray-100 flex flex-col shrink-0 z-20 shadow-[4px_0_24px_rgba(42,40,69,0.02)]">
      
      {/* BRAND LOGO AREA */}
      <div className="p-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-brand-text text-white rounded-xl flex items-center justify-center shadow-soft-float">
          <Store size={20} />
        </div>
        <div>
          <h1 className="text-xl font-black tracking-tight text-brand-text leading-none">
            VyaparSetu
          </h1>
          <p className="text-[10px] text-brand-muted font-medium tracking-widest uppercase mt-1">
            Retail Desk
          </p>
        </div>
      </div>

      {/* NAVIGATION LINKS */}
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto mt-4">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 ${
                isActive 
                  ? item.activeClass 
                  : 'text-brand-muted hover:bg-gray-50 hover:text-brand-text font-medium'
              }`}
            >
              <item.icon 
                size={20} 
                className={isActive ? 'opacity-100' : 'opacity-70'} 
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className="text-sm tracking-wide">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* FOOTER STATUS */}
      <div className="p-6 border-t border-gray-50">
        <div className="bg-pastel-yellow/50 rounded-2xl p-4 flex flex-col gap-1 items-center justify-center text-center">
          <span className="w-2 h-2 rounded-full bg-green-500 mb-1"></span>
          <span className="text-xs font-bold text-brand-text">System Active</span>
          <span className="text-[10px] text-brand-muted font-medium">Local SQLite Sync ON</span>
        </div>
      </div>

    </aside>
  );
}