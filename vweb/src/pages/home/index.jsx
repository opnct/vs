import React from 'react';
import { ArrowRight, ShieldCheck, TrendingUp, Store, Users, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="animate-in fade-in duration-500">
      <header className="pt-24 pb-20 px-6 md:px-12 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-6 border border-blue-100">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            India's #1 Local Commerce OS
          </div>
          <h1 className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tight mb-6 leading-[1.1]">
            Grow your retail store with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">VyaparSetu.</span>
          </h1>
          <p className="text-xl text-gray-500 mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0">
            Replace your notebooks and outdated billing software. VyaparSetu manages your inventory, billing, Udhaar, and connects you to suppliers instantly.
          </p>
          <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
            <Link to="/pricing" className="bg-blue-600 text-white text-lg font-bold px-8 py-4 rounded-xl shadow-xl hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
              Start Free Trial <ArrowRight size={20}/>
            </Link>
            <Link to="/contact" className="bg-white text-gray-800 border-2 border-gray-200 text-lg font-bold px-8 py-4 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-center">
              Request Demo
            </Link>
          </div>
        </div>
        <div className="flex-1 w-full max-w-2xl">
          <div className="bg-slate-900 rounded-3xl p-4 shadow-2xl border-4 border-slate-800 aspect-[4/3] flex flex-col">
            <div className="flex items-center gap-2 mb-4 px-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="flex-1 bg-slate-50 rounded-xl flex overflow-hidden">
               <div className="w-1/4 bg-white border-r border-gray-200 p-4 hidden sm:block">
                 <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
                 <div className="space-y-3"><div className="h-8 bg-blue-100 rounded w-full"></div><div className="h-8 bg-gray-100 rounded w-full"></div></div>
               </div>
               <div className="flex-1 p-6 flex flex-col gap-4">
                 <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                 <div className="flex gap-4"><div className="h-20 bg-white border border-gray-200 shadow-sm rounded-lg flex-1"></div><div className="h-20 bg-white border border-gray-200 shadow-sm rounded-lg flex-1"></div></div>
                 <div className="flex-1 bg-white border border-gray-200 shadow-sm rounded-lg mt-2"></div>
               </div>
            </div>
          </div>
        </div>
      </header>

      <section className="py-24 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-16">Everything you need to succeed.</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 bg-slate-50 rounded-3xl text-left hover:shadow-lg transition-shadow border border-slate-100">
              <ShieldCheck className="text-blue-600 w-12 h-12 mb-6"/>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Udhaar</h3>
              <p className="text-gray-600 leading-relaxed">Stop losing money to bad credit. Send automated WhatsApp reminders and track limits.</p>
            </div>
            <div className="p-8 bg-slate-50 rounded-3xl text-left hover:shadow-lg transition-shadow border border-slate-100">
              <TrendingUp className="text-emerald-600 w-12 h-12 mb-6"/>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Live Inventory</h3>
              <p className="text-gray-600 leading-relaxed">Stock deducts instantly with every scan. Get alerts before high-margin items run out.</p>
            </div>
            <div className="p-8 bg-slate-50 rounded-3xl text-left hover:shadow-lg transition-shadow border border-slate-100">
              <Store className="text-purple-600 w-12 h-12 mb-6"/>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Marketplace</h3>
              <p className="text-gray-600 leading-relaxed">Automatically rank on local searches and let customers order pickup directly.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
