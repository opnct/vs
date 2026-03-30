
import React, { useEffect, useState } from 'react';
import { useAppStore } from './store/useAppStore';
import { Files, Search, Database, Settings, Play, X, Check, Box, Users, FileText, LayoutDashboard } from 'lucide-react';

import Dashboard from './pages/Dashboard';
import POSBilling from './pages/POSBilling';
import Ledgers from './pages/Ledgers';
import Inventory from './pages/Inventory';
import Reports from './pages/Reports';

const Explorer = () => {
  const { openFile, activeTab } = useAppStore();
  const files = [
    { name: 'Welcome.md', icon: LayoutDashboard, color: 'text-vscode-keyword' },
    { name: 'POS_Terminal.rs', icon: Play, color: 'text-vscode-type' },
    { name: 'Chart_Of_Accounts.json', icon: Database, color: 'text-vscode-string' },
    { name: 'Inventory_Master.sql', icon: Box, color: 'text-yellow-500' },
    { name: 'Financial_Reports.csv', icon: FileText, color: 'text-green-500' }
  ];

  return (
    <div className="w-64 h-full bg-vscode-sidebar border-r border-vscode-border flex flex-col shrink-0 select-none">
      <div className="px-4 py-3 text-[11px] font-bold tracking-widest text-vscode-textDark">EXPLORER</div>
      <div className="px-4 py-1 text-[11px] font-bold text-vscode-text flex items-center gap-1"><span className="rotate-90 text-vscode-textDark">›</span> VYAPARSETU_WORKSPACE</div>
      <div className="flex-1 overflow-y-auto mt-2">
        {files.map(f => (
          <div key={f.name} onClick={() => openFile(f.name)} className={`flex items-center gap-2 px-6 py-1 cursor-pointer text-[13px] ${activeTab === f.name ? 'bg-[#37373d] text-white' : 'text-vscode-text hover:bg-[#2a2d2e]'}`}>
            <f.icon size={14} className={f.color} /> {f.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  const { activeTab, openTabs, openFile, closeFile } = useAppStore();
  
  const renderContent = () => {
    switch(activeTab) {
      case 'Welcome.md': return <Dashboard />;
      case 'POS_Terminal.rs': return <POSBilling />;
      case 'Chart_Of_Accounts.json': return <Ledgers />;
      case 'Inventory_Master.sql': return <Inventory />;
      case 'Financial_Reports.csv': return <Reports />;
      default: return <div className="p-10 font-mono text-vscode-textDark">// Module initializing...</div>;
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-vscode-bg">
      <div className="w-12 h-full bg-vscode-activity flex flex-col items-center py-4 gap-6 border-r border-vscode-border shrink-0">
        <Files size={24} className="text-vscode-text cursor-pointer" />
        <Settings size={24} className="text-vscode-textDark mt-auto cursor-pointer" />
      </div>
      <Explorer />
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex h-9 bg-vscode-sidebar shrink-0 overflow-x-auto">
          {openTabs.map(tab => (
            <div key={tab} onClick={() => openFile(tab)} className={`flex items-center gap-2 px-3 py-2 cursor-pointer border-r border-vscode-border border-t border-t-transparent group ${activeTab === tab ? 'bg-vscode-bg text-vscode-accent border-t-vscode-accent' : 'bg-vscode-tabInactive text-vscode-textDark hover:bg-[#2b2b2b]'}`}>
              <span className="text-[13px] font-sans">{tab}</span>
              <X size={14} onClick={(e) => { e.stopPropagation(); closeFile(tab); }} className="hover:bg-vscode-border rounded" />
            </div>
          ))}
        </div>
        <main className="flex-1 overflow-y-auto relative custom-scrollbar p-1">{renderContent()}</main>
      </div>
      <div className="absolute bottom-0 w-full h-6 bg-vscode-statusBg text-white flex items-center px-3 text-[11px] font-sans justify-between z-50">
        <div className="flex items-center gap-4"><Check size={12}/> Tauri v1 IPC Locked</div>
        <div>sqlite3: workspace.db</div>
      </div>
    </div>
  );
}
