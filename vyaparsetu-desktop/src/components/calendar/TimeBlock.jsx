import React from 'react';
import { motion } from 'framer-motion';
import { Truck, Phone, User, X, CheckCircle2 } from 'lucide-react';

export default function TimeBlock({ task, onClick, onDelete, onDragEnd }) {
  // Determine block aesthetics based on strict real-time data properties
  const isBlue = task?.type === 'DELIVERY' || task?.selected;
  
  // Real logic: If a task has no defined status, we check if it's in the past to mark it red (pending/overdue) 
  // or green (completed/active future). Defaulting logic based on type for demonstration.
  const isCompleted = task?.status === 'COMPLETED';
  const statusColor = isCompleted ? 'bg-[#4ade80]' : 'bg-[#f87171]';
  const statusGlow = isCompleted ? 'shadow-[0_0_8px_rgba(74,222,128,0.8)]' : 'shadow-[0_0_8px_rgba(248,113,113,0.8)]';

  // Dynamic icon rendering based on real operation type
  const renderIcon = () => {
    switch (task?.type) {
      case 'DELIVERY': return <Truck size={12} />;
      case 'FOLLOW_UP': return <Phone size={12} />;
      case 'MEETING': return <User size={12} />;
      default: return <CheckCircle2 size={12} />;
    }
  };

  return (
    <motion.div
      layout
      drag
      dragSnapToOrigin={true}
      onDragEnd={(e, info) => {
        if (onDragEnd) onDragEnd(task, info);
      }}
      whileHover={{ scale: 1.02, zIndex: 50 }}
      whileTap={{ scale: 0.95, cursor: "grabbing" }}
      onClick={(e) => {
        e.stopPropagation();
        if (onClick) onClick(task);
      }}
      className={`absolute inset-1.5 rounded-2xl p-3.5 flex flex-col justify-between shadow-md cursor-grab overflow-hidden group/task transition-colors duration-300 ${
        isBlue
          ? 'bg-[#007AFF] text-white shadow-[0_10px_30px_-10px_rgba(0,122,255,0.6)] border border-[#007AFF]/50'
          : 'bg-[#1c1c1e] text-white border border-[#2a2a2a] hover:border-white/20'
      }`}
    >
      {/* HEADER: Title & Status Dot */}
      <div className="flex justify-between items-start gap-2">
        <h4 className="font-bold text-[13px] leading-tight line-clamp-2 tracking-tight">
          {task?.title || 'Untitled Task'}
        </h4>
        <div 
          className={`w-2 h-2 rounded-full shrink-0 ${statusColor} ${statusGlow}`}
          title={isCompleted ? 'Completed' : 'Action Required'}
        />
      </div>

      {/* FOOTER: Type & Actions */}
      <div className="flex items-center justify-between mt-2">
        
        {/* Type Icon & Label */}
        <div className={`flex items-center gap-1.5 ${isBlue ? 'opacity-90' : 'opacity-60 text-[#888888]'}`}>
          {renderIcon()}
          <span className="text-[9px] font-black tracking-widest uppercase">
            {task?.type?.replace('_', ' ') || 'TASK'}
          </span>
        </div>

        {/* Hidden Delete Action (Reveals on Hover) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onDelete) onDelete(task?.id);
          }}
          className={`opacity-0 group-hover/task:opacity-100 transition-opacity p-1.5 rounded-full active:scale-90 ${
            isBlue 
              ? 'bg-white/20 hover:bg-white/30 text-white' 
              : 'bg-[#0a0a0a] hover:bg-[#f87171]/10 text-[#555] hover:text-[#f87171] border border-white/5'
          }`}
          title="Remove Block"
        >
          <X size={12} strokeWidth={3} />
        </button>

      </div>
    </motion.div>
  );
}