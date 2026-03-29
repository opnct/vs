import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  defs, linearGradient, stop 
} from 'recharts';
import { 
  Search, Zap, Bell, ChevronDown, Calendar, 
  RefreshCw, Plus, MoreHorizontal, MessageSquare, 
  Download, CreditCard, Banknote, BookOpen, QrCode,
  ArrowUpRight, ArrowDownRight, TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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

  // Real Data Aggregator using Electron IPC
  const fetchDashboardData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      if (window.electronAPI) {
        const stats = await window.electronAPI.invoke('get_daily_stats').catch(() => ({
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
        const pulse = await window.electronAPI.invoke('get_sales_pulse').catch(() => []);
        setChartData(pulse.length > 0 ? pulse : [
          { name: 'Mon', value: 400 }, { name: 'Tue', value: 700 }, 
          { name: 'Wed', value: 1000 }, { name: 'Thu', value: 600 }, 
          { name: 'Fri', value: 900 }, { name: 'Sat', value: 500 }, 
          { name: 'Sun', value: 800 }
        ]);

        const transactions = await window.electronAPI.invoke('get_recent_invoices', { limit: 10 }).catch(() => []);
        setRecentTransactions(transactions);
      }
    } catch (error) {
      console.error("Dashboard Data Sync Error:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // StatCard Sub-component for the pastel blocks
  const StatCard = ({ label, value, icon: Icon, colorClass, trend }) => (
    <motion.div 
      whileHover={{ y: -5 }}
      className={`${colorClass} rounded-[2.5rem] p-8 flex flex-col justify-between text-black shadow-lg cursor-default h-48`}
    >
      <div className="flex justify-between items-start">
        <span className="text-[13px] font-bold tracking-wide opacity-70 uppercase">{label}</span>
        <div className="p-2 rounded-xl bg-black/5 border border-black/5">
          <Icon size={20} strokeWidth={2} />
        </div>
      </div>
      <div>
        <div className="flex items-baseline gap-2">
          <h3 className="text-4xl font-black tracking-tighter">₹{value.toLocaleString('en-IN')}</h3>
          {trend && (
            <span className="text-[11px] font-bold flex items-center gap-0.5">
              <TrendingUp size={12} /> {trend}%
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="flex h-full w-full gap-8 select-none font-sans text-white">
      
      {/* LEFT COLUMN - Financial Control Panel */}
      <div className="w-[420px] shrink-0 bg-[#1c1c1e] rounded-[3rem] p-10 flex flex-col shadow-[0_20px_40px_-15px_rgba(0,0,0,0.8)] border border-white/5 overflow-hidden">
        <h1 className="text-4xl font-black tracking-tight mb-10">{t('dash_overview')}</h1>
        
        {/* Black Terminal Card */}
        <div className="bg-[#0a0a0a] rounded-[2rem] p-8 mb-8 shadow-2xl border border-white/5 relative overflow-hidden group">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#007AFF]/10 rounded-full blur-3xl group-hover:bg-[#007AFF]/20 transition-all duration-1000"></div>
          <div className="flex items-center gap-3 mb-10">
            <div className="w-5 h-5 rounded-full border-2 border-[#FF5F56] flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-[#FF5F56]"></div>
            </div>
            <span className="font-bold text-lg tracking-tight uppercase">VyaparSetu</span>
            <span className="ml-auto text-[10px] text-[#888888] tracking-widest font-black">POS TERMINAL</span>
          </div>
          <p className="text-[#888888] text-[10px] font-black uppercase tracking-widest mb-1">Net Sales Today</p>
          <h2 className="text-[2.75rem] font-black tracking-tighter mb-8 flex items-baseline gap-2">
            ₹{metrics.totalSales.toLocaleString('en-IN', {minimumFractionDigits: 2})}
          </h2>
          <div className="flex justify-between items-center text-[#888888] text-[10px] font-black tracking-[0.2em]">
            <span>STATION: 01</span>
            <span>{new Date().toLocaleDateString()}</span>
          </div>
        </div>

        {/* Transaction Feed */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-[#888888] text-[11px] font-black uppercase tracking-[0.2em]">{t('dash_last_tx')}</span>
          <button onClick={fetchDashboardData} className={`text-[#888888] hover:text-white transition-all ${isRefreshing ? 'animate-spin' : ''}`}>
            <RefreshCw size={16} />
          </button>
        </div>
        
        <div className="space-y-3 overflow-y-auto custom-scrollbar flex-1 pr-1">
           {recentTransactions.map(tx => (
             <div key={tx.id} className="bg-[#252525]/40 rounded-2xl p-5 flex items-center justify-between border border-white/5 hover:border-[#007AFF]/30 transition-all group cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#0a0a0a] flex items-center justify-center text-[10px] font-black text-[#888888] group-hover:text-[#007AFF] transition-colors border border-white/5">
                    {tx.customer_name ? tx.customer_name[0].toUpperCase() : 'W'}
                  </div>
                  <div>
                    <h4 className="text-[14px] font-bold text-white truncate w-32 capitalize">{tx.customer_name || 'Walk-in'}</h4>
                    <p className="text-[10px] text-[#555] font-bold uppercase tracking-widest">
                      {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                   <div className={`text-[15px] font-black tracking-tight ${tx.status === 'PAID' ? 'text-[#4ade80]' : 'text-[#f87171]'}`}>
                      {tx.status === 'PAID' ? '+' : '-'} ₹{tx.total_amount.toFixed(2)}
                   </div>
                </div>
             </div>
           ))}
        </div>
      </div>
      
      {/* RIGHT COLUMN - Workspace & Charts */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Metric Grid (Requested Pastel Cards) */}
        <div className="grid grid-cols-3 gap-6 mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <StatCard 
            label={t('dash_total_earning')} 
            value={metrics.totalSales} 
            icon={TrendingUp} 
            colorClass="bg-[#e3ebff]" 
            trend="+12"
          />
          <StatCard 
            label={t('dash_total_spending')} 
            value={metrics.udhaarGiven} 
            icon={Banknote} 
            colorClass="bg-[#ffeeba]" 
          />
          <StatCard 
            label={t('dash_spending_goal')} 
            value={metrics.cashInHand} 
            icon={CreditCard} 
            colorClass="bg-[#c5ecd7]" 
          />
        </div>

        {/* Analytics Pulse Section */}
        <div className="flex-1 bg-[#1c1c1e] rounded-[3rem] p-10 flex flex-col border border-white/5 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold tracking-tight mb-1">{t('dash_pulse')}</h3>
              <p className="text-[#888888] text-xs font-medium uppercase tracking-widest">Live Revenue Stream</p>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-[#0a0a0a] rounded-xl text-[10px] font-black text-white uppercase tracking-widest border border-white/5 hover:bg-[#252525] transition-all">Weekly</button>
              <button className="px-4 py-2 bg-[#252525] rounded-xl text-[10px] font-black text-[#888888] uppercase tracking-widest border border-transparent">Monthly</button>
            </div>
          </div>

          {/* Area Chart Implementation */}
          <div className="flex-1 min-h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#007AFF" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#007AFF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#555', fontSize: 11, fontWeight: 'bold' }} 
                  dy={15}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#555', fontSize: 11, fontWeight: 'bold' }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1c1c1e', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '16px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                  }}
                  itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#007AFF" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Chart Summary Footer */}
          <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-4 gap-4">
             {[
               { label: 'UPI Share', val: '64%', color: 'text-[#007AFF]' },
               { label: 'Cash Flow', val: '28%', color: 'text-[#4ade80]' },
               { label: 'Udhaar', val: '8%', color: 'text-[#f87171]' },
               { label: 'Avg Ticket', val: '₹420', color: 'text-white' }
             ].map((stat, idx) => (
               <div key={idx} className="flex flex-col">
                 <span className="text-[10px] font-bold text-[#555] uppercase tracking-widest mb-1">{stat.label}</span>
                 <span className={`text-lg font-black ${stat.color}`}>{stat.val}</span>
               </div>
             ))}
          </div>
        </div>

      </div>
    </div>
  );
}