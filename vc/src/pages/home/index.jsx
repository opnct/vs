import React from 'react';
import { ArrowRight, ArrowDown, Sparkles, MessageSquare, Database } from 'lucide-react';
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
