import os

# Configuration
FEATURE_DIR = "src/pages/features"
HOME_DIR = "src/pages/home"
CHATBOT_DIR = "src/pages/chatbot"
COMP_DIR = "src/components"
SRC_DIR = "src"

features = [
    ("ai-stock-predictor.jsx", "AI Stock Predictor", "Predictive inventory based on local festivals and weather"),
    ("smart-shelf-mapping.jsx", "Smart Shelf Mapping", "Visual store layout mapping for staff efficiency"),
    ("voice-billing-engine.jsx", "Voice Billing Engine", "Vernacular voice-to-text billing for loose items"),
    ("whatsapp-catalogs.jsx", "WhatsApp Catalogs", "Self-updating local e-commerce store in WhatsApp"),
    ("dynamic-pricing-engine.jsx", "Dynamic Pricing Engine", "Auto-adjust margins based on expiry/competitor data"),
    ("supplier-bidding-hub.jsx", "Supplier Bidding Hub", "Reverse auction system for local distributors"),
    ("staff-fraud-detector.jsx", "Staff Fraud Detector", "AI analysis of voided bills and cash openings"),
    ("micro-lending-connect.jsx", "Micro-Lending Connect", "Instant working capital based on transaction data"),
    ("community-group-buy.jsx", "Community Group Buy", "Pool orders with nearby stores for wholesale rates"),
    ("expiry-liquidation-network.jsx", "Expiry Liquidation", "Connect to local businesses to sell near-expiry goods"),
    ("ocr-inward-billing.jsx", "OCR Inward Billing", "Digitalize physical supplier invoices instantly"),
    ("upi-reconciliation-engine.jsx", "UPI Recon Engine", "Real-time matching of bank statements with sales"),
    ("digital-gold-change.jsx", "Digital Gold Change", "Small change investment in gold for customers"),
    ("offline-mesh-sync.jsx", "Offline Mesh Sync", "Sync across devices without active internet"),
    ("kirana-brand-monetization.jsx", "Brand Monetization", "Revenue from in-store digital brand ads"),
    ("omnichannel-qcom-bridge.jsx", "Quick-Commerce Bridge", "Connect inventory to Blinkit, Zepto, and Instamart"),
    ("cash-denomination-tracker.jsx", "Cash Tracker", "Real-time drawer cash denomination monitoring"),
    ("local-delivery-pooling.jsx", "Local Delivery Pool", "Shared delivery fleet for nearby retailers"),
    ("khata-credit-scoring.jsx", "Khata Credit Score", "Algorithmic credit worthiness for Udhaar customers"),
    ("auto-gst-categorization.jsx", "Auto-GST Categorizer", "Automatic HSN finding and tax mapping"),
    ("loyalty-gamification-whatsapp.jsx", "WhatsApp Loyalty", "Scratch cards and rewards inside WhatsApp"),
    ("mandi-rate-tracker.jsx", "Mandi Rate Tracker", "Live price feeds from regional mandis"),
    ("fmcg-scheme-tracker.jsx", "FMCG Scheme Tracker", "Automated alerts for bulk manufacturer schemes"),
    ("power-outage-mode.jsx", "Power Outage Mode", "Low-power optimized UI for long power cuts"),
    ("loose-item-cataloging.jsx", "Loose Item Catalog", "SKU management for unbranded/loose goods"),
    ("store-health-dashboard.jsx", "Store Health", "Real-time ROI, wastage, and footfall heatmaps"),
    ("multi-lingual-receipts.jsx", "Vernacular Receipts", "Print bills in regional Indian languages"),
    ("ai-cctv-integration.jsx", "AI CCTV Integration", "Theft detection using existing shop cameras"),
    ("community-price-index.jsx", "Price Index", "Compare rates with local area averages"),
    ("direct-to-farmer-sourcing.jsx", "Direct Sourcing", "Supply chain portal for direct farm buying"),
    ("staff-vernacular-training.jsx", "Staff Training", "Voice modules for training shop personnel"),
    ("automated-license-renewal.jsx", "License Vault", "Track FSSAI, Trade, and Fire license expiry"),
    ("hyperlocal-ads-manager.jsx", "Hyperlocal Ads", "Run targeted ads for customers within 2km"),
    ("udhaar-barter-system.jsx", "Barter Ledger", "Manage non-cash exchanges and service barters"),
    ("whatsapp-chatbot-ordering.jsx", "Order Chatbot", "Automated customer ordering via WhatsApp"),
    ("smart-return-management.jsx", "Smart Returns", "Root cause analysis for returns and wastage"),
    ("daily-wage-chhotu-manager.jsx", "Staff Wage Manager", "Attendance and daily payouts for workers"),
    ("regional-festival-promos.jsx", "Festival Planner", "Marketing campaigns for regional holidays"),
    ("customer-face-recognition.jsx", "Customer Recognition", "Greet VIP customers via entry recognition"),
    ("smart-weighing-iot.jsx", "IoT Scale Sync", "Automatic pull from digital weighing scales"),
    ("supplier-payment-scheduler.jsx", "Payment Scheduler", "Automated payment reminders and cycle alerts"),
    ("customer-dietary-alerts.jsx", "Dietary Alerts", "Sugar/allergen identification during checkout"),
    ("plastic-waste-tracker.jsx", "Sustainability Tracker", "Monitor reduction in plastic bag usage"),
    ("hardware-rental-portal.jsx", "Hardware Rental", "Rent POS, deep freezers, and printers"),
    ("wholesale-split-billing.jsx", "Split Billing", "Separate business/personal items in one bill"),
    ("b2b-tax-credit-optimizer.jsx", "ITC Optimizer", "Maximize Input Tax Credit automatically"),
    ("seasonal-dead-stock-alerts.jsx", "Dead Stock Alerts", "Identify items stagnant for 90+ days"),
    ("qr-audio-box-integration.jsx", "QR Audio Box", "Custom sounds for payment confirmation"),
    ("sms-marketing-engine.jsx", "SMS Engine", "Reach non-smartphone users via bulk SMS"),
    ("shop-act-compliance-vault.jsx", "Compliance Vault", "Digital reports for shop inspectors"),
    ("distributor-route-planner.jsx", "Route Planner", "Optimize delivery routes for local vans"),
    ("counter-queue-manager.jsx", "Queue Manager", "Digital token system for counter crowds"),
    ("packaging-cost-calculator.jsx", "Packaging Calc", "Precision margin after packaging costs"),
    ("micro-insurance-portal.jsx", "Micro-Insurance", "Insurance for Kirana workers and property")
]

