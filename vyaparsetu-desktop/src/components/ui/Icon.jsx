import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility to merge tailwind classes securely
 */
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Global Icon Wrapper for VyaparSetu
 * Enforces a strict premium aesthetic: uniform stroke weights, sizes, and hover states.
 * * @param {Object} props
 * @param {React.ElementType} props.icon - The Lucide icon component (e.g., Search, Plus)
 * @param {number} [props.size=20] - Default size
 * @param {number} [props.strokeWidth=1.5] - Premium, slightly thinner stroke weight
 * @param {string} [props.className] - Additional Tailwind classes
 * @param {boolean} [props.active=false] - Forces the active/highlighted color state
 * @param {'default'|'primary'|'danger'|'success'|'subtle'} [props.variant='default'] - Color pairing
 */
export default function Icon({ 
  icon: LucideIcon, 
  size = 20, 
  strokeWidth = 1.5, 
  className,
  active = false,
  variant = 'default' 
}) {
  if (!LucideIcon) return null;

  // Base color logic matching the premium dark theme layers
  const baseColors = {
    default: 'text-[#888888] group-hover:text-white',       // Muted gray to crisp white
    primary: 'text-brand-blue/70 group-hover:text-brand-blue', // Dim blue to neon blue
    danger: 'text-mac-red/70 group-hover:text-mac-red',        // Dim red to solid red
    success: 'text-mac-green/70 group-hover:text-mac-green',   // Dim green to solid green
    subtle: 'text-[#555555] group-hover:text-[#888888]'        // Extremely muted
  };

  // Forced active colors when the parent route/tab is currently selected
  const activeColors = {
    default: 'text-white',
    primary: 'text-brand-blue',
    danger: 'text-mac-red',
    success: 'text-mac-green',
    subtle: 'text-[#888888]'
  };

  return (
    <LucideIcon 
      size={size} 
      strokeWidth={strokeWidth} 
      className={cn(
        "transition-colors duration-200 shrink-0", 
        active ? activeColors[variant] : baseColors[variant],
        className
      )} 
    />
  );
}