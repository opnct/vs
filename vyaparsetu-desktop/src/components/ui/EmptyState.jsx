import React from 'react';
import { motion } from 'framer-motion';
import PremiumButton from './PremiumButton';

/**
 * EmptyState: A high-end visual placeholder for empty data views.
 * Uses custom SVG paths styled specifically for the #0a0a0a dark mode theme.
 */
export default function EmptyState({ 
  title = "No data found", 
  description = "There are currently no records to display in this section.",
  actionLabel,
  onAction,
  iconType = 'default' // default, search, cart, users
}) {
  
  // Custom Abstract SVG Illustrations matching the premium dark aesthetic
  const illustrations = {
    default: (
      <svg width="160" height="160" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="80" cy="80" r="40" stroke="#1c1c1e" strokeWidth="8" />
        <path d="M80 60V80L95 95" stroke="#333" strokeWidth="6" strokeLinecap="round" />
        <rect x="30" y="30" width="100" height="100" rx="20" stroke="#1c1c1e" strokeWidth="2" strokeDasharray="8 8" />
      </svg>
    ),
    search: (
      <svg width="160" height="160" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="70" cy="70" r="35" stroke="#1c1c1e" strokeWidth="8" />
        <line x1="95" y1="95" x2="130" y2="130" stroke="#007AFF" strokeWidth="8" strokeLinecap="round" />
        <circle cx="70" cy="70" r="15" fill="#007AFF" fillOpacity="0.1" />
      </svg>
    ),
    cart: (
      <svg width="160" height="160" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M40 50H130L120 110H50L40 50Z" stroke="#1c1c1e" strokeWidth="8" strokeLinejoin="round" />
        <circle cx="65" cy="130" r="8" fill="#333" />
        <circle cx="105" cy="130" r="8" fill="#333" />
        <path d="M80 65V95M65 80H95" stroke="#007AFF" strokeWidth="4" strokeLinecap="round" />
      </svg>
    )
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center justify-center text-center p-12 h-full min-h-[400px]"
    >
      {/* Illustration Wrapper */}
      <div className="mb-8 relative">
        <div className="absolute inset-0 bg-[#007AFF]/5 blur-[60px] rounded-full"></div>
        {illustrations[iconType] || illustrations.default}
      </div>

      {/* Typography */}
      <h3 className="text-2xl font-black text-white tracking-tight mb-3">
        {title}
      </h3>
      <p className="text-[#888888] font-medium text-[15px] max-w-sm mx-auto leading-relaxed mb-10">
        {description}
      </p>

      {/* CTA Trigger */}
      {actionLabel && (
        <PremiumButton 
          variant="primary" 
          size="lg" 
          onClick={onAction}
        >
          {actionLabel}
        </PremiumButton>
      )}
    </motion.div>
  );
}