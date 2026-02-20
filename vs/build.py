import os
import json

def create_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content.strip() + '\n')
    print(f"✅ Created: {path}")

def build_monorepo():
    print("🚀 Bootstrapping VyaparSetu All-In-One Monorepo...")
    base = "vyaparsetu-workspace"

    # ==========================================
    # 1. ROOT MONOREPO CONFIGURATION
    # ==========================================
    root_pkg = {
        "name": "vyaparsetu-monorepo",
        "version": "1.0.0",
        "scripts": {
            "install:all": "npm install --prefix server && npm install --prefix client && npm install --prefix website",
            "dev:server": "npm run dev --prefix server",
            "dev:client": "npm run dev --prefix client",
            "dev:website": "npm run dev --prefix website",
            "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\" \"npm run dev:website\""
        },
        "devDependencies": {
            "concurrently": "^8.2.0"
        }
    }
    create_file(f"{base}/package.json", json.dumps(root_pkg, indent=2))
    create_file(f"{base}/README.md", "# VyaparSetu Workspace\n\nRun `npm run install:all` then `npm run dev` to start everything!")

    # ==========================================
    # 2. SERVER (Backend)
    # ==========================================
    server_pkg = {
        "name": "vyaparsetu-server", "version": "1.0.0", "main": "server.js",
        "scripts": {"start": "node server.js", "dev": "nodemon server.js"},
        "dependencies": {"express": "^4.18.2", "mongoose": "^7.4.1", "cors": "^2.8.5", "dotenv": "^16.3.1"},
        "devDependencies": {"nodemon": "^3.0.1"}
    }
    create_file(f"{base}/server/package.json", json.dumps(server_pkg, indent=2))
    create_file(f"{base}/server/.env", "PORT=5000\nMONGO_URI=mongodb://127.0.0.1:27017/vyaparsetu\n")
    create_file(f"{base}/server/server.js", """
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
    console.log("Ping received from a client!");
    res.status(200).json({ status: '✅ VyaparSetu API is LIVE!', timestamp: new Date() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🟢 BACKEND: Running on http://localhost:${PORT}`));
""")

    # ==========================================
    # 3. HELPER: VITE APP GENERATOR
    # ==========================================
    def generate_vite_app(folder, name, port, app_code):
        pkg = {
            "name": name, "private": True, "version": "1.0.0", "type": "module",
            "scripts": {"dev": f"vite --port {port}", "build": "vite build"},
            "dependencies": {"react": "^18.2.0", "react-dom": "^18.2.0", "lucide-react": "^0.263.1", "react-router-dom": "^6.14.2", "axios": "^1.4.0"},
            "devDependencies": {"@vitejs/plugin-react": "^4.0.3", "autoprefixer": "^10.4.14", "postcss": "^8.4.27", "tailwindcss": "^3.3.3", "vite": "^4.4.5"}
        }
        create_file(f"{base}/{folder}/package.json", json.dumps(pkg, indent=2))
        create_file(f"{base}/{folder}/vite.config.js", "import { defineConfig } from 'vite'\nimport react from '@vitejs/plugin-react'\nexport default defineConfig({ plugins: [react()] })")
        create_file(f"{base}/{folder}/tailwind.config.js", "export default { content: ['./index.html', './src/**/*.{js,jsx}'], theme: { extend: {} }, plugins: [] }")
        create_file(f"{base}/{folder}/postcss.config.js", "export default { plugins: { tailwindcss: {}, autoprefixer: {} } }")
        create_file(f"{base}/{folder}/index.html", f"""<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>{name}</title></head><body class="bg-gray-50 text-gray-900"><div id="root"></div><script type="module" src="/src/main.jsx"></script></body></html>""")
        create_file(f"{base}/{folder}/src/index.css", "@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\n/* Custom scrollbar for webkit */\n::-webkit-scrollbar { width: 6px; }\n::-webkit-scrollbar-track { background: transparent; }\n::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }\n::-webkit-scrollbar-thumb:hover { background: #94a3b8; }")
        create_file(f"{base}/{folder}/src/main.jsx", "import React from 'react'; import ReactDOM from 'react-dom/client'; import App from './App.jsx'; import './index.css'; ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);")
        create_file(f"{base}/{folder}/src/App.jsx", app_code)

    # ==========================================
    # 4. CLIENT (SaaS App Code)
    # ==========================================
    client_code = """
import React, { useState, useEffect } from 'react';
import { ShoppingCart, Package, Users, LayoutDashboard, IndianRupee, Store, CheckCircle2, Search, Plus, Minus, Trash2 } from 'lucide-react';
import axios from 'axios';

const INITIAL_PRODUCTS = [
  { id: '1', name: 'Aashirvaad Atta 5kg', price: 260, stock: 45 },
  { id: '2', name: 'Tata Salt 1kg', price: 28, stock: 120 },
  { id: '3', name: 'Maggi Noodles 140g', price: 30, stock: 85 }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('pos');
  const [serverStatus, setServerStatus] = useState('Checking server...');
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    // Test backend connection on load
    axios.get('http://localhost:5000/api/health')
      .then(res => setServerStatus(res.data.status))
      .catch(() => setServerStatus('Backend offline. Run npm run dev.'));
  }, []);

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) setCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
    else setCart([...cart, { ...product, qty: 1 }]);
  };

  const checkout = () => {
    // Deduct inventory locally
    const updatedProducts = products.map(p => {
      const inCart = cart.find(c => c.id === p.id);
      return inCart ? { ...p, stock: p.stock - inCart.qty } : p;
    });
    setProducts(updatedProducts);
    setCart([]);
    alert('Bill Generated Successfully!');
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0">
        <div className="h-16 flex items-center px-6 bg-slate-950 border-b border-slate-800">
          <h1 className="text-xl font-black text-white flex items-center gap-2"><Store className="text-blue-500"/> VyaparSetu <span className="text-xs bg-blue-600 text-white px-1.5 rounded">PRO</span></h1>
        </div>
        <nav className="p-4 space-y-1 flex-1">
          <button onClick={() => setActiveTab('pos')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'pos' ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-slate-800 hover:text-white'}`}><ShoppingCart size={18}/> Smart POS</button>
          <button onClick={() => setActiveTab('inventory')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'inventory' ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-slate-800 hover:text-white'}`}><Package size={18}/> Live Inventory</button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold hover:bg-slate-800 hover:text-white"><Users size={18}/> Udhaar Ledger</button>
        </nav>
        <div className="p-4 bg-slate-950 border-t border-slate-800 text-xs text-slate-500 font-mono">
          API Status:<br/><span className={serverStatus.includes('LIVE') ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>{serverStatus}</span>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm z-10">
          <h2 className="text-xl font-bold text-gray-800 capitalize">{activeTab} Module</h2>
          <div className="text-sm font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">Terminal: Pune Central</div>
        </header>

        {activeTab === 'pos' && (
          <div className="flex-1 flex overflow-hidden p-6 gap-6">
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 overflow-y-auto">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Search size={18}/> Scan or Select Products</h3>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map(p => (
                  <button key={p.id} onClick={() => addToCart(p)} disabled={p.stock===0} className="text-left p-4 rounded-xl border-2 border-gray-100 hover:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all disabled:opacity-50">
                    <Package className="text-gray-400 mb-2"/>
                    <p className="font-bold text-gray-900 truncate">{p.name}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-blue-700 font-black">₹{p.price}</span>
                      <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-md">{p.stock} left</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="w-96 bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-100 bg-slate-50 rounded-t-2xl font-bold text-gray-800 flex justify-between">Current Order <span className="bg-blue-100 text-blue-700 px-2 rounded-full text-xs flex items-center">{cart.length} items</span></div>
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {cart.length === 0 ? <p className="text-center text-gray-400 mt-10 font-medium">Cart is empty</p> : cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center border-b border-gray-100 pb-2">
                    <div><p className="font-bold text-sm text-gray-800">{item.name}</p><p className="text-xs text-gray-500">₹{item.price} x {item.qty}</p></div>
                    <span className="font-black text-gray-900">₹{item.price * item.qty}</span>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-gray-50 border-t border-gray-200 rounded-b-2xl">
                <div className="flex justify-between text-xl font-black text-gray-900 mb-4"><span>Total</span><span>₹{cart.reduce((s, i) => s + (i.price * i.qty), 0)}</span></div>
                <button onClick={checkout} disabled={cart.length===0} className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 text-white font-black py-4 rounded-xl shadow-lg transition-colors text-lg flex justify-center items-center gap-2"><IndianRupee size={24}/> Pay Cash</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <table className="w-full text-left">
                <thead className="text-xs uppercase text-gray-500 font-bold border-b border-gray-200">
                  <tr><th className="pb-4">Product Name</th><th className="pb-4">MRP</th><th className="pb-4">Current Stock</th><th className="pb-4">Status</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map(p => (
                    <tr key={p.id}>
                      <td className="py-4 font-bold text-gray-900">{p.name}</td>
                      <td className="py-4 font-medium text-gray-600">₹{p.price}</td>
                      <td className="py-4 font-black text-gray-800">{p.stock}</td>
                      <td className="py-4"><span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full"><CheckCircle2 size={12} className="inline mr-1"/>In Stock</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
"""
    generate_vite_app("client", "VyaparSetu SaaS", 5173, client_code)

    # ==========================================
    # 5. WEBSITE (Landing Page Code)
    # ==========================================
    website_code = """
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
"""
    generate_vite_app("website", "VyaparSetu Website", 5174, website_code)

    print("\n✅ ALL DONE! Monorepo generated. Follow the instructions to install and run.")

if __name__ == "__main__":
    build_monorepo()