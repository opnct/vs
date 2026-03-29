import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Phone, MessageCircle, MapPin, 
  Hash, AlertCircle, CheckCircle, Edit3
} from 'lucide-react';

export default function ClientProfilePanel({ 
  isOpen, 
  onClose, 
  customer, 
  onSendReminder, 
  onAddTransaction 
}) {
  // Prevent rendering calculations if customer data isn't active
  if (!customer) return null;

  const bal = parseFloat(customer.balance || 0);
  const hasDue = bal > 0;
  const limit = parseFloat(customer.credit_limit || 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Glass Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#0a0a0a]/60 backdrop-blur-sm z-[200]"
          />

          {/* Sliding Right Panel */}
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-[420px] bg-[#1c1c1e] border-l border-white/5 shadow-[-20px_0_60px_-15px_rgba(0,0,0,1)] z-[201] flex flex-col overflow-hidden"
          >
            
            {/* Header Actions */}
            <div className="p-6 flex justify-between items-center border-b border-white/5">
               <span className="text-[10px] font-bold text-[#888888] uppercase tracking-widest">Client Profile</span>
               <button 
                onClick={onClose} 
                className="w-10 h-10 bg-[#252525] rounded-full flex items-center justify-center text-[#888888] hover:text-white hover:bg-[#333] transition-all active:scale-90"
              >
                <X size={20} />
              </button>
            </div>

            {/* Profile Identity */}
            <div className="px-8 py-8 flex flex-col items-center text-center">
              <div className="w-28 h-28 rounded-[2.5rem] bg-[#007AFF] flex items-center justify-center text-white font-black text-4xl shadow-glow-blue mb-5 relative">
                {customer.name.charAt(0).toUpperCase()}
                <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-[#1c1c1e] ${hasDue ? 'bg-[#f87171]' : 'bg-[#4ade80]'}`}></div>
              </div>
              <h2 className="text-3xl font-black text-white tracking-tight mb-3">{customer.name}</h2>
              <div className="flex items-center justify-center gap-2 text-[#888888] font-medium text-sm bg-[#0a0a0a] px-4 py-2.5 rounded-full border border-white/5">
                <Phone size={14} /> {customer.phone || 'No phone number linked'}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="p-8 border-y border-[#2a2a2a] flex justify-between items-center bg-[#0a0a0a]">
              <div>
                <p className="text-[10px] font-bold text-[#888888] uppercase tracking-widest mb-1">Current Balance</p>
                <p className={`text-3xl font-black tracking-tighter ${hasDue ? 'text-[#f87171]' : 'text-[#4ade80]'}`}>
                  {hasDue ? 'Due: ' : 'Adv: '}₹{Math.abs(bal).toFixed(2)}
                </p>
              </div>
              {limit > 0 && (
                <div className="text-right">
                  <p className="text-[10px] font-bold text-[#888888] uppercase tracking-widest mb-1">Risk Cap</p>
                  <p className="text-lg font-black text-[#FFBD2E]">
                    ₹{limit.toFixed(2)}
                  </p>
                </div>
              )}
            </div>

            {/* Details Box */}
            <div className="p-8 flex-1 overflow-y-auto custom-scrollbar bg-[#1c1c1e]">
              <h3 className="text-xs font-bold text-[#888888] uppercase tracking-widest mb-4">Metadata & Notes</h3>
              
              <div className="bg-[#0a0a0a] p-5 rounded-3xl border border-white/5 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-xl bg-[#1c1c1e] text-[#555] shrink-0">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#555] uppercase tracking-widest">Billing Address</p>
                    <p className="text-sm font-medium text-white mt-0.5 leading-snug">{customer.address || 'No address provided'}</p>
                  </div>
                </div>

                <div className="w-full h-px bg-[#1c1c1e]"></div>

                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-xl bg-[#1c1c1e] text-[#555] shrink-0">
                    <Hash size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#555] uppercase tracking-widest">GSTIN</p>
                    <p className="text-sm font-medium text-white mt-0.5 uppercase tracking-wider">{customer.gstin || 'Unregistered'}</p>
                  </div>
                </div>
                
                <div className="w-full h-px bg-[#1c1c1e]"></div>

                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-xl bg-[#1c1c1e] text-[#555] shrink-0">
                    <Edit3 size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#555] uppercase tracking-widest">Store Notes</p>
                    <p className="text-sm font-medium text-[#888888] mt-0.5 italic">
                      {customer.notes || 'No active notes.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky Bottom Actions */}
            <div className="p-6 bg-[#1c1c1e] border-t border-[#2a2a2a] space-y-3 shrink-0 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
              <div className="flex gap-3">
                <button 
                  onClick={() => { onClose(); onAddTransaction('CREDIT_GIVEN'); }}
                  className="flex-1 py-4 bg-[#f87171]/10 hover:bg-[#f87171]/20 text-[#f87171] rounded-[1.25rem] text-xs font-black tracking-widest uppercase flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <AlertCircle size={16} /> Udhaar
                </button>
                <button 
                  onClick={() => { onClose(); onAddTransaction('PAYMENT_RECEIVED'); }}
                  className="flex-1 py-4 bg-[#4ade80]/10 hover:bg-[#4ade80]/20 text-[#4ade80] rounded-[1.25rem] text-xs font-black tracking-widest uppercase flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <CheckCircle size={16} /> Settle
                </button>
              </div>
              
              <button 
                onClick={onSendReminder}
                className="w-full py-4 bg-[#25D366] hover:bg-[#25D366]/90 text-white rounded-[1.25rem] text-xs font-black tracking-widest uppercase flex items-center justify-center gap-2 transition-all shadow-[0_5px_20px_-5px_rgba(37,211,102,0.6)] active:scale-95"
              >
                <MessageCircle size={18} /> Send WhatsApp Reminder
              </button>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}