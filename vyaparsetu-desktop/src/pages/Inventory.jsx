import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { 
  Plus, Package, MoreHorizontal, Hash, 
  Tag, X, Loader2, IndianRupee, Percent, Search
} from 'lucide-react';
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

  // 1. Fetch real data from SQLite via Electron IPC
  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      if (window.electronAPI) {
        const data = await window.electronAPI.invoke('get_all_products');
        setProducts(data || []);
      }
    } catch (error) {
      console.error("Database Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // 2. Insert real data into SQLite via Electron IPC
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.selling_price) return;
    
    try {
      if (window.electronAPI) {
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

        await window.electronAPI.invoke('create_product', { p: payload });
        setIsAdding(false);
        setNewProduct(defaultProductState);
        await fetchInventory();
      }
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

  // 4. Table Column Definitions
  const columnHelper = createColumnHelper();
  const columns = useMemo(() => [
    columnHelper.accessor('name', {
      header: 'Product Details',
      cell: info => {
        const product = info.row.original;
        const isOutOfStock = product.stock_quantity <= 0;
        return (
          <div className="flex items-center gap-4">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border border-white/5 ${
              isOutOfStock ? 'bg-[#f87171]/10 text-[#f87171]' : 'bg-[#0a0a0a] text-[#888888]'
            }`}>
              <Package size={18} />
            </div>
            <div className="overflow-hidden">
              <h4 className="font-bold text-white text-[14px] leading-tight truncate">{product.name}</h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-white/5 text-[#555] uppercase tracking-widest">
                  {product.category || 'General'}
                </span>
                {product.barcode && (
                  <span className="text-[9px] font-mono text-[#444] tracking-widest uppercase">
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
            <span className="text-[#4ade80] font-black text-[15px]">₹{product.selling_price.toFixed(2)}</span>
            <span className="text-[10px] font-bold text-[#444] uppercase tracking-tighter">
              Cost: ₹{product.cost_price.toFixed(2)}
            </span>
          </div>
        );
      }
    }),
    columnHelper.accessor('tax_rate', {
      header: 'Tax (%)',
      cell: info => (
        <span className="bg-[#007AFF]/10 text-[#007AFF] text-[10px] font-black px-2 py-1 rounded-lg border border-[#007AFF]/20">
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
            <div className="flex-1 h-1.5 w-24 bg-[#0a0a0a] rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-700 ${stock <= 0 ? 'bg-[#f87171] w-0' : isLow ? 'bg-[#FFBD2E] w-1/3' : 'bg-[#4ade80] w-full'}`}
              ></div>
            </div>
            <span className={`text-[12px] font-black whitespace-nowrap ${stock <= 0 ? 'text-[#f87171]' : isLow ? 'text-[#FFBD2E]' : 'text-white'}`}>
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
          <button className="p-2 rounded-xl hover:bg-white/5 text-[#444] hover:text-white transition-colors">
            <MoreHorizontal size={18} />
          </button>
        </div>
      )
    })
  ], []);

  return (
    <div className="flex flex-col h-full gap-6 select-none font-sans text-white">
      
      {/* 1. Header & Quick Search */}
      <div className="flex items-center justify-between gap-6 shrink-0">
        <div className="animate-in fade-in slide-in-from-left-4 duration-500">
          <h1 className="text-3xl font-bold tracking-tight">Inventory Engine</h1>
          <p className="text-[#888888] text-sm mt-1 font-medium">Real-time stock control and compliance.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-[#1c1c1e] p-1.5 rounded-2xl flex items-center gap-3 focus-within:ring-1 focus-within:ring-[#007AFF]/50 transition-all w-64 border border-white/5">
            <div className="pl-2 text-[#555]"><Search size={18} /></div>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Quick search..."
              className="flex-1 bg-transparent border-none outline-none text-sm font-bold text-white placeholder-[#444] py-1.5"
            />
          </div>
          
          <PermissionGate permission="ADD_INVENTORY" type="inline">
            <button 
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 px-6 py-3.5 bg-[#007AFF] text-white rounded-2xl font-black text-sm tracking-widest uppercase shadow-glow-blue hover:bg-[#007AFF]/80 transition-all active:scale-95"
            >
              <Plus size={18} /> Add Product
            </button>
          </PermissionGate>
        </div>
      </div>

      {/* 2. Premium Data Table Container */}
      <div className="flex-1 bg-[#1c1c1e] rounded-[2.5rem] border border-white/5 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col relative">
        {loading && (
          <div className="absolute inset-0 bg-[#1c1c1e]/60 backdrop-blur-sm z-50 flex items-center justify-center">
            <Loader2 className="animate-spin text-[#007AFF]" size={40} />
          </div>
        )}
        <PremiumTable 
          data={filteredProducts} 
          columns={columns} 
          onRowClick={(p) => console.log("Product selected:", p)}
        />
      </div>

      {/* 3. Add Product GlassModal */}
      <GlassModal 
        isOpen={isAdding} 
        onClose={() => setIsAdding(false)} 
        title="Master Catalog Entry"
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleAddProduct} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black text-[#888888] uppercase tracking-[0.2em] ml-1">Product Name *</label>
              <input required autoFocus type="text" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full bg-[#0a0a0a] p-4 rounded-2xl border-none outline-none text-white font-bold focus:ring-2 focus:ring-[#007AFF] transition-all" placeholder="e.g. Loose Sugar" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#888888] uppercase tracking-[0.2em] ml-1">Category</label>
              <select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="w-full bg-[#0a0a0a] p-4 rounded-2xl border-none outline-none text-white font-bold focus:ring-2 focus:ring-[#007AFF] cursor-pointer">
                <option>Grocery</option>
                <option>Snacks</option>
                <option>Dairy</option>
                <option>Beverages</option>
                <option>Personal Care</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#888888] uppercase tracking-[0.2em] ml-1">Barcode / SKU</label>
              <div className="relative">
                <Hash size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#444]" />
                <input type="text" value={newProduct.barcode} onChange={e => setNewProduct({...newProduct, barcode: e.target.value})} className="w-full bg-[#0a0a0a] p-4 pl-12 rounded-2xl border-none outline-none text-white font-medium focus:ring-2 focus:ring-[#007AFF]" placeholder="Scan..." />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#888888] uppercase tracking-[0.2em] ml-1">Cost Price (₹)</label>
              <div className="relative">
                <IndianRupee size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#444]" />
                <input type="number" step="0.01" value={newProduct.cost_price} onChange={e => setNewProduct({...newProduct, cost_price: e.target.value})} className="w-full bg-[#0a0a0a] p-4 pl-12 rounded-2xl border-none outline-none text-white font-medium focus:ring-2 focus:ring-[#007AFF]" placeholder="0.00" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#888888] uppercase tracking-[0.2em] ml-1">Selling Price (₹) *</label>
              <div className="relative">
                <IndianRupee size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4ade80]" />
                <input required type="number" step="0.01" value={newProduct.selling_price} onChange={e => setNewProduct({...newProduct, selling_price: e.target.value})} className="w-full bg-[#0a0a0a] p-4 pl-12 rounded-2xl border-none outline-none text-[#4ade80] font-black focus:ring-2 focus:ring-[#4ade80]" placeholder="0.00" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#888888] uppercase tracking-[0.2em] ml-1 flex justify-between">
                <span>Initial Stock</span>
                <span className="text-[#FFBD2E]">Min Alert</span>
              </label>
              <div className="flex gap-3">
                <input type="number" step="0.01" value={newProduct.stock_quantity} onChange={e => setNewProduct({...newProduct, stock_quantity: e.target.value})} className="w-1/2 bg-[#0a0a0a] p-4 rounded-2xl border-none outline-none text-white font-black focus:ring-2 focus:ring-[#007AFF]" placeholder="0.00" />
                <input type="number" step="0.01" value={newProduct.min_stock} onChange={e => setNewProduct({...newProduct, min_stock: e.target.value})} className="w-1/2 bg-[#0a0a0a] p-4 rounded-2xl border-none outline-none text-[#FFBD2E] font-bold focus:ring-2 focus:ring-[#FFBD2E]" placeholder="5" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#888888] uppercase tracking-[0.2em] ml-1">HSN & Tax (%)</label>
              <div className="flex gap-3">
                <input type="text" value={newProduct.hsn_code} onChange={e => setNewProduct({...newProduct, hsn_code: e.target.value})} className="w-2/3 bg-[#0a0a0a] p-4 rounded-2xl border-none outline-none text-white font-medium focus:ring-2 focus:ring-[#007AFF] uppercase" placeholder="HSN" />
                <div className="w-1/3 relative">
                  <Percent size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#007AFF]" />
                  <input type="number" step="0.1" value={newProduct.tax_rate} onChange={e => setNewProduct({...newProduct, tax_rate: e.target.value})} className="w-full bg-[#0a0a0a] p-4 rounded-2xl border-none outline-none text-[#007AFF] font-black focus:ring-2 focus:ring-[#007AFF]" placeholder="0" />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-4">
            <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-5 bg-[#252525] hover:bg-[#333] text-[#888888] font-bold rounded-[2rem] uppercase tracking-widest text-[11px] transition-all">
              Cancel
            </button>
            <button type="submit" className="flex-[2] py-5 bg-[#007AFF] text-white font-black rounded-[2rem] uppercase tracking-widest text-[11px] shadow-glow-blue hover:bg-[#007AFF]/80 transition-all active:scale-95">
              Commit to Database
            </button>
          </div>
        </form>
      </GlassModal>

    </div>
  );
}