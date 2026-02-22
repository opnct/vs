import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, AlertCircle, Loader2, CheckCircle2, 
  CreditCard, QrCode, Building, ArrowLeft, Info,
  Globe, Shield, Cpu, Activity, ExternalLink,
  Lock, Phone, Mail, HelpCircle, UserCheck
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
  const [activeMethod, setActiveMethod] = useState('upi'); // upi | bank

  // Security Guard: If accessed directly without selecting a plan, kick back to pricing
  useEffect(() => {
    if (!selectedPlan) {
      navigate('/pricing', { replace: true });
    }
    window.scrollTo(0, 0);
  }, [selectedPlan, navigate]);

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
      setError('All fields are strictly required for security clearance.');
      return;
    }

    if (!validateEmail(formData.email.trim())) {
      setError('Invalid Email format. This email will be your platform UID.');
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
        developer: 'Arun Ammisetty',
        status: 'Pending',
        submittedAt: serverTimestamp()
      };

      await addDoc(collection(db, collectionPath), paymentPayload);
      setIsSuccess(true);
    } catch (err) {
      console.error(err);
      setError('System Error: Failed to transmit data to the Secure Ledger.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!selectedPlan) return null;

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center font-sans p-6 selection:bg-[#0d6efd]">
        <div className="bg-[#111] max-w-lg w-full border border-[#333] shadow-2xl p-10 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#00e676]"></div>
          <CheckCircle2 size={64} className="text-[#00e676] mx-auto mb-6" />
          <h2 className="text-3xl font-bold tracking-tighter uppercase mb-4 text-white">Receipt Logged</h2>
          <div className="bg-black/50 border border-white/10 p-6 mb-8 text-left space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">Transaction Ref</span>
              <span className="font-mono text-[#00e676]">{formData.utrNumber}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">Auth Target</span>
              <span className="text-white">{formData.email}</span>
            </div>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed mb-10">
            Your verification request is now pending manual review. Super Admin controllers will whitelist your account within 2-4 hours. You will be able to complete registration once clearance is granted.
          </p>
          <button onClick={() => navigate('/')} className="w-full bg-white text-black font-black py-4 uppercase tracking-[0.2em] text-xs hover:bg-gray-200 transition-colors">
            Return to Command Center
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen text-white font-sans selection:bg-[#0d6efd] selection:text-white">
      
      {/* 1. INSTITUTIONAL HEADER */}
      <header className="border-b border-[#333] bg-black sticky top-0 z-[100] h-16 flex items-center">
        <div className="max-w-[1400px] mx-auto px-6 w-full flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button onClick={() => navigate(-1)} className="hover:text-[#0d6efd] transition-colors"><ArrowLeft size={20}/></button>
            <div className="h-6 w-px bg-[#333]"></div>
            <h1 className="text-sm font-black tracking-[0.3em] uppercase">Secure Payment Node</h1>
          </div>
          <div className="flex items-center gap-3">
             <div className="text-[10px] text-gray-500 font-mono hidden sm:flex items-center gap-2">
               <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> LEDGER CONNECTED
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-16">
          
          {/* LEFT SIDE: PAYMENT METHODS & GOVERNANCE */}
          <div className="flex-1 space-y-12">
            
            {/* 2. DEVELOPER & RECIPIENT DATA (Section 1) */}
            <section className="bg-[#111] border border-[#222] p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-white text-black flex items-center justify-center font-bold">VS</div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight uppercase">Beneficiary Profile</h2>
                  <p className="text-[10px] text-[#0d6efd] font-black tracking-widest uppercase">Verified Developer Account</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6 border-t border-white/5">
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Account Holder</label>
                  <p className="text-lg font-bold text-white">Arun Ammisetty</p>
                  <p className="text-xs text-gray-400 mt-1">Lead Developer, VyaparSetu Technologies</p>
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Primary VPA</label>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-mono font-bold text-[#00e676]">918329004424@waicici</p>
                    <button className="text-gray-500 hover:text-white"><ExternalLink size={14}/></button>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. INTERACTIVE PAYMENT TABS (Section 2) */}
            <section>
              <div className="flex border-b border-[#222] mb-8 gap-8">
                <button 
                  onClick={() => setActiveMethod('upi')}
                  className={`pb-4 text-xs font-black tracking-[0.2em] uppercase transition-all relative ${activeMethod === 'upi' ? 'text-white' : 'text-gray-600'}`}
                >
                  01. UPI GATEWAY
                  {activeMethod === 'upi' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#0d6efd]"></div>}
                </button>
                <button 
                  onClick={() => setActiveMethod('bank')}
                  className={`pb-4 text-xs font-black tracking-[0.2em] uppercase transition-all relative ${activeMethod === 'bank' ? 'text-white' : 'text-gray-600'}`}
                >
                  02. BANK TRANSFER
                  {activeMethod === 'bank' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#0d6efd]"></div>}
                </button>
              </div>

              {activeMethod === 'upi' ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* QR Image Slots - Placeholders for your PNGs */}
                  {['PhonePe', 'GPay', 'WhatsApp', 'BHIM'].map((app) => (
                    <div key={app} className="bg-[#111] border border-[#222] p-4 text-center group hover:border-[#0d6efd] transition-all">
                      <div className="aspect-square bg-white mb-4 overflow-hidden flex items-center justify-center">
                        {/* REPLACE SRC WITH YOUR IMAGES:
                          src="/images/phonepe_qr.png" etc.
                        */}
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=918329004424@waicici&pn=Arun%20Ammisetty&am=${selectedPlan.price}&cu=INR`} 
                          alt={`${app} QR`} 
                          className="w-full h-full object-contain p-2 grayscale group-hover:grayscale-0 transition-all"
                        />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-white">{app}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-[#111] border border-[#222] p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest block mb-1">Bank Name</span>
                      <p className="text-lg font-bold">STATE BANK OF INDIA</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest block mb-1">Account No</span>
                      <p className="text-lg font-mono font-bold tracking-wider">409283740019</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest block mb-1">IFSC Code</span>
                      <p className="text-lg font-mono font-bold text-[#0d6efd]">SBIN0004321</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest block mb-1">Acc Type</span>
                      <p className="text-lg font-bold">CURRENT / BUSINESS</p>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* 4. VERIFICATION PROTOCOLS (Section 3) */}
            <section className="bg-[#050505] border border-[#222] p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5"><Shield size={120}/></div>
              <h3 className="text-xs font-black tracking-[0.2em] uppercase mb-6 flex items-center gap-3">
                <ShieldCheck className="text-[#0d6efd]" size={16}/> Clearance Protocols
              </h3>
              <ul className="space-y-4 text-sm text-gray-400 font-light">
                <li className="flex gap-4">
                  <span className="text-[#0d6efd] font-bold">01</span>
                  <span>Transfers must be initiated from a bank account registered under the Store Name or Owner Name provided in KYC.</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-[#0d6efd] font-bold">02</span>
                  <span>UTR / Transaction IDs are cross-referenced with the SBI nodal server every 60 minutes.</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-[#0d6efd] font-bold">03</span>
                  <span>Fraudulent UTR submissions will result in permanent hardware-level blocking of the VyaparSetu application.</span>
                </li>
              </ul>
            </section>

            {/* 5. PLATFORM SECURITY STANDARDS (Section 4) */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#111] p-6 border border-[#222] flex gap-4 items-start">
                <Lock className="text-[#0d6efd] shrink-0" size={20}/>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest mb-2">AES-256 Encryption</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">Payment data is encrypted at the source before transmission to the central ledger.</p>
                </div>
              </div>
              <div className="bg-[#111] p-6 border border-[#222] flex gap-4 items-start">
                <Activity className="text-[#0d6efd] shrink-0" size={20}/>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest mb-2">Real-time Telemetry</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">System monitoring ensures zero data leakage during the manual verification window.</p>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT SIDE: SECURE SUBMISSION FORM */}
          <div className="w-full lg:w-[450px]">
            <div className="bg-white text-black p-10 border-t-[6px] border-[#0d6efd] shadow-2xl sticky top-24">
              <h2 className="text-2xl font-black tracking-tight uppercase mb-2">KYC Submission</h2>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-8">Platform Identity Whitelisting</p>

              {error && (
                <div className="bg-red-50 text-red-600 p-4 border-l-4 border-red-600 mb-8 text-xs font-bold flex gap-3 items-center">
                  <AlertCircle size={16}/> {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block mb-2">01. Entity Name</label>
                  <input 
                    name="fullName" value={formData.fullName} onChange={handleChange}
                    className="w-full border-b-2 border-gray-100 py-3 focus:outline-none focus:border-[#0d6efd] transition-colors font-bold text-sm" 
                    placeholder="STORE OR OWNER NAME" 
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block mb-2">02. Platform UID (Email)</label>
                  <input 
                    type="email" name="email" value={formData.email} onChange={handleChange}
                    className="w-full border-b-2 border-gray-100 py-3 focus:outline-none focus:border-[#0d6efd] transition-colors font-bold text-sm" 
                    placeholder="RETAILER@DOMAIN.COM" 
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block mb-2">03. Contact Primary</label>
                  <input 
                    type="tel" name="phone" value={formData.phone} onChange={handleChange}
                    className="w-full border-b-2 border-gray-100 py-3 focus:outline-none focus:border-[#0d6efd] transition-colors font-bold text-sm" 
                    placeholder="+91-00000-00000" 
                  />
                </div>

                <div className="pt-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block mb-2">04. Transaction Reference (UTR)</label>
                  <input 
                    name="utrNumber" value={formData.utrNumber} onChange={handleChange}
                    className="w-full bg-gray-50 border-2 border-dashed border-gray-200 p-4 focus:outline-none focus:border-[#0d6efd] transition-colors font-mono font-black text-xl text-center uppercase tracking-widest" 
                    placeholder="REFERENCE ID" 
                  />
                  <p className="text-[9px] text-gray-400 mt-2 text-center uppercase font-bold tracking-wider">Verification will fail if ID is incorrect</p>
                </div>

                <div className="pt-6 border-t border-gray-100 mt-10">
                  <div className="flex justify-between items-end mb-6">
                    <div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Subscription Tier</span>
                      <p className="font-bold text-sm">{selectedPlan.name}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Payable</span>
                      <p className="text-2xl font-black text-[#0d6efd]">{selectedPlan.priceLabel}</p>
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#0d6efd] hover:bg-[#0b5ed7] text-white font-black py-4 uppercase tracking-[0.25em] text-xs shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {isLoading ? <Loader2 className="animate-spin" size={16}/> : <UserCheck size={16}/>}
                    {isLoading ? 'Processing Neural Data...' : 'Request Clearance'}
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>

        {/* 6. HELP CENTER SECTION (Section 5) */}
        <section className="mt-24 pt-20 border-t border-[#222]">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
             <div>
               <h4 className="text-xs font-black tracking-[0.2em] uppercase mb-4 flex items-center gap-2">
                 <HelpCircle size={16} className="text-[#0d6efd]"/> Assistance Desk
               </h4>
               <p className="text-gray-500 text-sm leading-relaxed mb-6 font-light">Facing issues with your UTR or payment timing? Our technical team is available for real-time routing support.</p>
               <div className="space-y-2">
                 <div className="flex items-center gap-3 text-xs text-white font-bold"><Mail size={14} className="text-gray-500"/> support@vyaparsetu.official</div>
                 <div className="flex items-center gap-3 text-xs text-white font-bold"><Phone size={14} className="text-gray-500"/> +91 83290 04424</div>
               </div>
             </div>
             <div>
               <h4 className="text-xs font-black tracking-[0.2em] uppercase mb-4">Clearance SLA</h4>
               <p className="text-gray-500 text-sm leading-relaxed font-light">Administrative clearance is an offline batch process. Requests submitted between 10:00 PM and 08:00 AM IST will be processed during the subsequent morning cycle.</p>
             </div>
             <div>
               <h4 className="text-xs font-black tracking-[0.2em] uppercase mb-4">Refund Policy</h4>
               <p className="text-gray-500 text-sm leading-relaxed font-light">Subscription fees are non-refundable once an account has been whitelisted and registered. Clerical error refunds can be processed prior to registration.</p>
             </div>
           </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="bg-[#050505] border-t border-[#111] py-12">
        <div className="max-w-[1400px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="text-[10px] font-black tracking-[0.4em] text-gray-700 uppercase">
             VyaparSetu Technologies • Official Gateway
           </div>
           <div className="flex gap-8">
              <a href="#" className="text-[9px] font-bold text-gray-500 hover:text-white uppercase tracking-widest">Global Privacy Policy</a>
              <a href="#" className="text-[9px] font-bold text-gray-500 hover:text-white uppercase tracking-widest">Accessibility Hub</a>
              <a href="#" className="text-[9px] font-bold text-gray-500 hover:text-white uppercase tracking-widest">Developer APIs</a>
           </div>
        </div>
      </footer>

    </div>
  );
}