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
