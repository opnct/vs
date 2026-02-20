import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Store, ChevronRight, Menu } from 'lucide-react';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <nav className="bg-white border-b border-gray-100 py-4 px-6 md:px-12 flex justify-between items-center fixed w-full z-50">
        <Link to="/" className="text-2xl font-black text-blue-600 flex items-center gap-2">
          <Store /> VyaparSetu
        </Link>
        <div className="hidden lg:flex space-x-6 text-sm font-bold text-gray-600">
          <Link to="/features/smart-pos" className="hover:text-blue-600">Features</Link>
          <Link to="/industries/grocery" className="hover:text-blue-600">Industries</Link>
          <Link to="/pricing" className="hover:text-blue-600">Pricing</Link>
          <Link to="/about" className="hover:text-blue-600">About Us</Link>
          <button className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition">Get Started</button>
        </div>
        <Menu className="lg:hidden text-gray-800" />
      </nav>
      
      <main className="flex-1 pt-20">
        <Outlet />
      </main>

      <footer className="bg-slate-900 text-slate-400 py-16 px-6 md:px-12 mt-20">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="col-span-2">
            <h3 className="text-2xl font-black text-white flex items-center gap-2 mb-4"><Store className="text-blue-500"/> VyaparSetu</h3>
            <p className="text-sm">Connecting local commerce in Tier 2 & 3 cities across India. Manage POS, Inventory, and Udhaar seamlessly.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Products</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/features/smart-pos" className="hover:text-blue-400">Smart POS</Link></li>
              <li><Link to="/features/udhaar-ledger" className="hover:text-blue-400">Udhaar Ledger</Link></li>
              <li><Link to="/features/inventory" className="hover:text-blue-400">Live Inventory</Link></li>
              <li><Link to="/features/marketplace" className="hover:text-blue-400">Marketplace</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Industries</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/industries/grocery" className="hover:text-blue-400">Kirana & Grocery</Link></li>
              <li><Link to="/industries/electronics" className="hover:text-blue-400">Electronics</Link></li>
              <li><Link to="/industries/hardware" className="hover:text-blue-400">Hardware Stores</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-blue-400">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-blue-400">Contact Sales</Link></li>
              <li><Link to="/legal/privacy" className="hover:text-blue-400">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
