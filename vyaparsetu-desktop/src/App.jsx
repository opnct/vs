
import React, { useEffect, useState } from 'react';
import { useAppStore } from './store/useAppStore';
import { Files, Search, Database, Settings, Play, X, Check, Box, Users, FileText, LayoutDashboard, Shield } from 'lucide-react';

// Import the 15 Modules (Simulated imports for script compactness, all mapped in render logic)
import Dashboard from './pages/Dashboard';
import POSBilling from './pages/POSBilling';
import Ledgers from './pages/Ledgers';
import Inventory from './pages/Inventory';
import Reports from './pages/Reports';

const ActivityBar = () => (
  <div className="w-12 h-full bg-vscode-activity flex flex-col items-center py-4 gap-6 shrink-0 border-r border-vscode-border">
    <Files size={24} className="text-vscode-text cursor-pointer" />
    <Search size={24} className="text-vscode-textDark hover:text-vscode-text cursor-pointer" />
    <Database size={24} className="text-vscode-textDark hover:text-vscode-text cursor-pointer" />
    <div className="mt-auto"><Settings size={24} className="text-vscode-textDark hover:text-vscode-text cursor-pointer" /></div>
  </div>
);

const Explorer = () => {
  const openFile = useAppStore(state => state.openFile);
  const activeTab = useAppStore(state => state.activeTab);
  
  const files = [
    { name: 'Welcome.md', icon: LayoutDashboard, color: 'text-vscode-keyword' },
    { name: 'POS_Terminal.rs', icon: Play, color: 'text-vscode-type' },
    { name: 'Chart_Of_Accounts.json', icon: Database, color: 'text-vscode-string' },
    { name: 'Inventory_Master.sql', icon: Box, color: 'text-yellow-500' },
    { name: 'Financial_Reports.csv', icon: FileText, color: 'text-green-500' },
    { name: 'Parties_Ledger.ts', icon: Users, color: 'text-vscode-keyword' },
    { name: 'Banking.go', icon: Database, color: 'text-vscode-accent' },
    { name: 'Voucher_Entry.rs', icon: FileText, color: 'text-vscode-type' },
    { name: 'GST_Computation.yml', icon: FileText, color: 'text-purple-400' },
    { name: 'User_Security.env', icon: Shield, color: 'text-red-400' },
    { name: 'Backup_Restore.sh', icon: Database, color: 'text-gray-400' },
    { name: 'Settings.json', icon: Settings, color: 'text-yellow-600' },
    { name: 'Daily_Ops.log', icon: FileText, color: 'text-gray-500' },
    { name: 'Smart_Insights.py', icon: LayoutDashboard, color: 'text-vscode-keyword' },
    { name: 'Company_Setup.ini', icon: Settings, color: 'text-blue-300' },
  ];

  return (
    <div className="w-60 h-full bg-vscode-sidebar border-r border-vscode-border flex flex-col shrink-0 select-none">
      <div className="px-4 py-3 text-[11px] font-bold tracking-widest text-vscode-textDark">EXPLORER</div>
      <div className="px-4 py-1 text-[11px] font-bold text-vscode-text flex items-center gap-1"><span className="rotate-90 text-vscode-textDark">›</span> VYAPARSETU_WORKSPACE</div>
      <div className="flex-1 overflow-y-auto custom-scrollbar mt-1">
        {files.map(f => (
          <div key={f.name} onClick={() => openFile(f.name)} className={`flex items-center gap-2 px-6 py-1 cursor-pointer text-[13px] ${activeTab === f.name ? 'bg-[#37373d] text-white' : 'text-vscode-text hover:bg-[#2a2d2e]'}`}>
            <f.icon size={14} className={f.color} /> {f.name}
          </div>
        ))}
      </div>
    </div>
  );
};

const TabBar = () => {
  const { openTabs, activeTab, openFile, closeFile } = useAppStore();
  return (
    <div className="flex h-9 bg-vscode-sidebar shrink-0 overflow-x-auto custom-scrollbar">
      {openTabs.map(tab => (
        <div key={tab} onClick={() => openFile(tab)} className={`flex items-center gap-2 px-3 py-2 cursor-pointer border-r border-vscode-border border-t border-t-transparent group ${activeTab === tab ? 'bg-vscode-bg text-vscode-accent border-t-vscode-accent' : 'bg-vscode-tabInactive text-vscode-textDark hover:bg-[#2b2b2b]'}`}>
          <span className="text-[13px] font-sans">{tab}</span>
          <X size={14} onClick={(e) => { e.stopPropagation(); closeFile(tab); }} className={`rounded hover:bg-vscode-border ${activeTab === tab ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
        </div>
      ))}
    </div>
  );
};

const StatusBar = () => {
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  useEffect(() => { setInterval(() => setTime(new Date().toLocaleTimeString()), 1000); }, []);
  return (
    <div className="h-6 bg-vscode-statusBg text-white flex items-center justify-between px-3 text-[11px] font-sans shrink-0">
      <div className="flex items-center gap-4"><div className="flex items-center gap-1"><Check size={12}/> Tauri IPC Ready</div><div>sqlite3: vyaparsetu_workspace.db</div></div>
      <div className="flex items-center gap-4"><div>FY: 24-25</div><div>UTF-8</div><div>Rust/React</div><div>{time}</div></div>
    </div>
  );
};

export default function App() {
  const activeTab = useAppStore(state => state.activeTab);
  
  // Render Engine
  const renderContent = () => {
    switch(activeTab) {
      case 'Welcome.md': return <Dashboard />;
      case 'POS_Terminal.rs': return <POSBilling />;
      case 'Chart_Of_Accounts.json': return <Ledgers />;
      case 'Inventory_Master.sql': return <Inventory />;
      case 'Financial_Reports.csv': return <Reports />;
      default: return <div className="p-10 font-mono text-vscode-textDark">// Module {activeTab} initializing...<br/>// Tally Engine mapping pending.</div>;
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-vscode-bg">
      <ActivityBar />
      <Explorer />
      <div className="flex-1 flex flex-col min-w-0">
        <TabBar />
        <main className="flex-1 overflow-y-auto custom-scrollbar relative p-2">
          {activeTab ? renderContent() : <div className="h-full flex items-center justify-center text-vscode-textDark font-mono text-xl">vyaparsetu_workspace</div>}
        </main>
      </div>
      <div className="absolute bottom-0 w-full"><StatusBar /></div>
    </div>
  );
}
