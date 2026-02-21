import React, { useState, useEffect } from 'react';
import { ArrowDown, ArrowRight, Monitor, WifiOff, Barcode, Printer, Plus, Trash2, Clock, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FeaturePOS() {
  // --- REAL-TIME LOGIC: Live Clock for POS Simulator ---
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- INTERACTIVE LOGIC: POS Cart Simulator ---
  const [cart, setCart] = useState([]);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const inventory = [
    { id: 1, name: "Premium Tea 500g", price: 240, category: "FMCG" },
    { id: 2, name: "Basmati Rice 1kg", price: 150, category: "Grocery" },
    { id: 3, name: "Refined Oil 1L", price: 185, category: "Grocery" },
    { id: 4, name: "Detergent Soap", price: 65, category: "Household" },
  ];

  const addToCart = (item) => {
    setCart([...cart, { ...item, cartId: Date.now() + Math.random() }]);
    setCheckoutSuccess(false);
  };

  const removeFromCart = (cartId) => {
    setCart(cart.filter(item => item.cartId !== cartId));
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setCheckoutSuccess(true);
    setCart([]);
    setTimeout(() => setCheckoutSuccess(false), 3000);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
  const tax = subtotal * 0.05; // 5% mock tax
  const total = subtotal + tax;

  // --- INTERACTIVE LOGIC: Hardware Tabs ---
  const [activeTab, setActiveTab] = useState('printers');
  const hardwareTabs = [
    { id: 'printers', label: 'Thermal Printers', desc: 'Plug-and-play support for EPSON, TVS, and generic 2-inch/3-inch thermal receipt printers. USB, Bluetooth, and LAN compatible.' },
    { id: 'scanners', label: 'Barcode Scanners', desc: 'Instant integration with 1D and 2D laser barcode scanners. No driver installation required for standard USB scanners.' },
    { id: 'scales', label: 'Weighing Scales', desc: 'Connect serial COM port weighing scales to auto-fetch weights directly into the billing screen for loose items.' }
  ];

  return (
    <div className="flex flex-col w-full bg-white text-black animate-in fade-in duration-700 min-h-screen">
      
      {/* 1. HERO SECTION (Earth.gov Full Bleed Style) */}
      <section className="relative w-full h-[60vh] min-h-[500px] flex items-center justify-start px-6 md:px-12 lg:px-24 overflow-hidden border-b border-[#333]">
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 to-black/40 z-10"></div>
        <img 
          src="https://plus.unsplash.com/premium_photo-1683746792239-6ce8cdd3ac78?auto=format&fit=crop&q=80" 
          alt="Retail Checkout" 
          className="absolute inset-0 w-full h-full object-cover z-0 object-center opacity-40 grayscale"
        />
        
        <div className="relative z-20 max-w-4xl pt-16">
          <div className="bg-[#005ea2] text-white text-[11px] font-bold px-2 py-1 rounded-sm inline-flex items-center w-max mb-6 uppercase tracking-wider">
            Vyapar Theme Module
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-[6rem] font-bold text-white tracking-tight leading-[1.05] mb-6 uppercase">
            SMART <br /> POINT OF SALE
          </h1>
          <p className="text-xl md:text-2xl text-[#cccccc] max-w-2xl font-normal tracking-wide mb-10">
            Lightning-fast billing infrastructure engineered for high-volume Indian retail, operating seamlessly with or without internet.
          </p>
          <a 
            href="#simulator"
            className="inline-flex items-center gap-3 bg-[#005ea2] hover:bg-[#0b4774] text-white px-8 py-4 font-bold tracking-wider transition-colors text-[13px] uppercase rounded-sm mb-20 md:mb-28"
          >
            Try Live Simulator <ArrowDown size={18} strokeWidth={2.5}/>
          </a>
        </div>
      </section>

      {/* 2. INTERACTIVE POS SIMULATOR SECTION */}
      <section id="simulator" className="w-full py-24 px-6 md:px-12 lg:px-24 bg-gray-50 border-b border-gray-200 scroll-mt-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-[22px] font-bold tracking-widest uppercase mb-4 text-black">
            LIVE DEMONSTRATION
          </h2>
          <p className="text-[#555555] max-w-3xl mb-12 text-[17px] leading-relaxed">
            Experience the speed of the VyaparSetu billing engine. In a real environment, this process is automated via barcode scanners. Click items below to simulate adding them to a customer's cart.
          </p>

          <div className="grid lg:grid-cols-12 gap-8">
            {/* Simulator: Left Item Grid */}
            <div className="lg:col-span-7 bg-white border border-gray-200 p-6 rounded-sm shadow-sm">
              <h3 className="text-[15px] font-bold tracking-wider uppercase mb-6 border-b border-gray-100 pb-4">Quick Add Inventory</h3>
              <div className="grid grid-cols-2 gap-4">
                {inventory.map(item => (
                  <button 
                    key={item.id} 
                    onClick={() => addToCart(item)}
                    className="flex flex-col items-start p-4 border border-gray-200 rounded-sm hover:border-[#005ea2] hover:bg-[#f0f8ff] transition-all text-left group"
                  >
                    <span className="text-[11px] text-[#888] font-bold uppercase tracking-wider mb-2">{item.category}</span>
                    <span className="text-[15px] font-bold text-black mb-1">{item.name}</span>
                    <div className="flex w-full justify-between items-center mt-2">
                      <span className="text-[#005ea2] font-bold">₹{item.price}</span>
                      <Plus size={18} className="text-gray-400 group-hover:text-[#005ea2]" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Simulator: Right Cart/Receipt */}
            <div className="lg:col-span-5 bg-[#111111] text-white p-6 rounded-sm shadow-xl flex flex-col font-mono relative overflow-hidden">
              {checkoutSuccess && (
                <div className="absolute inset-0 bg-green-600 z-20 flex flex-col items-center justify-center animate-in fade-in duration-300">
                  <CheckCircle2 size={64} className="mb-4 text-white" />
                  <h3 className="text-2xl font-bold uppercase tracking-wider">Payment Received</h3>
                </div>
              )}

              <div className="flex justify-between items-center border-b border-[#333] pb-4 mb-4">
                <div>
                  <h3 className="text-lg font-bold tracking-widest uppercase">VyaparSetu Terminal</h3>
                  <p className="text-[#888] text-xs flex items-center gap-1 mt-1"><Clock size={12}/> {time.toLocaleTimeString()}</p>
                </div>
                <div className="text-right">
                  <span className="bg-green-900 text-green-300 text-[10px] px-2 py-1 uppercase font-bold tracking-widest rounded-sm">Online</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto min-h-[250px] max-h-[250px] pr-2 custom-scrollbar">
                {cart.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-[#555] text-sm uppercase tracking-widest">
                    Scan items to begin
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {cart.map((item, idx) => (
                      <div key={item.cartId} className="flex justify-between items-center bg-[#222] p-3 rounded-sm animate-in slide-in-from-left-2">
                        <div className="flex gap-3 items-center">
                          <span className="text-[#555] text-xs w-4">{idx + 1}.</span>
                          <span className="text-sm">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm">₹{item.price}</span>
                          <button onClick={() => removeFromCart(item.cartId)} className="text-red-400 hover:text-red-300"><Trash2 size={16}/></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-[#333] pt-4 mt-4 space-y-2">
                <div className="flex justify-between text-[#aaa] text-sm">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#aaa] text-sm">
                  <span>CGST/SGST (5%)</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white text-2xl font-bold mt-2 pt-2 border-t border-[#333]">
                  <span>TOTAL</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>

              <button 
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className="w-full mt-6 bg-[#005ea2] disabled:bg-[#333] disabled:text-[#555] hover:bg-[#0b4774] text-white py-4 font-bold tracking-widest uppercase transition-colors rounded-sm"
              >
                F12 : Complete Checkout
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE INFRASTRUCTURE (Topographic Dark Section) */}
      <section className="relative w-full bg-[#181818] py-24 px-6 md:px-12 lg:px-24 overflow-hidden border-b border-[#333]">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(circle_at_center,_transparent_0,_transparent_10px,_white_11px,_white_12px)] [background-size:60px_60px]"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto">
          <h2 className="text-[22px] font-bold tracking-widest uppercase mb-12 text-white">
            ENTERPRISE-GRADE ARCHITECTURE
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-[#222222] border border-[#333333] p-8 md:p-10 rounded-sm">
              <WifiOff className="text-[#005ea2] mb-6" size={40} strokeWidth={1.5} />
              <h3 className="text-2xl font-bold tracking-wide mb-4 text-white">Offline-First Engine</h3>
              <p className="text-[#aaaaaa] leading-relaxed text-[15px]">
                Indian retail faces frequent network interruptions. Our smart POS caches all transactions locally and securely in the browser logic. The moment connection is restored, it bulk-syncs with our secure cloud servers without interrupting the cashier's flow.
              </p>
            </div>

            <div className="bg-[#222222] border border-[#333333] p-8 md:p-10 rounded-sm">
              <Barcode className="text-[#005ea2] mb-6" size={40} strokeWidth={1.5} />
              <h3 className="text-2xl font-bold tracking-wide mb-4 text-white">FMCG Database Protocol</h3>
              <p className="text-[#aaaaaa] leading-relaxed text-[15px]">
                Pre-loaded with over 100,000 common Indian FMCG barcodes. Scan a new item, and VyaparSetu automatically fetches the product name, brand, and default MRP, reducing manual data entry for store owners by 90%.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HARDWARE COMPATIBILITY LOGIC */}
      <section className="w-full py-24 px-6 md:px-12 lg:px-24 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 items-start">
          
          <div className="lg:w-1/3 w-full shrink-0">
            <h2 className="text-[22px] font-bold tracking-widest uppercase mb-8 text-black">
              PLUG & PLAY HARDWARE
            </h2>
            <div className="flex flex-col border-l-2 border-gray-200">
              {hardwareTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`text-left py-4 pl-6 text-[15px] font-bold tracking-wider uppercase transition-all relative ${
                    activeTab === tab.id ? 'text-[#005ea2]' : 'text-gray-400 hover:text-black'
                  }`}
                >
                  {activeTab === tab.id && (
                    <div className="absolute left-[-2px] top-0 bottom-0 w-1 bg-[#005ea2]"></div>
                  )}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="lg:w-2/3 w-full bg-gray-50 border border-gray-200 p-8 md:p-12 rounded-sm min-h-[300px] flex flex-col justify-center animate-in fade-in zoom-in-95 duration-300" key={activeTab}>
            {activeTab === 'printers' && <Printer className="text-[#005ea2] mb-6" size={48} strokeWidth={1.5}/>}
            {activeTab === 'scanners' && <Barcode className="text-[#005ea2] mb-6" size={48} strokeWidth={1.5}/>}
            {activeTab === 'scales' && <Monitor className="text-[#005ea2] mb-6" size={48} strokeWidth={1.5}/>}
            
            <h3 className="text-3xl font-bold tracking-tight text-black mb-4">
              {hardwareTabs.find(t => t.id === activeTab).label}
            </h3>
            <p className="text-[#555555] text-[17px] leading-relaxed max-w-xl">
              {hardwareTabs.find(t => t.id === activeTab).desc}
            </p>
          </div>

        </div>
      </section>

      {/* 5. FOOTER CTA */}
      <section className="w-full bg-[#0a0a0a] py-24 px-6 md:px-12 lg:px-24 border-t border-[#333]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-[3.5rem] md:text-[5rem] font-bold tracking-tight text-white mb-8 uppercase leading-[1.05]">
            UPGRADE YOUR <br className="hidden md:block" /> COUNTER
          </h2>
          <p className="text-[#aaaaaa] text-lg md:text-xl max-w-3xl leading-relaxed mb-12">
            Stop relying on calculators and memory. Deploy VyaparSetu's Smart POS today and experience enterprise-level speed. Data migration from legacy software is handled entirely by our implementation specialists.
          </p>
          <Link 
            to="/pricing" 
            className="inline-flex items-center gap-3 bg-white hover:bg-gray-200 text-black px-8 py-4 font-bold tracking-wider uppercase transition-colors text-[13px] rounded-sm"
          >
            View Pricing Plans <ArrowRight size={18} strokeWidth={2.5}/>
          </Link>
        </div>
      </section>

    </div>
  );
}