import React from 'react';
import { ArrowRight, CheckCircle2, Store } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ResAPI() {
  return (
    <div className="animate-in fade-in duration-500 bg-white">
      <header className="bg-slate-900 text-white py-24 px-6 md:px-12 text-center border-b border-slate-800">
        <h1 className="text-4xl md:text-6xl font-black mb-6">Developer API</h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium">Integrate VyaparSetu with your custom apps.</p>
      </header>
      
      <section className="py-24 px-6 md:px-12 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-black text-gray-900 mb-8 leading-tight">The ultimate solution designed specifically for your needs.</h2>
            <ul className="space-y-6 mb-10">
              <li className="flex gap-4 items-start"><CheckCircle2 className="text-blue-600 shrink-0 mt-1"/> <span className="text-gray-700 text-lg font-medium">Enterprise-grade cloud syncing capabilities that never lose data.</span></li>
              <li className="flex gap-4 items-start"><CheckCircle2 className="text-blue-600 shrink-0 mt-1"/> <span className="text-gray-700 text-lg font-medium">Secure end-to-end data encryption for all your customer khata.</span></li>
              <li className="flex gap-4 items-start"><CheckCircle2 className="text-blue-600 shrink-0 mt-1"/> <span className="text-gray-700 text-lg font-medium">24/7 dedicated support via WhatsApp & Phone Calls.</span></li>
            </ul>
            <Link to="/pricing" className="inline-flex bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 items-center gap-2 shadow-lg transition-transform hover:-translate-y-1">
              View Pricing & Start Trial <ArrowRight size={20}/>
            </Link>
          </div>
          <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden">
             <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-100 rounded-full blur-3xl opacity-50"></div>
             <Store size={80} className="text-blue-600 mx-auto mb-6"/>
             <h3 className="text-2xl font-black text-gray-900 mb-2">Developer API</h3>
             <p className="text-slate-500 font-medium text-center max-w-xs">Integrate VyaparSetu with your custom apps.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
