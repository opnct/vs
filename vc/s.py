import os

# Configuration
FEATURE_DIR = "src/pages/features"
HOME_DIR = "src/pages/home"
SRC_DIR = "src"

features = [
    ("ai-stock-predictor.jsx", "AI Stock Predictor", "Predictive inventory based on local festivals, weather, and historical footfall"),
    ("smart-shelf-mapping.jsx", "Smart Shelf Mapping", "Visual store layout mapping to guide staff where to place items"),
    ("voice-billing-engine.jsx", "Voice Billing Engine", "Vernacular voice-to-text billing for loose items"),
    ("whatsapp-catalogs.jsx", "WhatsApp Catalogs", "Auto-generated, self-updating local e-commerce store"),
    ("dynamic-pricing-engine.jsx", "Dynamic Pricing Engine", "Auto-adjusts margins based on expiry or competitor data"),
    ("supplier-bidding-hub.jsx", "Supplier Bidding Hub", "Reverse auction system for local distributors"),
    ("staff-fraud-detector.jsx", "Staff Fraud Detector", "AI analysis of voided bills and inventory shrinkage"),
    ("micro-lending-connect.jsx", "Micro-Lending Connect", "Instant working capital based on POS transaction data"),
    ("community-group-buy.jsx", "Community Group Buy", "Pool orders with nearby retailers for wholesale rates"),
    ("expiry-liquidation-network.jsx", "Expiry Liquidation", "Connect to local bakeries to sell near-expiry FMCG"),
    ("ocr-inward-billing.jsx", "OCR Inward Billing", "Convert physical supplier invoices to digital stock entries"),
    ("upi-reconciliation-engine.jsx", "UPI Recon Engine", "Real-time matching of bank statements with counter sales"),
    ("digital-gold-change.jsx", "Digital Gold Change", "Invest small change into digital gold for customers"),
    ("offline-mesh-sync.jsx", "Offline Mesh Sync", "Sync data across devices without active internet"),
    ("kirana-brand-monetization.jsx", "Brand Monetization", "Earn revenue by displaying brand ads on digital screens"),
    ("omnichannel-qcom-bridge.jsx", "Quick-Commerce Bridge", "Connect inventory to Blinkit, Zepto, and Instamart"),
    ("cash-denomination-tracker.jsx", "Cash Tracker", "Real-time tracking of 500, 200, 100 notes in drawer"),
    ("local-delivery-pooling.jsx", "Local Delivery Pool", "Share delivery staff with nearby stores to cut costs"),
    ("khata-credit-scoring.jsx", "Khata Credit Score", "Algorithmic credit worthiness for local 'Udhaar'"),
    ("auto-gst-categorization.jsx", "Auto-GST Categorizer", "Automatic HSN finding and GST tax mapping"),
    ("loyalty-gamification-whatsapp.jsx", "WhatsApp Loyalty", "Reward points and scratch cards inside WhatsApp"),
    ("mandi-rate-tracker.jsx", "Mandi Rate Tracker", "Live price feeds from local APMC mandis"),
    ("fmcg-scheme-tracker.jsx", "FMCG Scheme Tracker", "Never miss a bulk discount or free-unit offer"),
    ("power-outage-mode.jsx", "Power Outage Mode", "Low-power UI mode for long power cuts"),
    ("loose-item-cataloging.jsx", "Loose Item Catalog", "Standardized SKU codes for unbranded items"),
    ("store-health-dashboard.jsx", "Store Health", "Real-time ROI, wastage, and footfall analytics"),
    ("multi-lingual-receipts.jsx", "Vernacular Receipts", "Print bills in local scripts (Hindi, Tamil, etc.)"),
    ("ai-cctv-integration.jsx", "AI CCTV Integration", "Theft detection and heatmaps using existing cameras"),
    ("community-price-index.jsx", "Price Index", "Compare your prices with the area's average rates"),
    ("direct-to-farmer-sourcing.jsx", "Direct Sourcing", "Buy directly from local farmers using VyaparSetu"),
    ("staff-vernacular-training.jsx", "Staff Training", "Voice-based training modules for shop boys"),
    ("automated-license-renewal.jsx", "License Vault", "Track FSSAI, Trade, and Fire license expiry"),
    ("hyperlocal-ads-manager.jsx", "Hyperlocal Ads", "Run targeted ads for customers within 2km radius"),
    ("udhaar-barter-system.jsx", "Barter Ledger", "Manage non-cash exchanges and service barters"),
    ("whatsapp-chatbot-ordering.jsx", "Order Chatbot", "Take orders automatically via AI Chatbot"),
    ("smart-return-management.jsx", "Smart Returns", "Track reason codes for item returns and wastage"),
    ("daily-wage-chhotu-manager.jsx", "Staff Wage Manager", "Attendance and daily payouts for casual labor"),
    ("regional-festival-promos.jsx", "Festival Planner", "Auto-marketing campaigns for local holidays"),
    ("customer-face-recognition.jsx", "Customer Recognition", "Identify VIP customers as they enter the shop"),
    ("smart-weighing-iot.jsx", "IoT Scale Sync", "Pull data directly from digital weighing scales"),
    ("supplier-payment-scheduler.jsx", "Payment Scheduler", "Automated reminders and credit cycle alerts"),
    ("customer-dietary-alerts.jsx", "Dietary Alerts", "Identify allergens/sugar for specific customers"),
    ("plastic-waste-tracker.jsx", "Sustainability Tracker", "Track reduction in single-use plastic bags"),
    ("hardware-rental-portal.jsx", "Hardware Rental", "Rent POS hardware, printers, or deep freezers"),
    ("wholesale-split-billing.jsx", "Wholesale Split Billing", "Separate personal and business items in one cart"),
    ("b2b-tax-credit-optimizer.jsx", "ITC Optimizer", "Maximize your Input Tax Credit automatically"),
    ("seasonal-dead-stock-alerts.jsx", "Dead Stock Alerts", "Identify items that haven't moved in 90 days"),
    ("qr-audio-box-integration.jsx", "QR Audio Box", "Custom soundbox integration for payment alerts"),
    ("sms-marketing-engine.jsx", "SMS Engine", "Reach non-smartphone users with promotional text"),
    ("shop-act-compliance-vault.jsx", "Compliance Vault", "One-click audit reports for local inspectors"),
    ("distributor-route-planner.jsx", "Route Planner", "Optimize delivery routes for your own vehicles"),
    ("counter-queue-manager.jsx", "Queue Manager", "Digital tokens to manage counter crowds"),
    ("packaging-cost-calculator.jsx", "Packaging Calc", "Calculate margin after adding bag/box costs"),
    ("micro-insurance-portal.jsx", "Micro-Insurance", "Shop and health insurance for retail workers")
]

