
import React from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
export default function Sidebar() {
  const sections = [
    { title: "HELP CENTER", items: [{ label: "Get started", path: "/" }, { label: "Company", path: "/company" }, { label: "Ledgers", path: "/ledgers" }, { label: "Vouchers", path: "/vouchers" }, { label: "Inventory", path: "/inventory" }] },
    { title: "REPORTS & OPS", items: [{ label: "POS Billing", path: "/pos" }, { label: "Banking", path: "/banking" }, { label: "GST Compliance", path: "/gst" }, { label: "Reports", path: "/reports" }] },
    { title: "SYSTEM", items: [{ label: "Settings", path: "/settings" }, { label: "Backup & Restore", path: "/backup" }, { label: "Staff", path: "/staff" }] }
  ];
  return (
    <aside className="w-[260px] h-full bg-brand-sidebar border-r border-brand-border overflow-y-auto custom-scrollbar flex flex-col pt-6 pb-10 select-none">
      {sections.map((sec, i) => (
        <div key={i} className="mb-8">
          <h4 className="px-6 text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-2">{sec.title}</h4>
          <div className="flex flex-col">
            {sec.items.map(item => (
              <NavLink key={item.path} to={item.path} className={({isActive}) => `flex items-center gap-2 px-6 py-1.5 text-sm transition-colors ${isActive ? 'text-brand-text font-bold bg-brand-border/30' : 'text-brand-text hover:bg-brand-border/30'}`}>
                <ChevronRight size={14} className="text-brand-muted" /> {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      ))}
    </aside>
  );
}
