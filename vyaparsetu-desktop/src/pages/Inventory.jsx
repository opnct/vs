import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Search, Plus, Package, AlertTriangle, CheckCircle2, MoreHorizontal } from 'lucide-react';

// Real-world Kirana initial inventory (Matches your database schema)
const INITIAL_INVENTORY = [
  { id: 1, name: "Aashirvaad Atta", barcode: "8901234567890", mrp: 260.00, selling_price: 240.00, stock: 4.0, unit: "packet", low_stock_alert: 5.0 },
  { id: 2, name: "Toor Dal (Loose)", barcode: "", mrp: 180.00, selling_price: 160.00, stock: 12.5, unit: "kg", low_stock_alert: 5.0 },
  { id: 3, name: "Tata Salt", barcode: "8901000000001", mrp: 28.00, selling_price: 28.00, stock: 45.0, unit: "packet", low_stock_alert: 10.0 },
  { id: 4, name: "Sugar (Loose)", barcode: "", mrp: 45.00, selling_price: 42.00, stock: 2.3, unit: "kg", low_stock_alert: 15.0 },
  { id: 5, name: "Amul Taaza Milk", barcode: "8901234560000", mrp: 27.00, selling_price: 27.00, stock: 0.0, unit: "packet", low_stock_alert: 10.0 },
];

