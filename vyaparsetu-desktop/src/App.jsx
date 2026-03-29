import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { Lock, UserCheck, ShieldAlert, MonitorOff } from 'lucide-react';
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

// --- NEW MODULE PLACEHOLDERS (To be replaced with real files later) ---
const DailyOps = () => <div className="flex items-center justify-center h-full text-[#888888] font-bold text-xl tracking-widest uppercase animate-pulse">Daily Operations Module Initializing...</div>;
const Delivery = () => <div className="flex items-center justify-center h-full text-[#888888] font-bold text-xl tracking-widest uppercase animate-pulse">Delivery Management Module Initializing...</div>;
const Communications = () => <div className="flex items-center justify-center h-full text-[#888888] font-bold text-xl tracking-widest uppercase animate-pulse">Communications Module Initializing...</div>;

/**
 * STAFF PIN LOCK SCREEN
 * A production-grade security barrier featuring a premium frosted-glass aesthetic.
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
        onUnlock({ id: 'master', username: 'Master Admin', role: 'OWNER', permissions: ['ALL'] });
        return;
      }

      try {
        // ELECTRON IPC: Replaces Tauri invoke
        const attendant = await window.electronAPI.invoke('verify_staff_pin', { pin: newPin });
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
    <div className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-2xl flex items-center justify-center animate-in fade-in duration-500">
      <div className="w-[320px] text-center flex flex-col items-center">
        
        <div className="mb-10 flex flex-col items-center">
          <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-6 transition-all ${
            error ? 'bg-mac-red/20 text-mac-red animate-shake shadow-[0_0_20px_rgba(248,113,113,0.3)]' : 'bg-brand-blue/20 text-brand-blue shadow-glow-blue'
          }`}>
            <Lock size={28} />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">{t('pin_required')}</h2>
          <p className="text-[#888888] text-sm mt-2">{t('pin_desc')}</p>
        </div>

        <div className="flex justify-center gap-6 mb-12">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
              pin.length >= i ? 'bg-brand-blue shadow-[0_0_15px_rgba(0,122,255,0.8)] scale-110' : 'bg-white/10'
            }`} />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-x-6 gap-y-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, "C", 0].map((val, idx) => (
            <button
              key={idx}
              onClick={() => val === 'C' ? setPin("") : handleVerify(val)}
              className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-medium transition-all active:scale-90 ${
                val === 'C' ? 'text-mac-red hover:bg-mac-red/10' : 'text-white hover:bg-white/10'
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
      default:          return <POSBilling staff={activeStaff} />;
    }
  };

  // Safe Public Routes that DO NOT require a Staff PIN to view
  const isPublicTab = ['dashboard', 'settings', 'daily-ops', 'delivery', 'communications'].includes(activeTab);

  if (!activeStaff && !isPublicTab) {
    return <StaffPinLock onUnlock={(staff) => loginStaff(staff)} />;
  }

  return (
    <div className="flex h-screen w-full bg-brand-dark text-white font-sans overflow-hidden">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLock={logoutStaff} 
        isOffline={isOffline}
      />

      <div className="flex-1 flex flex-col h-full relative bg-brand-dark">
        <Header user={user} staff={activeStaff} isOffline={isOffline} />
        
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-brand-dark custom-scrollbar">
          {isOffline && (
            <div className="mb-6 bg-status-orange/10 border border-status-orange/20 p-3 rounded-2xl flex items-center gap-3 text-status-orange text-xs font-bold uppercase tracking-widest">
              <MonitorOff size={16} />
              {t('set_cloud_offline_msg')}
            </div>
          )}
          <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 h-full">
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
          // ELECTRON IPC: Replaces Tauri invoke
          if (window.electronAPI) {
            await window.electronAPI.invoke('start_cloud_sync', { uid: currentUser.uid });
          }
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
        <div className="h-screen w-full bg-brand-dark flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-brand-blue border-t-transparent rounded-full animate-spin mb-6 shadow-glow-blue"></div>
          <p className="text-[#888888] font-bold tracking-widest text-[10px] uppercase animate-pulse">VyaparSetu Terminal Initializing</p>
        </div>
      ) : (
        <AppRouter />
      )}
    </LanguageProvider>
  );
}