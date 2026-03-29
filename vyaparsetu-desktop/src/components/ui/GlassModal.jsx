import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function GlassModal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  maxWidth = 'max-w-md' 
}) {
  // Prevent body scrolling when modal is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          {/* iOS Frosted Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-xl"
          />
          
          {/* Elevated Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.25 }}
            className={`relative w-full ${maxWidth} bg-[#1c1c1e] rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,1)] overflow-hidden border border-white/5 flex flex-col`}
          >
            {/* Modal Header */}
            {title && (
              <div className="flex items-center justify-between p-6 border-b border-[#2a2a2a] bg-[#252525]/30 shrink-0">
                <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
                <button 
                  onClick={onClose} 
                  className="p-2.5 rounded-full bg-[#0a0a0a] text-[#888888] hover:text-white hover:bg-[#333] transition-colors active:scale-90"
                >
                  <X size={20} />
                </button>
              </div>
            )}
            
            {/* Modal Body */}
            <div className="p-8 overflow-y-auto max-h-[80vh] custom-scrollbar">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}