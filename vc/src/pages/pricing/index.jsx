import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, Star, Zap, Building2, Store, Package, 
  ArrowRight, Globe, Layers, ShieldCheck, Microchip, 
  ChevronRight, Database, CloudLightning, Activity,
  Smartphone, Cpu, ScanLine
} from 'lucide-react';

const pricingPlans = [
  {
    id: 'plan_free',
    name: 'Free Tier',
    icon: Store,
    price: 0,
    priceLabel: '₹0',
    billingCycle: 'Forever',
    description: 'Basic access for micro-retailers to explore the VyaparSetu ecosystem.',
    features: [
      'Basic Chatbot Access (50 queries/mo)',
      'Daily Mandi Rate Updates (1 Location)',
      'Standard Community Support',
      'Single User Login'
    ],
    buttonText: 'Start for Free',
    recommended: false
  },
  {
    id: 'plan_starter',
    name: 'Kirana Starter',
    icon: Package,
    price: 999,
    priceLabel: '₹999',
    billingCycle: '/ month',
    description: 'Essential AI intelligence for single-store Kirana owners.',
    features: [
      'Unlimited Chatbot Queries',
      'Micro-Weather Stock Predictor',
      'WhatsApp Khata Reminders (100/mo)',
      'Daily Wage Tracker',
      'Email Support'
    ],
    buttonText: 'Select Starter',
    recommended: false
  },
  {
    id: 'plan_growth',
    name: 'Super Kirana',
    icon: Star,
    price: 2499,
    priceLabel: '₹2,499',
    billingCycle: '/ month',
    description: 'Advanced financial and supply chain tools for high-volume stores.',
    features: [
      'Everything in Kirana Starter',
      'FMCG Scheme Decoding Scanner',
      'Mandi-Rate Arbitrage Engine',
      'Staff Fraud (Pilferage) Detector',
      'Unlimited WhatsApp Reminders',
      'Priority Phone Support'
    ],
    buttonText: 'Select Growth',
    recommended: true
  },
  {
    id: 'plan_distributor',
    name: 'Distributor Hub',
    icon: Building2,
    price: 4999,
    priceLabel: '₹4,999',
    billingCycle: '/ month',
    description: 'Wholesale-grade features for stockists and multi-branch retailers.',
    features: [
      'Everything in Super Kirana',
      'Distributor Route Planner',
      'B2B Tax Credit (ITC) Scanner',
      'Expiry Liquidation Network Access',
      'Supplier Payment Scheduler',
      'Multi-Store Dashboard'
    ],
    buttonText: 'Select Distributor',
    recommended: false
  },
  {
    id: 'plan_enterprise',
    name: 'Enterprise / FPO',
    icon: Zap,
    price: 9999,
    priceLabel: '₹9,999+',
    billingCycle: '/ month',
    description: 'Custom infrastructure for large supply chains and FPOs.',
    features: [
      'All Premium Features',
      'Direct-to-Farmer (FPO) Sourcing',
      'Custom API Integrations',
      'Dedicated Account Manager',
      'White-labeled Reporting',
      'Unlimited Store Locations'
    ],
    buttonText: 'Request Custom Plan',
    recommended: false
  }
];

// --- NEW DATA FOR EXTRA SECTIONS ---
const capabilities = [
  {
    title: 'Earth-Scale Supply Chain Sync',
    desc: 'The VyaparSetu Information Center consolidates live Mandi data, FMCG distributor routes, and micro-weather telemetry from across the Indian subcontinent.',
    img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
    tag: 'Portal'
  },
  {
    title: 'Hyperlocal Financial Mesh',
    desc: 'Bypass traditional banking bottlenecks. Track Khata credit, UPI Soundbox spoofing, and B2B tax credits in real-time with military-grade encryption.',
    img: 'https://images.unsplash.com/photo-1639322537504-6427a16b0a28?auto=format&fit=crop&q=80&w=800',
    tag: 'Portal'
  }
];

