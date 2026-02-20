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
