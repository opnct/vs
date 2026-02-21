import React, { useState, useEffect } from 'react';
import { ArrowDown, ArrowRight, ShieldAlert, MessageCircle, BarChart3, Lock, BellRing, Smartphone, CheckCircle2, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FeatureUdhaar() {
  // --- REAL-TIME LOGIC: Live Sync Clock ---
  const [syncTime, setSyncTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setSyncTime(new Date()), 5000); // Update sync time every 5s
    return () => clearInterval(timer);
  }, []);

  // --- INTERACTIVE LOGIC: Udhaar Ledger Simulator ---
  const initialLedger = [
    { id: 1, name: "Suresh Hardware", phone: "+91 98*** **123", amount: 12500, daysOverdue: 14, risk: "High", reminding: false, reminded: false },
    { id: 2, name: "Anita Sharma", phone: "+91 87*** **456", amount: 3200, daysOverdue: 2, risk: "Medium", reminding: false, reminded: false },
    { id: 3, name: "Rajesh Kumar", phone: "+91 99*** **789", amount: 840, daysOverdue: 0, risk: "Low", reminding: false, reminded: false }
  ];

  const [ledger, setLedger] = useState(initialLedger);
  const [totalRecovered, setTotalRecovered] = useState(0);

  const handleRemind = (id) => {
    setLedger(prev => prev.map(c => c.id === id ? { ...c, reminding: true } : c));
    setTimeout(() => {
      setLedger(prev => prev.map(c => c.id === id ? { ...c, reminding: false, reminded: true } : c));
    }, 1500); // Simulate network request for WhatsApp API
  };

  const handleSettle = (id, amount) => {
    setLedger(prev => prev.filter(c => c.id !== id));
    setTotalRecovered(prev => prev + amount);
  };

  const totalOutstanding = ledger.reduce((sum, c) => sum + c.amount, 0);

  return (
    <div className="flex flex-col w-full bg-white text-black animate-in fade-in duration-700 min-h-screen">
      
      {/* SECTION 1: HERO SECTION */}
      <section className="relative w-full h-[60vh] min-h-[500px] flex items-center justify-start px-6 md:px-12 lg:px-24 overflow-hidden border-b border-[#333]">
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 to-black/40 z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1573164574572-cb89e39749b4?auto=format&fit=crop&q=80" 
          alt="Ledger Notebook and Mobile" 
          className="absolute inset-0 w-full h-full object-cover z-0 object-center opacity-40 grayscale"
        />
        
        <div className="relative z-20 max-w-4xl pt-16">
          <div className="bg-[#005ea2] text-white text-[11px] font-bold px-2 py-1 rounded-sm inline-flex items-center w-max mb-6 uppercase tracking-wider">
            Vyapar Theme Module
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-[6rem] font-bold text-white tracking-tight leading-[1.05] mb-6 uppercase">
            UDHAAR <br /> INTELLIGENCE
          </h1>
          <p className="text-xl md:text-2xl text-[#cccccc] max-w-2xl font-normal tracking-wide mb-10">
            Reclaim your working capital. Digitize customer khata, assess credit risk dynamically, and automate recovery via official WhatsApp integrations.
          </p>
          <a 
            href="#simulator"
            className="inline-flex items-center gap-3 bg-[#005ea2] hover:bg-[#0b4774] text-white px-8 py-4 font-bold tracking-wider transition-colors text-[13px] uppercase rounded-sm mb-20 md:mb-28"
          >
            Try Ledger Simulator <ArrowDown size={18} strokeWidth={2.5}/>
          </a>
        </div>
      </section>

      {/* SECTION 2: INTERACTIVE LEDGER SIMULATOR */}
      <section id="simulator" className="w-full py-24 px-6 md:px-12 lg:px-24 bg-gray-50 border-b border-gray-200 scroll-mt-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
            <div>
              <h2 className="text-[22px] font-bold tracking-widest uppercase mb-4 text-black">
                LIVE LEDGER DEMONSTRATION
              </h2>
              <p className="text-[#555555] max-w-3xl text-[17px] leading-relaxed">
                Interact with the mock ledger below. Send automated payment links or settle accounts to see how VyaparSetu streamlines capital recovery.
              </p>
            </div>
            <div className="bg-white border border-gray-200 px-4 py-2 rounded-sm shadow-sm flex items-center gap-3 text-[13px] font-mono text-[#555]">
              <RefreshCw size={14} className="animate-spin text-[#005ea2]" />
              Cloud Sync: {syncTime.toLocaleTimeString()}
            </div>
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white border border-gray-200 p-6 rounded-sm shadow-sm">
              <p className="text-[13px] font-bold text-gray-500 uppercase tracking-widest mb-2">Total Outstanding</p>
              <p className="text-4xl font-bold tracking-tight text-red-600">₹{totalOutstanding.toLocaleString()}</p>
            </div>
            <div className="bg-white border border-gray-200 p-6 rounded-sm shadow-sm">
              <p className="text-[13px] font-bold text-gray-500 uppercase tracking-widest mb-2">Capital Recovered</p>
              <p className="text-4xl font-bold tracking-tight text-green-600">₹{totalRecovered.toLocaleString()}</p>
            </div>
            <div className="bg-white border border-gray-200 p-6 rounded-sm shadow-sm">
              <p className="text-[13px] font-bold text-gray-500 uppercase tracking-widest mb-2">Active Accounts</p>
              <p className="text-4xl font-bold tracking-tight text-black">{ledger.length}</p>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="bg-white border border-gray-200 rounded-sm shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#111111] text-white text-[13px] uppercase tracking-widest">
                    <th className="p-4 font-bold">Customer</th>
                    <th className="p-4 font-bold">Amount Due</th>
                    <th className="p-4 font-bold">Risk Profile</th>
                    <th className="p-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {ledger.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-8 text-center text-gray-500 font-bold tracking-widest uppercase">All accounts settled. Zero outstanding!</td>
                    </tr>
                  ) : (
                    ledger.map(customer => (
                      <tr key={customer.id} className="hover:bg-gray-50 transition-colors animate-in slide-in-from-left-2">
                        <td className="p-4">
                          <p className="font-bold text-[15px]">{customer.name}</p>
                          <p className="text-xs text-gray-500 mt-1">{customer.phone}</p>
                        </td>
                        <td className="p-4">
                          <p className="font-bold text-[15px] text-red-600">₹{customer.amount.toLocaleString()}</p>
                          <p className="text-xs text-gray-500 mt-1">{customer.daysOverdue > 0 ? `${customer.daysOverdue} days overdue` : 'Due today'}</p>
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase ${
                            customer.risk === 'High' ? 'bg-red-100 text-red-700' : 
                            customer.risk === 'Medium' ? 'bg-orange-100 text-orange-700' : 
                            'bg-green-100 text-green-700'
                          }`}>
                            {customer.risk} RISK
                          </span>
                        </td>
                        <td className="p-4 flex items-center justify-end gap-3">
                          <button 
                            onClick={() => handleRemind(customer.id)}
                            disabled={customer.reminding || customer.reminded}
                            className={`flex items-center gap-2 px-4 py-2 rounded-sm text-[12px] font-bold tracking-wider uppercase transition-all ${
                              customer.reminded 
                                ? 'bg-green-100 text-green-700 border border-green-200' 
                                : 'bg-[#e6f4ff] text-[#005ea2] hover:bg-[#cce8ff] border border-[#b3dcf2]'
                            }`}
                          >
                            {customer.reminding ? <RefreshCw size={14} className="animate-spin" /> : 
                             customer.reminded ? <CheckCircle2 size={14} /> : 
                             <MessageCircle size={14} />}
                            {customer.reminding ? 'Sending...' : customer.reminded ? 'Sent' : 'Remind'}
                          </button>
                          <button 
                            onClick={() => handleSettle(customer.id, customer.amount)}
                            className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-sm text-[12px] font-bold tracking-wider uppercase transition-colors"
                          >
                            Settle
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: RISK SCORING ANALYSIS */}
      <section className="w-full py-24 px-6 md:px-12 lg:px-24 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2 w-full">
            <h2 className="text-[22px] font-bold tracking-widest uppercase mb-8 text-black">
              PROPRIETARY RISK SCORING
            </h2>
            <p className="text-[17px] leading-[1.65] text-[#333333] mb-6">
              Not all credit is equal. VyaparSetu's Udhaar Intelligence evaluates customer payment history, frequency of purchases, and local default trends to assign a dynamic risk score to every khata account.
            </p>
            <p className="text-[17px] leading-[1.65] text-[#333333]">
              Before approving large credit requests, cashiers are visually warned if an account breaches the <strong>High Risk</strong> threshold, protecting your store from bad debt before it happens.
            </p>
          </div>
          <div className="lg:w-1/2 w-full bg-gray-50 border border-gray-200 p-8 rounded-sm shadow-sm flex flex-col gap-6">
             {/* Mock visual dials */}
             <div className="flex items-center justify-between border-b border-gray-200 pb-4">
               <div className="flex items-center gap-4"><ShieldAlert className="text-red-500" size={32}/> <div><p className="font-bold text-[15px]">Score: 320</p><p className="text-xs text-gray-500">High Default Risk</p></div></div>
               <span className="text-red-600 font-bold uppercase tracking-wider text-[11px] bg-red-100 px-3 py-1 rounded-sm">Credit Denied</span>
             </div>
             <div className="flex items-center justify-between border-b border-gray-200 pb-4">
               <div className="flex items-center gap-4"><BarChart3 className="text-orange-500" size={32}/> <div><p className="font-bold text-[15px]">Score: 650</p><p className="text-xs text-gray-500">Average Payer</p></div></div>
               <span className="text-orange-600 font-bold uppercase tracking-wider text-[11px] bg-orange-100 px-3 py-1 rounded-sm">Limit: ₹2000</span>
             </div>
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-4"><CheckCircle2 className="text-green-500" size={32}/> <div><p className="font-bold text-[15px]">Score: 890</p><p className="text-xs text-gray-500">Excellent Record</p></div></div>
               <span className="text-green-600 font-bold uppercase tracking-wider text-[11px] bg-green-100 px-3 py-1 rounded-sm">Limit: ₹10,000+</span>
             </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: COMMUNICATION INFRASTRUCTURE (Topographic Dark Section) */}
      <section className="relative w-full bg-[#181818] py-24 px-6 md:px-12 lg:px-24 overflow-hidden border-b border-[#333]">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(circle_at_center,_transparent_0,_transparent_10px,_white_11px,_white_12px)] [background-size:60px_60px]"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto">
          <h2 className="text-[22px] font-bold tracking-widest uppercase mb-12 text-white">
            COMMUNICATION INFRASTRUCTURE
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[#222222] border border-[#333333] p-8 rounded-sm hover:border-[#555] transition-colors">
              <MessageCircle className="text-[#005ea2] mb-6" size={36} strokeWidth={1.5} />
              <h3 className="text-xl font-bold tracking-wide mb-3 text-white">WhatsApp Official API</h3>
              <p className="text-[#aaaaaa] leading-relaxed text-[14px]">
                Deliver highly professional, itemized PDF receipts and UPI payment links directly to the customer's WhatsApp, leveraging VyaparSetu's verified business infrastructure.
              </p>
            </div>

            <div className="bg-[#222222] border border-[#333333] p-8 rounded-sm hover:border-[#555] transition-colors">
              <BellRing className="text-[#005ea2] mb-6" size={36} strokeWidth={1.5} />
              <h3 className="text-xl font-bold tracking-wide mb-3 text-white">Automated Escalation</h3>
              <p className="text-[#aaaaaa] leading-relaxed text-[14px]">
                Configure rules to send a polite reminder on day 1, an SMS alert on day 7, and automatically restrict further POS credit billing if the account hits day 14.
              </p>
            </div>

            <div className="bg-[#222222] border border-[#333333] p-8 rounded-sm hover:border-[#555] transition-colors">
              <Smartphone className="text-[#005ea2] mb-6" size={36} strokeWidth={1.5} />
              <h3 className="text-xl font-bold tracking-wide mb-3 text-white">Regional Languages</h3>
              <p className="text-[#aaaaaa] leading-relaxed text-[14px]">
                Communicate respectfully and effectively. Messages are auto-translated into Hindi, Marathi, Telugu, Tamil, and 6 other local languages based on customer preference.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: SECURITY & COMPLIANCE */}
      <section className="w-full py-24 px-6 md:px-12 lg:px-24 bg-gray-100 border-b border-gray-200">
        <div className="max-w-4xl mx-auto text-center">
          <Lock className="text-[#005ea2] mx-auto mb-6" size={48} strokeWidth={1.5}/>
          <h2 className="text-[22px] font-bold tracking-widest uppercase mb-6 text-black">
            BANK-GRADE DATA PROTECTION
          </h2>
          <p className="text-[17px] leading-[1.65] text-[#555555] mb-8">
            Your ledger is the financial heartbeat of your store. VyaparSetu utilizes 256-bit AES encryption to ensure that your customer data, outstanding balances, and transaction history are completely secure. Data is never shared with third-party aggregators, ensuring absolute privacy for your local business.
          </p>
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 border border-gray-300 rounded-sm text-[11px] font-bold uppercase tracking-wider text-gray-600 shadow-sm">
            <CheckCircle2 size={14} className="text-green-600"/> ISO 27001 Certified Infrastructure
          </div>
        </div>
      </section>

      {/* SECTION 6: FOOTER CTA */}
      <section className="w-full bg-[#0a0a0a] py-24 px-6 md:px-12 lg:px-24 border-t border-[#333]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-[3.5rem] md:text-[5rem] font-bold tracking-tight text-white mb-8 uppercase leading-[1.05]">
            RECOVER YOUR <br className="hidden md:block" /> CAPITAL
          </h2>
          <p className="text-[#aaaaaa] text-lg md:text-xl max-w-3xl leading-relaxed mb-12">
            Stores using VyaparSetu's Udhaar Intelligence see a 40% reduction in overdue accounts within the first 60 days. Stop relying on memory and fragile notebooks. Digitize your credit systems today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              to="/pricing" 
              className="inline-flex justify-center items-center gap-3 bg-[#005ea2] hover:bg-[#0b4774] text-white px-8 py-4 font-bold tracking-wider uppercase transition-colors text-[13px] rounded-sm"
            >
              View Pricing Plans <ArrowRight size={18} strokeWidth={2.5}/>
            </Link>
            <Link 
              to="/contact" 
              className="inline-flex justify-center items-center gap-3 bg-white hover:bg-gray-200 text-black px-8 py-4 font-bold tracking-wider uppercase transition-colors text-[13px] rounded-sm"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}