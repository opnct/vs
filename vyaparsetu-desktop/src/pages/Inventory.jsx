import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { createColumnHelper } from '@tanstack/react-table';
import { 
  Plus, Package, MoreHorizontal, Hash, 
  Tag, Scale, X, Loader2, IndianRupee, Percent
} from 'lucide-react';
import DataTable from '../components/DataTable';
import PermissionGate from '../components/PermissionGate';

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);

  // Strict mapping to Rust `ProductInput` DTO
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

  // 1. Fetch real data from SQLite
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

  // 2. Insert real data into SQLite via Rust
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

  // 3. Define Virtualized DataTable Columns
  const columnHelper = createColumnHelper();

  const columns = useMemo(() => [
    columnHelper.accessor('name', {
      header: 'Product Details',
      cell: info => {
        const product = info.row.original;
        const isOutOfStock = product.stock_quantity <= 0;
        return (
          <div className="flex items-center gap-5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-white/5 ${
              isOutOfStock ? 'bg-mac-red/10 text-mac-red' : 'bg-brand-dark text-[#A1A1AA]'
            }`}>
              <Package size={20} />
            </div>
            <div>
              <h4 className="font-bold text-white text-[15px] leading-tight">{product.name}</h4>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/5 text-[#666] flex items-center gap-1 uppercase">
                  <Tag size={10} /> {product.category || 'General'}
                </span>
                {product.barcode && (
                  <span className="text-[10px] font-mono text-[#444] tracking-widest uppercase flex items-center gap-1">
                    <Hash size={10} /> {product.barcode}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      }
    }),
    columnHelper.accessor('selling_price', {
      header: 'Pricing & Tax',
      cell: info => {
        const product = info.row.original;
        return (
          <div>
            <div className="text-mac-green font-black text-lg leading-none flex items-center gap-1">
              ₹{product.selling_price.toFixed(2)}
            </div>
            <div className="flex items-center gap-2 mt-1">
              {product.cost_price > 0 && (
                <span className="text-[11px] font-bold text-[#555]">Cost ₹{product.cost_price.toFixed(2)}</span>
              )}
              {product.tax_rate > 0 && (
                <span className="text-[9px] font-black text-brand-blue bg-brand-blue/10 px-1.5 py-0.5 rounded uppercase tracking-widest">
                  GST {product.tax_rate}%
                </span>
              )}
            </div>
          </div>
        );
      }
    }),
    columnHelper.accessor('stock_quantity', {
      header: 'Stock Inventory',
      cell: info => {
        const product = info.row.original;
        const stockVal = parseFloat(product.stock_quantity || 0);
        const minStock = parseFloat(product.min_stock || 0);
        const isOutOfStock = stockVal <= 0;
        const isLowStock = stockVal > 0 && stockVal <= minStock;

        return (
          <div className="w-48">
            <div className="flex items-center justify-between mb-1.5 pr-2">
              <span className={`text-[13px] font-black ${isOutOfStock ? 'text-mac-red' : 'text-white'}`}>
                {stockVal.toFixed(2)} {product.unit}
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
        );
      }
    }),
    columnHelper.display({
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: info => (
        <div className="flex justify-end gap-2">
          <PermissionGate permission="EDIT_INVENTORY" type="inline">
            <button className="p-2.5 bg-brand-dark hover:bg-white/10 text-[#A1A1AA] hover:text-white rounded-xl transition-all border border-white/5">
              <Scale size={16} />
            </button>
            <button className="p-2.5 bg-brand-dark hover:bg-white/10 text-[#A1A1AA] hover:text-white rounded-xl transition-all border border-white/5">
              <MoreHorizontal size={16} />
            </button>
          </PermissionGate>
        </div>
      )
    })
  ], []);

  return (
    <div className="flex flex-col h-full gap-6 select-none font-sans">
      
      {/* 1. Header & Controls */}
      <div className="flex items-center justify-between gap-6 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Inventory Engine</h1>
          <p className="text-[#A1A1AA] text-sm mt-1 font-medium">Manage stock, pricing, and compliance rules.</p>
        </div>
        
        <PermissionGate permission="ADD_INVENTORY" type="inline">
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold transition-all active:scale-95 shadow-xl ${
              isAdding ? 'bg-brand-dark text-white border border-white/10 hover:bg-white/5' : 'bg-brand-blue text-white shadow-brand-blue/20'
            }`}
          >
            {isAdding ? <><X size={20} /> Close Form</> : <><Plus size={20} /> Add Product</>}
          </button>
        </PermissionGate>
      </div>

      {/* 2. Add Product Form (Connected to SQLite) */}
      {isAdding && (
        <div className="bg-brand-surface p-8 rounded-[2rem] border border-white/5 shadow-2xl animate-in slide-in-from-top-4 duration-300 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-brand-blue"></div>
          <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
            <Package size={20} className="text-brand-blue" /> Master Catalog Entry
          </h3>
          
          <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-5 gap-6 items-end">
            
            {/* Row 1: Identity */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-widest ml-1">Product Name *</label>
              <input required type="text" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full bg-brand-dark p-3.5 rounded-xl border border-white/5 text-white font-bold focus:border-brand-blue transition-all outline-none" placeholder="e.g. Loose Sugar" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-widest ml-1">Category</label>
              <select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="w-full bg-brand-dark p-3.5 rounded-xl border border-white/5 text-white font-medium focus:border-brand-blue outline-none cursor-pointer">
                <option>Grocery</option>
                <option>Snacks</option>
                <option>Dairy</option>
                <option>Beverages</option>
                <option>Personal Care</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-widest ml-1">Barcode / SKU</label>
              <div className="relative">
                <Hash size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#555]" />
                <input type="text" value={newProduct.barcode} onChange={e => setNewProduct({...newProduct, barcode: e.target.value})} className="w-full bg-brand-dark p-3.5 pl-9 rounded-xl border border-white/5 text-white font-medium focus:border-brand-blue outline-none" placeholder="Scan..." />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-widest ml-1">Unit</label>
              <select value={newProduct.unit} onChange={e => setNewProduct({...newProduct, unit: e.target.value})} className="w-full bg-brand-dark p-3.5 rounded-xl border border-white/5 text-white font-medium focus:border-brand-blue outline-none cursor-pointer">
                <option value="pcs">Pieces (pcs)</option>
                <option value="kg">Kilogram (kg)</option>
                <option value="gm">Grams (gm)</option>
                <option value="ltr">Litre (L)</option>
                <option value="box">Box</option>
              </select>
            </div>

            {/* Row 2: Finance & Compliance */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-widest ml-1">Cost Price (₹)</label>
              <div className="relative">
                <IndianRupee size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#555]" />
                <input type="number" step="0.01" value={newProduct.cost_price} onChange={e => setNewProduct({...newProduct, cost_price: e.target.value})} className="w-full bg-brand-dark p-3.5 pl-9 rounded-xl border border-white/5 text-white font-medium focus:border-brand-blue outline-none" placeholder="0.00" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-widest ml-1">Selling Price (₹) *</label>
              <div className="relative">
                <IndianRupee size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mac-green" />
                <input required type="number" step="0.01" value={newProduct.selling_price} onChange={e => setNewProduct({...newProduct, selling_price: e.target.value})} className="w-full bg-brand-dark p-3.5 pl-9 rounded-xl border border-mac-green/30 text-mac-green font-black focus:border-mac-green outline-none" placeholder="0.00" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-widest ml-1 flex justify-between">
                <span>HSN Code</span>
                <span className="text-brand-blue">GST %</span>
              </label>
              <div className="flex gap-2">
                <input type="text" value={newProduct.hsn_code} onChange={e => setNewProduct({...newProduct, hsn_code: e.target.value})} className="w-2/3 bg-brand-dark p-3.5 rounded-xl border border-white/5 text-white font-medium focus:border-brand-blue outline-none uppercase" placeholder="HSN" />
                <div className="w-1/3 relative">
                  <Percent size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555]" />
                  <input type="number" step="0.1" value={newProduct.tax_rate} onChange={e => setNewProduct({...newProduct, tax_rate: e.target.value})} className="w-full bg-brand-dark p-3.5 pr-8 rounded-xl border border-white/5 text-brand-blue font-black focus:border-brand-blue outline-none" placeholder="0" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-widest ml-1 flex justify-between">
                <span>Initial Stock</span>
                <span className="text-mac-yellow">Min Alert</span>
              </label>
              <div className="flex gap-2">
                <input type="number" step="0.01" value={newProduct.stock_quantity} onChange={e => setNewProduct({...newProduct, stock_quantity: e.target.value})} className="w-1/2 bg-brand-dark p-3.5 rounded-xl border border-white/5 text-white font-black focus:border-brand-blue outline-none" placeholder="0.00" />
                <input type="number" step="0.01" value={newProduct.min_stock} onChange={e => setNewProduct({...newProduct, min_stock: e.target.value})} className="w-1/2 bg-brand-dark/50 p-3.5 rounded-xl border border-white/5 text-mac-yellow font-bold focus:border-mac-yellow outline-none" placeholder="5" />
              </div>
            </div>

            <button type="submit" className="bg-brand-blue text-white font-black py-4 rounded-xl hover:bg-brand-blue/80 transition-all uppercase tracking-widest text-[13px] shadow-xl shadow-brand-blue/20 active:scale-95">
              COMMIT
            </button>

          </form>
        </div>
      )}

      {/* 3. High-Performance Virtualized DataTable */}
      <div className="flex-1 relative h-full">
        {loading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-brand-black/50 backdrop-blur-sm rounded-[2rem]">
            <Loader2 className="animate-spin text-brand-blue" size={40} />
          </div>
        )}
        <DataTable 
          data={products} 
          columns={columns} 
          searchPlaceholder="Search products, barcode, or HSN code..." 
        />
      </div>

    </div>
  );
}