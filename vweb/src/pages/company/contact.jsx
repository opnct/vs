import React, { useState } from 'react';
import { Store, CheckCircle2 } from 'lucide-react';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="animate-in fade-in duration-500 py-20 px-6 max-w-4xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-black text-gray-900 mb-4">Talk to our Retail Experts.</h1>
        <p className="text-xl text-gray-500">We'll show you exactly how VyaparSetu can digitize your specific store.</p>
      </div>

      {submitted ? (
        <div className="bg-green-50 border border-green-200 rounded-3xl p-12 text-center">
          <CheckCircle2 size={64} className="text-green-500 mx-auto mb-6"/>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Request Received!</h2>
          <p className="text-gray-600">Our team will call you within 24 hours to schedule your demo.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-3xl p-8 md:p-12 shadow-xl">
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
              <input required type="text" className="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 outline-none" placeholder="Rahul Sharma" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
              <input required type="tel" className="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 outline-none" placeholder="+91 98765 43210" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">Store Name & Type</label>
              <input required type="text" className="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 outline-none" placeholder="e.g. Sharma General Store (Grocery)" />
            </div>
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white font-black text-lg py-4 rounded-xl hover:bg-blue-700 transition-colors">
            Request Free Demo
          </button>
        </form>
      )}
    </div>
  );
}
