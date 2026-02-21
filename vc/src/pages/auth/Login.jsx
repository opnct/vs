import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, ArrowRight, Loader2, AlertCircle, ArrowLeft, Activity } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { initiateLogin } = useAuth();
  const navigate = useNavigate();
  const inputRef = useRef(null);

  // Auto-focus the input field on mount for better UX
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Standard Real-World Email Regex Validation
  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedEmail = email.trim();

    // 1. Check if empty
    if (!trimmedEmail) {
      setError('Email address is required to proceed.');
      return;
    }

    // 2. Validate format
    if (!validateEmail(trimmedEmail)) {
      setError('Invalid format. Please enter a valid business email address.');
      return;
    }

    // 3. Check network connectivity
    if (!navigator.onLine) {
      setError('Network offline. Please check your internet connection.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // 4. Execute Real Auth Context Logic (Triggers EmailJS OTP)
      await initiateLogin(trimmedEmail);
      navigate('/verify-otp');
    } catch (err) {
      setError(err.message || 'Failed to dispatch secure code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 text-white font-sans relative overflow-hidden">
      
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#005ea2]/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-[#111] p-8 md:p-10 rounded-3xl border border-white/10 shadow-2xl relative z-10">
        
        {/* Navigation & Status Header */}
        <div className="flex justify-between items-start mb-10">
          <Link to="/" className="text-zinc-500 hover:text-white transition-colors p-2 -ml-2 rounded-lg hover:bg-white/5">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
            <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">Auth_Online</span>
          </div>
        </div>

        {/* Branding & Titles */}
        <div className="w-14 h-14 bg-[#005ea2] rounded-2xl flex items-center justify-center font-black italic text-2xl mb-8 shadow-[0_0_30px_rgba(0,94,162,0.4)] border border-[#0077cc]">
          VS
        </div>
        <h1 className="text-3xl font-black uppercase tracking-tighter mb-3 leading-tight">Command Center <br/> Login</h1>
        <p className="text-zinc-400 text-sm mb-8 font-medium leading-relaxed">
          Enter your registered retail email. We will dispatch a 6-digit cryptographic code to verify your identity.
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
          <div className="space-y-2">
            <label htmlFor="emailInput" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 pl-1">
              Retailer Email Address
            </label>
            <div className="relative group">
              <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${error ? 'text-red-500' : 'text-zinc-500 group-focus-within:text-[#005ea2]'}`} size={18} />
              <input
                id="emailInput"
                ref={inputRef}
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(''); // Clear error on typing
                }}
                placeholder="retailer@vyapar.com"
                className={`w-full bg-[#1a1a1a] border rounded-xl py-4 pl-12 pr-4 text-white text-sm focus:outline-none transition-all ${
                  error ? 'border-red-500/50 focus:border-red-500' : 'border-white/5 focus:border-[#005ea2] focus:bg-[#111]'
                }`}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !email.trim()}
            className={`w-full font-black uppercase tracking-[0.2em] py-4 rounded-xl transition-all flex items-center justify-center gap-3 text-xs
              ${isLoading || !email.trim() 
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-transparent' 
                : 'bg-[#005ea2] hover:bg-[#004a80] text-white shadow-lg shadow-blue-900/30 border border-[#0077cc] hover:scale-[0.98] active:scale-95'
              }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={18} /> 
                <span>Generating Code...</span>
              </>
            ) : (
              <>
                <span>Send Access Code</span> 
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Footer Meta */}
        <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-center gap-2 text-zinc-600 text-[10px] font-bold uppercase tracking-widest">
          <Activity size={12} />
          Secured via EmailJS Protocol
        </div>
      </div>
    </div>
  );
}