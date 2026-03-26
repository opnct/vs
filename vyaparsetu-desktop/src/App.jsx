import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { invoke } from '@tauri-apps/api/core';
import { auth } from './firebase';

// --- LAYOUT COMPONENTS ---
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// --- AUTH PAGES ---
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import VerifyEmail from './pages/Auth/VerifyEmail';

// --- RETAIL MODULES (PAGES) ---
import Dashboard from './pages/Dashboard';
import POSBilling from './pages/POSBilling';
import KhataLedger from './pages/KhataLedger';
import Inventory from './pages/Inventory';
import Settings from './pages/Settings';
import Purchases from './pages/Purchases';
import Suppliers from './pages/Suppliers';
import Reports from './pages/Reports';
import Staff from './pages/Staff';

// The main POS interface (only visible when authenticated)
const MainLayout = ({ user }) => {
  // Global Navigation State inside the secure zone
  const [activeTab, setActiveTab] = useState('pos');

  // Dynamic Page Renderer for the 16 Kirana Modules
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
      case 'purchases':
        return <Purchases />;
      case 'suppliers':
        return <Suppliers />;
      case 'reports':
        return <Reports />;
      case 'staff':
        return <Staff />;
      case 'settings':
        return <Settings />;
      default:
        return <POSBilling />;
    }
  };

  return (
    // Applied the new 'brand-dark' deep charcoal background
    <div className="flex h-screen w-full bg-brand-dark text-brand-text font-sans overflow-hidden">
      
      {/* 1. LEFT SIDEBAR NAVIGATION (Dark macOS style) */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-full relative">
        
        {/* TOP HEADER (Shop Context, Search, Cloud Sync Status) */}
        <Header user={user} />

        {/* DYNAMIC PAGE INJECTION (Scrollable Area) */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-brand-dark">
          {renderPage()}
        </main>
        
      </div>

    </div>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Global Authentication & Sync Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        // Trigger the background Rust/SQLite to Firebase synchronization engine
        try {
          // We wrap this in a try-catch so it doesn't crash if running in a web browser preview instead of Tauri
          if (window.__TAURI_INTERNALS__) {
            await invoke('start_cloud_sync', { uid: currentUser.uid });
            console.log("Cloud sync engine initialized for:", currentUser.uid);
          }
        } catch (error) {
          console.error("Failed to start cloud sync:", error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Show a sleek dark loading state while checking Firebase session
  if (loading) {
    return (
      <div className="h-screen w-full bg-brand-dark flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* PUBLIC AUTH ROUTES */}
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/" />} />
        <Route path="/verify-email" element={!user ? <VerifyEmail /> : <Navigate to="/" />} />
        
        {/* SECURE POS ROUTE */}
        <Route path="/" element={user ? <MainLayout user={user} /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}