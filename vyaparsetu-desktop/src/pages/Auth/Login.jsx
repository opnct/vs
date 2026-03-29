import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Mail, Lock, LogIn, Loader2, 
  MonitorOff, ChevronRight, ShieldCheck 
} from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      localStorage.removeItem('vs_offline_mode');
      navigate('/');
    } catch (err) {
      console.error(err);
      setError("The credentials provided do not match our records.");
    } finally {
      setLoading(false);
    }
  };

  const handleOfflineMode = () => {
    localStorage.setItem('vs_offline_mode', 'true');
    window.dispatchEvent(new Event('storage'));
    navigate('/');
  };

  // Animation variants for staggered entrance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-8 font-sans text-white selection:bg-[#007AFF]/30">
      
      {/* Decorative Background Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-[#007AFF]/5 blur-[120px] rounded-full pointer-events-none"></div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-[480px] z-10"
      >
        {/* Header: Oversized Typography */}
        <motion.div variants={itemVariants} className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#1c1c1e] rounded-[1.5rem] border border-white/5 shadow-2xl mb-8">
            <ShieldCheck size={32} className="text-[#007AFF]" />
          </div>
          <h1 className="text-5xl font-black tracking-tighter leading-none mb-4">
            Welcome Back
          </h1>
          <p className="text-[#888888] font-medium tracking-wide uppercase text-[11px]">
            Kirana Intelligence & POS Terminal
          </p>
        </motion.div>

        {/* Form Card */}
        <motion.div 
          variants={itemVariants}
          className="bg-[#1c1c1e] rounded-[2.5rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5 relative overflow-hidden"
        >
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#f87171]/10 border border-[#f87171]/20 text-[#f87171] p-4 rounded-2xl text-xs font-bold mb-8 text-center uppercase tracking-widest"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#666] uppercase tracking-[0.2em] ml-1">Email Identifier</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-[#444] group-focus-within:text-[#007AFF] transition-colors" size={18} />
                <input 
                  required type="email" name="email" value={formData.email} onChange={handleChange}
                  placeholder="name@business.com" 
                  className="w-full bg-[#0a0a0a] text-white pl-14 pr-6 py-5 rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#007AFF]/50 transition-all placeholder:text-[#333] font-bold text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#666] uppercase tracking-[0.2em] ml-1">Security Key</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-[#444] group-focus-within:text-[#007AFF] transition-colors" size={18} />
                <input 
                  required type="password" name="password" value={formData.password} onChange={handleChange}
                  placeholder="••••••••" 
                  className="w-full bg-[#0a0a0a] text-white pl-14 pr-6 py-5 rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#007AFF]/50 transition-all placeholder:text-[#333] font-bold text-sm"
                />
              </div>
            </div>

            <button 
              type="submit" disabled={loading}
              className="w-full bg-[#007AFF] hover:bg-[#0084FF] text-white font-black py-5 rounded-[1.5rem] flex items-center justify-center gap-3 transition-all disabled:opacity-50 mt-4 shadow-[0_10px_30px_-10px_rgba(0,122,255,0.5)] active:scale-[0.98] uppercase tracking-widest text-xs"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : <><LogIn size={18} /> Enter Dashboard</>}
            </button>
          </form>

          {/* Local Mode Trigger */}
          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-[9px] uppercase font-black tracking-[0.3em]">
              <span className="bg-[#1c1c1e] px-4 text-[#444]">Or Bypass Cloud</span>
            </div>
          </div>

          <button 
            onClick={handleOfflineMode}
            className="w-full bg-[#0a0a0a] hover:bg-[#252525] border border-white/5 text-[#888888] hover:text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 group"
          >
            <MonitorOff size={18} className="text-[#FFBD2E]" />
            <span className="text-xs uppercase tracking-widest">Offline Access</span>
            <ChevronRight size={14} className="text-[#333] group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>

        {/* Footer Navigation */}
        <motion.p variants={itemVariants} className="mt-10 text-center text-[13px] font-medium text-[#555] tracking-wide">
          Don't have a commercial license? <Link to="/signup" className="text-[#007AFF] hover:text-white transition-colors font-black">Register Shop</Link>
        </motion.p>
      </motion.div>

      {/* Version Tag */}
      <div className="fixed bottom-8 right-8 text-[10px] font-black text-[#222] uppercase tracking-[0.5em]">
        VyaparSetu v2.5.0
      </div>
    </div>
  );
}