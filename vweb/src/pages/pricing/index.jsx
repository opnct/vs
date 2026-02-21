import React, { useState } from 'react';
import { ArrowDown, ArrowRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <div className="flex flex-col w-full bg-black text-white animate-in fade-in duration-700">
      
      {/* 1. Hero Section (Earth.gov Full Bleed Style) */}
      <section className="relative w-full h-[60vh] flex items-center justify-start px-6 md:px-12 lg:px-24 overflow-hidden border-b border-[#333]">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 to-transparent z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80" 
          alt="Retail Data Background" 
          className="absolute inset-0 w-full h-full object-cover z-0 object-center opacity-40 grayscale"
        />
        
        {/* Hero Content */}
        <div className="relative z-20 max-w-4xl pt-20">
          <h1 className="text-5xl md:text-7xl lg:text-[6rem] font-bold text-white tracking-tight leading-[1.05] mb-8 uppercase">
            SOFTWARE <br /> PRICING
          </h1>
          <p className="text-xl md:text-2xl text-[#cccccc] max-w-2xl font-normal tracking-wide mb-10">
            Start for free, upgrade when your retail operations demand advanced capabilities.
          </p>
          <a 
            href="#plans"
            className="inline-flex items-center gap-3 bg-[#005ea2] hover:bg-[#0b4774] text-white px-8 py-4 font-bold tracking-wider transition-colors text-[13px] uppercase"
          >
            Explore Plans <ArrowDown size={18} strokeWidth={2.5}/>
          </a>
        </div>
      </section>

      {/* 2. Toggle Section (Rigid & Institutional) */}
      <section id="plans" className="w-full bg-[#0a0a0a] py-12 px-6 md:px-12 lg:px-24 border-b border-[#222] scroll-mt-20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 max-w-7xl mx-auto">
          <h2 className="text-[22px] font-bold tracking-widest uppercase">
            SELECT BILLING CYCLE
          </h2>
          <div className="flex items-center gap-6 bg-[#111] p-2 rounded-lg border border-[#333]">
            <span className={`text-[13px] font-bold tracking-widest uppercase px-4 ${!isAnnual ? 'text-white' : 'text-[#666]'}`}>
              Monthly
            </span>
            <button 
              onClick={() => setIsAnnual(!isAnnual)} 
              className="w-16 h-8 bg-[#222] rounded-full relative p-1 transition-colors border border-[#444] focus:outline-none"
              aria-label="Toggle Annual Billing"
            >
              <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${isAnnual ? 'translate-x-8' : 'translate-x-0'}`}></div>
            </button>
            <span className={`text-[13px] font-bold tracking-widest uppercase px-4 ${isAnnual ? 'text-white' : 'text-[#666]'}`}>
              Annual <span className="text-[#005ea2] ml-1">(Save 20%)</span>
            </span>
          </div>
        </div>
      </section>

      {/* 3. Pricing Grid (Earth.gov Portal Cards Style) */}
      <section className="relative w-full bg-[#181818] py-24 px-6 md:px-12 lg:px-24 overflow-hidden border-b border-[#333]">
        {/* Topographic pattern simulation */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(circle_at_center,_transparent_0,_transparent_10px,_white_11px,_white_12px)] [background-size:60px_60px]"></div>

        <div className="relative z-10 grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          
          {/* Card 1: Basic */}
          <div className="bg-[#222222] border border-[#333333] hover:border-[#555555] transition-colors p-8 md:p-10 flex flex-col rounded-xl">
            <div className="bg-white text-black text-[11px] font-bold px-2 py-1 rounded inline-flex items-center w-max mb-6 uppercase tracking-wider">
              Starter Tier
            </div>
            <h3 className="text-3xl font-bold tracking-wide mb-3 text-white">Basic Khata</h3>
            <p className="text-[#aaaaaa] text-[15px] mb-8 leading-relaxed min-h-[44px]">
              Essential digital ledger tools for tiny roadside shops and solo operators.
            </p>
            <div className="text-[3.5rem] font-bold text-white mb-10 tracking-tight leading-none">
              Free
            </div>
            <div className="flex-1">
              <ul className="space-y-5 text-[#cccccc] text-[15px] mb-10">
                <li className="flex gap-4 items-start"><Check size={20} strokeWidth={3} className="text-[#005ea2] shrink-0 mt-0.5"/> <span>Basic Billing module</span></li>
                <li className="flex gap-4 items-start"><Check size={20} strokeWidth={3} className="text-[#005ea2] shrink-0 mt-0.5"/> <span>Up to 100 Inventory Items</span></li>
                <li className="flex gap-4 items-start"><Check size={20} strokeWidth={3} className="text-[#005ea2] shrink-0 mt-0.5"/> <span>Single device access</span></li>
              </ul>
            </div>
            <button className="w-full bg-[#333] hover:bg-[#444] text-white py-4 rounded font-bold tracking-wider uppercase transition-colors text-[13px] flex justify-center items-center gap-2">
              Get Started <ArrowRight size={16}/>
            </button>
          </div>

          {/* Card 2: Pro (Highlighted) */}
          <div className="bg-black border-2 border-[#005ea2] p-8 md:p-10 flex flex-col relative transform lg:-translate-y-4 shadow-2xl rounded-xl">
            <div className="absolute top-0 left-0 right-0 bg-[#005ea2] text-center text-[11px] font-bold py-1.5 uppercase tracking-widest text-white rounded-t-lg">
              Recommended for Retailers
            </div>
            <div className="bg-[#005ea2] text-white text-[11px] font-bold px-2 py-1 rounded inline-flex items-center w-max mb-6 uppercase tracking-wider mt-4">
              Professional Tier
            </div>
            <h3 className="text-3xl font-bold tracking-wide mb-3 text-white">Growth Pro</h3>
            <p className="text-[#aaaaaa] text-[15px] mb-8 leading-relaxed min-h-[44px]">
              Advanced point-of-sale and inventory management for serious supermarkets.
            </p>
            <div className="text-[3.5rem] font-bold text-white mb-10 tracking-tight flex items-baseline gap-2 leading-none">
              ₹{isAnnual ? '899' : '1099'} <span className="text-xl font-normal text-[#888]">/ mo</span>
            </div>
            <div className="flex-1">
              <ul className="space-y-5 text-[#cccccc] text-[15px] mb-10">
                <li className="flex gap-4 items-start"><Check size={20} strokeWidth={3} className="text-[#005ea2] shrink-0 mt-0.5"/> <span>Unlimited POS Billing</span></li>
                <li className="flex gap-4 items-start"><Check size={20} strokeWidth={3} className="text-[#005ea2] shrink-0 mt-0.5"/> <span>Automated WhatsApp Reminders</span></li>
                <li className="flex gap-4 items-start"><Check size={20} strokeWidth={3} className="text-[#005ea2] shrink-0 mt-0.5"/> <span>Low Inventory Alerts via SMS</span></li>
                <li className="flex gap-4 items-start"><Check size={20} strokeWidth={3} className="text-[#005ea2] shrink-0 mt-0.5"/> <span>Cloud Auto-Sync (Offline ready)</span></li>
              </ul>
            </div>
            <button className="w-full bg-[#005ea2] hover:bg-[#0b4774] text-white py-4 rounded font-bold tracking-wider uppercase transition-colors text-[13px] flex justify-center items-center gap-2">
              Start 14-Day Free Trial <ArrowRight size={16}/>
            </button>
          </div>

          {/* Card 3: Enterprise */}
          <div className="bg-[#222222] border border-[#333333] hover:border-[#555555] transition-colors p-8 md:p-10 flex flex-col rounded-xl">
            <div className="bg-white text-black text-[11px] font-bold px-2 py-1 rounded inline-flex items-center w-max mb-6 uppercase tracking-wider">
              Corporate Tier
            </div>
            <h3 className="text-3xl font-bold tracking-wide mb-3 text-white">Enterprise</h3>
            <p className="text-[#aaaaaa] text-[15px] mb-8 leading-relaxed min-h-[44px]">
              Custom solutions, APIs, and oversight for multi-store franchises and supply chains.
            </p>
            <div className="text-[3.5rem] font-bold text-white mb-10 tracking-tight flex items-baseline gap-2 leading-none">
              ₹{isAnnual ? '2499' : '2999'} <span className="text-xl font-normal text-[#888]">/ mo</span>
            </div>
            <div className="flex-1">
              <ul className="space-y-5 text-[#cccccc] text-[15px] mb-10">
                <li className="flex gap-4 items-start"><Check size={20} strokeWidth={3} className="text-[#005ea2] shrink-0 mt-0.5"/> <span>Direct Supplier Integrations</span></li>
                <li className="flex gap-4 items-start"><Check size={20} strokeWidth={3} className="text-[#005ea2] shrink-0 mt-0.5"/> <span>Developer API Access & Webhooks</span></li>
                <li className="flex gap-4 items-start"><Check size={20} strokeWidth={3} className="text-[#005ea2] shrink-0 mt-0.5"/> <span>Dedicated Implementation Manager</span></li>
              </ul>
            </div>
            <Link to="/contact" className="w-full bg-[#333] hover:bg-[#444] text-white py-4 rounded font-bold tracking-wider uppercase transition-colors text-[13px] flex justify-center items-center gap-2">
              Contact Sales <ArrowRight size={16}/>
            </Link>
          </div>

        </div>
      </section>

      {/* 4. Footer CTA (Earth.gov Text Block Style) */}
      <section className="w-full bg-[#0a0a0a] py-24 px-6 md:px-12 lg:px-24 border-b border-[#333]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-[3.5rem] md:text-[5rem] font-bold tracking-tight text-white mb-8 uppercase leading-[1.05]">
            PLAN YOUR <br className="hidden md:block" /> GROWTH
          </h2>
          <p className="text-[#aaaaaa] text-lg md:text-xl max-w-3xl leading-relaxed mb-12">
            VyaparSetu's infrastructure is designed to support scaling retail operations. Custom deployment and data migration solutions are available for organizations running more than 5 physical locations. Speak with a federal-level implementation specialist to map out your digital transition.
          </p>
          <Link 
            to="/contact" 
            className="inline-flex items-center gap-3 bg-white hover:bg-gray-200 text-black px-8 py-4 font-bold tracking-wider uppercase transition-colors text-[13px] rounded-sm"
          >
            Request Implementation Info <ArrowRight size={18} strokeWidth={2.5}/>
          </Link>
        </div>
      </section>

    </div>
  );
}