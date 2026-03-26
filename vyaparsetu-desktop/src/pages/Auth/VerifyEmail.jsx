import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, Lock, KeyRound, Loader2 } from 'lucide-react';
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

  // Security redirect if user lands here directly without submitting the signup form
  useEffect(() => {
    if (!state || !state.email || !state.expectedOtp) {
      navigate('/signup');
    }
  }, [state, navigate]);

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (enteredOtp === state.expectedOtp) {
      setStep(2); // Move to password creation
      setError('');
    } else {
      setError('Invalid OTP code. Please try again.');
    }
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Create Firebase Auth User
      const userCredential = await createUserWithEmailAndPassword(auth, state.email, password);
      const user = userCredential.user;

      // 2. Initialize Firestore Shop Profile strictly using the Owner's UID
      await setDoc(doc(db, "shops", user.uid), {
        shopName: state.shopName,
        email: state.email,
        phone: state.phone,
        ownerUid: user.uid,
        createdAt: new Date().toISOString(),
        subscription: 'active',
        role: 'owner'
      });

      // 3. Success! Redirect to POS Dashboard
      navigate('/');
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!state) return null;

  return (
    <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center p-6 font-sans text-white">
      <div className="w-full max-w-md bg-[#252525] rounded-3xl p-8 shadow-2xl border border-white/5 relative overflow-hidden">
        
        {/* macOS dots */}
        <div className="absolute top-4 left-4 flex gap-2">
          <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
          <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
          <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
        </div>

        {step === 1 ? (
          // STEP 1: OTP VERIFICATION
          <>
            <div className="mt-8 mb-8 text-center">
              <div className="w-16 h-16 bg-[#007AFF]/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#007AFF]/30">
                <KeyRound size={28} className="text-[#007AFF]" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">Verify Email</h1>
              <p className="text-[#A1A1AA] text-sm">We sent a 6-digit code to <br/><span className="text-white font-medium">{state.email}</span></p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm mb-6 text-center font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <input 
                required type="text" maxLength="6"
                value={enteredOtp} onChange={(e) => setEnteredOtp(e.target.value)}
                placeholder="• • • • • •" 
                className="w-full bg-[#1A1A1A] text-white text-center text-3xl tracking-[1em] py-4 rounded-2xl border border-white/10 focus:outline-none focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF] transition-all"
              />
              <button 
                type="submit"
                className="w-full bg-[#007AFF] hover:bg-[#0066D6] text-white font-semibold py-4 rounded-2xl transition-colors"
              >
                Verify Code
              </button>
            </form>
          </>
        ) : (
          // STEP 2: CREATE PASSWORD
          <>
            <div className="mt-8 mb-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-16 h-16 bg-[#27C93F]/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#27C93F]/30">
                <CheckCircle2 size={28} className="text-[#27C93F]" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">Email Verified!</h1>
              <p className="text-[#A1A1AA] text-sm">Set a secure password for your POS account.</p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm mb-6 text-center font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateAccount} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A1A1AA]" size={20} />
                <input 
                  required type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create Password (Min. 6 chars)" 
                  className="w-full bg-[#1A1A1A] text-white pl-12 pr-4 py-4 rounded-2xl border border-white/10 focus:outline-none focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF] transition-all placeholder:text-[#666666]"
                />
              </div>
              <button 
                type="submit" disabled={loading}
                className="w-full bg-[#007AFF] hover:bg-[#0066D6] text-white font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : "Complete Setup"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}