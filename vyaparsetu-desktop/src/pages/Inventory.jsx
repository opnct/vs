import React, { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { 
  Search, Plus, Package, AlertTriangle, 
  CheckCircle2, MoreHorizontal, Hash, 
  Tag, Layers, Scale, X, Loader2 
} from 'lucide-react';

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);

  // New Product Form State
  const [newProduct, setNewProduct] = useState({ 
    name: '', 
    barcode: '', 
    category: 'Grocery',
    mrp: '', 
    selling_price: '', 
    stock_quantity: '', 
    unit: 'pcs',
    hsn_code: ''
  });

  // Fetch real data from SQLite
  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      const data = await invoke('get_all_products');
      setProducts(data || []);
    } catch (error) {
      console.error("Database Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.selling_price) return;
    
    try {
      // Calls the actual SQLite database via Rust command
      await invoke('add_product', { 
        name: newProduct.name, 
        barcode: newProduct.barcode || null, 
        sellingPrice: parseFloat(newProduct.selling_price),
        unit: newProduct.unit,
        hsnCode: newProduct.hsn_code || null
      });

      // Reset form and refresh list from database
      setIsAdding(false);
      setNewProduct({ 
        name: '', barcode: '', category: 'Grocery', 
        mrp: '', selling_price: '', stock_quantity: '', 
        unit: 'pcs', hsn_code: '' 
      });
      await fetchInventory();
    } catch (error) {
      console.error("Database Error:", error);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (p.barcode && p.barcode.includes(searchQuery)) ||
    (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-full gap-6 select-none font-sans">
      
      {/* 1. Header & Dark Search Bar */}
      <div className="flex items-center justify-between gap-6 shrink-0">
        <div className="flex-1 max-w-xl">
          <div className="bg-brand-surface p-2 rounded-2xl border border-white/5 flex items-center gap-3 focus-within:border-brand-blue/50 transition-all">
            <div className="pl-3 text-[#A1A1AA]"><Search size={20} /></div>
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, category or scan barcode"
              className="flex-1 bg-transparent border-none outline-none text-[15px] text-white placeholder-[#666] py-2"
            />
          </div>
        </div>
        
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold transition-all active:scale-95 ${
            isAdding ? 'bg-mac-red/10 text-mac-red border border-mac-red/20' : 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20'
          }`}
        >
          {isAdding ? <><X size={20} /> Cancel</> : <><Plus size={20} /> Add Product</>}
        </button>
      </div>

      {/* 2. Add Product Form */}
      {isAdding && (
        <div className="bg-brand-surface p-8 rounded-[2rem] border border-white/5 shadow-2xl animate-in slide-in-from-top-4 duration-300 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-brand-blue"></div>
          <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
            <Package size={20} className="text-brand-blue" /> Product Registration
          </h3>
          
          <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            <div className="md:col-span-2 space-y-2">
              <label className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-widest ml-1">Product Name *</label>
              <input required type="text" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full bg-brand-dark p-3.5 rounded-xl border border-white/5 text-white font-medium focus:border-brand-blue transition-all" placeholder="e.g. Loose Sugar" />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-widest ml-1">Category</label>
              <select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="w-full bg-brand-dark p-3.5 rounded-xl border border-white/5 text-white font-medium focus:border-brand-blue outline-none">
                <option>Grocery</option>
                <option>Snacks</option>
                <option>Dairy</option>
                <option>Beverages</option>
                <option>Personal Care</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-widest ml-1">Selling Price (₹) *</label>
              <input required type="number" step="0.01" value={newProduct.selling_price} onChange={e => setNewProduct({...newProduct, selling_price: e.target.value})} className="w-full bg-brand-dark p-3.5 rounded-xl border border-white/5 text-mac-green font-black focus:border-mac-green outline-none" placeholder="0.00" />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-widest ml-1">Unit Type</label>
              <select value={newProduct.unit} onChange={e => setNewProduct({...newProduct, unit: e.target.value})} className="w-full bg-brand-dark p-3.5 rounded-xl border border-white/5 text-white font-medium focus:border-brand-blue outline-none">
                <option value="pcs">Pieces (pcs)</option>
                <option value="kg">Kilogram (kg)</option>
                <option value="gm">Grams (gm)</option>
                <option value="packet">Packet</option>
                <option value="ltr">Litre (L)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-widest ml-1">Barcode / HSN</label>
              <input type="text" value={newProduct.barcode} onChange={e => setNewProduct({...newProduct, barcode: e.target.value})} className="w-full bg-brand-dark p-3.5 rounded-xl border border-white/5 text-white font-medium focus:border-brand-blue outline-none" placeholder="Scan or Type..." />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-widest ml-1">Initial Stock</label>
              <input type="number" step="0.001" value={newProduct.stock_quantity} onChange={e => setNewProduct({...newProduct, stock_quantity: e.target.value})} className="w-full bg-brand-dark p-3.5 rounded-xl border border-white/5 text-white font-medium focus:border-brand-blue outline-none" placeholder="0.000" />
            </div>

            <button type="submit" className="bg-brand-blue text-white font-black py-4 rounded-xl hover:bg-brand-blue/80 transition-all uppercase tracking-widest text-[13px] shadow-lg shadow-brand-blue/20">
              Save Product
            </button>
          </form>
        </div>
      )}

      {/* 3. Main Inventory Grid */}
      <div className="flex-1 bg-brand-surface rounded-[2.5rem] border border-white/5 overflow-hidden flex flex-col shadow-2xl relative">
        
        {loading && (
          <div className="absolute inset-0 bg-brand-surface/50 backdrop-blur-sm z-10 flex items-center justify-center">
            <Loader2 className="animate-spin text-brand-blue" size={40} />
          </div>
        )}

        <div className="grid grid-cols-12 gap-4 px-8 py-5 bg-brand-dark/30 border-b border-white/5 text-[11px] font-black text-[#666] uppercase tracking-[0.2em]">
          <div className="col-span-5">Product Details</div>
          <div className="col-span-2">Pricing</div>
          <div className="col-span-3">Stock Inventory</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {products.length === 0 && !loading ? (
            <div className="h-full flex flex-col items-center justify-center text-[#333]">
              <Layers size={64} strokeWidth={1} />
              <p className="mt-4 font-bold tracking-widest uppercase text-xs">No products in local database</p>
            </div>
          ) : (
            filteredProducts.map(product => {
              const stockVal = parseFloat(product.stock_quantity || 0);
              const isOutOfStock = stockVal <= 0;
              const isLowStock = stockVal > 0 && stockVal <= 5;

              return (
                <div key={product.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center bg-brand-dark/20 hover:bg-white/5 rounded-3xl border border-white/5 transition-all group">
                  
                  <div className="col-span-5 flex items-center gap-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border border-white/5 ${
                      isOutOfStock ? 'bg-mac-red/10 text-mac-red' : 'bg-brand-dark text-[#A1A1AA]'
                    }`}>
                      <Package size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-[17px] leading-tight">{product.name}</h4>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/5 text-[#666] flex items-center gap-1 uppercase">
                          <Tag size={10} /> {product.category || 'General'}
                        </span>
                        {product.barcode && (
                          <span className="text-[10px] font-mono text-[#444] tracking-widest uppercase">
                            <Hash size={10} className="inline mr-1" /> {product.barcode}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <div className="text-mac-green font-black text-xl leading-none">₹{product.selling_price.toFixed(2)}</div>
                    {product.purchase_price > 0 && (
                      <div className="text-[11px] font-bold text-[#444] mt-1">Cost ₹{product.purchase_price.toFixed(2)}</div>
                    )}
                  </div>

                  <div className="col-span-3 flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1.5 pr-4">
                        <span className={`text-[13px] font-black ${isOutOfStock ? 'text-mac-red' : 'text-white'}`}>
                          {stockVal.toFixed(3)} {product.unit}
                        </span>
                        <span className={`w-2 h-2 rounded-full ${
                          isOutOfStock ? 'bg-mac-red animate-pulse' : 
                          isLowStock ? 'bg-mac-yellow' : 
                          'bg-mac-green'
                        }`}></span>
                      </div>
                      <div className="w-full h-1.5 bg-brand-dark rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            isOutOfStock ? 'w-0' : 
                            isLowStock ? 'bg-mac-yellow w-1/4' : 
                            'bg-mac-green w-full'
                          }`}
                          style={{ width: isOutOfStock ? '0%' : isLowStock ? '25%' : '100%' }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-2 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button className="p-3 bg-white/5 hover:bg-white/10 text-[#A1A1AA] hover:text-white rounded-xl transition-all">
                      <Scale size={18} />
                    </button>
                    <button className="p-3 bg-white/5 hover:bg-white/10 text-[#A1A1AA] hover:text-white rounded-xl transition-all">
                      <MoreHorizontal size={18} />
                    </button>
                  </div>

                </div>
              );
            })
          )}
        </div>

        {/* Footer Summary Bar */}
        <div className="px-8 py-4 bg-brand-dark/50 border-t border-white/5 flex items-center justify-between">
          <div className="flex gap-6">
             <div className="flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-mac-red"></span>
               <span className="text-[11px] font-bold text-[#666] uppercase tracking-widest">Out of stock</span>
             </div>
             <div className="flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-mac-yellow"></span>
               <span className="text-[11px] font-bold text-[#666] uppercase tracking-widest">Low stock</span>
             </div>
             <div className="flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-mac-green"></span>
               <span className="text-[11px] font-bold text-[#666] uppercase tracking-widest">Available</span>
             </div>
          </div>
          <div className="text-[11px] font-black text-brand-blue uppercase tracking-[0.2em]">
            Total SKUs: {products.length}
          </div>
        </div>

      </div>
    </div>
  );
}