import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-black text-white pt-20 pb-8 px-6 md:px-12 w-full border-t border-white/10 mt-auto">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Top section of footer */}
        <div className="flex flex-col xl:flex-row justify-between items-start mb-16 gap-16 xl:gap-8">
          
          {/* Brand Identity & Socials */}
          <div className="flex flex-col gap-6 xl:w-1/4 shrink-0">
            <div className="text-[28px] font-bold tracking-tight">
              VyaparSetu
            </div>
            <p className="text-gray-400 text-[14px] leading-relaxed max-w-sm">
              The autonomous intelligence layer for Indian retail and Kirana operations. Empowering local businesses with actionable insights and unified commerce tools.
            </p>
            <div className="flex items-center gap-5 text-gray-400 mt-2">
              <a href="#" className="hover:text-white transition-colors" aria-label="LinkedIn">
                <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              </a>
              <a href="#" className="hover:text-white transition-colors" aria-label="Facebook">
                <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
              <a href="#" className="hover:text-white transition-colors" aria-label="Telegram">
                <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              </a>
            </div>
          </div>
          
          {/* 6+ Extra Sitemap Sections Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-10 w-full text-[14px]">
            
            <div className="flex flex-col gap-3">
              <h4 className="font-bold text-white mb-3 tracking-widest text-[11px] uppercase">Platform</h4>
              <Link to="/features/voice-billing-engine" className="text-gray-400 hover:text-white hover:underline transition-colors">Smart POS</Link>
              <Link to="/vai" className="text-gray-400 hover:text-white hover:underline transition-colors">Vyapar AI</Link>
              <Link to="/features/ai-stock-predictor" className="text-gray-400 hover:text-white hover:underline transition-colors">Inventory Sync</Link>
              <Link to="/features/whatsapp-catalogs" className="text-gray-400 hover:text-white hover:underline transition-colors">WhatsApp Store</Link>
            </div>
            
            <div className="flex flex-col gap-3">
              <h4 className="font-bold text-white mb-3 tracking-widest text-[11px] uppercase">Solutions</h4>
              <Link to="/" className="text-gray-400 hover:text-white hover:underline transition-colors">Kirana Stores</Link>
              <Link to="/features/supplier-bidding-hub" className="text-gray-400 hover:text-white hover:underline transition-colors">Wholesale Suppliers</Link>
              <Link to="/features/kirana-brand-monetization" className="text-gray-400 hover:text-white hover:underline transition-colors">FMCG Brands</Link>
              <Link to="/features/omnichannel-qcom-bridge" className="text-gray-400 hover:text-white hover:underline transition-colors">Q-Commerce</Link>
            </div>
            
            <div className="flex flex-col gap-3">
              <h4 className="font-bold text-white mb-3 tracking-widest text-[11px] uppercase">Resources</h4>
              <a href="#" className="text-gray-400 hover:text-white hover:underline transition-colors">Help Center</a>
              <a href="#" className="text-gray-400 hover:text-white hover:underline transition-colors">API Documentation</a>
              <Link to="/features/store-health-dashboard" className="text-gray-400 hover:text-white hover:underline transition-colors">Analytics Guide</Link>
              <Link to="/features/offline-mesh-sync" className="text-gray-400 hover:text-white hover:underline transition-colors">Offline Operation</Link>
            </div>
            
            <div className="flex flex-col gap-3">
              <h4 className="font-bold text-white mb-3 tracking-widest text-[11px] uppercase">Company</h4>
              <Link to="/about" className="text-gray-400 hover:text-white hover:underline transition-colors">About Us</Link>
              <Link to="/contact" className="text-gray-400 hover:text-white hover:underline transition-colors">Contact Us</Link>
              <a href="#" className="text-gray-400 hover:text-white hover:underline transition-colors">Careers</a>
              <a href="#" className="text-gray-400 hover:text-white hover:underline transition-colors">Press & Media</a>
            </div>

            {/* Crucial Onboarding Links bounded to Payment Funnel */}
            <div className="flex flex-col gap-3">
              <h4 className="font-bold text-white mb-3 tracking-widest text-[11px] uppercase">Onboarding</h4>
              <Link to="/pricing" className="text-gray-400 hover:text-white hover:underline transition-colors">Pricing & Plans</Link>
              <Link to="/pricing" className="text-gray-400 hover:text-white hover:underline transition-colors">Register</Link>
              <Link to="/pricing" className="text-gray-400 hover:text-white hover:underline transition-colors">Create Account</Link>
              <Link to="/login2" className="text-gray-400 hover:text-white hover:underline transition-colors">Sign In</Link>
            </div>

            <div className="flex flex-col gap-3">
              <h4 className="font-bold text-white mb-3 tracking-widest text-[11px] uppercase">Governance</h4>
              <Link to="/legal/terms" className="text-gray-400 hover:text-white hover:underline transition-colors">Terms of Service</Link>
              <Link to="/legal/privacy" className="text-gray-400 hover:text-white hover:underline transition-colors">Privacy Policy</Link>
              <Link to="/legal/refunds" className="text-gray-400 hover:text-white hover:underline transition-colors">Refunds Policy</Link>
              <Link to="/sa" className="text-gray-400 hover:text-white hover:underline transition-colors">Secure Admin Node</Link>
            </div>

          </div>
        </div>

        {/* Divider */}
        <hr className="border-[#333333] mb-8" />

        {/* Bottom section of footer */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 text-[13px] text-[#cccccc]">
          <div className="flex flex-wrap gap-x-6 gap-y-4">
            <Link to="/legal/accessibility" className="hover:underline hover:text-white transition-colors">Accessibility support</Link>
            <Link to="/legal/terms" className="hover:underline hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/legal/privacy" className="hover:underline hover:text-white transition-colors">Privacy policy</Link>
            <Link to="/legal/refunds" className="hover:underline hover:text-white transition-colors">Refunds</Link>
            <Link to="/contact" className="hover:underline hover:text-white transition-colors">Support Requests</Link>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 lg:gap-12 w-full lg:w-auto">
            <p>Looking for support documentation? <a href="#" className="text-white hover:underline">Visit Help Center</a></p>
            <p>Page last updated: <strong className="text-white">Feb 21, 2026</strong></p>
            
            <div className="flex flex-col items-start lg:items-end gap-2">
              <p>Architecture by <strong className="text-white">Arun Ammisetty</strong> & <strong className="text-white">Palak Bhosale</strong></p>
              
              <div className="flex items-center gap-3 ml-1">
                {/* Arun Socials */}
                <a href="https://github.com/arunammisetty" target="_blank" rel="noopener noreferrer" className="text-[#cccccc] hover:text-white transition-colors" aria-label="GitHub Arun">
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                </a>
                <a href="https://linkedin.com/in/arunammisetty" target="_blank" rel="noopener noreferrer" className="text-[#cccccc] hover:text-[#005ea2] transition-colors" aria-label="LinkedIn Arun">
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                </a>
                
                <span className="text-zinc-700 px-1">|</span>
                
                {/* Palak Socials */}
                <a href="https://github.com/palakbhosale" target="_blank" rel="noopener noreferrer" className="text-[#cccccc] hover:text-white transition-colors" aria-label="GitHub Palak">
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                </a>
                <a href="https://linkedin.com/in/palakbhosale" target="_blank" rel="noopener noreferrer" className="text-[#cccccc] hover:text-[#005ea2] transition-colors" aria-label="LinkedIn Palak">
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                </a>
              </div>
            </div>

          </div>
        </div>

      </div>
    </footer>
  );
}