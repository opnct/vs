import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';

export default function VerifyOTP() {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { verifyOTP, tempEmail } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!tempEmail) navigate('/login');
  }, [tempEmail, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      verifyOTP(otp);
      navigate('/chatbot');
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 text-white font-sans">
      <div className="w-full max-w-md bg-[#111] p-8 rounded-3xl border border-white/5 shadow-2xl">
        <div className="w-12 h-12 bg-green-500/10 border border-green-500/20 text-green-500 rounded-xl flex items-center justify-center mb-8">
          <ShieldCheck size={24} />
        </div>
        <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">Verify Identity</h1>
        <p className="text-zinc-500 text-sm mb-8 font-medium">Code sent to <span className="text-white font-bold">{tempEmail}</span></p>

        {error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold uppercase tracking-widest rounded-xl mb-6">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            maxLength="6"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            placeholder="• • • • • •"
            className="w-full bg-[#1a1a1a] border border-white/5 rounded-xl py-4 px-4 text-center text-3xl tracking-[1em] font-mono text-white focus:outline-none focus:border-[#005ea2] transition-colors"
            required
          />
          <button
            type="submit"
            disabled={isLoading || otp.length !== 6}
            className="w-full bg-white hover:bg-zinc-200 text-black font-black uppercase tracking-[0.2em] py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : <>Verify & Connect <ArrowRight size={18} /></>}
          </button>
        </form>
      </div>
    </div>
  );
}
