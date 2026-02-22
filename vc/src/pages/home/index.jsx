import React from 'react';
import { ArrowDown, ArrowRight, ExternalLink, Globe, LayoutGrid, Database, BarChart3, Sparkles, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

const modules = [
  { name: 'AI Stock Predictor', desc: 'Predictive inventory based on local festivals and weather', path: '/features/ai-stock-predictor' },
  { name: 'Smart Shelf Mapping', desc: 'Visual store layout mapping for staff efficiency', path: '/features/smart-shelf-mapping' },
  { name: 'Voice Billing Engine', desc: 'Vernacular voice-to-text billing for loose items', path: '/features/voice-billing-engine' },
  { name: 'WhatsApp Catalogs', desc: 'Self-updating local e-commerce store in WhatsApp', path: '/features/whatsapp-catalogs' },
  { name: 'Dynamic Pricing Engine', desc: 'Auto-adjust margins based on expiry/competitor data', path: '/features/dynamic-pricing-engine' },
  { name: 'Supplier Bidding Hub', desc: 'Reverse auction system for local distributors', path: '/features/supplier-bidding-hub' },
  { name: 'Staff Fraud Detector', desc: 'AI analysis of voided bills and cash openings', path: '/features/staff-fraud-detector' },
  { name: 'Micro-Lending Connect', desc: 'Instant working capital based on transaction data', path: '/features/micro-lending-connect' },
  { name: 'Community Group Buy', desc: 'Pool orders with nearby stores for wholesale rates', path: '/features/community-group-buy' },
  { name: 'Expiry Liquidation', desc: 'Connect to local businesses to sell near-expiry goods', path: '/features/expiry-liquidation-network' },
  { name: 'OCR Inward Billing', desc: 'Digitalize physical supplier invoices instantly', path: '/features/ocr-inward-billing' },
  { name: 'UPI Recon Engine', desc: 'Real-time matching of bank statements with sales', path: '/features/upi-reconciliation-engine' },
  { name: 'Digital Gold Change', desc: 'Small change investment in gold for customers', path: '/features/digital-gold-change' },
  { name: 'Offline Mesh Sync', desc: 'Sync across devices without active internet', path: '/features/offline-mesh-sync' },
  { name: 'Brand Monetization', desc: 'Revenue from in-store digital brand ads', path: '/features/kirana-brand-monetization' },
  { name: 'Quick-Commerce Bridge', desc: 'Connect inventory to Blinkit, Zepto, and Instamart', path: '/features/omnichannel-qcom-bridge' },
  { name: 'Cash Tracker', desc: 'Real-time drawer cash denomination monitoring', path: '/features/cash-denomination-tracker' },
  { name: 'Local Delivery Pool', desc: 'Shared delivery fleet for nearby retailers', path: '/features/local-delivery-pooling' },
  { name: 'Khata Credit Score', desc: 'Algorithmic credit worthiness for Udhaar customers', path: '/features/khata-credit-scoring' },
  { name: 'Auto-GST Categorizer', desc: 'Automatic HSN finding and tax mapping', path: '/features/auto-gst-categorization' },
  { name: 'WhatsApp Loyalty', desc: 'Scratch cards and rewards inside WhatsApp', path: '/features/loyalty-gamification-whatsapp' },
  { name: 'Mandi Rate Tracker', desc: 'Live price feeds from regional mandis', path: '/features/mandi-rate-tracker' },
  { name: 'FMCG Scheme Tracker', desc: 'Automated alerts for bulk manufacturer schemes', path: '/features/fmcg-scheme-tracker' },
  { name: 'Power Outage Mode', desc: 'Low-power optimized UI for long power cuts', path: '/features/power-outage-mode' },
  { name: 'Loose Item Catalog', desc: 'SKU management for unbranded/loose goods', path: '/features/loose-item-cataloging' },
  { name: 'Store Health', desc: 'Real-time ROI, wastage, and footfall heatmaps', path: '/features/store-health-dashboard' },
  { name: 'Vernacular Receipts', desc: 'Print bills in regional Indian languages', path: '/features/multi-lingual-receipts' },
  { name: 'AI CCTV Integration', desc: 'Theft detection using existing shop cameras', path: '/features/ai-cctv-integration' },
  { name: 'Price Index', desc: 'Compare rates with local area averages', path: '/features/community-price-index' },
  { name: 'Direct Sourcing', desc: 'Supply chain portal for direct farm buying', path: '/features/direct-to-farmer-sourcing' },
  { name: 'Staff Training', desc: 'Voice modules for training shop personnel', path: '/features/staff-vernacular-training' },
  { name: 'License Vault', desc: 'Track FSSAI, Trade, and Fire license expiry', path: '/features/automated-license-renewal' },
  { name: 'Hyperlocal Ads', desc: 'Run targeted ads for customers within 2km', path: '/features/hyperlocal-ads-manager' },
  { name: 'Barter Ledger', desc: 'Manage non-cash exchanges and service barters', path: '/features/udhaar-barter-system' },
  { name: 'Order Chatbot', desc: 'Automated customer ordering via WhatsApp', path: '/features/whatsapp-chatbot-ordering' },
  { name: 'Smart Return Management', desc: 'Root cause analysis for returns and wastage', path: '/features/smart-return-management' },
  { name: 'Staff Wage Manager', desc: 'Attendance and daily payouts for workers', path: '/features/daily-wage-chhotu-manager' },
  { name: 'Festival Planner', desc: 'Marketing campaigns for regional holidays', path: '/features/regional-festival-promos' },
  { name: 'Customer Recognition', desc: 'Greet VIP customers via entry recognition', path: '/features/customer-face-recognition' },
  { name: 'IoT Scale Sync', desc: 'Automatic pull from digital weighing scales', path: '/features/smart-weighing-iot' },
  { name: 'Payment Scheduler', desc: 'Automated payment reminders and cycle alerts', path: '/features/supplier-payment-scheduler' },
  { name: 'Dietary Alerts', desc: 'Sugar/allergen identification during checkout', path: '/features/customer-dietary-alerts' },
  { name: 'Sustainability Tracker', desc: 'Monitor reduction in plastic bag usage', path: '/features/plastic-waste-tracker' },
  { name: 'Hardware Rental', desc: 'Rent POS, deep freezers, and printers', path: '/features/hardware-rental-portal' },
  { name: 'Wholesale Split Billing', desc: 'Separate business/personal items in one bill', path: '/features/wholesale-split-billing' },
  { name: 'ITC Optimizer', desc: 'Maximize Input Tax Credit automatically', path: '/features/b2b-tax-credit-optimizer' },
  { name: 'Dead Stock Alerts', desc: 'Identify items stagnant for 90+ days', path: '/features/seasonal-dead-stock-alerts' },
  { name: 'QR Audio Box', desc: 'Custom sounds for payment confirmation', path: '/features/qr-audio-box-integration' },
  { name: 'SMS Engine', desc: 'Reach non-smartphone users via bulk SMS', path: '/features/sms-marketing-engine' },
  { name: 'Compliance Vault', desc: 'Digital reports for shop inspectors', path: '/features/shop-act-compliance-vault' },
  { name: 'Route Planner', desc: 'Optimize delivery routes for local vans', path: '/features/distributor-route-planner' },
  { name: 'Queue Manager', desc: 'Digital token system for counter crowds', path: '/features/counter-queue-manager' },
  { name: 'Packaging Calc', desc: 'Precision margin after packaging costs', path: '/features/packaging-cost-calculator' },
  { name: 'Micro-Insurance', desc: 'Insurance for Kirana workers and property', path: '/features/micro-insurance-portal' }
];

export default function Home() {
  return (
    <div className="flex flex-col w-full bg-black text-white animate-in fade-in duration-700 font-sans">
      
      {/* 1. Hero Section (Earth.gov Full Bleed Image Style) */}
      <section className="relative w-full h-[85vh] flex items-center justify-start px-6 md:px-12 lg:px-24 overflow-hidden">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80" 
          alt="Retail Store Background" 
          className="absolute inset-0 w-full h-full object-cover z-0 object-center opacity-70 grayscale"
        />
        
        {/* Hero Content */}
        <div className="relative z-20 max-w-4xl pt-20">
          <h1 className="text-5xl md:text-7xl lg:text-[7rem] font-bold text-white tracking-tight leading-[1.05] mb-10 uppercase">
            SOFTWARE FOR <br /> RETAIL STORES
          </h1>
          <div className="flex flex-wrap items-center gap-4">
            <Link 
              to="/pricing" 
              className="inline-flex items-center gap-3 bg-[#005ea2] hover:bg-[#0b4774] text-white px-8 py-4 font-bold tracking-wider transition-colors text-[15px] uppercase shadow-lg shadow-[#005ea2]/20"
            >
              GET STARTED <ArrowRight size={20} strokeWidth={2.5}/>
            </Link>
            <a 
              href="#explore-themes" 
              className="inline-flex items-center gap-3 bg-transparent border border-white hover:bg-white hover:text-black text-white px-8 py-4 font-bold tracking-wider transition-colors text-[15px] uppercase"
            >
              EXPLORE <ArrowDown size={20} strokeWidth={2.5}/>
            </a>
          </div>
        </div>
      </section>

      {/* 2. Themes/Modules Section (Carousel of Portrait Cards) */}
      <section id="explore-themes" className="w-full bg-black py-24 px-6 md:px-12 lg:px-24">
        <h2 className="text-[22px] font-bold tracking-widest uppercase mb-12 border-b border-white/20 pb-4 inline-block text-white">
          LEARN ABOUT VYAPAR THEMES
        </h2>
        
        <div className="flex gap-6 overflow-x-auto pb-8 snap-x hide-scrollbar scroll-smooth">
          {modules.slice(0, 4).map((m, i) => (
            <Link key={i} to={m.path} className="relative w-[320px] md:w-[380px] h-[480px] shrink-0 rounded-lg overflow-hidden group snap-start cursor-pointer block border border-white/10 hover:border-white/30 transition-colors">
              <img 
                src={`https://images.unsplash.com/photo-${i === 0 ? '1604719312566-8912e9227c6a' : i === 1 ? '1586528116311-ad8ed745eb33' : i === 2 ? '1554224155-6726b3ff858f' : '1542838132-92c53300491e'}?auto=format&fit=crop&q=80`} 
                alt={m.name} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/100 via-black/40 to-transparent"></div>
              
              <div className="absolute top-4 left-4 bg-white text-black text-[11px] font-bold px-2 py-1 rounded flex items-center gap-1.5 uppercase tracking-widest">
                {i % 2 === 0 ? <Globe size={12} /> : <Database size={12} />} Vyapar Theme
              </div>
              
              <div className="absolute bottom-6 left-6 right-6">
                <h3 className="text-2xl font-bold tracking-wide uppercase flex items-center gap-2 mb-2 leading-tight">
                  {m.name} <span className="bg-[#005ea2] rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0"><ArrowRight size={16}/></span>
                </h3>
                <p className="text-zinc-400 text-sm leading-snug line-clamp-2">{m.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Interactives Section */}
      <section className="w-full bg-[#0a0a0a] py-24 px-6 md:px-12 lg:px-24">
        <h2 className="text-[22px] font-bold tracking-widest uppercase mb-12 border-b border-white/20 pb-4 inline-block text-white">
          INTERACTIVES
        </h2>
        
        <Link to="/chatbot" className="relative block w-full rounded-2xl overflow-hidden bg-[#111] min-h-[450px] flex items-center p-8 md:p-16 border border-[#222] group hover:border-[#444] transition-colors">
          {/* Mock Interactive graphic */}
          <div className="absolute right-0 top-0 bottom-0 w-full md:w-2/3 opacity-30 pointer-events-none overflow-hidden">
            <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#005ea2]/40 via-black to-[#0a0a0a] absolute inset-0 z-10"></div>
            <img 
              src="https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80" 
              className="absolute inset-0 w-full h-full object-cover mix-blend-screen opacity-50 grayscale group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100" 
              alt="AI Engine" 
            />
          </div>
          
          <div className="relative z-20 max-w-xl">
            <div className="bg-white text-black text-[11px] font-bold px-3 py-1.5 rounded inline-flex items-center gap-2 mb-6 uppercase tracking-widest">
              <MessageSquare size={14} /> Interactive
            </div>
            <h3 className="text-4xl md:text-6xl font-bold tracking-tighter uppercase flex items-center gap-4 mb-6 leading-none">
              <span className="border-b-4 border-[#005ea2] pb-1">VYAPAR AI CORE</span> 
              <span className="bg-[#005ea2] text-white p-2 rounded-full transition-all group-hover:px-6 shrink-0 mt-2">
                <ArrowRight size={24} />
              </span>
            </h3>
            <p className="text-[#cccccc] text-lg leading-relaxed mt-6">
              Interact directly with the VyaparSetu AI Assistant. Issue voice commands to generate bills, analyze market trends, and navigate complex inventory data in real-time.
            </p>
          </div>
        </Link>
      </section>

      {/* 4. Portals Section (Topographic Background Style) */}
      <section className="relative w-full bg-[#181818] py-24 px-6 md:px-12 lg:px-24 overflow-hidden border-t border-[#333]">
        {/* Topographic SVG pattern simulation via CSS radial gradients */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(circle_at_center,_transparent_0,_transparent_10px,_white_11px,_white_12px)] [background-size:60px_60px]"></div>
        
        <div className="relative z-10 max-w-[1400px] mx-auto">
          <h2 className="text-[22px] font-bold tracking-widest uppercase mb-12 border-b border-white/20 pb-4 inline-block text-white">
            EXPLORE OUR PORTALS
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {modules.slice(4).map((m, i) => (
              <div key={i} className="bg-[#222222] rounded-xl flex flex-col md:flex-row overflow-hidden border border-[#333] hover:border-[#555] transition-colors group">
                <div className="w-full md:w-2/5 h-48 md:h-auto shrink-0 relative overflow-hidden">
                  <img 
                    src={`https://images.unsplash.com/photo-1534452203294-45c851ec76f7?auto=format&fit=crop&q=80&sig=${i+20}`} 
                    alt={m.name} 
                    className="absolute inset-0 w-full h-full object-cover grayscale opacity-60 group-hover:scale-110 transition-transform duration-700" 
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500"></div>
                </div>
                
                <div className="p-6 md:p-8 flex flex-col justify-center flex-1 bg-[#1a1a1a]">
                  <div className="bg-white/10 text-zinc-300 text-[10px] font-bold px-2 py-1 rounded inline-flex items-center gap-1.5 w-max mb-4 uppercase tracking-widest">
                    <LayoutGrid size={12} /> Portal
                  </div>
                  <h3 className="text-xl font-bold tracking-tight uppercase mb-3 text-white group-hover:text-[#005ea2] transition-colors leading-snug">
                    {m.name}
                  </h3>
                  <p className="text-[#aaaaaa] leading-relaxed mb-6 text-[14px]">
                    {m.desc}
                  </p>
                  <Link to={m.path} className="text-[#4da8ec] hover:text-[#7bbcf0] font-bold flex items-center gap-2 text-[13px] uppercase tracking-widest mt-auto">
                    Open Portal <ExternalLink size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}

          </div>
        </div>
      </section>

      {/* Global CSS overrides for the hide-scrollbar class */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}