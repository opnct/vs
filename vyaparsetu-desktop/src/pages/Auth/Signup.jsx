import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MonitorOff, ChevronLeft } from 'lucide-react';
import { generateOTP, sendOTP } from '../../emailjs.config';
import PremiumInput from '../../components/ui/PremiumInput';
import PremiumButton from '../../components/ui/PremiumButton';

export default function Signup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Business, 2: Owner
  const [formData, setFormData] = useState({ shopName: '', email: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const nextStep = () => {
    if (step === 1 && formData.shopName) {
      setError("");
      setStep(2);
    } else if (step === 1) {
      setError("Please enter your Shop Name to continue.");
    }
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
    <div className="min-h-screen bg-white font-sans text-brand-text flex flex-col selection:bg-brand-blue/30">
      
      {/* Top Black Banner */}
      <div className="h-16 bg-brand-black flex items-center px-8 w-full shrink-0">
        <h1 className="text-white text-2xl font-bold tracking-tight">
          VyaparSetu Registration Portal
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
              New User Registration <span className="text-brand-muted text-lg ml-2">| Step {step} of 2</span>
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

          <form onSubmit={handleSignup} className="relative min-h-[300px]">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="space-y-6 absolute top-0 left-0 w-full"
                >
                  <PremiumInput
                    label="Business Name:"
                    required={true}
                    value={formData.shopName}
                    onChange={(val) => handleChange('shopName', val)}
                    placeholder="Enter official establishment name"
                  />

                  <div className="pt-4 flex items-center gap-6">
                    <PremiumButton 
                      type="button" 
                      variant="primary" 
                      onClick={nextStep}
                      className="px-10 rounded-sm"
                    >
                      CONTINUE
                    </PremiumButton>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="space-y-6 absolute top-0 left-0 w-full"
                >
                  <PremiumInput
                    label="Official Email:"
                    type="email"
                    required={true}
                    value={formData.email}
                    onChange={(val) => handleChange('email', val)}
                    placeholder="owner@business.com"
                  />

                  <PremiumInput
                    label="Contact Phone:"
                    type="tel"
                    required={true}
                    value={formData.phone}
                    onChange={(val) => handleChange('phone', val)}
                    placeholder="+91 00000 00000"
                  />

                  <div className="pt-4 flex items-center gap-4">
                    <PremiumButton 
                      type="submit" 
                      variant="success" 
                      isLoading={loading}
                      className="px-10 rounded-sm"
                    >
                      GENERATE OTP
                    </PremiumButton>

                    <button 
                      type="button" 
                      onClick={prevStep}
                      className="flex items-center gap-1 text-sm font-semibold text-brand-muted hover:text-brand-text transition-colors px-4 py-2"
                    >
                      <ChevronLeft size={16} /> Back
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

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