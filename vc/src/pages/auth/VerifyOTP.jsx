import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, ArrowRight, Loader2, AlertCircle, ArrowLeft, Activity, Lock } from 'lucide-react';

export default function VerifyOTP() {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { verifyOTP, tempEmail } = useAuth();
  const navigate = useNavigate();
  const inputRef = useRef(null);

  // Strictly protect the route and auto-focus input
  useEffect(() => {
    if (!tempEmail) {
      navigate('/login', { replace: true });
    } else if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [tempEmail, navigate]);

  const handleOtpChange = (e) => {
    // Strip all non-numeric characters instantly
    const val = e.target.value.replace(/\D/g, '');
    if (val.length <= 6) {
      setOtp(val);
      if (error) setError(''); // Clear error state on new input
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Pre-flight validation
    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit cryptographic code.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Execute strict memory validation
      verifyOTP(otp);
      // Replace history to prevent user from navigating back to OTP screen
      navigate('/chatbot', { replace: true });
    } catch (err) {
      setError(err.message || 'Verification failed. Please check the code and try again.');
      setOtp(''); // Auto-clear invalid code for better UX
      if (inputRef.current) inputRef.current.focus();
    } finally {
      setIsLoading(false);
    }
  };

  // Prevent UI flash if redirecting
  if (!tempEmail) return null; 

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 text-white font-sans relative overflow-hidden">
      
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-green-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-[#111] p-8 md:p-10 rounded-3xl border border-white/10 shadow-2xl relative z-10">
        
        {/* Navigation & Status Header */}
        <div className="flex justify-between items-start mb-10">
          <Link to="/login" className="text-zinc-500 hover:text-white transition-colors p-2 -ml-2 rounded-lg hover:bg-white/5" title="Back to Login">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
            <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"></span>
            <span className="text-[9px] font-black text-yellow-500 uppercase tracking-widest">Auth_Pending</span>
          </div>
        </div>

        {/* Branding & Titles */}
        <div className="w-14 h-14 bg-green-500/10 border border-green-500/20 text-green-500 rounded-2xl flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(34,197,94,0.15)]">
          <ShieldCheck size={28} strokeWidth={2.5} />
        </div>
        <h1 className="text-3xl font-black uppercase tracking-tighter mb-3 leading-tight">Verify <br/> Identity</h1>
        <p className="text-zinc-400 text-sm mb-8 font-medium leading-relaxed">
          A secure access code has been dispatched to <br/>
          <span className="text-white font-bold tracking-wide">{tempEmail}</span>
        </p>

        {/* Error State Display */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold uppercase tracking-widest rounded-xl mb-6 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Form Logic */}
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="space-y-2 relative">
            <label htmlFor="otpInput" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 pl-1 flex items-center gap-2">
              <Lock size={10} /> 6-Digit Verification Code
            </label>
            <input
              id="otpInput"
              ref={inputRef}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="one-time-code"
              maxLength="6"
              value={otp}
              onChange={handleOtpChange}
              placeholder="• • • • • •"
              className={`w-full bg-[#1a1a1a] border rounded-xl py-5 px-4 text-center text-4xl tracking-[0.7em] font-mono font-bold text-white focus:outline-none transition-all placeholder:text-zinc-700 placeholder:font-sans placeholder:tracking-widest ${
                error ? 'border-red-500/50 focus:border-red-500' : 'border-white/5 focus:border-green-500/50 focus:bg-[#111]'
              }`}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || otp.length !== 6}
            className={`w-full font-black uppercase tracking-[0.2em] py-4 rounded-xl transition-all flex items-center justify-center gap-3 text-xs
              ${isLoading || otp.length !== 6 
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-transparent' 
                : 'bg-white text-black shadow-lg shadow-white/20 hover:bg-zinc-200 hover:scale-[0.98] active:scale-95'
              }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={18} /> 
                <span>Verifying Hash...</span>
              </>
            ) : (
              <>
                <span>Connect Node</span> 
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Footer Meta */}
        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col items-center justify-center gap-3">
          <div className="flex items-center justify-center gap-2 text-zinc-600 text-[10px] font-bold uppercase tracking-widest">
            <Activity size={12} />
            Encrypted Session
          </div>
          <p className="text-[10px] text-zinc-500 font-medium">
            Code expires in 5 minutes
          </p>
        </div>
      </div>
    </div>
  );
}