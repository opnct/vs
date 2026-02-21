import React from 'react';
import { ArrowRight, LayoutGrid, Sparkles, MessageSquare } from 'lucide-react';
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
    { name: 'Barter Ledger', desc: 'Manage non-cash exchanges and credit barters', path: '/features/udhaar-barter-system' },
    { name: 'Order Chatbot', desc: 'Automated customer ordering via WhatsApp', path: '/features/whatsapp-chatbot-ordering' },
    { name: 'Smart Returns', desc: 'Root cause analysis for returns and wastage', path: '/features/smart-return-management' },
    { name: 'Staff Wage Manager', desc: 'Attendance and daily payouts for workers', path: '/features/daily-wage-chhotu-manager' },
    { name: 'Festival Planner', desc: 'Marketing campaigns for regional holidays', path: '/features/regional-festival-promos' },
    { name: 'Customer Recognition', desc: 'Greet VIP customers via entry recognition', path: '/features/customer-face-recognition' },
    { name: 'IoT Scale Sync', desc: 'Automatic pull from digital weighing scales', path: '/features/smart-weighing-iot' },
    { name: 'Payment Scheduler', desc: 'Automated payment reminders and cycle alerts', path: '/features/supplier-payment-scheduler' },
    { name: 'Dietary Alerts', desc: 'Sugar/allergen identification during checkout', path: '/features/customer-dietary-alerts' },
    { name: 'Sustainability Tracker', desc: 'Monitor reduction in plastic bag usage', path: '/features/plastic-waste-tracker' },
    { name: 'Hardware Rental', desc: 'Rent POS, deep freezers, and printers', path: '/features/hardware-rental-portal' },
    { name: 'Split Billing', desc: 'Separate business/personal items in one bill', path: '/features/wholesale-split-billing' },
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
