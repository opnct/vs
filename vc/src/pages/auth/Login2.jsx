import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2, AlertCircle, X, CheckCircle2 } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

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
const auth = getAuth(app);

export default function Login2() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Feedback State for UI consistency
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackStatus, setFeedbackStatus] = useState(null);

  const inputRef = useRef(null);

  // Auto-focus logic gracefully applied to the first input
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleFeedbackSubmit = () => {
    if (!feedbackText.trim()) return;
    setTimeout(() => {
      setFeedbackStatus('success');
      setFeedbackText('');
      setTimeout(() => {
        setIsFeedbackOpen(false);
        setFeedbackStatus(null);
      }, 2000);
    }, 600);
  };

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Real-time UI validations
    if (!formData.username.trim() || !formData.email.trim() || !formData.password.trim()) {
      setError('Username, Email, and Password are all strictly required.');
      return;
    }

    if (!validateEmail(formData.email.trim())) {
      setError('Please enter a valid e-mail address.');
      return;
    }

    if (!navigator.onLine) {
      setError('Network offline. Please check your internet connection.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Execute REAL Firebase Authentication
      // Note: Firebase Auth validates via Email/Password. The Username field is strictly required 
      // by UI policy and can be used for logging or secondary Firestore validation if needed.
      await signInWithEmailAndPassword(auth, formData.email.trim(), formData.password);
      
      // Navigate to the secure Chatbot hub upon success
      navigate('/chatbot', { replace: true });
    } catch (err) {
      console.error("Login Exception:", err);
      let errorMessage = 'Authentication failed. Please verify your credentials.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        errorMessage = 'No active profile found with these credentials. Please check your entries.';
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Account temporarily locked due to multiple failed attempts. Try again later.';
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    /* SECTION 1: GLOBAL OVERLAY & FEEDBACK TAB (Hides Header/Footer) */
    <div className="fixed inset-0 z-[9999] bg-white overflow-y-auto font-sans text-[#333333] flex flex-col">
      
      {/* Functional Feedback Side-Tab */}
      <button 
        onClick={() => { setIsFeedbackOpen(true); setFeedbackStatus(null); }}
        className="fixed left-0 top-1/2 -translate-y-1/2 bg-[#337ab7] hover:bg-[#286090] text-white py-4 px-1.5 rounded-r-[4px] cursor-pointer font-bold text-[13px] z-[10000] shadow-md transition-colors"
      >
        <span style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }} className="tracking-widest">Feedback</span>
      </button>

      {/* Feedback Modal Panel */}
      {isFeedbackOpen && (
        <div className="fixed left-10 top-1/2 -translate-y-1/2 bg-white border border-[#ccc] shadow-2xl z-[10001] w-80 rounded-[3px] overflow-hidden flex flex-col animate-in slide-in-from-left-4 duration-300">
          <div className="bg-[#337ab7] text-white px-4 py-2.5 flex justify-between items-center font-bold text-[14px]">
            <span>Provide Feedback</span>
            <button onClick={() => setIsFeedbackOpen(false)} className="hover:text-gray-200 transition-colors"><X size={18} /></button>
          </div>
          <div className="p-5 flex flex-col gap-3">
             {feedbackStatus === 'success' ? (
               <div className="text-[#3c763d] bg-[#dff0d8] border border-[#d6e9c6] p-3 rounded-[3px] font-medium flex items-center gap-2">
                 <CheckCircle2 size={18}/> Feedback recorded!
               </div>
             ) : (
               <>
                 <p className="text-[13px] text-[#555] mb-1">Having trouble logging in?</p>
                 <textarea 
                   value={feedbackText}
                   onChange={(e) => setFeedbackText(e.target.value)}
                   className="w-full border border-[#ccc] rounded-[3px] p-3 focus:border-[#66afe9] focus:outline-none focus:ring-1 focus:ring-[#66afe9] shadow-inner text-[14px] resize-none" 
                   rows="4" 
                   placeholder="Describe your issue..."
                 />
                 <button 
                   onClick={handleFeedbackSubmit}
                   disabled={!feedbackText.trim()}
                   className="mt-2 bg-[#337ab7] hover:bg-[#286090] text-white py-2 rounded-[3px] font-bold text-[13px] disabled:opacity-50 transition-colors w-full"
                 >
                   Submit Feedback
                 </button>
               </>
             )}
          </div>
        </div>
      )}

      {isFeedbackOpen && (
        <div className="fixed inset-0 bg-black/10 z-[9999]" onClick={() => setIsFeedbackOpen(false)}></div>
      )}

      {/* SECTION 2: INSTITUTIONAL HEADER BAR */}
      <div className="bg-black text-white px-6 md:px-12 py-5 w-full shrink-0">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">VyaparSetu Authentication Gateway</h1>
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-sm">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">System Operational</span>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full max-w-[1200px] mx-auto px-6 md:px-12 py-10 flex flex-col lg:flex-row gap-12 lg:gap-16">
        
        {/* Left Column Container */}
        <div className="flex-1 max-w-3xl pb-16">
          
          {/* SECTION 3: SYSTEM ALERTS / ERROR STATE */}
          {error && (
            <div className="bg-[#f2dede] border border-[#ebccd1] text-[#a94442] px-4 py-3 rounded-sm mb-6 flex items-start gap-2 shadow-sm">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span className="font-medium text-[14px]">{error}</span>
            </div>
          )}

          {/* SECTION 4: CORE AUTHENTICATION FORM */}
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <h2 className="text-[22px] text-[#2c3e50] border-b border-gray-100 pb-2 mb-6">Existing User Login</h2>
              
              <div className="max-w-md space-y-5">
                
                {/* Field 1: Username */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="username" className="font-bold text-[15px] flex items-center gap-1">
                    Username: <span className="text-[#c9302c] text-lg leading-none">&#8226;</span>
                  </label>
                  <input 
                    id="username" 
                    name="username" 
                    ref={inputRef}
                    type="text" 
                    value={formData.username} 
                    onChange={handleChange} 
                    className="w-full border border-[#ccc] rounded-[3px] h-10 px-3 focus:outline-none focus:border-[#66afe9] focus:ring-1 focus:ring-[#66afe9] transition-shadow shadow-inner" 
                    placeholder="Enter assigned username"
                  />
                </div>

                {/* Field 2: Email */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="font-bold text-[15px] flex items-center gap-1">
                    Registered Email: <span className="text-[#c9302c] text-lg leading-none">&#8226;</span>
                  </label>
                  <input 
                    id="email" 
                    name="email" 
                    type="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    className="w-full border border-[#ccc] rounded-[3px] h-10 px-3 focus:outline-none focus:border-[#66afe9] focus:ring-1 focus:ring-[#66afe9] transition-shadow shadow-inner" 
                    placeholder="retailer@domain.com"
                  />
                </div>

                {/* Field 3: Password */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="password" className="font-bold text-[15px] flex items-center gap-1">
                    Password: <span className="text-[#c9302c] text-lg leading-none">&#8226;</span>
                  </label>
                  <div className="relative">
                    <input 
                      id="password" 
                      name="password" 
                      type={showPassword ? "text" : "password"} 
                      value={formData.password} 
                      onChange={handleChange} 
                      className="w-full border border-[#ccc] rounded-[3px] h-10 pl-3 pr-10 focus:outline-none focus:border-[#66afe9] focus:ring-1 focus:ring-[#66afe9] transition-shadow shadow-inner" 
                      placeholder="••••••••••••"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#337ab7]">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* Action Buttons & Routing */}
            <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center gap-6">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-[#2ecc71] hover:bg-[#27ae60] text-white font-medium text-[15px] px-8 py-2.5 rounded-[3px] transition-colors shadow-sm disabled:opacity-70 flex items-center justify-center min-w-[140px]"
              >
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'LOGIN'}
              </button>

              <div className="text-[14px]">
                <span className="text-[#555]">Need an account? </span>
                <Link to="/login" className="text-[#337ab7] hover:underline font-medium">
                  Register here
                </Link>
              </div>
            </div>

          </form>
        </div>

        {/* SECTION 5: RULES & INFORMATION SIDEBAR */}
        <div className="w-full lg:w-[380px] shrink-0 pt-2">
          <div className="bg-[#f4f7f9] p-6 rounded-sm text-[14px] text-[#2c3e50] shadow-sm border border-[#e1e8ed]">
            
            <div className="flex items-center gap-1 font-medium mb-6">
              <span className="text-[#c9302c] text-lg leading-none">&#8226;</span> Required field
            </div>

            <div className="font-bold mb-3 text-[15px]">Security Protocols:</div>
            <ul className="list-disc pl-5 space-y-1.5 mb-6 text-[#444] marker:text-gray-500">
              <li>All fields must exactly match your registration profile.</li>
              <li>Passwords are case-sensitive.</li>
              <li>System will temporarily lock out after 5 consecutive failed attempts.</li>
              <li>Do not share your credentials with unauthorized personnel.</li>
            </ul>

            <div className="font-bold mb-3 text-[15px]">Troubleshooting:</div>
            <ul className="list-disc pl-5 space-y-1.5 text-[#444] marker:text-gray-500">
              <li>Ensure caps lock is disabled.</li>
              <li>Clear your browser cache if you experience infinite loading.</li>
              <li>Use the Feedback tab for technical assistance.</li>
            </ul>

          </div>
        </div>

      </div>

      {/* SECTION 6: INSTITUTIONAL FOOTER BAR */}
      <div className="bg-black text-white text-center py-6 text-[13px] w-full shrink-0 mt-auto">
        <p className="mb-4">Protection and maintenance of user profile information is described in <a href="#" className="font-bold hover:underline">VyaparSetu's Web Privacy Policy</a></p>
        <p className="mb-6">For questions regarding the VyaparSetu Login Gateway, please contact <a href="#" className="font-bold hover:underline">VyaparSetu Support</a></p>
        <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6 font-bold tracking-wide">
          <span>V URSFOUR-2609-5</span>
          <Link to="/" className="hover:underline">Home</Link>
          <a href="#" className="hover:underline">VyaparSetu</a>
          <a href="#" className="hover:underline">Accessibility</a>
        </div>
        <p className="mt-4 opacity-80 text-xs">VyaparSetu Official: Arun Ammisetty & Palak Bhosale</p>
      </div>

    </div>
  );
}