import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trash2, Plus, Minus, User, 
  Loader2, AlertCircle, X
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { usePosStore } from '../../store/usePosStore';

export default function OrderSidebar({ customers = [], onCheckout, isProcessing, checkoutError }) {
  const { t } = useLanguage();
  const posStore = usePosStore();
  const totals = posStore.getTotals();

  const [activeDiscount, setActiveDiscount] = useState(0);

  // Apply a global discount to all items mimicking the pill functionality
  const applyGlobalDiscount = (percent) => {
    setActiveDiscount(percent);
    posStore.cart.forEach(item => {
      posStore.updateItem(item.productId, 'discountPercent', percent === 'Custom' ? 0 : percent);
    });
  };

  return (
    <div className="w-[450px] bg-[#1c1c1e] rounded-[2.5rem] flex flex-col overflow-hidden shadow-[0_20px_40px_-15px_rgba(0,0,0,0.8)] relative">
      
      {/* Header: Title and Clear Action */}
      <div className="p-8 pb-4 flex items-center justify-between shrink-0">
        <h2 className="text-2xl font-bold text-white tracking-tight">Your order</h2>
        {posStore.cart.length > 0 && (
          <button 
            onClick={posStore.clearCart}
            className="w-10 h-10 rounded-full bg-[#2a2a2a] text-[#888888] hover:text-[#f87171] hover:bg-[#f87171]/10 flex items-center justify-center transition-all active:scale-90"
            title="Clear Order"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* Customer Selection (Borderless integration) */}
      <div className="px-8 pb-6 shrink-0">
        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#2a2a2a] flex items-center justify-center text-[#888888] group-focus-within:bg-[#007AFF] group-focus-within:text-white transition-colors">
            <User size={14} />
          </div>
          <select
            value={posStore.customerId || ''}
            onChange={(e) => posStore.setCustomer(e.target.value || null)}
            className="w-full bg-[#0a0a0a] p-4 pl-16 rounded-[1.5rem] text-white font-bold text-sm outline-none focus:ring-2 focus:ring-[#007AFF] cursor-pointer appearance-none transition-all"
          >
            <option value="">Walk-in Customer</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.phone || 'No phone'})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Dynamic Cart Items (Sleek rows with Avatars) */}
      <div className="flex-1 overflow-y-auto px-8 space-y-1 custom-scrollbar">
        {posStore.cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-30 text-white">
            <div className="w-24 h-24 rounded-full border-2 border-dashed border-[#888888] flex items-center justify-center mb-4">
              <Plus size={32} className="text-[#888888]" />
            </div>
            <p className="font-bold tracking-widest uppercase text-xs text-[#888888]">No services added</p>
          </div>
        ) : (
          <AnimatePresence>
            {posStore.cart.map((item) => {
              const itemTotal = (item.price * item.qty) * (1 - (item.discountPercent || 0) / 100);
              
              return (
                <motion.div 
                  key={item.productId}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex items-center justify-between py-4 border-b border-white/5 last:border-0 group"
                >
                  <div className="flex items-center gap-4">
                    {/* Item Avatar */}
                    <div className="w-12 h-12 rounded-full bg-[#2a2a2a] flex items-center justify-center text-white font-black text-lg shadow-inner">
                      {item.name.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                      <h4 className="text-white font-bold text-[15px] leading-tight line-clamp-1">{item.name}</h4>
                      <p className="text-[#888888] font-medium text-xs mt-0.5">₹{item.price.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className="text-white font-black text-[15px]">₹{itemTotal.toFixed(2)}</span>
                    
                    {/* Sleek Quantity Toggler */}
                    <div className="flex items-center gap-3 bg-[#0a0a0a] px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => posStore.updateItem(item.productId, 'qty', Math.max(1, item.qty - 1))} 
                        className="text-[#888888] hover:text-white transition-colors"
                      >
                        <Minus size={14}/>
                      </button>
                      <span className="w-4 text-center text-xs font-bold text-white">{item.qty}</span>
                      <button 
                        onClick={() => posStore.updateItem(item.productId, 'qty', item.qty + 1)} 
                        className="text-[#888888] hover:text-white transition-colors"
                      >
                        <Plus size={14}/>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Footer: Discounts, Summary & Sticky Charge Button */}
      <div className="p-8 bg-[#1c1c1e] shrink-0">
        
        {checkoutError && (
          <div className="bg-[#f87171]/10 text-[#f87171] text-xs font-bold p-4 rounded-2xl flex items-start gap-3 mb-4">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <p>{checkoutError}</p>
          </div>
        )}

        {/* Dark Pill Discount Percentages */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12px] font-bold text-[#888888]">Discount / Tip</span>
          </div>
          <div className="flex gap-2">
            {[20, 25, 30, 'Custom'].map(pct => (
              <button 
                key={pct}
                onClick={() => applyGlobalDiscount(pct)}
                className={`flex-1 py-3 rounded-full text-[13px] font-black transition-all active:scale-95 ${
                  activeDiscount === pct 
                    ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]' 
                    : 'bg-[#2a2a2a] text-white hover:bg-[#333]'
                }`}
              >
                {pct}{typeof pct === 'number' ? '%' : ''}
              </button>
            ))}
          </div>
        </div>

        {/* Totals Summary */}
        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-[14px] font-medium text-[#888888]">
            <span>Subtotal</span>
            <span className="text-white">₹{totals.subtotal.toFixed(2)}</span>
          </div>
          {totals.totalDiscount > 0 && (
            <div className="flex justify-between text-[14px] font-medium text-[#f87171]">
              <span>Discount</span>
              <span>- ₹{totals.totalDiscount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-[14px] font-medium text-[#888888]">
            <span>Taxes (GST)</span>
            <span className="text-white">₹{totals.totalTax.toFixed(2)}</span>
          </div>
        </div>

        {/* Massive White Sticky Charge Button */}
        <button 
          onClick={onCheckout}
          disabled={posStore.cart.length === 0 || isProcessing}
          className={`w-full py-5 rounded-[2rem] flex items-center justify-between px-8 text-lg font-black transition-all shadow-[0_10px_40px_-10px_rgba(255,255,255,0.25)] active:scale-95 ${
            posStore.cart.length === 0 
              ? 'bg-[#2a2a2a] text-[#555] cursor-not-allowed shadow-none' 
              : 'bg-white text-black hover:bg-gray-200'
          }`}
        >
          {isProcessing ? (
            <div className="w-full flex justify-center"><Loader2 className="animate-spin" size={24} /></div>
          ) : (
            <>
              <span>Charge</span>
              <span>₹{totals.grandTotal.toFixed(2)}</span>
            </>
          )}
        </button>

      </div>
    </div>
  );
}