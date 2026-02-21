import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-black text-white pt-16 pb-8 px-6 md:px-12 w-full border-t border-white/10 mt-auto">
      <div className="max-w-[1400px] mx-auto">
        
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