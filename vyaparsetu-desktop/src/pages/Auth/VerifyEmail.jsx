import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, MonitorOff } from 'lucide-react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import PremiumInput from '../../components/ui/PremiumInput';
import PremiumButton from '../../components/ui/PremiumButton';

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

  const handleOfflineMode = () => {
    localStorage.setItem('vs_offline_mode', 'true');
    window.dispatchEvent(new Event('storage'));
    navigate('/');
  };

  if (!state) return null;

  return (
    <div className="min-h-screen bg-white font-sans text-brand-text flex flex-col selection:bg-brand-blue/30">
      
      {/* Top Black Banner */}
      <div className="h-16 bg-brand-black flex items-center px-8 w-full shrink-0">
        <h1 className="text-white text-2xl font-bold tracking-tight">
          VyaparSetu Verification Portal
        </h1>
      </div>

      {/* Floating Feedback Tab (Left Edge) */}
      <div className="fixed left-0 top-1/3 bg-[#4279a6] text-white text-xs font-bold py-3 px-2 rounded-r-md cursor-pointer hover:bg-[#326086] transition-colors z-50 shadow-md flex items-center justify-center" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
        Feedback
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full max-w-[1100px] mx-auto py-12 px-8 flex flex-col lg:flex-row gap-16 animate-in fade-in duration-500">
        
        {/* Left Column: Form Section */}
        <div className="flex-1">
          <div className="border-b border-gray-200 pb-4 mb-8">
            <h2 className="text-2xl font-light text-[#2c3e50]">
              Identity Verification <span className="text-brand-muted text-lg ml-2">| {step === 1 ? 'Step 1 of 2' : 'Final Step'}</span>
            </h2>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 text-status-red p-4 rounded-md text-sm font-semibold mb-6 border border-red-200"
            >
              {error}
            </motion.div>
          )}

          <div className="relative min-h-[300px]">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="otp-step"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6 absolute top-0 left-0 w-full"
                >
                  <p className="text-sm font-semibold text-brand-muted mb-4">
                    A 6-digit security passcode has been dispatched to: <br/>
                    <span className="text-brand-text font-bold">{state.email}</span>
                  </p>

                  <form onSubmit={handleVerifyOtp} className="space-y-6">
                    <PremiumInput
                      label="6-Digit Passcode:"
                      required={true}
                      value={enteredOtp}
                      onChange={(val) => setEnteredOtp(val)}
                      placeholder="••••••"
                      className="text-center text-2xl tracking-[0.5em] font-black"
                    />

                    <div className="pt-4 flex items-center gap-6">
                      <PremiumButton 
                        type="submit" 
                        variant="primary" 
                        className="px-10 rounded-sm"
                      >
                        AUTHENTICATE
                      </PremiumButton>

                      <button 
                        type="button" 
                        onClick={() => navigate('/signup')}
                        className="flex items-center gap-1 text-sm font-semibold text-brand-muted hover:text-brand-text transition-colors px-4 py-2"
                      >
                        <ChevronLeft size={16} /> Incorrect Email?
                      </button>
                    </div>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="password-step"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6 absolute top-0 left-0 w-full"
                >
                  <p className="text-sm font-semibold text-brand-muted mb-4">
                    Identity verified. Please establish your shop administrator password to secure your local vault.
                  </p>

                  <form onSubmit={handleCreateAccount} className="space-y-6">
                    <PremiumInput
                      label="Administrator Password:"
                      type="password"
                      required={true}
                      value={password}
                      onChange={(val) => setPassword(val)}
                      placeholder="••••••••"
                    />

                    <div className="pt-4 flex items-center gap-6">
                      <PremiumButton 
                        type="submit" 
                        variant="success" 
                        isLoading={loading}
                        className="px-10 rounded-sm"
                      >
                        COMPLETE SETUP
                      </PremiumButton>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer & Offline Mode */}
          <div className="mt-[320px] pt-6 border-t border-gray-100 flex flex-col gap-4">
            <span className="text-sm text-brand-muted">
              Already registered? <Link to="/login" className="text-brand-blue font-semibold hover:underline">Login to Terminal</Link>
            </span>
            <button 
              onClick={handleOfflineMode}
              className="flex items-center gap-2 text-sm text-brand-muted hover:text-brand-text transition-colors self-start"
            >
              <MonitorOff size={16} /> Bypass to Offline Mode
            </button>
          </div>
        </div>

        {/* Right Column: Security Protocols Card */}
        <div className="w-full lg:w-[420px] shrink-0">
          <div className="bg-brand-surface border border-brand-border rounded-md p-8 shadow-sm h-full">
            
            <div className="flex items-center gap-2 mb-8 text-sm font-semibold text-[#2c3e50]">
              <span className="text-status-red text-xl leading-none">•</span> Required field
            </div>

            <div className="space-y-8">
              <div>
                <h3 className="text-base font-bold text-[#2c3e50] mb-4">Security Protocols:</h3>
                <ul className="space-y-3 text-sm text-[#4a5568] list-disc pl-5 marker:text-gray-400">
                  <li className="pl-1">All fields must exactly match your registration profile.</li>
                  <li className="pl-1">Passwords are case-sensitive.</li>
                  <li className="pl-1">System will temporarily lock out after 5 consecutive failed attempts.</li>
                  <li className="pl-1">Do not share your credentials with unauthorized personnel.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-base font-bold text-[#2c3e50] mb-4">Troubleshooting:</h3>
                <ul className="space-y-3 text-sm text-[#4a5568] list-disc pl-5 marker:text-gray-400">
                  <li className="pl-1">Ensure caps lock is disabled.</li>
                  <li className="pl-1">Clear your browser cache if you experience infinite loading.</li>
                  <li className="pl-1">Use the Feedback tab for technical assistance.</li>
                </ul>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}