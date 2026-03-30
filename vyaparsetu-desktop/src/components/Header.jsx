
import React from 'react';
import { Search } from 'lucide-react';
import NotionButton from './ui/NotionButton';
export default function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-3 bg-brand-white border-b border-brand-border shrink-0 select-none">
      <div className="flex items-center gap-2"><div className="w-6 h-6 bg-brand-text rounded-sm rotate-45"></div><h1 className="text-lg font-bold text-brand-text tracking-tight ml-2">VyaparSetu</h1></div>
      <div className="flex-1 max-w-xl mx-8 relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
        <input type="text" placeholder="Search" className="w-full bg-brand-sidebar border border-transparent focus:border-brand-border focus:bg-white outline-none rounded-md py-1.5 pl-9 pr-10 text-sm text-brand-text transition-colors" />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1"><kbd className="bg-white border border-brand-border rounded px-1.5 text-[10px] text-brand-muted font-mono">Ctrl</kbd><kbd className="bg-white border border-brand-border rounded px-1.5 text-[10px] text-brand-muted font-mono">K</kbd></div>
      </div>
      <div className="flex items-center gap-3"><NotionButton variant="secondary">Sign up</NotionButton><NotionButton variant="primary">Create voucher</NotionButton></div>
    </header>
  );
}