# TEMPLATE FOR INDIVIDUAL FEATURE PAGES
feature_template = """import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, ArrowRight, Activity, ShieldCheck, Zap, 
  Globe2, Layout, Database, Cpu, BarChart3, Clock, 
  CheckCircle2, AlertTriangle, Smartphone, Wallet,
  Server, HardDrive, LineChart, ShieldAlert, Layers,
  Lock
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function [[COMPONENT_NAME]]() {
  const [logs, setLogs] = useState([]);
  const [metrics, setMetrics] = useState({ efficiency: 0, latency: 0, load: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const newLog = {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        message: `Processing [[TITLE]] data shard...`,
        status: Math.random() > 0.1 ? 'SUCCESS' : 'OPTIMIZING'
      };
      setLogs(prev => [newLog, ...prev].slice(0, 5));
      setMetrics({
        efficiency: (85 + Math.random() * 10).toFixed(1),
        latency: (10 + Math.random() * 20).toFixed(0),
        load: (30 + Math.random() * 40).toFixed(1)
      });
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-[#005ea2] animate-in fade-in duration-700">
      <section className="relative h-[70vh] flex items-center px-6 md:px-24 overflow-hidden border-b border-[#222]">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/95 to-transparent z-10"></div>
        <div className="relative z-20 max-w-4xl">
          <Link to="/" className="inline-flex items-center gap-2 text-[#005ea2] font-bold text-sm mb-10 hover:tracking-widest transition-all uppercase tracking-wider">
            <ArrowLeft size={16} /> RETURN TO FEATURE HUB
          </Link>
          <div className="bg-[#005ea2] text-white text-[10px] font-bold px-3 py-1 rounded-sm inline-block mb-6 uppercase tracking-[0.3em] shadow-lg shadow-blue-900/20">
            Advanced Retail Module
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8 uppercase italic">
            [[TITLE]]
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 max-w-2xl font-medium leading-relaxed border-l-2 border-[#005ea2] pl-6">
            [[DESCRIPTION]]. Empowering Kirana owners with enterprise-grade logic.
          </p>
        </div>
      </section>

      <section className="py-24 px-6 md:px-24 bg-[#0a0a0a]">
        <div className="grid lg:grid-cols-12 gap-12 max-w-7xl mx-auto">
          <div className="lg:col-span-8 bg-[#111] border border-[#222] rounded-sm overflow-hidden shadow-2xl">
            <div className="bg-[#1a1a1a] px-6 py-4 border-b border-[#222] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500/20"></div><div className="w-3 h-3 rounded-full bg-yellow-500/20"></div><div className="w-3 h-3 rounded-full bg-green-500/20"></div></div>
                <span className="text-[10px] font-mono text-gray-500 ml-4 tracking-widest uppercase">System Terminal : [[COMPONENT_NAME]]</span>
              </div>
            </div>
            <div className="p-8 space-y-6 min-h-[400px] font-mono text-sm">
              <div className="grid grid-cols-3 gap-4 mb-10 text-center">
                <div className="bg-black/50 p-4 border border-[#222] rounded-sm"><p className="text-[10px] text-gray-500 uppercase mb-2">Efficiency</p><p className="text-2xl font-bold text-[#005ea2] italic">{metrics.efficiency}%</p></div>
                <div className="bg-black/50 p-4 border border-[#222] rounded-sm"><p className="text-[10px] text-gray-500 uppercase mb-2">Inference</p><p className="text-2xl font-bold text-white italic">{metrics.latency}ms</p></div>
                <div className="bg-black/50 p-4 border border-[#222] rounded-sm"><p className="text-[10px] text-gray-500 uppercase mb-2">Load</p><p className="text-2xl font-bold text-gray-400 italic">{metrics.load}%</p></div>
              </div>
              <div className="space-y-2">{logs.map(log => (<div key={log.id} className="flex justify-between border-b border-[#222]/30 py-2"><span className="text-gray-500">[{log.timestamp}] {log.message}</span><span className="text-blue-500 font-bold">{log.status}</span></div>))}</div>
            </div>
          </div>
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#005ea2] p-8 rounded-sm shadow-xl relative overflow-hidden group">
              <Zap size={120} className="absolute -right-10 -bottom-10 text-white/10 rotate-12 group-hover:scale-110 transition-transform" />
              <div className="relative z-10">
                <h3 className="text-lg font-black uppercase mb-4 italic">Real-Time ROI</h3>
                <p className="text-sm text-blue-100 leading-relaxed mb-8 opacity-90">Deploying [[TITLE]] impacts your bottom line by optimizing stock cycles.</p>
                <div className="text-5xl font-black italic tracking-tighter text-white">₹14.2k <span className="text-xs font-normal">/mo avg</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 px-6 md:px-24 bg-white text-black">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-black uppercase italic mb-10 border-l-[12px] border-[#005ea2] pl-8 tracking-tighter leading-[0.85]">System Architecture</h2>
            <p className="text-xl leading-relaxed text-gray-700 mb-10 font-medium">VyaparSetu leverages a proprietary **Stateless Ledger Event Bus** (SLEB) to process [[TITLE]] requests.</p>
          </div>
          <div className="relative bg-black p-12 rounded-sm shadow-2xl"><HardDrive size={120} className="text-[#005ea2] animate-pulse mx-auto" strokeWidth={0.5} /></div>
        </div>
      </section>

      <section className="py-24 px-6 md:px-24 bg-[#111] border-t border-[#222]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-16">
          <div className="text-left"><h2 className="text-5xl font-black uppercase italic tracking-tighter mb-6 leading-none">Modernize your <br /> Vyapar today.</h2></div>
          <Link to="/pricing" className="bg-[#005ea2] text-white px-12 py-6 font-black uppercase tracking-[0.2em] italic hover:bg-blue-700 transition-all rounded-sm flex items-center gap-6 shadow-2xl group">UPGRADE TO PRO <ArrowRight size={24} className="transition-all group-hover:translate-x-2" /></Link>
        </div>
      </section>
    </div>
  );
}
"""

