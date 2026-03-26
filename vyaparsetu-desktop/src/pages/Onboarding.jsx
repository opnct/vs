import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  BookOpen, 
  Package, 
  MonitorOff, 
  ChevronRight, 
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

const slides = [
  {
    id: 0,
    title: "Lightning Fast Billing",
    description: "Experience the fastest POS interface designed for busy Kirana counters. Barcode support and hotkeys included.",
    icon: <Zap size={48} className="text-brand-blue" />,
    color: "bg-brand-blue/10",
    accent: "border-brand-blue/20"
  },
  {
    id: 1,
    title: "Digital Udhaar Khata",
    description: "Replace your physical registers. Manage customer credits and track payments with automated reminders.",
    icon: <BookOpen size={48} className="text-mac-yellow" />,
    color: "bg-mac-yellow/10",
    accent: "border-mac-yellow/20"
  },
  {
    id: 2,
    title: "Inventory Intelligence",
    description: "Real-time stock tracking with low-stock alerts. Manage suppliers and purchase records in one secure place.",
    icon: <Package size={48} className="text-mac-green" />,
    color: "bg-mac-green/10",
    accent: "border-mac-green/20"
  },
  {
    id: 3,
    title: "Offline-First Reliability",
    description: "No internet? No problem. VyaparSetu works fully offline. Your data syncs to the cloud automatically when you're back online.",
    icon: <MonitorOff size={48} className="text-status-orange" />,
    color: "bg-status-orange/10",
    accent: "border-status-orange/20"
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
    <div className="h-screen w-full bg-brand-dark flex items-center justify-center p-6 overflow-hidden select-none">
      <div className="max-w-xl w-full">
        
        {/* Slide Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="bg-brand-surface rounded-[2.5rem] p-10 border border-white/5 shadow-2xl relative overflow-hidden"
          >
            {/* Visual Decoration */}
            <div className={`absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[80px] opacity-20 ${slides[currentSlide].color}`}></div>

            <div className={`w-24 h-24 rounded-3xl flex items-center justify-center border-2 mb-10 transition-colors ${slides[currentSlide].accent} ${slides[currentSlide].color}`}>
              {slides[currentSlide].icon}
            </div>

            <h1 className="text-4xl font-black text-white tracking-tight mb-4">
              {slides[currentSlide].title}
            </h1>
            
            <p className="text-lg text-brand-muted leading-relaxed mb-12">
              {slides[currentSlide].description}
            </p>

            <div className="flex items-center justify-between">
              {/* Progress Dots */}
              <div className="flex gap-2.5">
                {slides.map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      currentSlide === i ? 'w-8 bg-brand-blue' : 'w-1.5 bg-white/10'
                    }`}
                  />
                ))}
              </div>

              {/* Action Button */}
              <button
                onClick={handleNext}
                className={`px-8 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all active:scale-95 ${
                  currentSlide === slides.length - 1 
                    ? 'bg-mac-green text-black hover:shadow-[0_0_20px_rgba(39,201,63,0.3)]' 
                    : 'bg-brand-blue text-white hover:shadow-[0_0_20px_rgba(0,122,255,0.3)]'
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
        <div className="mt-8 flex justify-center gap-6">
           <p className="text-[10px] font-bold text-[#444] uppercase tracking-[0.3em]">
             VyaparSetu Terminal v2.0
           </p>
           <div className="w-1 h-1 rounded-full bg-[#333] self-center"></div>
           <p className="text-[10px] font-bold text-[#444] uppercase tracking-[0.3em]">
             Made for Kirana Excellence
           </p>
        </div>

      </div>
    </div>
  );
}