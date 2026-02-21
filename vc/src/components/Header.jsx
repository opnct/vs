import React, { useState } from 'react';
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
