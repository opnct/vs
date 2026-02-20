import React from 'react';
import { Store, ShieldCheck, TrendingUp, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <nav className="bg-white border-b border-gray-100 py-4 px-8 flex justify-between items-center fixed w-full z-50">
        <div className="text-2xl font-black text-blue-600 flex items-center gap-2"><Store/> VyaparSetu</div>
        <div className="space-x-8 text-sm font-semibold text-gray-600 hidden md:block">
          <a href="#features" className="hover:text-blue-600 transition">Features</a>
          <button className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700">Login to POS Dashboard →</button>
        </div>
      </nav>

      <header className="pt-32 pb-20 px-8 max-w-6xl mx-auto text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-6">
          The Operating System for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Local Commerce</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-3xl mx-auto mb-10 leading-relaxed">
          Upgrade your retail store. Manage billing, inventory, Udhaar, and connect with local suppliers—all in one smart app.
        </p>
        <button className="bg-blue-600 text-white text-lg font-bold px-8 py-4 rounded-xl shadow-xl hover:bg-blue-700 flex items-center gap-2 mx-auto">Start 14-Day Free Trial <ArrowRight size={20}/></button>
      </header>

      <section id="features" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-8 grid md:grid-cols-3 gap-10">
          <div className="p-8 bg-blue-50 rounded-2xl border border-blue-100 shadow-sm"><ShieldCheck className="text-blue-600 w-12 h-12 mb-4"/><h3 className="text-xl font-bold text-gray-900 mb-2">Smart Udhaar Management</h3><p className="text-gray-600">Track customer credit securely. Send automated WhatsApp reminders.</p></div>
          <div className="p-8 bg-emerald-50 rounded-2xl border border-emerald-100 shadow-sm"><TrendingUp className="text-emerald-600 w-12 h-12 mb-4"/><h3 className="text-xl font-bold text-gray-900 mb-2">Live Inventory</h3><p className="text-gray-600">Auto-deduct stock with every scan. Get alerts before you run out.</p></div>
          <div className="p-8 bg-purple-50 rounded-2xl border border-purple-100 shadow-sm"><Store className="text-purple-600 w-12 h-12 mb-4"/><h3 className="text-xl font-bold text-gray-900 mb-2">Lightning Fast POS</h3><p className="text-gray-600">Scan barcodes and generate bills in seconds. Works offline seamlessly.</p></div>
        </div>
      </section>
    </div>
  );
}
