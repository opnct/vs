import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, MonitorOff } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import PremiumInput from '../../components/ui/PremiumInput';
import PremiumButton from '../../components/ui/PremiumButton';

export default function Login() {
  const navigate = useNavigate();
  // Added username to match the UI, though Firebase auth primarily uses email/password
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

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

  return (
    <div className="min-h-screen bg-white font-sans text-brand-text flex flex-col selection:bg-brand-blue/30">
      
      {/* Top Black Banner */}
      <div className="h-16 bg-brand-black flex items-center px-8 w-full shrink-0">
        <h1 className="text-white text-2xl font-bold tracking-tight">
          VyaparSetu Login Portal
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
            <h2 className="text-2xl font-light text-[#2c3e50]">Existing User Login</h2>
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

          <form onSubmit={handleLogin} className="space-y-6">
            <PremiumInput
              label="Username:"
              required={true}
              value={formData.username}
              onChange={(val) => handleChange('username', val)}
              placeholder="Enter assigned username"
            />

            <PremiumInput
              label="Registered Email:"
              type="email"
              required={true}
              value={formData.email}
              onChange={(val) => handleChange('email', val)}
              placeholder="retailer@domain.com"
            />

            <div className="relative">
              <PremiumInput
                label="Password:"
                type={showPassword ? "text" : "password"}
                required={true}
                value={formData.password}
                onChange={(val) => handleChange('password', val)}
                placeholder="••••••••••••"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[38px] text-brand-blue hover:text-blue-800 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="pt-4 flex items-center gap-6">
              <PremiumButton 
                type="submit" 
                variant="success" 
                isLoading={loading}
                className="px-10 rounded-sm"
              >
                LOGIN
              </PremiumButton>
              
              <span className="text-sm text-brand-muted">
                Need an account? <Link to="/signup" className="text-brand-blue font-semibold hover:underline">Register here</Link>
              </span>
            </div>
          </form>

          {/* Offline Fallback Link */}
          <div className="mt-12 pt-6 border-t border-gray-100">
            <button 
              onClick={handleOfflineMode}
              className="flex items-center gap-2 text-sm text-brand-muted hover:text-brand-text transition-colors"
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