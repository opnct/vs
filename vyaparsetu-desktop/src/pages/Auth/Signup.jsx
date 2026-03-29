import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Store, Mail, Phone, ArrowRight, Loader2, 
  MonitorOff, ChevronRight, User, ShieldCheck,
  ChevronLeft
} from 'lucide-react';
import { generateOTP, sendOTP } from '../../emailjs.config';

export default function Signup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Business, 2: Owner
  const [formData, setFormData] = useState({ shopName: '', email: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const nextStep = () => {
    if (step === 1 && formData.shopName) setStep(2);
    else if (step === 1) setError("Please enter your Shop Name to continue.");
  };

  const prevStep = () => {
    setError("");
    setStep(1);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.shopName || !formData.email || !formData.phone) {
      setError("All fields are required to secure your license.");
      setLoading(false);
      return;
    }

    try {
      const otpCode = generateOTP();
      const result = await sendOTP(formData.email, formData.shopName, otpCode);

      if (result.success) {
        localStorage.removeItem('vs_offline_mode');
        navigate('/verify-email', { state: { ...formData, expectedOtp: otpCode } });
      } else {
        setError("Network encryption failed. Please verify your connection.");
      }
    } catch (err) {
      setError("An unexpected authentication error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleOfflineMode = () => {
    localStorage.setItem('vs_offline_mode', 'true');
    window.dispatchEvent(new Event('storage'));
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-8 font-sans text-white selection:bg-[#007AFF]/30">
      
      {/* Decorative Background Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-[#007AFF]/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-[480px] z-10">
        
        {/* Header Section */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#1c1c1e] rounded-[1.5rem] border border-white/5 shadow-2xl mb-8">
            <ShieldCheck size={32} className="text-[#007AFF]" />
          </div>
          <h1 className="text-5xl font-black tracking-tighter leading-none mb-4">
            Register Shop
          </h1>
          <p className="text-[#888888] font-medium tracking-wide uppercase text-[11px]">
            Step {step} of 2: {step === 1 ? 'Establishment Profile' : 'Identity Verification'}
          </p>
        </div>

        {/* Multi-Step Card */}
        <div className="bg-[#1c1c1e] rounded-[2.5rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5 relative overflow-hidden">
          
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#f87171]/10 border border-[#f87171]/20 text-[#f87171] p-4 rounded-2xl text-xs font-bold mb-8 text-center uppercase tracking-widest"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSignup}>
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#666] uppercase tracking-[0.2em] ml-1">Business Name</label>
                    <div className="relative group">
                      <Store className="absolute left-5 top-1/2 -translate-y-1/2 text-[#444] group-focus-within:text-[#007AFF] transition-colors" size={18} />
                      <input 
                        required autoFocus type="text" name="shopName" value={formData.shopName} onChange={handleChange}
                        placeholder="e.g. Metro Mart" 
                        className="w-full bg-[#0a0a0a] text-white pl-14 pr-6 py-5 rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#007AFF]/50 transition-all placeholder:text-[#333] font-bold text-sm"
                      />
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={nextStep}
                    className="w-full bg-[#007AFF] hover:bg-[#0084FF] text-white font-black py-5 rounded-[1.5rem] flex items-center justify-center gap-3 transition-all mt-4 shadow-[0_10px_30px_-10px_rgba(0,122,255,0.5)] active:scale-[0.98] uppercase tracking-widest text-xs"
                  >
                    Setup Owner Details <ArrowRight size={18} />
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="space-y-6"
                >
                  <button 
                    type="button" onClick={prevStep}
                    className="flex items-center gap-2 text-[10px] font-black text-[#555] hover:text-[#888] uppercase tracking-widest transition-colors mb-2"
                  >
                    <ChevronLeft size={14} /> Back to business
                  </button>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#666] uppercase tracking-[0.2em] ml-1">Official Email</label>
                    <div className="relative group">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-[#444] group-focus-within:text-[#007AFF] transition-colors" size={18} />
                      <input 
                        required autoFocus type="email" name="email" value={formData.email} onChange={handleChange}
                        placeholder="owner@business.com" 
                        className="w-full bg-[#0a0a0a] text-white pl-14 pr-6 py-5 rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#007AFF]/50 transition-all placeholder:text-[#333] font-bold text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#666] uppercase tracking-[0.2em] ml-1">Contact Phone</label>
                    <div className="relative group">
                      <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-[#444] group-focus-within:text-[#007AFF] transition-colors" size={18} />
                      <input 
                        required type="tel" name="phone" value={formData.phone} onChange={handleChange}
                        placeholder="+91 00000 00000" 
                        className="w-full bg-[#0a0a0a] text-white pl-14 pr-6 py-5 rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#007AFF]/50 transition-all placeholder:text-[#333] font-bold text-sm"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" disabled={loading}
                    className="w-full bg-[#007AFF] hover:bg-[#0084FF] text-white font-black py-5 rounded-[1.5rem] flex items-center justify-center gap-3 transition-all disabled:opacity-50 mt-4 shadow-[0_10px_30px_-10px_rgba(0,122,255,0.5)] active:scale-[0.98] uppercase tracking-widest text-xs"
                  >
                    {loading ? <Loader2 size={20} className="animate-spin" /> : <><ShieldCheck size={18} /> Generate OTP</>}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          {/* Local Mode Trigger */}
          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-[9px] uppercase font-black tracking-[0.3em]">
              <span className="bg-[#1c1c1e] px-4 text-[#444]">Or Bypass Setup</span>
            </div>
          </div>

          <button 
            onClick={handleOfflineMode}
            className="w-full bg-[#0a0a0a] hover:bg-[#252525] border border-white/5 text-[#888888] hover:text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 group"
          >
            <MonitorOff size={18} className="text-[#FFBD2E]" />
            <span className="text-xs uppercase tracking-widest">Offline Mode</span>
            <ChevronRight size={14} className="text-[#333] group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Footer Navigation */}
        <p className="mt-10 text-center text-[13px] font-medium text-[#555] tracking-wide">
          Already registered? <Link to="/login" className="text-[#007AFF] hover:text-white transition-colors font-black">Login to Terminal</Link>
        </p>
      </div>

      {/* Version Tag */}
      <div className="fixed bottom-8 right-8 text-[10px] font-black text-[#222] uppercase tracking-[0.5em]">
        VyaparSetu v2.5.0
      </div>
    </div>
  );
}