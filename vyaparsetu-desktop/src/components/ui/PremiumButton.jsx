import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * PremiumButton: Flat Enterprise Variant.
 * Implements stark, solid colors with geometric borders mapping strictly to the 7-color corporate palette.
 */
export default function PremiumButton({
  children,
  onClick,
  variant = 'primary', // primary, secondary, outline, ghost
  size = 'md',        // sm, md, lg, xl
  isLoading = false,
  disabled = false,
  icon: Icon,
  className,
  type = 'button'
}) {
  
  // Clean, flat baseline with sharp/slightly rounded corners and strict disabled states (#58595A)
  const baseStyles = "relative inline-flex items-center justify-center gap-2.5 font-bold uppercase tracking-widest transition-colors duration-200 rounded-sm overflow-hidden select-none outline-none focus:ring-1 focus:ring-offset-1 focus:ring-offset-brand-bg disabled:bg-brand-border disabled:text-brand-bg disabled:border-brand-border disabled:cursor-not-allowed";

  const variants = {
    // Primary Action (#005FA3) -> Hover Light (#DBE9F2)
    primary: "bg-brand-primary text-brand-text border border-brand-primary hover:bg-brand-light hover:text-brand-bg hover:border-brand-light focus:ring-brand-primary",
    
    // Secondary Action (#1D1F20) -> Hover Light (#DBE9F2)
    secondary: "bg-brand-surface text-brand-text border border-brand-border hover:bg-brand-light hover:text-brand-bg hover:border-brand-light focus:ring-brand-primary",
    
    // Outline Action (Transparent) -> Hover Primary (#005FA3)
    outline: "bg-transparent text-brand-text border border-brand-border hover:bg-brand-primary hover:text-brand-text hover:border-brand-primary focus:ring-brand-primary",
    
    // Minimalist Ghost
    ghost: "bg-transparent text-brand-muted hover:text-brand-text hover:bg-brand-surface focus:ring-brand-border border border-transparent"
  };

  // Safe fallback to gracefully handle any legacy 'success' or 'danger' calls during migration
  const safeVariant = variants[variant] || variants.primary;

  const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
    xl: "px-10 py-5 text-lg"
  };

  return (
    <motion.button
      type={type}
      // Subdued tactile feedback for enterprise software
      whileTap={!disabled && !isLoading ? { scale: 0.98 } : {}}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={twMerge(clsx(baseStyles, safeVariant, sizes[size], className))}
    >
      {isLoading ? (
        <Loader2 className="animate-spin" size={size === 'sm' ? 16 : 20} />
      ) : (
        <>
          {Icon && <Icon size={size === 'sm' ? 16 : 20} className="shrink-0" />}
          <span className="relative z-10">{children}</span>
        </>
      )}
    </motion.button>
  );
}