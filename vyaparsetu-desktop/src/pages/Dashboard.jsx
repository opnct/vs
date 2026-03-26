import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { IndianRupee, Banknote, QrCode, BookDown, TrendingUp, RefreshCw } from 'lucide-react';

export default function Dashboard() {
  const [salesData, setSalesData] = useState({
    totalSales: 0.0,
    cashInHand: 0.0, // Ready for future specific Rust queries
    upiCollected: 0.0,
    udhaarGiven: 0.0
  });
  
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Real logic: Fetching actual data from the Rust SQLite backend
  const fetchDashboardData = async () => {
    setIsRefreshing(true);
    try {
      // Calling the real Rust command we built in main.rs
      const dailyTotal = await invoke('get_daily_sales');
      
      setSalesData(prev => ({
        ...prev,
        totalSales: dailyTotal || 0.0,
        // In a full production scenario, we would add separate Rust commands 
        // to filter by payment_mode='CASH' and payment_mode='UPI'
      }));
    } catch (error) {
      console.error("Failed to fetch SQLite data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Fetch data immediately when the dashboard loads
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Soft UI Card Component matching the reference image aesthetic
  const StatCard = ({ title, amount, subtitle, icon: Icon, bgColor, textColor }) => (
    <div className={`${bgColor} rounded-4xl p-8 flex flex-col justify-between shadow-soft-float transition-transform duration-300 hover:-translate-y-1 relative overflow-hidden group`}>
      {/* Decorative background glow */}
      <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/20 rounded-full blur-2xl group-hover:bg-white/30 transition-all"></div>
      
      <div className="w-14 h-14 bg-white/40 rounded-2xl flex items-center justify-center backdrop-blur-sm mb-12 shadow-sm border border-white/50">
        <Icon size={28} className={textColor} strokeWidth={2.5} />
      </div>
      
      <div>
        <h3 className={`text-4xl font-black ${textColor} tracking-tighter mb-1`}>
          ₹ {amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </h3>
        <p className={`text-lg font-bold ${textColor} tracking-tight opacity-90`}>
          {title}
        </p>
        <p className={`text-xs font-medium ${textColor} opacity-60 mt-1 tracking-wide`}>
          {subtitle}
        </p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col">
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-brand-text tracking-tight">Business Overview</h1>
          <p className="text-brand-muted font-medium mt-1">Live metrics from your offline local database.</p>
        </div>
        
        <button 
          onClick={fetchDashboardData}
          className="flex items-center gap-2 px-5 py-2.5 bg-white text-brand-text font-bold rounded-2xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors active:scale-95"
        >
          <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
          {isRefreshing ? 'Syncing...' : 'Refresh Data'}
        </button>
      </div>

      {/* 4-Grid Layout for Core Kirana Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <StatCard 
          title="Today's Sales"
          amount={salesData.totalSales}
          subtitle="Total revenue generated today"
          icon={TrendingUp}
          bgColor="bg-pastel-pink"
          textColor="text-rose-900"
        />

        <StatCard 
          title="Cash in Hand"
          amount={salesData.cashInHand}
          subtitle="Physical cash collected"
          icon={Banknote}
          bgColor="bg-pastel-peach"
          textColor="text-orange-900"
        />

        <StatCard 
          title="UPI Collected"
          amount={salesData.upiCollected}
          subtitle="PhonePe, GPay, Paytm"
          icon={QrCode}
          bgColor="bg-pastel-blue"
          textColor="text-indigo-900"
        />

        <StatCard 
          title="Udhaar Given"
          amount={salesData.udhaarGiven}
          subtitle="Credit sales today"
          icon={BookDown}
          bgColor="bg-pastel-purple"
          textColor="text-purple-900"
        />

      </div>

      {/* Recent Activity Section (Placeholder for visual completeness) */}
      <div className="mt-10 bg-white rounded-4xl p-8 shadow-soft-float border border-gray-50 flex-1">
        <h2 className="text-xl font-bold text-brand-text tracking-tight mb-6 flex items-center gap-2">
          <IndianRupee size={20} className="text-brand-muted" /> Recent Transactions
        </h2>
        
        <div className="flex flex-col items-center justify-center h-48 text-brand-muted bg-brand-bg/50 rounded-3xl border border-dashed border-gray-200">
          <p className="font-medium tracking-wide">No transactions recorded yet today.</p>
          <p className="text-xs mt-1 opacity-70">Go to POS Billing to create your first invoice.</p>
        </div>
      </div>

    </div>
  );
}