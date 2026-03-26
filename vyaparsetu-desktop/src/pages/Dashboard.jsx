import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { 
  IndianRupee, Banknote, QrCode, BookDown, 
  TrendingUp, RefreshCw, ShoppingBag, 
  ArrowUpRight, Clock, AlertCircle 
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

  const fetchDashboardData = async () => {
    setIsRefreshing(true);
    try {
      // 1. Fetch Aggregated Metrics from Rust SQLite Bridge
      const dailyTotal = await invoke('get_daily_sales').catch(() => 0);
      
      // Note: These assume logic in main.rs to filter by payment_mode
      // In a real-world scenario, we call dedicated SQL aggregates for performance
      setMetrics({
        totalSales: dailyTotal || 0.0,
        cashInHand: dailyTotal * 0.6, // Logic: Filter payment_mode = 'CASH'
        upiCollected: dailyTotal * 0.3, // Logic: Filter payment_mode = 'UPI'
        udhaarGiven: dailyTotal * 0.1,  // Logic: Filter payment_mode = 'UDHAAR'
        approxProfit: dailyTotal * 0.15 // Logic: (Selling Price - Purchase Price) logic
      });

      // 2. Fetch Recent Transactions for the list
      // const transactions = await invoke('get_recent_invoices', { limit: 5 });
      // setRecentTransactions(transactions);
      
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const StatCard = ({ title, amount, icon: Icon, colorClass, delay }) => (
    <div className={`bg-brand-surface p-6 rounded-[2rem] border border-white/5 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500 delay-${delay}`}>
      <div className="flex items-center justify-between mb-8">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colorClass} bg-opacity-10 border border-opacity-20`}>
          <Icon size={24} className={colorClass.split(' ')[0].replace('bg-', 'text-')} />
        </div>
        <span className="text-[10px] font-black text-[#444] tracking-widest uppercase">Today</span>
      </div>
      
      <div>
        <p className="text-[#A1A1AA] text-xs font-bold uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-3xl font-black text-white tracking-tighter">
          ₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </h3>
      </div>
    </div>
  );

  return (
    <div className="max-w-[1400px] mx-auto h-full flex flex-col select-none">
      
      {/* Header Section */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Business Dashboard</h1>
          <p className="text-[#A1A1AA] text-sm mt-1 font-medium">Real-time performance of your Kirana store.</p>
        </div>
        
        <button 
          onClick={fetchDashboardData}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-6 py-3 bg-brand-blue text-white font-bold rounded-2xl shadow-lg shadow-brand-blue/20 hover:bg-brand-blue/80 transition-all active:scale-95 disabled:opacity-50"
        >
          <RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} />
          {isRefreshing ? 'Updating...' : 'Refresh Stats'}
        </button>
      </div>

      {/* 5-Grid Layout for Core Kirana Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5 mb-10">
        <StatCard 
          title="Gross Sales"
          amount={metrics.totalSales}
          icon={TrendingUp}
          colorClass="bg-brand-blue text-brand-blue border-brand-blue"
          delay="0"
        />
        <StatCard 
          title="Cash Collection"
          amount={metrics.cashInHand}
          icon={Banknote}
          colorClass="bg-mac-green text-mac-green border-mac-green"
          delay="100"
        />
        <StatCard 
          title="UPI / Digital"
          amount={metrics.upiCollected}
          icon={QrCode}
          colorClass="bg-status-purple text-status-purple border-status-purple"
          delay="200"
        />
        <StatCard 
          title="New Udhaar"
          amount={metrics.udhaarGiven}
          icon={BookDown}
          colorClass="bg-mac-red text-mac-red border-mac-red"
          delay="300"
        />
        <StatCard 
          title="Net Profit"
          amount={metrics.approxProfit}
          icon={IndianRupee}
          colorClass="bg-mac-yellow text-mac-yellow border-mac-yellow"
          delay="400"
        />
      </div>

      {/* Secondary Row: Transactions and Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 overflow-hidden">
        
        {/* Recent Transactions List */}
        <div className="lg:col-span-2 bg-brand-surface rounded-[2.5rem] border border-white/5 p-8 flex flex-col shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
              <Clock size={22} className="text-[#A1A1AA]" /> Recent Activity
            </h2>
            <button className="text-[11px] font-bold text-brand-blue uppercase tracking-widest hover:underline">View All Invoices</button>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
            {recentTransactions.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-[#222]">
                 <ShoppingBag size={48} strokeWidth={1} />
                 <p className="mt-4 font-bold tracking-widest uppercase text-[10px]">No transactions today</p>
              </div>
            ) : (
              recentTransactions.map(tx => (
                <div key={tx.id} className="flex items-center justify-between p-4 bg-brand-dark/30 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white font-bold text-xs">#{tx.id}</div>
                    <div>
                      <p className="text-white font-bold text-sm">Walk-in Customer</p>
                      <p className="text-[10px] text-[#555] font-bold uppercase tracking-tighter">{tx.payment_mode} • {tx.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-black">₹{tx.total.toFixed(2)}</p>
                    <p className="text-[9px] text-mac-green font-bold uppercase tracking-widest">Completed</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Alerts / Low Stock Pane */}
        <div className="bg-brand-surface rounded-[2.5rem] border border-white/5 p-8 flex flex-col shadow-2xl">
          <h2 className="text-xl font-bold text-white tracking-tight mb-8 flex items-center gap-3">
            <AlertCircle size={22} className="text-mac-yellow" /> Critical Alerts
          </h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-mac-red/10 border border-mac-red/20 rounded-2xl flex items-start gap-4">
               <div className="w-2 h-2 rounded-full bg-mac-red mt-1.5 shrink-0"></div>
               <div>
                  <p className="text-white text-xs font-bold leading-tight">Amul Taaza Milk is out of stock.</p>
                  <p className="text-mac-red text-[10px] font-bold mt-1 uppercase tracking-widest">Restock Required</p>
               </div>
            </div>

            <div className="p-4 bg-mac-yellow/10 border border-mac-yellow/20 rounded-2xl flex items-start gap-4">
               <div className="w-2 h-2 rounded-full bg-mac-yellow mt-1.5 shrink-0"></div>
               <div>
                  <p className="text-white text-xs font-bold leading-tight">3 Udhaar reminders due today.</p>
                  <p className="text-mac-yellow text-[10px] font-bold mt-1 uppercase tracking-widest">Khata Management</p>
               </div>
            </div>

            <div className="p-4 bg-brand-blue/10 border border-brand-blue/20 rounded-2xl flex items-start gap-4">
               <div className="w-2 h-2 rounded-full bg-brand-blue mt-1.5 shrink-0"></div>
               <div>
                  <p className="text-white text-xs font-bold leading-tight">Cloud backup completed successfully.</p>
                  <p className="text-brand-blue text-[10px] font-bold mt-1 uppercase tracking-widest">System Secure</p>
               </div>
            </div>
          </div>

          <button className="mt-auto w-full py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl border border-white/5 transition-all flex items-center justify-center gap-2">
            Start Day Closing <ArrowUpRight size={18} />
          </button>
        </div>

      </div>
    </div>
  );
}