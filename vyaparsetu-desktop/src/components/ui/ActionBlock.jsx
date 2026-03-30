
import React from 'react';
import { Link } from 'react-router-dom';
export default function ActionBlock({ title, icon: Icon, to, color = "text-brand-text" }) {
  return (
    <Link to={to} className="flex items-center gap-3 p-2 hover:bg-brand-sidebar rounded-md transition-colors group w-full">
      <div className={`shrink-0 ${color}`}><Icon size={18} /></div>
      <span className="text-brand-text font-medium text-sm group-hover:underline decoration-brand-border underline-offset-4">{title}</span>
    </Link>
  );
}
