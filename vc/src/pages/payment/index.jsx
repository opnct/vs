import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, AlertCircle, Loader2, CheckCircle2, 
  Lock, Phone, Mail, HelpCircle, ChevronRight, 
  Globe, Shield, Activity, Database, Cpu, Layers
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
  const [activeSection, setActiveSection] = useState('checkout');
  
  const selectedPlan = location.state?.selectedPlan;

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    payuTxnId: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isFailure, setIsFailure] = useState(false);

  // Functional Section References
  const sectionRefs = {
    checkout: useRef(null),
    protocols: useRef(null),
    security: useRef(null),
    audit: useRef(null),
    sla: useRef(null),
    refunds: useRef(null),
    governance: useRef(null),
    privacy: useRef(null),
    invoice: useRef(null),
    dispute: useRef(null),
    downtime: useRef(null),
    suspension: useRef(null),
    help: useRef(null)
  };

  // 1. Core Routing & Callback Listener
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get('payment_status');
    const returnedTxnId = params.get('txnid');

    // Handle PayU Callback Return Flow
    if (status === 'success' && returnedTxnId) {
      const sessionDataString = sessionStorage.getItem('vyapar_checkout_session');
      if (sessionDataString) {
        const sessionData = JSON.parse(sessionDataString);
        
        if (sessionData.txnid === returnedTxnId) {
          const recordPayment = async () => {
            try {
              const collectionPath = typeof __app_id !== 'undefined' 
                ? `artifacts/${__app_id}/public/data/vyapar_payments` 
                : 'vyapar_payments';
                
              const paymentPayload = {
                fullName: sessionData.fullName,
                email: sessionData.email,
                phone: sessionData.phone,
                payuTransactionId: returnedTxnId,
                planId: sessionData.planId,
                planName: sessionData.planName,
                amount: sessionData.amount,
                status: 'Paid_Pending_Approval', // Strict HITL Status
                submittedAt: serverTimestamp()
              };
              
              await addDoc(collection(db, collectionPath), paymentPayload);
              
              setFormData({
                fullName: sessionData.fullName,
                email: sessionData.email,
                phone: sessionData.phone,
                payuTxnId: returnedTxnId
              });
              setIsSuccess(true);
              sessionStorage.removeItem('vyapar_checkout_session');
              
            } catch (err) {
              console.error("Firestore Error:", err);
              setError('Transaction successful via PayU, but failed to record in the secure database. Contact Super Admin with your Txn ID.');
            }
          };
          recordPayment();
        }
      }
    } else if (status === 'failure') {
      setIsFailure(true);
      if (returnedTxnId) {
        setFormData(prev => ({ ...prev, payuTxnId: returnedTxnId }));
      }
    } else if (!selectedPlan && !status) {
      // Prevent unauthorized direct access
      navigate('/pricing', { replace: true });
    }
    
    window.scrollTo(0, 0);
  }, [selectedPlan, navigate, location.search]);

  const scrollToSection = (id) => {
    setActiveSection(id);
    const element = sectionRefs[id].current;
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const validateEmail = (email) => {
    return String(email).toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
  };

  // 2. PayU Automated Checkout Logic
  const handlePayUCheckout = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setError('All billing fields are required to initiate the gateway.');
      return;
    }
    if (!validateEmail(formData.email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Generate Secure Transaction ID
      const txnid = 'TXN_' + Date.now() + Math.floor(Math.random() * 1000);
      
      // Preserve state for when PayU redirects back
      sessionStorage.setItem('vyapar_checkout_session', JSON.stringify({
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        planId: selectedPlan.id,
        planName: selectedPlan.name,
        amount: selectedPlan.price,
        txnid: txnid
      }));

      /**
       * CRITICAL ENDPOINT INTEGRATION:
       * Strictly uses the VITE_PAYU_BACKEND_URL from environment.
       */
      const fullBackendUrl = import.meta.env.VITE_PAYU_BACKEND_URL;
      
      if (!fullBackendUrl || fullBackendUrl.trim() === "") {
        throw new Error('CONFIG_ERROR: VITE_PAYU_BACKEND_URL is not defined in environment variables.');
      }

      // Execute Secure POST with advanced error checking for CORS/Port issues
      let response;
      try {
        response = await fetch(fullBackendUrl, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            txnid: txnid,
            amount: selectedPlan.price,
            productinfo: selectedPlan.name,
            firstname: formData.fullName.trim(),
            email: formData.email.trim().toLowerCase(),
            phone: formData.phone.trim(),
            surl: 'https://vyaparsetu-api.onrender.com/api/payu/success',
            furl: 'https://vyaparsetu-api.onrender.com/api/payu/failure'
          })
        });
      } catch (fetchErr) {
        // Handle browser-level failures (CORS mismatch, Connection Refused, Port not Public)
        if (fetchErr.name === 'TypeError') {
          throw new Error(`BROWSER_BLOCK: Failed to connect to ${fullBackendUrl}. Ensure Port 5000 visibility is set to PUBLIC in Codespaces and origin is whitelisted.`);
        }
        throw fetchErr;
      }

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`SERVER_RESPONSE ${response.status}: ${errText || 'Access Denied'}`);
      }

      const data = await response.json();
      
      // Construct dynamic POST form for PayU Redirection
      const form = document.createElement('form');
      form.method = 'POST';
      // UPDATED TO PAYU LIVE PRODUCTION ENDPOINT
      form.action = 'https://secure.payu.in/_payment';

      const payuParams = {
        key: import.meta.env.VITE_PAYU_MERCHANT_KEY, 
        txnid: txnid,
        amount: selectedPlan.price,
        productinfo: selectedPlan.name,
        firstname: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        surl: 'https://vyaparsetu-api.onrender.com/api/payu/success',
        furl: 'https://vyaparsetu-api.onrender.com/api/payu/failure',
        hash: data.hash
      };

      // Append all parameters securely
      Object.keys(payuParams).forEach(key => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = payuParams[key];
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();

    } catch (err) {
      console.error("[PAYU_INIT_DIAGNOSTICS]", err);
      setError(`Gateway Error: ${err.message}`);
      setIsLoading(false);
    }
  };

  // --- RENDERING ---

  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-[10000] bg-[#0a0a0a] text-zinc-300 flex flex-col font-sans selection:bg-[#005ea2] selection:text-white overflow-y-auto">
        <header className="bg-black text-white py-2 px-6 text-[11px] flex items-center gap-2 shrink-0 border-b border-zinc-800">
           <img src="https://upload.wikimedia.org/wikipedia/en/thumb/4/41/Flag_of_India.svg/1200px-Flag_of_India.svg.png" className="h-3 border border-zinc-700" alt="IN flag" />
           Official website of VyaparSetu Technologies. <span className="underline cursor-help ml-1">Clearance Pending</span>
        </header>
        <div className="flex-1 flex items-center justify-center p-6 bg-black">
          <div className="bg-[#111] max-w-2xl w-full border border-zinc-800 shadow-2xl p-12 text-center">
            <ShieldCheck size={64} className="text-[#005ea2] mx-auto mb-8" />
            <h2 className="text-4xl font-bold tracking-tight mb-4 uppercase text-white">Payment Successful</h2>
            <h3 className="text-xl font-bold text-red-500 mb-8 uppercase tracking-widest border-b border-zinc-800 pb-4">Clearance Pending</h3>
            
            <div className="text-left bg-[#1a1a1a] border border-zinc-800 p-8 rounded-sm mb-10 space-y-4 font-mono text-[13px]">
               <p className="flex justify-between border-b border-zinc-800 pb-2"><span>PAYU TXN ID:</span> <span className="font-bold text-[#4da8ec]">{formData.payuTxnId}</span></p>
               <p className="flex justify-between"><span>REGISTERED EMAIL:</span> <span className="font-bold text-white">{formData.email}</span></p>
            </div>
            
            <p className="text-zinc-400 mb-10 leading-relaxed text-sm">
              Your payment was successful via PayU. Access is currently pending administrative clearance from the Super Admin. Please allow 2 to 4 business hours for Human-in-the-Loop verification to finalize your account setup.
            </p>
            <button onClick={() => navigate('/')} className="bg-[#005ea2] hover:bg-[#004a80] text-white font-bold py-4 px-12 rounded-sm transition-all uppercase tracking-widest text-[11px]">Return to Home</button>
          </div>
        </div>
      </div>
    );
  }

  if (isFailure) {
    return (
      <div className="fixed inset-0 z-[10000] bg-[#0a0a0a] text-zinc-300 flex flex-col font-sans selection:bg-[#005ea2] selection:text-white overflow-y-auto">
        <header className="bg-black text-white py-2 px-6 text-[11px] flex items-center gap-2 shrink-0 border-b border-zinc-800">
           <img src="https://upload.wikimedia.org/wikipedia/en/thumb/4/41/Flag_of_India.svg/1200px-Flag_of_India.svg.png" className="h-3 border border-zinc-700" alt="IN flag" />
           Official website of VyaparSetu Technologies. <span className="underline cursor-help ml-1">Payment Declined</span>
        </header>
        <div className="flex-1 flex items-center justify-center p-6 bg-black">
          <div className="bg-[#111] max-w-2xl w-full border border-zinc-800 shadow-2xl p-12 text-center">
            <AlertCircle size={64} className="text-red-500 mx-auto mb-8" />
            <h2 className="text-4xl font-bold tracking-tight mb-4 uppercase text-white">Payment Failed</h2>
            <h3 className="text-xl font-bold text-zinc-500 mb-8 uppercase tracking-widest border-b border-zinc-800 pb-4">Transaction Declined or Cancelled</h3>
            
            {formData.payuTxnId && (
              <div className="text-left bg-[#1a1a1a] border border-zinc-800 p-8 rounded-sm mb-10 space-y-4 font-mono text-[13px]">
                 <p className="flex justify-between border-b border-zinc-800 pb-2"><span>ATTEMPTED TXN ID:</span> <span className="font-bold text-red-400">{formData.payuTxnId}</span></p>
              </div>
            )}
            
            <p className="text-zinc-400 mb-10 leading-relaxed text-sm">
              We were unable to process your payment. This typically happens if the transaction was manually cancelled, your bank declined the request, or the payment session timed out. No charges have been finalized on our end.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => { 
                  setIsFailure(false); 
                  if (selectedPlan) navigate('/payment', { state: { selectedPlan } }); 
                  else navigate('/pricing');
                }} 
                className="bg-[#005ea2] hover:bg-[#004a80] text-white font-bold py-4 px-8 rounded-sm transition-all uppercase tracking-widest text-[11px]"
              >
                Retry Payment
              </button>
              <button 
                onClick={() => navigate('/')} 
                className="bg-transparent border border-zinc-700 hover:bg-zinc-900 text-white font-bold py-4 px-8 rounded-sm transition-all uppercase tracking-widest text-[11px]"
              >
                Return to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-[#0a0a0a] text-zinc-300 font-sans selection:bg-[#005ea2] selection:text-white overflow-y-auto overflow-x-hidden">
      
      {/* 1. OFFICIAL TOP BANNER */}
      <header className="bg-black text-white py-2 px-6 text-[11px] flex items-center gap-2 sticky top-0 z-[110] border-b border-zinc-800">
         <img src="https://upload.wikimedia.org/wikipedia/en/thumb/4/41/Flag_of_India.svg/1200px-Flag_of_India.svg.png" className="h-3 border border-zinc-700" alt="IN flag" />
         An official website of VyaparSetu Technologies. <span className="underline cursor-help ml-1 font-bold">Secure Payment Gateway</span>
      </header>

      {/* 2. INSTITUTIONAL NAVIGATION */}
      <nav className="bg-black border-b border-zinc-800 sticky top-[28px] z-[100] h-20 flex items-center">
        <div className="max-w-[1400px] mx-auto px-6 w-full flex items-center justify-between">
          <div className="flex items-center gap-4">
             <Link to="/" className="text-2xl font-black tracking-tighter text-white uppercase">VyaparSetu</Link>
             <div className="h-10 w-px bg-zinc-800 mx-4"></div>
             <span className="text-[11px] font-black text-zinc-400 uppercase tracking-widest leading-none">PayU Gateway</span>
          </div>
          <div className="flex items-center gap-10">
            <Link to="/" className="text-[11px] font-black uppercase tracking-[0.2em] text-white hover:text-[#4da8ec] transition-colors">Home</Link>
            <Link to="/pricing" className="text-[11px] font-black uppercase tracking-[0.2em] text-white hover:text-[#4da8ec] transition-colors">Pricing</Link>
            <button onClick={() => navigate(-1)} className="text-[10px] font-black bg-white text-black px-5 py-2.5 uppercase tracking-[0.2em] hover:bg-zinc-200 transition-all shadow-sm">Cancel Checkout</button>
          </div>
        </div>
      </nav>

      <main className="max-w-[1400px] mx-auto px-6 py-24 lg:py-32">
        
        {/* 3. HERO TITLE SECTION */}
        <div className="mb-28">
          <div className="text-[13px] font-black text-[#4da8ec] uppercase tracking-[0.4em] mb-6 flex items-center gap-3">
             <Lock size={18}/> Encrypted Checkout
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 uppercase leading-[0.9] text-white">Automated<br/>Gateway</h1>
          <div className="h-2 w-32 bg-[#005ea2] mb-14"></div>
          <p className="max-w-2xl text-xl text-zinc-400 font-light leading-relaxed">
            VyaparSetu utilizes PayU for seamless enterprise transactions. Please complete your billing profile below to be securely redirected to the banking interface.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-24">
          
          {/* 4. SIDEBAR NAVIGATION */}
          <aside className="w-full lg:w-80 shrink-0">
            <div className="sticky top-48">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-10 pb-4 border-b border-zinc-800">On this page</h3>
              <ul className="space-y-0 border-l-4 border-zinc-800">
                {[
                  { id: 'checkout', label: 'PayU Checkout' },
                  { id: 'protocols', label: 'Payment Rules' },
                  { id: 'security', label: 'Payment Security' },
                  { id: 'audit', label: 'Transaction Tracking' },
                  { id: 'sla', label: 'Activation Timeline' },
                  { id: 'refunds', label: 'Refund Policy' },
                  { id: 'governance', label: 'Terms & Conditions' },
                  { id: 'privacy', label: 'Data Privacy' },
                  { id: 'invoice', label: 'Invoicing & Tax' },
                  { id: 'dispute', label: 'Dispute Resolution' },
                  { id: 'downtime', label: 'Service Interruptions' },
                  { id: 'suspension', label: 'Account Suspension' },
                  { id: 'help', label: 'Help & Support' }
                ].map((item) => (
                  <li key={item.id}>
                    <button 
                      onClick={() => scrollToSection(item.id)}
                      className={`w-full text-left py-4 px-8 text-[12px] uppercase tracking-[0.15em] transition-all border-l-4 -ml-1 ${activeSection === item.id ? 'border-[#4da8ec] font-black text-[#4da8ec] bg-[#111]' : 'border-transparent text-zinc-500 hover:text-white hover:bg-zinc-900'}`}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
              
              {selectedPlan && (
                <div className="mt-16 p-8 bg-[#111] text-white relative group border border-zinc-800">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform"><Layers size={80}/></div>
                  <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4">Selected Plan</p>
                  <div className="text-xl font-bold uppercase mb-2 tracking-tight">{selectedPlan.name}</div>
                  <div className="text-3xl font-black text-[#4da8ec]">{selectedPlan.priceLabel}</div>
                </div>
              )}
            </div>
          </aside>

          {/* 5. MAIN CONTENT AREA */}
          <div className="flex-1 max-w-4xl space-y-40">
            
            {/* SECTION: CHECKOUT */}
            <section ref={sectionRefs.checkout} className="scroll-mt-48">
              <div className="bg-[#111] text-white p-16 lg:p-24 border-t-[12px] border-[#005ea2] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-5"><Lock size={120}/></div>
                <h2 className="text-5xl font-black tracking-tighter mb-6 uppercase text-white leading-none">Billing Profile</h2>
                <p className="text-zinc-400 text-[11px] font-black mb-16 uppercase tracking-[0.4em]">Initialize secure PayU session</p>

                {error && (
                  <div className="bg-red-900/20 text-red-400 p-8 border-l-8 border-red-500 mb-12 text-sm font-bold flex gap-5 items-center">
                    <AlertCircle size={24} className="shrink-0"/> <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handlePayUCheckout} className="space-y-16">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-14">
                    <div className="space-y-6">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 block">01. Billing Name (As per Plan Registration)</label>
                      <input 
                        name="fullName" value={formData.fullName} onChange={handleChange}
                        className="w-full bg-transparent border-b-2 border-zinc-800 py-5 focus:outline-none focus:border-[#4da8ec] transition-colors font-bold text-xl text-white uppercase placeholder:text-zinc-700" 
                        placeholder="STORE OR BUSINESS NAME" 
                      />
                    </div>

                    <div className="space-y-6">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 block">02. Account Registration Email</label>
                      <input 
                        type="email" name="email" value={formData.email} onChange={handleChange}
                        className="w-full bg-transparent border-b-2 border-zinc-800 py-5 focus:outline-none focus:border-[#4da8ec] transition-colors font-bold text-xl text-white uppercase placeholder:text-zinc-700" 
                        placeholder="EMAIL FOR PLAN ACTIVATION" 
                      />
                    </div>

                    <div className="space-y-6 md:col-span-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 block">03. Owner Mobile Number</label>
                      <input 
                        type="tel" name="phone" value={formData.phone} onChange={handleChange}
                        className="w-full bg-transparent border-b-2 border-zinc-800 py-5 focus:outline-none focus:border-[#4da8ec] transition-colors font-bold text-xl text-white uppercase placeholder:text-zinc-700" 
                        placeholder="+91-00000-00000" 
                      />
                    </div>
                  </div>

                  <div className="pt-20 border-t border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-12">
                    <div>
                       <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] block mb-4">TOTAL AMOUNT DUE</span>
                       <div className="flex items-baseline gap-4">
                         <span className="text-5xl font-black text-[#4da8ec] tracking-tighter uppercase">{selectedPlan?.priceLabel || '₹0'}</span>
                         <span className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">Subscription Fee</span>
                       </div>
                    </div>
                    
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full md:w-auto bg-[#005ea2] hover:bg-[#004a80] text-white font-black py-7 px-16 uppercase tracking-[0.4em] text-[12px] shadow-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-4"
                    >
                      {isLoading ? <Loader2 className="animate-spin" size={20}/> : <Lock size={20}/>}
                      {isLoading ? 'AUTHORIZING...' : 'PAY SECURELY VIA PAYU'}
                    </button>
                  </div>
                </form>
              </div>
            </section>

            {/* SECTION: PROTOCOLS */}
            <section ref={sectionRefs.protocols} className="scroll-mt-48">
              <h2 className="text-4xl font-bold tracking-tight mb-10 uppercase text-white">Payment Guidelines</h2>
              <div className="space-y-12">
                <div className="flex gap-12 items-start border-b border-zinc-800 pb-10">
                   <div className="w-16 h-16 bg-[#005ea2] flex items-center justify-center font-black text-white text-xl shrink-0 shadow-lg">01</div>
                   <div>
                     <h4 className="text-sm font-black uppercase tracking-widest mb-3 text-white">Automated Redirection</h4>
                     <p className="text-zinc-400 leading-loose font-light">
                       Clicking the checkout button will redirect you to the official PayU gateway. Do not close or refresh your browser during the payment process to ensure your transaction ID is captured correctly.
                     </p>
                   </div>
                </div>
                <div className="flex gap-12 items-start">
                   <div className="w-16 h-16 bg-[#222] flex items-center justify-center font-black text-white text-xl shrink-0 shadow-lg border border-zinc-800">02</div>
                   <div>
                     <h4 className="text-sm font-black uppercase tracking-widest mb-3 text-white">Clearance Mandate</h4>
                     <p className="text-zinc-400 leading-loose font-light">
                       Access is not instantaneous. After PayU successfully captures funds, your account moves to the "Paid - Pending Clearance" queue for our SA Controllers to conduct a KYC identity review.
                     </p>
                   </div>
                </div>
              </div>
            </section>

            {/* NEW SECTION 1: SECURITY */}
            <section ref={sectionRefs.security} className="scroll-mt-48">
              <h2 className="text-4xl font-bold tracking-tight mb-12 uppercase flex items-center gap-6 text-white">
                <ShieldCheck className="text-[#005ea2]" size={40}/> Payment Security
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                <div className="p-10 border border-zinc-800 bg-[#111] hover:bg-[#1a1a1a] transition-colors border-l-4 border-l-[#005ea2] shadow-sm">
                   <h4 className="text-[11px] font-black uppercase tracking-[0.25em] mb-6 text-white">Bank-Grade Encryption</h4>
                   <p className="text-sm text-zinc-400 leading-loose font-light">
                     Your payment details and business information are encrypted using 256-bit SHA-512 cryptographic hashing before being sent to the PayU servers.
                   </p>
                </div>
                <div className="p-10 border border-zinc-800 bg-[#111] hover:bg-[#1a1a1a] transition-colors border-l-4 border-l-zinc-300 shadow-sm">
                   <h4 className="text-[11px] font-black uppercase tracking-[0.25em] mb-6 text-white">Fraud Prevention</h4>
                   <p className="text-sm text-zinc-400 leading-loose font-light">
                     Every transaction is mathematically hashed to protect against packet spoofing and unauthorized modification during transit.
                   </p>
                </div>
              </div>
            </section>

            {/* NEW SECTION 2: AUDIT LOGS */}
            <section ref={sectionRefs.audit} className="scroll-mt-48">
              <h2 className="text-4xl font-bold tracking-tight mb-8 uppercase text-white">Transaction Tracking</h2>
              <div className="bg-[#111] border border-zinc-800 p-12 text-center shadow-inner">
                 <Database className="mx-auto text-zinc-600 mb-6" size={48}/>
                 <p className="text-zinc-400 leading-relaxed font-light text-sm italic max-w-2xl mx-auto">
                   For security and operational integrity, your IP address and submission timestamp are logged securely. This guarantees transaction traceability and aids rapid dispute resolution.
                 </p>
              </div>
            </section>

            {/* NEW SECTION 3: SLA TIMELINES */}
            <section ref={sectionRefs.sla} className="scroll-mt-48">
              <h2 className="text-4xl font-bold tracking-tight mb-10 uppercase flex items-center gap-6 text-white">
                <Activity className="text-[#005ea2]" size={40}/> Activation Timeline
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                 <div className="space-y-3">
                   <h5 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Verification Time</h5>
                   <p className="text-2xl font-bold text-white">2 - 4 Hours</p>
                 </div>
                 <div className="space-y-3 border-l md:border-l border-zinc-800 md:pl-10">
                   <h5 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">System Uptime</h5>
                   <p className="text-2xl font-bold text-[#00e676]">24/7 Active</p>
                 </div>
                 <div className="space-y-3 border-l md:border-l border-zinc-800 md:pl-10">
                   <h5 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Priority Processing</h5>
                   <p className="text-2xl font-bold text-white">For Paid Plans</p>
                 </div>
              </div>
            </section>

            {/* NEW SECTION 4: REFUNDS */}
            <section ref={sectionRefs.refunds} className="scroll-mt-48">
              <h2 className="text-4xl font-bold tracking-tight mb-8 uppercase text-white">Refund Policy</h2>
              <div className="prose prose-zinc max-w-none text-zinc-400 font-light leading-loose text-base border-l-2 border-zinc-800 pl-8">
                <p>
                  As per our standard billing policy, subscription fees are strictly non-refundable once your account has been successfully verified and intelligence features are activated. If you execute an accidental duplicate payment, PayU's automated banking settlement algorithms initiate a refund for the unverified duplicate amount within 48 to 72 bank working hours.
                </p>
              </div>
            </section>

            {/* NEW SECTION 5: GOVERNANCE */}
            <section ref={sectionRefs.governance} className="scroll-mt-48">
              <h2 className="text-4xl font-bold tracking-tight mb-10 uppercase flex items-center gap-6 text-white">
                <Shield className="text-[#005ea2]" size={40}/> Terms & Conditions
              </h2>
              <div className="prose prose-zinc max-w-none text-zinc-400 font-light leading-loose text-base border-l-2 border-zinc-800 pl-8">
                <p>
                  VyaparSetu actively monitors for spoofed parameters or unauthorized success URL manipulation. Any intentional attempt to bypass the PayU hash validation to gain illegal platform access will lead to immediate and permanent blacklisting of your business identity, mobile number, and IP address from the VyaparSetu intelligence network without prior notice.
                </p>
              </div>
            </section>

            {/* NEW SECTION 6: PRIVACY */}
            <section ref={sectionRefs.privacy} className="scroll-mt-48">
              <h2 className="text-4xl font-bold tracking-tight mb-10 uppercase flex items-center gap-6 text-white">
                <Lock className="text-[#005ea2]" size={40}/> Data Privacy
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-[#111] p-10 border border-zinc-800">
                 <div className="space-y-4">
                   <Globe className="text-zinc-600" size={32}/>
                   <h4 className="text-[11px] font-black uppercase tracking-widest text-white">Secure Data Localization</h4>
                   <p className="text-sm text-zinc-400 font-light leading-relaxed">Your payment logs and business meta-data are stored locally on highly secure Indian infrastructure in strict compliance with central government data localization directives.</p>
                 </div>
                 <div className="space-y-4">
                   <Database className="text-zinc-600" size={32}/>
                   <h4 className="text-[11px] font-black uppercase tracking-widest text-white">PCI-DSS Framework</h4>
                   <p className="text-sm text-zinc-400 font-light leading-relaxed">VyaparSetu does not store your credit card, UPI, or bank credentials. All financial parameters are handled exclusively by the Level-1 PCI-DSS certified PayU banking gateway.</p>
                 </div>
              </div>
            </section>

            {/* ADDED SECTION 7: INVOICING */}
            <section ref={sectionRefs.invoice} className="scroll-mt-48">
              <h2 className="text-4xl font-bold tracking-tight mb-8 uppercase text-white">Invoicing & Tax</h2>
              <div className="prose prose-zinc max-w-none text-zinc-400 font-light leading-loose text-base border-l-2 border-zinc-800 pl-8">
                <p>
                  Once your payment is verified and your chosen pricing plan is activated by our Super Admin, a formal GST invoice will be generated automatically and dispatched to your registered email address. Please ensure your billing details are correct during checkout to avoid invoice discrepancies.
                </p>
              </div>
            </section>

            {/* ADDED SECTION 8: DISPUTES */}
            <section ref={sectionRefs.dispute} className="scroll-mt-48">
              <h2 className="text-4xl font-bold tracking-tight mb-8 uppercase text-white">Dispute Resolution</h2>
              <div className="prose prose-zinc max-w-none text-zinc-400 font-light leading-loose text-base border-l-2 border-zinc-800 pl-8">
                <p>
                  In the rare event of failed callbacks or debited amounts without plan activation, a formal dispute can be raised by sending an email with the PayU Txn ID to our support team. Reconciliations and fund reversals back to the source account generally conclude within 3-5 bank working days.
                </p>
              </div>
            </section>

            {/* ADDED SECTION 9: DOWNTIME */}
            <section ref={sectionRefs.downtime} className="scroll-mt-48">
              <h2 className="text-4xl font-bold tracking-tight mb-8 uppercase text-white">Service Interruptions</h2>
              <div className="prose prose-zinc max-w-none text-zinc-400 font-light leading-loose text-base border-l-2 border-zinc-800 pl-8">
                <p>
                  If VyaparSetu undergoes scheduled system maintenance or experiences unplanned network downtime, your billing cycle will automatically be credited with proportional extended access. High availability is guaranteed under our standard Terms of Service.
                </p>
              </div>
            </section>

            {/* ADDED SECTION 10: SUSPENSION */}
            <section ref={sectionRefs.suspension} className="scroll-mt-48">
              <h2 className="text-4xl font-bold tracking-tight mb-8 uppercase text-white">Account Suspension</h2>
              <div className="prose prose-zinc max-w-none text-zinc-400 font-light leading-loose text-base border-l-2 border-zinc-800 pl-8">
                <p>
                  Failure to renew your selected pricing plan within 7 days of its expiry date will result in the temporary suspension of all intelligence features and API access. Suspended account data is securely retained in cold storage for 30 days before permanent deletion.
                </p>
              </div>
            </section>

            {/* SECTION: HELP DESK */}
            <section ref={sectionRefs.help} className="scroll-mt-48 pb-40">
               <div className="bg-[#111] p-16 lg:p-24 border border-zinc-800 relative overflow-hidden text-white shadow-2xl">
                  <div className="absolute bottom-0 right-0 p-8 opacity-5"><HelpCircle size={140}/></div>
                  <h3 className="text-3xl font-bold mb-12 uppercase tracking-tighter flex items-center gap-5">
                    <Cpu className="text-[#005ea2]" size={32}/> Help & Support
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-16 relative z-10">
                     <div className="space-y-4 border-b md:border-b-0 md:border-r border-zinc-800 pb-8 md:pb-0">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 block">Email Support</span>
                        <div className="flex items-center gap-4 text-white font-black text-lg">
                           <Mail size={24} className="text-[#005ea2]"/> support.vyaparsetu@tuta.io
                        </div>
                     </div>
                     <div className="space-y-4">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 block">Phone Support</span>
                        <div className="flex items-center gap-4 text-white font-black text-lg">
                           <Phone size={24} className="text-[#005ea2]"/> +91 83290 04424
                        </div>
                     </div>
                  </div>
               </div>
            </section>

          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-black border-t border-zinc-800 py-32 px-10 relative z-[120]">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-16">
           <div className="flex flex-col items-center md:items-start">
             <div className="text-[12px] font-black tracking-[0.5em] text-white uppercase mb-4">VyaparSetu Technologies</div>
             <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">PayU Gateway Node v3.0</div>
           </div>
           <div className="flex gap-20 text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Help Center</a>
           </div>
        </div>
      </footer>

    </div>
  );
}