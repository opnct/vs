import React, { useState, useRef, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { 
  Search, Plus, Minus, Trash2, Printer, 
  Banknote, QrCode, BookDown, CheckCircle2 
} from 'lucide-react';

// Typical Kirana frequent items for quick-tap billing
const FREQUENT_ITEMS = [
  { id: 1, name: "Aashirvaad Atta 5kg", price: 240.00, bgColor: "bg-pastel-pink", textColor: "text-rose-900" },
  { id: 2, name: "Tata Salt 1kg", price: 28.00, bgColor: "bg-pastel-peach", textColor: "text-orange-900" },
  { id: 3, name: "Fortune Soyabean Oil 1L", price: 145.00, bgColor: "bg-pastel-yellow", textColor: "text-yellow-900" },
  { id: 4, name: "Maggi 2-Min Noodles 140g", price: 30.00, bgColor: "bg-pastel-blue", textColor: "text-indigo-900" },
  { id: 5, name: "Amul Taaza Milk 500ml", price: 27.00, bgColor: "bg-pastel-purple", textColor: "text-purple-900" },
  { id: 6, name: "Brooke Bond Red Label 250g", price: 130.00, bgColor: "bg-pastel-pink", textColor: "text-rose-900" },
  { id: 7, name: "Sugar (Loose) 1kg", price: 42.00, bgColor: "bg-pastel-peach", textColor: "text-orange-900" },
  { id: 8, name: "Toor Dal (Loose) 1kg", price: 160.00, bgColor: "bg-pastel-blue", textColor: "text-indigo-900" },
];

export default function POSBilling() {
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentMode, setPaymentMode] = useState("CASH");
  const [discount, setDiscount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const searchInputRef = useRef(null);

  // Keep focus on search bar for barcode scanners
  useEffect(() => {
    if (searchInputRef.current) searchInputRef.current.focus();
  }, [cart]);

  // Cart Logic
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
    setSearchQuery("");
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : item;
      }
      return item;
    }));
  };

  const removeItem = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  // Financial Calculations
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const grandTotal = Math.max(0, subtotal - discount);

  // Real SQLite & Hardware Integration
  const handlePrintAndSave = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);

    try {
      const status = paymentMode === 'UDHAAR' ? 'UNPAID' : 'PAID';
      
      // 1. Save to native SQLite database via Rust
      const invoiceId = await invoke('create_invoice', {
        customerId: null, // Walk-in customer by default
        subtotal: subtotal,
        totalAmount: grandTotal,
        paymentMode: paymentMode,
        status: status
      });

      // 2. Format receipt for Thermal Printer
      const receiptText = `
        === VYAPARSETU RETAIL ===
        Bill No: ${invoiceId}
        Date: ${new Date().toLocaleString()}
        Mode: ${paymentMode}
        -------------------------
        Items: ${cart.length}
        Total: Rs. ${grandTotal.toFixed(2)}
        =========================
      `;

      // 3. Send raw byte command to LPT1/USB Thermal Printer via Rust
      await invoke('print_receipt', { receiptData: receiptText });

      // Reset UI for the next customer instantly
      setCart([]);
      setDiscount(0);
      setPaymentMode("CASH");
      
    } catch (error) {
      console.error("Billing Failed:", error);
      alert("Hardware or Database Error: " + error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex h-full gap-6 max-w-[1600px] mx-auto">
      
      {/* LEFT PANE: Product Selection & Barcode */}
      <div className="flex-1 flex flex-col gap-6">
        
        {/* Barcode / Search Input */}
        <div className="bg-white p-4 rounded-4xl shadow-soft-float border border-gray-100 flex items-center gap-4 transition-all focus-within:ring-4 ring-brand-bg">
          <div className="w-12 h-12 bg-pastel-blue rounded-2xl flex items-center justify-center shrink-0">
            <Search size={24} className="text-indigo-900" />
          </div>
          <input 
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchQuery) {
                // Mock barcode scan - grabs first matching item
                const found = FREQUENT_ITEMS.find(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
                if (found) addToCart(found);
              }
            }}
            placeholder="Scan barcode or search item name..."
            className="flex-1 bg-transparent text-2xl font-bold text-brand-text placeholder-brand-muted/50 border-none outline-none"
          />
        </div>

        {/* Frequent Items Grid */}
        <div className="flex-1 overflow-y-auto pr-2 pb-4">
          <h3 className="text-lg font-bold text-brand-text tracking-tight mb-4 flex items-center gap-2">
            Top Selling Items
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {FREQUENT_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => addToCart(item)}
                className={`${item.bgColor} p-5 rounded-3xl shadow-sm hover:shadow-soft-float transition-all active:scale-95 text-left border border-white/40 group relative overflow-hidden`}
              >
                <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-white/20 rounded-full blur-xl group-hover:bg-white/30 transition-all"></div>
                <h4 className={`text-sm font-bold ${item.textColor} leading-tight mb-2 pr-4`}>{item.name}</h4>
                <p className={`text-xl font-black ${item.textColor} tracking-tighter`}>₹{item.price}</p>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* RIGHT PANE: Live Cart & Checkout */}
      <div className="w-[420px] bg-white rounded-4xl shadow-soft-float border border-gray-50 flex flex-col shrink-0 overflow-hidden">
        
        {/* Cart Header */}
        <div className="p-6 border-b border-gray-50 bg-gray-50/50">
          <h2 className="text-xl font-black text-brand-text tracking-tight flex items-center justify-between">
            Current Bill
            <span className="text-sm font-bold bg-white px-3 py-1 rounded-full text-brand-muted shadow-sm">
              {cart.length} Items
            </span>
          </h2>
        </div>

        {/* Cart Items Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-brand-muted opacity-60">
              <ShoppingCartPlaceholder />
              <p className="font-bold mt-4 tracking-wide">Cart is empty</p>
              <p className="text-xs font-medium">Scan an item to begin billing</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="bg-brand-bg p-3.5 rounded-3xl flex items-center justify-between border border-gray-100 group">
                <div className="flex-1 pr-3">
                  <h4 className="text-sm font-bold text-brand-text leading-tight line-clamp-1">{item.name}</h4>
                  <p className="text-xs font-bold text-brand-muted mt-0.5">₹{item.price} / unit</p>
                </div>
                
                <div className="flex items-center gap-3 bg-white p-1 rounded-2xl shadow-sm border border-gray-50">
                  <button onClick={() => updateQty(item.id, -1)} className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-pastel-pink rounded-xl text-brand-text transition-colors">
                    <Minus size={14} strokeWidth={3} />
                  </button>
                  <span className="w-4 text-center font-black text-sm">{item.qty}</span>
                  <button onClick={() => updateQty(item.id, 1)} className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-pastel-blue rounded-xl text-brand-text transition-colors">
                    <Plus size={14} strokeWidth={3} />
                  </button>
                </div>

                <div className="w-20 text-right pl-3">
                  <p className="font-black text-brand-text">₹{(item.price * item.qty).toFixed(2)}</p>
                  <button onClick={() => removeItem(item.id)} className="text-[10px] font-bold text-red-400 hover:text-red-600 uppercase tracking-wider mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Checkout Controls Area */}
        <div className="p-6 bg-brand-bg border-t border-gray-100">
          
          {/* Payment Toggles */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            <PaymentBtn mode="CASH" icon={Banknote} current={paymentMode} set={setPaymentMode} color="bg-pastel-peach text-orange-900 ring-orange-200" />
            <PaymentBtn mode="UPI" icon={QrCode} current={paymentMode} set={setPaymentMode} color="bg-pastel-blue text-indigo-900 ring-indigo-200" />
            <PaymentBtn mode="UDHAAR" icon={BookDown} current={paymentMode} set={setPaymentMode} color="bg-pastel-pink text-rose-900 ring-rose-200" />
          </div>

          {/* Totals Calculation */}
          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center text-sm font-bold text-brand-muted">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-sm font-bold text-brand-muted">
              <span>Discount</span>
              <input 
                type="number" 
                value={discount || ''} 
                onChange={e => setDiscount(Number(e.target.value))}
                placeholder="0"
                className="w-20 bg-white border border-gray-200 rounded-lg text-right px-2 py-1 text-brand-text focus:ring-2 ring-pastel-blue outline-none"
              />
            </div>
            <div className="h-px w-full bg-gray-200 my-2"></div>
            <div className="flex justify-between items-end">
              <span className="text-brand-text font-black tracking-tight text-lg">Grand Total</span>
              <span className="text-4xl font-black text-brand-text tracking-tighter leading-none">
                ₹{grandTotal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Massive Action Button */}
          <button 
            onClick={handlePrintAndSave}
            disabled={cart.length === 0 || isProcessing}
            className={`w-full py-5 rounded-3xl flex items-center justify-center gap-3 text-lg font-black tracking-wide transition-all ${
              cart.length === 0 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-[#2a2845] text-white hover:bg-black shadow-soft-3d active:scale-[0.98]'
            }`}
          >
            {isProcessing ? (
              <span className="animate-pulse flex items-center gap-2">Processing...</span>
            ) : (
              <>
                <Printer size={24} />
                PRINT & SAVE BILL
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}

// Sub-components for cleaner code
const PaymentBtn = ({ mode, icon: Icon, current, set, color }) => {
  const isActive = current === mode;
  return (
    <button 
      onClick={() => set(mode)}
      className={`flex flex-col items-center justify-center py-3 rounded-2xl transition-all border ${
        isActive 
          ? `${color} border-transparent ring-4 ring-offset-2 ring-offset-brand-bg font-black scale-105 shadow-sm` 
          : 'bg-white border-gray-100 text-brand-muted hover:bg-gray-50 font-bold'
      }`}
    >
      <Icon size={20} className="mb-1.5" strokeWidth={isActive ? 2.5 : 2} />
      <span className="text-[10px] tracking-widest">{mode}</span>
    </button>
  );
};

const ShoppingCartPlaceholder = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="21" r="1" />
    <circle cx="19" cy="21" r="1" />
    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
  </svg>
);