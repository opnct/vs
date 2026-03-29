import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, Trash2 } from 'lucide-react';

export default function CartItemRow({ item, onUpdateQty, onRemove }) {
  // Calculate final row total including any specific item discounts
  const itemTotal = (item.price * item.qty) * (1 - (item.discountPercent || 0) / 100);

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="flex items-center justify-between py-3.5 border-b border-white/5 last:border-0 group relative overflow-hidden"
    >
      {/* LEFT: Avatar and Product Info */}
      <div className="flex items-center gap-4 flex-1 min-w-0 pr-4">
        <div className="w-11 h-11 rounded-full bg-[#2a2a2a] flex items-center justify-center text-white font-black text-[15px] shrink-0 border border-white/5 shadow-inner">
          {item.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex flex-col min-w-0">
          <h4 className="text-white font-bold text-[14px] leading-tight truncate">{item.name}</h4>
          <p className="text-[#888888] font-semibold text-[11px] mt-0.5 tracking-wide">
            {item.hsn ? `HSN: ${item.hsn}` : 'General'}
          </p>
        </div>
      </div>

      {/* RIGHT: Stacked Pricing (Default State) */}
      <div className="flex flex-col items-end shrink-0 transition-opacity duration-200 group-hover:opacity-0 group-hover:pointer-events-none">
        <span className="text-white font-black text-[15px] tracking-tight">
          ₹{itemTotal.toFixed(2)}
        </span>
        <span className="text-[#888888] font-bold text-[10px] mt-0.5 uppercase tracking-widest">
          ₹{item.price.toFixed(2)} / unit
        </span>
      </div>

      {/* RIGHT HOVER: Quantity Toggles & Actions (Hover State) */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 bg-[#1c1c1e] pl-4">
        
        {/* Sleek Dark Pill Quantity Selector */}
        <div className="flex items-center gap-3 bg-[#0a0a0a] px-1.5 py-1 rounded-full border border-white/5 shadow-inner">
          <button 
            onClick={() => onUpdateQty(item.productId, Math.max(1, item.qty - 1))} 
            className="w-6 h-6 rounded-full flex items-center justify-center text-[#888888] hover:text-white hover:bg-[#2a2a2a] transition-colors active:scale-90"
          >
            <Minus size={12} strokeWidth={3} />
          </button>
          
          <span className="w-4 text-center text-xs font-black text-white">{item.qty}</span>
          
          <button 
            onClick={() => onUpdateQty(item.productId, item.qty + 1)} 
            className="w-6 h-6 rounded-full flex items-center justify-center text-[#888888] hover:text-white hover:bg-[#2a2a2a] transition-colors active:scale-90"
          >
            <Plus size={12} strokeWidth={3} />
          </button>
        </div>

        {/* Delete Action */}
        <button 
          onClick={() => onRemove(item.productId)} 
          className="w-8 h-8 rounded-full flex items-center justify-center text-[#888888] hover:text-[#f87171] hover:bg-[#f87171]/10 transition-colors active:scale-90"
          title="Remove Item"
        >
          <Trash2 size={16} />
        </button>

      </div>
    </motion.div>
  );
}