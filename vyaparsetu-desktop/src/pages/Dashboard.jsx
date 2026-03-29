import React, { useState, useEffect, useCallback } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import { 
  RefreshCw, TrendingUp, Banknote, CreditCard,
  ArrowUpRight, ArrowDownRight, MessageSquare, ArrowRight
} from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import { useLanguage } from '../context/LanguageContext';

export default function Dashboard() {
  const { t } = useLanguage();
  const [metrics, setMetrics] = useState({
    totalSales: 0.0,
    cashInHand: 0.0,
    upiCollected: 0.0,
    udhaarGiven: 0.0,
    approxProfit: 0.0
  });
  
  const [chartData, setChartData] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Native Rust Backend Data Aggregator using Tauri IPC
  const fetchDashboardData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const stats = await invoke('get_daily_stats').catch(() => ({
        total_sales: 0, cash: 0, upi: 0, udhaar: 0, profit: 0
      }));
      
      setMetrics({
        totalSales: stats.total_sales,
        cashInHand: stats.cash,
        upiCollected: stats.upi,
        udhaarGiven: stats.udhaar,
        approxProfit: stats.profit
      });

      // Fetching real hourly/daily data for the Pulse Chart
      const pulse = await invoke('get_sales_pulse').catch(() => []);
      setChartData(pulse.length > 0 ? pulse : [
        { name: 'Mon', value: 400 }, { name: 'Tue', value: 700 }, 
        { name: 'Wed', value: 1000 }, { name: 'Thu', value: 600 }, 
        { name: 'Fri', value: 900 }, { name: 'Sat', value: 500 }, 
        { name: 'Sun', value: 800 }
      ]);

      const transactions = await invoke('get_recent_invoices', { limit: 10 }).catch(() => []);
      setRecentTransactions(transactions);
    } catch (error) {
      console.error("Dashboard Data Sync Error:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Flat, high-contrast StatCard replacing the pastel design
  const StatCard = ({ label, value, icon: Icon, trend, isTrendUp = true }) => (
    <div className="bg-[#111111] border border-white/10 rounded-sm p-6 flex flex-col justify-between text-white hover:border-brand-blue/50 transition-colors h-40">
      <div className="flex justify-between items-start">
        <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">{label}</span>
        <div className="text-brand-blue">
          <Icon size={20} strokeWidth={2} />
        </div>
      </div>
      <div>
        <div className="flex items-baseline gap-3">
          <h3 className="text-3xl font-black tracking-tighter">
            ₹{value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </h3>
          {trend && (
            <div className={`flex items-center gap-0.5 text-xs font-bold ${
              isTrendUp ? 'text-status-green' : 'text-status-red'
            }`}>
              {isTrendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {trend}%
            </div>
          )}
        </div>
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Since last settlement</p>
      </div>
    </div>
  );

  return (
    <div className="flex h-full w-full gap-6 select-none font-sans text-white bg-brand-black overflow-y-auto custom-scrollbar p-6">
      
      {/* LEFT COLUMN - AI Core & Workspace */}
      <div className="flex-1 flex flex-col min-w-0 gap-6">
        
        {/* VYAPAR AI CORE HEADER (Replicating Image Reference) */}
        <div className="bg-[#0a0a0a] border border-white/10 p-10 rounded-sm relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="absolute right-0 top-0 opacity-30 pointer-events-none">
            <div className="w-[600px] h-[400px] bg-brand-blue/20 blur-[100px] rounded-full absolute -top-20 -right-20"></div>
          </div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white text-black px-3 py-1 rounded-sm text-[10px] font-black tracking-widest uppercase mb-6">
              <MessageSquare size={12} /> Interactive
            </div>
            
            <div className="flex items-center gap-4 mb-4">
              <h1 className="text-5xl lg:text-6xl font-black text-white tracking-tighter uppercase border-b-4 border-brand-blue pb-1">
                Vyapar AI Core
              </h1>
              <button className="w-12 h-12 bg-brand-blue rounded-full flex items-center justify-center text-white hover:bg-blue-600 transition-colors shrink-0">
                <ArrowRight size={24} />
              </button>
            </div>
            
            <p className="text-gray-400 text-sm max-w-xl leading-relaxed">
              Interact directly with the VyaparSetu AI Assistant. Issue voice commands to generate bills, analyze market trends, and navigate complex inventory data in real-time.
            </p>
          </div>
        </div>

        {/* Metric Grid (High-Contrast Flat Cards) */}
        <div className="grid grid-cols-3 gap-6 animate-in fade-in duration-700 delay-150">
          <StatCard 
            label={t('dash_total_earning')} 
            value={metrics.totalSales} 
            icon={TrendingUp} 
            trend="12"
          />
          <StatCard 
            label={t('dash_total_spending')} 
            value={metrics.udhaarGiven} 
            icon={Banknote} 
            trend="5"
            isTrendUp={false}
          />
          <StatCard 
            label={t('dash_spending_goal')} 
            value={metrics.cashInHand} 
            icon={CreditCard} 
          />
        </div>

        {/* Analytics Pulse Section */}
        <div className="flex-1 bg-[#0a0a0a] rounded-sm p-8 flex flex-col border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold tracking-tight mb-1">{t('dash_pulse')}</h3>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Revenue Flow Momentum</p>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-white text-black rounded-sm text-xs font-black uppercase tracking-widest transition-all">Weekly</button>
              <button className="px-4 py-2 bg-transparent text-gray-500 rounded-sm text-xs font-black uppercase tracking-widest border border-transparent hover:text-white transition-all">Monthly</button>
            </div>
          </div>

          <div className="flex-1 min-h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPulse" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0056b3" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0056b3" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6c757d', fontSize: 12, fontWeight: 'bold' }} 
                  dy={15}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6c757d', fontSize: 12, fontWeight: 'bold' }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#111111', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '4px',
                    color: '#ffffff'
                  }}
                  itemStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#0056b3" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorPulse)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN - Financial Terminal & Feed */}
      <div className="w-[380px] shrink-0 bg-[#0a0a0a] rounded-sm p-8 flex flex-col border border-white/10">
        <h2 className="text-2xl font-black tracking-tight mb-8">Financial Terminal</h2>
        
        {/* High-Contrast POS Card */}
        <div className="bg-[#111111] border border-white/10 rounded-sm p-6 mb-8 relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-3 h-3 rounded-full bg-status-red animate-pulse"></div>
            <span className="font-black text-sm tracking-widest uppercase">Live Node</span>
            <span className="ml-auto text-[10px] text-brand-blue tracking-widest font-black border border-brand-blue/30 px-2 py-1 rounded-sm">POS-01</span>
          </div>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Net Sales Today</p>
          <h2 className="text-4xl font-black tracking-tighter mb-6">
            ₹{metrics.totalSales.toLocaleString('en-IN', {minimumFractionDigits: 2})}
          </h2>
          <div className="flex justify-between items-center text-gray-500 text-[10px] font-black tracking-[0.2em] border-t border-white/10 pt-4">
            <span>{new Date().toLocaleDateString()}</span>
            <span>SECURE SYNC</span>
          </div>
        </div>

        {/* Transaction Feed */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-gray-500 text-[11px] font-black uppercase tracking-[0.2em]">Live Ledger</span>
          <button onClick={fetchDashboardData} className={`text-brand-blue hover:text-white transition-all ${isRefreshing ? 'animate-spin' : ''}`}>
            <RefreshCw size={14} />
          </button>
        </div>
        
        <div className="space-y-2 overflow-y-auto custom-scrollbar flex-1 pr-2">
           {recentTransactions.length > 0 ? recentTransactions.map(tx => (
             <div key={tx.id} className="bg-[#111111] rounded-sm p-4 flex items-center justify-between border border-white/5 hover:border-brand-blue/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-sm bg-[#222222] flex items-center justify-center text-[10px] font-black text-white">
                    {tx.customer_name ? tx.customer_name[0].toUpperCase() : 'W'}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white truncate w-24 capitalize">{tx.customer_name || 'Walk-in'}</h4>
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">
                      {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                   <div className={`text-sm font-black tracking-tight ${tx.status === 'PAID' ? 'text-status-green' : 'text-status-red'}`}>
                      {tx.status === 'PAID' ? '+' : '-'} ₹{tx.total_amount.toFixed(2)}
                   </div>
                </div>
             </div>
           )) : (
             <div className="text-center py-10 text-gray-600 text-xs font-bold uppercase tracking-widest">
               No transactions yet
             </div>
           )}
        </div>
      </div>
      
    </div>
  );
}