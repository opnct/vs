import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Linkedin, Database, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-black text-white border-t border-white/10">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
          
          {/* SECTION 1 */}
          <div className="space-y-8">
            <h2 className="text-3xl font-black uppercase tracking-tighter">VyaparSetu.ai</h2>
            <p className="text-zinc-500 text-sm leading-relaxed">
              Standardizing the unorganized Indian retail sector through satellite data, real-time AI, and unified inventory mesh networking.
            </p>
            <div className="flex gap-4">
              <div className="bg-white/5 p-3 rounded-sm border border-white/10 group hover:border-[#005ea2] transition-colors cursor-help">
                <Database size={18} className="text-[#005ea2]" />
              </div>
              <div className="bg-white/5 p-3 rounded-sm border border-white/10 group hover:border-[#005ea2] transition-colors cursor-help">
                <ShieldCheck size={18} className="text-[#005ea2]" />
              </div>
            </div>
          </div>

          {/* SECTION 2: PORTALS */}
          <div className="space-y-6 text-sm">
            <h4 className="font-black uppercase tracking-[0.3em] text-[#005ea2] text-[10px]">Explore Portals</h4>
            <div className="flex flex-col gap-3 font-bold uppercase tracking-widest text-zinc-400">
               <Link to="/features/ai-stock-predictor" className="hover:text-white transition-all">Stock Prediction</Link>
               <Link to="/features/voice-billing-engine" className="hover:text-white transition-all">Voice Billing</Link>
               <Link to="/features/ocr-inward-billing" className="hover:text-white transition-all">OCR Scan</Link>
               <Link to="/features/mandi-rate-tracker" className="hover:text-white transition-all">Mandi Index</Link>
               <Link to="/features/whatsapp-chatbot-ordering" className="hover:text-white transition-all">Order Bot</Link>
            </div>
          </div>

          {/* SECTION 3: QUICK LINKS */}
          <div className="space-y-6 text-sm">
            <h4 className="font-black uppercase tracking-[0.3em] text-[#005ea2] text-[10px]">Resources</h4>
            <div className="flex flex-col gap-3 font-bold uppercase tracking-widest text-zinc-400">
               <Link to="/about" className="hover:text-white transition-all">Mission Earth</Link>
               <Link to="/pricing" className="hover:text-white transition-all">Pricing Model</Link>
               <Link to="/compliance" className="hover:text-white transition-all">Shop Act Vault</Link>
               <Link to="/audit" className="hover:text-white transition-all">Security Audit</Link>
               <Link to="/contact" className="hover:text-white transition-all">Developer Hub</Link>
            </div>
          </div>

          {/* SECTION 4: DEVELOPER CREDITS */}
          <div className="space-y-6 text-sm bg-zinc-900/40 p-8 border border-white/5 rounded-xl">
            <h4 className="font-black uppercase tracking-[0.3em] text-[#005ea2] text-[10px]">Architecture Credits</h4>
            
            <div className="space-y-6">
               <div className="flex items-center justify-between">
                 <span className="font-black uppercase tracking-tighter text-white">Arun Ammisetty</span>
                 <div className="flex gap-3">
                   <a href="https://github.com/arunammisetty" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white transition-colors"><Github size={16}/></a>
                   <a href="https://linkedin.com/in/arunammisetty" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-[#005ea2] transition-colors"><Linkedin size={16}/></a>
                 </div>
               </div>
               <div className="flex items-center justify-between">
                 <span className="font-black uppercase tracking-tighter text-white">Palak Bhosale</span>
                 <div className="flex gap-3">
                   <a href="https://github.com/palakbhosale" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white transition-colors"><Github size={16}/></a>
                   <a href="https://linkedin.com/in/palakbhosale" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-[#005ea2] transition-colors"><Linkedin size={16}/></a>
                 </div>
               </div>
            </div>
          </div>

        </div>

        {/* BOTTOM GOV STYLE */}
        <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-start gap-8">
            <div className="flex flex-wrap gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">
              <span className="cursor-help hover:text-zinc-400">Accessibility support</span>
              <span className="cursor-help hover:text-zinc-400">Privacy Policy</span>
              <span className="cursor-help hover:text-zinc-400">Performance Reports</span>
              <span className="cursor-help hover:text-zinc-400">Security Sovereignty</span>
            </div>
            <div className="text-zinc-600 text-[10px] leading-loose text-left md:text-right">
                Looking for government information? Visit <span className="text-zinc-400 underline">VyaparIndia.gov</span> <br />
                Page last updated: <span className="text-zinc-400 font-bold uppercase tracking-widest">Dec 18, 2025</span> <br />
                VyaparSetu Information Center Responsible Official: <span className="text-white font-bold underline">VyaparSetu Core</span>
            </div>
        </div>
      </div>
    </footer>
  );
}
