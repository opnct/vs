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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      
      {/* 1. OFFICIAL TOP BANNER */}
      <div className="bg-[#f0f0f0] text-[#333333] text-xs py-1.5 px-4 md:px-8 flex items-center gap-2 relative z-[60] border-b border-zinc-200">
        <img src="https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg" className="h-3 w-auto border border-zinc-300" alt="Indian flag" />
        <span>An official technology of VyaparSetu.</span>
        <button className="text-[#005ea2] hover:underline flex items-center gap-0.5 ml-1 font-medium">
          Here's how you know <ChevronDown size={12} />
        </button>
      </div>

      {/* 2. INSTITUTIONAL HEADER */}
      <header className="bg-black text-white px-6 md:px-8 py-5 flex justify-between items-center sticky top-0 z-50">
        <Link to="/" className="text-[22px] font-bold tracking-tight z-50">
          VyaparSetu
        </Link>
        
        {/* Desktop Links */}
        <nav className="hidden md:flex gap-8 items-center text-[13px] font-bold tracking-widest">
          <Link to="/about" className="hover:text-gray-300 transition-colors">ABOUT</Link>
          <Link to="/pricing" className="hover:text-gray-300 transition-colors">PRICING</Link>
          <Link to="/vai" className="text-white hover:text-gray-300 transition-colors">VYAPAR AI</Link>
          
          <div className="flex items-center gap-6 ml-4 pl-6 border-l border-white/20">
            <Link to="/login2" className="hover:text-gray-300 transition-colors">LOGIN</Link>
            <Link to="/pricing" className="bg-[#005ea2] hover:bg-[#0b4774] text-white px-5 py-2.5 transition-colors shadow-sm">GET STARTED</Link>
          </div>
        </nav>

        {/* Mobile Toggle */}
        <button className="md:hidden text-white z-50" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={32} strokeWidth={1.5}/> : <Menu size={32} strokeWidth={1.5} />}
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-[#111] z-40 flex flex-col pt-24 px-6 md:hidden overflow-y-auto">
          <div className="flex flex-col text-[17px] font-normal tracking-wide text-gray-300">
            <Link to="/about" className="py-4 border-b border-[#333] hover:text-white">ABOUT</Link>
            <Link to="/pricing" className="py-4 border-b border-[#333] hover:text-white">PRICING</Link>
            <Link to="/vai" className="py-4 border-b border-[#333] text-white font-bold">VYAPAR AI</Link>
            <Link to="/login2" className="py-4 border-b border-[#333] hover:text-white">LOGIN</Link>
            <Link to="/pricing" className="py-4 font-bold text-[#005ea2] hover:text-[#4da8ec]">GET STARTED</Link>
          </div>
        </div>
      )}

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

      {/* 6. INSTITUTIONAL FOOTER */}
      <footer className="bg-black text-white pt-16 pb-8 px-6 md:px-12 w-full border-t border-white/10 mt-auto">
        <div className="max-w-[1400px] mx-auto">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8 md:gap-0">
            <div className="flex flex-col gap-4">
              <div className="text-[22px] font-bold tracking-tight">
                VyaparSetu
              </div>
              <div className="flex items-center gap-4 text-gray-400">
                <a href="#" className="hover:text-white transition-colors" aria-label="LinkedIn">
                  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                </a>
                <a href="#" className="hover:text-white transition-colors" aria-label="Facebook">
                  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                </a>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-6 md:gap-8 text-[15px]">
              <Link to="/about" className="hover:underline hover:text-gray-300">About</Link>
              <Link to="/pricing" className="hover:underline hover:text-gray-300">Pricing & Plans</Link>
              <Link to="/contact" className="hover:underline hover:text-gray-300">Contact Us</Link>
            </div>
          </div>

          <hr className="border-[#333333] mb-8" />

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 text-[13px] text-[#cccccc]">
            <div className="flex flex-wrap gap-x-6 gap-y-4">
              <Link to="/legal/accessibility" className="hover:underline hover:text-white transition-colors">Accessibility support</Link>
              <Link to="/legal/terms" className="hover:underline hover:text-white transition-colors">Terms of Service</Link>
              <Link to="/legal/privacy" className="hover:underline hover:text-white transition-colors">Privacy policy</Link>
            </div>

            <div className="flex flex-col lg:flex-row gap-4 lg:gap-12 w-full lg:w-auto">
              <p>Looking for support documentation? <a href="#" className="text-white hover:underline">Visit Help Center</a></p>
              <div className="flex flex-col items-start lg:items-end gap-1">
                <p>Architecture by <strong className="text-white">Arun Ammisetty</strong> & <strong className="text-white">Palak Bhosale</strong></p>
              </div>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}