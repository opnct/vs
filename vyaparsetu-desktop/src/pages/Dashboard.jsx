import React, { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { 
  Search, Zap, Bell, ChevronDown, Calendar, 
  RefreshCw, Plus, MoreHorizontal, MessageSquare, 
  Download, CreditCard, Banknote, BookOpen, QrCode
} from 'lucide-react';

export default function Dashboard() {
  const [metrics, setMetrics] = useState({
    totalSales: 0.0,
    cashInHand: 0.0,
    upiCollected: 0.0,
    udhaarGiven: 0.0,
    approxProfit: 0.0
  });
  
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Real Data Aggregator
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

  return (
    <div className="flex h-full w-full gap-6 select-none font-sans text-brand-text">
      
      {/* LEFT COLUMN - Overview Panel */}
      <div className="w-[420px] shrink-0 bg-brand-surface rounded-6xl p-8 flex flex-col shadow-soft-3d border border-white/5 overflow-hidden">
        <h1 className="text-4xl font-medium tracking-tight mb-10">Overview</h1>
        
        {/* Card Management Section */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-[#888888] text-sm font-medium">Card management</span>
          <button className="text-[#888888] hover:text-white transition-colors w-6 h-6 rounded-full border border-[#888888] flex items-center justify-center">
            <Plus size={14} />
          </button>
        </div>
        
        {/* Black Card Replica */}
        <div className="bg-[#0a0a0a] rounded-3xl p-7 mb-4 shadow-2xl border border-white/5 relative overflow-hidden group">
           <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all duration-700"></div>
           <div className="flex items-center gap-3 mb-10">
              <div className="w-5 h-5 rounded-full border-2 border-mac-red flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-mac-red"></div>
              </div>
              <span className="font-bold text-lg tracking-tight">VyaparSetu</span>
              <span className="ml-auto text-xs text-[#888888] tracking-widest font-medium">**** 8458</span>
           </div>
           <h2 className="text-[2.5rem] font-medium tracking-tighter mb-8 flex items-baseline gap-1">
             {metrics.totalSales.toLocaleString('en-IN', {minimumFractionDigits: 2})} <span className="text-xl text-[#888888]">₹</span>
           </h2>
           <div className="text-[#888888] text-xs font-medium tracking-widest">17 / 24</div>
        </div>
        
        {/* Pill Toggles */}
        <div className="flex gap-2 mb-10">
           <button className="px-5 py-2 rounded-xl bg-white text-black text-xs font-bold tracking-wide">ALL</button>
           <button className="px-5 py-2 rounded-xl bg-white/5 text-white border border-white/10 text-xs font-medium hover:bg-white/10 transition-all tracking-wide">UPI</button>
           <button className="px-5 py-2 rounded-xl bg-white/5 text-white border border-white/10 text-xs font-medium hover:bg-white/10 transition-all tracking-wide">CASH</button>
        </div>
        
        {/* Last Transactions Section */}
        <div className="flex items-center justify-between mb-5">
          <span className="text-[#888888] text-sm font-medium">Last transactions</span>
          <button className="text-[#888888] hover:text-white transition-colors"><Search size={18} /></button>
        </div>
        
        <div className="grid grid-cols-2 gap-3 overflow-y-auto custom-scrollbar flex-1 pb-4 pr-1">
           {recentTransactions.map(tx => (
             <div key={tx.id} className="bg-[#252525] rounded-3xl p-5 flex flex-col justify-between border border-white/5 hover:border-white/10 transition-all">
                <div className="flex items-center justify-between mb-4">
                   <span className="text-[13px] font-bold text-white truncate w-20 capitalize">
                     {tx.customer_name || 'Walk-in'}
                   </span>
                   <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-[10px] uppercase font-bold text-[#A1A1AA]">
                     {tx.customer_name ? tx.customer_name[0] : 'W'}
                   </div>
                </div>
                <div>
                   <div className={`text-[15px] font-bold mb-1 tracking-tight ${tx.status === 'PAID' ? 'text-status-green' : 'text-status-red'}`}>
                      {tx.status === 'PAID' ? '+' : '-'} ₹{tx.total_amount.toFixed(2)}
                   </div>
                   <div className="text-[11px] text-[#888888] font-medium uppercase tracking-wider">
                     {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                   </div>
                </div>
             </div>
           ))}
           <button className="bg-[#252525] rounded-3xl p-5 flex flex-col items-center justify-center border border-white/5 hover:bg-[#2a2a2a] transition-all text-[#888888] hover:text-white group">
             <MoreHorizontal size={24} className="mb-2 group-hover:scale-110 transition-transform" />
             <span className="text-xs font-medium">View more</span>
           </button>
        </div>
      </div>
      
      {/* RIGHT COLUMN - Main Workspace */}
      <div className="flex-1 flex flex-col min-w-[750px] bg-brand-black pr-2">
         
         {/* Top Navigation Bar */}
         <div className="flex items-center justify-between mb-10 pl-2">
            <div className="flex items-center gap-4 text-[#888888] hover:text-white focus-within:text-white transition-all w-72">
               <Search size={22} />
               <input type="text" placeholder="Search" className="bg-transparent border-none outline-none text-base font-medium w-full placeholder:text-[#555]" />
            </div>
            <div className="flex items-center gap-7">
               <button className="text-[#888888] hover:text-white transition-all"><Zap size={22} /></button>
               <button className="text-[#888888] hover:text-white transition-all relative">
                  <Bell size={22} />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-mac-red rounded-full border-2 border-brand-black"></span>
               </button>
               <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-blue to-status-purple p-[2px] cursor-pointer">
                 <div className="w-full h-full bg-brand-surface rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold tracking-widest">VS</span>
                 </div>
               </div>
            </div>
         </div>
         
         {/* Upper Analytics Area */}
         <div className="flex gap-8 mb-8">
            
            {/* Chart Section */}
            <div className="flex-1 flex flex-col pl-2">
               <div className="flex items-center justify-between mb-6 text-[#888888]">
                  <span className="text-[15px] font-medium">Current Week Pulse</span>
                  <Calendar size={20} />
               </div>
               <h2 className="text-[3.5rem] font-medium tracking-tighter mb-8 text-white flex items-baseline gap-2">
                 {metrics.totalSales.toLocaleString('en-IN', {minimumFractionDigits: 2})} <span className="text-2xl text-[#888888]">₹</span>
               </h2>
               
               <div className="h-44 flex items-end gap-3 w-full border-b border-white/5 pb-6 relative mt-auto">
                  <div className="absolute right-0 top-0 h-full flex flex-col justify-between items-end text-[11px] text-[#555] font-medium pr-2 border-r border-white/5">
                     <span>Peak</span>
                     <span>Avg</span>
                     <span>0</span>
                  </div>
                  {/* Visual Bar representation mapping over dummy ratios to fit the visual aesthetic */}
                  {[0.4, 0.7, 1.0, 0.6, 0.9, 0.5, 0.8].map((val, i) => (
                    <div key={i} className="flex-1 flex flex-col justify-end gap-1 relative group h-full mr-12">
                       <div className="w-full bg-[#1A1A1A] rounded-md absolute bottom-0 z-0 h-full"></div>
                       <div className={`w-full rounded-md relative z-10 transition-all duration-1000 ${i % 2 === 0 ? 'bg-status-green' : 'bg-status-orange'}`} style={{ height: `${val * 100}%` }}></div>
                       <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[11px] text-[#555] font-medium uppercase tracking-widest">{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i]}</span>
                    </div>
                  ))}
               </div>
            </div>
            
            {/* Control Panel Block */}
            <div className="w-[340px] bg-brand-surface border border-white/5 rounded-4xl p-7 flex flex-col justify-between shadow-soft-3d">
               <div className="flex gap-8 mb-8 border-b border-white/5 pb-2">
                  <button className="text-white font-medium text-[17px] relative after:content-[''] after:absolute after:-bottom-2.5 after:left-0 after:w-full after:h-0.5 after:bg-white pb-1">Deposit</button>
                  <button className="text-[#888888] font-medium text-[17px] hover:text-white transition-all pb-1">Exchange</button>
               </div>
               <div className="flex gap-3 mb-5">
                  <button className="flex-1 bg-brand-dark border border-white/5 rounded-2xl p-4 flex items-center justify-between text-[15px] hover:border-white/20 transition-all">
                    <span className="text-[#A1A1AA] font-medium">₹ INR</span>
                    <ChevronDown size={16} className="text-[#888888]" />
                  </button>
                  <button className="flex-1 bg-brand-dark border border-white/5 rounded-2xl p-4 flex items-center justify-between text-[15px] hover:border-white/20 transition-all">
                    <span className="text-[#A1A1AA] font-medium">****8458</span>
                    <ChevronDown size={16} className="text-[#888888]" />
                  </button>
               </div>
               <div className="bg-brand-dark border border-white/5 rounded-2xl p-5 flex items-center justify-between mb-3 focus-within:border-white/20 transition-all">
                  <input type="text" className="bg-transparent border-none outline-none text-white font-medium text-lg w-full" defaultValue="550.00" />
                  <span className="text-[#555] text-[13px] font-medium uppercase tracking-widest">Amount</span>
               </div>
               <div className="flex justify-between text-[11px] text-[#555] font-medium mb-8 uppercase tracking-widest">
                  <span>min 100.00 INR</span>
                  <span>max 50,000.00 INR</span>
               </div>
               <button className="w-full bg-white text-black font-bold text-[15px] py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors active:scale-95 shadow-xl">
                  <RefreshCw size={18} /> Review Transfer
               </button>
            </div>
         </div>
         
         {/* Pastel Statistics Grid */}
         <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-pastel-blue rounded-[2rem] p-7 flex flex-col justify-between text-black transition-transform hover:-translate-y-1 shadow-lg cursor-default">
               <div className="flex justify-between items-start mb-6">
                  <span className="text-[13px] font-semibold tracking-wide text-black/70">Total earning</span>
                  <div className="p-1 rounded-lg border border-black/10"><CreditCard size={18} strokeWidth={1.5} /></div>
               </div>
               <h3 className="text-4xl font-medium tracking-tighter">
                 {metrics.totalSales.toLocaleString('en-IN', {minimumFractionDigits: 2})}
               </h3>
            </div>
            
            <div className="bg-pastel-yellow rounded-[2rem] p-7 flex flex-col justify-between text-black transition-transform hover:-translate-y-1 shadow-lg cursor-default">
               <div className="flex justify-between items-start mb-6">
                  <span className="text-[13px] font-semibold tracking-wide text-black/70">Total spendings</span>
                  <div className="p-1 rounded-lg border border-black/10"><Banknote size={18} strokeWidth={1.5} /></div>
               </div>
               <h3 className="text-4xl font-medium tracking-tighter">
                 {metrics.udhaarGiven.toLocaleString('en-IN', {minimumFractionDigits: 2})}
               </h3>
            </div>
            
            <div className="bg-pastel-green rounded-[2rem] p-7 flex flex-col justify-between text-black transition-transform hover:-translate-y-1 shadow-lg cursor-default">
               <div className="flex justify-between items-start mb-6">
                  <span className="text-[13px] font-semibold tracking-wide text-black/70">Spending goal</span>
                  <div className="p-1 rounded-lg border border-black/10"><BookOpen size={18} strokeWidth={1.5} /></div>
               </div>
               <h3 className="text-4xl font-medium tracking-tighter">
                 {metrics.cashInHand.toLocaleString('en-IN', {minimumFractionDigits: 2})}
               </h3>
            </div>
         </div>
         
         {/* Bottom Info Blocks */}
         <div className="grid grid-cols-2 gap-6 flex-1 pb-4">
            <div className="bg-brand-surface rounded-[2rem] p-8 flex flex-col justify-between shadow-soft-3d border border-white/5 group hover:border-white/10 transition-colors cursor-pointer">
               <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <MessageSquare size={20} className="text-[#888888] group-hover:text-white transition-colors" />
                    <span className="text-white font-medium text-lg tracking-tight">Support</span>
                  </div>
                  <div className="flex items-center gap-3 text-[#555]">
                     <MessageSquare size={18} className="hover:text-white transition-colors" />
                     <RefreshCw size={18} className="hover:text-white transition-colors" />
                  </div>
               </div>
               <div>
                  <p className="text-[15px] text-[#888888] font-medium mb-1">Contact our Customer Care team</p>
                  <p className="text-[15px] text-white font-medium">vyaparsetu.help.com</p>
               </div>
            </div>
            
            <div className="bg-brand-dark rounded-[2rem] p-8 flex flex-col justify-between border border-white/5 shadow-soft-float group hover:border-white/10 transition-colors cursor-pointer">
               <div className="flex items-center gap-3 mb-4">
                 <Download size={20} className="text-[#888888] group-hover:text-white transition-colors" />
                 <span className="text-white font-medium text-lg tracking-tight">Time to get paid</span>
               </div>
               <div>
                  <p className="text-[15px] text-[#888888] font-medium leading-relaxed mb-3">
                    Request payments from clients all over the world and get paid for your services
                  </p>
                  <button className="text-[15px] text-white font-medium hover:underline">Request a payment</button>
               </div>
            </div>
         </div>
         
      </div>
    </div>
  );
}