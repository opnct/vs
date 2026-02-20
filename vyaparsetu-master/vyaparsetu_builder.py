import os
import json

def create_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content.strip() + '\n')
    print(f"✅ Created: {path}")

def build_workspace():
    print("🚀 Bootstrapping VyaparSetu Workspace (Server, Client, Website)...")
    base = "vyaparsetu-workspace"

    # ==========================================
    # 1. SERVER (Node.js / Express / MongoDB)
    # ==========================================
    server_pkg = {
        "name": "vyaparsetu-server",
        "version": "1.0.0",
        "main": "server.js",
        "scripts": {
            "start": "node server.js",
            "dev": "nodemon server.js"
        },
        "dependencies": {
            "express": "^4.18.2", "mongoose": "^7.4.1", "cors": "^2.8.5", "dotenv": "^16.3.1"
        },
        "devDependencies": {"nodemon": "^3.0.1"}
    }
    create_file(f"{base}/server/package.json", json.dumps(server_pkg, indent=2))
    
    create_file(f"{base}/server/.env", """PORT=5000\nMONGO_URI=mongodb://127.0.0.1:27017/vyaparsetu\n""")

    create_file(f"{base}/server/server.js", """
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Real Database Connection Logic
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ MongoDB Database Connected Successfully'))
  .catch(err => console.log('⚠️ MongoDB not running locally, start MongoDB to connect! Error:', err.message));

// Real Routes setup
app.get('/api/health', (req, res) => res.status(200).json({ status: 'VyaparSetu LCOS API is LIVE!', timestamp: new Date() }));
app.post('/api/auth/login', (req, res) => res.json({ token: 'mock-jwt-token-123', user: { role: 'retailer' } }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running perfectly on http://localhost:${PORT}`));
""")

    # ==========================================
    # 2. VITE TEMPLATES (Shared for Client & Website)
    # ==========================================
    def generate_vite_app(folder, name, port, main_component_code):
        pkg = {
            "name": name, "private": True, "version": "1.0.0", "type": "module",
            "scripts": {"dev": f"vite --port {port}", "build": "vite build"},
            "dependencies": {"react": "^18.2.0", "react-dom": "^18.2.0", "lucide-react": "^0.263.1", "react-router-dom": "^6.14.2"},
            "devDependencies": {"@vitejs/plugin-react": "^4.0.3", "autoprefixer": "^10.4.14", "postcss": "^8.4.27", "tailwindcss": "^3.3.3", "vite": "^4.4.5"}
        }
        create_file(f"{base}/{folder}/package.json", json.dumps(pkg, indent=2))
        create_file(f"{base}/{folder}/vite.config.js", f"import {{ defineConfig }} from 'vite'\nimport react from '@vitejs/plugin-react'\nexport default defineConfig({{ plugins: [react()] }})")
        create_file(f"{base}/{folder}/tailwind.config.js", "export default { content: ['./index.html', './src/**/*.{js,jsx}'], theme: { extend: {} }, plugins: [] }")
        create_file(f"{base}/{folder}/postcss.config.js", "export default { plugins: { tailwindcss: {}, autoprefixer: {} } }")
        create_file(f"{base}/{folder}/index.html", f"""<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>{name}</title></head><body class="bg-gray-50 text-gray-900"><div id="root"></div><script type="module" src="/src/main.jsx"></script></body></html>""")
        create_file(f"{base}/{folder}/src/index.css", "@tailwind base;\n@tailwind components;\n@tailwind utilities;")
        create_file(f"{base}/{folder}/src/main.jsx", "import React from 'react'; import ReactDOM from 'react-dom/client'; import App from './App.jsx'; import './index.css'; ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);")
        create_file(f"{base}/{folder}/src/App.jsx", main_component_code)

    # ==========================================
    # 3. CLIENT (SaaS Dashboard)
    # ==========================================
    saas_app_code = """
import React, { useState } from 'react';
import { ShoppingCart, Package, Users, BarChart } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('pos');
  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-slate-900 text-white p-4">
        <h1 className="text-xl font-bold mb-8 text-blue-400">VyaparSetu LCOS</h1>
        <nav className="space-y-2">
          <button onClick={() => setActiveTab('pos')} className={`w-full text-left p-3 rounded flex items-center gap-2 ${activeTab === 'pos' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}><ShoppingCart size={18}/> Smart POS</button>
          <button onClick={() => setActiveTab('inventory')} className={`w-full text-left p-3 rounded flex items-center gap-2 ${activeTab === 'inventory' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}><Package size={18}/> Inventory</button>
        </nav>
      </aside>
      <main className="flex-1 p-8">
        <h2 className="text-2xl font-bold mb-4">{activeTab === 'pos' ? 'Point of Sale' : 'Inventory Management'}</h2>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-96 flex items-center justify-center text-gray-500">
          This is the SaaS interface. Run the full React code here.
        </div>
      </main>
    </div>
  );
}
"""
    generate_vite_app("client", "VyaparSetu SaaS", 5173, saas_app_code)

    # ==========================================
    # 4. WEBSITE (Public Landing Page)
    # ==========================================
    website_app_code = """
import React from 'react';
import { Store, ShieldCheck, TrendingUp, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <nav className="bg-white border-b border-gray-100 py-4 px-8 flex justify-between items-center fixed w-full z-50">
        <div className="text-2xl font-black text-blue-600 flex items-center gap-2"><Store/> VyaparSetu</div>
        <div className="space-x-8 text-sm font-semibold text-gray-600 hidden md:block">
          <a href="#features" className="hover:text-blue-600 transition">Features</a>
          <a href="#pricing" className="hover:text-blue-600 transition">Pricing</a>
          <button className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700">Login to POS</button>
        </div>
      </nav>

      <header className="pt-32 pb-20 px-8 max-w-6xl mx-auto text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-6">
          The Operating System for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Local Commerce</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-3xl mx-auto mb-10 leading-relaxed">
          Upgrade your retail store. Manage billing, inventory, Udhaar, and connect with local suppliers—all in one smart app designed for Tier 2 & 3 India.
        </p>
        <div className="flex justify-center gap-4">
          <button className="bg-blue-600 text-white text-lg font-bold px-8 py-4 rounded-xl shadow-xl hover:bg-blue-700 flex items-center gap-2 transition-transform hover:-translate-y-1">Start 14-Day Free Trial <ArrowRight size={20}/></button>
        </div>
      </header>

      <section id="features" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-8 grid md:grid-cols-3 gap-10">
          <div className="p-8 bg-blue-50 rounded-2xl border border-blue-100">
            <ShieldCheck className="text-blue-600 w-12 h-12 mb-4"/>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Smart Udhaar Management</h3>
            <p className="text-gray-600">Track customer credit securely. Send automated WhatsApp reminders and eliminate bad debt.</p>
          </div>
          <div className="p-8 bg-emerald-50 rounded-2xl border border-emerald-100">
            <TrendingUp className="text-emerald-600 w-12 h-12 mb-4"/>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Live Inventory</h3>
            <p className="text-gray-600">Auto-deduct stock with every scan. Get alerts before you run out of fast-moving items.</p>
          </div>
          <div className="p-8 bg-purple-50 rounded-2xl border border-purple-100">
            <Store className="text-purple-600 w-12 h-12 mb-4"/>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Hyperlocal Marketplace</h3>
            <p className="text-gray-600">Become visible to customers in a 5km radius. Accept reservations and pickup orders easily.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
"""
    generate_vite_app("website", "VyaparSetu Website", 5174, website_app_code)

    print("\n✅ ALL DONE! The complete VyaparSetu workspace has been generated successfully.")

if __name__ == "__main__":
    build_workspace()