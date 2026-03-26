import React, { useState } from 'react';

// --- LAYOUT COMPONENTS ---
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// --- RETAIL MODULES (PAGES) ---
import Dashboard from './pages/Dashboard';
import POSBilling from './pages/POSBilling';
import KhataLedger from './pages/KhataLedger';
import Inventory from './pages/Inventory';
import Settings from './pages/Settings';

export default function App() {
  // Global Navigation State
  // Defaulting to 'pos' because fast billing is the #1 priority for Kirana stores
  const [activeTab, setActiveTab] = useState('pos');

  // Dynamic Page Renderer
  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'pos':
        return <POSBilling />;
      case 'khata':
        return <KhataLedger />;
      case 'inventory':
        return <Inventory />;
      case 'settings':
        return <Settings />;
      default:
        return <POSBilling />;
    }
  };

  return (
    // We use the custom Tailwind 'brand' colors defined in tailwind.config.js
    <div className="flex h-screen w-full bg-brand-bg text-brand-text font-sans overflow-hidden">
      
      {/* 1. LEFT SIDEBAR NAVIGATION */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-full relative">
        
        {/* TOP HEADER (Shop Context & Status) */}
        <Header />

        {/* DYNAMIC PAGE INJECTION (Scrollable Area) */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-brand-bg">
          {renderPage()}
        </main>
        
      </div>

    </div>
  );
}