import React, { useState } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export default function PremiumInput({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  icon: Icon,
  multiline = false,
  required = false,
  className
}) {
  const [isFocused, setIsFocused] = useState(false);

  // Flat corporate border with standard light-blue focus ring
  const containerClasses = twMerge(
    clsx(
      "relative w-full transition-all duration-200 rounded-md bg-white border group",
      isFocused ? "border-[#80bdff] ring-4 ring-[#80bdff]/20" : "border-gray-300 hover:border-gray-400"
    ),
    className
  );

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-sm font-bold text-brand-text flex items-center">
          {label} 
          {required && <span className="text-status-red ml-1.5 text-lg leading-none mt-1">•</span>}
        </label>
      )}
      <div className={containerClasses}>
        {Icon && (
          <div className={clsx(
            "absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-200",
            isFocused ? "text-brand-blue" : "text-brand-muted"
          )}>
            <Icon size={18} />
          </div>
        )}
        
        {multiline ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            required={required}
            rows={3}
            className={clsx(
              "w-full bg-transparent border-none outline-none text-brand-text text-sm p-3 placeholder-gray-400 transition-all resize-none",
              Icon && "pl-10"
            )}
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            required={required}
            className={clsx(
              "w-full bg-transparent border-none outline-none text-brand-text text-sm p-3 placeholder-gray-400 transition-all",
              Icon && "pl-10"
            )}
          />
        )}
      </div>
    </div>
  );
}