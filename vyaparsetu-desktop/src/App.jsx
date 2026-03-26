import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { invoke } from '@tauri-apps/api/core';
import { auth } from './firebase';
import { Lock, Key, ShieldAlert, X, ChevronRight } from 'lucide-react';

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

/**
 * STAFF PIN LOCK SCREEN
 * A production-grade security barrier that protects the POS from unauthorized access.
 */
const StaffPinLock = ({ onUnlock }) => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const handleVerify = async (val) => {
    const newPin = pin + val;
    if (newPin.length <= 4) setPin(newPin);
    
    if (newPin.length === 4) {
      try {
        // Logic: Verify PIN against local SQLite 'staff' table via Rust
        const attendant = await invoke('verify_staff_pin', { pin: newPin });
        if (attendant) {
          onUnlock(attendant);
        } else {
          setError(true);
          setPin("");
          setTimeout(() => setError(false), 1000);
        }
      } catch (err) {
        setError(true);
        setPin("");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[999] bg-brand-dark flex items-center justify-center animate-in fade-in duration-500">
      <div className="w-[360px] text-center">
        <div className="mb-8 flex flex-col items-center">
          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center border-2 mb-6 transition-all ${
            error ? 'bg-mac-red/20 border-mac-red text-mac-red animate-shake' : 'bg-brand-blue/10 border-brand-blue/20 text-brand-blue'
          }`}>
            <Lock size={36} />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Staff Access Required</h2>
          <p className="text-[#A1A1AA] text-sm mt-2">Enter 4-digit PIN to unlock billing</p>
        </div>

        {/* PIN Dots */}
        <div className="flex justify-center gap-4 mb-10">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`w-4 h-4 rounded-full border-2 transition-all ${
              pin.length >= i ? 'bg-brand-blue border-brand-blue' : 'border-[#333]'
            }`} />
          ))}
        </div>

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, "C", 0].map((val, idx) => (
            <button
              key={idx}
              onClick={() => val === 'C' ? setPin("") : handleVerify(val)}
              className={`h-16 rounded-2xl flex items-center justify-center text-xl font-bold transition-all active:scale-90 ${
                val === 'C' ? 'bg-mac-red/10 text-mac-red' : 'bg-white/5 text-white hover:bg-white/10'
              } ${val === 0 ? 'col-start-2' : ''}`}
            >
              {val}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// The main POS interface
const MainLayout = ({ user }) => {
  const [activeTab, setActiveTab] = useState('pos');
  const [activeStaff, setActiveStaff] = useState(null);

  // Dynamic Page Renderer for all 9 core Production Modules
  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'pos':       return <POSBilling staff={activeStaff} />;
      case 'khata':     return <KhataLedger />;
      case 'inventory': return <Inventory />;
      case 'purchases': return <Purchases />;
      case 'suppliers': return <Suppliers />;
      case 'reports':   return <Reports />;
      case 'staff':     return <Staff />;
      case 'settings':  return <Settings />;
      default:          return <POSBilling />;
    }
  };

  // Logic: Show Lock Screen if no staff is logged in (except for basic dashboard)
  if (!activeStaff && activeTab !== 'dashboard') {
    return <StaffPinLock onUnlock={(staff) => setActiveStaff(staff)} />;
  }

  return (
    <div className="flex h-screen w-full bg-brand-dark text-brand-text font-sans overflow-hidden">
      
      {/* 1. SIDEBAR: Production Navigation mapping */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLock={() => setActiveStaff(null)} 
      />

      <div className="flex-1 flex flex-col h-full relative">
        
        {/* 2. HEADER: Context provider */}
        <Header user={user} staff={activeStaff} />

        {/* 3. MAIN: Scrollable content injection */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10 bg-brand-dark custom-scrollbar">
          <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
            {renderPage()}
          </div>
        </main>
        
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Global Session Manager & Cloud Sync Trigger
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        try {
          // Initialize the Rust SQLite -> Firestore background sync thread
          await invoke('start_cloud_sync', { uid: currentUser.uid });
        } catch (error) {
          console.error("Backend Sync Initialization Failed:", error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full bg-brand-dark flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-brand-blue border-t-transparent rounded-full animate-spin mb-6 shadow-[0_0_30px_rgba(59,130,246,0.3)]"></div>
        <p className="text-[#A1A1AA] font-bold tracking-widest text-[10px] uppercase animate-pulse">Initializing Production Core</p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* AUTHENTICATION STACK */}
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/" />} />
        <Route path="/verify-email" element={!user ? <VerifyEmail /> : <Navigate to="/" />} />
        
        {/* PRODUCTION RETAIL STACK */}
        <Route path="/" element={user ? <MainLayout user={user} /> : <Navigate to="/login" />} />
        
        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}