import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, Loader2, AlertCircle } from 'lucide-react';

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
    /* FIXED OVERLAY: Strictly covers the Header and Footer from App.jsx */
    <div className="fixed inset-0 z-[9999] bg-black overflow-y-auto flex flex-col items-center py-16 px-6 text-white font-sans overflow-x-hidden">
      
      {/* Authentic Deep Space Starfield Background */}
      <div className="fixed inset-0 bg-black/30 z-0 pointer-events-none"></div>
      <img 
        src="https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&q=80" 
        alt="Starfield Background" 
        className="fixed inset-0 w-full h-full object-cover z-0 opacity-90 pointer-events-none"
      />
      
      {/* Content Container matching the specific width of the Login portal */}
      <div className="w-full max-w-[400px] relative z-10 flex flex-col items-center mt-4">
        
        {/* Vyapar AI "Meatball" Logo (NASA Style Adaptation) */}
        <svg viewBox="0 0 200 200" className="w-[160px] h-[160px] mb-6 drop-shadow-xl">
          {/* Blue sphere */}
          <circle cx="100" cy="100" r="90" fill="#0b3d91" />
          {/* Stars (white dots) */}
          <circle cx="50" cy="60" r="2.5" fill="white" />
          <circle cx="140" cy="50" r="1.5" fill="white" />
          <circle cx="160" cy="90" r="2" fill="white" />
          <circle cx="70" cy="140" r="2" fill="white" />
          <circle cx="130" cy="150" r="1.5" fill="white" />
          <circle cx="40" cy="110" r="1" fill="white" />
          <circle cx="170" cy="130" r="1" fill="white" />
          {/* Orbit ring */}
          <ellipse cx="100" cy="100" rx="85" ry="25" fill="none" stroke="white" strokeWidth="2.5" transform="rotate(-25 100 100)" />
          {/* Red Swoosh */}
          <path d="M 20 140 Q 80 50 180 40 Q 130 120 30 160 Z" fill="#fc3d21" />
          {/* Text */}
          <text x="100" y="105" fill="white" fontFamily="Arial, Helvetica, sans-serif" fontWeight="900" fontSize="30" textAnchor="middle" letterSpacing="1">VYAPAR</text>
          <text x="100" y="142" fill="white" fontFamily="Arial, Helvetica, sans-serif" fontWeight="900" fontSize="34" textAnchor="middle" letterSpacing="2">AI</text>
        </svg>

        <h1 className="sr-only">Vyapar AI Login Verification</h1>
        
        <p className="text-[14px] text-gray-300 text-center mb-6 leading-relaxed">
          A secure verification code was sent to <br/>
          <strong className="text-white tracking-wide">{tempEmail}</strong>
        </p>

        {/* Error State Display */}
        {error && (
          <div className="w-full p-3 bg-red-900/80 border border-red-500 text-white text-sm rounded-sm mb-4 flex items-start gap-2 shadow-lg">
            <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-300" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {/* Form Logic */}
        <form onSubmit={handleSubmit} className="w-full" noValidate>
          
          {/* OTP Input matching the Solid White NASA Portal Aesthetic */}
          <div className="w-full bg-white rounded-[2px] flex items-center px-4 py-3 mb-4 shadow-inner border border-transparent focus-within:border-[#1658b5] transition-colors">
            <Lock className="text-[#333333] mr-4 shrink-0" size={18} strokeWidth={2.5} />
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
              placeholder="000000"
              className="w-full bg-transparent text-black text-[18px] tracking-[0.5em] font-mono font-bold outline-none placeholder:text-gray-400 placeholder:tracking-normal placeholder:font-sans placeholder:font-normal"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || otp.length !== 6}
            className="w-full bg-[#1658b5] hover:bg-[#10428a] text-white font-bold text-[16px] py-3.5 rounded-[2px] transition-colors mb-5 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Verify Code'}
          </button>
        </form>

        {/* Helper Links positioned exactly like the reference */}
        <div className="w-full flex justify-between px-1 mb-8 text-[13px] text-white font-medium drop-shadow-md">
          <button onClick={() => navigate('/login', { replace: true })} className="hover:underline text-white/90">Change Email Address</button>
          <span className="text-gray-400">Expires in 5:00</span>
        </div>

        {/* Government / Enterprise Disclaimers matching the NASA typography perfectly */}
        <div className="w-full text-left text-white text-[13px] leading-[1.6] font-sans tracking-wide space-y-5 px-1 opacity-95">
          <p className="font-bold italic">
            Your verification session will be locked for 15 minutes after 5 consecutive failed log in attempts, after which time your account will be unlocked and you may request a new code.
          </p>
          
          <p className="italic">
            If you did not receive a code, check your spam folder or wait 60 seconds before requesting a new one. If you continue to experience login issues, you may submit your issue <a href="#" className="text-[#4da8ec] hover:underline not-italic font-medium">here</a> for assistance.
          </p>
          
          <p className="italic">
            By accessing and using this information system, you acknowledge and consent to the following:
          </p>

          <p className="italic">
            You are accessing the Vyapar AI Login Portal, an information system which includes: (1) this computer; (2) this computer network; (3) all computers connected to this network including end user systems; (4) all devices and storage media attached to this network or to any computer on this network; and (5) cloud and remote information services. This information system is provided for Vyapar AI-authorized use only. You have no reasonable expectation of privacy regarding any communication transmitted through or data stored on this information system. At any time, and for any lawful purpose, the Vyapar AI Administration may monitor, intercept, search, and seize any communication or data transiting, stored on, or traveling to or from this information system. You are NOT authorized to process classified information on this information system. Unauthorized or improper use of this system may result in suspension or loss of access privileges, disciplinary action, and civil and/or criminal penalties.
          </p>
        </div>

      </div>
    </div>
  );
}