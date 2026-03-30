import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { invoke } from '@tauri-apps/api/core';

export default function Dashboard() {
  const [shopName, setShopName] = useState("National Enterprises");
  const [lastEntryDate, setLastEntryDate] = useState("No Entries");
  const [selectedIndex, setSelectedIndex] = useState(5); // Default to 'Vouchers'

  // --- REAL TIME CLOCK & PERIOD CALCULATION ---
  const getTallyDates = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = d.getMonth();
    const startY = month < 3 ? year - 1 : year;
    const endY = startY + 1;
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return {
      period: `1-Apr-${startY.toString().slice(-2)} to 31-Mar-${endY.toString().slice(-2)}`,
      currentDate: `${days[d.getDay()]}, ${d.getDate()}-${months[d.getMonth()]}-${year.toString().slice(-2)}`
    };
  };

  const { period, currentDate } = getTallyDates();

  // --- TAURI NATIVE IPC SYNC ---
  const fetchDashboardData = useCallback(async () => {
    try {
      // 1. Fetch Company Info
      const settings = await invoke('get_settings').catch(() => null);
      if (settings && settings.shop_name) {
        setShopName(settings.shop_name);
      }

      // 2. Fetch Last Entry Date from Transactions
      const transactions = await invoke('get_recent_invoices', { limit: 1 }).catch(() => []);
      if (transactions && transactions.length > 0) {
        const txDate = new Date(transactions[0].created_at);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        setLastEntryDate(`${txDate.getDate()}-${months[txDate.getMonth()]}-${txDate.getFullYear().toString().slice(-2)}`);
      } else {
        setLastEntryDate("No entries yet");
      }
    } catch (error) {
      console.error("Dashboard Data Sync Error:", error);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // --- CLASSIC TALLY MENU ARCHITECTURE ---
  const menuData = useMemo(() => [
    { type: 'header', label: 'MASTERS' },
    { type: 'item', label: 'Create', hotkey: 'C', header: 'Master Creation', desc: 'Create new accounting and inventory masters.' },
    { type: 'item', label: 'Alter', hotkey: 'A', header: 'Master Alteration', desc: 'Modify or delete existing master records.' },
    { type: 'item', label: 'CHart of Accounts', hotkey: 'H', header: 'Chart of Accounts', desc: 'View hierarchical list of ledgers and groups.' },
    { type: 'header', label: 'TRANSACTIONS' },
    { type: 'item', label: 'Vouchers', hotkey: 'V', header: 'Create and Share Sales Invoice', desc: 'Click on Vouchers to create a sales voucher or bill.' },
    { type: 'item', label: 'Day BooK', hotkey: 'K', header: 'Day Book Ledger', desc: 'View all daily operational transactions.' },
    { type: 'header', label: 'UTILITIES' },
    { type: 'item', label: 'BaNking', hotkey: 'N', header: 'Banking Utilities', desc: 'Manage bank reconciliations and statements.' },
    { type: 'item', label: 'TallyCapital', hotkey: 'T', header: 'Capital Management', desc: 'Manage business capital and funding.' },
    { type: 'item', label: 'Bharat ConnEct', hotkey: 'E', header: 'Bharat Connect', desc: 'Sync securely with enterprise gateways.' },
    { type: 'header', label: 'REPORTS' },
    { type: 'item', label: 'Balance Sheet', hotkey: 'B', header: 'Balance Sheet', desc: 'View complete financial position and liabilities.' },
    { type: 'item', label: 'Profit & Loss A/c', hotkey: 'P', header: 'Profit & Loss', desc: 'View Trading and Profit & Loss Accounts.' },
    { type: 'item', label: 'Stock Summary', hotkey: 'S', header: 'Inventory Summary', desc: 'View closing stock summaries and godown status.' },
    { type: 'item', label: 'Ratio Analysis', hotkey: 'R', header: 'Ratio Analysis', desc: 'View accounting and operational performance ratios.' },
    { type: 'spacer' },
    { type: 'item', label: 'Display More Reports', hotkey: 'D', header: 'More Reports', desc: 'Access trial balance, cash flow, and more.' },
    { type: 'item', label: 'DashbOard', hotkey: 'O', header: 'Visual Analytics', desc: 'View graphic metrics and data tiles.' },
    { type: 'spacer' },
    { type: 'item', label: 'Quit', hotkey: 'Q', header: 'Exit System', desc: 'Close the Gateway and quit the application.' },
  ], []);

  const navItems = useMemo(() => menuData.filter(i => i.type === 'item'), [menuData]);

  // --- KEYBOARD NAVIGATION ENGINE ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        setSelectedIndex(prev => (prev + 1) % navItems.length);
      } else if (e.key === 'ArrowUp') {
        setSelectedIndex(prev => (prev === 0 ? navItems.length - 1 : prev - 1));
      } else {
        const key = e.key.toUpperCase();
        const matchIndex = navItems.findIndex(i => i.hotkey.toUpperCase() === key);
        if (matchIndex !== -1) {
          setSelectedIndex(matchIndex);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navItems]);

  // Hotkey Highlighter Component
  const HighlightedText = ({ text, hotkey, isActive }) => {
    const parts = text.split(new RegExp(`(${hotkey})`, 'i'));
    return (
      <span className="tracking-wide">
        {parts.map((part, i) =>
          part.toLowerCase() === hotkey.toLowerCase() ? (
            <span key={i} className={`font-bold ${isActive ? 'text-black' : 'text-[#2C5E8D]'}`}>
              {part}
            </span>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </span>
    );
  };

  let globalItemIndex = -1; // Tracker to match mapped menu with active state

  return (
    <div className="flex h-full w-full select-none font-sans text-black bg-white overflow-hidden">
      
      {/* LEFT PANE: Information Overview */}
      <div className="flex-1 flex flex-col border-r border-[#A9B9C6] p-0 min-w-[300px]">
        {/* Top Header Block */}
        <div className="flex justify-between items-start px-8 py-6">
          <div className="flex flex-col gap-1">
            <span className="text-[#5793C4] text-[11px] font-bold uppercase tracking-widest">Current Period</span>
            <span className="text-[13px] font-bold text-black">{period}</span>
          </div>
          <div className="flex flex-col gap-1 text-right">
            <span className="text-[#5793C4] text-[11px] font-bold uppercase tracking-widest">Current Date</span>
            <span className="text-[13px] font-bold text-black">{currentDate}</span>
          </div>
        </div>

        <div className="w-full h-px bg-[#A9B9C6]/40"></div>

        {/* Subheader Block */}
        <div className="flex justify-between items-center px-8 py-2 bg-[#E8F1F8]/30">
          <span className="text-[#5793C4] text-[11px] font-bold uppercase tracking-widest w-2/3">Name of Company</span>
          <span className="text-[#5793C4] text-[11px] font-bold uppercase tracking-widest w-1/3 text-right">Date of Last Entry</span>
        </div>

        {/* Company List Block */}
        <div className="flex justify-between items-center px-8 py-3">
          <span className="text-[13px] font-bold text-black w-2/3">{shopName}</span>
          <span className="text-[13px] font-bold text-black w-1/3 text-right">{lastEntryDate}</span>
        </div>
      </div>

      {/* RIGHT PANE: Gateway Navigation Menu */}
      <div className="flex-1 bg-[#EAF1F6] flex items-center justify-center relative min-w-[500px]">
        
        {/* Decorative Concentric Watermark (Tally Prime visual motif) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <div className="w-[300px] h-[300px] border-[1.5px] border-[#8FB1CC] rounded-full absolute"></div>
          <div className="w-[450px] h-[450px] border-[1.5px] border-[#8FB1CC] rounded-full absolute"></div>
          <div className="w-[600px] h-[600px] border-[1.5px] border-[#8FB1CC] rounded-full absolute"></div>
        </div>

        {/* Gateway Menu Box */}
        <div className="w-[320px] bg-[#EEF5FA] border border-[#A9B9C6] shadow-sm relative z-10 flex flex-col pb-6 mb-12">
          
          <div className="bg-[#2C5E8D] text-white font-bold py-1.5 text-center text-sm w-full mb-2">
            Gateway of Tally
          </div>

          <div className="flex flex-col">
            {menuData.map((item, index) => {
              if (item.type === 'header') {
                return (
                  <div key={index} className="text-[#2C5E8D] text-[10px] font-bold tracking-[0.2em] pl-14 py-1 mt-3 uppercase">
                    {item.label}
                  </div>
                );
              }
              
              if (item.type === 'spacer') {
                return <div key={index} className="h-4"></div>;
              }

              if (item.type === 'item') {
                globalItemIndex++;
                const isActive = selectedIndex === globalItemIndex;

                return (
                  <div 
                    key={index}
                    onClick={() => setSelectedIndex(globalItemIndex)}
                    onMouseEnter={() => setSelectedIndex(globalItemIndex)}
                    className={`relative w-full px-14 py-[3px] cursor-pointer text-[13px] font-medium transition-none ${
                      isActive ? 'bg-[#FFD500] text-black shadow-[inset_2px_0_0_#000,inset_-2px_0_0_#000]' : 'text-black'
                    }`}
                  >
                    <HighlightedText text={item.label} hotkey={item.hotkey} isActive={isActive} />

                    {/* Classic Tooltip Rendering */}
                    {isActive && (
                      <div className="absolute right-[100%] top-1/2 -translate-y-1/2 mr-3 w-[260px] bg-[#F4F8FB] border border-[#A9B9C6] shadow-md z-50 text-left pointer-events-none">
                        {/* Tooltip Triangle */}
                        <div className="absolute right-[-5px] top-1/2 -translate-y-1/2 w-2 h-2 bg-[#F4F8FB] border-r border-t border-[#A9B9C6] rotate-45"></div>
                        <div className="p-4">
                          <h4 className="font-bold text-black text-[13px] mb-2 leading-tight">
                            {item.header}
                          </h4>
                          <p className="text-black text-[13px] leading-tight">
                            <span className="font-bold">Click on</span> {item.label} {item.desc.replace(`Click on ${item.label}`, '')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>

      </div>
    </div>
  );
}