import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Store, Mail, Phone, ArrowRight, Loader2, MonitorOff, ChevronRight } from 'lucide-react';
import { generateOTP, sendOTP } from '../../emailjs.config';

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ shopName: '', email: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.shopName || !formData.email || !formData.phone) {
      setError("All fields are required.");
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
        setError("Failed to send verification email. Please check your EmailJS setup.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
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
          <h1 className="text-3xl font-bold tracking-tight mb-2">Create Account</h1>
          <p className="text-[#A1A1AA] text-sm">Register your Kirana store to get started.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm mb-6 text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="relative">
            <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A1A1AA]" size={20} />
            <input 
              required type="text" name="shopName" value={formData.shopName} onChange={handleChange}
              placeholder="Shop Name" 
              className="w-full bg-[#1A1A1A] text-white pl-12 pr-4 py-4 rounded-2xl border border-white/10 focus:outline-none focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF] transition-all placeholder:text-[#666666]"
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A1A1AA]" size={20} />
            <input 
              required type="email" name="email" value={formData.email} onChange={handleChange}
              placeholder="Email Address" 
              className="w-full bg-[#1A1A1A] text-white pl-12 pr-4 py-4 rounded-2xl border border-white/10 focus:outline-none focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF] transition-all placeholder:text-[#666666]"
            />
          </div>

          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A1A1AA]" size={20} />
            <input 
              required type="tel" name="phone" value={formData.phone} onChange={handleChange}
              placeholder="Contact Number" 
              className="w-full bg-[#1A1A1A] text-white pl-12 pr-4 py-4 rounded-2xl border border-white/10 focus:outline-none focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF] transition-all placeholder:text-[#666666]"
            />
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full bg-[#007AFF] hover:bg-[#0066D6] text-white font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors disabled:opacity-70 mt-2 shadow-lg shadow-brand-blue/10"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <><ArrowRight size={20} /> Continue</>}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/5"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#252525] px-4 text-[#444] font-bold tracking-widest">Or skip setup</span>
          </div>
        </div>

        <button 
          onClick={handleOfflineMode}
          className="w-full bg-white/5 hover:bg-white/10 border border-white/5 text-white font-medium py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 group"
        >
          <MonitorOff size={18} className="text-status-orange" />
          <span>Offline Mode (No Cloud)</span>
          <ChevronRight size={16} className="text-[#444] group-hover:text-white transition-colors" />
        </button>

        <p className="mt-8 text-center text-sm text-[#A1A1AA]">
          Already have an account? <Link to="/login" className="text-[#007AFF] hover:text-white transition-colors font-medium">Log in</Link>
        </p>
      </div>
    </div>
  );
}