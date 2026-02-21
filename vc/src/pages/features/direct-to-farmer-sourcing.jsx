import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, ArrowRight, Activity, ShieldCheck, Zap, 
  Globe2, Layout, Database, Cpu, BarChart3, Clock, 
  CheckCircle2, AlertTriangle, Smartphone, Wallet,
  Server, HardDrive, LineChart, ShieldAlert, Layers,
  Lock
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FeatureDirectToFarmerSourcing() {
  const [logs, setLogs] = useState([]);
  const [metrics, setMetrics] = useState({ efficiency: 0, latency: 0, load: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const newLog = {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        message: `Processing Direct Sourcing data shard...`,
        status: Math.random() > 0.1 ? 'SUCCESS' : 'OPTIMIZING'
      };
      setLogs(prev => [newLog, ...prev].slice(0, 5));
      setMetrics({
        efficiency: (85 + Math.random() * 10).toFixed(1),
        latency: (10 + Math.random() * 20).toFixed(0),
        load: (30 + Math.random() * 40).toFixed(1)
      });
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-[#005ea2] animate-in fade-in duration-700">
      <section className="relative h-[70vh] flex items-center px-6 md:px-24 overflow-hidden border-b border-[#222]">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/95 to-transparent z-10"></div>
        <div className="relative z-20 max-w-4xl">
          <Link to="/" className="inline-flex items-center gap-2 text-[#005ea2] font-bold text-sm mb-10 hover:tracking-widest transition-all uppercase tracking-wider">
            <ArrowLeft size={16} /> RETURN TO FEATURE HUB
          </Link>
          <div className="bg-[#005ea2] text-white text-[10px] font-bold px-3 py-1 rounded-sm inline-block mb-6 uppercase tracking-[0.3em] shadow-lg shadow-blue-900/20">
            Advanced Retail Module
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8 uppercase italic">
            Direct Sourcing
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 max-w-2xl font-medium leading-relaxed border-l-2 border-[#005ea2] pl-6">
            Buy directly from local farmers using VyaparSetu. Empowering Kirana owners with enterprise-grade logic.
          </p>
        </div>
      </section>

      <section className="py-24 px-6 md:px-24 bg-[#0a0a0a]">
        <div className="grid lg:grid-cols-12 gap-12 max-w-7xl mx-auto">
          <div className="lg:col-span-8 bg-[#111] border border-[#222] rounded-sm overflow-hidden shadow-2xl">
            <div className="bg-[#1a1a1a] px-6 py-4 border-b border-[#222] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500/20"></div><div className="w-3 h-3 rounded-full bg-yellow-500/20"></div><div className="w-3 h-3 rounded-full bg-green-500/20"></div></div>
                <span className="text-[10px] font-mono text-gray-500 ml-4 tracking-widest uppercase">System Terminal : FeatureDirectToFarmerSourcing</span>
              </div>
            </div>
            <div className="p-8 space-y-6 min-h-[400px] font-mono text-sm">
              <div className="grid grid-cols-3 gap-4 mb-10 text-center">
                <div className="bg-black/50 p-4 border border-[#222] rounded-sm"><p className="text-[10px] text-gray-500 uppercase mb-2">Efficiency</p><p className="text-2xl font-bold text-[#005ea2] italic">{metrics.efficiency}%</p></div>
                <div className="bg-black/50 p-4 border border-[#222] rounded-sm"><p className="text-[10px] text-gray-500 uppercase mb-2">Inference</p><p className="text-2xl font-bold text-white italic">{metrics.latency}ms</p></div>
                <div className="bg-black/50 p-4 border border-[#222] rounded-sm"><p className="text-[10px] text-gray-500 uppercase mb-2">Load</p><p className="text-2xl font-bold text-gray-400 italic">{metrics.load}%</p></div>
              </div>
              <div className="space-y-2">{logs.map(log => (<div key={log.id} className="flex justify-between border-b border-[#222]/30 py-2"><span className="text-gray-500">[{log.timestamp}] {log.message}</span><span className="text-blue-500 font-bold">{log.status}</span></div>))}</div>
            </div>
          </div>
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#005ea2] p-8 rounded-sm shadow-xl relative overflow-hidden group">
              <Zap size={120} className="absolute -right-10 -bottom-10 text-white/10 rotate-12 group-hover:scale-110 transition-transform" />
              <div className="relative z-10">
                <h3 className="text-lg font-black uppercase mb-4 italic">Real-Time ROI</h3>
                <p className="text-sm text-blue-100 leading-relaxed mb-8 opacity-90">Deploying Direct Sourcing impacts your bottom line by optimizing stock cycles.</p>
                <div className="text-5xl font-black italic tracking-tighter text-white">₹14.2k <span className="text-xs font-normal">/mo avg</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 px-6 md:px-24 bg-white text-black">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-black uppercase italic mb-10 border-l-[12px] border-[#005ea2] pl-8 tracking-tighter leading-[0.85]">System Architecture</h2>
            <p className="text-xl leading-relaxed text-gray-700 mb-10 font-medium">VyaparSetu leverages a proprietary **Stateless Ledger Event Bus** (SLEB) to process Direct Sourcing requests.</p>
          </div>
          <div className="relative bg-black p-12 rounded-sm shadow-2xl"><HardDrive size={120} className="text-[#005ea2] animate-pulse mx-auto" strokeWidth={0.5} /></div>
        </div>
      </section>

      <section className="py-24 px-6 md:px-24 bg-[#111] border-t border-[#222]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-16">
          <div className="text-left"><h2 className="text-5xl font-black uppercase italic tracking-tighter mb-6 leading-none">Modernize your <br /> Vyapar today.</h2></div>
          <Link to="/pricing" className="bg-[#005ea2] text-white px-12 py-6 font-black uppercase tracking-[0.2em] italic hover:bg-blue-700 transition-all rounded-sm flex items-center gap-6 shadow-2xl group">UPGRADE TO PRO <ArrowRight size={24} className="transition-all group-hover:translate-x-2" /></Link>
        </div>
      </section>
    </div>
  );
}
