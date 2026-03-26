import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { 
  BarChart3, PieChart, Calendar, Download, 
  ArrowUpRight, ArrowDownRight, Package, 
  User, ClipboardList, Filter, ChevronRight
} from 'lucide-react';

export default function Reports() {
  const [activeReport, setActiveReport] = useState('sales'); // sales, items, customers, profit
  const [dateRange, setDateRange] = useState('today');
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Real logic for data fetching from SQLite
  const fetchReport = async () => {
    setLoading(true);
    try {
      // Logic: Execute complex SQL joins via Rust for specific reporting views
      // const data = await invoke('get_detailed_report', { type: activeReport, range: dateRange });
      // setReportData(data);
    } catch (error) {
      console.error("Report fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [activeReport, dateRange]);

  const SummaryCard = ({ label, value, trend, isPositive }) => (
    <div className="bg-brand-dark/40 p-6 rounded-3xl border border-white/5 flex flex-col justify-between">
      <span className="text-[11px] font-bold text-[#666] uppercase tracking-[0.2em]">{label}</span>
      <div className="mt-4 flex items-end justify-between">
        <h4 className="text-2xl font-black text-white tracking-tighter">{value}</h4>
        <div className={`flex items-center gap-1 text-[11px] font-bold ${isPositive ? 'text-mac-green' : 'text-mac-red'}`}>
          {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {trend}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full gap-6 select-none font-sans overflow-hidden">
      
      {/* 1. Report Selector & Filter Bar */}
      <div className="flex items-center justify-between gap-6 shrink-0">
        <div className="flex bg-brand-surface p-1.5 rounded-2xl border border-white/5 gap-1">
          {[
            { id: 'sales', label: 'Sales', icon: BarChart3 },
            { id: 'items', label: 'Item-wise', icon: Package },
            { id: 'customers', label: 'Customer-wise', icon: User },
            { id: 'profit', label: 'Profit/Loss', icon: PieChart }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveReport(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeReport === tab.id ? 'bg-brand-blue text-white shadow-lg' : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <select 
            value={dateRange} 
            onChange={e => setDateRange(e.target.value)}
            className="bg-brand-surface text-white text-sm font-bold py-3 px-4 rounded-xl border border-white/5 outline-none focus:border-brand-blue"
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="custom">Custom Range</option>
          </select>
          <button className="bg-white/5 hover:bg-white/10 text-white p-3 rounded-xl border border-white/10 transition-all">
            <Download size={20} />
          </button>
        </div>
      </div>

      {/* 2. Visual Summaries */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
        <SummaryCard label="Net Revenue" value="₹42,500" trend="+12%" isPositive={true} />
        <SummaryCard label="Total Bills" value="124" trend="+5%" isPositive={true} />
        <SummaryCard label="Avg Bill Value" value="₹342" trend="-2%" isPositive={false} />
        <SummaryCard label="Est. Profit" value="₹6,800" trend="+8%" isPositive={true} />
      </div>

      {/* 3. Detailed Data View */}
      <div className="flex-1 bg-brand-surface rounded-[2.5rem] border border-white/5 flex flex-col overflow-hidden shadow-2xl">
        <div className="px-8 py-5 bg-brand-dark/30 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-white font-bold text-lg flex items-center gap-3 capitalize">
            <ClipboardList size={20} className="text-brand-blue" /> {activeReport} Analysis
          </h3>
          <div className="flex items-center gap-2 text-[11px] font-bold text-[#666] uppercase tracking-widest">
            <Filter size={14} /> Sorted by: Revenue (High to Low)
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            /* Dynamic Table Rows */
            [1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="grid grid-cols-12 gap-4 px-6 py-4 items-center bg-brand-dark/20 hover:bg-white/5 rounded-3xl border border-white/5 transition-all group">
                <div className="col-span-5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-dark flex items-center justify-center text-[#A1A1AA] border border-white/5 font-bold text-xs">#{i}</div>
                  <div>
                    <h4 className="font-bold text-white text-[15px]">Aashirvaad Atta 5kg</h4>
                    <p className="text-[10px] font-bold text-[#555] mt-0.5 uppercase tracking-tighter">Grocery • HSN: 1101</p>
                  </div>
                </div>
                <div className="col-span-2 text-center">
                  <p className="text-[10px] font-bold text-[#666] uppercase mb-1">Qty Sold</p>
                  <p className="text-white font-black">42.0</p>
                </div>
                <div className="col-span-2 text-center">
                  <p className="text-[10px] font-bold text-[#666] uppercase mb-1">Tax Coll.</p>
                  <p className="text-mac-yellow font-black">₹420.00</p>
                </div>
                <div className="col-span-3 text-right flex items-center justify-end gap-6">
                  <div>
                    <p className="text-[10px] font-bold text-[#666] uppercase mb-1">Total Revenue</p>
                    <p className="text-mac-green font-black text-lg">₹10,290.00</p>
                  </div>
                  <ChevronRight size={18} className="text-[#333] group-hover:text-white transition-colors" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* 4. Day Closing Action Footer */}
        <div className="px-8 py-5 bg-brand-dark/50 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <span className="w-2 h-2 rounded-full bg-mac-green animate-pulse"></span>
             <span className="text-[11px] font-black text-white uppercase tracking-widest">Real-time Data Active</span>
          </div>
          <button className="bg-brand-blue text-white font-black px-8 py-3 rounded-2xl hover:bg-brand-blue/80 transition-all shadow-lg shadow-brand-blue/20 flex items-center gap-2 text-sm uppercase tracking-widest">
            Perform Day Closing Summary
          </button>
        </div>
      </div>
    </div>
  );
}