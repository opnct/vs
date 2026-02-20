import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Store, Menu, X, ChevronRight } from 'lucide-react';

export default function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Scroll to top on route change
  React.useEffect(() => {
    window.scrollTo(0, 0);
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 py-4 px-6 md:px-12 flex justify-between items-center fixed w-full z-50 shadow-sm">
        <Link to="/" className="text-2xl font-black text-blue-600 flex items-center gap-2 tracking-tight">
          <div className="bg-blue-600 p-1.5 rounded-lg text-white"><Store size={24} strokeWidth={2.5}/></div>
          VyaparSetu
        </Link>
        
        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center space-x-8 text-sm font-bold text-gray-600">
          <Link to="/features/smart-pos" className="hover:text-blue-600 transition-colors">Features</Link>
          <Link to="/industries/grocery" className="hover:text-blue-600 transition-colors">Industries</Link>
          <Link to="/pricing" className="hover:text-blue-600 transition-colors">Pricing</Link>
          <div className="h-6 w-px bg-gray-200"></div>
          <Link to="/contact" className="text-gray-900 hover:text-blue-600 transition-colors">Contact Sales</Link>
          <button className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg">
            Start 14-Day Free Trial
          </button>
        </div>

        {/* Mobile Toggle */}
        <button className="lg:hidden text-gray-800" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-16 bg-white z-40 p-6 flex flex-col gap-4 border-b border-gray-200 shadow-xl lg:hidden">
          <Link to="/features/smart-pos" className="text-lg font-bold text-gray-800">Features</Link>
          <Link to="/industries/grocery" className="text-lg font-bold text-gray-800">Industries</Link>
          <Link to="/pricing" className="text-lg font-bold text-gray-800">Pricing</Link>
          <Link to="/contact" className="text-lg font-bold text-blue-600 mt-4">Contact Sales</Link>
        </div>
      )}
      
      {/* Page Content */}
      <main className="flex-1 pt-[73px]">
        <Outlet />
      </main>

      {/* Real Footer with SEO Links */}
      <footer className="bg-slate-900 text-slate-400 py-16 px-6 md:px-12 mt-20 border-t border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-12">
          <div className="col-span-2 lg:col-span-2">
            <h3 className="text-2xl font-black text-white flex items-center gap-2 mb-4"><Store className="text-blue-500"/> VyaparSetu</h3>
            <p className="text-sm font-medium leading-relaxed max-w-xs mb-6">Connecting local commerce in Tier 2 & 3 cities across India. Empowering physical retail with cloud technology.</p>
            <div className="flex gap-4">
               {/* Social placeholders */}
               <div className="w-10 h-10 rounded-full bg-slate-800 hover:bg-blue-600 transition-colors cursor-pointer"></div>
               <div className="w-10 h-10 rounded-full bg-slate-800 hover:bg-blue-400 transition-colors cursor-pointer"></div>
            </div>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-xs">Features</h4>
            <ul className="space-y-3 text-sm font-medium">
              <li><Link to="/features/smart-pos" className="hover:text-blue-400 transition-colors">Smart POS</Link></li>
              <li><Link to="/features/udhaar-ledger" className="hover:text-blue-400 transition-colors">Udhaar Khata</Link></li>
              <li><Link to="/features/inventory" className="hover:text-blue-400 transition-colors">Live Inventory</Link></li>
              <li><Link to="/features/suppliers" className="hover:text-blue-400 transition-colors">B2B Suppliers</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-xs">Industries</h4>
            <ul className="space-y-3 text-sm font-medium">
              <li><Link to="/industries/grocery" className="hover:text-blue-400 transition-colors">Supermarkets</Link></li>
              <li><Link to="/industries/electronics" className="hover:text-blue-400 transition-colors">Electronics</Link></li>
              <li><Link to="/industries/pharmacy" className="hover:text-blue-400 transition-colors">Pharmacies</Link></li>
              <li><Link to="/industries/hardware" className="hover:text-blue-400 transition-colors">Hardware</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-xs">Top Cities</h4>
            <ul className="space-y-3 text-sm font-medium">
              <li><Link to="/locations/pune" className="hover:text-blue-400 transition-colors">POS in Pune</Link></li>
              <li><Link to="/locations/bangalore" className="hover:text-blue-400 transition-colors">POS in Bangalore</Link></li>
              <li><Link to="/locations/hyderabad" className="hover:text-blue-400 transition-colors">POS in Hyderabad</Link></li>
              <li><Link to="/locations/mumbai" className="hover:text-blue-400 transition-colors">POS in Mumbai</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-xs">Compare</h4>
            <ul className="space-y-3 text-sm font-medium">
              <li><Link to="/compare/vyapar" className="hover:text-blue-400 transition-colors">vs Vyapar</Link></li>
              <li><Link to="/compare/khatabook" className="hover:text-blue-400 transition-colors">vs Khatabook</Link></li>
              <li><Link to="/compare/tally" className="hover:text-blue-400 transition-colors">vs Tally</Link></li>
              <li><Link to="/compare/marg" className="hover:text-blue-400 transition-colors">vs Marg ERP</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-semibold">
          <p>© 2026 VyaparSetu Technologies India Pvt Ltd. All rights reserved.</p>
          <div className="flex space-x-6">
            <Link to="/legal/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/legal/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/legal/refunds" className="hover:text-white transition-colors">Refund Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
