import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
  className
}) {
  const [isFocused, setIsFocused] = useState(false);

  const containerClasses = twMerge(
    clsx(
      "relative w-full transition-all duration-300 rounded-2xl bg-[#0a0a0a] group",
      isFocused ? "ring-1 ring-[#007AFF]/50 shadow-[0_0_20px_rgba(0,122,255,0.1)]" : "hover:bg-[#0f0f0f]"
    ),
    className
  );

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-[10px] font-black text-[#555] uppercase tracking-[0.2em] ml-1">
          {label}
        </label>
      )}
      <div className={containerClasses}>
        {Icon && (
          <div className={clsx(
            "absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300",
            isFocused ? "text-[#007AFF]" : "text-[#333]"
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
            rows={3}
            className={clsx(
              "w-full bg-transparent border-none outline-none text-white font-bold text-[14px] p-4 placeholder-[#222] transition-all resize-none",
              Icon && "pl-12"
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
            className={clsx(
              "w-full bg-transparent border-none outline-none text-white font-bold text-[14px] p-4 placeholder-[#222] transition-all",
              Icon && "pl-12"
            )}
          />
        )}

        {/* Animated Bottom Focus Line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isFocused ? 1 : 0 }}
          className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-[#007AFF] to-transparent origin-center"
        />
      </div>
    </div>
  );
}