# --- GLOBAL COMPONENTS TEMPLATES ---

header_template = """import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, Menu, X, Globe } from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isThemesOpen, setIsThemesOpen] = useState(false);

  return (
    <header className="w-full z-[100] sticky top-0">
      {/* GOV TOP BAR */}
      <div className="bg-[#f0f0f0] text-[#212121] text-[11px] px-6 py-1.5 flex items-center gap-2 font-medium border-b border-gray-300">
        <img src="https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg" className="h-3 w-auto" alt="IN flag" />
        An official platform for Indian Retailers. <span className="underline cursor-help ml-1">How you know</span>
      </div>

      {/* MAIN NAV */}
      <nav className="h-16 md:h-20 px-6 md:px-12 flex items-center justify-between bg-black border-b border-white/10 relative">
        <Link to="/" className="text-xl md:text-2xl font-bold tracking-tight text-white">VyaparSetu.ai</Link>
        
        {/* DESKTOP MENU */}
        <div className="hidden md:flex items-center gap-8 text-[13px] font-black tracking-widest uppercase text-white">
          <Link to="/about" className="hover:text-[#005ea2] transition-colors">About</Link>
          <Link to="/centers" className="hover:text-[#005ea2] transition-colors">Visit a Center</Link>
          <button 
            onClick={() => setIsThemesOpen(!isThemesOpen)}
            className="flex items-center gap-2 hover:text-[#005ea2] transition-colors group"
          >
            Themes {isThemesOpen ? <ChevronUp size={14} className="text-[#005ea2]"/> : <ChevronDown size={14} />}
          </button>
        </div>

        {/* MOBILE TOGGLE */}
        <button onClick={() => setIsMenuOpen(true)} className="md:hidden text-white p-2">
          <Menu size={24} />
        </button>

        {/* THEMES DROPDOWN (DESKTOP) */}
        {isThemesOpen && (
          <div className="hidden md:grid grid-cols-3 gap-8 absolute top-full left-0 w-full bg-[#111] border-b border-white/10 p-12 animate-in slide-in-from-top duration-300 shadow-2xl">
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-[#005ea2] tracking-[0.3em] uppercase">Core Engine</h4>
              <div className="grid gap-2 text-sm text-gray-400 font-bold uppercase tracking-tighter">
                <Link to="/features/ai-stock-predictor" onClick={() => setIsThemesOpen(false)}>Inventory AI</Link>
                <Link to="/features/voice-billing-engine" onClick={() => setIsThemesOpen(false)}>Voice POS</Link>
                <Link to="/features/khata-credit-scoring" onClick={() => setIsThemesOpen(false)}>Udhaar Khata</Link>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-[#005ea2] tracking-[0.3em] uppercase">Supply Chain</h4>
              <div className="grid gap-2 text-sm text-gray-400 font-bold uppercase tracking-tighter">
                <Link to="/features/supplier-bidding-hub" onClick={() => setIsThemesOpen(false)}>Supplier Bidding</Link>
                <Link to="/features/direct-to-farmer-sourcing" onClick={() => setIsThemesOpen(false)}>Farm Direct</Link>
                <Link to="/features/expiry-liquidation-network" onClick={() => setIsThemesOpen(false)}>Liquidation</Link>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-[#005ea2] tracking-[0.3em] uppercase">Connect</h4>
              <div className="grid gap-2 text-sm text-gray-400 font-bold uppercase tracking-tighter">
                <Link to="/chatbot" onClick={() => setIsThemesOpen(false)}>AI Assistant</Link>
                <Link to="/features/whatsapp-catalogs" onClick={() => setIsThemesOpen(false)}>WhatsApp Store</Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* MOBILE FULLSCREEN MENU */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-[#111] z-[200] p-8 flex flex-col animate-in slide-in-from-right duration-300">
          <div className="flex justify-between items-center mb-12">
            <span className="text-xl font-bold">VyaparSetu.ai</span>
            <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-white/5 rounded-full"><X size={24}/></button>
          </div>
          <div className="flex flex-col gap-6 text-3xl font-black uppercase tracking-tighter italic">
             <Link to="/" onClick={() => setIsMenuOpen(false)} className="border-b border-white/10 pb-4">Home</Link>
             <Link to="/about" onClick={() => setIsMenuOpen(false)} className="border-b border-white/10 pb-4">About</Link>
             <Link to="/chatbot" onClick={() => setIsMenuOpen(false)} className="border-b border-white/10 pb-4">Vyapar AI</Link>
             <Link to="/centers" onClick={() => setIsMenuOpen(false)} className="border-b border-white/10 pb-4 text-[#005ea2]">Visit Center</Link>
          </div>
        </div>
      )}
    </header>
  );
}
"""