# TEMPLATE FOR HOMEPAGE
home_template = """import React from 'react';
import { ArrowRight, Zap, Database, Activity, LayoutGrid, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

const modules = [[MODULE_LIST]];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-[#005ea2]">
      {/* HERO */}
      <section className="pt-32 pb-20 px-6 md:px-24 border-b border-[#222]">
        <div className="max-w-6xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#005ea2]/10 border border-[#005ea2]/30 text-[#005ea2] text-[10px] font-bold mb-8 uppercase tracking-[0.3em]">
            VyaparSetu Intelligence Engine v4.0
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic leading-[0.85] mb-10">
            THE FEATURE <br /> COMMAND CENTER
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl leading-relaxed">
            Access 50+ enterprise-grade modules designed to automate, optimize, and scale Indian retail environments.
          </p>
        </div>
      </section>

      {/* MODULE GRID */}
      <section className="py-24 px-6 md:px-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1600px] mx-auto">
          {modules.map((m, i) => (
            <Link key={i} to={m.path} className="group bg-[#111] border border-[#222] p-8 rounded-sm hover:border-[#005ea2] transition-all hover:shadow-2xl hover:shadow-blue-900/10">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-black border border-[#222] group-hover:border-[#005ea2]/50 transition-colors">
                  <LayoutGrid size={24} className="text-[#005ea2]" />
                </div>
                <ArrowRight size={20} className="text-gray-700 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-xl font-bold uppercase tracking-tight mb-2 group-hover:text-[#005ea2] transition-colors italic">{m.name}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{m.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
"""

