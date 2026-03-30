
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Ledgers from './pages/Ledgers';
import Vouchers from './pages/Vouchers';
import POSBilling from './pages/POSBilling';

// Minimal Stub for other modules to prevent crashes
const Stub = ({title}) => <div className="p-12"><h1 className="text-2xl font-bold">{title}</h1><p className="text-brand-muted">Module initializing...</p></div>;

export default function App() {
  return (
    <Router>
      <div className="flex flex-col h-screen w-full bg-brand-white text-brand-text font-sans overflow-hidden">
        <Header />
        <div className="flex-1 flex overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto custom-scrollbar relative px-16 py-12">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/ledgers" element={<Ledgers />} />
              <Route path="/vouchers" element={<Vouchers />} />
              <Route path="/pos" element={<POSBilling />} />
              <Route path="/company" element={<Stub title="Company Setup" />} />
              <Route path="/inventory" element={<Stub title="Inventory Engine" />} />
              <Route path="/banking" element={<Stub title="Banking & Cash" />} />
              <Route path="/gst" element={<Stub title="GST Compliance" />} />
              <Route path="/reports" element={<Stub title="Accounting Reports" />} />
              <Route path="/settings" element={<Stub title="Settings & Format" />} />
              <Route path="/backup" element={<Stub title="Backup & Data Flow" />} />
              <Route path="/staff" element={<Stub title="Staff & Security" />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}