footer_template = """import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Linkedin, Database, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-black text-white border-t border-white/10">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
          
          {/* SECTION 1 */}
          <div className="space-y-8">
            <h2 className="text-3xl font-black uppercase tracking-tighter">VyaparSetu.ai</h2>
            <p className="text-zinc-500 text-sm leading-relaxed">
              Standardizing the unorganized Indian retail sector through satellite data, real-time AI, and unified inventory mesh networking.
            </p>
            <div className="flex gap-4">
              <div className="bg-white/5 p-3 rounded-sm border border-white/10 group hover:border-[#005ea2] transition-colors cursor-help">
                <Database size={18} className="text-[#005ea2]" />
              </div>
              <div className="bg-white/5 p-3 rounded-sm border border-white/10 group hover:border-[#005ea2] transition-colors cursor-help">
                <ShieldCheck size={18} className="text-[#005ea2]" />
              </div>
            </div>
          </div>

          {/* SECTION 2: PORTALS */}
          <div className="space-y-6 text-sm">
            <h4 className="font-black uppercase tracking-[0.3em] text-[#005ea2] text-[10px]">Explore Portals</h4>
            <div className="flex flex-col gap-3 font-bold uppercase tracking-widest text-zinc-400">
               <Link to="/features/ai-stock-predictor" className="hover:text-white transition-all">Stock Prediction</Link>
               <Link to="/features/voice-billing-engine" className="hover:text-white transition-all">Voice Billing</Link>
               <Link to="/features/ocr-inward-billing" className="hover:text-white transition-all">OCR Scan</Link>
               <Link to="/features/mandi-rate-tracker" className="hover:text-white transition-all">Mandi Index</Link>
               <Link to="/features/whatsapp-chatbot-ordering" className="hover:text-white transition-all">Order Bot</Link>
            </div>
          </div>

          {/* SECTION 3: QUICK LINKS */}
          <div className="space-y-6 text-sm">
            <h4 className="font-black uppercase tracking-[0.3em] text-[#005ea2] text-[10px]">Resources</h4>
            <div className="flex flex-col gap-3 font-bold uppercase tracking-widest text-zinc-400">
               <Link to="/about" className="hover:text-white transition-all">Mission Earth</Link>
               <Link to="/pricing" className="hover:text-white transition-all">Pricing Model</Link>
               <Link to="/compliance" className="hover:text-white transition-all">Shop Act Vault</Link>
               <Link to="/audit" className="hover:text-white transition-all">Security Audit</Link>
               <Link to="/contact" className="hover:text-white transition-all">Developer Hub</Link>
            </div>
          </div>

          {/* SECTION 4: DEVELOPER CREDITS */}
          <div className="space-y-6 text-sm bg-zinc-900/40 p-8 border border-white/5 rounded-xl">
            <h4 className="font-black uppercase tracking-[0.3em] text-[#005ea2] text-[10px]">Architecture Credits</h4>
            
            <div className="space-y-6">
               <div className="flex items-center justify-between">
                 <span className="font-black uppercase tracking-tighter text-white">Arun Ammisetty</span>
                 <div className="flex gap-3">
                   <a href="https://github.com" className="text-zinc-500 hover:text-white transition-colors"><Github size={16}/></a>
                   <a href="https://linkedin.com" className="text-zinc-500 hover:text-[#005ea2] transition-colors"><Linkedin size={16}/></a>
                 </div>
               </div>
               <div className="flex items-center justify-between">
                 <span className="font-black uppercase tracking-tighter text-white">Palak Bhosale</span>
                 <div className="flex gap-3">
                   <a href="https://github.com" className="text-zinc-500 hover:text-white transition-colors"><Github size={16}/></a>
                   <a href="https://linkedin.com" className="text-zinc-500 hover:text-[#005ea2] transition-colors"><Linkedin size={16}/></a>
                 </div>
               </div>
            </div>
          </div>

        </div>

        {/* BOTTOM GOV STYLE */}
        <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-start gap-8">
            <div className="flex flex-wrap gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">
              <span className="cursor-help hover:text-zinc-400">Accessibility support</span>
              <span className="cursor-help hover:text-zinc-400">Privacy Policy</span>
              <span className="cursor-help hover:text-zinc-400">Performance Reports</span>
              <span className="cursor-help hover:text-zinc-400">Security Sovereignty</span>
            </div>
            <div className="text-zinc-600 text-[10px] leading-loose text-left md:text-right">
                Looking for government information? Visit <span className="text-zinc-400 underline">VyaparIndia.gov</span> <br />
                Page last updated: <span className="text-zinc-400 font-bold uppercase tracking-widest">Dec 18, 2025</span> <br />
                U.S. Earth Information Center Responsible Official: <span className="text-white font-bold underline">VyaparSetu Core</span>
            </div>
        </div>
      </div>
    </footer>
  );
}
"""

