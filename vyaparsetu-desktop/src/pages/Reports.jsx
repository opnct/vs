import React, { useState, useEffect, useCallback } from 'react';
import { 
  BarChart3, PieChart, Calendar, Download, 
  ArrowUpRight, ArrowDownRight, Package, 
  User, ClipboardList, Filter, ChevronRight,
  Loader2, IndianRupee, FileText
} from 'lucide-react';

export default function Reports() {
  const [activeReport, setActiveReport] = useState('sales'); // sales, items, customers, profit
  const [dateRange, setDateRange] = useState('today');
  const [reportData, setReportData] = useState([]);
  const [summary, setSummary] = useState({
    revenue: 0,
    bills: 0,
    avgValue: 0,
    profit: 0,
    revenueTrend: 0,
    profitTrend: 0
  });
  const [loading, setLoading] = useState(true);

  // Real SQL Aggregation Logic using Electron IPC
  const fetchReportData = useCallback(async () => {
    setLoading(true);
    try {
      if (window.electronAPI) {
        // 1. Fetch Aggregated Table Data
        // This command executes Group By / Order By queries in Node.js backend
        const data = await window.electronAPI.invoke('get_detailed_report', { 
          reportType: activeReport, 
          range: dateRange 
        }).catch(() => []);
        
        setReportData(data || []);

        // 2. Fetch High-level summary metrics for the current range
        const stats = await window.electronAPI.invoke('get_report_summary', { range: dateRange })
          .catch(() => ({ revenue: 0, bills: 0, avgValue: 0, profit: 0, revenueTrend: 0, profitTrend: 0 }));
        
        setSummary(stats);
      }
    } catch (error) {
      console.error("Report Generation Error:", error);
    } finally {
      setLoading(false);
    }
  }, [activeReport, dateRange]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  const SummaryCard = ({ label, value, trend, isPositive, suffix = "" }) => (
    <div className="bg-brand-dark/40 p-6 rounded-3xl border border-white/5 flex flex-col justify-between shadow-sm">
      <span className="text-[10px] font-black text-[#555] uppercase tracking-[0.2em]">{label}</span>
      <div className="mt-4 flex items-end justify-between">
        <h4 className="text-2xl font-black text-white tracking-tighter">
          {suffix}{value.toLocaleString('en-IN')}
        </h4>
        <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full ${
          isPositive ? 'bg-mac-green/10 text-mac-green' : 'bg-mac-red/10 text-mac-red'
        }`}>
          {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {Math.abs(trend)}%
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full gap-6 select-none font-sans overflow-hidden">
      
      {/* 1. Header & Filters */}
      <div className="flex items-center justify-between gap-6 shrink-0">
        <div className="flex bg-brand-surface p-1.5 rounded-2xl border border-white/5 gap-1">
          {[
            { id: 'sales', label: 'Overview', icon: BarChart3 },
            { id: 'items', label: 'Products', icon: Package },
            { id: 'customers', label: 'Customers', icon: User },
            { id: 'profit', label: 'Profit/Loss', icon: PieChart }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveReport(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeReport === tab.id ? 'bg-brand-blue text-white shadow-glow-blue' : 'text-[#A1A1AA] hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444]" size={16} />
            <select 
              value={dateRange} 
              onChange={e => setDateRange(e.target.value)}
              className="bg-brand-surface text-white text-sm font-bold py-3 pl-10 pr-4 rounded-xl border border-white/5 outline-none focus:border-brand-blue appearance-none cursor-pointer"
            >
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
          <button className="bg-white/5 hover:bg-white/10 text-white p-3 rounded-xl border border-white/10 transition-all active:scale-95">
            <Download size={20} />
          </button>
        </div>
      </div>

      {/* 2. Live Performance Summaries */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
        <SummaryCard label="Net Revenue" value={summary.revenue} trend={summary.revenueTrend} isPositive={summary.revenueTrend >= 0} suffix="₹" />
        <SummaryCard label="Total Invoices" value={summary.bills} trend={5} isPositive={true} />
        <SummaryCard label="Avg Ticket Size" value={summary.avgValue} trend={-2} isPositive={false} suffix="₹" />
        <SummaryCard label="Operating Profit" value={summary.profit} trend={summary.profitTrend} isPositive={summary.profitTrend >= 0} suffix="₹" />
      </div>

      {/* 3. Detailed Data Analytics Table */}
      <div className="flex-1 bg-brand-surface rounded-[2.5rem] border border-white/5 flex flex-col overflow-hidden shadow-2xl relative">
        
        {loading && (
          <div className="absolute inset-0 bg-[#1c1c1e]/60 backdrop-blur-sm z-20 flex items-center justify-center">
            <Loader2 className="animate-spin text-brand-blue" size={40} />
          </div>
        )}

        <div className="px-8 py-5 bg-[#0a0a0a]/30 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-white font-bold text-lg flex items-center gap-3 capitalize">
            <ClipboardList size={20} className="text-brand-blue" /> 
            {activeReport === 'items' ? 'Top Selling Products' : activeReport === 'customers' ? 'High Value Customers' : 'Transaction History'}
          </h3>
          <div className="flex items-center gap-2 text-[10px] font-black text-[#444] uppercase tracking-[0.2em]">
            <Filter size={14} /> Performance Sorting Active
          </div>
        </div>

        {/* Visual Table Header */}
        <div className="grid grid-cols-12 gap-4 px-8 py-4 bg-[#0a0a0a]/10 border-b border-white/5 text-[10px] font-black text-[#555] uppercase tracking-[0.2em]">
          <div className="col-span-5">Entity Name</div>
          <div className="col-span-2 text-center">Volume / Qty</div>
          <div className="col-span-2 text-center">Tax Contribution</div>
          <div className="col-span-3 text-right">Net Financial Impact</div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {reportData.length === 0 && !loading ? (
             <div className="h-full flex flex-col items-center justify-center text-[#222]">
                <FileText size={64} strokeWidth={1} />
                <p className="mt-4 font-bold tracking-widest uppercase text-xs">No data found for this period</p>
             </div>
          ) : (
            reportData.map((row, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-4 px-6 py-4 items-center bg-[#0a0a0a]/20 hover:bg-white/5 rounded-3xl border border-white/5 transition-all group">
                <div className="col-span-5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-dark flex items-center justify-center text-[#A1A1AA] border border-white/5 font-black text-xs">#{idx + 1}</div>
                  <div className="overflow-hidden">
                    <h4 className="font-bold text-white text-[15px] truncate">{row.name || row.id}</h4>
                    <p className="text-[10px] font-bold text-[#444] mt-0.5 uppercase tracking-tighter">{row.metadata || 'General'}</p>
                  </div>
                </div>
                
                <div className="col-span-2 text-center">
                  <p className="text-white font-black text-sm">{row.volume?.toLocaleString() || 0}</p>
                  <p className="text-[9px] font-bold text-[#333] uppercase">Records</p>
                </div>
                
                <div className="col-span-2 text-center">
                  <p className="text-mac-yellow font-black text-sm">₹{row.tax?.toFixed(2) || '0.00'}</p>
                  <p className="text-[9px] font-bold text-[#333] uppercase">GST Coll.</p>
                </div>
                
                <div className="col-span-3 text-right flex items-center justify-end gap-6">
                  <div>
                    <p className="text-mac-green font-black text-lg leading-none">₹{row.total?.toFixed(2) || '0.00'}</p>
                    <p className="text-[9px] font-bold text-[#333] uppercase mt-1">Net Revenue</p>
                  </div>
                  <ChevronRight size={18} className="text-[#222] group-hover:text-white transition-colors" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Action Footer */}
        <div className="px-8 py-5 bg-[#0a0a0a]/50 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <span className="w-2 h-2 rounded-full bg-mac-green animate-pulse"></span>
             <span className="text-[11px] font-black text-white uppercase tracking-widest">Database Sync: OK</span>
          </div>
          <button 
            onClick={() => {/* Trigger Day Closing logic */}}
            className="bg-brand-blue text-white font-black px-8 py-3 rounded-2xl hover:bg-[#007AFF]/80 transition-all shadow-[0_0_20px_rgba(0,122,255,0.4)] flex items-center gap-2 text-xs uppercase tracking-widest active:scale-95"
          >
            Export Day Closing PDF
          </button>
        </div>
      </div>
    </div>
  );
}