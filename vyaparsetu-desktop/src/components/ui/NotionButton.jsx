
import React from 'react';
export default function NotionButton({ children, onClick, variant = 'primary', className = '' }) {
  const base = "px-4 py-1.5 text-sm font-medium rounded-md transition-colors select-none";
  const styles = variant === 'primary' 
    ? "bg-brand-accent text-white hover:bg-blue-600" 
    : "bg-transparent text-brand-text border border-brand-border hover:bg-brand-sidebar";
  return <button onClick={onClick} className={`${base} ${styles} ${className}`}>{children}</button>;
}
