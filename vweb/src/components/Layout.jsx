import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, ChevronUp } from 'lucide-react';

export default function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isModulesOpen, setIsModulesOpen] = useState(false);
  const location = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
    setIsMobileMenuOpen(false);
    setIsModulesOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-black text-white">
      
      {/* Official Top Banner */}
      <div className="bg-[#f0f0f0] text-[#333333] text-xs py-1.5 px-4 md:px-8 flex items-center gap-2 relative z-[60]">
        <span>🇮🇳</span>
        <span>An official product of VyaparSetu Technologies</span>
        <button className="text-[#005ea2] hover:underline flex items-center gap-0.5 ml-1">
          Here's how you know <ChevronDown size={12} />
        </button>
      </div>

      {/* Main Navbar */}
      <nav className="bg-black text-white px-6 md:px-8 py-5 flex justify-between items-center sticky top-0 z-50">
        <Link to="/" className="text-[22px] font-bold tracking-tight z-50">
          VyaparSetu
        </Link>
        
        {/* Desktop Links */}
        <div className="hidden md:flex gap-8 items-center text-[13px] font-bold tracking-widest relative">
          <Link to="/about" className="hover:text-gray-300 transition-colors">ABOUT</Link>
          <Link to="/pricing" className="hover:text-gray-300 transition-colors">PRICING</Link>
          
          <div 
            className="relative"
            onMouseEnter={() => setIsModulesOpen(true)}
            onMouseLeave={() => setIsModulesOpen(false)}
          >
            <button 
              className={`flex items-center gap-1 hover:text-gray-300 transition-colors py-2 ${isModulesOpen ? 'text-gray-300' : ''}`}
            >
              MODULES {isModulesOpen ? <ChevronUp size={14} strokeWidth={3}/> : <ChevronDown size={14} strokeWidth={3}/>}
            </button>
            
            {/* Desktop Dropdown */}
            {isModulesOpen && (
              <div className="absolute top-full right-0 w-64 bg-[#1a1a1a] shadow-2xl py-2 flex flex-col">
                <Link to="/features/smart-pos" className="px-6 py-4 text-[13px] font-bold tracking-widest hover:bg-[#333333] transition-colors border-b border-[#333333]">SMART POS</Link>
                <Link to="/features/inventory" className="px-6 py-4 text-[13px] font-bold tracking-widest hover:bg-[#333333] transition-colors border-b border-[#333333]">INVENTORY</Link>
                <Link to="/features/udhaar-ledger" className="px-6 py-4 text-[13px] font-bold tracking-widest hover:bg-[#333333] transition-colors border-b border-[#333333]">UDHAAR LEDGER</Link>
                <Link to="/features/marketplace" className="px-6 py-4 text-[13px] font-bold tracking-widest hover:bg-[#333333] transition-colors border-b border-[#333333]">MARKETPLACE</Link>
                <Link to="/features/suppliers" className="px-6 py-4 text-[13px] font-bold tracking-widest hover:bg-[#333333] transition-colors border-b border-[#333333]">SUPPLIERS</Link>
                <Link to="/features/analytics" className="px-6 py-4 text-[13px] font-bold tracking-widest hover:bg-[#333333] transition-colors">ANALYTICS</Link>
              </div>
            )}
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
            <Link to="/about" className="py-4 border-b border-[#333333] hover:text-white">ABOUT</Link>
            <Link to="/pricing" className="py-4 border-b border-[#333333] hover:text-white">PRICING</Link>
            <div className="py-4 border-b border-[#333333] flex justify-between items-center text-white">
              MODULES <span>—</span>
            </div>
            {/* Mobile Submenu */}
            <div className="flex flex-col pl-4">
              <Link to="/features/smart-pos" className="py-4 border-b border-[#333333] text-[#888888] hover:text-white">SMART POS</Link>
              <Link to="/features/inventory" className="py-4 border-b border-[#333333] text-[#888888] hover:text-white">INVENTORY</Link>
              <Link to="/features/udhaar-ledger" className="py-4 border-b border-[#333333] text-[#888888] hover:text-white">UDHAAR LEDGER</Link>
              <Link to="/features/marketplace" className="py-4 border-b border-[#333333] text-[#888888] hover:text-white">MARKETPLACE</Link>
              <Link to="/features/suppliers" className="py-4 border-b border-[#333333] text-[#888888] hover:text-white">SUPPLIERS</Link>
            </div>
            <Link to="/contact" className="py-4 border-b border-[#333333] hover:text-white">CONTACT</Link>
          </div>
        </div>
      )}
      
      {/* Page Content */}
      <main className="flex-1 bg-white text-black flex flex-col">
        <Outlet />
      </main>

      {/* Footer - Earth.gov Style */}
      <footer className="bg-black text-white pt-16 pb-8 px-6 md:px-12 w-full">
        {/* Top section of footer */}
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
              <a href="#" className="hover:text-white transition-colors" aria-label="Telegram">
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              </a>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 text-[15px]">
            <Link to="/about" className="hover:underline hover:text-gray-300">About</Link>
            <Link to="/pricing" className="hover:underline hover:text-gray-300">Pricing & Plans</Link>
            <Link to="/contact" className="hover:underline hover:text-gray-300">Contact Us</Link>
          </div>
        </div>

        {/* Divider */}
        <hr className="border-[#333333] mb-8" />

        {/* Bottom section of footer */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 text-[13px] text-[#cccccc]">
          <div className="flex flex-wrap gap-x-6 gap-y-4">
            <Link to="/legal/privacy" className="hover:underline">Accessibility support</Link>
            <Link to="/legal/terms" className="hover:underline">Terms of Service</Link>
            <Link to="/legal/privacy" className="hover:underline">Privacy policy</Link>
            <Link to="/legal/refunds" className="hover:underline">Refunds</Link>
            <Link to="/contact" className="hover:underline">Support Requests</Link>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 lg:gap-12 w-full lg:w-auto">
            <p>Looking for support documentation? <a href="#" className="text-white hover:underline">Visit Help Center</a></p>
            <p>Page last updated: <strong>Feb 21, 2026</strong></p>
            <div className="flex items-center flex-wrap gap-2">
              <p>Developed and Maintained by <strong className="text-white">Arun Ammisetty</strong></p>
              <div className="flex items-center gap-3 ml-1">
                <a href="#" className="text-[#cccccc] hover:text-white transition-colors" aria-label="GitHub">
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                </a>
                <a href="#" className="text-[#cccccc] hover:text-white transition-colors" aria-label="LinkedIn">
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}