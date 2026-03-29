import React from 'react';
import { motion } from 'framer-motion';

export default function PremiumToggle({ 
  isActive, 
  onToggle, 
  label, 
  description,
  icon: Icon 
}) {
  return (
    <div className="flex items-center justify-between p-5 bg-[#0a0a0a] rounded-[1.5rem] border border-white/5 group hover:bg-[#0f0f0f] transition-all cursor-pointer" onClick={() => onToggle(!isActive)}>
      <div className="flex items-center gap-4">
        {Icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
            isActive ? 'bg-[#007AFF]/10 text-[#007AFF]' : 'bg-[#1c1c1e] text-[#444]'
          }`}>
            <Icon size={20} />
          </div>
        )}
        <div>
          <p className="font-bold text-white text-[14px] leading-tight">{label}</p>
          {description && (
            <p className="text-[10px] font-bold text-[#555] mt-1 uppercase tracking-widest leading-none">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Switch Background */}
      <div className={`relative w-12 h-7 rounded-full transition-colors duration-300 p-1 ${
        isActive ? 'bg-[#4ade80]' : 'bg-[#252525]'
      }`}>
        {/* Sliding Knob */}
        <motion.div
          animate={{ x: isActive ? 20 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="w-5 h-5 bg-white rounded-full shadow-lg"
        />
      </div>
    </div>
  );
}