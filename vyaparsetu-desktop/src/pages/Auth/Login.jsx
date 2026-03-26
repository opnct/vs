import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LogIn, Loader2 } from 'lucide-react';
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
      // On success, App.jsx's onAuthStateChanged will naturally pick up the session and reroute
      navigate('/');
    } catch (err) {
      console.error(err);
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center p-6 font-sans text-white">
      <div className="w-full max-w-md bg-[#252525] rounded-3xl p-8 shadow-2xl border border-white/5 relative overflow-hidden">
        
        {/* macOS style window dots decoration */}
        <div className="absolute top-4 left-4 flex gap-2">
          <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
          <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
          <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
        </div>

        <div className="mt-8 mb-8 text-center">
          <div className="w-16 h-16 bg-[#252525] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10 shadow-sm">
            <span className="text-2xl font-black text-white tracking-tighter">VS</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome Back</h1>
          <p className="text-[#A1A1AA] text-sm">Log in to your Kirana dashboard.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm mb-6 text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A1A1AA]" size={20} />
            <input 
              required type="email" name="email" value={formData.email} onChange={handleChange}
              placeholder="Email Address" 
              className="w-full bg-[#1A1A1A] text-white pl-12 pr-4 py-4 rounded-2xl border border-white/10 focus:outline-none focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF] transition-all placeholder:text-[#666666]"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A1A1AA]" size={20} />
            <input 
              required type="password" name="password" value={formData.password} onChange={handleChange}
              placeholder="Password" 
              className="w-full bg-[#1A1A1A] text-white pl-12 pr-4 py-4 rounded-2xl border border-white/10 focus:outline-none focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF] transition-all placeholder:text-[#666666]"
            />
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full bg-[#007AFF] hover:bg-[#0066D6] text-white font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors disabled:opacity-70 mt-2"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <><LogIn size={20} /> Access POS</>}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-[#A1A1AA]">
          New shop owner? <Link to="/signup" className="text-[#007AFF] hover:text-white transition-colors font-medium">Create an account</Link>
        </p>
      </div>
    </div>
  );
}