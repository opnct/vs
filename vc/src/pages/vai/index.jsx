import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Menu, X, ChevronDown, ExternalLink, MessageSquare, 
  BrainCircuit, Mic, TrendingUp, ShieldCheck, 
  Smartphone, BarChart4, Network, Coins, Zap
} from 'lucide-react';

export default function VyaparAIPortal() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');

  // Real-world sections mapping
  const sections = [
    { id: 'overview', label: 'Vyapar AI Purpose', icon: BrainCircuit },
    { id: 'voice-billing', label: 'Voice-Activated Billing', icon: Mic },
    { id: 'predictive-inventory', label: 'Predictive Inventory', icon: TrendingUp },
    { id: 'udhaar-management', label: 'Automated Udhaar Ledger', icon: Coins },
    { id: 'dynamic-pricing', label: 'Dynamic Margin Control', icon: BarChart4 },
    { id: 'vernacular-engine', label: 'Multilingual NLP Engine', icon: MessageSquare },
    { id: 'omnichannel', label: 'Omnichannel Integrations', icon: Network },
    { id: 'security', label: 'Sovereign Data Security', icon: ShieldCheck },
    { id: 'getting-started', label: 'Implementation Steps', icon: Zap }
  ];

  // Scroll Spy Logic tied to Window
  useEffect(() => {
    const handleScroll = () => {
      let currentSection = 'overview';
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          // Adjust offset to trigger slightly before the section hits the top
          if (rect.top <= 200) {
            currentSection = section.id;
          }
        }
      }
      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Trigger once on mount
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 100; // Account for sticky nav
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#1b1b1b] font-sans selection:bg-[#005ea2] selection:text-white flex flex-col">
      
      {/* 3. MAIN DOCUMENT CONTENT */}
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-6 md:px-12 py-16 lg:py-24">
        
        {/* Document Title */}
        <div className="mb-20">
          <h1 className="text-5xl md:text-7xl font-bold text-black tracking-tight uppercase leading-none">
            VYAPAR AI
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 relative">
          
          {/* 4. SCROLL SPY SIDEBAR (Earth.gov Exact Style) */}
          <aside className="w-full lg:w-72 shrink-0">
            <div className="sticky top-32">
              <h3 className="text-[14px] font-bold text-black mb-6">On this page</h3>
              <nav className="flex flex-col border-l-2 border-zinc-100">
                {sections.map((section) => (
                  <button 
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`text-left py-2.5 px-4 text-[15px] font-medium transition-all relative ${
                      activeSection === section.id 
                        ? 'text-[#005ea2] font-bold' 
                        : 'text-zinc-600 hover:text-black'
                    }`}
                  >
                    {/* Active State Thick Black Line Indicator */}
                    {activeSection === section.id && (
                      <span className="absolute left-[-2px] top-0 bottom-0 w-1 bg-black rounded-r-sm"></span>
                    )}
                    {section.label}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* 5. SECTIONS CONTENT AREA */}
          <div className="flex-1 max-w-4xl space-y-32 pb-32">
            
            {/* Section 1: Overview */}
            <section id="overview" className="scroll-mt-32">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-8 text-black flex items-center gap-4">
                <BrainCircuit className="text-[#005ea2]" size={36} /> Vyapar AI Purpose
              </h2>
              <p className="text-[17px] leading-[1.8] text-zinc-800 mb-6">
                Vyapar AI aims to provide a holistic, autonomous intelligence layer for Indian retail and Kirana operations. It connects business owners with actionable insights derived from their own transaction data, enabling them to make precise decisions about inventory, pricing, and customer credit management.
              </p>
              <p className="text-[17px] leading-[1.8] text-zinc-800">
                Unlike generic language models, Vyapar AI is pre-trained on FMCG dynamics, regional supply chain variables, and the unique linguistic patterns of Indian commerce. It acts as the central brain of the VyaparSetu ecosystem, turning unstructured voice commands into structured ledger data.
              </p>
            </section>

            {/* Section 2: Voice Billing */}
            <section id="voice-billing" className="scroll-mt-32">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-8 text-black flex items-center gap-4">
                <Mic className="text-[#005ea2]" size={36} /> Voice-Activated Billing
              </h2>
              <p className="text-[17px] leading-[1.8] text-zinc-800 mb-8">
                Physical retail is fast-paced. Navigating complex menus or scanning barcodes for unbranded items slows down checkout. Vyapar AI introduces conversational billing to bypass the UI entirely.
              </p>
              <div className="bg-zinc-50 border border-zinc-200 p-8 rounded-sm mb-8">
                <h4 className="font-bold text-black mb-4 uppercase tracking-widest text-[11px] text-zinc-500">Live Execution Example</h4>
                <p className="font-mono text-[14px] text-zinc-800 mb-4 flex items-start gap-3">
                  <span className="bg-black text-white px-2 py-0.5 rounded-sm shrink-0">USER</span> 
                  "Add 2 kilos of loose Toor Dal, 1 packet of Britannia Bread, and apply a 10 rupee discount."
                </p>
                <p className="font-mono text-[14px] text-[#005ea2] flex items-start gap-3">
                  <span className="bg-[#005ea2] text-white px-2 py-0.5 rounded-sm shrink-0">AI</span> 
                  "Generated. Total is ₹340. The discount has been applied to the subtotal. Printing receipt."
                </p>
              </div>
              <ul className="list-disc pl-6 space-y-3 text-[17px] text-zinc-800">
                <li>Bypasses traditional barcode scanning for loose commodities (sugar, grains, pulses).</li>
                <li>Automatically calculates tax rates based on vocalized product names.</li>
                <li>Reduces customer queue times at the counter by 45% during peak hours.</li>
              </ul>
            </section>

            {/* Section 3: Predictive Inventory */}
            <section id="predictive-inventory" className="scroll-mt-32">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-8 text-black flex items-center gap-4">
                <TrendingUp className="text-[#005ea2]" size={36} /> Predictive Inventory
              </h2>
              <p className="text-[17px] leading-[1.8] text-zinc-800 mb-6">
                What inventory data is analyzed by Vyapar AI? The system ingests external macro-variables and correlates them with your store's historical flow. The predictive models revolve around local themes: weather anomalies, regional festivals, agricultural harvest cycles, and macro FMCG trends.
              </p>
              <p className="text-[17px] leading-[1.8] text-zinc-800 mb-6">
                The predictions generated have the following characteristics:
              </p>
              <ul className="list-disc pl-6 space-y-3 text-[17px] text-zinc-800">
                <li><strong className="text-black">Actionable:</strong> It generates exact wholesale order lists rather than generic graphs.</li>
                <li><strong className="text-black">Hyperlocal:</strong> Stock suggestions adapt to the demographic purchasing power within a 2km radius of your specific shop.</li>
                <li><strong className="text-black">Automated:</strong> Integrates directly with the Supplier Bidding Hub to place low-stock requisitions without manual intervention.</li>
              </ul>
            </section>

            {/* Section 4: Udhaar Ledger */}
            <section id="udhaar-management" className="scroll-mt-32">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-8 text-black flex items-center gap-4">
                <Coins className="text-[#005ea2]" size={36} /> Automated Udhaar Ledger
              </h2>
              <p className="text-[17px] leading-[1.8] text-zinc-800 mb-8">
                Managing informal credit (Khata) is a massive pain point for Indian retailers. Vyapar AI converts manual book-keeping into a self-reconciling autonomous network.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="border border-zinc-200 p-6 shadow-sm">
                  <h3 className="font-bold text-black text-xl mb-3">Credit Scoring</h3>
                  <p className="text-zinc-600 leading-relaxed text-[15px]">
                    The AI assigns internal credit scores to your regular customers based on their historical repayment timelines, suggesting limits to prevent bad debt.
                  </p>
                </div>
                <div className="border border-zinc-200 p-6 shadow-sm">
                  <h3 className="font-bold text-black text-xl mb-3">Smart Reminders</h3>
                  <p className="text-zinc-600 leading-relaxed text-[15px]">
                    Commands like "Send payment links to all customers owing more than ₹500" execute instantly via integrated WhatsApp API gateways.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 5: Dynamic Margin */}
            <section id="dynamic-pricing" className="scroll-mt-32">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-8 text-black flex items-center gap-4">
                <BarChart4 className="text-[#005ea2]" size={36} /> Dynamic Margin Control
              </h2>
              <p className="text-[17px] leading-[1.8] text-zinc-800">
                For loose goods and unbranded inventory, setting the right price requires constant monitoring. Vyapar AI evaluates the <strong>Mandi Rate Tracker</strong> data feed against your inward wholesale cost, suggesting daily retail price adjustments to maximize profit margins without alienating price-sensitive consumers. It also flags near-expiry packaged goods for automated liquidation discounts.
              </p>
            </section>

            {/* Section 6: Multilingual Engine */}
            <section id="vernacular-engine" className="scroll-mt-32">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-8 text-black flex items-center gap-4">
                <MessageSquare className="text-[#005ea2]" size={36} /> Multilingual NLP Engine
              </h2>
              <p className="text-[17px] leading-[1.8] text-zinc-800 mb-8">
                Language should not be a barrier to enterprise software. Vyapar AI is architected with a heavily customized Natural Language Processing (NLP) core that understands code-switching (mixing English with regional languages).
              </p>
              <div className="bg-[#1b1b1b] text-white p-8 rounded-sm">
                <h4 className="text-[12px] font-bold uppercase tracking-widest text-zinc-400 mb-6">Supported Audio & Text Inputs</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['Hindi', 'Marathi', 'Gujarati', 'Tamil', 'Telugu', 'Kannada', 'Bengali', 'Hinglish'].map((lang, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-[#00e676] rounded-full"></div>
                      <span className="font-medium text-[15px]">{lang}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Section 7: Omnichannel Integration */}
            <section id="omnichannel" className="scroll-mt-32">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-8 text-black flex items-center gap-4">
                <Network className="text-[#005ea2]" size={36} /> Omnichannel Integrations
              </h2>
              <p className="text-[17px] leading-[1.8] text-zinc-800">
                What can you do with Vyapar AI using existing hardware? The intelligence layer acts as a bridge. It pulls data from Bluetooth-enabled digital weighing scales, pushes self-updating product catalogs to your business WhatsApp account, and maps physical store layouts to aid new staff in item retrieval. It transforms standalone devices into a unified, smart mesh.
              </p>
            </section>

            {/* Section 8: Security */}
            <section id="security" className="scroll-mt-32">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-8 text-black flex items-center gap-4">
                <ShieldCheck className="text-[#005ea2]" size={36} /> Sovereign Data Security
              </h2>
              <p className="text-[17px] leading-[1.8] text-zinc-800 mb-6">
                Data privacy is non-negotiable. VyaparSetu operates strictly on isolated tenant architecture. Your store's transactional data, customer phone numbers, and supplier invoices are encrypted at rest using AES-256 standards.
              </p>
              <p className="text-[17px] leading-[1.8] text-zinc-800">
                The AI model utilizes differential privacy and federated learning protocols. This means the model learns macro trends (e.g., "Demand for sugar spikes in October") to improve accuracy across the network, but your raw, identifiable store data never leaves your secure node.
              </p>
            </section>

            {/* Section 9: Getting Started */}
            <section id="getting-started" className="scroll-mt-32 border-t border-zinc-200 pt-16 mt-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-8 text-black flex items-center gap-4">
                <Zap className="text-[#005ea2]" size={36} /> How to bring Vyapar AI to your store?
              </h2>
              <p className="text-[17px] leading-[1.8] text-zinc-800 mb-8">
                Vyapar AI is embedded directly into the VyaparSetu Platform Node. There are no secondary apps to install. Hardware specs are minimal, requiring only a standard Android/iOS tablet or Windows POS terminal with internet connectivity.
              </p>
              <Link 
                to="/pricing" 
                className="inline-flex items-center gap-3 bg-[#005ea2] hover:bg-[#0b4774] text-white px-8 py-4 font-bold tracking-widest uppercase transition-colors"
              >
                View Pricing & Plans <ExternalLink size={18} />
              </Link>
            </section>

          </div>
        </div>
      </main>

    </div>
  );
}