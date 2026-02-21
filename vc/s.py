import os

# Configuration
FEATURE_DIR = "src/pages/features"
HOME_DIR = "src/pages/home"
CHATBOT_DIR = "src/pages/chatbot"
SRC_DIR = "src"

# 54 Innovative VyaparSetu Features
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
    ("udhaar-barter-system.jsx", "Barter Ledger", "Manage non-cash exchanges and credit barters"),
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

# --- TEMPLATES ---

# Individual Feature Page Template
feature_template = """import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Activity, ShieldCheck, Zap, Globe2, Layout, Database, Cpu, HardDrive, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function [[COMPONENT_NAME]]() {
  const [logs, setLogs] = useState([]);
  const [metrics, setMetrics] = useState({ efficiency: 0, latency: 0, load: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      setLogs(prev => [{ id: Date.now(), timestamp: new Date().toLocaleTimeString(), message: 'Processing [[TITLE]] data shard...', status: 'SUCCESS' }, ...prev].slice(0, 5));
      setMetrics({ efficiency: (85 + Math.random() * 10).toFixed(1), latency: (10 + Math.random() * 20).toFixed(0), load: (30 + Math.random() * 40).toFixed(1) });
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans animate-in fade-in duration-700">
      <section className="relative h-[70vh] flex items-center px-6 md:px-24 border-b border-[#222]">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/95 to-transparent z-10"></div>
        <div className="relative z-20 max-w-4xl">
          <Link to="/" className="inline-flex items-center gap-2 text-[#005ea2] font-bold text-sm mb-10 uppercase tracking-wider">
            <ArrowLeft size={16} /> RETURN TO COMMAND CENTER
          </Link>
          <div className="bg-[#005ea2] text-white text-[10px] font-bold px-3 py-1 rounded-sm inline-block mb-6 uppercase tracking-[0.3em]">Module Active</div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8 uppercase italic italic">[[TITLE]]</h1>
          <p className="text-xl md:text-2xl text-gray-400 max-w-2xl font-medium leading-relaxed border-l-2 border-[#005ea2] pl-6">[[DESCRIPTION]]. Powered by VyaparSetu AI.</p>
        </div>
      </section>

      <section className="py-24 px-6 md:px-24 bg-[#0a0a0a]">
        <div className="grid lg:grid-cols-12 gap-12 max-w-7xl mx-auto">
          <div className="lg:col-span-8 bg-[#111] border border-[#222] rounded-sm p-8 shadow-2xl font-mono min-h-[400px]">
            <div className="grid grid-cols-3 gap-4 mb-10 text-center">
              <div className="bg-black/50 p-4 border border-[#222] rounded-sm"><p className="text-[10px] text-gray-500 uppercase mb-2">Efficiency</p><p className="text-2xl font-bold text-[#005ea2]">{metrics.efficiency}%</p></div>
              <div className="bg-black/50 p-4 border border-[#222] rounded-sm"><p className="text-[10px] text-gray-500 uppercase mb-2">Latency</p><p className="text-2xl font-bold text-white">{metrics.latency}ms</p></div>
              <div className="bg-black/50 p-4 border border-[#222] rounded-sm"><p className="text-[10px] text-gray-500 uppercase mb-2">Load</p><p className="text-2xl font-bold text-gray-400">{metrics.load}%</p></div>
            </div>
            <div className="space-y-2">{logs.map(log => (<div key={log.id} className="flex justify-between border-b border-[#222]/30 py-2"><span className="text-gray-500">[{log.timestamp}] {log.message}</span><span className="text-blue-500 font-bold">{log.status}</span></div>))}</div>
          </div>
          <div className="lg:col-span-4 bg-[#005ea2] p-8 rounded-sm shadow-xl relative overflow-hidden group">
            <Zap size={120} className="absolute -right-10 -bottom-10 text-white/10 rotate-12" />
            <h3 className="text-lg font-black uppercase mb-4 italic italic">Real-Time ROI</h3>
            <p className="text-sm text-blue-100 mb-8">Deploying [[TITLE]] impacts your monthly savings.</p>
            <div className="text-5xl font-black italic tracking-tighter text-white">+₹14.2k <span className="text-xs font-normal">/mo avg</span></div>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 md:px-24 bg-white text-black"><div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-16"><div className="text-left"><h2 className="text-5xl font-black uppercase italic tracking-tighter mb-6 leading-none italic italic">Bank-Grade Security</h2><p className="text-gray-500 font-bold text-lg uppercase tracking-widest italic italic">Stateless AES-256 Encryption at source.</p></div><Link to="/pricing" className="bg-[#005ea2] text-white px-12 py-6 font-black uppercase tracking-[0.2em] italic hover:bg-blue-700 transition-all rounded-sm flex items-center gap-6">UPGRADE TO PRO <ArrowRight size={24} /></Link></div></section>
    </div>
  );
}
"""