# TEMPLATE FOR APP.JSX ROUTING
app_template = """import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/home/index';

// DYNAMIC FEATURE IMPORTS
[[IMPORTS]]

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      
      {/* FEATURE ROUTES */}
      [[ROUTES]]

      <Route path="*" element={
        <div className="min-h-screen bg-black flex items-center justify-center text-white font-black text-6xl italic uppercase">
          404 : Shard Not Found
        </div>
      } />
    </Routes>
  );
}
"""

def generate_files():
    # 1. Create Directories
    for d in [FEATURE_DIR, HOME_DIR]:
        if not os.path.exists(d): os.makedirs(d)
    
    print(f"Target directories initialized.")

    module_list_items = []
    imports = []
    routes = []

    # 2. Generate Feature Pages
    for filename, title, description in features:
        name_parts = filename.replace(".jsx", "").split("-")
        component_name = "Feature" + "".join(x.capitalize() for x in name_parts)
        
        # Build Metadata for Home & App.jsx
        module_list_items.append(f"{{ name: '{title}', desc: '{description}', path: '/features/{filename.replace('.jsx', '')}' }}")
        imports.append(f"import {component_name} from './pages/features/{filename.replace('.jsx', '')}';")
        routes.append(f"<Route path=\"/features/{filename.replace('.jsx', '')}\" element={{<{component_name} />}} />")

        file_path = os.path.join(FEATURE_DIR, filename)
        content = feature_template.replace("[[COMPONENT_NAME]]", component_name)
        content = content.replace("[[TITLE]]", title)
        content = content.replace("[[DESCRIPTION]]", description)
        
        with open(file_path, "w", encoding="utf-8") as f: f.write(content)
        print(f"Generated Feature: {filename}")

    # 3. Generate Home Page
    home_content = home_template.replace("[[MODULE_LIST]]", "[\n    " + ",\n    ".join(module_list_items) + "\n  ]")
    with open(os.path.join(HOME_DIR, "index.jsx"), "w", encoding="utf-8") as f:
        f.write(home_content)
    print("Generated: src/pages/home/index.jsx")

    # 4. Generate App.jsx
    app_content = app_template.replace("[[IMPORTS]]", "\n".join(imports))
    app_content = app_content.replace("[[ROUTES]]", "\n      ".join(routes))
    with open(os.path.join(SRC_DIR, "App.jsx"), "w", encoding="utf-8") as f:
        f.write(app_content)
    print("Generated: src/App.jsx")

    print(f"\\n✅ BUILD COMPLETE: {len(features)} Features + Home + Routing integrated.")

if __name__ == "__main__":
    generate_files()