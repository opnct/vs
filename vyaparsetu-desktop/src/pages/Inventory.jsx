import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { 
  Plus, Package, MoreHorizontal, Hash, 
  Tag, X, Loader2, IndianRupee, Percent, Search
} from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import PremiumTable from '../components/ui/PremiumTable';
import GlassModal from '../components/ui/GlassModal';
import PermissionGate from '../components/PermissionGate';

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);

  const defaultProductState = { 
    name: '', 
    sku: '',
    barcode: '', 
    category: 'Grocery',
    cost_price: '', 
    selling_price: '', 
    stock_quantity: '', 
    min_stock: '5',
    unit: 'pcs',
    hsn_code: '',
    tax_rate: '0'
  };

  const [newProduct, setNewProduct] = useState(defaultProductState);

  // 1. Fetch real data from native Rust SQLite via Tauri IPC
  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      const data = await invoke('get_all_products').catch(() => []);
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

  // 2. Insert real data into native Rust SQLite via Tauri IPC
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.selling_price) return;
    
    try {
      const payload = {
        id: Date.now().toString(),
        name: newProduct.name,
        sku: newProduct.sku || null,
        barcode: newProduct.barcode || null,
        category: newProduct.category || null,
        unit: newProduct.unit,
        cost_price: parseFloat(newProduct.cost_price) || 0.0,
        selling_price: parseFloat(newProduct.selling_price) || 0.0,
        stock_quantity: parseFloat(newProduct.stock_quantity) || 0.0,
        min_stock: parseFloat(newProduct.min_stock) || 0.0,
        hsn_code: newProduct.hsn_code || null,
        tax_rate: parseFloat(newProduct.tax_rate) || 0.0,
      };

      await invoke('create_product', { p: payload });
      setIsAdding(false);
      setNewProduct(defaultProductState);
      await fetchInventory();
    } catch (error) {
      console.error("Database Insertion Error:", error);
    }
  };

  // 3. Filtered Data for Table
  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.barcode && p.barcode.includes(searchQuery)) ||
      (p.hsn_code && p.hsn_code.includes(searchQuery))
    );
  }, [products, searchQuery]);

  // 4. Table Column Definitions (Flat Enterprise Styling)
  const columnHelper = createColumnHelper();
  const columns = useMemo(() => [
    columnHelper.accessor('name', {
      header: 'Product Details',
      cell: info => {
        const product = info.row.original;
        const isOutOfStock = product.stock_quantity <= 0;
        return (
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-sm flex items-center justify-center shrink-0 border ${
              isOutOfStock ? 'bg-status-red/10 border-status-red/20 text-status-red' : 'bg-[#111111] border-white/10 text-gray-500'
            }`}>
              <Package size={18} />
            </div>
            <div className="overflow-hidden">
              <h4 className="font-bold text-white text-sm leading-tight truncate">{product.name}</h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-white/10 text-gray-400 uppercase tracking-widest">
                  {product.category || 'General'}
                </span>
                {product.barcode && (
                  <span className="text-[10px] font-mono text-gray-500 tracking-widest uppercase">
                    #{product.barcode}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      }
    }),
    columnHelper.accessor('selling_price', {
      header: 'Pricing',
      cell: info => {
        const product = info.row.original;
        return (
          <div className="flex flex-col">
            <span className="text-status-green font-black text-sm">₹{product.selling_price.toFixed(2)}</span>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">
              Cost: ₹{product.cost_price.toFixed(2)}
            </span>
          </div>
        );
      }
    }),
    columnHelper.accessor('tax_rate', {
      header: 'Tax (%)',
      cell: info => (
        <span className="bg-brand-blue/10 text-brand-blue text-[10px] font-black px-2 py-1 rounded-sm border border-brand-blue/20">
          {info.getValue()}% GST
        </span>
      )
    }),
    columnHelper.accessor('stock_quantity', {
      header: 'Inventory',
      cell: info => {
        const product = info.row.original;
        const stock = parseFloat(product.stock_quantity || 0);
        const isLow = stock <= parseFloat(product.min_stock || 0);
        return (
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1 w-24 bg-[#111111] rounded-none overflow-hidden border border-white/5">
              <div 
                className={`h-full transition-all duration-700 ${stock <= 0 ? 'bg-status-red w-0' : isLow ? 'bg-status-orange w-1/3' : 'bg-status-green w-full'}`}
              ></div>
            </div>
            <span className={`text-xs font-black whitespace-nowrap ${stock <= 0 ? 'text-status-red' : isLow ? 'text-status-orange' : 'text-white'}`}>
              {stock} {product.unit}
            </span>
          </div>
        );
      }
    }),
    columnHelper.display({
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: () => (
        <div className="flex justify-end">
          <button className="p-2 rounded-sm hover:bg-white/10 text-gray-500 hover:text-white transition-colors border border-transparent hover:border-white/10">
            <MoreHorizontal size={18} />
          </button>
        </div>
      )
    })
  ], []);

  return (
    <div className="flex flex-col h-full gap-6 select-none font-sans text-white bg-brand-black p-6">
      
      {/* 1. Header & Quick Search */}
      <div className="flex items-center justify-between gap-6 shrink-0 border-b border-white/10 pb-6">
        <div className="animate-in fade-in slide-in-from-left-4 duration-500">
          <h1 className="text-3xl font-black tracking-tight uppercase">Inventory Engine</h1>
          <p className="text-gray-500 text-xs mt-1 font-bold tracking-widest uppercase">Real-time stock control and compliance.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-[#111111] p-2 rounded-sm flex items-center gap-3 focus-within:border-brand-blue transition-all w-64 border border-white/10">
            <div className="pl-2 text-gray-500"><Search size={16} /></div>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="QUICK SEARCH..."
              className="flex-1 bg-transparent border-none outline-none text-xs font-bold text-white placeholder-gray-600 tracking-widest"
            />
          </div>
          
          <PermissionGate permission="ADD_INVENTORY" type="inline">
            <button 
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-brand-blue text-white rounded-sm font-black text-xs tracking-widest uppercase hover:bg-blue-700 transition-colors border border-brand-blue"
            >
              <Plus size={16} /> Add Product
            </button>
          </PermissionGate>
        </div>
      </div>

      {/* 2. Flat Data Table Container */}
      <div className="flex-1 bg-[#0a0a0a] rounded-sm border border-white/10 overflow-hidden flex flex-col relative">
        {loading && (
          <div className="absolute inset-0 bg-[#0a0a0a]/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <Loader2 className="animate-spin text-brand-blue" size={40} />
          </div>
        )}
        <PremiumTable 
          data={filteredProducts} 
          columns={columns} 
          onRowClick={(p) => console.log("Product selected:", p)}
        />
      </div>

      {/* 3. Add Product Modal (Flat Enterprise Style) */}
      <GlassModal 
        isOpen={isAdding} 
        onClose={() => setIsAdding(false)} 
        title="Master Catalog Entry"
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleAddProduct} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Product Name *</label>
              <input required autoFocus type="text" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full bg-[#111111] p-3 rounded-sm border border-white/10 outline-none text-white font-bold focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all" placeholder="e.g. Premium Rice" />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Category</label>
              <select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="w-full bg-[#111111] p-3 rounded-sm border border-white/10 outline-none text-white font-bold focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all cursor-pointer">
                <option>Grocery</option>
                <option>Snacks</option>
                <option>Dairy</option>
                <option>Beverages</option>
                <option>Personal Care</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Barcode / SKU</label>
              <div className="relative">
                <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="text" value={newProduct.barcode} onChange={e => setNewProduct({...newProduct, barcode: e.target.value})} className="w-full bg-[#111111] p-3 pl-10 rounded-sm border border-white/10 outline-none text-white font-bold focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all" placeholder="Scan..." />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Cost Price (₹)</label>
              <div className="relative">
                <IndianRupee size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="number" step="0.01" value={newProduct.cost_price} onChange={e => setNewProduct({...newProduct, cost_price: e.target.value})} className="w-full bg-[#111111] p-3 pl-10 rounded-sm border border-white/10 outline-none text-white font-bold focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all" placeholder="0.00" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Selling Price (₹) *</label>
              <div className="relative">
                <IndianRupee size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-status-green" />
                <input required type="number" step="0.01" value={newProduct.selling_price} onChange={e => setNewProduct({...newProduct, selling_price: e.target.value})} className="w-full bg-[#111111] p-3 pl-10 rounded-sm border border-white/10 outline-none text-status-green font-black focus:border-status-green focus:ring-1 focus:ring-status-green transition-all" placeholder="0.00" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex justify-between">
                <span>Initial Stock</span>
                <span className="text-status-orange">Min Alert</span>
              </label>
              <div className="flex gap-3">
                <input type="number" step="0.01" value={newProduct.stock_quantity} onChange={e => setNewProduct({...newProduct, stock_quantity: e.target.value})} className="w-1/2 bg-[#111111] p-3 rounded-sm border border-white/10 outline-none text-white font-bold focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all" placeholder="0.00" />
                <input type="number" step="0.01" value={newProduct.min_stock} onChange={e => setNewProduct({...newProduct, min_stock: e.target.value})} className="w-1/2 bg-[#111111] p-3 rounded-sm border border-white/10 outline-none text-status-orange font-bold focus:border-status-orange focus:ring-1 focus:ring-status-orange transition-all" placeholder="5" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">HSN & Tax (%)</label>
              <div className="flex gap-3">
                <input type="text" value={newProduct.hsn_code} onChange={e => setNewProduct({...newProduct, hsn_code: e.target.value})} className="w-2/3 bg-[#111111] p-3 rounded-sm border border-white/10 outline-none text-white font-bold focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all uppercase" placeholder="HSN" />
                <div className="w-1/3 relative">
                  <Percent size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-blue" />
                  <input type="number" step="0.1" value={newProduct.tax_rate} onChange={e => setNewProduct({...newProduct, tax_rate: e.target.value})} className="w-full bg-[#111111] p-3 rounded-sm border border-white/10 outline-none text-brand-blue font-black focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all" placeholder="0" />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-4 border-t border-white/10 flex gap-4">
            <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-3 bg-transparent border border-white/10 hover:bg-white/5 text-gray-400 font-bold rounded-sm uppercase tracking-widest text-xs transition-colors">
              Cancel
            </button>
            <button type="submit" className="flex-[2] py-3 bg-brand-blue text-white font-black rounded-sm uppercase tracking-widest text-xs hover:bg-blue-700 transition-colors border border-brand-blue">
              Commit to Database
            </button>
          </div>
        </form>
      </GlassModal>

    </div>
  );
}