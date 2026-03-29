import React from 'react';
import { motion } from 'framer-motion';
import { MoreHorizontal } from 'lucide-react';

export default function ResourceHeader({ staff, onClick }) {
  // Real logic to extract perfectly formatted initials (e.g. "James F." -> "JF")
  const getInitials = (name) => {
    if (!name) return '??';
    const parts = name.split(' ');
    if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  // Determine status based on staff properties (fallback to active/neon green)
  const isActive = staff?.status !== 'OFFLINE';

  return (
    <motion.div 
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="flex items-center justify-between w-full bg-[#1c1c1e] hover:bg-[#252525] border border-[#2a2a2a] px-3 py-2.5 rounded-2xl transition-colors cursor-pointer select-none group shadow-sm"
    >
      <div className="flex items-center gap-3 overflow-hidden">
        
        {/* Avatar with Status Cutout */}
        <div className="relative shrink-0">
          <div className="w-9 h-9 rounded-full bg-[#0a0a0a] border border-white/5 flex items-center justify-center text-[11px] font-black text-[#888888] shadow-inner group-hover:text-[#007AFF] transition-colors">
            {getInitials(staff?.name)}
          </div>
          <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#1c1c1e] transition-colors duration-300 ${
            isActive ? 'bg-[#4ade80] shadow-[0_0_8px_rgba(74,222,128,0.6)]' : 'bg-[#888888]'
          }`}></div>
        </div>
        
        {/* Typography Stack */}
        <div className="flex flex-col truncate">
          <span className="text-[13px] font-bold text-white tracking-tight truncate">
            {staff?.name || 'Unknown Staff'}
          </span>
          <span className="text-[10px] font-bold text-[#555] group-hover:text-[#888888] tracking-widest uppercase truncate transition-colors">
            {staff?.role || 'Attendant'}
          </span>
        </div>

      </div>
      
      {/* Subtle Actions Menu Icon */}
      <div className="shrink-0 text-[#333] group-hover:text-white transition-colors pl-2">
         <MoreHorizontal size={16} />
      </div>

    </motion.div>
  );
}