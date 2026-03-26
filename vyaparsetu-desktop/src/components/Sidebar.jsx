import React from 'react';
import { 
  ShoppingCart, 
  LayoutDashboard, 
  BookOpen, 
  Package, 
  ShoppingBag,
  Truck,
  BarChart2,
  Users,
  Settings 
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  // Complete navigation mapping for all 16 Kirana Modules
  const navItems = [
    { id: 'pos', label: 'POS Billing', icon: ShoppingCart },
    { id: 'khata', label: 'Udhaar Khata', icon: BookOpen },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'purchases', label: 'Purchases', icon: ShoppingBag },
    { id: 'suppliers', label: 'Suppliers', icon: Truck },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'reports', label: 'Reports', icon: BarChart2 },
    { id: 'staff', label: 'Staff Management', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <aside className="w-64 h-full bg-brand-surface flex flex-col shrink-0 z-20 border-r border-white/5">
      
      {/* Top Header: macOS Window Controls & Refresh/Back icons space */}
      <div className="p-5 flex items-center gap-2 mb-2">
        <div className="w-3 h-3 rounded-full bg-mac-red shadow-sm"></div>
        <div className="w-3 h-3 rounded-full bg-mac-yellow shadow-sm"></div>
        <div className="w-3 h-3 rounded-full bg-mac-green shadow-sm"></div>
      </div>

      {/* "Quick links" Section Header */}
      <div className="px-6 mb-3">
        <h2 className="text-[15px] font-semibold text-[#A1A1AA] tracking-wide">
          Quick links
        </h2>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar pb-6">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-2.5 rounded-full transition-all duration-200 ${
                isActive 
                  ? 'bg-brand-blue text-white shadow-md' 
                  : 'text-brand-muted hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon 
                size={18} 
                className={isActive ? 'opacity-100' : 'opacity-80'} 
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className={`text-[15px] ${isActive ? 'font-medium' : 'font-normal'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

    </aside>
  );
}