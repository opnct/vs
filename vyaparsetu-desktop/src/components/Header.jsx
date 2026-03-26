import React, { useState, useEffect } from 'react';
import { Calculator, Clock, Wifi } from 'lucide-react';

export default function Header() {
  // Real-time clock state
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Format date for Indian retail context
  const formattedDate = currentTime.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formattedTime = currentTime.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  return (
    <header className="flex items-center justify-between px-8 py-8 bg-transparent shrink-0">
      
      {/* 1. GREETING & REAL-TIME CLOCK */}
      <div>
        <h2 className="text-3xl font-normal text-brand-text tracking-tight">
          Hello <span className="font-bold">Owner</span>
        </h2>
        <p className="text-brand-muted text-sm mt-1.5 flex items-center gap-2 font-medium">
           <Clock size={16} className="opacity-70" /> 
           {formattedDate} — {formattedTime}
        </p>
      </div>

      {/* 2. ACTIONS & STATUS */}
      <div className="flex items-center gap-5">
        
        {/* System Offline/Online Badge */}
        <div className="flex items-center gap-2.5 bg-white px-5 py-2.5 rounded-2xl shadow-sm border border-gray-100">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <div className="flex items-center gap-2">
            <Wifi size={14} className="text-brand-muted" />
            <span className="text-sm font-bold text-brand-text tracking-wide">System Online</span>
          </div>
        </div>

        {/* Global Calculator Action */}
        <button 
          className="flex items-center justify-center p-3.5 bg-white text-brand-text rounded-2xl shadow-soft-float hover:bg-pastel-blue hover:text-brand-text transition-all duration-200 border border-gray-50 active:scale-95 group"
          title="Open Calculator"
        >
          <Calculator size={22} className="group-hover:stroke-[2.5px]" />
        </button>

      </div>
      
    </header>
  );
}