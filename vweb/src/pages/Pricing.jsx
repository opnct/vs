import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <div className="animate-in fade-in duration-500 py-20 px-6 max-w-7xl mx-auto text-center">
      <h1 className="text-5xl font-black text-gray-900 mb-6">Simple, honest pricing.</h1>
      <p className="text-xl text-gray-500 mb-10">Start for free, upgrade when you need advanced features.</p>
      
      {/* Toggle Logic */}
      <div className="flex items-center justify-center gap-4 mb-16">
        <span className={`font-bold ${!isAnnual ? 'text-gray-900' : 'text-gray-400'}`}>Monthly Billing</span>
        <button 
          onClick={() => setIsAnnual(!isAnnual)}
          className="w-16 h-8 bg-blue-600 rounded-full relative p-1 transition-colors"
        >
          <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${isAnnual ? 'translate-x-8' : 'translate-x-0'}`}></div>
        </button>
        <span className={`font-bold ${isAnnual ? 'text-gray-900' : 'text-gray-400'}`}>Annual Billing <span className="text-green-500 text-xs ml-1">(Save 20%)</span></span>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto text-left">
        <div className="p-8 rounded-3xl border border-gray-200 bg-white">
          <h3 className="text-2xl font-bold mb-2">Basic Khata</h3>
          <p className="text-gray-500 mb-6 text-sm">For tiny roadside shops.</p>
          <div className="text-4xl font-black mb-6">Free</div>
          <ul className="space-y-4 mb-8">
            <li className="flex gap-2"><CheckCircle2 className="text-blue-500"/> <span className="font-medium">Basic Billing</span></li>
            <li className="flex gap-2"><CheckCircle2 className="text-blue-500"/> <span className="font-medium">Up to 100 Items</span></li>
          </ul>
          <button className="w-full py-3 rounded-xl border-2 border-gray-200 font-bold hover:bg-gray-50">Get Started</button>
        </div>

        <div className="p-8 rounded-3xl border-2 border-blue-600 bg-slate-900 text-white transform md:-translate-y-4 shadow-2xl">
          <h3 className="text-2xl font-bold mb-2">Growth Pro</h3>
          <p className="text-slate-400 mb-6 text-sm">For serious retail supermarkets.</p>
          <div className="text-4xl font-black mb-6">₹{isAnnual ? '899' : '1099'}<span className="text-lg text-slate-400 font-medium">/mo</span></div>
          <ul className="space-y-4 mb-8">
            <li className="flex gap-2"><CheckCircle2 className="text-blue-400"/> <span className="font-medium">Unlimited Billing</span></li>
            <li className="flex gap-2"><CheckCircle2 className="text-blue-400"/> <span className="font-medium">WhatsApp Reminders</span></li>
            <li className="flex gap-2"><CheckCircle2 className="text-blue-400"/> <span className="font-medium">Inventory Alerts</span></li>
          </ul>
          <button className="w-full py-3 rounded-xl bg-blue-600 font-bold hover:bg-blue-500">Start 14-Day Free Trial</button>
        </div>

        <div className="p-8 rounded-3xl border border-gray-200 bg-white">
          <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
          <p className="text-gray-500 mb-6 text-sm">For multi-store franchises.</p>
          <div className="text-4xl font-black mb-6">₹{isAnnual ? '2499' : '2999'}<span className="text-lg text-gray-500 font-medium">/mo</span></div>
          <ul className="space-y-4 mb-8">
            <li className="flex gap-2"><CheckCircle2 className="text-blue-500"/> <span className="font-medium">Supplier Integrations</span></li>
            <li className="flex gap-2"><CheckCircle2 className="text-blue-500"/> <span className="font-medium">API Access</span></li>
          </ul>
          <button className="w-full py-3 rounded-xl border-2 border-blue-100 text-blue-700 bg-blue-50 font-bold hover:bg-blue-100">Contact Sales</button>
        </div>
      </div>
    </div>
  );
}
