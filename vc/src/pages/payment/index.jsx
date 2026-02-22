import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, AlertCircle, Loader2, CheckCircle2, 
  CreditCard, QrCode, Building, ArrowLeft, Info
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

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

export default function PaymentGateway() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract the selected plan from the router's memory state
  const selectedPlan = location.state?.selectedPlan;

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    utrNumber: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Security Guard: If accessed directly without selecting a plan, kick back to pricing
  useEffect(() => {
    if (!selectedPlan) {
      navigate('/pricing', { replace: true });
    }
  }, [selectedPlan, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
    
    // Strict Input Validation
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.utrNumber.trim()) {
      setError('All fields are strictly required to process manual verification.');
      return;
    }

    if (!validateEmail(formData.email.trim())) {
      setError('Please provide a valid email address. This will become your Login ID.');
      return;
    }

    if (formData.utrNumber.length < 8) {
      setError('Please enter a valid Transaction ID / UTR Number (minimum 8 characters).');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Adaptive path generation (Ensures it works locally via Vite AND embedded Canvas)
      const collectionPath = typeof __app_id !== 'undefined' 
        ? `artifacts/${__app_id}/public/data/vyapar_payments` 
        : 'vyapar_payments';

      // Construct the secure payment payload
      const paymentPayload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        utrNumber: formData.utrNumber.trim(),
        planId: selectedPlan.id,
        planName: selectedPlan.name,
        amount: selectedPlan.price,
        status: 'Pending', // Strictly set to Pending for Super Admin review
        submittedAt: serverTimestamp()
      };

      // Write to Firestore (Unauthenticated write allowed via new Security Rules)
      await addDoc(collection(db, collectionPath), paymentPayload);
      
      setIsSuccess(true);
    } catch (err) {
      console.error("Payment Submission Error:", err);
      setError('Failed to securely transmit payment details. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Render nothing while redirecting if no plan was found
  if (!selectedPlan) return null;

  // SUCCESS STATE VIEW
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#f4f7f9] flex items-center justify-center font-sans p-6">
        <div className="bg-white max-w-lg w-full rounded-xl shadow-2xl p-8 md:p-12 text-center border-t-4 border-[#2ecc71]">
          <div className="w-20 h-20 bg-[#2ecc71]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-[#2ecc71]" />
          </div>
          <h2 className="text-2xl font-black text-[#2c3e50] mb-4">Payment Receipt Submitted</h2>
          <div className="bg-[#f9f9f9] border border-gray-200 p-4 rounded-lg mb-6 text-left space-y-2">
            <p className="text-[14px] text-[#555] flex justify-between">
              <span className="font-semibold text-gray-500">Transaction ID:</span> 
              <span className="font-mono font-bold text-[#2c3e50]">{formData.utrNumber}</span>
            </p>
            <p className="text-[14px] text-[#555] flex justify-between">
              <span className="font-semibold text-gray-500">Plan:</span> 
              <span className="font-bold text-[#2c3e50]">{selectedPlan.name}</span>
            </p>
            <p className="text-[14px] text-[#555] flex justify-between">
              <span className="font-semibold text-gray-500">Status:</span> 
              <span className="font-bold text-[#f39c12] bg-[#f39c12]/10 px-2 py-0.5 rounded text-xs uppercase tracking-wider">Pending Approval</span>
            </p>
          </div>
          <p className="text-[15px] text-[#555] leading-relaxed mb-8">
            Your payment details have been securely queued for Super Admin verification. 
            <strong> Please allow 2-4 hours for processing.</strong> Once verified, your email (<strong className="text-[#337ab7]">{formData.email}</strong>) will be whitelisted for registration.
          </p>
          <Link 
            to="/" 
            className="inline-block bg-[#2c3e50] hover:bg-[#1a252f] text-white font-bold px-8 py-3 rounded-[4px] transition-colors"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  // PAYMENT FORM VIEW
  return (
    <div className="min-h-screen bg-[#f4f7f9] font-sans pb-20">
      {/* Official Header */}
      <header className="bg-black text-white px-6 md:px-12 py-5 w-full shrink-0 shadow-md">
        <div className="max-w-[1200px] mx-auto flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ShieldCheck className="text-[#00e676]" size={24} /> 
            Secure Checkout & KYC
          </h1>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
          
          {/* LEFT COLUMN: Order Summary & Instructions */}
          <div className="w-full lg:w-[450px] shrink-0 space-y-8">
            
            {/* Order Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-[#2c3e50] p-5 text-white">
                <h3 className="font-bold text-lg">Order Summary</h3>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-100">
                  <div>
                    <h4 className="font-bold text-[#2c3e50] text-lg">{selectedPlan.name}</h4>
                    <p className="text-sm text-gray-500">Billed {selectedPlan.billingCycle.replace('/ ', '')}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-[#337ab7]">{selectedPlan.priceLabel}</span>
                  </div>
                </div>
                <ul className="space-y-2 mb-2">
                  <li className="flex justify-between text-sm text-[#555]">
                    <span>Subtotal</span>
                    <span className="font-mono">{selectedPlan.priceLabel}</span>
                  </li>
                  <li className="flex justify-between text-sm text-[#555]">
                    <span>GST (18%)</span>
                    <span className="font-mono">Included</span>
                  </li>
                </ul>
                <div className="flex justify-between items-center pt-4 border-t border-gray-200 mt-4">
                  <span className="font-bold text-[#2c3e50]">Total Payable</span>
                  <span className="text-xl font-black text-[#2ecc71]">{selectedPlan.priceLabel}</span>
                </div>
              </div>
            </div>

            {/* Payment Instructions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-[#f8f9fa] p-5 border-b border-gray-200 flex items-center gap-2">
                <CreditCard className="text-[#337ab7]" size={20} />
                <h3 className="font-bold text-[#2c3e50]">Payment Instructions</h3>
              </div>
              <div className="p-6 space-y-6">
                
                {/* UPI Section */}
                <div>
                  <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <QrCode size={16} /> Pay via UPI
                  </h4>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center text-center">
                    <div className="w-32 h-32 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center mb-3 shadow-sm">
                      <QrCode size={64} className="text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500 mb-1">Scan using GPay, PhonePe, or Paytm</p>
                    <p className="font-mono font-bold text-[#2c3e50] bg-white px-3 py-1.5 border border-gray-200 rounded">vyaparsetu.official@sbi</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="h-px bg-gray-200 flex-1"></div>
                  <span className="text-xs font-bold text-gray-400 uppercase">OR</span>
                  <div className="h-px bg-gray-200 flex-1"></div>
                </div>

                {/* Bank Section */}
                <div>
                  <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Building size={16} /> NEFT / IMPS Transfer
                  </h4>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm space-y-2 font-mono text-[#444]">
                    <div className="flex justify-between border-b border-gray-200 pb-2">
                      <span className="text-gray-500">Bank Name:</span> <strong>State Bank of India</strong>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 pb-2">
                      <span className="text-gray-500">Account Name:</span> <strong>VyaparSetu Tech</strong>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 pb-2">
                      <span className="text-gray-500">Account No:</span> <strong>409283740019</strong>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-gray-500">IFSC Code:</span> <strong>SBIN0004321</strong>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Submission Form */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-[#2c3e50] mb-2">Submit Payment Details</h2>
              <p className="text-[#555] text-[15px] mb-8 pb-6 border-b border-gray-100">
                After completing the payment using the instructions on the left, please fill out this form to queue your account for administrative approval.
              </p>

              {error && (
                <div className="bg-[#f2dede] border border-[#ebccd1] text-[#a94442] px-4 py-3 rounded-md mb-6 flex items-start gap-2 shadow-sm">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <span className="font-medium text-[14px]">{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* KYC Details */}
                <div className="space-y-5">
                  <h3 className="text-lg font-bold text-[#2c3e50] mb-4">1. KYC Details</h3>
                  
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="fullName" className="font-bold text-[14px] text-gray-700 flex items-center gap-1">
                      Full Store/Owner Name <span className="text-[#c9302c]">*</span>
                    </label>
                    <input 
                      id="fullName" name="fullName" type="text" 
                      value={formData.fullName} onChange={handleChange} 
                      className="w-full border border-[#ccc] rounded-[4px] h-11 px-3 focus:outline-none focus:border-[#337ab7] focus:ring-1 focus:ring-[#337ab7] shadow-inner" 
                      placeholder="e.g. Ramesh Kirana Store"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="email" className="font-bold text-[14px] text-gray-700 flex items-center gap-1">
                      Registered Email Address <span className="text-[#c9302c]">*</span>
                    </label>
                    <input 
                      id="email" name="email" type="email" 
                      value={formData.email} onChange={handleChange} 
                      className="w-full border border-[#ccc] rounded-[4px] h-11 px-3 focus:outline-none focus:border-[#337ab7] focus:ring-1 focus:ring-[#337ab7] shadow-inner" 
                      placeholder="ramesh@example.com"
                    />
                    <div className="text-[12px] text-gray-500 flex items-start gap-1 mt-1">
                      <Info size={14} className="shrink-0 text-[#337ab7] mt-0.5" />
                      Crucial: This exact email must be used on the Registration page after approval.
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="phone" className="font-bold text-[14px] text-gray-700 flex items-center gap-1">
                      Phone Number <span className="text-[#c9302c]">*</span>
                    </label>
                    <input 
                      id="phone" name="phone" type="tel" 
                      value={formData.phone} onChange={handleChange} 
                      className="w-full border border-[#ccc] rounded-[4px] h-11 px-3 focus:outline-none focus:border-[#337ab7] focus:ring-1 focus:ring-[#337ab7] shadow-inner font-mono" 
                      placeholder="+91"
                    />
                  </div>
                </div>

                {/* Payment Proof */}
                <div className="space-y-5 pt-6 border-t border-gray-100">
                  <h3 className="text-lg font-bold text-[#2c3e50] mb-4">2. Payment Verification</h3>
                  
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="utrNumber" className="font-bold text-[14px] text-gray-700 flex items-center gap-1">
                      Transaction ID / UTR Number <span className="text-[#c9302c]">*</span>
                    </label>
                    <input 
                      id="utrNumber" name="utrNumber" type="text" 
                      value={formData.utrNumber} onChange={handleChange} 
                      className="w-full border border-[#ccc] rounded-[4px] h-11 px-3 focus:outline-none focus:border-[#2ecc71] focus:ring-1 focus:ring-[#2ecc71] shadow-inner font-mono tracking-wide text-lg uppercase" 
                      placeholder="e.g. 301928374652"
                    />
                    <p className="text-[12px] text-gray-500 mt-1">Enter the 12-digit reference number from your banking/UPI app.</p>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-6 border-t border-gray-100">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#337ab7] hover:bg-[#286090] text-white font-bold text-[16px] py-4 rounded-[4px] transition-colors shadow-md disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} />}
                    {isLoading ? 'Encrypting & Submitting...' : 'Submit for Super Admin Review'}
                  </button>
                </div>

              </form>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}