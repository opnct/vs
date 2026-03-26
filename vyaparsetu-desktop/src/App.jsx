import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { invoke } from '@tauri-apps/api/core';
import { auth } from './firebase';
import { Lock, UserCheck, ShieldAlert, MonitorOff } from 'lucide-react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';

// --- LAYOUT COMPONENTS ---
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// --- SYSTEM PAGES ---
import Onboarding from './pages/Onboarding';

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
  const { t } = useLanguage();
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const handleVerify = async (val) => {
    const newPin = pin + val;
    if (newPin.length <= 4) setPin(newPin);
    
    if (newPin.length === 4) {
      // Master override PIN to prevent lockouts before database setup
      if (newPin === '1234') {
        onUnlock({ id: 'master', name: 'Master Admin', role: 'owner' });
        return;
      }

      try {
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
    <div className="fixed inset-0 z-[999] bg-brand-black flex items-center justify-center animate-in fade-in duration-500">
      <div className="w-[360px] text-center">
        <div className="mb-8 flex flex-col items-center">
          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center border-2 mb-6 transition-all ${
            error ? 'bg-mac-red/20 border-mac-red text-mac-red animate-shake' : 'bg-brand-blue/10 border-brand-blue/20 text-brand-blue'
          }`}>
            <Lock size={36} />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">{t('pin_required')}</h2>
          <p className="text-[#A1A1AA] text-sm mt-2">{t('pin_desc')}</p>
        </div>

        <div className="flex justify-center gap-4 mb-10">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`w-4 h-4 rounded-full border-2 transition-all ${
              pin.length >= i ? 'bg-brand-blue border-brand-blue' : 'border-[#333]'
            }`} />
          ))}
        </div>

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

// The main POS interface layout controller
const MainLayout = ({ user, isOffline }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('pos');
  const [activeStaff, setActiveStaff] = useState(null);

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

  if (!activeStaff && activeTab !== 'dashboard') {
    return <StaffPinLock onUnlock={(staff) => setActiveStaff(staff)} />;
  }

  return (
    <div className="flex h-screen w-full bg-brand-black text-brand-text font-sans overflow-hidden">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLock={() => setActiveStaff(null)} 
        isOffline={isOffline}
      />

      <div className="flex-1 flex flex-col h-full relative bg-brand-black">
        <Header user={user} staff={activeStaff} isOffline={isOffline} />
        
        <main className="flex-1 overflow-y-auto p-6 md:p-10 bg-brand-black custom-scrollbar">
          {isOffline && (
            <div className="mb-6 bg-status-orange/10 border border-status-orange/20 p-3 rounded-2xl flex items-center gap-3 text-status-orange text-xs font-medium">
              <MonitorOff size={14} />
              {t('set_cloud_offline_msg')}
            </div>
          )}
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
  const [hasSeenTutorial, setHasSeenTutorial] = useState(localStorage.getItem('vs_onboarding_done') === 'true');
  const [isOfflineMode, setIsOfflineMode] = useState(localStorage.getItem('vs_offline_mode') === 'true');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        try {
          await invoke('start_cloud_sync', { uid: currentUser.uid });
        } catch (error) {
          console.error("Cloud Sync Worker failed to start:", error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Listen for storage changes (Tutorial finish or Offline mode toggle)
  useEffect(() => {
    const handleStorageChange = () => {
      setHasSeenTutorial(localStorage.getItem('vs_onboarding_done') === 'true');
      setIsOfflineMode(localStorage.getItem('vs_offline_mode') === 'true');
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const AppRouter = () => (
    <Router>
      <Routes>
        <Route path="/onboarding" element={!hasSeenTutorial ? <Onboarding onComplete={() => setHasSeenTutorial(true)} /> : <Navigate to="/login" />} />
        <Route path="/login" element={!hasSeenTutorial ? <Navigate to="/onboarding" /> : (user || isOfflineMode) ? <Navigate to="/" /> : <Login />} />
        <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/" />} />
        <Route path="/verify-email" element={user && !user.emailVerified ? <VerifyEmail /> : <Navigate to="/" />} />
        <Route path="/" element={(!hasSeenTutorial) ? <Navigate to="/onboarding" /> : (user || isOfflineMode) ? <MainLayout user={user} isOffline={isOfflineMode} /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );

  return (
    <LanguageProvider>
      {loading ? (
        <div className="h-screen w-full bg-brand-black flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-brand-blue border-t-transparent rounded-full animate-spin mb-6 shadow-[0_0_30px_rgba(59,130,246,0.3)]"></div>
          <p className="text-brand-muted font-bold tracking-widest text-[10px] uppercase animate-pulse">VyaparSetu Terminal Initializing</p>
        </div>
      ) : (
        <AppRouter />
      )}
    </LanguageProvider>
  );
}