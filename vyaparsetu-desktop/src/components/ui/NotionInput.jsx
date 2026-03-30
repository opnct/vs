
import React from 'react';
export default function NotionInput({ placeholder, value, onChange, type = "text" }) {
  return <input type={type} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} className="w-full bg-brand-sidebar border border-transparent focus:border-brand-border focus:bg-white outline-none rounded-md px-3 py-2 text-sm text-brand-text transition-colors placeholder-brand-muted" />;
}
