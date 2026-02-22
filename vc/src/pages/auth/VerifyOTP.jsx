import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2, AlertCircle, X, CheckCircle2 } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc, collection, addDoc } from 'firebase/firestore';

// Initialize Firebase securely utilizing environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function VerifyOTP() {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Feedback State
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState(null); // 'success', 'error', or null

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

  const handleFeedbackSubmit = async () => {
    if (!feedbackText.trim()) return;
    
    setIsFeedbackLoading(true);
    setFeedbackStatus(null);
    
    try {
      // Execute REAL Firestore Network Request for Feedback
      const collectionPath = typeof __app_id !== 'undefined' 
        ? `artifacts/${__app_id}/public/data/vyapar_feedback` 
        : 'vyapar_feedback';

      await addDoc(collection(db, collectionPath), {
        message: feedbackText,
        user_email: tempEmail || 'Unverified User',
        form_type: 'VyaparSetu Verification Portal',
        submittedAt: new Date().toISOString()
      });

      setFeedbackStatus('success');
      setFeedbackText('');
      setTimeout(() => {
        setIsFeedbackOpen(false);
        setFeedbackStatus(null);
      }, 2500);

    } catch (err) {
      console.error("Firestore Feedback Error:", err);
      setFeedbackStatus('error');
    } finally {
      setIsFeedbackLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Pre-flight validation
    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit cryptographic code.');
      return;
    }

    if (!navigator.onLine) {
      setError('Network offline. Please check your internet connection.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // 1. Execute strict memory validation
      // Throws error if invalid or expired, immediately triggering the catch block.
      verifyOTP(otp);
      
      // 2. Adaptive path generation (Ensures it works locally via Vite AND embedded Canvas)
      const collectionPath = typeof __app_id !== 'undefined' 
        ? `artifacts/${__app_id}/public/data/vyapar_profiles` 
        : 'vyapar_profiles';
      
      // 3. Mark the Firebase user profile as explicitly verified
      const userRef = doc(db, collectionPath, tempEmail.trim().toLowerCase());
      await updateDoc(userRef, {
        emailVerified: true,
        lastVerifiedAt: new Date().toISOString()
      });

      // 4. Replace history to prevent user from navigating back to OTP screen
      navigate('/chatbot', { replace: true });

    } catch (err) {
      console.error("Verification Exception:", err);
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
    <div className="fixed inset-0 z-[9999] bg-white overflow-y-auto font-sans text-[#333333] flex flex-col">
      
      {/* Functional Feedback Side-Tab */}
      <button 
        onClick={() => { setIsFeedbackOpen(true); setFeedbackStatus(null); }}
        className="fixed left-0 top-1/2 -translate-y-1/2 bg-[#337ab7] hover:bg-[#286090] text-white py-4 px-1.5 rounded-r-[4px] cursor-pointer font-bold text-[13px] z-[10000] shadow-md transition-colors"
      >
        <span style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }} className="tracking-widest">Feedback</span>
      </button>

      {/* Real-time Feedback Modal Panel */}
      {isFeedbackOpen && (
        <div className="fixed left-10 top-1/2 -translate-y-1/2 bg-white border border-[#ccc] shadow-2xl z-[10001] w-80 rounded-[3px] overflow-hidden flex flex-col animate-in slide-in-from-left-4 duration-300">
          <div className="bg-[#337ab7] text-white px-4 py-2.5 flex justify-between items-center font-bold text-[14px]">
            <span>Provide Feedback</span>
            <button onClick={() => setIsFeedbackOpen(false)} className="hover:text-gray-200 transition-colors"><X size={18} /></button>
          </div>
          <div className="p-5 flex flex-col gap-3">
             {feedbackStatus === 'success' ? (
               <div className="text-[#3c763d] bg-[#dff0d8] border border-[#d6e9c6] p-3 rounded-[3px] font-medium flex items-center gap-2">
                 <CheckCircle2 size={18}/> Feedback stored in database.
               </div>
             ) : feedbackStatus === 'error' ? (
               <div className="text-[#a94442] bg-[#f2dede] border border-[#ebccd1] p-3 rounded-[3px] font-medium flex items-center gap-2">
                 <AlertCircle size={18}/> Failed to connect to database.
               </div>
             ) : (
               <>
                 <p className="text-[13px] text-[#555] mb-1">Help us improve VyaparSetu. What are your thoughts?</p>
                 <textarea 
                   value={feedbackText}
                   onChange={(e) => {
                     setFeedbackText(e.target.value);
                     if (feedbackStatus === 'error') setFeedbackStatus(null);
                   }}
                   className="w-full border border-[#ccc] rounded-[3px] p-3 focus:border-[#66afe9] focus:outline-none focus:ring-1 focus:ring-[#66afe9] shadow-inner text-[14px] resize-none" 
                   rows="4" 
                   placeholder="Your feedback..."
                 />
                 <button 
                   onClick={handleFeedbackSubmit}
                   disabled={!feedbackText.trim() || isFeedbackLoading}
                   className="mt-2 bg-[#337ab7] hover:bg-[#286090] text-white py-2 rounded-[3px] font-bold text-[13px] disabled:opacity-50 transition-colors w-full flex items-center justify-center gap-2"
                 >
                   {isFeedbackLoading ? <Loader2 className="animate-spin" size={16} /> : 'Submit Feedback'}
                 </button>
               </>
             )}
          </div>
        </div>
      )}

      {/* Overlay behind feedback modal */}
      {isFeedbackOpen && (
        <div 
          className="fixed inset-0 bg-black/10 z-[9999]" 
          onClick={() => setIsFeedbackOpen(false)}
        ></div>
      )}

      {/* Solid Black Header Bar */}
      <div className="bg-black text-white px-6 md:px-12 py-5 w-full shrink-0">
        <div className="max-w-[1200px] mx-auto">
          <h1 className="text-3xl font-bold tracking-tight">VyaparSetu Login Verification</h1>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full max-w-[1200px] mx-auto px-6 md:px-12 py-10 flex flex-col lg:flex-row gap-12 lg:gap-16">
        
        {/* Left Column: Form */}
        <div className="flex-1 max-w-3xl pb-16">
          
          {error && (
            <div className="bg-[#f2dede] border border-[#ebccd1] text-[#a94442] px-4 py-3 rounded-sm mb-6 flex items-start gap-2 shadow-sm">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span className="font-medium text-[14px]">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-10">
            
            {/* Section: Authentication Information */}
            <div className="space-y-6">
              <h2 className="text-[22px] text-[#2c3e50] border-b border-gray-100 pb-2 mb-6">Authentication Required</h2>
              
              <p className="text-[15px] text-[#333] mb-6 leading-relaxed bg-[#f9f9f9] p-4 border-l-4 border-[#337ab7]">
                A secure access code has been dispatched to <strong className="text-[#2c3e50]">{tempEmail}</strong>. Please check your inbox and enter the 6-digit cryptographic code below to securely verify your identity.
              </p>

              <div className="max-w-md space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="otpInput" className="font-bold text-[15px] flex items-center gap-1">
                    Verification Code: <span className="text-[#c9302c] text-lg leading-none">&#8226;</span>
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
                    placeholder="000000"
                    className="w-full border border-[#ccc] rounded-[3px] h-12 px-4 focus:outline-none focus:border-[#66afe9] focus:ring-1 focus:ring-[#66afe9] transition-shadow shadow-inner text-xl font-mono tracking-[0.5em] placeholder:tracking-normal placeholder:font-sans" 
                  />
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-4 border-t border-gray-100 flex items-center gap-6">
              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="bg-[#2ecc71] hover:bg-[#27ae60] text-white font-medium text-[15px] px-6 py-2.5 rounded-[3px] transition-colors shadow-sm disabled:opacity-70 flex items-center justify-center min-w-[140px]"
              >
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'VERIFY CODE'}
              </button>

              <button 
                type="button" 
                onClick={() => navigate('/login', { replace: true })} 
                className="text-[#337ab7] hover:underline text-[14px] font-medium"
              >
                Change Email Address
              </button>
            </div>

          </form>
        </div>

        {/* Right Column: Rules Box */}
        <div className="w-full lg:w-[380px] shrink-0 pt-2">
          <div className="bg-[#f4f7f9] p-6 rounded-sm text-[14px] text-[#2c3e50] shadow-sm border border-[#e1e8ed]">
            
            <div className="flex items-center gap-1 font-medium mb-6">
              <span className="text-[#c9302c] text-lg leading-none">&#8226;</span> Required field
            </div>

            <div className="font-bold mb-3 text-[15px]">Verification Code rules:</div>
            <ul className="list-disc pl-5 space-y-1.5 mb-6 text-[#444] marker:text-gray-500">
              <li>Must be exactly 6 characters in length</li>
              <li>Contains only numerical digits (0-9)</li>
              <li>Code expires strictly 5 minutes after request</li>
              <li>Do not share this code with anyone</li>
            </ul>

            <div className="font-bold mb-3 text-[15px]">Didn't receive the code?</div>
            <ul className="list-disc pl-5 space-y-1.5 text-[#444] marker:text-gray-500">
              <li>Check your spam or junk folder</li>
              <li>Ensure your registered email is active</li>
              <li>Wait 60 seconds before requesting a new code</li>
            </ul>

          </div>
        </div>

      </div>

      {/* Solid Black Footer Bar */}
      <div className="bg-black text-white text-center py-6 text-[13px] w-full shrink-0 mt-auto">
        <p className="mb-4">Protection and maintenance of user profile information is described in <a href="#" className="font-bold hover:underline">VyaparSetu's Web Privacy Policy &#x2197;</a></p>
        <p className="mb-6">For questions regarding the VyaparSetu Login, please contact <a href="#" className="font-bold hover:underline">VyaparSetu Support</a></p>
        <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6 font-bold tracking-wide">
          <span>V URSFOUR-2609-4</span>
          <a href="#" className="hover:underline">Home</a>
          <a href="#" className="hover:underline">VyaparSetu</a>
          <a href="#" className="hover:underline">Accessibility</a>
        </div>
        <p className="mt-4 opacity-80 text-xs">VyaparSetu Official: Arun Ammisetty & Palak Bhosale</p>
      </div>

    </div>
  );
}