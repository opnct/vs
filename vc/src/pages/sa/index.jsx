import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, Loader2, AlertCircle, CheckCircle2, 
  XCircle, Clock, Search, LogOut, FileText, IndianRupee
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, query, orderBy, onSnapshot, 
  doc, updateDoc, setDoc, serverTimestamp 
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';

// Initialize Firebase securely utilizing environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Adaptive path generation mapping
const getCollectionPath = (baseName) => {
  return typeof __app_id !== 'undefined' 
    ? `artifacts/${__app_id}/public/data/${baseName}` 
    : baseName;
};

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Dashboard State
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  // Admin Login State (Updated to include passcode)
  const [loginForm, setLoginForm] = useState({ email: '', password: '', passcode: '' });
  const [loginError, setLoginError] = useState('');

  // 1. Authentication Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Real-time Firestore Listener for Payments
  useEffect(() => {
    if (!user) return; // Only fetch if logged in

    const paymentsPath = getCollectionPath('vyapar_payments');
    const q = query(collection(db, paymentsPath), orderBy('submittedAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const paymentData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPayments(paymentData);
      setIsLoading(false);
      setError('');
    }, (err) => {
      console.error("Firestore Listen Error:", err);
      // Fallback logic if index is missing: fetch without orderBy
      if (err.message.includes('requires an index')) {
        const fallbackQ = query(collection(db, paymentsPath));
        onSnapshot(fallbackQ, (fallbackSnapshot) => {
          const fallbackData = fallbackSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          // Sort manually in memory
          fallbackData.sort((a, b) => (b.submittedAt?.toMillis() || 0) - (a.submittedAt?.toMillis() || 0));
          setPayments(fallbackData);
          setIsLoading(false);
        }, (fallbackErr) => {
          setError('Insufficient Permissions. Super Admin access required.');
          setIsLoading(false);
        });
      } else {
        setError('Insufficient Permissions. Super Admin access required.');
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [user]);

  // --- ACTIONS ---

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginError('');

    // Hardcoded Gatekeeper Check
    const targetEmail = "dv3nt@duck.com";
    const targetPassword = "Soc@0099@#$_&";
    const targetPasscode = "OMEGA-7734";

    if (
      loginForm.email.trim() !== targetEmail || 
      loginForm.password !== targetPassword || 
      loginForm.passcode.trim() !== targetPasscode
    ) {
      setLoginError('Security Clearance Denied. Invalid credentials or passcode.');
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, loginForm.email.trim(), loginForm.password);
    } catch (err) {
      setLoginError('Authentication failed at Firebase level.');
    }
  };

  const handleLogout = () => {
    signOut(auth);
    navigate('/');
  };

  const handleApprove = async (payment) => {
    const txId = payment.payuTransactionId || payment.utrNumber || 'UNKNOWN_TX';
    if (!window.confirm(`APPROVE transaction ${txId} for ${payment.email}? This grants full platform access.`)) return;
    
    setActionLoading(payment.id);
    try {
      const paymentsPath = getCollectionPath('vyapar_payments');
      const approvalsPath = getCollectionPath('vyapar_approvals');

      // 1. Write the explicit approval document securely mapping the email
      await setDoc(doc(db, approvalsPath, payment.email.trim().toLowerCase()), {
        email: payment.email.trim().toLowerCase(),
        approvedAt: serverTimestamp(),
        approvedBy: user.email,
        planId: payment.planId,
        utrNumber: txId
      });

      // 2. Update the original payment record status
      await updateDoc(doc(db, paymentsPath, payment.id), {
        status: 'Approved',
        processedAt: serverTimestamp()
      });

    } catch (err) {
      console.error("Approval Execution Error:", err);
      alert("Failed to execute approval. Check console logs.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeny = async (payment) => {
    const txId = payment.payuTransactionId || payment.utrNumber || 'UNKNOWN_TX';
    if (!window.confirm(`DENY transaction ${txId} for ${payment.email}? This rejects their registration.`)) return;
    
    setActionLoading(payment.id);
    try {
      const paymentsPath = getCollectionPath('vyapar_payments');
      
      // Update payment record status
      await updateDoc(doc(db, paymentsPath, payment.id), {
        status: 'Denied',
        processedAt: serverTimestamp()
      });

    } catch (err) {
      console.error("Denial Execution Error:", err);
      alert("Failed to execute denial.");
    } finally {
      setActionLoading(null);
    }
  };

  // --- RENDERING ---

  if (authLoading) {
    return <div className="min-h-screen bg-[#121212] flex items-center justify-center"><Loader2 className="animate-spin text-[#00e676]" size={32} /></div>;
  }

  // LOGIN VIEW (If not authenticated)
  if (!user) {
    return (
      <div className="min-h-screen bg-[#121212] font-sans flex items-center justify-center p-4">
        <div className="bg-[#1a1a1a] max-w-md w-full rounded-xl border border-zinc-800 shadow-2xl p-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-[#b388ff]/10 rounded-full flex items-center justify-center border border-[#b388ff]/30">
              <ShieldCheck size={32} className="text-[#b388ff]" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white text-center mb-2">Super Admin Portal</h2>
          <p className="text-sm text-zinc-400 text-center mb-8 border-b border-zinc-800 pb-6">Restricted Access. Authentication Required.</p>
          
          {loginError && <div className="mb-4 text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded">{loginError}</div>}
          
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-1.5">Admin Email</label>
              <input 
                type="email" required
                value={loginForm.email} onChange={e => setLoginForm({...loginForm, email: e.target.value})}
                className="w-full bg-[#242424] border border-zinc-700 rounded text-white px-3 py-2 focus:outline-none focus:border-[#b388ff]" 
              />
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-1.5">Passkey</label>
              <input 
                type="password" required
                value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})}
                className="w-full bg-[#242424] border border-zinc-700 rounded text-white px-3 py-2 focus:outline-none focus:border-[#b388ff]" 
              />
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-1.5">Security Passcode</label>
              <input 
                type="password" required
                value={loginForm.passcode} onChange={e => setLoginForm({...loginForm, passcode: e.target.value})}
                className="w-full bg-[#242424] border border-zinc-700 rounded text-white px-3 py-2 focus:outline-none focus:border-[#b388ff]" 
              />
            </div>
            <button type="submit" className="w-full bg-[#b388ff] hover:bg-[#9c64ff] text-black font-bold py-2.5 rounded transition-colors mt-4">
              Authenticate
            </button>
          </form>
        </div>
      </div>
    );
  }

  // DASHBOARD VIEW (If Authenticated)
  const filteredPayments = payments.filter(p => 
    p.email?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.payuTransactionId?.includes(searchQuery) ||
    p.utrNumber?.includes(searchQuery) ||
    p.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingCount = payments.filter(p => p.status === 'Pending' || p.status === 'Paid_Pending_Approval').length;

  return (
    <div className="min-h-screen bg-[#121212] font-sans text-zinc-100 flex flex-col">
      
      {/* Admin Header */}
      <header className="bg-black border-b border-zinc-800 sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-[#00e676]" size={24} />
            <span className="font-bold text-lg tracking-tight">SA Control Center</span>
            <span className="text-[10px] font-mono bg-zinc-800 px-2 py-0.5 rounded text-zinc-400 border border-zinc-700">{user.email}</span>
          </div>
          <button onClick={handleLogout} className="text-zinc-400 hover:text-red-400 transition-colors flex items-center gap-2 text-sm font-medium">
            <LogOut size={16} /> <span className="hidden sm:inline">Terminate Session</span>
          </button>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="flex-1 max-w-[1400px] mx-auto w-full px-4 sm:px-6 py-8">
        
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#1a1a1a] border border-zinc-800 p-5 rounded-lg flex items-center justify-between shadow-lg">
            <div>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Total Requests</p>
              <h3 className="text-3xl font-black text-white">{payments.length}</h3>
            </div>
            <FileText size={32} className="text-zinc-600" />
          </div>
          <div className="bg-[#b388ff]/10 border border-[#b388ff]/30 p-5 rounded-lg flex items-center justify-between shadow-lg">
            <div>
              <p className="text-xs font-bold text-[#b388ff]/70 uppercase tracking-widest mb-1">Action Required</p>
              <h3 className="text-3xl font-black text-[#b388ff]">{pendingCount}</h3>
            </div>
            <Clock size={32} className="text-[#b388ff]/50" />
          </div>
          <div className="bg-[#00e676]/10 border border-[#00e676]/30 p-5 rounded-lg flex items-center justify-between shadow-lg">
            <div>
              <p className="text-xs font-bold text-[#00e676]/70 uppercase tracking-widest mb-1">Total Value Captured</p>
              <h3 className="text-3xl font-black text-[#00e676]">
                ₹{payments.filter(p => p.status === 'Approved').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0).toLocaleString('en-IN')}
              </h3>
            </div>
            <IndianRupee size={32} className="text-[#00e676]/50" />
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-xl font-bold text-white">Payment Verification Queue</h2>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
            <input 
              type="text" 
              placeholder="Search email or PayU Txn ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#29b6f6] focus:ring-1 focus:ring-[#29b6f6]"
            />
          </div>
        </div>

        {/* Data Table */}
        {error ? (
          <div className="bg-red-900/20 border border-red-900/50 p-4 rounded-lg flex items-center gap-3 text-red-200">
            <AlertCircle size={20} className="shrink-0" /> {error}
          </div>
        ) : isLoading ? (
          <div className="h-48 flex items-center justify-center bg-[#1a1a1a] border border-zinc-800 rounded-xl">
            <Loader2 className="animate-spin text-zinc-500" size={32} />
          </div>
        ) : (
          <div className="bg-[#1a1a1a] border border-zinc-800 rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-[#242424] text-[11px] uppercase tracking-wider text-zinc-400 border-b border-zinc-800">
                    <th className="p-4 font-semibold">Submitted</th>
                    <th className="p-4 font-semibold">User Details</th>
                    <th className="p-4 font-semibold">Plan Target</th>
                    <th className="p-4 font-semibold">PayU Txn ID / UTR</th>
                    <th className="p-4 font-semibold text-center">Status</th>
                    <th className="p-4 font-semibold text-right">Verification Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-zinc-500 text-sm">No transactions found in database.</td>
                    </tr>
                  ) : filteredPayments.map((payment) => {
                    
                    // Format Date
                    let dateStr = "Unknown";
                    if (payment.submittedAt?.toDate) {
                      dateStr = payment.submittedAt.toDate().toLocaleString('en-IN', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                      });
                    }

                    // Dynamic Status Colors & Labels
                    let statusBadge = "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
                    let displayStatus = payment.status;
                    
                    if (payment.status === 'Approved') {
                      statusBadge = "bg-[#00e676]/10 text-[#00e676] border-[#00e676]/20";
                    } else if (payment.status === 'Denied') {
                      statusBadge = "bg-red-500/10 text-red-500 border-red-500/20";
                    } else if (payment.status === 'Paid_Pending_Approval') {
                      statusBadge = "bg-[#005ea2]/10 text-[#005ea2] border-[#005ea2]/30";
                      displayStatus = "PayU Verified";
                    }

                    const displayTxId = payment.payuTransactionId || payment.utrNumber || 'N/A';

                    return (
                      <tr key={payment.id} className="hover:bg-[#242424] transition-colors">
                        <td className="p-4 text-xs font-mono text-zinc-400">{dateStr}</td>
                        <td className="p-4">
                          <div className="font-bold text-white text-sm">{payment.fullName}</div>
                          <div className="text-[11px] text-zinc-500 font-mono mt-0.5">{payment.email}</div>
                          <div className="text-[11px] text-zinc-500 font-mono">{payment.phone}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm text-zinc-300 font-bold">{payment.planName}</div>
                          <div className="text-xs text-zinc-500 font-mono">₹{payment.amount}</div>
                        </td>
                        <td className="p-4">
                          <div className="bg-zinc-900 border border-zinc-800 px-2 py-1 rounded inline-block font-mono text-sm font-bold tracking-wider text-white">
                            {displayTxId}
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded border ${statusBadge}`}>
                            {displayStatus}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {(payment.status === 'Pending' || payment.status === 'Paid_Pending_Approval') ? (
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => handleDeny(payment)}
                                disabled={actionLoading === payment.id}
                                className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 p-2 rounded transition-colors disabled:opacity-50"
                                title="Deny Transaction"
                              >
                                {actionLoading === payment.id ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                              </button>
                              <button 
                                onClick={() => handleApprove(payment)}
                                disabled={actionLoading === payment.id}
                                className="bg-[#00e676]/10 hover:bg-[#00e676]/20 text-[#00e676] border border-[#00e676]/30 px-4 py-2 rounded text-sm font-bold flex items-center gap-2 transition-colors disabled:opacity-50 shadow-sm"
                              >
                                {actionLoading === payment.id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                                APPROVE
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-zinc-600 font-mono uppercase">Processed</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}