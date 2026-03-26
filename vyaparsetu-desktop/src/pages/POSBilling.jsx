import React, { useState, useRef, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { 
  Search, Plus, Minus, Trash2, Printer, 
  Banknote, QrCode, BookDown, CheckCircle2,
  PauseCircle, PlayCircle, Calculator, Percent
} from 'lucide-react';

// Real-world Kirana items with HSN and GST defaults
const QUICK_ITEMS = [
  { id: 101, name: "Aashirvaad Atta 5kg", price: 245.00, gst: 5, hsn: "1101" },
  { id: 102, name: "Tata Salt 1kg", price: 28.00, gst: 0, hsn: "2501" },
  { id: 103, name: "Fortune Oil 1L", price: 155.00, gst: 5, hsn: "1512" },
  { id: 104, name: "Maggi 140g", price: 30.00, gst: 12, hsn: "1902" },
  { id: 105, name: "Amul Butter 100g", price: 56.00, gst: 12, hsn: "0405" },
  { id: 106, name: "Red Label Tea 250g", price: 140.00, gst: 5, hsn: "0902" },
  { id: 107, name: "Sugar 1kg", price: 44.00, gst: 5, hsn: "1701" },
  { id: 108, name: "Surf Excel 1kg", price: 135.00, gst: 18, hsn: "3402" },
];

export default function POSBilling() {
  const [cart, setCart] = useState([]);
  const [holdQueue, setHoldQueue] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentMode, setPaymentMode] = useState("CASH");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const searchInputRef = useRef(null);

  // Auto-focus for barcode scanners
  useEffect(() => {
    if (searchInputRef.current) searchInputRef.current.focus();
  }, [cart, holdQueue]);

  // --- CART LOGIC ---
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { 
        ...product, 
        qty: 1, 
        discountPercent: 0,
        sgstPercent: product.gst / 2,
        cgstPercent: product.gst / 2
      }];
    });
    setSearchQuery("");
  };

  const updateItem = (id, field, value) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        return updated;
      }
      return item;
    }));
  };

  const removeItem = (id) => setCart(prev => prev.filter(item => item.id !== id));

  // --- HOLD / RESUME LOGIC ---
  const holdCurrentBill = () => {
    if (cart.length === 0) return;
    setHoldQueue(prev => [...prev, { id: Date.now(), items: cart, time: new Date().toLocaleTimeString() }]);
    setCart([]);
  };

  const resumeBill = (holdId) => {
    const bill = holdQueue.find(b => b.id === holdId);
    if (cart.length > 0) {
      // If current cart isn't empty, hold it first
      setHoldQueue(prev => [...prev.filter(b => b.id !== holdId), { id: Date.now(), items: cart, time: new Date().toLocaleTimeString() }]);
    } else {
      setHoldQueue(prev => prev.filter(b => b.id !== holdId));
    }
    setCart(bill.items);
  };

  // --- FINANCIAL CALCULATIONS ---
  const totals = cart.reduce((acc, item) => {
    const gross = item.price * item.qty;
    const discount = gross * (item.discountPercent / 100);
    const taxable = gross - discount;
    const tax = taxable * ((item.sgstPercent + item.cgstPercent) / 100);
    
    acc.subtotal += gross;
    acc.totalDiscount += discount;
    acc.totalTax += tax;
    acc.grandTotal += (taxable + tax);
    return acc;
  }, { subtotal: 0, totalDiscount: 0, totalTax: 0, grandTotal: 0 });

  // --- CHECKOUT & PRINTING ---
  const handleFinalCheckout = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);

    try {
      const shopInfo = {
        name: "VyaparSetu Retail Store",
        address: "Main Market, Sector 12, India",
        contact: "+91 9876543210",
        gstin: "27AAAAA0000A1Z5"
      };

      // 1. Save to SQLite via Rust
      await invoke('create_invoice', {
        customerId: null,
        subtotal: totals.subtotal,
        discountPercent: 0, 
        discountAmount: totals.totalDiscount,
        taxAmount: totals.totalTax,
        totalAmount: totals.grandTotal,
        paymentMode: paymentMode,
        status: paymentMode === 'UDHAAR' ? 'UNPAID' : 'PAID'
      });

      // 2. Trigger Real Thermal Print Command
      await invoke('print_receipt', {
        receipt: {
          shop: shopInfo,
          items: cart.map(i => ({
            name: i.name,
            qty: i.qty,
            price: i.price,
            discount_percent: i.discountPercent,
            sgst_percent: i.sgstPercent,
            cgst_percent: i.cgstPercent
          })),
          payment_mode: paymentMode
        }
      });

      setCart([]);
      setPaymentMode("CASH");
    } catch (error) {
      console.error("POS Error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex h-full gap-6 select-none">
      
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
            placeholder="Scan Barcode or Search Item Name (Enter to Add)"
            className="flex-1 bg-transparent border-none outline-none text-xl font-medium text-white placeholder-[#666]"
            onKeyDown={(e) => {
              if(e.key === 'Enter' && searchQuery) {
                const item = QUICK_ITEMS.find(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
                if(item) addToCart(item);
              }
            }}
          />
        </div>

        {/* Quick Items Grid */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#A1A1AA] font-bold text-sm uppercase tracking-widest">Fast Selling Items</h3>
            {holdQueue.length > 0 && (
              <span className="bg-mac-yellow/20 text-mac-yellow text-[10px] px-2 py-1 rounded-full font-bold">
                {holdQueue.length} BILLS ON HOLD
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {QUICK_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => addToCart(item)}
                className="bg-brand-surface p-5 rounded-3xl border border-white/5 hover:border-brand-blue/40 hover:bg-white/5 transition-all text-left active:scale-95 group"
              >
                <div className="text-xs font-bold text-[#A1A1AA] mb-1 group-hover:text-brand-blue transition-colors uppercase">{item.hsn}</div>
                <h4 className="text-white font-bold leading-tight line-clamp-2 mb-3 h-10">{item.name}</h4>
                <div className="flex items-end justify-between">
                   <span className="text-2xl font-black text-white">₹{item.price}</span>
                   <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-[#A1A1AA]">{item.gst}% GST</span>
                </div>
              </button>
            ))}
          </div>

          {/* Hold Queue Section */}
          {holdQueue.length > 0 && (
            <div className="mt-8">
              <h3 className="text-[#A1A1AA] font-bold text-sm uppercase tracking-widest mb-4">Pending Bills</h3>
              <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar">
                {holdQueue.map((bill, index) => (
                  <button 
                    key={bill.id}
                    onClick={() => resumeBill(bill.id)}
                    className="flex-shrink-0 bg-mac-yellow/10 border border-mac-yellow/20 p-4 rounded-2xl flex items-center gap-3 hover:bg-mac-yellow/20 transition-all"
                  >
                    <PlayCircle size={20} className="text-mac-yellow" />
                    <div className="text-left">
                      <p className="text-white text-xs font-bold">Bill #{index + 1}</p>
                      <p className="text-mac-yellow text-[10px]">{bill.items.length} Items • {bill.time}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Active Cart & Checkout */}
      <div className="w-[450px] bg-brand-surface rounded-[2.5rem] border border-white/5 flex flex-col overflow-hidden shadow-2xl">
        
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-white font-bold text-lg tracking-tight">Current Bill</h2>
          <div className="flex gap-2">
            <button 
              onClick={holdCurrentBill}
              title="Hold Bill"
              className="p-2.5 rounded-xl bg-white/5 text-[#A1A1AA] hover:text-mac-yellow hover:bg-mac-yellow/10 transition-all"
            >
              <PauseCircle size={20} />
            </button>
            <button 
              onClick={() => setCart([])}
              title="Clear Cart"
              className="p-2.5 rounded-xl bg-white/5 text-[#A1A1AA] hover:text-mac-red hover:bg-mac-red/10 transition-all"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>

        {/* Dynamic Cart List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-20 text-white">
              <Calculator size={64} strokeWidth={1} />
              <p className="mt-4 font-bold tracking-widest uppercase text-xs">Waiting for items...</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="bg-brand-dark/50 p-4 rounded-3xl border border-white/5 group">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-white leading-tight line-clamp-1">{item.name}</h4>
                    <p className="text-[10px] font-bold text-[#A1A1AA] mt-1">₹{item.price} / unit • HSN: {item.hsn}</p>
                  </div>
                  <span className="text-sm font-black text-white ml-4">
                    ₹{((item.price * item.qty) * (1 - item.discountPercent/100)).toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Qty Control */}
                  <div className="flex items-center gap-2 bg-brand-dark px-2 py-1 rounded-xl border border-white/5">
                    <button onClick={() => updateItem(item.id, 'qty', Math.max(1, item.qty - 1))} className="text-[#A1A1AA] hover:text-white p-1"><Minus size={14}/></button>
                    <span className="w-6 text-center text-xs font-bold text-white">{item.qty}</span>
                    <button onClick={() => updateItem(item.id, 'qty', item.qty + 1)} className="text-[#A1A1AA] hover:text-white p-1"><Plus size={14}/></button>
                  </div>
                  
                  {/* Discount Input */}
                  <div className="flex items-center gap-1.5 bg-brand-dark px-3 py-1 rounded-xl border border-white/5 flex-1">
                    <Percent size={12} className="text-[#666]" />
                    <input 
                      type="number" 
                      value={item.discountPercent || ''} 
                      onChange={(e) => updateItem(item.id, 'discountPercent', Number(e.target.value))}
                      placeholder="0"
                      className="bg-transparent border-none outline-none text-[11px] font-bold text-mac-green w-full placeholder-[#444]"
                    />
                    <span className="text-[9px] font-bold text-[#444] uppercase tracking-tighter">Disc</span>
                  </div>

                  <button onClick={() => removeItem(item.id)} className="p-2 text-mac-red opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16}/></button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Summary & Checkout */}
        <div className="p-6 bg-black/20 border-t border-white/5 space-y-4">
          
          {/* Payment Tabs */}
          <div className="grid grid-cols-4 gap-2">
            {['CASH', 'UPI', 'UDHAAR', 'SPLIT'].map(mode => (
              <button 
                key={mode}
                onClick={() => setPaymentMode(mode)}
                className={`py-2.5 rounded-xl text-[10px] font-bold tracking-widest transition-all ${
                  paymentMode === mode 
                    ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20' 
                    : 'bg-white/5 text-[#A1A1AA] hover:bg-white/10'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-[13px] font-medium text-[#A1A1AA]">
              <span>Subtotal</span>
              <span>₹{totals.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[13px] font-medium text-mac-red/80">
              <span>Savings</span>
              <span>- ₹{totals.totalDiscount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[13px] font-medium text-mac-green/80">
              <span>GST (SGST+CGST)</span>
              <span>+ ₹{totals.totalTax.toFixed(2)}</span>
            </div>
            <div className="pt-2 mt-2 border-t border-white/5 flex justify-between items-end">
              <span className="text-white font-bold">Grand Total</span>
              <span className="text-4xl font-black text-white tracking-tighter leading-none">
                ₹{totals.grandTotal.toFixed(2)}
              </span>
            </div>
          </div>

          <button 
            onClick={handleFinalCheckout}
            disabled={cart.length === 0 || isProcessing}
            className={`w-full py-5 rounded-[2rem] flex items-center justify-center gap-3 text-lg font-black tracking-widest transition-all ${
              cart.length === 0 
                ? 'bg-white/5 text-white/20 cursor-not-allowed' 
                : 'bg-brand-blue text-white hover:bg-brand-blue/80 shadow-2xl shadow-brand-blue/20 active:scale-95'
            }`}
          >
            {isProcessing ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <><Printer size={22} /> PRINT & SAVE</>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}