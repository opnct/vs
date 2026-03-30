
import React, { useEffect, useState } from 'react';
import { useAppStore } from './store/useAppStore';
import { WindowMinimize, Square, X, Settings, Database, Play } from 'lucide-react';
import { getCurrentWindow } from '@tauri-apps/api/window';

import POSBilling from './pages/POSBilling';
import Ledgers from './pages/Ledgers';
import Inventory from './pages/Inventory';
import Reports from './pages/Reports';
import Config from './pages/Config';

const TopMenu = () => {
  const { openFile } = useAppStore();
  const appWindow = getCurrentWindow();
  return (
    <div className="h-8 bg-np-menuBg flex items-center justify-between select-none font-sans" data-tauri-drag-region>
      <div className="flex items-center">
        <div className="px-3 flex gap-4 text-xs text-np-text cursor-default">
          <div className="hover:bg-white/10 px-2 py-1 rounded">File</div>
          <div className="hover:bg-white/10 px-2 py-1 rounded">Edit</div>
          <div className="hover:bg-white/10 px-2 py-1 rounded">View</div>
          
          {/* Module Quick Links inside Menu */}
          <div className="flex gap-2 ml-4 border-l border-np-border pl-4">
            <button onClick={()=>openFile('POS_Billing.txt')} className="hover:text-np-accent">Billing</button>
            <button onClick={()=>openFile('Ledgers_Master.txt')} className="hover:text-np-accent">Ledgers</button>
            <button onClick={()=>openFile('Inventory.txt')} className="hover:text-np-accent">Inventory</button>
            <button onClick={()=>openFile('Reports.txt')} className="hover:text-np-accent">Reports</button>
            <button onClick={()=>openFile('System_Config.txt')} className="hover:text-np-accent">Config</button>
          </div>
        </div>
      </div>
      <div className="flex">
        <button onClick={() => appWindow.minimize()} className="h-8 w-12 flex items-center justify-center hover:bg-white/10"><WindowMinimize size={14} /></button>
        <button onClick={() => appWindow.toggleMaximize()} className="h-8 w-12 flex items-center justify-center hover:bg-white/10"><Square size={12} /></button>
        <button onClick={() => appWindow.close()} className="h-8 w-12 flex items-center justify-center hover:bg-red-500"><X size={16} /></button>
      </div>
    </div>
  );
};

const TabBar = () => {
  const { openTabs, activeTab, openFile, closeFile } = useAppStore();
  return (
    <div className="flex h-9 bg-np-menuBg overflow-x-auto custom-scrollbar pt-1 px-1 shrink-0 font-sans">
      {openTabs.map(tab => (
        <div key={tab} onClick={() => openFile(tab)} className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer rounded-t-md border border-b-0 transition-colors group ${activeTab === tab ? 'bg-np-bg border-np-border text-np-text' : 'bg-np-menuBg border-transparent text-np-muted hover:bg-np-tabHover'}`}>
          <span className="text-[13px]">{tab}</span>
          <X size={14} onClick={(e) => { e.stopPropagation(); closeFile(tab); }} className={`rounded-full hover:bg-white/20 p-0.5 ${activeTab === tab ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
        </div>
      ))}
      <div className="px-3 flex items-center cursor-pointer hover:bg-np-tabHover rounded-t-md text-np-muted"><span className="text-lg">+</span></div>
    </div>
  );
};

const ActionBar = () => (
  <div className="h-10 bg-np-bg border-b border-np-border flex items-center px-4 gap-4 text-sm shrink-0 font-sans">
    <select className="bg-np-actionBg border border-np-border px-2 py-1 rounded w-32"><option>Consolas</option><option>Arial</option></select>
    <select className="bg-np-actionBg border border-np-border px-2 py-1 rounded"><option>14</option><option>16</option></select>
    <div className="w-px h-5 bg-np-border"></div>
    <div className="font-bold flex gap-3 text-np-muted">
      <span className="hover:text-np-text cursor-pointer">B</span><span className="italic hover:text-np-text cursor-pointer">I</span><span className="underline hover:text-np-text cursor-pointer">U</span>
    </div>
    <div className="ml-auto text-xs text-np-accent flex items-center gap-2 border border-np-accent/30 bg-np-accent/10 px-3 py-1 rounded">
      <Database size={14} /> ACTIVE FY: 2024-25 | GST: ON
    </div>
  </div>
);

const StatusBar = () => {
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  useEffect(() => { setInterval(() => setTime(new Date().toLocaleTimeString()), 1000); }, []);
  return (
    <div className="h-6 bg-np-bg border-t border-np-border text-np-muted flex items-center px-4 text-[11px] font-sans justify-between shrink-0">
      <div className="flex gap-6"><span>Ln 14, Col 32</span><span>100%</span></div>
      <div className="flex gap-6"><span>Windows (CRLF)</span><span>UTF-8</span><span>{time}</span></div>
    </div>
  );
};

export default function App() {
  const activeTab = useAppStore(state => state.activeTab);
  
  const renderContent = () => {
    switch(activeTab) {
      case 'POS_Billing.txt': return <POSBilling />;
      case 'Ledgers_Master.txt': return <Ledgers />;
      case 'Inventory.txt': return <Inventory />;
      case 'Reports.txt': return <Reports />;
      case 'System_Config.txt': return <Config />;
      default: return <div className="p-6 text-np-muted font-mono">This file is empty. Type to create new accounting entry...</div>;
    }
  };

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-np-bg border border-np-border rounded-lg shadow-2xl">
      <TopMenu />
      <TabBar />
      <ActionBar />
      <main className="flex-1 overflow-y-auto custom-scrollbar p-6">
        {renderContent()}
      </main>
      <StatusBar />
    </div>
  );
}
