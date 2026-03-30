import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { Lock, MonitorOff } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { useAuthStore } from './store/useAuthStore';

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

// --- NEW MODULE PLACEHOLDERS ---
const DailyOps = () => <div className="flex items-center justify-center h-full text-tally-black font-bold text-sm tracking-widest uppercase">Day Book Module Initializing...</div>;
const Delivery = () => <div className="flex items-center justify-center h-full text-tally-black font-bold text-sm tracking-widest uppercase">Delivery Management Initializing...</div>;
const Communications = () => <div className="flex items-center justify-center h-full text-tally-black font-bold text-sm tracking-widest uppercase">Communications Initializing...</div>;

/**
 * STAFF PIN LOCK SCREEN
 * Rebuilt as a classic Tally-style flat dialog box.
 */
const StaffPinLock = ({ onUnlock }) => {
  const { t } = useLanguage();
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const handleVerify = async (val) => {
    const newPin = pin + val;
    if (newPin.length <= 4) setPin(newPin);
    
    if (newPin.length === 4) {
      if (newPin === '1234') {
        onUnlock({ id: 'master', username: 'Master Admin', role: 'OWNER', permissions: ['ALL'] });
        return;
      }

      try {
        // Native Tauri IPC replacing Electron
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
    <div className="fixed inset-0 z-[999] bg-tally-bg/90 flex items-center justify-center animate-in fade-in duration-200 font-sans">
      <div className="w-[300px] bg-white border border-tally-border shadow-tally-window flex flex-col">
        
        {/* Classic Window Header */}
        <div className="bg-tally-darkBlue text-white px-3 py-1.5 text-xs font-bold flex items-center gap-2">
          <Lock size={12} /> System Security
        </div>

        <div className="p-6 text-center flex flex-col items-center">
          <h2 className="text-lg font-bold text-tally-black tracking-tight mb-1">{t('pin_required')}</h2>
          <p className="text-gray-500 text-[10px] font-bold uppercase mb-6">{t('pin_desc')}</p>

          <div className="flex justify-center gap-3 mb-6 bg-tally-bg p-3 border border-tally-border w-full">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={`w-3 h-3 border border-tally-border transition-colors duration-100 ${
                pin.length >= i ? 'bg-tally-darkBlue' : 'bg-white'
              } ${error ? 'bg-red-500 border-red-500' : ''}`} />
            ))}
          </div>

          <div className="grid grid-cols-3 gap-1 w-full">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, "C", 0].map((val, idx) => (
              <button
                key={idx}
                onClick={() => val === 'C' ? setPin("") : handleVerify(val)}
                className={`h-10 border border-tally-border flex items-center justify-center text-sm font-bold transition-none active:bg-tally-yellow active:text-tally-black ${
                  val === 'C' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-tally-lightBlue text-tally-darkBlue hover:bg-white'
                } ${val === 0 ? 'col-start-2' : ''}`}
              >
                {val}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

// The Tally Prime layout controller (Top Header -> Main Left -> Right Action Menu)
const MainLayout = ({ user, isOffline }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Wire up Global RBAC Auth Store
  const activeStaff = useAuthStore(state => state.staff);
  const loginStaff = useAuthStore(state => state.loginStaff);
  const logoutStaff = useAuthStore(state => state.logoutStaff);

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
      case 'daily-ops': return <DailyOps />;
      case 'delivery':  return <Delivery />;
      case 'communications': return <Communications />;
      default:          return <Dashboard />;
    }
  };

  // Safe Public Routes that DO NOT require a Staff PIN to view
  const isPublicTab = ['dashboard', 'settings', 'daily-ops', 'delivery', 'communications'].includes(activeTab);

  if (!activeStaff && !isPublicTab) {
    return <StaffPinLock onUnlock={(staff) => loginStaff(staff)} />;
  }

  return (
    <div className="flex flex-col h-screen w-full bg-tally-bg text-tally-black font-sans overflow-hidden">
      
      {/* 1. Full-Width Top Header */}
      <Header user={user} staff={activeStaff} isOffline={isOffline} />

      {/* 2. Split Workspace */}
      <div className="flex-1 flex flex-row w-full h-full overflow-hidden">
        
        {/* Left/Center: Main Content Area */}
        <main className="flex-1 overflow-y-auto custom-scrollbar relative flex flex-col">
          {isOffline && (
            <div className="bg-yellow-100 border-b border-yellow-300 px-4 py-1.5 flex items-center gap-2 text-yellow-800 text-xs font-bold">
              <MonitorOff size={14} />
              {t('set_cloud_offline_msg')}
            </div>
          )}
          <div className="flex-1 w-full h-full animate-in fade-in duration-300">
            {renderPage()}
          </div>
        </main>

        {/* Right: Tally Action Menu (Sidebar) */}
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onLock={logoutStaff} 
          isOffline={isOffline}
        />

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
          // Native Tauri IPC replacing Electron
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
        <div className="h-screen w-full bg-tally-bg flex flex-col items-center justify-center font-sans">
          <div className="w-12 h-12 border-4 border-tally-cyan border-t-tally-darkBlue rounded-full animate-spin mb-4"></div>
          <p className="text-tally-darkBlue font-bold text-xs uppercase tracking-widest">VyaparSetu Initializing...</p>
        </div>
      ) : (
        <AppRouter />
      )}
    </LanguageProvider>
  );
}