import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ 
  label, 
  value, 
  icon: Icon, 
  color = "#e3ebff", // pastel blue default
  trend, 
  isTrendUp = true 
}) {
  return (
    <motion.div 
      whileHover={{ y: -6, scale: 1.01 }}
      style={{ backgroundColor: color }}
      className="rounded-[2.5rem] p-8 flex flex-col justify-between text-[#0a0a0a] shadow-xl h-48 cursor-default"
    >
      <div className="flex justify-between items-start">
        <span className="text-[11px] font-black tracking-[0.1em] opacity-60 uppercase">
          {label}
        </span>
        <div className="p-2.5 rounded-2xl bg-black/5 border border-black/5">
          <Icon size={20} strokeWidth={2.5} />
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-baseline gap-2">
          <h3 className="text-4xl font-black tracking-tighter leading-none">
            ₹{Number(value).toLocaleString('en-IN')}
          </h3>
          {trend && (
            <div className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-black ${
              isTrendUp ? 'bg-black/10 text-black' : 'bg-red-500/10 text-red-700'
            }`}>
              {isTrendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {trend}%
            </div>
          )}
        </div>
        <p className="text-[9px] font-bold opacity-40 uppercase tracking-widest">
          Since last settlement
        </p>
      </div>
    </motion.div>
  );
}