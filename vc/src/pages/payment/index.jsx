import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, AlertCircle, Loader2, CheckCircle2, 
  CreditCard, QrCode, Building, ArrowLeft, Info,
  ExternalLink, Lock, Phone, Mail, HelpCircle, UserCheck,
  ChevronRight, Globe, Shield, Activity, FileText, Scale,
  Briefcase, Fingerprint, Landmark, RefreshCw, Layers, Database,
  Cpu, SwitchCamera
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
  const [activeSection, setActiveSection] = useState('beneficiary');
  const [activeDeveloper, setActiveDeveloper] = useState('arun'); // 'arun' | 'palak'
  
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

  // Functional Section References
  const sectionRefs = {
    beneficiary: useRef(null),
    qr: useRef(null),
    bank: useRef(null),
    protocols: useRef(null),
    kyc: useRef(null),
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

  useEffect(() => {
    if (!selectedPlan) {
      navigate('/pricing', { replace: true });
    }
    window.scrollTo(0, 0);
  }, [selectedPlan, navigate]);

  const scrollToSection = (id) => {
    setActiveSection(id);
    const element = sectionRefs[id].current;
    if (element) {
      // Use scrollIntoView since the container is a fixed overlay, not the window
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.utrNumber.trim()) {
      setError('All fields are required to verify your payment.');
      return;
    }
    if (!validateEmail(formData.email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const collectionPath = typeof __app_id !== 'undefined' 
        ? `artifacts/${__app_id}/public/data/vyapar_payments` 
        : 'vyapar_payments';
      const paymentPayload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        utrNumber: formData.utrNumber.trim(),
        planId: selectedPlan.id,
        planName: selectedPlan.name,
        amount: selectedPlan.price,
        beneficiary: activeDeveloper === 'arun' ? 'Arun Ammisetty' : 'Palak Bhosale',
        status: 'Pending',
        submittedAt: serverTimestamp()
      };
      await addDoc(collection(db, collectionPath), paymentPayload);
      setIsSuccess(true);
    } catch (err) {
      console.error(err);
      setError('Payment Submission Error: Unable to connect to the server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const developerInfo = {
    arun: {
      name: 'Arun Ammisetty',
      vpa: '918329004424@waicici',
      acc: '409283740019',
      ifsc: 'SBIN0004321',
      bankName: 'State Bank of India',
      role: 'Developer',
      qrCodes: [
        { label: 'PhonePe', src: 'https://a-amm.vercel.app/assets/ph.png?dev=arun&app=phonepe' },
        { label: 'Google Pay', src: 'https://a-amm.vercel.app/assets/gpay.png?dev=arun&app=gpay' },
        { label: 'WhatsApp Pay', src: 'https://a-amm.vercel.app/assets/wa.png?dev=arun&app=whatsapp' },
        { label: 'BHIM UPI', src: 'https://a-amm.vercel.app/assets/bhim.jpeg?dev=arun&app=bhim' }
      ]
    },
    palak: {
      name: 'Palak Bhosale',
      vpa: 'palak.bhosale@waicici',
      acc: '502938471109',
      ifsc: 'ICIC0001205',
      bankName: 'ICICI Bank',
      role: 'Developer',
      qrCodes: [
        { label: 'PhonePe', src: 'https://a-amm.vercel.app/assets/ph.png?dev=palak&app=phonepe' },
        { label: 'Google Pay', src: 'https://a-amm.vercel.app/assets/gpay.png?dev=palak&app=gpay' },
        { label: 'WhatsApp Pay', src: 'https://a-amm.vercel.app/assets/wa.png?dev=palak&app=whatsapp' },
        { label: 'BHIM UPI', src: 'https://a-amm.vercel.app/assets/bhim.jpeg?dev=palak&app=bhim' }
      ]
    }
  };

  if (!selectedPlan) return null;

  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-[10000] bg-white text-black flex flex-col font-sans selection:bg-[#005ea2] selection:text-white overflow-y-auto">
        <header className="bg-black text-white py-2 px-6 text-[11px] flex items-center gap-2 shrink-0">
           <img src="https://upload.wikimedia.org/wikipedia/en/thumb/4/41/Flag_of_India.svg/1200px-Flag_of_India.svg.png" className="h-3 border border-zinc-700" alt="IN flag" />
           Official website of VyaparSetu Technologies. <span className="underline cursor-help ml-1">Payment Received</span>
        </header>
        <div className="flex-1 flex items-center justify-center p-6 bg-[#f0f0f0]">
          <div className="bg-white max-w-2xl w-full border border-zinc-200 shadow-2xl p-12 text-center">
            <CheckCircle2 size={64} className="text-[#005ea2] mx-auto mb-8" />
            <h2 className="text-4xl font-bold tracking-tight mb-4 uppercase text-black">Payment Receipt Submitted</h2>
            <div className="text-left bg-zinc-50 border border-zinc-200 p-8 rounded-sm mb-10 space-y-4 font-mono text-[13px]">
               <p className="flex justify-between border-b border-zinc-100 pb-2"><span>UTR / REF NUMBER:</span> <span className="font-bold text-[#005ea2]">{formData.utrNumber}</span></p>
               <p className="flex justify-between"><span>REGISTERED EMAIL:</span> <span className="font-bold">{formData.email}</span></p>
            </div>
            <p className="text-zinc-600 mb-10 leading-relaxed text-sm">Your payment details have been received and are currently under verification. Your account will be activated within 2 to 4 business hours. You will receive an email once the activation is complete.</p>
            <button onClick={() => navigate('/')} className="bg-[#005ea2] hover:bg-[#004a80] text-white font-bold py-4 px-12 rounded-sm transition-all uppercase tracking-widest text-[11px]">Return to Home</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    /* FIXED OVERLAY TO HIDE GLOBAL HEADER/FOOTER */
    <div className="fixed inset-0 z-[9999] bg-white text-[#1b1b1b] font-sans selection:bg-[#005ea2] selection:text-white overflow-y-auto overflow-x-hidden">
      
      {/* 1. OFFICIAL TOP BANNER */}
      <header className="bg-black text-white py-2 px-6 text-[11px] flex items-center gap-2 sticky top-0 z-[110]">
         <img src="https://upload.wikimedia.org/wikipedia/en/thumb/4/41/Flag_of_India.svg/1200px-Flag_of_India.svg.png" className="h-3 border border-zinc-700" alt="IN flag" />
         An official website of VyaparSetu Technologies. <span className="underline cursor-help ml-1 font-bold">Secure Payment Gateway</span>
      </header>

      {/* 2. INSTITUTIONAL NAVIGATION */}
      <nav className="bg-white border-b border-zinc-200 sticky top-[28px] z-[100] h-20 flex items-center">
        <div className="max-w-[1400px] mx-auto px-6 w-full flex items-center justify-between">
          <div className="flex items-center gap-4">
             <Link to="/" className="text-2xl font-black tracking-tighter text-black uppercase">VyaparSetu</Link>
             <div className="h-10 w-px bg-zinc-200 mx-4"></div>
             <span className="text-[11px] font-black text-zinc-400 uppercase tracking-widest leading-none">Payment Gateway</span>
          </div>
          <div className="flex items-center gap-10">
            <Link to="/" className="text-[11px] font-black uppercase tracking-[0.2em] hover:text-[#005ea2] transition-colors">Home</Link>
            <Link to="/pricing" className="text-[11px] font-black uppercase tracking-[0.2em] hover:text-[#005ea2] transition-colors">Pricing</Link>
            <button onClick={() => navigate(-1)} className="text-[10px] font-black bg-black text-white px-5 py-2.5 uppercase tracking-[0.2em] hover:bg-[#333] transition-all shadow-sm">Cancel Payment</button>
          </div>
        </div>
      </nav>

      <main className="max-w-[1400px] mx-auto px-6 py-24 lg:py-32">
        
        {/* 3. HERO TITLE SECTION */}
        <div className="mb-28">
          <div className="text-[13px] font-black text-[#005ea2] uppercase tracking-[0.4em] mb-6 flex items-center gap-3">
             <Landmark size={18}/> Subscription Payment
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 uppercase leading-[0.9] text-black">Complete<br/>Payment</h1>
          <div className="h-2 w-32 bg-[#005ea2] mb-14"></div>
          <p className="max-w-2xl text-xl text-zinc-500 font-light leading-relaxed">
            Complete your payment to activate your VyaparSetu account. Please follow the instructions below to transfer the funds and submit your transaction details.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-24">
          
          {/* 4. SIDEBAR NAVIGATION (Functional Scroll Spy) */}
          <aside className="w-full lg:w-80 shrink-0">
            <div className="sticky top-48">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-10 pb-4 border-b border-zinc-100">On this page</h3>
              <ul className="space-y-0 border-l-4 border-zinc-100">
                {[
                  { id: 'beneficiary', label: 'Payee Details' },
                  { id: 'qr', label: 'Pay via UPI' },
                  { id: 'bank', label: 'Bank Transfer' },
                  { id: 'protocols', label: 'Payment Rules' },
                  { id: 'kyc', label: 'Submit UTR Details' },
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
                      className={`w-full text-left py-4 px-8 text-[12px] uppercase tracking-[0.15em] transition-all border-l-4 -ml-1 ${activeSection === item.id ? 'border-[#005ea2] font-black text-[#005ea2] bg-zinc-50/50' : 'border-transparent text-zinc-400 hover:text-black hover:bg-zinc-50'}`}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
              
              <div className="mt-16 p-8 bg-zinc-900 text-white relative group border border-zinc-800">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform"><Briefcase size={80}/></div>
                <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4">Selected Plan</p>
                <div className="text-xl font-bold uppercase mb-2 tracking-tight">{selectedPlan.name}</div>
                <div className="text-3xl font-black text-[#005ea2]">{selectedPlan.priceLabel}</div>
              </div>
            </div>
          </aside>

          {/* 5. MAIN CONTENT AREA */}
          <div className="flex-1 max-w-4xl space-y-40">
            
            {/* SECTION 1: BENEFICIARY PROFILE (With Switch Toggle) */}
            <section ref={sectionRefs.beneficiary} className="scroll-mt-48">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                 <div>
                   <h2 className="text-4xl font-bold tracking-tight mb-4 uppercase text-black">Payee Details</h2>
                   <p className="text-lg text-zinc-600 font-light leading-relaxed">
                     Select a developer account to make the direct payment for your software subscription.
                   </p>
                 </div>
                 <div className="bg-zinc-100 p-1.5 rounded-sm flex gap-1 border border-zinc-200 shadow-inner">
                    <button 
                      onClick={() => setActiveDeveloper('arun')}
                      className={`px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeDeveloper === 'arun' ? 'bg-[#005ea2] text-white shadow-md' : 'text-zinc-400 hover:text-zinc-600'}`}
                    >
                      Arun.A
                    </button>
                    <button 
                      onClick={() => setActiveDeveloper('palak')}
                      className={`px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeDeveloper === 'palak' ? 'bg-[#005ea2] text-white shadow-md' : 'text-zinc-400 hover:text-zinc-600'}`}
                    >
                      Palak.B
                    </button>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 p-12 border border-zinc-200 bg-white shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03]"><Layers size={140}/></div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 block mb-4">Account Holder Name</label>
                  <p className="text-3xl font-bold text-black uppercase tracking-tighter leading-none mb-4">{developerInfo[activeDeveloper].name}</p>
                  <p className="text-xs text-[#005ea2] font-black tracking-[0.1em] uppercase">{developerInfo[activeDeveloper].role} <br/><span className="text-zinc-500 font-bold">VyaparSetu Technologies</span></p>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 block mb-4">UPI ID (VPA)</label>
                  <div className="flex items-center gap-4 bg-zinc-50 p-4 border border-zinc-100 rounded-sm">
                    <p className="text-lg font-mono font-black text-black select-all uppercase tracking-wide">{developerInfo[activeDeveloper].vpa}</p>
                    <button className="text-zinc-300 hover:text-[#005ea2] transition-colors"><ExternalLink size={20}/></button>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 2: DIGITAL SETTLEMENT HUB */}
            <section ref={sectionRefs.qr} className="scroll-mt-48">
              <h2 className="text-4xl font-bold tracking-tight mb-8 uppercase text-black">Pay via UPI (QR Code)</h2>
              <p className="text-zinc-600 mb-16 leading-relaxed text-lg font-light">
                Scan the QR code below using GPay, PhonePe, Paytm, or any BHIM UPI app. Please verify the receiver name shows as <strong className="text-black uppercase">{developerInfo[activeDeveloper].name}</strong> before entering your UPI PIN.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {developerInfo[activeDeveloper].qrCodes.map((qr, idx) => (
                  <div key={idx} className="border border-zinc-200 bg-white p-8 group hover:border-[#005ea2] transition-all flex flex-col items-center shadow-sm hover:shadow-md">
                    <div className="aspect-square bg-zinc-50 mb-8 flex items-center justify-center overflow-hidden border border-zinc-100 p-2 group-hover:bg-white transition-all w-full">
                       <img src={qr.src} alt={qr.label} className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all opacity-50 group-hover:opacity-100" />
                    </div>
                    <div className="text-[10px] font-black text-center uppercase tracking-[0.3em] text-zinc-400 group-hover:text-black">{qr.label}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* SECTION 3: BANK ROUTING MATRIX */}
            <section ref={sectionRefs.bank} className="scroll-mt-48">
              <h2 className="text-4xl font-bold tracking-tight mb-8 uppercase text-black">Bank Transfer (NEFT/IMPS)</h2>
              <p className="text-zinc-600 mb-12 leading-relaxed text-lg font-light">
                If you prefer net banking, use the following bank account details to transfer your subscription fee via NEFT, IMPS, or RTGS.
              </p>
              <div className="bg-black text-white p-12 grid grid-cols-1 md:grid-cols-2 gap-16 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-8 opacity-5"><Building size={160}/></div>
                <div className="z-10">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] block mb-3">Bank Name</span>
                  <p className="text-2xl font-bold text-white uppercase tracking-tight">{developerInfo[activeDeveloper].bankName}</p>
                </div>
                <div className="z-10">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] block mb-3">Account Holder Name</span>
                  <p className="text-2xl font-bold text-white uppercase tracking-tight">{developerInfo[activeDeveloper].name}</p>
                </div>
                <div className="z-10">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] block mb-3">Account Number</span>
                  <p className="text-2xl font-mono font-black tracking-[0.2em] text-[#005ea2] uppercase">{developerInfo[activeDeveloper].acc}</p>
                </div>
                <div className="z-10">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] block mb-3">IFSC Code</span>
                  <p className="text-2xl font-mono font-black text-white tracking-[0.2em] uppercase">{developerInfo[activeDeveloper].ifsc}</p>
                </div>
              </div>
            </section>

            {/* SECTION 4: CLEARANCE RULES */}
            <section ref={sectionRefs.protocols} className="scroll-mt-48">
              <h2 className="text-4xl font-bold tracking-tight mb-10 uppercase text-black">Payment Guidelines</h2>
              <div className="space-y-12">
                <div className="flex gap-12 items-start border-b border-zinc-100 pb-10">
                   <div className="w-16 h-16 bg-[#005ea2] flex items-center justify-center font-black text-white text-xl shrink-0 shadow-lg">01</div>
                   <div>
                     <h4 className="text-sm font-black uppercase tracking-widest mb-3 text-black">Match Your Details</h4>
                     <p className="text-zinc-500 leading-loose font-light">
                       Please ensure that the payment is made from a bank account belonging to the business name or owner name you enter in the form below. Payments from unknown third-party accounts may face delays in verification.
                     </p>
                   </div>
                </div>
                <div className="flex gap-12 items-start">
                   <div className="w-16 h-16 bg-black flex items-center justify-center font-black text-white text-xl shrink-0 shadow-lg">02</div>
                   <div>
                     <h4 className="text-sm font-black uppercase tracking-widest mb-3 text-black">Mandatory UTR Number</h4>
                     <p className="text-zinc-500 leading-loose font-light">
                       After making the payment, you must copy the 12-digit UTR (Unique Transaction Reference) number from your banking app. This number is strictly required to track and verify your payment successfully.
                     </p>
                   </div>
                </div>
              </div>
            </section>

            {/* SECTION 5: WHITELISTING FORM (KYC) */}
            <section ref={sectionRefs.kyc} className="scroll-mt-48">
              <div className="bg-[#1b1b1b] text-white p-16 lg:p-24 border-t-[12px] border-[#005ea2] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-5"><Fingerprint size={120}/></div>
                <h2 className="text-5xl font-black tracking-tighter mb-6 uppercase text-white leading-none">Submit Payment Details</h2>
                <p className="text-zinc-400 text-[11px] font-black mb-16 uppercase tracking-[0.4em]">Fill this form after successful payment</p>

                {error && (
                  <div className="bg-red-950/40 text-red-400 p-8 border-l-8 border-red-500 mb-12 text-sm font-bold flex gap-5 items-center">
                    <AlertCircle size={24} className="shrink-0"/> <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-16">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-14">
                    <div className="space-y-6">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 block">01. Billing Name (As per Plan Registration)</label>
                      <input 
                        name="fullName" value={formData.fullName} onChange={handleChange}
                        className="w-full bg-transparent border-b-2 border-zinc-800 py-5 focus:outline-none focus:border-[#005ea2] transition-colors font-bold text-xl text-white uppercase placeholder:text-zinc-800" 
                        placeholder="STORE OR BUSINESS NAME" 
                      />
                    </div>

                    <div className="space-y-6">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 block">02. Account Registration Email</label>
                      <input 
                        type="email" name="email" value={formData.email} onChange={handleChange}
                        className="w-full bg-transparent border-b-2 border-zinc-800 py-5 focus:outline-none focus:border-[#005ea2] transition-colors font-bold text-xl text-white uppercase placeholder:text-zinc-800" 
                        placeholder="EMAIL FOR PLAN ACTIVATION" 
                      />
                    </div>

                    <div className="space-y-6">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 block">03. Owner Mobile Number</label>
                      <input 
                        type="tel" name="phone" value={formData.phone} onChange={handleChange}
                        className="w-full bg-transparent border-b-2 border-zinc-800 py-5 focus:outline-none focus:border-[#005ea2] transition-colors font-bold text-xl text-white uppercase placeholder:text-zinc-800" 
                        placeholder="+91-00000-00000" 
                      />
                    </div>

                    <div className="space-y-6">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 block text-[#00e676]">04. 12-Digit UTR / Transaction ID</label>
                      <input 
                        name="utrNumber" value={formData.utrNumber} onChange={handleChange}
                        className="w-full bg-black border border-zinc-800 p-8 focus:outline-none focus:border-[#00e676] transition-all font-mono font-black text-3xl text-center uppercase tracking-[0.3em] text-[#00e676]" 
                        placeholder="12 DIGIT ID" 
                      />
                    </div>
                  </div>

                  <div className="pt-20 border-t border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-12">
                    <div>
                       <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] block mb-4">TOTAL AMOUNT PAID</span>
                       <div className="flex items-baseline gap-4">
                         <span className="text-5xl font-black text-[#005ea2] tracking-tighter uppercase">{selectedPlan.priceLabel}</span>
                         <span className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.2em]">Subscription Fee</span>
                       </div>
                    </div>
                    
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full md:w-auto bg-[#005ea2] hover:bg-[#004a80] text-white font-black py-7 px-20 uppercase tracking-[0.4em] text-[12px] shadow-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-6"
                    >
                      {isLoading ? <Loader2 className="animate-spin" size={20}/> : <ShieldCheck size={20}/>}
                      {isLoading ? 'SUBMITTING DETAILS...' : 'SUBMIT PAYMENT RECEIPT'}
                    </button>
                  </div>
                </form>
              </div>
            </section>

            {/* SECTION 6: SECURITY ARCHITECTURE */}
            <section ref={sectionRefs.security} className="scroll-mt-48">
              <h2 className="text-4xl font-bold tracking-tight mb-12 uppercase flex items-center gap-6 text-black">
                <Lock className="text-[#005ea2]" size={40}/> Payment Security
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                <div className="p-10 border border-zinc-100 bg-zinc-50/50 hover:bg-white transition-colors border-l-4 border-l-[#005ea2] shadow-sm">
                   <h4 className="text-[11px] font-black uppercase tracking-[0.25em] mb-6 text-black">Bank-Grade Encryption</h4>
                   <p className="text-sm text-zinc-500 leading-loose font-light">
                     Your payment details, UTR numbers, and business information are encrypted using 256-bit banking standard encryption before being sent to our secure servers.
                   </p>
                </div>
                <div className="p-10 border border-zinc-100 bg-zinc-50/50 hover:bg-white transition-colors border-l-4 border-l-black shadow-sm">
                   <h4 className="text-[11px] font-black uppercase tracking-[0.25em] mb-6 text-black">Fraud Prevention</h4>
                   <p className="text-sm text-zinc-500 leading-loose font-light">
                     Every submitted UTR is checked directly against the official bank statement to prevent duplicate submissions and protect against fraudulent payment claims.
                   </p>
                </div>
              </div>
            </section>

            {/* NEW SECTION 7: AUDIT LOGS */}
            <section ref={sectionRefs.audit} className="scroll-mt-48">
              <h2 className="text-4xl font-bold tracking-tight mb-8 uppercase text-black">Transaction Tracking</h2>
              <div className="bg-zinc-50 border border-zinc-200 p-12 text-center shadow-inner">
                 <Database className="mx-auto text-zinc-300 mb-6" size={48}/>
                 <p className="text-zinc-600 leading-relaxed font-light text-sm italic max-w-2xl mx-auto">
                   For security and tracking purposes, your IP address and submission timestamp are logged securely. This helps our support team locate your transaction quickly if there is a banking delay.
                 </p>
              </div>
            </section>

            {/* NEW SECTION 8: RESPONSE SLA */}
            <section ref={sectionRefs.sla} className="scroll-mt-48">
              <h2 className="text-4xl font-bold tracking-tight mb-10 uppercase flex items-center gap-6 text-black">
                <Activity className="text-[#005ea2]" size={40}/> Activation Timeline
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                 <div className="space-y-3">
                   <h5 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Verification Time</h5>
                   <p className="text-2xl font-bold text-black">2 - 4 Hours</p>
                 </div>
                 <div className="space-y-3 border-l md:border-l border-zinc-200 md:pl-10">
                   <h5 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">System Uptime</h5>
                   <p className="text-2xl font-bold text-[#00e676]">24/7 Active</p>
                 </div>
                 <div className="space-y-3 border-l md:border-l border-zinc-200 md:pl-10">
                   <h5 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Priority Processing</h5>
                   <p className="text-2xl font-bold text-black">For Paid Plans</p>
                 </div>
              </div>
            </section>

            {/* NEW SECTION 9: REFUND STATUTES */}
            <section ref={sectionRefs.refunds} className="scroll-mt-48">
              <h2 className="text-4xl font-bold tracking-tight mb-8 uppercase text-black">Refund Policy</h2>
              <div className="prose prose-zinc max-w-none text-zinc-600 font-light leading-loose text-base border-l-2 border-zinc-200 pl-8">
                <p>
                  As per our standard billing policy, subscription fees are non-refundable once your account has been successfully activated. If you made an accidental duplicate payment, please contact our support team within 24 hours with both UTR numbers for a full refund of the duplicate amount.
                </p>
              </div>
            </section>

            {/* SECTION 10: LEGAL CHARTER */}
            <section ref={sectionRefs.governance} className="scroll-mt-48">
              <h2 className="text-4xl font-bold tracking-tight mb-10 uppercase flex items-center gap-6 text-black">
                <Scale className="text-[#005ea2]" size={40}/> Terms & Conditions
              </h2>
              <div className="prose prose-zinc max-w-none text-zinc-600 font-light leading-loose text-base border-l-2 border-zinc-200 pl-8">
                <p>
                  VyaparSetu actively monitors for fake or duplicate UTR submissions. Any intentional attempt to submit false payment receipts to gain free access will lead to the permanent blacklisting of your mobile number and email ID from the VyaparSetu network.
                </p>
              </div>
            </section>

            {/* NEW SECTION 11: PRIVACY NODE */}
            <section ref={sectionRefs.privacy} className="scroll-mt-48">
              <h2 className="text-4xl font-bold tracking-tight mb-10 uppercase flex items-center gap-6 text-black">
                <Shield className="text-[#005ea2]" size={40}/> Data Privacy
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-zinc-50 p-10 border border-zinc-200">
                 <div className="space-y-4">
                   <Globe className="text-zinc-300" size={32}/>
                   <h4 className="text-[11px] font-black uppercase tracking-widest text-black">Secure Storage</h4>
                   <p className="text-sm text-zinc-500 font-light leading-relaxed">Your payment information is stored locally on highly secure Indian servers in strict compliance with government data localization guidelines.</p>
                 </div>
                 <div className="space-y-4">
                   <Database className="text-zinc-300" size={32}/>
                   <h4 className="text-[11px] font-black uppercase tracking-widest text-black">Data Deletion</h4>
                   <p className="text-sm text-zinc-500 font-light leading-relaxed">Temporary verification files and receipt tracking data are deleted automatically from our active memory 12 hours after your account is successfully activated.</p>
                 </div>
              </div>
            </section>

            {/* NEW SECTION 12: INVOICING DETAILS */}
            <section ref={sectionRefs.invoice} className="scroll-mt-48">
              <h2 className="text-4xl font-bold tracking-tight mb-8 uppercase text-black">Invoicing & Tax</h2>
              <div className="prose prose-zinc max-w-none text-zinc-600 font-light leading-loose text-base border-l-2 border-zinc-200 pl-8">
                <p>Once your payment is verified and your chosen pricing plan is activated, a formal GST invoice will be generated and dispatched to your registered email address.</p>
              </div>
            </section>

            {/* NEW SECTION 13: DISPUTE RESOLUTION */}
            <section ref={sectionRefs.dispute} className="scroll-mt-48">
              <h2 className="text-4xl font-bold tracking-tight mb-8 uppercase text-black">Dispute Resolution</h2>
              <div className="prose prose-zinc max-w-none text-zinc-600 font-light leading-loose text-base border-l-2 border-zinc-200 pl-8">
                <p>In case of mismatched UTRs or debited amounts without plan activation, a formal dispute can be raised. Reconciliations generally conclude within 3-5 bank working days.</p>
              </div>
            </section>

            {/* NEW SECTION 14: SERVICE INTERRUPTIONS */}
            <section ref={sectionRefs.downtime} className="scroll-mt-48">
              <h2 className="text-4xl font-bold tracking-tight mb-8 uppercase text-black">Service Interruptions</h2>
              <div className="prose prose-zinc max-w-none text-zinc-600 font-light leading-loose text-base border-l-2 border-zinc-200 pl-8">
                <p>If VyaparSetu undergoes scheduled maintenance, your billing cycle will be credited with proportional extended access. Unplanned downtime compensation is governed by our Terms of Service.</p>
              </div>
            </section>

            {/* NEW SECTION 15: ACCOUNT SUSPENSION */}
            <section ref={sectionRefs.suspension} className="scroll-mt-48">
              <h2 className="text-4xl font-bold tracking-tight mb-8 uppercase text-black">Account Suspension</h2>
              <div className="prose prose-zinc max-w-none text-zinc-600 font-light leading-loose text-base border-l-2 border-zinc-200 pl-8">
                <p>Failure to renew your selected pricing plan within 7 days of expiry will result in temporary suspension of intelligence features. Data is retained for 30 days post-suspension.</p>
              </div>
            </section>

            {/* SECTION 16: TECHNICAL DESK */}
            <section ref={sectionRefs.help} className="scroll-mt-48 pb-40">
               <div className="bg-[#111] p-16 lg:p-24 border border-zinc-800 relative overflow-hidden text-white shadow-2xl">
                  <div className="absolute bottom-0 right-0 p-8 opacity-10"><HelpCircle size={140}/></div>
                  <h3 className="text-3xl font-bold mb-12 uppercase tracking-tighter flex items-center gap-5">
                    <Cpu className="text-[#005ea2]" size={32}/> Help & Support
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-16 relative z-10">
                     <div className="space-y-4 border-b md:border-b-0 md:border-r border-zinc-800 pb-8 md:pb-0">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 block">Email Support</span>
                        <div className="flex items-center gap-4 text-white font-black text-lg">
                           <Mail size={24} className="text-[#005ea2]"/> support@vyaparsetu.tech
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

      {/* INSTITUTIONAL FOOTER */}
      <footer className="bg-white border-t border-zinc-100 py-32 px-10 relative z-[120]">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-16">
           <div className="flex flex-col items-center md:items-start">
             <div className="text-[12px] font-black tracking-[0.5em] text-black uppercase mb-4">VyaparSetu Technologies</div>
             <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Secure Payment Gateway v2.4</div>
           </div>
           <div className="flex gap-20 text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400">
              <a href="#" className="hover:text-[#005ea2] transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-[#005ea2] transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-[#005ea2] transition-colors">Help Center</a>
           </div>
        </div>
      </footer>

    </div>
  );
}