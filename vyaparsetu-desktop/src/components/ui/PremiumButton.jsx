import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * PremiumButton: Flat Enterprise Variant.
 * Implements stark, solid colors with geometric borders for the corporate aesthetic.
 */
export default function PremiumButton({
  children,
  onClick,
  variant = 'primary', // primary, success, secondary, white, danger, ghost
  size = 'md',        // sm, md, lg, xl
  isLoading = false,
  disabled = false,
  icon: Icon,
  className,
  type = 'button'
}) {
  
  // Clean, flat baseline with sharp/slightly rounded corners
  const baseStyles = "relative inline-flex items-center justify-center gap-2.5 font-bold uppercase tracking-wider transition-colors duration-200 rounded-md overflow-hidden select-none outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    // Corporate Blue for primary actions (Get Started)
    primary: "bg-brand-blue text-white hover:bg-blue-800 focus:ring-brand-focus shadow-sm",
    // Success Green for auth/terminal actions (Login)
    success: "bg-brand-green text-white hover:bg-green-600 focus:ring-brand-green shadow-sm",
    // Standard flat grey for secondary actions
    secondary: "bg-brand-border text-brand-text hover:bg-gray-300 focus:ring-gray-400",
    // High contrast white
    white: "bg-white text-brand-text border border-brand-border hover:bg-gray-50 focus:ring-brand-focus",
    // Flat destructive action
    danger: "bg-status-red text-white hover:bg-red-700 focus:ring-status-red shadow-sm",
    // Minimalist ghost button
    ghost: "bg-transparent text-brand-muted hover:text-brand-text hover:bg-black/5"
  };

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
      className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
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