# Homepage Template
home_template = """import React from 'react';
import { ArrowRight, LayoutGrid, Sparkles, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

const modules = [[MODULE_LIST]];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-[#005ea2]">
      <section className="pt-32 pb-20 px-6 md:px-24 border-b border-[#222]">
        <div className="max-w-6xl">
          <Link to="/chatbot" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/10 border border-blue-600/30 text-blue-500 text-sm font-bold mb-8 rounded-full hover:bg-blue-600 hover:text-white transition-all">
            <Sparkles size={16} /> Open VyaparSetu AI Chatbot
          </Link>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic leading-[0.85] mb-10">THE COMMAND <br /> CENTER</h1>
          <p className="text-xl text-gray-500 max-w-2xl leading-relaxed">Access 54 enterprise-grade modules designed for the Indian Kirana infrastructure.</p>
        </div>
      </section>

      <section className="py-24 px-6 md:px-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1600px] mx-auto">
          {modules.map((m, i) => (
            <Link key={i} to={m.path} className="group bg-[#111] border border-[#222] p-8 rounded-sm hover:border-[#005ea2] transition-all hover:shadow-2xl">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-black border border-[#222]"><LayoutGrid size={24} className="text-[#005ea2]" /></div>
                <ArrowRight size={20} className="text-gray-700 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-xl font-bold uppercase tracking-tight mb-2 group-hover:text-[#005ea2] italic">{m.name}</h3>
              <p className="text-gray-500 text-sm">{m.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
"""

# Chatbot Template
chatbot_template = """import React, { useState, useEffect, useRef } from 'react';
import { Menu, Plus, MessageSquare, Send, User, Bot, Settings, Loader2, Sparkles, AlertCircle, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); };
  useEffect(() => { scrollToBottom(); }, [messages, isLoading]);

  const handleInput = (e) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    if (!apiKey) { setError("API Key Missing (VITE_OPENAI_API_KEY)"); return; }
    const userMessage = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages); setInput(''); setIsLoading(true); setError(null);
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "system", content: "You are VyaparSetu AI assistant for Indian Kirana stores." }, ...newMessages],
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "API Error");
      setMessages(prev => [...prev, { role: 'assistant', content: data.choices[0].message.content }]);
    } catch (err) { setError(err.message); } finally { setIsLoading(false); }
  };

  return (
    <div className="flex h-screen w-full bg-[#212121] text-[#ececec] overflow-hidden">
      <div className={`${isSidebarOpen ? 'w-[260px]' : 'w-0'} transition-all duration-300 flex flex-col bg-[#171717] h-full shrink-0 border-r border-[#333] relative`}>
        <div className="p-3"><button onClick={() => setMessages([])} className="flex items-center gap-3 w-full hover:bg-[#2f2f2f] text-sm text-white px-3 py-3 rounded-md border border-[#333]"><Plus size={16} /> New Chat</button></div>
        <div className="flex-1 overflow-y-auto px-3 py-2">
            <Link to="/" className="flex items-center gap-3 w-full hover:bg-[#2f2f2f] text-sm text-white px-3 py-3 rounded-md mb-2 bg-[#2f2f2f]/30"><ArrowLeft size={16} /> Command Center</Link>
        </div>
      </div>
      <div className="flex-1 flex flex-col h-full relative">
        <header className="h-14 flex items-center justify-between px-4 border-b border-[#333]/50 bg-[#212121]">
          <div className="flex items-center gap-3"><button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-[#2f2f2f] rounded-md"><Menu size={20} /></button><h1 className="text-lg font-semibold">VyaparSetu AI</h1></div>
        </header>
        <div className="flex-1 overflow-y-auto scroll-smooth w-full p-4">
          {messages.map((msg, i) => (
            <div key={i} className="max-w-3xl mx-auto py-4 flex gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'assistant' ? 'bg-blue-600' : 'bg-gray-600'}`}>{msg.role === 'assistant' ? <Bot size={18}/> : <User size={18}/>}</div>
              <div className="flex-1 text-[#d1d5db] whitespace-pre-wrap">{msg.content}</div>
            </div>
          ))}
          {isLoading && <div className="max-w-3xl mx-auto py-4 flex gap-4"><Loader2 size={18} className="animate-spin" /> VyaparSetu AI is thinking...</div>}
          <div ref={messagesEndRef} className="h-32" />
        </div>
        <div className="absolute bottom-0 w-full bg-gradient-to-t from-[#212121] via-[#212121] to-transparent pb-8 px-4">
          <div className="max-w-3xl mx-auto relative bg-[#2f2f2f] rounded-xl border border-[#444] p-2 flex items-end">
            <textarea value={input} onChange={handleInput} placeholder="Message VyaparSetu AI..." className="w-full bg-transparent p-2 outline-none resize-none" rows="1" onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()} />
            <button onClick={sendMessage} className="p-2 bg-white text-black rounded-lg ml-2"><Send size={18} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
"""

