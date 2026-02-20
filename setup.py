import os
import json

def create_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content.strip() + '\n')
    print(f"✅ Created: {path}")

def generate_website():
    print("🚀 Bootstrapping VyaparSetu 50+ Page Vercel-Ready Website...")
    base = "website"

    # ==========================================
    # 1. CORE CONFIGURATION (Vite, Tailwind, Vercel)
    # ==========================================
    pkg = {
        "name": "vyaparsetu-website",
        "private": True,
        "version": "1.0.0",
        "type": "module",
        "scripts": {
            "dev": "vite",
            "build": "vite build",
            "preview": "vite preview"
        },
        "dependencies": {
            "react": "^18.2.0",
            "react-dom": "^18.2.0",
            "react-router-dom": "^6.14.2",
            "lucide-react": "^0.263.1"
        },
        "devDependencies": {
            "@vitejs/plugin-react": "^4.0.3",
            "autoprefixer": "^10.4.14",
            "postcss": "^8.4.27",
            "tailwindcss": "^3.3.3",
            "vite": "^4.4.5"
        }
    }
    create_file(f"{base}/package.json", json.dumps(pkg, indent=2))
    
    # Critical for Vercel Deployment (Prevents 404s on page refresh)
    vercel_config = {
        "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
    }
    create_file(f"{base}/vercel.json", json.dumps(vercel_config, indent=2))

    create_file(f"{base}/vite.config.js", "import { defineConfig } from 'vite'\nimport react from '@vitejs/plugin-react'\nexport default defineConfig({ plugins: [react()] })")
    create_file(f"{base}/tailwind.config.js", "export default { content: ['./index.html', './src/**/*.{js,jsx}'], theme: { extend: {} }, plugins: [] }")
    create_file(f"{base}/postcss.config.js", "export default { plugins: { tailwindcss: {}, autoprefixer: {} } }")
    create_file(f"{base}/index.html", f"""<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>VyaparSetu - Local Commerce OS</title></head><body class="bg-slate-50 text-slate-900"><div id="root"></div><script type="module" src="/src/main.jsx"></script></body></html>""")
    create_file(f"{base}/src/index.css", "@tailwind base;\n@tailwind components;\n@tailwind utilities;\nhtml { scroll-behavior: smooth; }")

    create_file(f"{base}/src/main.jsx", """
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
""")

    # ==========================================
    # 2. GLOBAL COMPONENTS (Navbar, Footer, Layout)
    # ==========================================
    create_file(f"{base}/src/components/Layout.jsx", """
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
""")

    # ==========================================
    # 3. 50+ PAGE GENERATOR LOGIC
    # ==========================================
    pages = [
        # Core
        {"path": "/", "name": "Home", "title": "The Operating System for Local Commerce", "desc": "Upgrade your retail store with VyaparSetu."},
        {"path": "/about", "name": "About", "title": "Built for Bharat", "desc": "Our mission to digitize Tier 2 and Tier 3 cities."},
        {"path": "/pricing", "name": "Pricing", "title": "Simple, Transparent Pricing", "desc": "Pay for what you use. No hidden fees."},
        {"path": "/contact", "name": "Contact", "title": "Talk to Sales", "desc": "Get a free demo for your retail chain."},
        
        # Products / Features (9)
        {"path": "/features/smart-pos", "name": "FeaturePOS", "title": "Smart Point of Sale", "desc": "Lightning fast billing, even offline."},
        {"path": "/features/inventory", "name": "FeatureInventory", "title": "Live Inventory Sync", "desc": "Auto-deduction with every barcode scan."},
        {"path": "/features/udhaar-ledger", "name": "FeatureUdhaar", "title": "Udhaar Intelligence", "desc": "Track credit and send automated WhatsApp reminders."},
        {"path": "/features/marketplace", "name": "FeatureMarketplace", "title": "Hyperlocal Marketplace", "desc": "Get discovered by customers in a 5km radius."},
        {"path": "/features/suppliers", "name": "FeatureSuppliers", "title": "Supplier Hub", "desc": "Compare distributor prices in real-time."},
        {"path": "/features/delivery", "name": "FeatureDelivery", "title": "Delivery Pooling", "desc": "Share delivery partners with nearby stores."},
        {"path": "/features/analytics", "name": "FeatureAnalytics", "title": "Business Analytics", "desc": "Track peak hours and top-selling products."},
        {"path": "/features/community", "name": "FeatureCommunity", "title": "Retailer Community", "desc": "Join local bulk-buying groups for better margins."},
        {"path": "/features/loyalty", "name": "FeatureLoyalty", "title": "Loyalty Engine", "desc": "Reward repeat customers with cashback points."},

        # Industries (10)
        {"path": "/industries/grocery", "name": "IndGrocery", "title": "POS for Kirana & Grocery", "desc": "Manage thousands of FMCG SKUs easily."},
        {"path": "/industries/electronics", "name": "IndElectronics", "title": "POS for Electronics", "desc": "Track serial numbers and warranties."},
        {"path": "/industries/apparel", "name": "IndApparel", "title": "POS for Clothing Shops", "desc": "Manage colors, sizes, and seasonal inventory."},
        {"path": "/industries/hardware", "name": "IndHardware", "title": "POS for Hardware Stores", "desc": "Handle bulk item pricing and builder accounts."},
        {"path": "/industries/pharmacy", "name": "IndPharmacy", "title": "POS for Pharmacies", "desc": "Strict batch & expiry date tracking."},
        {"path": "/industries/footwear", "name": "IndFootwear", "title": "POS for Footwear", "desc": "Barcode generation for unbranded goods."},
        {"path": "/industries/supermarket", "name": "IndSupermarket", "title": "Supermarket OS", "desc": "Multi-lane billing and warehouse management."},
        {"path": "/industries/mobile-accessories", "name": "IndMobile", "title": "Mobile Accessories", "desc": "Fast checkout for high-volume low-ticket items."},
        {"path": "/industries/fmcg-distributors", "name": "IndFMCG", "title": "For FMCG Distributors", "desc": "Route planning and payment collections."},
        {"path": "/industries/stationery", "name": "IndStationery", "title": "POS for Stationery", "desc": "Manage loose items and bulk school orders."},

        # SEO Location Pages (10)
        {"path": "/locations/pune", "name": "LocPune", "title": "Best POS Software in Pune", "desc": "Trusted by 500+ stores in Kothrud, Baner, and Viman Nagar."},
        {"path": "/locations/mumbai", "name": "LocMumbai", "title": "Best POS Software in Mumbai", "desc": "Fast billing for fast-moving Mumbai retailers."},
        {"path": "/locations/delhi", "name": "LocDelhi", "title": "Best POS Software in Delhi", "desc": "Secure your inventory across the NCR region."},
        {"path": "/locations/bangalore", "name": "LocBangalore", "title": "Best POS Software in Bangalore", "desc": "Tech-enabled retail for the silicon valley."},
        {"path": "/locations/hyderabad", "name": "LocHyderabad", "title": "Best POS Software in Hyderabad", "desc": "Manage multiple branches across the city."},
        {"path": "/locations/ahmedabad", "name": "LocAhmedabad", "title": "Best POS Software in Ahmedabad", "desc": "Built for the smart business owners of Gujarat."},
        {"path": "/locations/chennai", "name": "LocChennai", "title": "Best POS Software in Chennai", "desc": "Tamil language support for local billing."},
        {"path": "/locations/kolkata", "name": "LocKolkata", "title": "Best POS Software in Kolkata", "desc": "Organize your supply chain perfectly."},
        {"path": "/locations/jaipur", "name": "LocJaipur", "title": "Best POS Software in Jaipur", "desc": "Perfect for wholesale and retail merchants."},
        {"path": "/locations/indore", "name": "LocIndore", "title": "Best POS Software in Indore", "desc": "Powering the cleanest city's retail network."},

        # Comparisons (6)
        {"path": "/compare/vyapar", "name": "CompVyapar", "title": "VyaparSetu vs Vyapar App", "desc": "Why modern retailers are switching to VyaparSetu."},
        {"path": "/compare/khatabook", "name": "CompKhatabook", "title": "VyaparSetu vs Khatabook", "desc": "Beyond just a ledger. Get full POS functionality."},
        {"path": "/compare/tally", "name": "CompTally", "title": "VyaparSetu vs Tally", "desc": "Cloud-first retail management without the complexity."},
        {"path": "/compare/marg", "name": "CompMarg", "title": "VyaparSetu vs Marg ERP", "desc": "Modern UI, zero training time required."},
        {"path": "/compare/mybillbook", "name": "CompMyBillBook", "title": "VyaparSetu vs MyBillBook", "desc": "Advanced inventory and supplier hubs included."},
        {"path": "/compare/zohobooks", "name": "CompZoho", "title": "VyaparSetu vs Zoho Books", "desc": "Designed specifically for Indian brick-and-mortar."},

        # Resources (8)
        {"path": "/resources/blog", "name": "ResBlog", "title": "Retail Insider Blog", "desc": "Tips and tricks to grow your physical store."},
        {"path": "/resources/case-studies", "name": "ResCaseStudies", "title": "Customer Success Stories", "desc": "Read how stores increased revenue by 40%."},
        {"path": "/resources/help-center", "name": "ResHelp", "title": "Help Center", "desc": "Tutorials, FAQs, and setup guides."},
        {"path": "/resources/api", "name": "ResAPI", "title": "Developer API", "desc": "Integrate VyaparSetu with your custom apps."},
        {"path": "/resources/hardware", "name": "ResHardware", "title": "Compatible Hardware", "desc": "Printers, barcode scanners, and cash drawers."},
        {"path": "/resources/onboarding", "name": "ResOnboarding", "title": "Store Onboarding", "desc": "We help upload your first 1000 items."},
        {"path": "/resources/updates", "name": "ResUpdates", "title": "Product Updates", "desc": "See what's new in the VyaparSetu OS."},
        {"path": "/resources/webinars", "name": "ResWebinars", "title": "Training Webinars", "desc": "Live weekly training for your store staff."},

        # Legal (5)
        {"path": "/legal/privacy", "name": "LegalPrivacy", "title": "Privacy Policy", "desc": "How we protect your customer and store data."},
        {"path": "/legal/terms", "name": "LegalTerms", "title": "Terms of Service", "desc": "Rules and regulations of the VyaparSetu platform."},
        {"path": "/legal/refunds", "name": "LegalRefunds", "title": "Refund Policy", "desc": "Subscription cancellation and refund rules."},
        {"path": "/legal/security", "name": "LegalSecurity", "title": "Security Architecture", "desc": "Bank-grade encryption for your retail data."},
        {"path": "/legal/gdpr", "name": "LegalGDPR", "title": "Data Compliance", "desc": "Compliance with regional data protection laws."}
    ]

    import_statements = ""
    route_statements = ""

    for page in pages:
        # Create React File for each page
        component_code = f"""
import React from 'react';
import {{ ArrowRight, CheckCircle2, Store }} from 'lucide-react';

export default function {page['name']}() {{
  return (
    <div className="animate-in fade-in duration-500">
      <header className="bg-blue-600 text-white py-24 px-6 md:px-12 text-center">
        <h1 className="text-4xl md:text-6xl font-black mb-4">{page['title']}</h1>
        <p className="text-xl text-blue-100 max-w-2xl mx-auto">{page['desc']}</p>
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
              Start your free trial <ArrowRight size={{18}}/>
            </button>
          </div>
          <div className="bg-slate-100 p-8 rounded-3xl border border-slate-200 shadow-inner flex items-center justify-center min-h-[300px]">
             <div className="text-center">
               <Store size={{64}} className="text-slate-300 mx-auto mb-4"/>
               <p className="text-slate-400 font-bold uppercase tracking-widest">{page['name']} Visuals</p>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
}}
"""
        create_file(f"{base}/src/pages/{page['name']}.jsx", component_code)
        
        # Add to App.jsx Router
        import_statements += f"import {page['name']} from './pages/{page['name']}';\n"
        # Exact match for root, regular for others
        exact_attr = " index" if page['path'] == "/" else f" path=\"{page['path'][1:]}\""
        route_statements += f"          <Route{exact_attr} element={{<{page['name']} />}} />\n"


    # ==========================================
    # 4. APP.JSX (Router Generation)
    # ==========================================
    app_jsx = f"""
import React from 'react';
import {{ Routes, Route }} from 'react-router-dom';
import Layout from './components/Layout';

// Auto-Generated Imports for 50+ Pages
{import_statements}

export default function App() {{
  return (
    <Routes>
      <Route path="/" element={{<Layout />}}>
{route_statements}
        {{/* 404 Fallback */}}
        <Route path="*" element={{
          <div className="py-32 text-center">
            <h1 className="text-4xl font-black text-gray-900 mb-4">404 - Page Not Found</h1>
            <p className="text-gray-500">The route you are looking for does not exist.</p>
          </div>
        }} />
      </Route>
    </Routes>
  );
}}
"""
    create_file(f"{base}/src/App.jsx", app_jsx)

    print(f"\n✅ Website successfully generated with 50+ Real React Router Pages!")
    print("Run `cd website`, `npm install`, then `npm run dev`.")
    print("This folder is fully Vercel-compatible via the vercel.json configuration.")

if __name__ == "__main__":
    generate_website()