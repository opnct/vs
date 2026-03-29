import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, Lock, KeyRound, Loader2, 
  Mail, ShieldCheck, ArrowRight, ChevronLeft 
} from 'lucide-react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';

export default function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state; // Contains email, shopName, phone, expectedOtp

  const [step, setStep] = useState(1); // 1: OTP, 2: Set Password
  const [enteredOtp, setEnteredOtp] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Security redirect if state is missing
  useEffect(() => {
    if (!state || !state.email || !state.expectedOtp) {
      navigate('/signup');
    }
  }, [state, navigate]);

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (enteredOtp === state.expectedOtp) {
      setStep(2);
      setError('');
    } else {
      setError('Invalid OTP code. Security verification failed.');
    }
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Security key must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Create Firebase Auth User
      const userCredential = await createUserWithEmailAndPassword(auth, state.email, password);
      const user = userCredential.user;

      // 2. Initialize Firestore Shop Profile
      await setDoc(doc(db, "shops", user.uid), {
        shopName: state.shopName,
        email: state.email,
        phone: state.phone,
        ownerUid: user.uid,
        createdAt: new Date().toISOString(),
        subscription: 'active',
        role: 'owner'
      });

      navigate('/');
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to establish secure session.");
    } finally {
      setLoading(false);
    }
  };

  if (!state) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-8 font-sans text-white selection:bg-[#007AFF]/30">
      
      {/* Decorative Background Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-[#007AFF]/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-[480px] z-10">
        
        {/* Header Section with Custom Illustration */}
        <div className="mb-12 text-center">
          <div className="relative inline-flex items-center justify-center mb-8">
            {/* Pulsing Blue Ring Animation */}
            <motion.div 
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="absolute inset-0 bg-[#007AFF]/20 rounded-full blur-xl"
            ></motion.div>
            
            <div className="relative w-24 h-24 rounded-[2rem] bg-[#1c1c1e] border border-white/5 shadow-2xl flex items-center justify-center">
              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.div
                    key="mail-icon"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                  >
                    <Mail size={40} className="text-[#007AFF]" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="shield-icon"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                  >
                    <ShieldCheck size={40} className="text-[#4ade80]" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <h1 className="text-5xl font-black tracking-tighter leading-none mb-4">
            {step === 1 ? 'Verify Identity' : 'Secure Vault'}
          </h1>
          <p className="text-[#888888] font-medium tracking-wide uppercase text-[11px]">
            {step === 1 ? `Sent to ${state.email}` : 'Establish shop administrator password'}
          </p>
        </div>

        {/* Action Card */}
        <div className="bg-[#1c1c1e] rounded-[2.5rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5 relative overflow-hidden">
          
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#f87171]/10 border border-[#f87171]/20 text-[#f87171] p-4 rounded-2xl text-xs font-bold mb-8 text-center uppercase tracking-widest"
            >
              {error}
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="otp-step"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <form onSubmit={handleVerifyOtp} className="space-y-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-[#666] uppercase tracking-[0.2em] text-center block w-full">Enter 6-Digit Passcode</label>
                    <input 
                      required autoFocus type="text" maxLength="6"
                      value={enteredOtp} onChange={(e) => setEnteredOtp(e.target.value)}
                      placeholder="••••••" 
                      className="w-full bg-[#0a0a0a] text-white text-center text-4xl font-black tracking-[0.5em] py-6 rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#007AFF]/50 transition-all placeholder:text-[#222]"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-[#007AFF] hover:bg-[#0084FF] text-white font-black py-5 rounded-[1.5rem] flex items-center justify-center gap-3 transition-all shadow-[0_10px_30px_-10px_rgba(0,122,255,0.5)] active:scale-[0.98] uppercase tracking-widest text-xs"
                  >
                    Authenticate Terminal <ArrowRight size={18} />
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="password-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <form onSubmit={handleCreateAccount} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#666] uppercase tracking-[0.2em] ml-1">Administrator Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-[#444] group-focus-within:text-[#4ade80] transition-colors" size={18} />
                      <input 
                        required autoFocus type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••" 
                        className="w-full bg-[#0a0a0a] text-white pl-14 pr-6 py-5 rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#4ade80]/50 transition-all placeholder:text-[#333] font-bold text-sm"
                      />
                    </div>
                  </div>
                  <button 
                    type="submit" disabled={loading}
                    className="w-full bg-[#4ade80] hover:bg-[#22c55e] text-[#052e16] font-black py-5 rounded-[1.5rem] flex items-center justify-center gap-3 transition-all disabled:opacity-50 mt-4 shadow-[0_10px_30px_-10px_rgba(74,222,128,0.5)] active:scale-[0.98] uppercase tracking-widest text-xs"
                  >
                    {loading ? <Loader2 size={20} className="animate-spin" /> : "Complete Shop License Setup"}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Navigation */}
        <div className="mt-10 text-center">
          <button 
            onClick={() => navigate('/signup')}
            className="flex items-center justify-center gap-2 mx-auto text-[13px] font-bold text-[#555] hover:text-white transition-colors"
          >
            <ChevronLeft size={16} /> Incorrect details? Restart registration
          </button>
        </div>
      </div>

      {/* Version Tag */}
      <div className="fixed bottom-8 right-8 text-[10px] font-black text-[#222] uppercase tracking-[0.5em]">
        SECURE CHANNEL v2.5.0
      </div>
    </div>
  );
}