# App.jsx Template
app_template = """import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/home/index';
import Chatbot from './pages/chatbot/index';

// FEATURE IMPORTS
[[IMPORTS]]

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/chatbot" element={<Chatbot />} />
      [[ROUTES]]
    </Routes>
  );
}
"""

# main.jsx Template
main_template = """import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
"""

def generate_files():
    for d in [FEATURE_DIR, HOME_DIR, CHATBOT_DIR]:
        if not os.path.exists(d): os.makedirs(d)
    
    print("Initializing project structure...")

    module_list = []
    imports = []
    routes = []

    # 1. Features
    for filename, title, desc in features:
        component_name = "Feature" + "".join(x.capitalize() for x in filename.replace(".jsx", "").split("-"))
        module_list.append(f"{{ name: '{title}', desc: '{desc}', path: '/features/{filename.replace('.jsx', '')}' }}")
        imports.append(f"import {component_name} from './pages/features/{filename.replace('.jsx', '')}';")
        routes.append(f"<Route path=\"/features/{filename.replace('.jsx', '')}\" element={{<{component_name} />}} />")

        content = feature_template.replace("[[COMPONENT_NAME]]", component_name).replace("[[TITLE]]", title).replace("[[DESCRIPTION]]", desc)
        with open(os.path.join(FEATURE_DIR, filename), "w", encoding="utf-8") as f: f.write(content)

    # 2. Homepage
    home_content = home_template.replace("[[MODULE_LIST]]", "[\n    " + ",\n    ".join(module_list) + "\n  ]")
    with open(os.path.join(HOME_DIR, "index.jsx"), "w", encoding="utf-8") as f: f.write(home_content)

    # 3. Chatbot
    with open(os.path.join(CHATBOT_DIR, "index.jsx"), "w", encoding="utf-8") as f: f.write(chatbot_template)

    # 4. App.jsx
    app_content = app_template.replace("[[IMPORTS]]", "\n".join(imports)).replace("[[ROUTES]]", "\n      ".join(routes))
    with open(os.path.join(SRC_DIR, "App.jsx"), "w", encoding="utf-8") as f: f.write(app_content)

    # 5. main.jsx (FIXES THE ERROR)
    with open(os.path.join(SRC_DIR, "main.jsx"), "w", encoding="utf-8") as f: f.write(main_template)

    print(f"✅ Success: Generated 54 Features, Chatbot UI, Command Center, and Fixed App Routing.")

if __name__ == "__main__":
    generate_files()