export default function Inventory() {
  const [products, setProducts] = useState(INITIAL_INVENTORY);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // New Product Form State
  const [newProduct, setNewProduct] = useState({ name: '', barcode: '', mrp: '', selling_price: '', stock: '', unit: 'pcs' });

  // Filter logic
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (p.barcode && p.barcode.includes(searchQuery))
  );

  // Real Database Logic
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.selling_price) return alert("Name and Selling Price are required.");
    
    try {
      // Calls the actual SQLite database via Rust command
      await invoke('add_product', { 
        name: newProduct.name, 
        barcode: newProduct.barcode || null, 
        sellingPrice: parseFloat(newProduct.selling_price) 
      });

      // Update local UI state
      const addedItem = {
        id: Date.now(), // Temporary ID until full refresh
        ...newProduct,
        mrp: parseFloat(newProduct.mrp) || parseFloat(newProduct.selling_price),
        selling_price: parseFloat(newProduct.selling_price),
        stock: parseFloat(newProduct.stock) || 0,
        low_stock_alert: 5.0
      };

      setProducts([addedItem, ...products]);
      setIsAdding(false);
      setNewProduct({ name: '', barcode: '', mrp: '', selling_price: '', stock: '', unit: 'pcs' });
    } catch (error) {
      alert("Database Error: " + error);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-[1600px] mx-auto gap-6">
      
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
        <div className="flex-1 max-w-xl">
          <div className="bg-white p-3 rounded-3xl shadow-soft-float border border-gray-100 flex items-center gap-4 transition-all focus-within:ring-4 ring-brand-bg">
            <div className="w-10 h-10 bg-pastel-peach rounded-xl flex items-center justify-center shrink-0">
              <Search size={20} className="text-orange-900" />
            </div>
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search product name or scan barcode..."
              className="flex-1 bg-transparent text-lg font-bold text-brand-text placeholder-brand-muted/50 border-none outline-none"
            />
          </div>
        </div>
        
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-brand-text text-white hover:bg-black font-black tracking-wide uppercase py-4 px-8 rounded-3xl flex items-center justify-center gap-3 transition-transform active:scale-95 shadow-soft-3d shrink-0"
        >
          {isAdding ? 'CANCEL' : <><Plus size={20} /> ADD NEW PRODUCT</>}
        </button>
      </div>

      {/* Add Product Form (Conditional) */}
      {isAdding && (
        <form onSubmit={handleAddProduct} className="bg-white p-8 rounded-4xl shadow-soft-float border border-gray-100 shrink-0 grid grid-cols-1 md:grid-cols-6 gap-6 items-end animate-in slide-in-from-top-4 duration-300">
          <div className="md:col-span-2 space-y-2">
            <label className="text-xs font-black text-brand-muted uppercase tracking-widest">Product Name *</label>
            <input required type="text" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full bg-brand-bg p-4 rounded-2xl border border-gray-200 font-bold focus:outline-none focus:border-indigo-400" placeholder="e.g. Loose Sugar" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-brand-muted uppercase tracking-widest">Barcode</label>
            <input type="text" value={newProduct.barcode} onChange={e => setNewProduct({...newProduct, barcode: e.target.value})} className="w-full bg-brand-bg p-4 rounded-2xl border border-gray-200 font-bold focus:outline-none focus:border-indigo-400" placeholder="Scan..." />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-brand-muted uppercase tracking-widest">MRP (₹)</label>
            <input type="number" step="0.01" value={newProduct.mrp} onChange={e => setNewProduct({...newProduct, mrp: e.target.value})} className="w-full bg-brand-bg p-4 rounded-2xl border border-gray-200 font-bold focus:outline-none focus:border-indigo-400" placeholder="0.00" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-brand-muted uppercase tracking-widest">Sell Price *</label>
            <input required type="number" step="0.01" value={newProduct.selling_price} onChange={e => setNewProduct({...newProduct, selling_price: e.target.value})} className="w-full bg-brand-bg p-4 rounded-2xl border border-gray-200 font-bold focus:outline-none focus:border-indigo-400" placeholder="0.00" />
          </div>
          <button type="submit" className="bg-pastel-blue text-indigo-900 border border-indigo-200 font-black py-4 rounded-2xl hover:bg-indigo-100 transition-colors uppercase tracking-widest text-sm">
            SAVE
          </button>
        </form>
      )}

      {/* Main Inventory Table */}
      <div className="flex-1 bg-white rounded-4xl shadow-soft-float border border-gray-50 overflow-hidden flex flex-col">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 p-6 bg-gray-50/50 border-b border-gray-100 text-xs font-black text-brand-muted uppercase tracking-[0.2em]">
          <div className="col-span-4">Product Name</div>
          <div className="col-span-2">Price (MRP)</div>
          <div className="col-span-2">Selling Price</div>
          <div className="col-span-3">Stock Status</div>
          <div className="col-span-1 text-center">Act</div>
        </div>

        {/* Table Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredProducts.map(product => {
            const isOutOfStock = product.stock <= 0;
            const isLowStock = product.stock > 0 && product.stock <= product.low_stock_alert;

            return (
              <div key={product.id} className="grid grid-cols-12 gap-4 p-4 items-center bg-brand-bg hover:bg-gray-50 rounded-3xl border border-transparent hover:border-gray-200 transition-all group">
                
                <div className="col-span-4 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    isOutOfStock ? 'bg-rose-100 text-rose-600' : 'bg-white shadow-sm text-brand-text'
                  }`}>
                    <Package size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-brand-text text-base leading-tight">{product.name}</h4>
                    <p className="text-[10px] font-mono tracking-widest text-brand-muted mt-1 uppercase">
                      {product.barcode || 'NO BARCODE'} • {product.unit}
                    </p>
                  </div>
                </div>

                <div className="col-span-2 font-bold text-gray-400 line-through">
                  ₹{product.mrp.toFixed(2)}
                </div>

                <div className="col-span-2 font-black text-brand-text text-lg">
                  ₹{product.selling_price.toFixed(2)}
                </div>

                <div className="col-span-3 flex items-center gap-3">
                  {isOutOfStock ? (
                    <span className="flex items-center gap-2 bg-rose-100 text-rose-800 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest border border-rose-200">
                      <AlertTriangle size={14} /> Out of Stock
                    </span>
                  ) : isLowStock ? (
                    <>
                      <span className="font-black text-orange-600">{product.stock} {product.unit}</span>
                      <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-orange-200">Low</span>
                    </>
                  ) : (
                    <>
                      <span className="font-black text-brand-text">{product.stock} {product.unit}</span>
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-green-200">
                        <CheckCircle2 size={12} className="inline mr-1" /> OK
                      </span>
                    </>
                  )}
                </div>

                <div className="col-span-1 flex justify-center">
                  <button className="p-2 text-gray-400 hover:text-brand-text transition-colors">
                    <MoreHorizontal size={20} />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}