const hardwareIntegrations = [
  { title: "IoT Weighing Scales", icon: Activity, desc: "Bluetooth-enabled scale sync for loose commodities." },
  { title: "CCTV Fraud Vision", icon: ScanLine, desc: "RTSP stream processing for pilferage detection." },
  { title: "UPI Audio Modules", icon: Smartphone, desc: "Bank-agnostic QR soundbox interception." },
  { title: "Offline Mesh Hubs", icon: Cpu, desc: "LoRaWAN sync during severe power load-shedding." }
];

const successStories = [
  { title: 'AGRICULTURE SOURCING', img: 'https://images.unsplash.com/photo-1592982537447-6f2a6a0a3824?auto=format&fit=crop&q=80&w=600' },
  { title: 'URBAN INVENTORY', img: 'https://images.unsplash.com/photo-1601599561096-f87c95fff1e9?auto=format&fit=crop&q=80&w=600' },
  { title: 'RURAL CREDIT RISK', img: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&q=80&w=600' }
];

export default function Pricing() {
  const navigate = useNavigate();

  const handleSelectPlan = (plan) => {
    // FIX: Destructure to only send serializable data (Remove React Components like icon)
    const serializablePlan = {
      id: plan.id,
      name: plan.name,
      price: plan.price,
      priceLabel: plan.priceLabel,
      billingCycle: plan.billingCycle
    };
    
    // Route to payment page securely passing the serializable plan object in memory state
    navigate('/payment', { state: { selectedPlan: serializablePlan } });
  };

  return (
    <div className="bg-black min-h-screen text-white font-sans selection:bg-[#0d6efd] selection:text-white">
      
      {/* 1. MASSIVE HERO SECTION (Earth.gov Style) */}
      <section className="relative h-[85vh] flex flex-col justify-center overflow-hidden border-b border-[#333]">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=2000" 
            alt="Satellite Earth View" 
            className="w-full h-full object-cover opacity-50 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent" />
        </div>

        <div className="relative z-10 max-w-[1400px] mx-auto px-6 sm:px-12 w-full">
          <h1 className="text-5xl md:text-7xl lg:text-[80px] font-bold tracking-tight text-white leading-[1.1] mb-6 max-w-4xl uppercase">
            DATA FOR <br/>RETAIL COMMAND
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mb-10 leading-relaxed font-light">
            Access the VyaparSetu intelligence network. Real-time telemetry for Indian Kiranas and micro-SMEs powered by sovereign-grade AI infrastructure.
          </p>
          <button 
            onClick={() => document.getElementById('pricing-grid').scrollIntoView({ behavior: 'smooth' })}
            className="bg-[#0d6efd] hover:bg-[#0b5ed7] text-white font-bold px-8 py-4 text-sm tracking-widest flex items-center gap-3 transition-colors uppercase"
          >
            SELECT MISSION TIER <ArrowRight size={18} className="rotate-90" />
          </button>
        </div>
      </section>

      {/* 2. THE PRICING GRID (Core Logic) */}
      <section id="pricing-grid" className="py-24 bg-black relative z-20">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-[#333] pb-8">
            <div>
              <h2 className="text-sm font-bold tracking-[0.2em] text-[#0d6efd] uppercase mb-4">
                Operational Clearance Levels
              </h2>
              <p className="text-2xl md:text-4xl font-bold tracking-tight uppercase">Platform Subscription Plans</p>
            </div>
            <div className="text-xs text-gray-500 font-mono flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> SYSTEM STATUS: OPERATIONAL
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {pricingPlans.map((plan) => {
              const Icon = plan.icon;
              const isRecommended = plan.recommended;

              return (
                <div 
                  key={plan.id} 
                  className={`bg-[#111] border transition-all duration-300 flex flex-col h-full group ${isRecommended ? 'border-[#0d6efd] ring-1 ring-[#0d6efd]/50 shadow-[0_0_30px_rgba(13,110,253,0.15)]' : 'border-[#333] hover:border-gray-500'}`}
                >
                  <div className="p-6 border-b border-[#222]">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-2 bg-[#222] text-white inline-flex border border-[#333]`}>
                        <Icon size={20} />
                      </div>
                      {isRecommended && (
                        <span className="bg-[#0d6efd] text-white text-[10px] font-black uppercase tracking-widest py-1 px-2">
                          Standard
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 tracking-tight">{plan.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold tracking-tighter">{plan.priceLabel}</span>
                      <span className="text-[10px] text-gray-500 tracking-wider uppercase">{plan.billingCycle}</span>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <p className="text-xs text-gray-400 mb-6 h-10 leading-relaxed">{plan.description}</p>
                    <ul className="space-y-4 mb-8 flex-1">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-[13px] text-gray-300">
                          <CheckCircle2 size={14} className={isRecommended ? "text-[#0d6efd] shrink-0 mt-0.5" : "text-gray-600 shrink-0 mt-0.5"} />
                          <span className="leading-tight">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handleSelectPlan(plan)}
                      className={`w-full py-3.5 text-[11px] font-black tracking-[0.2em] uppercase transition-colors flex justify-center items-center gap-2 ${
                        isRecommended 
                          ? 'bg-[#0d6efd] hover:bg-[#0b5ed7] text-white shadow-lg' 
                          : 'bg-transparent hover:bg-white hover:text-black text-white border border-[#444]'
                      }`}
                    >
                      {plan.buttonText}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. NEW SECTION: OPERATIONAL THEMES */}
      <section className="py-24 bg-[#0a0a0a] border-t border-[#222]">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-12">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-10 uppercase border-l-4 border-[#0d6efd] pl-6">
            LEARN ABOUT RETAIL THEMES
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {successStories.map((story, idx) => (
              <div key={idx} className="relative aspect-[4/5] bg-zinc-900 overflow-hidden group cursor-pointer border border-[#222] hover:border-[#444] transition-all">
                <img src={story.img} alt={story.title} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-all duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent" />
                
                <div className="absolute top-6 left-6 bg-white text-black text-[10px] font-black px-4 py-2 flex items-center gap-2 tracking-[0.15em] uppercase">
                  <Globe size={12} /> Intelligence Theme
                </div>

                <h3 className="absolute bottom-8 left-8 text-2xl font-bold tracking-tight text-white flex items-center gap-3">
                  {story.title}
                  <ArrowRight size={24} className="text-[#0d6efd] opacity-0 -translate-x-6 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. NEW SECTION: EXPLORE PORTALS (Topographic Style) */}
      <section 
        className="py-28 relative bg-black border-y border-[#333]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 86c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zm66-3c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zm-46-45c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zm26 18c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zm16 18c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zM24 62c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zm14-47c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zM85 45c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zM48 30c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zm24-3c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zM33 46c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zm-15 7c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zM59 80c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zM76 62c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zm-42 9c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zM10 3c1.657 0 3 1.343 3 3s-1.343 3-3 3-3-1.343-3-3 1.343-3 3-3zm76 83c1.657 0 3 1.343 3 3s-1.343 3-3 3-3-1.343-3-3 1.343-3 3-3zm-30-47c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM54 75c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM16 29c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zm56 12c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM9 58c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zm80 24c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM20 70c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zm50-50c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zm20 40c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zM30 30c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zm-20 10c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zm40 40c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zM90 10c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zM0 100l100-100' fill='none' stroke='%231f1f1f' stroke-width='0.5'/%3E%3C/svg%3E")`
        }}
      >
        <div className="max-w-[1400px] mx-auto px-6 sm:px-12 relative z-10">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-12 uppercase border-l-4 border-[#0d6efd] pl-6">
            EXPLORE OUR PORTALS
          </h2>

          <div className="flex flex-col gap-8">
            {capabilities.map((cap, idx) => (
              <div key={idx} className="bg-[#111]/95 backdrop-blur-md border border-[#333] flex flex-col md:flex-row hover:border-gray-500 transition-all duration-300">
                <div className="w-full md:w-[40%] lg:w-[35%] h-72 md:h-auto border-b md:border-b-0 md:border-r border-[#333] overflow-hidden">
                  <img src={cap.img} alt={cap.title} className="w-full h-full object-cover opacity-70 grayscale hover:grayscale-0 transition-all duration-700" />
                </div>
                <div className="p-10 md:p-14 flex flex-col justify-center flex-1">
                  <div className="bg-white text-black text-[10px] font-black px-4 py-1.5 inline-flex items-center gap-2 tracking-[0.2em] mb-8 self-start uppercase">
                    <Layers size={14} /> {cap.tag}
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight uppercase leading-tight">{cap.title}</h3>
                  <p className="text-gray-400 leading-relaxed mb-10 max-w-2xl text-base font-light">
                    {cap.desc}
                  </p>
                  <button className="flex items-center gap-3 text-white font-black text-xs tracking-[0.25em] hover:text-[#0d6efd] transition-all self-start uppercase group">
                    OPEN COMMAND PORTAL <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. NEW SECTION: HARDWARE INTERACTIVES */}
      <section className="py-28 bg-[#0a0a0a]">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-12">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-12 uppercase border-l-4 border-[#0d6efd] pl-6">
            INTERACTIVES & HARDWARE
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {hardwareIntegrations.map((hw, idx) => (
              <div key={idx} className="bg-[#111] p-10 border border-[#222] hover:border-[#0d6efd] transition-all group flex flex-col items-center text-center">
                <div className="bg-[#1a1a1a] p-5 text-white mb-8 group-hover:bg-[#0d6efd] transition-all border border-[#333] group-hover:border-[#0d6efd] shadow-lg">
                  <hw.icon size={32} />
                </div>
                <div className="text-[10px] text-[#0d6efd] font-black tracking-[0.3em] uppercase mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#0d6efd] rounded-full shadow-[0_0_10px_#0d6efd]"></span> Subsystem
                </div>
                <h3 className="text-lg font-bold text-white mb-4 tracking-tight uppercase">{hw.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed font-light">{hw.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. NEW SECTION: SECURITY PROTOCOLS */}
      <section className="py-24 bg-black border-t border-[#333]">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-12">
          <div className="max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-8 uppercase flex items-center gap-5">
              <ShieldCheck className="text-[#0d6efd]" size={48} /> SECURITY CLEARANCE FAQ
            </h2>
            <p className="text-gray-400 mb-14 text-xl font-light leading-relaxed">
              Platform access is restricted to verified Indian business entities. Our protocol ensures that sensitive trade algorithms and Mandi intelligence data remain within an authorized retail perimeter.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
              {[
                { q: "Why is instant access not granted upon payment?", a: "To prevent systematic scraping of our Mandi Arbitrage APIs by unauthorized aggregators, all accounts require human-in-the-loop (HITL) verification by our Super Admin controllers. Approval is generally processed within 2-4 standard business hours." },
                { q: "What happens if my KYC or Payment is denied?", a: "In the event a UTR (Transaction Reference) is flagged as invalid or fraudulent, the request is terminated immediately. Authorized refunds for clerical errors initiate automatically to the source account within 48 hours." },
                { q: "How is my store's private ledger data protected?", a: "Your financial records, including Khata repayment scores and distributor margins, are encrypted at rest using industry-standard AES-256 protocols. VyaparSetu administrators cannot view raw transaction details without explicit support ticket clearance." }
              ].map((faq, idx) => (
                <div key={idx} className="border-b border-[#222] pb-10 group">
                  <h4 className="text-white font-bold tracking-tight text-lg mb-4 flex items-start gap-4 group-hover:text-[#0d6efd] transition-colors">
                    <ChevronRight size={24} className="text-[#0d6efd] shrink-0 mt-0.5" /> {faq.q}
                  </h4>
                  <p className="text-gray-500 pl-10 leading-loose text-base font-light">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER STRIP */}
      <footer className="py-10 bg-[#050505] border-t border-[#111] text-center">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-[11px] font-black tracking-[0.3em] text-gray-600 uppercase">
              V-SETU OPERATIONAL COMMAND
            </div>
            <div className="flex gap-8">
              <a href="#" className="text-[10px] font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-widest">Privacy Protocol</a>
              <a href="#" className="text-[10px] font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-widest">Accessibility</a>
              <a href="#" className="text-[10px] font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-widest">Clearance Status</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}