# App.jsx wrapping
app_template_wrapped = """import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/home/index';
import Chatbot from './pages/chatbot/index';

// FEATURE IMPORTS
[[IMPORTS]]

export default function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chatbot" element={<Chatbot />} />
          [[ROUTES]]
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
"""

# Home page updated
home_template_clean = """import React from 'react';
import { ArrowRight, ArrowDown, Sparkles, MessageSquare, Database } from 'lucide-react';
import { Link } from 'react-router-dom';

const modules = [[MODULE_LIST]];

export default function Home() {
    return (
        <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden">
            {/* HERO SECTION MATCHING EARTH.GOV */}
            <section className="relative w-full h-[85vh] flex items-center px-6 md:px-16 overflow-hidden">
                <div className="absolute inset-0 bg-black/40 z-10"></div>
                <img 
                    src="https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80" 
                    className="absolute inset-0 w-full h-full object-cover z-0 grayscale opacity-80"
                    alt="Hero Visual"
                />
                <div className="relative z-20 max-w-4xl pt-20">
                    <h1 className="text-6xl md:text-[7rem] font-bold leading-[0.9] tracking-tighter mb-12 uppercase drop-shadow-2xl">
                        DATA FOR <br /> RETAIL GROWTH
                    </h1>
                    <a href="#explore-themes" className="inline-flex items-center gap-4 bg-[#005ea2] text-white px-10 py-5 text-sm font-black uppercase tracking-widest hover:bg-[#004a80] transition-all">
                        EXPLORE <ArrowDown size={20} />
                    </a>
                </div>
            </section>

            {/* LEARN ABOUT THEMES SECTION */}
            <section id="explore-themes" className="py-24 px-6 md:px-12 max-w-[1400px] mx-auto">
                <h2 className="text-xs font-black uppercase tracking-[0.3em] mb-12 border-b border-white/20 pb-4 inline-block text-[#005ea2]">
                    LEARN ABOUT RETAIL THEMES
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {modules.slice(0, 3).map((m, i) => (
                        <Link key={i} to={m.path} className="group relative aspect-[4/5] overflow-hidden rounded-lg">
                            <img 
                                src={`https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&sig=${i}`} 
                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-60"
                                alt={m.name}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                            <div className="absolute top-4 left-4 bg-white text-black text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 uppercase">
                                <Sparkles size={10} /> Smart Feature
                            </div>
                            <div className="absolute bottom-8 left-6 right-6">
                                <h3 className="text-3xl font-bold uppercase tracking-tighter leading-none group-hover:underline underline-offset-8 transition-all">
                                    {m.name.split(' ')[0]} <br /> {m.name.split(' ').slice(1).join(' ')}
                                </h3>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* INTERACTIVES SECTION */}
            <section className="py-24 px-6 md:px-12 bg-zinc-950">
                <div className="max-w-[1400px] mx-auto">
                    <h2 className="text-xs font-black uppercase tracking-[0.3em] mb-12">INTERACTIVES</h2>
                    <Link to="/chatbot" className="group block relative w-full h-[50vh] rounded-xl overflow-hidden border border-white/10">
                        <img 
                            src="https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80" 
                            className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale group-hover:grayscale-0 transition-all duration-700"
                            alt="AI Chatbot"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent"></div>
                        <div className="absolute top-8 left-8 flex items-center gap-4">
                            <div className="bg-white text-black p-2 rounded flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                                <MessageSquare size={14} /> Interactive
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500 underline underline-offset-4">GPT-4.0 ACTIVE</span>
                        </div>
                        <div className="absolute left-8 bottom-12 max-w-xl">
                            <h2 className="text-5xl md:text-7xl font-bold uppercase tracking-tighter mb-4 flex items-center gap-6">
                                VYAPARSETU EYES ON SALES <div className="p-3 bg-[#005ea2] rounded-full group-hover:px-6 transition-all duration-500"><ArrowRight size={24} /></div>
                            </h2>
                            <p className="text-zinc-400 text-lg leading-relaxed">Our real-time AI engine identifies wastage, analyzes customer footfall, and suggests stock replenishments instantly.</p>
                        </div>
                    </Link>
                </div>
            </section>

            {/* PORTALS LIST SECTION */}
            <section className="py-24 px-6 md:px-12 max-w-[1400px] mx-auto bg-black">
                <h2 className="text-xs font-black uppercase tracking-[0.3em] mb-12">EXPLORE OUR PORTALS</h2>
                <div className="space-y-4">
                    {modules.slice(3).map((m, i) => (
                        <Link 
                            key={i} 
                            to={m.path} 
                            className="flex flex-col md:flex-row items-center gap-8 bg-zinc-900/40 border border-white/5 p-6 md:p-8 rounded-xl hover:bg-zinc-900/80 transition-colors group"
                        >
                            <div className="w-full md:w-64 aspect-video rounded-lg overflow-hidden shrink-0">
                                <img src={`https://images.unsplash.com/photo-1534452203294-45c851ec76f7?auto=format&fit=crop&q=80&sig=${i+10}`} className="w-full h-full object-cover grayscale opacity-50 group-hover:scale-110 transition-transform duration-700" alt={m.name} />
                            </div>
                            <div className="flex-1 text-left">
                                <div className="flex items-center gap-3 mb-2"><div className="bg-white/10 text-zinc-400 p-1 rounded text-[8px] font-black uppercase"><Database size={10} /> Portal</div></div>
                                <h3 className="text-2xl font-bold uppercase tracking-tighter mb-2 group-hover:text-[#005ea2] transition-colors">{m.name}</h3>
                                <p className="text-zinc-500 text-sm leading-relaxed mb-4">{m.desc}</p>
                                <div className="text-[#005ea2] text-[10px] font-black uppercase tracking-widest flex items-center gap-2">Open Portal <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" /></div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}
"""

