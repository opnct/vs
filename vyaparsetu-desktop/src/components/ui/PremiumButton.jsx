import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * PremiumButton: A production-grade tactile button.
 * Implements physical scale feedback, inner-depth shadows, and high-legibility tracking.
 */
export default function PremiumButton({
  children,
  onClick,
  variant = 'primary', // primary, secondary, white, danger, ghost
  size = 'md',        // sm, md, lg, xl
  isLoading = false,
  disabled = false,
  icon: Icon,
  className,
  type = 'button'
}) {
  
  const baseStyles = "relative inline-flex items-center justify-center gap-2.5 font-black uppercase tracking-[0.15em] transition-all duration-200 rounded-[1.25rem] overflow-hidden select-none outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-dark disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-[#007AFF] text-white shadow-[0_10px_30px_-10px_rgba(0,122,255,0.5)] hover:bg-[#0084FF] active:shadow-inner border-t border-white/20 focus:ring-[#007AFF]",
    secondary: "bg-[#252525] text-[#888888] hover:text-white hover:bg-[#333] border border-white/5 focus:ring-white/20",
    white: "bg-white text-black shadow-[0_10px_40px_-10px_rgba(255,255,255,0.3)] hover:bg-gray-200 active:shadow-inner focus:ring-white",
    danger: "bg-[#f87171]/10 text-[#f87171] border border-[#f87171]/20 hover:bg-[#f87171]/20 focus:ring-[#f87171]",
    ghost: "bg-transparent text-[#555] hover:text-[#888] hover:bg-white/5"
  };

  const sizes = {
    sm: "px-4 py-2 text-[10px]",
    md: "px-6 py-3.5 text-[11px]",
    lg: "px-8 py-4.5 text-[13px]",
    xl: "px-10 py-5 text-[15px] rounded-[2rem]"
  };

  return (
    <motion.button
      type={type}
      whileTap={!disabled && !isLoading ? { scale: 0.96 } : {}}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
    >
      {isLoading ? (
        <Loader2 className="animate-spin" size={size === 'sm' ? 14 : 18} />
      ) : (
        <>
          {Icon && <Icon size={size === 'sm' ? 14 : 18} className="shrink-0" />}
          <span className="relative z-10">{children}</span>
        </>
      )}
      
      {/* Subtle Inner Highlight for physical depth */}
      <div className="absolute inset-0 pointer-events-none rounded-inherit shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"></div>
    </motion.button>
  );
}