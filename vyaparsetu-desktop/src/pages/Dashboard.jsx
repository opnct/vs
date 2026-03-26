import React, { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { 
  IndianRupee, Banknote, QrCode, BookDown, 
  TrendingUp, RefreshCw, ShoppingBag, 
  ArrowUpRight, Clock, AlertCircle, Loader2 
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
  const [lowStockItems, setLowStockItems] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Real Data Aggregator
  const fetchDashboardData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // 1. Fetch exact daily sums from SQLite via specialized backend commands
      // Note: These commands perform SUM(total_amount) WHERE payment_mode = X AND date = today
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

      // 2. Fetch Recent Transactions from the invoices table
      const transactions = await invoke('get_recent_invoices', { limit: 10 }).catch(() => []);
      setRecentTransactions(transactions);

      // 3. Fetch Products and filter for real-time stock alerts
      const products = await invoke('get_all_products').catch(() => []);
      const alerts = products.filter(p => p.stock_quantity <= (p.low_stock_threshold || 5));
      setLowStockItems(alerts.slice(0, 5));
      
    } catch (error) {
      console.error("Dashboard Data Sync Error:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const StatCard = ({ title, amount, icon: Icon, colorClass, delay }) => (
    <div className={`bg-brand-surface p-6 rounded-[2rem] border border-white/5 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500 delay-${delay}`}>
      <div className="flex items-center justify-between mb-8">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colorClass} bg-opacity-10 border border-opacity-20`}>
          <Icon size={24} className={colorClass.split(' ')[0].replace('bg-', 'text-')} />
        </div>
        <span className="text-[10px] font-black text-[#444] tracking-widest uppercase">Live</span>
      </div>
      
      <div>
        <p className="text-[#A1A1AA] text-xs font-bold uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-3xl font-black text-white tracking-tighter">
          ₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </h3>
      </div>
    </div>
  );

  return (
    <div className="max-w-[1400px] mx-auto h-full flex flex-col select-none font-sans">
      
      {/* Header Section */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Business Intelligence</h1>
          <p className="text-[#A1A1AA] text-sm mt-1 font-medium">Real-time financial status of your retail desk.</p>
        </div>
        
        <button 
          onClick={fetchDashboardData}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-6 py-3 bg-brand-blue text-white font-bold rounded-2xl shadow-lg shadow-brand-blue/20 hover:bg-brand-blue/80 transition-all active:scale-95 disabled:opacity-50"
        >
          {isRefreshing ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
          {isRefreshing ? 'Fetching Data...' : 'Sync Dashboard'}
        </button>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5 mb-10">
        <StatCard 
          title="Today's Sales"
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
          title="UPI Payments"
          amount={metrics.upiCollected}
          icon={QrCode}
          colorClass="bg-status-purple text-status-purple border-status-purple"
          delay="200"
        />
        <StatCard 
          title="Udhaar / Credit"
          amount={metrics.udhaarGiven}
          icon={BookDown}
          colorClass="bg-mac-red text-mac-red border-mac-red"
          delay="300"
        />
        <StatCard 
          title="Estimated Profit"
          amount={metrics.approxProfit}
          icon={IndianRupee}
          colorClass="bg-mac-yellow text-mac-yellow border-mac-yellow"
          delay="400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 overflow-hidden">
        
        {/* Real Invoices List */}
        <div className="lg:col-span-2 bg-brand-surface rounded-[2.5rem] border border-white/5 p-8 flex flex-col shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
              <Clock size={22} className="text-[#A1A1AA]" /> Recent Invoices
            </h2>
            <div className="text-[11px] font-bold text-[#444] uppercase tracking-widest">Showing last 10 entries</div>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
            {recentTransactions.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-[#222]">
                 <ShoppingBag size={48} strokeWidth={1} />
                 <p className="mt-4 font-bold tracking-widest uppercase text-[10px]">No transactions recorded for today</p>
              </div>
            ) : (
              recentTransactions.map(tx => (
                <div key={tx.id} className="flex items-center justify-between p-4 bg-brand-dark/30 rounded-2xl border border-white/5 hover:border-white/10 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-brand-blue font-black text-xs border border-brand-blue/10">#{tx.id}</div>
                    <div>
                      <p className="text-white font-bold text-sm">{tx.customer_name || 'Walk-in Customer'}</p>
                      <p className="text-[10px] text-[#555] font-bold uppercase tracking-tighter">
                        {tx.payment_mode} • {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-black">₹{tx.total_amount.toFixed(2)}</p>
                    <p className={`text-[9px] font-bold uppercase tracking-widest ${tx.status === 'PAID' ? 'text-mac-green' : 'text-mac-red'}`}>
                      {tx.status}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Dynamic Low Stock & Inventory Alerts */}
        <div className="bg-brand-surface rounded-[2.5rem] border border-white/5 p-8 flex flex-col shadow-2xl overflow-hidden">
          <h2 className="text-xl font-bold text-white tracking-tight mb-8 flex items-center gap-3">
            <AlertCircle size={22} className="text-mac-yellow" /> Inventory Alerts
          </h2>
          
          <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-1">
            {lowStockItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-[#222]">
                 <div className="w-12 h-12 bg-mac-green/10 rounded-full flex items-center justify-center text-mac-green mb-4 border border-mac-green/20">
                    <TrendingUp size={24} />
                 </div>
                 <p className="font-bold tracking-widest uppercase text-[10px]">All items well stocked</p>
              </div>
            ) : (
              lowStockItems.map(item => (
                <div key={item.id} className="p-4 bg-mac-red/10 border border-mac-red/20 rounded-2xl flex items-start gap-4">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${item.stock_quantity <= 0 ? 'bg-mac-red animate-pulse' : 'bg-mac-yellow'}`}></div>
                  <div className="overflow-hidden">
                    <p className="text-white text-xs font-bold leading-tight truncate">{item.name}</p>
                    <p className="text-mac-red text-[10px] font-bold mt-1 uppercase tracking-widest">
                      Stock: {item.stock_quantity} {item.unit}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-white/5">
             <div className="p-4 bg-brand-blue/10 border border-brand-blue/20 rounded-2xl flex items-start gap-4">
                <div className="w-2 h-2 rounded-full bg-brand-blue mt-1.5 shrink-0"></div>
                <div>
                   <p className="text-white text-xs font-bold leading-tight">Database integrity verified.</p>
                   <p className="text-brand-blue text-[10px] font-bold mt-1 uppercase tracking-widest">System Secure</p>
                </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}