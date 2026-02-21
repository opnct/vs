import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, MapPin, Mail, Phone } from 'lucide-react';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="flex flex-col w-full bg-white text-black animate-in fade-in duration-700 min-h-screen">
      
      {/* 1. Hero Section (Earth.gov Full Bleed Style) */}
      <section className="relative w-full h-[50vh] min-h-[400px] flex items-center justify-start px-6 md:px-12 lg:px-24 overflow-hidden border-b border-[#333]">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 to-black/40 z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80" 
          alt="Contact Support" 
          className="absolute inset-0 w-full h-full object-cover z-0 object-center opacity-40 grayscale"
        />
        
        {/* Hero Content */}
        <div className="relative z-20 max-w-4xl pt-16">
          <h1 className="text-5xl md:text-7xl lg:text-[6rem] font-bold text-white tracking-tight leading-[1.05] mb-6 uppercase">
            CONTACT <br /> SALES
          </h1>
          <p className="text-xl md:text-2xl text-[#cccccc] max-w-2xl font-normal tracking-wide">
            Connect with our retail implementation experts to discuss customized solutions for your business.
          </p>
        </div>
      </section>

      {/* 2. Main Content Area */}
      <section className="w-full py-20 px-6 md:px-12 lg:px-24">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          
          {/* Left Column: Contact Info */}
          <div className="lg:col-span-4 flex flex-col gap-10">
            <div>
              <h2 className="text-[28px] md:text-[32px] font-bold tracking-tight text-black mb-6">
                Get in Touch
              </h2>
              <p className="text-[17px] leading-[1.65] text-[#333333]">
                Our onboarding team is ready to assist you. Whether you operate a single store or manage a multi-location franchise, we can tailor VyaparSetu to your infrastructure.
              </p>
            </div>

            <div className="space-y-8 mt-4 border-t border-gray-200 pt-8">
              <div className="flex items-start gap-4">
                <MapPin className="text-[#005ea2] shrink-0 mt-1" size={24} />
                <div>
                  <h3 className="text-[15px] font-bold tracking-wider uppercase mb-2">Headquarters</h3>
                  <p className="text-[#555555] leading-relaxed">
                    VyaparSetu Technologies<br />
                    1435 Wellington Road<br />
                    Windsor, Vic 3181<br />
                    Australia
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <Mail className="text-[#005ea2] shrink-0 mt-1" size={24} />
                <div>
                  <h3 className="text-[15px] font-bold tracking-wider uppercase mb-2">Email</h3>
                  <a href="mailto:sales@vyaparsetu.com" className="text-[#005ea2] hover:underline font-medium">
                    sales@vyaparsetu.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Phone className="text-[#005ea2] shrink-0 mt-1" size={24} />
                <div>
                  <h3 className="text-[15px] font-bold tracking-wider uppercase mb-2">Phone Support</h3>
                  <p className="text-[#555555] leading-relaxed">
                    +613 9281 7382<br />
                    <span className="text-[13px]">Mon-Fri, 9am - 6pm IST</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="lg:col-span-8">
            {submitted ? (
              <div className="bg-[#f0f8ff] border-l-[6px] border-[#005ea2] p-8 md:p-12 h-full flex flex-col justify-center">
                <CheckCircle2 size={48} className="text-[#005ea2] mb-6"/>
                <h2 className="text-[32px] font-bold text-black tracking-tight mb-4">Request Received.</h2>
                <p className="text-[17px] text-[#333333] leading-relaxed">
                  Thank you for contacting VyaparSetu. An implementation specialist has been assigned to your inquiry and will contact you at the provided phone number within 24 business hours.
                </p>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 p-8 md:p-12 rounded-sm">
                <div className="mb-8 pb-6 border-b border-gray-200">
                  <h3 className="text-[22px] font-bold tracking-tight text-black mb-2">Submit a Request</h3>
                  <p className="text-[#555555] text-[15px]">Fields marked with an asterisk (*) are required.</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-[15px] font-bold text-black">Full Name *</label>
                      <input 
                        required 
                        type="text" 
                        className="w-full p-4 border border-gray-300 rounded-sm focus:outline-none focus:border-[#005ea2] focus:ring-1 focus:ring-[#005ea2] transition-shadow bg-white text-[15px]" 
                        placeholder="e.g. Rahul Sharma" 
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[15px] font-bold text-black">Phone Number *</label>
                      <input 
                        required 
                        type="tel" 
                        className="w-full p-4 border border-gray-300 rounded-sm focus:outline-none focus:border-[#005ea2] focus:ring-1 focus:ring-[#005ea2] transition-shadow bg-white text-[15px]" 
                        placeholder="+91 98765 43210" 
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[15px] font-bold text-black">Store Name & Type *</label>
                    <input 
                      required 
                      type="text" 
                      className="w-full p-4 border border-gray-300 rounded-sm focus:outline-none focus:border-[#005ea2] focus:ring-1 focus:ring-[#005ea2] transition-shadow bg-white text-[15px]" 
                      placeholder="e.g. Sharma General Store (Grocery)" 
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[15px] font-bold text-black">Additional Information (Optional)</label>
                    <textarea 
                      rows="4"
                      className="w-full p-4 border border-gray-300 rounded-sm focus:outline-none focus:border-[#005ea2] focus:ring-1 focus:ring-[#005ea2] transition-shadow bg-white text-[15px] resize-none" 
                      placeholder="Tell us about your current inventory size, multi-store needs, or specific hardware requirements..." 
                    ></textarea>
                  </div>

                  <div className="mt-4 pt-8 border-t border-gray-200 flex justify-end">
                    <button 
                      type="submit" 
                      className="bg-[#005ea2] hover:bg-[#0b4774] text-white px-8 py-4 font-bold tracking-wider uppercase transition-colors text-[13px] rounded-sm flex items-center gap-2 w-full md:w-auto justify-center"
                    >
                      Submit Request <ArrowRight size={16} strokeWidth={2.5} />
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

        </div>
      </section>
    </div>
  );
}