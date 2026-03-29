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
    <div className="flex h-full gap-6 select-none font-sans text-white relative">
      
      {/* --- SPLIT PAYMENT MODAL (Borderless Frosted Glass) --- */}
      {isSplitModalOpen && (
        <div className="fixed inset-0 bg-[#0a0a0a]/80 backdrop-blur-xl z-[1000] flex items-center justify-center p-4">
          <div className="bg-[#1c1c1e] w-[400px] rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,1)] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 bg-[#252525]">
              <h3 className="text-white font-bold text-lg">Configure Split Payment</h3>
              <button onClick={() => setIsSplitModalOpen(false)} className="text-[#888888] hover:text-white transition-colors"><X size={20}/></button>
            </div>
            
            <div className="p-6">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <p className="text-[#888888] text-xs font-bold uppercase tracking-widest">Grand Total</p>
                  <p className="text-2xl font-black text-white">₹{totals.grandTotal.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[#888888] text-xs font-bold uppercase tracking-widest">Remaining</p>
                  <p className={`text-xl font-black ${remainingSplit > 0 ? 'text-[#FFBD2E]' : remainingSplit === 0 ? 'text-[#4ade80]' : 'text-[#f87171]'}`}>
                    ₹{remainingSplit.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 mb-6">
                <select 
                  value={splitInput.mode} 
                  onChange={(e) => setSplitInput({...splitInput, mode: e.target.value})}
                  className="bg-[#0a0a0a] rounded-xl px-4 py-3 text-white font-bold outline-none cursor-pointer"
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
                  className="flex-1 bg-[#0a0a0a] rounded-xl px-4 py-3 text-white font-bold outline-none focus:ring-2 focus:ring-[#007AFF]"
                />
                <button 
                  onClick={handleAddSplit}
                  className="bg-[#007AFF] text-white px-4 rounded-xl font-black hover:bg-[#007AFF]/80 transition-all active:scale-95"
                >
                  ADD
                </button>
              </div>

              <div className="space-y-2 mb-6">
                {posStore.splitPayments.length === 0 ? (
                  <p className="text-[#555] text-xs font-bold uppercase tracking-widest text-center py-4">No payments added yet</p>
                ) : (
                  posStore.splitPayments.map((sp, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-[#0a0a0a] px-4 py-3 rounded-xl">
                      <span className="text-white font-bold">{sp.mode}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-[#4ade80] font-black">₹{sp.amount.toFixed(2)}</span>
                        <button onClick={() => posStore.removeSplitPayment(idx)} className="text-[#f87171] hover:text-white transition-colors"><X size={16}/></button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <button 
                onClick={() => setIsSplitModalOpen(false)}
                className="w-full py-4 bg-[#252525] hover:bg-[#333] text-white font-bold rounded-xl tracking-widest uppercase transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* LEFT: Product Lookup & Quick Grid */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        
        {/* Search Bar (Borderless Flat Design) */}
        <div className="bg-[#1c1c1e] p-2 rounded-2xl flex items-center gap-4 group focus-within:shadow-[0_0_20px_rgba(0,122,255,0.1)] transition-all">
          <div className="w-12 h-12 flex items-center justify-center text-[#888888]">
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
            <h3 className="text-[#888888] font-bold text-sm uppercase tracking-widest">{t('pos_inventory')}</h3>
            {posStore.holdQueue.length > 0 && (
              <span className="bg-[#FFBD2E]/20 text-[#FFBD2E] text-[10px] px-2 py-1 rounded-full font-bold animate-pulse">
                {posStore.holdQueue.length} {t('pos_pending_bills')}
              </span>
            )}
          </div>
          
          {isLoadingItems ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="animate-spin text-[#007AFF]" size={32} />
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {inventory.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.barcode && p.barcode.includes(searchQuery))).map(item => {
                const inCart = posStore.cart.some(c => c.productId === item.id);
                
                return (
                  <button
                    key={item.id}
                    onClick={() => posStore.addToCart(item)}
                    className={`p-5 rounded-[2rem] transition-all duration-300 text-left active:scale-95 flex flex-col justify-between h-36 ${
                      inCart 
                        ? 'bg-[#007AFF] text-white shadow-[0_10px_30px_-10px_rgba(0,122,255,0.6)]' 
                        : 'bg-[#1c1c1e] hover:bg-[#252525] text-white shadow-sm'
                    }`}
                  >
                    <div>
                      <div className={`text-[10px] font-bold mb-1 uppercase tracking-widest transition-colors ${inCart ? 'text-white/80' : 'text-[#888888]'}`}>
                        {item.hsn_code || 'HSN'}
                      </div>
                      <h4 className="font-bold leading-tight line-clamp-2">{item.name}</h4>
                    </div>
                    <div className="flex items-end justify-between w-full mt-2">
                       <span className="text-xl font-black">₹{item.selling_price}</span>
                       <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                         inCart 
                          ? 'bg-white/20 text-white'
                          : item.stock_quantity > 5 ? 'bg-[#4ade80]/10 text-[#4ade80]' : 'bg-[#f87171]/10 text-[#f87171]'
                       }`}>
                         {item.stock_quantity} {item.unit}
                       </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Hold Queue Section */}
          {posStore.holdQueue.length > 0 && (
            <div className="mt-8 animate-in slide-in-from-bottom-2 duration-300">
              <h3 className="text-[#888888] font-bold text-sm uppercase tracking-widest mb-4">{t('pos_pending_bills')}</h3>
              <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar">
                {posStore.holdQueue.map((bill, index) => (
                  <button 
                    key={bill.id}
                    onClick={() => posStore.resumeBill(bill.id)}
                    className="flex-shrink-0 bg-[#FFBD2E]/10 p-4 rounded-2xl flex items-center gap-3 hover:bg-[#FFBD2E]/20 transition-all active:scale-95"
                  >
                    <PlayCircle size={20} className="text-[#FFBD2E]" />
                    <div className="text-left">
                      <p className="text-white text-xs font-bold">Bill #{index + 1}</p>
                      <p className="text-[#FFBD2E] text-[10px] font-medium">{bill.cart.length} Items • {bill.time}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Active Cart & Checkout (Borderless Dark Mode) */}
      <div className="w-[450px] bg-[#1c1c1e] rounded-[2.5rem] flex flex-col overflow-hidden shadow-[0_20px_40px_-15px_rgba(0,0,0,0.8)]">
        
        {/* Cart Header */}
        <div className="p-6 flex items-center justify-between">
          <h2 className="text-white font-bold text-lg tracking-tight">{t('pos_current_bill')}</h2>
          <div className="flex gap-2">
            <button 
              onClick={posStore.holdCurrentBill}
              title="Hold Bill"
              className="p-2.5 rounded-xl bg-[#252525] text-[#888888] hover:text-[#FFBD2E] hover:bg-[#FFBD2E]/10 transition-all active:scale-90"
            >
              <PauseCircle size={20} />
            </button>
            <button 
              onClick={posStore.clearCart}
              title="Clear Cart"
              className="p-2.5 rounded-xl bg-[#252525] text-[#888888] hover:text-[#f87171] hover:bg-[#f87171]/10 transition-all active:scale-90"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>

        {/* Customer Khata Link (Required for UDHAAR) */}
        <div className="px-6 pb-4">
          <div className="relative">
            <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888888]" />
            <select
              value={posStore.customerId || ''}
              onChange={(e) => posStore.setCustomer(e.target.value || null)}
              className="w-full bg-[#0a0a0a] p-4 pl-10 rounded-2xl text-white font-bold text-sm outline-none focus:ring-2 focus:ring-[#007AFF] cursor-pointer appearance-none"
            >
              <option value="">-- Walk-in Customer --</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.phone || 'No phone'})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Dynamic Cart List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-[#0a0a0a]">
          {posStore.cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-20 text-white">
              <Calculator size={64} strokeWidth={1} />
              <p className="mt-4 font-bold tracking-widest uppercase text-xs">{t('pos_waiting')}</p>
            </div>
          ) : (
            posStore.cart.map(item => (
              <div key={item.productId} className="bg-[#1c1c1e] p-4 rounded-3xl group animate-in slide-in-from-right-4 duration-300">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 pr-2">
                    <h4 className="text-sm font-bold text-white leading-tight line-clamp-1">{item.name}</h4>
                    <p className="text-[10px] font-bold text-[#888888] mt-1">₹{item.price} / unit • HSN: {item.hsn}</p>
                  </div>
                  <span className="text-sm font-black text-white text-right">
                    ₹{((item.price * item.qty) * (1 - item.discountPercent/100)).toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-[#0a0a0a] px-2 py-1 rounded-xl">
                    <button onClick={() => posStore.updateItem(item.productId, 'qty', Math.max(1, item.qty - 1))} className="text-[#888888] hover:text-white p-1 transition-colors"><Minus size={14}/></button>
                    <span className="w-6 text-center text-xs font-bold text-white">{item.qty}</span>
                    <button onClick={() => posStore.updateItem(item.productId, 'qty', item.qty + 1)} className="text-[#888888] hover:text-white p-1 transition-colors"><Plus size={14}/></button>
                  </div>
                  
                  <div className="flex items-center gap-1.5 bg-[#0a0a0a] px-3 py-1 rounded-xl flex-1 focus-within:ring-1 focus-within:ring-[#007AFF] transition-all">
                    <Percent size={12} className="text-[#666]" />
                    <input 
                      type="number" 
                      value={item.discountPercent || ''} 
                      onChange={(e) => posStore.updateItem(item.productId, 'discountPercent', Number(e.target.value))}
                      placeholder="0"
                      className="bg-transparent border-none outline-none text-[11px] font-bold text-[#4ade80] w-full placeholder-[#444]"
                    />
                    <span className="text-[9px] font-bold text-[#444] uppercase tracking-tighter">Disc</span>
                  </div>

                  <button onClick={() => posStore.removeItem(item.productId)} className="p-2 text-[#f87171] opacity-0 group-hover:opacity-100 transition-all active:scale-90"><Trash2 size={16}/></button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Summary & Checkout */}
        <div className="p-6 bg-[#1c1c1e] space-y-4">
          
          {checkoutError && (
            <div className="bg-[#f87171]/10 text-[#f87171] text-xs font-bold p-3 rounded-xl flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <p>{checkoutError}</p>
            </div>
          )}

          <div className="grid grid-cols-4 gap-2 relative">
            {['CASH', 'UPI', 'UDHAAR', 'SPLIT'].map(mode => (
              <button 
                key={mode}
                onClick={() => posStore.setPaymentMode(mode)}
                className={`py-3 rounded-xl text-[10px] font-bold tracking-widest transition-all ${
                  posStore.paymentMode === mode 
                    ? 'bg-[#007AFF] text-white shadow-[0_5px_20px_-5px_rgba(0,122,255,0.6)]' 
                    : 'bg-[#0a0a0a] text-[#888888] hover:bg-[#252525]'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {posStore.paymentMode === 'SPLIT' && (
            <div className="bg-[#0a0a0a] p-3 rounded-xl">
               <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-[#888888] uppercase tracking-widest">Split Config</span>
                  <button onClick={() => setIsSplitModalOpen(true)} className="text-[10px] font-bold bg-[#007AFF]/20 text-[#007AFF] px-2 py-1 rounded hover:bg-[#007AFF]/30 transition-colors uppercase tracking-widest">Edit</button>
               </div>
               {posStore.splitPayments.length === 0 ? (
                 <p className="text-[#555] text-xs font-bold">No payments mapped.</p>
               ) : (
                 posStore.splitPayments.map((sp, idx) => (
                   <div key={idx} className="flex justify-between text-xs font-bold text-white mb-1">
                     <span>{sp.mode}</span>
                     <span className="text-[#4ade80]">₹{sp.amount.toFixed(2)}</span>
                   </div>
                 ))
               )}
            </div>
          )}

          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-[13px] font-medium text-[#888888]">
              <span>{t('pos_subtotal')}</span>
              <span>₹{totals.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[13px] font-medium text-[#f87171]">
              <span>{t('pos_savings')}</span>
              <span>- ₹{totals.totalDiscount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[13px] font-medium text-[#4ade80]">
              <span>{t('pos_gst')}</span>
              <span>+ ₹{totals.totalTax.toFixed(2)}</span>
            </div>
            <div className="pt-4 flex justify-between items-end">
              <span className="text-white font-bold">{t('pos_grand_total')}</span>
              <span className="text-4xl font-black text-white tracking-tighter leading-none">
                ₹{totals.grandTotal.toFixed(2)}
              </span>
            </div>
          </div>

          <button 
            onClick={handleFinalCheckout}
            disabled={posStore.cart.length === 0 || isProcessing}
            className={`w-full py-5 rounded-[2rem] flex items-center justify-center gap-3 text-lg font-black tracking-widest transition-all mt-4 ${
              posStore.cart.length === 0 
                ? 'bg-[#0a0a0a] text-white/20 cursor-not-allowed' 
                : 'bg-[#007AFF] text-white hover:bg-[#007AFF]/80 shadow-[0_10px_40px_-10px_rgba(0,122,255,0.8)] active:scale-95'
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