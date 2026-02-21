import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { initiateLogin } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      // Execute Real Auth Context Logic (Triggers EmailJS OTP)
      await initiateLogin(formData.email.trim());
      navigate('/verify-otp');
    } catch (err) {
      setError(err.message || 'Failed to dispatch secure verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    /* FIXED OVERLAY: Strictly covers the Header and Footer from App.jsx */
    <div className="fixed inset-0 z-[9999] bg-white overflow-y-auto font-sans text-[#333333] flex flex-col">
      
      {/* Blue Feedback Side-Tab */}
      <div className="fixed left-0 top-1/2 -translate-y-1/2 -rotate-90 origin-bottom-left translate-x-12 bg-[#337ab7] text-white px-3 py-1.5 rounded-t cursor-pointer font-bold text-xs tracking-wider z-50 shadow-md">
        Feedback
      </div>

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
      <div className="bg-black text-white text-center py-6 text-[13px] w-full shrink-0">
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