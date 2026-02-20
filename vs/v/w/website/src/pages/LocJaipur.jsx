import React from 'react';
import { ArrowRight, CheckCircle2, Store } from 'lucide-react';

export default function LocJaipur() {
  return (
    <div className="animate-in fade-in duration-500">
      <header className="bg-blue-600 text-white py-24 px-6 md:px-12 text-center">
        <h1 className="text-4xl md:text-6xl font-black mb-4">Best POS Software in Jaipur</h1>
        <p className="text-xl text-blue-100 max-w-2xl mx-auto">Perfect for wholesale and retail merchants.</p>
      </header>
      
      <section className="py-20 px-6 md:px-12 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Built for actual growth, not just basic billing.</h2>
            <ul className="space-y-4">
              <li className="flex gap-3 items-start"><CheckCircle2 className="text-green-500 shrink-0"/> <span className="text-gray-600">Enterprise-grade cloud syncing capabilities.</span></li>
              <li className="flex gap-3 items-start"><CheckCircle2 className="text-green-500 shrink-0"/> <span className="text-gray-600">Secure end-to-end data encryption.</span></li>
              <li className="flex gap-3 items-start"><CheckCircle2 className="text-green-500 shrink-0"/> <span className="text-gray-600">24/7 dedicated support via WhatsApp & Call.</span></li>
            </ul>
            <button className="mt-8 bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 flex items-center gap-2">
              Start your free trial <ArrowRight size={18}/>
            </button>
          </div>
          <div className="bg-slate-100 p-8 rounded-3xl border border-slate-200 shadow-inner flex items-center justify-center min-h-[300px]">
             <div className="text-center">
               <Store size={64} className="text-slate-300 mx-auto mb-4"/>
               <p className="text-slate-400 font-bold uppercase tracking-widest">LocJaipur Visuals</p>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
}
