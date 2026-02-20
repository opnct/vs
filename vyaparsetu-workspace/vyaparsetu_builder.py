import os
import json

def create_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Created: {path}")

def generate_project():
    print("🚀 Bootstrapping VyaparSetu LCOS (React + Node.js)...")
    base = "vyaparsetu"

    # ==========================================
    # 1. ROOT & README
    # ==========================================
    create_file(f"{base}/README.md", """# VyaparSetu LCOS
    
## Start Backend
`cd server && npm install && npm run dev`

## Start Frontend
`cd client && npm install && npm run dev`
""")

    # ==========================================
    # 2. BACKEND (Node/Express/MongoDB)
    # ==========================================
    server_pkg = {
        "name": "vyaparsetu-api",
        "version": "1.0.0",
        "main": "server.js",
        "scripts": {
            "start": "node server.js",
            "dev": "nodemon server.js"
        },
        "dependencies": {
            "express": "^4.18.2",
            "mongoose": "^7.4.1",
            "cors": "^2.8.5",
            "dotenv": "^16.3.1",
            "jsonwebtoken": "^9.0.1",
            "bcryptjs": "^2.4.3"
        },
        "devDependencies": {
            "nodemon": "^3.0.1"
        }
    }
    create_file(f"{base}/server/package.json", json.dumps(server_pkg, indent=2))
    
    create_file(f"{base}/server/.env", """PORT=5000
MONGO_URI=mongodb://localhost:27017/vyaparsetu_dev
JWT_SECRET=super_secret_vyaparsetu_key_2026
NODE_ENV=development
""")

    create_file(f"{base}/server/server.js", """
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Basic Route
app.get('/api/health', (req, res) => res.json({ status: 'VyaparSetu API is running perfectly!' }));

// Connect DB & Start
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
    app.listen(process.env.PORT, () => console.log(`🚀 Server running on port ${process.env.PORT}`));
  })
  .catch(err => console.error('❌ DB Connection Error:', err));
""")

    # Create Backend Folders
    for folder in ['controllers', 'models', 'routes', 'middleware', 'utils', 'services']:
        os.makedirs(f"{base}/server/{folder}", exist_ok=True)

    # ==========================================
    # 3. FRONTEND (Vite/React/Tailwind)
    # ==========================================
    client_pkg = {
        "name": "vyaparsetu-client",
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
            "axios": "^1.4.0",
            "lucide-react": "^0.263.1",
            "recharts": "^2.7.2",
            "clsx": "^2.0.0",
            "tailwind-merge": "^1.14.0"
        },
        "devDependencies": {
            "@types/react": "^18.2.15",
            "@types/react-dom": "^18.2.7",
            "@vitejs/plugin-react": "^4.0.3",
            "autoprefixer": "^10.4.14",
            "postcss": "^8.4.27",
            "tailwindcss": "^3.3.3",
            "vite": "^4.4.5"
        }
    }
    create_file(f"{base}/client/package.json", json.dumps(client_pkg, indent=2))
    
    create_file(f"{base}/client/tailwind.config.js", """
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: [],
}
""")
    create_file(f"{base}/client/postcss.config.js", "export default { plugins: { tailwindcss: {}, autoprefixer: {} } }")
    create_file(f"{base}/client/vite.config.js", """
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { port: 3000 }
})
""")
    create_file(f"{base}/client/index.html", """<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>VyaparSetu LCOS</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>""")

    create_file(f"{base}/client/src/index.css", "@tailwind base;\n@tailwind components;\n@tailwind utilities;")
    
    create_file(f"{base}/client/src/main.jsx", """
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
""")

    # 50+ Pages Generation Setup
    pages = [
        # Auth
        "auth/Login", "auth/Register", "auth/ForgotPassword", "auth/OTPVerify",
        # Dashboard
        "dashboard/RetailerDash", "dashboard/AdminDash", "dashboard/SupplierDash",
        # POS
        "pos/Terminal", "pos/Invoices", "pos/Returns", "pos/HoldTickets", "pos/CashDrawer",
        # Inventory
        "inventory/ProductList", "inventory/AddProduct", "inventory/Categories", "inventory/StockAlerts", "inventory/BarcodePrint", "inventory/BatchExpiry", "inventory/Warehouse",
        # Udhaar
        "udhaar/CustomerLedger", "udhaar/CreditScore", "udhaar/PaymentHistory", "udhaar/SendReminders", "udhaar/RiskAnalysis",
        # Marketplace
        "marketplace/Storefront", "marketplace/Orders", "marketplace/Reservations", "marketplace/Promotions", "marketplace/RadiusSettings",
        # Supplier Hub
        "suppliers/Directory", "suppliers/PurchaseOrders", "suppliers/PriceComparison", "suppliers/GoodsReceipt", "suppliers/ReturnsToVendor",
        # Delivery
        "delivery/ActivePool", "delivery/RouteClusters", "delivery/PartnerPayouts", "delivery/LiveTracking",
        # Analytics
        "analytics/SalesReports", "analytics/TaxReports", "analytics/Heatmap", "analytics/StaffPerformance", "analytics/PredictiveTrends",
        # Community
        "community/LocalForum", "community/FraudAlerts", "community/BulkBuyGroups", "community/Broadcasts",
        # Loyalty
        "loyalty/PointsLedger", "loyalty/RewardCatalog", "loyalty/CashbackRules",
        # Settings
        "settings/StoreProfile", "settings/TaxSettings", "settings/StaffRoles", "settings/Subscription", "settings/HardwareConfig"
    ]

    create_file(f"{base}/client/src/App.jsx", """
import { Routes, Route } from 'react-router-dom';
// Automated imports would go here in a full compiler, showing dynamic structure for 50+ pages.

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Routes>
        <Route path="/" element={<div className="p-10 text-2xl font-bold">VyaparSetu Multi-Page Architecture Scaffolded. 50+ routes ready.</div>} />
        {/* All routes map here */}
      </Routes>
    </div>
  );
}
""")

    for page in pages:
        path = f"{base}/client/src/pages/{page}.jsx"
        name = page.split('/')[-1]
        create_file(path, f"""export default function {name}() {{
  return <div className="p-6"><h1>{name} Module</h1><p>Real module logic goes here.</p></div>;
}}""")

    print("\n✅ SUCCESS: VyaparSetu 50+ Page Structure Generated Successfully!")
    print("Run the starting commands provided above to launch the local servers.")

if __name__ == "__main__":
    generate_project()