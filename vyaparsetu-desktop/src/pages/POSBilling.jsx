import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, Plus, Minus, Trash2, Printer, 
  Banknote, QrCode, BookDown, CheckCircle2,
  PauseCircle, PlayCircle, Calculator, Percent,
  Loader2, User, X, AlertCircle
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { usePosStore } from '../store/usePosStore';

export default function POSBilling() {
  const { t } = useLanguage();
  
  // Wire up Global High-Performance POS Store
  const posStore = usePosStore();
  const totals = posStore.getTotals();

  const [inventory, setInventory] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [checkoutError, setCheckoutError] = useState("");

  // Split Payment Modal State
  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);
  const [splitInput, setSplitInput] = useState({ mode: 'CASH', amount: '' });
  
  const searchInputRef = useRef(null);

  // 1. Fetch Real Data from SQLite on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingItems(true);
        if (window.electronAPI) {
          const [productsData, customersData] = await Promise.all([
            window.electronAPI.invoke('get_all_products'),
            window.electronAPI.invoke('get_all_customers')
          ]);
          setInventory(productsData || []);
          setCustomers(customersData || []);
        } else {
          console.warn("Running in standard browser. Electron API unavailable.");
        }
      } catch (error) {
        console.error("Failed to load POS data:", error);
      } finally {
        setIsLoadingItems(false);
      }
    };
    loadData();
  }, []);

  // Auto-focus for barcode scanners
  useEffect(() => {
    if (searchInputRef.current) searchInputRef.current.focus();
  }, [posStore.cart, posStore.holdQueue]);

  // --- SPLIT PAYMENT LOGIC ---
  const handleAddSplit = () => {
    if (!splitInput.amount || isNaN(parseFloat(splitInput.amount))) return;
    posStore.addSplitPayment({
      mode: splitInput.mode,
      amount: parseFloat(splitInput.amount)
    });
    setSplitInput({ mode: 'CASH', amount: '' });
  };

  const splitTotal = posStore.splitPayments.reduce((sum, p) => sum + p.amount, 0);
  const remainingSplit = totals.grandTotal - splitTotal;

  // --- CHECKOUT & PRINTING ---
  const handleFinalCheckout = async () => {
    if (posStore.cart.length === 0) return;
    setCheckoutError("");
    
    // Strict Validation Rules
    if (posStore.paymentMode === 'UDHAAR' && !posStore.customerId) {
      setCheckoutError("You must select a Customer to process an UDHAAR (Credit) bill.");
      return;
    }
    
    if (posStore.paymentMode === 'SPLIT' && Math.abs(splitTotal - totals.grandTotal) > 1.0) {
      setCheckoutError(`Split payments must exactly match the Grand Total. Remaining: ₹${remainingSplit.toFixed(2)}`);
      return;
    }

    setIsProcessing(true);

    try {
      const payments = posStore.paymentMode === 'SPLIT'
        ? posStore.splitPayments
        : [{ mode: posStore.paymentMode, amount: totals.grandTotal }];

      // Construct Strict Payload for Node DB Engine
      const payload = {
        customer_id: posStore.customerId || null,
        items: posStore.cart.map(i => ({
          product_id: String(i.productId),
          quantity: Number(i.qty),
          unit_price: Number(i.price),
          discount_percent: Number(i.discountPercent),
          cgst_percent: Number(i.cgstPercent),
          sgst_percent: Number(i.sgstPercent),
          is_tax_inclusive: Boolean(i.isTaxInclusive)
        })),
        payments: payments
      };

      if (window.electronAPI) {
        // Execute ACID-Compliant Database Checkout
        await window.electronAPI.invoke('cmd_process_checkout', { payload });

        // Print Logic
        const savedSettings = JSON.parse(localStorage.getItem('vyaparsetu_settings') || '{}');
        await window.electronAPI.invoke('print_receipt', {
          receipt: {
            shop: {
              shop_name: savedSettings.shopName || "VyaparSetu Retail",
              shop_address: savedSettings.shopAddress || "Local Store",
              phone: savedSettings.phone || "0000000000",
              gst_enabled: savedSettings.gstEnabled || false,
              gstin: savedSettings.gstin || "",
              printer_port: savedSettings.printerPort || "USB001",
              receipt_footer: savedSettings.receiptFooter || "Thank you!"
            },
            items: posStore.cart.map(i => ({
              name: i.name,
              qty: i.qty,
              price: i.price,
              discount_percent: i.discountPercent,
              sgst_percent: i.sgstPercent,
              cgst_percent: i.cgstPercent
            })),
            payment_mode: posStore.paymentMode
          }
        });
      } else {
        console.log("Browser mode: Checkout simulated successfully.", payload);
      }

      posStore.clearCart();
    } catch (error) {
      console.error("POS Error:", error);
      setCheckoutError(typeof error === 'string' ? error : "A critical checkout error occurred.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex h-full gap-6 select-none font-sans text-brand-text relative">
      
      {/* --- SPLIT PAYMENT MODAL --- */}
      {isSplitModalOpen && (
        <div className="fixed inset-0 bg-brand-black/80 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
          <div className="bg-brand-surface w-[400px] rounded-[2rem] border border-white/5 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-brand-dark/50">
              <h3 className="text-white font-bold text-lg">Configure Split Payment</h3>
              <button onClick={() => setIsSplitModalOpen(false)} className="text-[#666] hover:text-white transition-colors"><X size={20}/></button>
            </div>
            
            <div className="p-6">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <p className="text-[#A1A1AA] text-xs font-bold uppercase tracking-widest">Grand Total</p>
                  <p className="text-2xl font-black text-white">₹{totals.grandTotal.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[#A1A1AA] text-xs font-bold uppercase tracking-widest">Remaining</p>
                  <p className={`text-xl font-black ${remainingSplit > 0 ? 'text-mac-yellow' : remainingSplit === 0 ? 'text-mac-green' : 'text-mac-red'}`}>
                    ₹{remainingSplit.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 mb-6">
                <select 
                  value={splitInput.mode} 
                  onChange={(e) => setSplitInput({...splitInput, mode: e.target.value})}
                  className="bg-brand-dark border border-white/5 rounded-xl px-4 py-3 text-white font-bold outline-none cursor-pointer"
                >
                  <option value="CASH">CASH</option>
                  <option value="UPI">UPI</option>
                  <option value="CARD">CARD</option>
                </select>
                <input 
                  type="number" 
                  step="0.01"
                  value={splitInput.amount}
                  onChange={(e) => setSplitInput({...splitInput, amount: e.target.value})}
                  placeholder={`Amount (e.g. ${remainingSplit.toFixed(2)})`}
                  className="flex-1 bg-brand-dark border border-white/5 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-brand-blue"
                />
                <button 
                  onClick={handleAddSplit}
                  className="bg-brand-blue text-white px-4 rounded-xl font-black hover:bg-brand-blue/80 transition-all active:scale-95"
                >
                  ADD
                </button>
              </div>

              <div className="space-y-2 mb-6">
                {posStore.splitPayments.length === 0 ? (
                  <p className="text-[#555] text-xs font-bold uppercase tracking-widest text-center py-4">No payments added yet</p>
                ) : (
                  posStore.splitPayments.map((sp, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-brand-dark/50 px-4 py-3 rounded-xl border border-white/5">
                      <span className="text-white font-bold">{sp.mode}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-mac-green font-black">₹{sp.amount.toFixed(2)}</span>
                        <button onClick={() => posStore.removeSplitPayment(idx)} className="text-mac-red hover:text-white transition-colors"><X size={16}/></button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <button 
                onClick={() => setIsSplitModalOpen(false)}
                className="w-full py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl tracking-widest uppercase transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* LEFT: Product Lookup & Quick Grid */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        
        {/* Search Bar */}
        <div className="bg-brand-surface p-2 rounded-2xl border border-white/5 flex items-center gap-4 group focus-within:border-brand-blue/50 transition-all">
          <div className="w-12 h-12 flex items-center justify-center text-[#A1A1AA]">
            <Search size={22} />
          </div>
          <input 
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('pos_search_item')}
            className="flex-1 bg-transparent border-none outline-none text-xl font-medium text-white placeholder-[#555]"
            onKeyDown={(e) => {
              if(e.key === 'Enter' && searchQuery) {
                const item = inventory.find(i => 
                  i.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  (i.barcode && i.barcode === searchQuery)
                );
                if(item) {
                  posStore.addToCart(item);
                  setSearchQuery("");
                }
              }
            }}
          />
        </div>

        {/* Quick Items Grid */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#A1A1AA] font-bold text-sm uppercase tracking-widest">{t('pos_inventory')}</h3>
            {posStore.holdQueue.length > 0 && (
              <span className="bg-mac-yellow/20 text-mac-yellow text-[10px] px-2 py-1 rounded-full font-bold animate-pulse">
                {posStore.holdQueue.length} {t('pos_pending_bills')}
              </span>
            )}
          </div>
          
          {isLoadingItems ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="animate-spin text-brand-blue" size={32} />
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {inventory.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.barcode && p.barcode.includes(searchQuery))).map(item => (
                <button
                  key={item.id}
                  onClick={() => posStore.addToCart(item)}
                  className="bg-brand-surface p-5 rounded-3xl border border-white/5 hover:border-brand-blue/40 hover:bg-white/5 transition-all text-left active:scale-95 group shadow-sm hover:shadow-brand-blue/10 flex flex-col justify-between h-36"
                >
                  <div>
                    <div className="text-[10px] font-bold text-[#A1A1AA] mb-1 group-hover:text-brand-blue transition-colors uppercase tracking-widest">{item.hsn_code || 'HSN'}</div>
                    <h4 className="text-white font-bold leading-tight line-clamp-2">{item.name}</h4>
                  </div>
                  <div className="flex items-end justify-between w-full mt-2">
                     <span className="text-xl font-black text-white">₹{item.selling_price}</span>
                     <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${item.stock_quantity > 5 ? 'bg-mac-green/10 text-mac-green border border-mac-green/20' : 'bg-mac-red/10 text-mac-red border border-mac-red/20'}`}>
                       {item.stock_quantity} {item.unit}
                     </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Hold Queue Section */}
          {posStore.holdQueue.length > 0 && (
            <div className="mt-8 animate-in slide-in-from-bottom-2 duration-300">
              <h3 className="text-[#A1A1AA] font-bold text-sm uppercase tracking-widest mb-4">{t('pos_pending_bills')}</h3>
              <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar">
                {posStore.holdQueue.map((bill, index) => (
                  <button 
                    key={bill.id}
                    onClick={() => posStore.resumeBill(bill.id)}
                    className="flex-shrink-0 bg-mac-yellow/10 border border-mac-yellow/20 p-4 rounded-2xl flex items-center gap-3 hover:bg-mac-yellow/20 transition-all active:scale-95"
                  >
                    <PlayCircle size={20} className="text-mac-yellow" />
                    <div className="text-left">
                      <p className="text-white text-xs font-bold">Bill #{index + 1}</p>
                      <p className="text-mac-yellow text-[10px] font-medium">{bill.cart.length} Items • {bill.time}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Active Cart & Checkout */}
      <div className="w-[450px] bg-brand-surface rounded-[2.5rem] border border-white/5 flex flex-col overflow-hidden shadow-soft-3d">
        
        {/* Cart Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-white font-bold text-lg tracking-tight">{t('pos_current_bill')}</h2>
          <div className="flex gap-2">
            <button 
              onClick={posStore.holdCurrentBill}
              title="Hold Bill"
              className="p-2.5 rounded-xl bg-white/5 text-[#A1A1AA] hover:text-mac-yellow hover:bg-mac-yellow/10 transition-all active:scale-90"
            >
              <PauseCircle size={20} />
            </button>
            <button 
              onClick={posStore.clearCart}
              title="Clear Cart"
              className="p-2.5 rounded-xl bg-white/5 text-[#A1A1AA] hover:text-mac-red hover:bg-mac-red/10 transition-all active:scale-90"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>

        {/* Customer Khata Link (Required for UDHAAR) */}
        <div className="px-6 pt-4 pb-2 border-b border-white/5 bg-brand-dark/20">
          <div className="relative">
            <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA]" />
            <select
              value={posStore.customerId || ''}
              onChange={(e) => posStore.setCustomer(e.target.value || null)}
              className="w-full bg-brand-dark p-3 pl-10 rounded-xl border border-white/5 text-white font-bold text-sm outline-none focus:border-brand-blue cursor-pointer appearance-none"
            >
              <option value="">-- Walk-in Customer --</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.phone || 'No phone'})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Dynamic Cart List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {posStore.cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-20 text-white">
              <Calculator size={64} strokeWidth={1} />
              <p className="mt-4 font-bold tracking-widest uppercase text-xs">{t('pos_waiting')}</p>
            </div>
          ) : (
            posStore.cart.map(item => (
              <div key={item.productId} className="bg-brand-dark/50 p-4 rounded-3xl border border-white/5 group animate-in slide-in-from-right-4 duration-300">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 pr-2">
                    <h4 className="text-sm font-bold text-white leading-tight line-clamp-1">{item.name}</h4>
                    <p className="text-[10px] font-bold text-[#A1A1AA] mt-1">₹{item.price} / unit • HSN: {item.hsn}</p>
                  </div>
                  <span className="text-sm font-black text-white text-right">
                    ₹{((item.price * item.qty) * (1 - item.discountPercent/100)).toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-brand-dark px-2 py-1 rounded-xl border border-white/5">
                    <button onClick={() => posStore.updateItem(item.productId, 'qty', Math.max(1, item.qty - 1))} className="text-[#A1A1AA] hover:text-white p-1 transition-colors"><Minus size={14}/></button>
                    <span className="w-6 text-center text-xs font-bold text-white">{item.qty}</span>
                    <button onClick={() => posStore.updateItem(item.productId, 'qty', item.qty + 1)} className="text-[#A1A1AA] hover:text-white p-1 transition-colors"><Plus size={14}/></button>
                  </div>
                  
                  <div className="flex items-center gap-1.5 bg-brand-dark px-3 py-1 rounded-xl border border-white/5 flex-1 focus-within:border-brand-blue/30 transition-all">
                    <Percent size={12} className="text-[#666]" />
                    <input 
                      type="number" 
                      value={item.discountPercent || ''} 
                      onChange={(e) => posStore.updateItem(item.productId, 'discountPercent', Number(e.target.value))}
                      placeholder="0"
                      className="bg-transparent border-none outline-none text-[11px] font-bold text-mac-green w-full placeholder-[#444]"
                    />
                    <span className="text-[9px] font-bold text-[#444] uppercase tracking-tighter">Disc</span>
                  </div>

                  <button onClick={() => posStore.removeItem(item.productId)} className="p-2 text-mac-red opacity-0 group-hover:opacity-100 transition-all active:scale-90"><Trash2 size={16}/></button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Summary & Checkout */}
        <div className="p-6 bg-black/20 border-t border-white/5 space-y-4">
          
          {checkoutError && (
            <div className="bg-mac-red/10 border border-mac-red/20 text-mac-red text-xs font-bold p-3 rounded-xl flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <p>{checkoutError}</p>
            </div>
          )}

          <div className="grid grid-cols-4 gap-2 relative">
            {['CASH', 'UPI', 'UDHAAR', 'SPLIT'].map(mode => (
              <button 
                key={mode}
                onClick={() => posStore.setPaymentMode(mode)}
                className={`py-2.5 rounded-xl text-[10px] font-bold tracking-widest transition-all ${
                  posStore.paymentMode === mode 
                    ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20' 
                    : 'bg-white/5 text-[#A1A1AA] hover:bg-white/10'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {posStore.paymentMode === 'SPLIT' && (
            <div className="bg-brand-dark/50 p-3 rounded-xl border border-white/5">
               <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-widest">Split Configuration</span>
                  <button onClick={() => setIsSplitModalOpen(true)} className="text-[10px] font-bold bg-brand-blue/20 text-brand-blue px-2 py-1 rounded hover:bg-brand-blue/30 transition-colors uppercase tracking-widest">Edit</button>
               </div>
               {posStore.splitPayments.length === 0 ? (
                 <p className="text-[#555] text-xs font-bold">No payments mapped. Click Edit.</p>
               ) : (
                 posStore.splitPayments.map((sp, idx) => (
                   <div key={idx} className="flex justify-between text-xs font-bold text-white mb-1">
                     <span>{sp.mode}</span>
                     <span className="text-mac-green">₹{sp.amount.toFixed(2)}</span>
                   </div>
                 ))
               )}
            </div>
          )}

          <div className="space-y-2">
            <div className="flex justify-between text-[13px] font-medium text-[#A1A1AA]">
              <span>{t('pos_subtotal')}</span>
              <span>₹{totals.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[13px] font-medium text-mac-red/80">
              <span>{t('pos_savings')}</span>
              <span>- ₹{totals.totalDiscount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[13px] font-medium text-mac-green/80">
              <span>{t('pos_gst')}</span>
              <span>+ ₹{totals.totalTax.toFixed(2)}</span>
            </div>
            <div className="pt-2 mt-2 border-t border-white/5 flex justify-between items-end">
              <span className="text-white font-bold">{t('pos_grand_total')}</span>
              <span className="text-4xl font-black text-white tracking-tighter leading-none">
                ₹{totals.grandTotal.toFixed(2)}
              </span>
            </div>
          </div>

          <button 
            onClick={handleFinalCheckout}
            disabled={posStore.cart.length === 0 || isProcessing}
            className={`w-full py-5 rounded-[2rem] flex items-center justify-center gap-3 text-lg font-black tracking-widest transition-all ${
              posStore.cart.length === 0 
                ? 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5' 
                : 'bg-brand-blue text-white hover:bg-brand-blue/80 shadow-2xl shadow-brand-blue/30 active:scale-95'
            }`}
          >
            {isProcessing ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <><Printer size={22} /> {t('pos_print_save')}</>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}