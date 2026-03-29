import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  BookOpen, 
  Package, 
  MonitorOff, 
  ChevronRight, 
  CheckCircle2
} from 'lucide-react';

const slides = [
  {
    id: 0,
    title: "Lightning Fast Billing",
    description: "Experience the fastest POS interface designed for busy retail counters. Seamless barcode support and hotkeys included.",
    icon: <Zap size={48} className="text-[#007AFF]" />,
    color: "bg-[#007AFF]/10",
    accent: "border-[#007AFF]/30",
    glow: "bg-[#007AFF]"
  },
  {
    id: 1,
    title: "Digital Udhaar Khata",
    description: "Replace physical ledgers. Manage customer credits, track payments, and send automated reminders instantly.",
    icon: <BookOpen size={48} className="text-[#FFBD2E]" />,
    color: "bg-[#FFBD2E]/10",
    accent: "border-[#FFBD2E]/30",
    glow: "bg-[#FFBD2E]"
  },
  {
    id: 2,
    title: "Inventory Intelligence",
    description: "Real-time stock tracking with low-stock alerts. Manage suppliers and purchase records in one secure place.",
    icon: <Package size={48} className="text-[#27C93F]" />,
    color: "bg-[#27C93F]/10",
    accent: "border-[#27C93F]/30",
    glow: "bg-[#27C93F]"
  },
  {
    id: 3,
    title: "Offline-First Reliability",
    description: "No internet? No problem. VyaparSetu works fully offline. Your data syncs to the cloud seamlessly when you're back online.",
    icon: <MonitorOff size={48} className="text-[#FF5F56]" />,
    color: "bg-[#FF5F56]/10",
    accent: "border-[#FF5F56]/30",
    glow: "bg-[#FF5F56]"
  }
];

export default function Onboarding({ onComplete }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      finishOnboarding();
    }
  };

  const finishOnboarding = () => {
    localStorage.setItem('vs_onboarding_done', 'true');
    // Dispatch storage event to update App.jsx state instantly
    window.dispatchEvent(new Event('storage'));
    onComplete();
  };

  return (
    <div className="h-screen w-full bg-[#0a0a0a] flex items-center justify-center p-6 overflow-hidden select-none">
      <div className="max-w-xl w-full">
        
        {/* Slide Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -40, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="bg-[#1c1c1e] rounded-[2.5rem] p-12 border border-white/5 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.8)] relative overflow-hidden"
          >
            {/* Visual Decoration / Ambient Glow */}
            <div className={`absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[100px] opacity-20 ${slides[currentSlide].glow} transition-colors duration-700`}></div>

            <div className={`w-24 h-24 rounded-[1.5rem] flex items-center justify-center border-2 mb-10 transition-colors duration-500 ${slides[currentSlide].accent} ${slides[currentSlide].color}`}>
              {slides[currentSlide].icon}
            </div>

            <h1 className="text-4xl font-black text-white tracking-tight mb-4">
              {slides[currentSlide].title}
            </h1>
            
            <p className="text-lg text-[#888888] font-medium leading-relaxed mb-14">
              {slides[currentSlide].description}
            </p>

            <div className="flex items-center justify-between">
              {/* Progress Dots */}
              <div className="flex gap-2">
                {slides.map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      currentSlide === i ? 'w-8 bg-[#007AFF] shadow-[0_0_10px_rgba(0,122,255,0.8)]' : 'w-2 bg-white/10'
                    }`}
                  />
                ))}
              </div>

              {/* Action Button */}
              <button
                onClick={handleNext}
                className={`px-8 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all active:scale-95 ${
                  currentSlide === slides.length - 1 
                    ? 'bg-[#27C93F] text-black hover:shadow-[0_0_20px_rgba(39,201,63,0.4)]' 
                    : 'bg-[#007AFF] text-white hover:shadow-[0_0_20px_rgba(0,122,255,0.4)]'
                }`}
              >
                {currentSlide === slides.length - 1 ? (
                  <>Get Started <CheckCircle2 size={20} /></>
                ) : (
                  <>Continue <ChevronRight size={20} /></>
                )}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* System Footer Info */}
        <div className="mt-10 flex justify-center gap-6">
           <p className="text-[10px] font-bold text-[#444] uppercase tracking-[0.3em]">
             VyaparSetu Terminal v2.0
           </p>
           <div className="w-1 h-1 rounded-full bg-[#333] self-center"></div>
           <p className="text-[10px] font-bold text-[#444] uppercase tracking-[0.3em]">
             Premium Offline Edition
           </p>
        </div>

      </div>
    </div>
  );
}