def generate_files():
    # Directories
    for d in [FEATURE_DIR, HOME_DIR, CHATBOT_DIR, COMP_DIR]:
        if not os.path.exists(d): os.makedirs(d)
    
    module_list = []
    imports = []
    routes = []

    # 1. Features
    from string import Template
    for filename, title, desc in features:
        component_name = "Feature" + "".join(x.capitalize() for x in filename.replace(".jsx", "").split("-"))
        module_list.append(f"{{ name: '{title}', desc: '{desc}', path: '/features/{filename.replace('.jsx', '')}' }}")
        imports.append(f"import {component_name} from './pages/features/{filename.replace('.jsx', '')}';")
        routes.append(f"<Route path=\"/features/{filename.replace('.jsx', '')}\" element={{<{component_name} />}} />")

        # Basic feature page (keeping existing logic style)
        with open(os.path.join(FEATURE_DIR, filename), "w", encoding="utf-8") as f:
            f.write("import React from 'react';\nimport { ArrowLeft } from 'lucide-react';\nimport { Link } from 'react-router-dom';\n\n" +
                    f"export default function {component_name}() {{\n  return (\n    <div className='min-h-screen bg-black text-white p-24'>\n      <Link to='/' className='text-[#005ea2] uppercase font-black text-xs flex items-center gap-2 mb-12'><ArrowLeft size={16}/> Back</Link>\n      <h1 className='text-7xl font-black uppercase tracking-tighter mb-6 italic'>{title}</h1>\n      <p className='text-xl text-zinc-500 max-w-2xl'>{desc}</p>\n    </div>\n  );\n}}")

    # 2. Components
    with open(os.path.join(COMP_DIR, "Header.jsx"), "w", encoding="utf-8") as f: f.write(header_template)
    with open(os.path.join(COMP_DIR, "Footer.jsx"), "w", encoding="utf-8") as f: f.write(footer_template)

    # 3. Homepage
    home_content = home_template_clean.replace("[[MODULE_LIST]]", "[\n    " + ",\n    ".join(module_list) + "\n  ]")
    with open(os.path.join(HOME_DIR, "index.jsx"), "w", encoding="utf-8") as f: f.write(home_content)

    # 4. App.jsx (Integrated)
    app_content = app_template_wrapped.replace("[[IMPORTS]]", "\n".join(imports)).replace("[[ROUTES]]", "\n      ".join(routes))
    with open(os.path.join(SRC_DIR, "App.jsx"), "w", encoding="utf-8") as f: f.write(app_content)

    print(f"✅ Success: Architecture Synchronized with Global Header/Footer + Developer Credits.")

if __name__ == "__main__":
    generate_files()