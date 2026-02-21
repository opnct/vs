import React, { useState, useEffect } from 'react';

export default function About() {
  const [activeSection, setActiveSection] = useState('purpose');

  // Scroll spy to highlight active section in the sidebar
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['purpose', 'bharat', 'technology', 'next-steps'];
      let current = sections[0];
      
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el && window.scrollY >= (el.offsetTop - 150)) {
          current = section;
        }
      }
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      window.scrollTo({
        top: el.offsetTop - 100,
        behavior: 'smooth'
      });
    }
  };

  const navItems = [
    { id: 'purpose', label: 'VyaparSetu Purpose' },
    { id: 'bharat', label: 'Built for Bharat' },
    { id: 'technology', label: 'Our Technology' },
    { id: 'next-steps', label: 'Next Steps' }
  ];

  return (
    <div className="flex flex-col w-full bg-white text-black animate-in fade-in duration-700 min-h-screen">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16 w-full pt-16 pb-32">
        
        {/* Main Page Title */}
        <h1 className="text-[40px] md:text-[46px] font-bold tracking-tight text-black mb-16 md:mb-24">
          ABOUT
        </h1>

        <div className="flex flex-col md:flex-row gap-12 lg:gap-24 items-start">
          
          {/* Left Sidebar Navigation */}
          <aside className="w-full md:w-64 lg:w-72 shrink-0 md:sticky top-32">
            <h3 className="text-[15px] font-bold text-black mb-6">
              On this page
            </h3>
            <ul className="flex flex-col gap-5">
              {navItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => scrollToSection(item.id)}
                    className={`block w-full text-left text-[15px] font-bold text-[#005ea2] hover:underline transition-all ${
                      activeSection === item.id 
                        ? 'border-l-[4px] border-black pl-3' 
                        : 'pl-4'
                    }`}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          {/* Right Content Area */}
          <div className="flex-1 max-w-4xl flex flex-col gap-16">
            
            {/* Section 1 */}
            <section id="purpose" className="scroll-mt-32">
              <h2 className="text-[28px] md:text-[32px] font-bold tracking-tight text-black mb-6">
                VyaparSetu Purpose
              </h2>
              <p className="text-[17px] leading-[1.65] text-[#333333] mb-6">
                VyaparSetu aims to provide a holistic view of local commerce and interconnected retail systems, and connect store owners with the data they need to make decisions about their inventory and livelihoods. Visualizations, interactive ledgers, data, and narratives show how cloud tech benefits retail and provides businesses an opportunity to explore market observations for their own decision-making.
              </p>
              <p className="text-[17px] leading-[1.65] text-[#333333] mb-6">
                Content is enabled by contributions across regional distributors and supply chains. VyaparSetu is also the virtual home for your physical store, bringing enterprise-grade POS and Udhaar management to venues that have traditionally relied on pen and paper.
              </p>
            </section>

            {/* Section 2 */}
            <section id="bharat" className="scroll-mt-32">
              <h2 className="text-[28px] md:text-[32px] font-bold tracking-tight text-black mb-6">
                Built for Bharat
              </h2>
              <p className="text-[17px] leading-[1.65] text-[#333333] mb-6">
                Our mission is to digitize Tier 2 and Tier 3 cities across India. While top-tier supermarkets have access to expensive software, the backbone of Indian retail—the local Kirana, hardware, and medical stores—are often left behind.
              </p>
              <p className="text-[17px] leading-[1.65] text-[#333333] mb-6">
                We designed our operating system to work beautifully on low-end hardware, function seamlessly during internet outages with offline-sync capabilities, and provide regional language support so staff requires zero training time.
              </p>
            </section>

            {/* Section 3 */}
            <section id="technology" className="scroll-mt-32">
              <h2 className="text-[28px] md:text-[32px] font-bold tracking-tight text-black mb-6">
                Our Technology
              </h2>
              <p className="text-[17px] leading-[1.65] text-[#333333] mb-6">
                VyaparSetu consolidates three massive pillars of retail into one window:
              </p>
              <ul className="list-disc pl-6 text-[17px] leading-[1.65] text-[#333333] space-y-3 mb-6">
                <li><strong className="text-black">Smart POS:</strong> Lightning-fast barcode scanning and multi-lane billing.</li>
                <li><strong className="text-black">Live Inventory:</strong> Auto-deduction that alerts you before high-margin items run out.</li>
                <li><strong className="text-black">Udhaar Ledger:</strong> Secure credit tracking with automated WhatsApp payment reminders.</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section id="next-steps" className="scroll-mt-32">
              <h2 className="text-[28px] md:text-[32px] font-bold tracking-tight text-black mb-6">
                How do I bring VyaparSetu to my store?
              </h2>
              <p className="text-[17px] leading-[1.65] text-[#333333] mb-6">
                Transitioning from your old system or notebooks is incredibly easy. Our onboarding team assists you in bulk-uploading your first 1,000 items so you can start billing on day one.
              </p>
              <p className="text-[17px] leading-[1.65] text-[#333333]">
                To explore our platform or request a customized demo for your specific retail niche, please visit our <a href="/contact" className="text-[#005ea2] hover:underline font-bold">Contact Sales</a> page.
              </p>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}