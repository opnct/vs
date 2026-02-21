import React from 'react';
import { ArrowDown, ArrowRight, ExternalLink, Globe, LayoutGrid, Database, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="flex flex-col w-full bg-black text-white animate-in fade-in duration-700">
      
      {/* 1. Hero Section (Earth.gov Full Bleed Image Style) */}
      <section className="relative w-full h-[85vh] flex items-center justify-start px-6 md:px-12 lg:px-24 overflow-hidden">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80" 
          alt="Retail Store Background" 
          className="absolute inset-0 w-full h-full object-cover z-0 object-center opacity-80"
        />
        
        {/* Hero Content */}
        <div className="relative z-20 max-w-4xl pt-20">
          <h1 className="text-6xl md:text-7xl lg:text-[7rem] font-bold text-white tracking-tight leading-[1.05] mb-10">
            SOFTWARE FOR <br /> RETAIL STORES
          </h1>
          <Link 
            to="/features/smart-pos" 
            className="inline-flex items-center gap-3 bg-[#005ea2] hover:bg-[#0b4774] text-white px-8 py-4 font-bold tracking-wider transition-colors text-[15px]"
          >
            EXPLORE <ArrowDown size={20} strokeWidth={2.5}/>
          </Link>
        </div>
      </section>

      {/* 2. Themes/Modules Section (Carousel of Portrait Cards) */}
      <section className="w-full bg-black py-20 px-6 md:px-12 lg:px-24">
        <h2 className="text-[22px] font-bold tracking-widest uppercase mb-12">
          LEARN ABOUT VYAPAR THEMES
        </h2>
        
        <div className="flex gap-6 overflow-x-auto pb-8 snap-x hide-scrollbar">
          {/* Card 1 */}
          <div className="relative w-[320px] md:w-[380px] h-[480px] shrink-0 rounded-lg overflow-hidden group snap-start cursor-pointer">
            <img src="https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&q=80" alt="POS" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
            <div className="absolute top-4 left-4 bg-white text-black text-[11px] font-bold px-2 py-1 rounded flex items-center gap-1.5">
              <Globe size={12} /> Vyapar Theme
            </div>
            <div className="absolute bottom-6 left-6 right-6">
              <h3 className="text-2xl font-bold tracking-wide uppercase flex items-center gap-2">
                SMART POS <span className="bg-[#005ea2] rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"><ArrowRight size={16}/></span>
              </h3>
            </div>
          </div>

          {/* Card 2 */}
          <div className="relative w-[320px] md:w-[380px] h-[480px] shrink-0 rounded-lg overflow-hidden group snap-start cursor-pointer">
            <img src="https://images.unsplash.com/photo-1586528116311-ad8ed745eb33?auto=format&fit=crop&q=80" alt="Inventory" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
            <div className="absolute top-4 left-4 bg-white text-black text-[11px] font-bold px-2 py-1 rounded flex items-center gap-1.5">
              <Database size={12} /> Vyapar Theme
            </div>
            <div className="absolute bottom-6 left-6 right-6">
              <h3 className="text-2xl font-bold tracking-wide uppercase flex items-center gap-2">
                INVENTORY <span className="bg-[#005ea2] rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"><ArrowRight size={16}/></span>
              </h3>
            </div>
          </div>

          {/* Card 3 */}
          <div className="relative w-[320px] md:w-[380px] h-[480px] shrink-0 rounded-lg overflow-hidden group snap-start cursor-pointer">
            <img src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80" alt="Ledger" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
            <div className="absolute top-4 left-4 bg-white text-black text-[11px] font-bold px-2 py-1 rounded flex items-center gap-1.5">
              <LayoutGrid size={12} /> Vyapar Theme
            </div>
            <div className="absolute bottom-6 left-6 right-6">
              <h3 className="text-2xl font-bold tracking-wide uppercase flex items-center gap-2">
                UDHAAR KHATA <span className="bg-[#005ea2] rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"><ArrowRight size={16}/></span>
              </h3>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Interactives Section */}
      <section className="w-full bg-[#0a0a0a] py-20 px-6 md:px-12 lg:px-24">
        <h2 className="text-[22px] font-bold tracking-widest uppercase mb-12">
          INTERACTIVES
        </h2>
        
        <div className="relative w-full rounded-2xl overflow-hidden bg-[#111] min-h-[400px] flex items-center p-8 md:p-16 border border-[#222]">
          {/* Mock Interactive graphic (globe/data visualization) */}
          <div className="absolute right-0 top-0 bottom-0 w-full md:w-2/3 opacity-30 pointer-events-none">
            <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/40 via-black to-[#0a0a0a]"></div>
            <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80" className="absolute inset-0 w-full h-full object-cover mix-blend-screen opacity-50" alt="Data" />
          </div>
          
          <div className="relative z-10 max-w-xl">
            <div className="bg-white text-black text-xs font-bold px-3 py-1.5 rounded inline-flex items-center gap-2 mb-6">
              <BarChart3 size={14} /> Interactive
            </div>
            <h3 className="text-4xl md:text-5xl font-bold tracking-tight uppercase flex items-center gap-4 mb-4">
              <span className="border-b-4 border-white pb-1">MARKET TRENDS</span> 
              <button className="bg-[#005ea2] hover:bg-[#0b4774] text-white p-2 rounded-full transition-colors shrink-0">
                <ArrowRight size={24} />
              </button>
            </h3>
            <p className="text-[#cccccc] text-lg leading-relaxed mt-6">
              VyaparSetu Market Trends is a way for you to learn about hyperlocal consumer behavior, inventory movement, and the commerce ecosystem around your store.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Portals Section (Topographic Background Style) */}
      <section className="relative w-full bg-[#181818] py-24 px-6 md:px-12 lg:px-24 overflow-hidden border-t border-[#333]">
        {/* Topographic SVG pattern simulation via CSS radial gradients */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(circle_at_center,_transparent_0,_transparent_10px,_white_11px,_white_12px)] [background-size:60px_60px]"></div>
        
        <div className="relative z-10">
          <h2 className="text-[22px] font-bold tracking-widest uppercase mb-12">
            EXPLORE OUR PORTALS
          </h2>

          <div className="flex flex-col gap-8 max-w-5xl">
            
            {/* Portal Card 1 */}
            <div className="bg-[#222222] rounded-xl flex flex-col md:flex-row overflow-hidden border border-[#333] hover:border-[#555] transition-colors">
              <div className="w-full md:w-1/3 h-64 md:h-auto shrink-0 relative">
                <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80" alt="Dashboard" className="absolute inset-0 w-full h-full object-cover" />
              </div>
              <div className="p-8 md:p-10 flex flex-col justify-center">
                <div className="bg-white text-black text-[11px] font-bold px-2 py-1 rounded inline-flex items-center gap-1.5 w-max mb-4">
                  <LayoutGrid size={12} /> Portal
                </div>
                <h3 className="text-2xl font-bold tracking-wide mb-4">Vyapar Information Center</h3>
                <p className="text-[#aaaaaa] leading-relaxed mb-6 text-[15px]">
                  The Vyapar Information Center consolidates data on local commerce from across regional distributors. VyaparSetu is also the gateway to other inter-store cooperative efforts for our network.
                </p>
                <Link to="/features/analytics" className="text-[#4da8ec] hover:text-[#7bbcf0] font-bold flex items-center gap-2 text-[15px]">
                  Open Portal <ExternalLink size={18} />
                </Link>
              </div>
            </div>

            {/* Portal Card 2 */}
            <div className="bg-[#222222] rounded-xl flex flex-col md:flex-row overflow-hidden border border-[#333] hover:border-[#555] transition-colors">
              <div className="w-full md:w-1/3 h-64 md:h-auto shrink-0 relative">
                <img src="https://images.unsplash.com/photo-1580674285054-bed31e145f59?auto=format&fit=crop&q=80" alt="Logistics" className="absolute inset-0 w-full h-full object-cover" />
              </div>
              <div className="p-8 md:p-10 flex flex-col justify-center">
                <div className="bg-white text-black text-[11px] font-bold px-2 py-1 rounded inline-flex items-center gap-1.5 w-max mb-4">
                  <LayoutGrid size={12} /> Portal
                </div>
                <h3 className="text-2xl font-bold tracking-wide mb-4">India Supplier Network</h3>
                <p className="text-[#aaaaaa] leading-relaxed mb-6 text-[15px]">
                  The India Supplier Network is a multi-agency effort pairing inventory data visualizations with accessible supply chain tracking to help store owners prepare for high-demand challenges.
                </p>
                <Link to="/features/suppliers" className="text-[#4da8ec] hover:text-[#7bbcf0] font-bold flex items-center gap-2 text-[15px]">
                  Open Portal <ExternalLink size={18} />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}