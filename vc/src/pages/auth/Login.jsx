import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Loader2, AlertCircle, X, CheckCircle2 } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, collection, addDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

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
const auth = getAuth(app);

export default function Login() {
  const navigate = useNavigate();
  const { initiateLogin } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Feedback State
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState(null); // 'success', 'error', or null

  const emailRef = useRef(null);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    middleInitial: '',
    email: '',
    country: '',
    affiliation: '',
    studyArea: '',
    userType: '',
    organization: '',
    agreements: true
  });

  // Auto-focus logic gracefully applied to the first input
  useEffect(() => {
    const firstInput = document.getElementById('username');
    if (firstInput) firstInput.focus();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (error) setError('');
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
        user_email: formData.email || 'Anonymous/Unregistered',
        form_type: 'VyaparSetu Feedback Portal',
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

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Real-time production validations mimicking the exact UI requirements
    if (!formData.username || !formData.password || !formData.confirmPassword || !formData.firstName || !formData.lastName || !formData.email || !formData.country || !formData.affiliation) {
      setError('Please fill in all required fields marked with a red dot.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 12) {
      setError('Password must contain a minimum of 12 characters.');
      return;
    }

    if (!validateEmail(formData.email.trim())) {
      setError('Please enter a valid e-mail address.');
      if (emailRef.current) emailRef.current.focus();
      return;
    }

    if (!navigator.onLine) {
      setError('Network offline. Please check your internet connection.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // 1. Authenticate formally with Email/Password
      try {
        await createUserWithEmailAndPassword(auth, formData.email.trim(), formData.password);
      } catch (authError) {
        // If the user already exists, gracefully fall back to signing them in
        if (authError.code === 'auth/email-already-in-use') {
          await signInWithEmailAndPassword(auth, formData.email.trim(), formData.password);
        } else {
          throw authError;
        }
      }

      // 2. Adaptive path generation (Ensures it works locally via Vite AND embedded Canvas)
      const collectionPath = typeof __app_id !== 'undefined' 
        ? `artifacts/${__app_id}/public/data/vyapar_profiles` 
        : 'vyapar_profiles';
      
      const userRef = doc(db, collectionPath, formData.email.trim().toLowerCase());
      
      // 3. Save comprehensive registration data to real Firebase DB
      // merge: true ensures returning users do not overwrite their existing profile data entirely
      await setDoc(userRef, {
        username: formData.username,
        firstName: formData.firstName,
        lastName: formData.lastName,
        middleInitial: formData.middleInitial,
        email: formData.email.trim(),
        country: formData.country,
        affiliation: formData.affiliation,
        studyArea: formData.studyArea,
        userType: formData.userType,
        organization: formData.organization,
        agreements: formData.agreements,
        lastLoginAt: new Date().toISOString()
      }, { merge: true });

      // 4. Execute Real Auth Context Logic (Triggers separate EmailJS OTP validation)
      await initiateLogin(formData.email.trim());
      navigate('/verify-otp');

    } catch (err) {
      console.error("Registration Exception:", err);
      let errorMessage = 'Failed to secure profile registration data. Please try again.';
      if (err.code === 'auth/wrong-password') errorMessage = 'Invalid password for existing account.';
      if (err.code === 'auth/invalid-credential') errorMessage = 'Invalid credentials provided.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

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
          <h1 className="text-3xl font-bold tracking-tight">Register for a VyaparSetu Login Profile</h1>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full max-w-[1200px] mx-auto px-6 md:px-12 py-8 flex flex-col lg:flex-row gap-12 lg:gap-16">
        
        {/* Left Column: Form */}
        <div className="flex-1 max-w-3xl pb-16">
          
          {error && (
            <div className="bg-[#f2dede] border border-[#ebccd1] text-[#a94442] px-4 py-3 rounded-sm mb-6 flex items-start gap-2 shadow-sm">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span className="font-medium text-[14px]">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-12">
            
            {/* Section: Profile Information */}
            <div className="space-y-6">
              <h2 className="text-[22px] text-[#2c3e50] border-b border-gray-100 pb-2 mb-6">Profile Information</h2>
              
              <div className="max-w-md space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="username" className="font-bold text-[15px] flex items-center gap-1">
                    Username: <span className="text-[#c9302c] text-lg leading-none">&#8226;</span>
                  </label>
                  <input id="username" name="username" type="text" value={formData.username} onChange={handleChange} className="w-full border border-[#ccc] rounded-[3px] h-10 px-3 focus:outline-none focus:border-[#66afe9] focus:ring-1 focus:ring-[#66afe9] transition-shadow shadow-inner" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="password" className="font-bold text-[15px] flex items-center gap-1">
                    Password: <span className="text-[#c9302c] text-lg leading-none">&#8226;</span>
                  </label>
                  <div className="relative">
                    <input id="password" name="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={handleChange} className="w-full border border-[#ccc] rounded-[3px] h-10 pl-3 pr-10 focus:outline-none focus:border-[#66afe9] focus:ring-1 focus:ring-[#66afe9] transition-shadow shadow-inner" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#337ab7]">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="confirmPassword" className="font-bold text-[15px] flex items-center gap-1">
                    Password Confirmation: <span className="text-[#c9302c] text-lg leading-none">&#8226;</span>
                  </label>
                  <div className="relative">
                    <input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={formData.confirmPassword} onChange={handleChange} className="w-full border border-[#ccc] rounded-[3px] h-10 pl-3 pr-10 focus:outline-none focus:border-[#66afe9] focus:ring-1 focus:ring-[#66afe9] transition-shadow shadow-inner" />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#337ab7]">
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Section: User Information */}
            <div className="space-y-6">
              <h2 className="text-[22px] text-[#2c3e50] border-b border-gray-100 pb-2 mb-6 mt-8">User Information</h2>
              
              <div className="max-w-md space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="firstName" className="font-bold text-[15px] flex items-center gap-1">
                    First Name: <span className="text-[#c9302c] text-lg leading-none">&#8226;</span>
                  </label>
                  <input id="firstName" name="firstName" type="text" value={formData.firstName} onChange={handleChange} className="w-full border border-[#ccc] rounded-[3px] h-10 px-3 focus:outline-none focus:border-[#66afe9] focus:ring-1 focus:ring-[#66afe9] shadow-inner" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="lastName" className="font-bold text-[15px] flex items-center gap-1">
                    Last Name: <span className="text-[#c9302c] text-lg leading-none">&#8226;</span>
                  </label>
                  <input id="lastName" name="lastName" type="text" value={formData.lastName} onChange={handleChange} className="w-full border border-[#ccc] rounded-[3px] h-10 px-3 focus:outline-none focus:border-[#66afe9] focus:ring-1 focus:ring-[#66afe9] shadow-inner" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="middleInitial" className="font-bold text-[15px]">Middle Initial:</label>
                  <input id="middleInitial" name="middleInitial" type="text" maxLength="1" value={formData.middleInitial} onChange={handleChange} className="w-full border border-[#ccc] rounded-[3px] h-10 px-3 focus:outline-none focus:border-[#66afe9] focus:ring-1 focus:ring-[#66afe9] shadow-inner" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="font-bold text-[15px] flex items-center gap-1">
                    E-mail: <span className="text-[#c9302c] text-lg leading-none">&#8226;</span>
                  </label>
                  <input id="email" name="email" ref={emailRef} type="email" value={formData.email} onChange={handleChange} className="w-full border border-[#ccc] rounded-[3px] h-10 px-3 focus:outline-none focus:border-[#66afe9] focus:ring-1 focus:ring-[#66afe9] shadow-inner" />
                </div>
              </div>
            </div>

            {/* Section: Country Information */}
            <div className="space-y-6">
              <h2 className="text-[22px] text-[#2c3e50] border-b border-gray-100 pb-2 mb-6 mt-8">Country Information</h2>
              
              <div className="max-w-md space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="country" className="font-bold text-[15px] flex items-center gap-1">
                    Country: <span className="text-[#c9302c] text-lg leading-none">&#8226;</span>
                  </label>
                  <select id="country" name="country" value={formData.country} onChange={handleChange} className="w-full border border-[#ccc] rounded-[3px] h-10 px-3 bg-white focus:outline-none focus:border-[#66afe9] focus:ring-1 focus:ring-[#66afe9] text-[15px]">
                    <option value="" disabled>Select a Country</option>
                    <option value="India">India</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section: Affiliations */}
            <div className="space-y-6">
              <h2 className="text-[22px] text-[#2c3e50] border-b border-gray-100 pb-2 mb-6 mt-8">Affiliations</h2>
              
              <div className="max-w-md space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="affiliation" className="font-bold text-[15px] flex items-center gap-1">
                    Affiliation: <span className="text-[#c9302c] text-lg leading-none">&#8226;</span>
                  </label>
                  <select id="affiliation" name="affiliation" value={formData.affiliation} onChange={handleChange} className="w-full border border-[#ccc] rounded-[3px] h-10 px-3 bg-white focus:outline-none focus:border-[#66afe9] focus:ring-1 focus:ring-[#66afe9] text-[15px]">
                    <option value="" disabled>Select an Affiliation</option>
                    <option value="Retailer">Retail Store Owner</option>
                    <option value="Distributor">Distributor / Supplier</option>
                    <option value="Enterprise">Enterprise Brand</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="studyArea" className="font-bold text-[15px]">Study Area:</label>
                  <select id="studyArea" name="studyArea" value={formData.studyArea} onChange={handleChange} className="w-full border border-[#ccc] rounded-[3px] h-10 px-3 bg-white focus:outline-none focus:border-[#66afe9] focus:ring-1 focus:ring-[#66afe9] text-[15px]">
                    <option value="" disabled>Select a Study Area</option>
                    <option value="FMCG">FMCG Dynamics</option>
                    <option value="Inventory Management">Inventory Management</option>
                    <option value="Agri-Tech">Agri-Tech</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="userType" className="font-bold text-[15px]">User Type:</label>
                  <select id="userType" name="userType" value={formData.userType} onChange={handleChange} className="w-full border border-[#ccc] rounded-[3px] h-10 px-3 bg-white focus:outline-none focus:border-[#66afe9] focus:ring-1 focus:ring-[#66afe9] text-[15px]">
                    <option value="" disabled>Select a User Type</option>
                    <option value="Admin">Admin</option>
                    <option value="Staff">Staff</option>
                    <option value="Partner">Partner</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="organization" className="font-bold text-[15px]">Organization:</label>
                  <input id="organization" name="organization" type="text" value={formData.organization} onChange={handleChange} className="w-full border border-[#ccc] rounded-[3px] h-10 px-3 focus:outline-none focus:border-[#66afe9] focus:ring-1 focus:ring-[#66afe9] shadow-inner" />
                </div>
              </div>
            </div>

            {/* Section: Agreements */}
            <div className="space-y-6">
              <h2 className="text-[22px] text-[#2c3e50] border-b border-gray-100 pb-2 mb-6 mt-8">Agreements</h2>
              
              <div className="bg-[#f4f7f9] p-4 rounded-sm border border-[#e1e8ed] flex items-start gap-3 shadow-sm mb-6">
                <input 
                  type="checkbox" 
                  id="agreements" 
                  name="agreements" 
                  checked={formData.agreements} 
                  onChange={handleChange} 
                  className="mt-1 shrink-0 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="agreements" className="text-[14px] text-[#333] cursor-pointer leading-relaxed">
                  Please notify me via email with important information about VyaparSetu science data products (e.g. updates, new data releases, quality issues), VyaparSetu applications/tools (e.g. updates, service outages), and other relevant information for users.
                </label>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="bg-[#2ecc71] hover:bg-[#27ae60] text-white font-medium text-[15px] px-6 py-2.5 rounded-[3px] transition-colors shadow-sm disabled:opacity-70 flex items-center justify-center min-w-[120px]"
              >
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'CONTINUE'}
              </button>
            </div>

          </form>
        </div>

        {/* Right Column: Rules Box */}
        <div className="w-full lg:w-[380px] shrink-0 pt-10">
          <div className="bg-[#f4f7f9] p-6 rounded-sm text-[14px] text-[#2c3e50] shadow-sm border border-[#e1e8ed]">
            
            <div className="flex items-center gap-1 font-medium mb-6">
              <span className="text-[#c9302c] text-lg leading-none">&#8226;</span> Required field
            </div>

            <div className="font-bold mb-3 text-[15px]">Username must:</div>
            <ul className="list-disc pl-5 space-y-1.5 mb-6 text-[#444] marker:text-gray-500">
              <li>Be a Minimum of 4 characters</li>
              <li>Be a Maximum of 30 characters</li>
              <li>Contain at least one letter</li>
              <li>Use only lowercase letters, numbers, periods and underscores</li>
              <li>Not contain any blank spaces</li>
              <li>Not begin, end or contain two consecutive special characters( . _ )</li>
            </ul>

            <div className="font-bold mb-3 text-[15px]">Password must contain:</div>
            <ul className="list-disc pl-5 space-y-1.5 text-[#444] marker:text-gray-500">
              <li>Minimum of 12 characters</li>
              <li>One Uppercase letter</li>
              <li>One Lowercase letter</li>
              <li>One Number</li>
              <li>One Special Character</li>
            </ul>

          </div>
        </div>

      </div>

      {/* Solid Black Footer Bar mimicking the image */}
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