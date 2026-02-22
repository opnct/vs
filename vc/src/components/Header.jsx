import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, ChevronUp } from 'lucide-react';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isModulesOpen, setIsModulesOpen] = useState(false);
  const location = useLocation();

  // Close menus when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsModulesOpen(false);
  }, [location.pathname]);

  return (
    <header className="w-full z-[100] sticky top-0 font-sans">
      
      {/* Official Top Banner */}
      <div className="bg-[#f0f0f0] text-[#333333] text-xs py-1.5 px-4 md:px-8 flex items-center gap-2 relative z-[60]">
        <img src="https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg" className="h-3 w-auto" alt="Indian flag" />
        <span>An official product of VyaparSetu Technologies</span>
        <button className="text-[#005ea2] hover:underline flex items-center gap-0.5 ml-1">
          Here's how you know <ChevronDown size={12} />
        </button>
      </div>

      {/* Main Navbar */}
      <nav className="bg-black text-white px-6 md:px-8 py-5 flex justify-between items-center relative z-50">
        <Link to="/" className="text-[22px] font-bold tracking-tight z-50">
          VyaparSetu
        </Link>
        
        {/* Desktop Links */}
        <div className="hidden md:flex gap-8 items-center text-[13px] font-bold tracking-widest relative">
          <Link 
            to="/about" 
            className={`transition-all hover:underline underline-offset-[6px] decoration-2 ${location.pathname === '/about' ? 'underline text-white' : 'hover:text-gray-300'}`}
          >
            ABOUT
          </Link>
          <Link 
            to="/pricing" 
            className={`transition-all hover:underline underline-offset-[6px] decoration-2 ${location.pathname === '/pricing' ? 'underline text-white' : 'hover:text-gray-300'}`}
          >
            PRICING
          </Link>
          <Link 
            to="/vai" 
            className={`text-white transition-all hover:underline underline-offset-[6px] decoration-2 ${location.pathname === '/vai' ? 'underline' : 'hover:text-gray-300'}`}
          >
            VYAPAR AI
          </Link>
          
          <div 
            className="relative"
            onMouseEnter={() => setIsModulesOpen(true)}
            onMouseLeave={() => setIsModulesOpen(false)}
          >
            <button 
              className={`flex items-center gap-1 py-2 transition-all hover:underline underline-offset-[6px] decoration-2 ${isModulesOpen || location.pathname.startsWith('/features') ? 'text-gray-300 underline' : 'hover:text-gray-300'}`}
            >
              MODULES {isModulesOpen ? <ChevronUp size={14} strokeWidth={3}/> : <ChevronDown size={14} strokeWidth={3}/>}
            </button>
            
            {/* Desktop Dropdown */}
            {isModulesOpen && (
              <div className="absolute top-full right-0 w-64 bg-[#1a1a1a] shadow-2xl py-2 flex flex-col border border-white/10 rounded-b-lg">
                <Link to="/features/voice-billing-engine" className={`px-6 py-4 text-[13px] font-bold tracking-widest hover:bg-[#333333] transition-all hover:underline underline-offset-[6px] decoration-2 border-b border-[#333333] ${location.pathname === '/features/voice-billing-engine' ? 'underline bg-[#333333]' : ''}`}>SMART POS</Link>
                <Link to="/features/ai-stock-predictor" className={`px-6 py-4 text-[13px] font-bold tracking-widest hover:bg-[#333333] transition-all hover:underline underline-offset-[6px] decoration-2 border-b border-[#333333] ${location.pathname === '/features/ai-stock-predictor' ? 'underline bg-[#333333]' : ''}`}>INVENTORY</Link>
                <Link to="/features/khata-credit-scoring" className={`px-6 py-4 text-[13px] font-bold tracking-widest hover:bg-[#333333] transition-all hover:underline underline-offset-[6px] decoration-2 border-b border-[#333333] ${location.pathname === '/features/khata-credit-scoring' ? 'underline bg-[#333333]' : ''}`}>UDHAAR LEDGER</Link>
                <Link to="/features/whatsapp-catalogs" className={`px-6 py-4 text-[13px] font-bold tracking-widest hover:bg-[#333333] transition-all hover:underline underline-offset-[6px] decoration-2 border-b border-[#333333] ${location.pathname === '/features/whatsapp-catalogs' ? 'underline bg-[#333333]' : ''}`}>MARKETPLACE</Link>
                <Link to="/features/supplier-bidding-hub" className={`px-6 py-4 text-[13px] font-bold tracking-widest hover:bg-[#333333] transition-all hover:underline underline-offset-[6px] decoration-2 border-b border-[#333333] ${location.pathname === '/features/supplier-bidding-hub' ? 'underline bg-[#333333]' : ''}`}>SUPPLIERS</Link>
                <Link to="/features/store-health-dashboard" className={`px-6 py-4 text-[13px] font-bold tracking-widest hover:bg-[#333333] transition-all hover:underline underline-offset-[6px] decoration-2 ${location.pathname === '/features/store-health-dashboard' ? 'underline bg-[#333333]' : ''}`}>ANALYTICS</Link>
              </div>
            )}
          </div>

          {/* Onboarding & Gateway Links */}
          <div className="flex items-center gap-6 ml-2 pl-6 border-l border-white/20">
            <Link 
              to="/login2" 
              className={`transition-all hover:underline underline-offset-[6px] decoration-2 ${location.pathname === '/login2' ? 'underline text-white' : 'hover:text-gray-300'}`}
            >
              LOGIN
            </Link>
            <Link to="/pricing" className="bg-[#005ea2] hover:bg-[#0b4774] text-white px-5 py-2.5 transition-colors shadow-sm">GET STARTED</Link>
          </div>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-white z-50" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={32} strokeWidth={1.5}/> : <Menu size={32} strokeWidth={1.5} />}
        </button>
      </nav>

      {/* Mobile Menu Fullscreen Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-[#111111] z-40 flex flex-col pt-24 px-6 md:hidden overflow-y-auto">
          <div className="flex flex-col text-[17px] font-normal tracking-wide text-gray-300">
            <Link to="/about" className={`py-4 border-b border-[#333333] hover:text-white transition-all hover:underline underline-offset-[6px] decoration-2 ${location.pathname === '/about' ? 'text-white underline' : ''}`}>ABOUT</Link>
            <Link to="/pricing" className={`py-4 border-b border-[#333333] hover:text-white transition-all hover:underline underline-offset-[6px] decoration-2 ${location.pathname === '/pricing' ? 'text-white underline' : ''}`}>PRICING</Link>
            <Link to="/vai" className={`py-4 border-b border-[#333333] text-white hover:text-gray-300 transition-all hover:underline underline-offset-[6px] decoration-2 ${location.pathname === '/vai' ? 'underline' : ''}`}>VYAPAR AI</Link>
            <div className={`py-4 border-b border-[#333333] flex justify-between items-center transition-all ${location.pathname.startsWith('/features') ? 'text-white underline underline-offset-[6px] decoration-2' : 'hover:text-white'}`}>
              MODULES <span>—</span>
            </div>
            {/* Mobile Submenu */}
            <div className="flex flex-col pl-4">
              <Link to="/features/voice-billing-engine" className={`py-4 border-b border-[#333333] text-[#888888] hover:text-white transition-all hover:underline underline-offset-[6px] decoration-2 ${location.pathname === '/features/voice-billing-engine' ? 'text-white underline' : ''}`}>SMART POS</Link>
              <Link to="/features/ai-stock-predictor" className={`py-4 border-b border-[#333333] text-[#888888] hover:text-white transition-all hover:underline underline-offset-[6px] decoration-2 ${location.pathname === '/features/ai-stock-predictor' ? 'text-white underline' : ''}`}>INVENTORY</Link>
              <Link to="/features/khata-credit-scoring" className={`py-4 border-b border-[#333333] text-[#888888] hover:text-white transition-all hover:underline underline-offset-[6px] decoration-2 ${location.pathname === '/features/khata-credit-scoring' ? 'text-white underline' : ''}`}>UDHAAR LEDGER</Link>
              <Link to="/features/whatsapp-catalogs" className={`py-4 border-b border-[#333333] text-[#888888] hover:text-white transition-all hover:underline underline-offset-[6px] decoration-2 ${location.pathname === '/features/whatsapp-catalogs' ? 'text-white underline' : ''}`}>MARKETPLACE</Link>
              <Link to="/features/supplier-bidding-hub" className={`py-4 border-b border-[#333333] text-[#888888] hover:text-white transition-all hover:underline underline-offset-[6px] decoration-2 ${location.pathname === '/features/supplier-bidding-hub' ? 'text-white underline' : ''}`}>SUPPLIERS</Link>
              <Link to="/features/store-health-dashboard" className={`py-4 border-b border-[#333333] text-[#888888] hover:text-white transition-all hover:underline underline-offset-[6px] decoration-2 ${location.pathname === '/features/store-health-dashboard' ? 'text-white underline' : ''}`}>ANALYTICS</Link>
            </div>
            <Link to="/contact" className={`py-4 border-b border-[#333333] hover:text-white transition-all hover:underline underline-offset-[6px] decoration-2 ${location.pathname === '/contact' ? 'text-white underline' : ''}`}>CONTACT</Link>
            
            {/* Mobile Onboarding & Gateway Links */}
            <Link to="/login2" className={`py-4 border-b border-[#333333] hover:text-white transition-all hover:underline underline-offset-[6px] decoration-2 ${location.pathname === '/login2' ? 'text-white underline' : ''}`}>LOGIN</Link>
            <Link to="/pricing" className={`py-4 font-bold text-[#005ea2] hover:text-[#4da8ec] transition-all hover:underline underline-offset-[6px] decoration-2 ${location.pathname === '/pricing' ? 'underline' : ''}`}>GET STARTED</Link>
          </div>
        </div>
      )}
      
    </header>
  );
}