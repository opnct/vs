import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { 
  Plus, Trash2, Save, ShoppingBag, 
  Truck, Hash, Calendar, FileText,
  Percent, Calculator, Search, ChevronRight
} from 'lucide-react';

export default function Purchases() {
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Bill Header State
  const [billDetails, setBillDetails] = useState({
    supplierId: '',
    billNumber: '',
    billDate: new Date().toISOString().split('T')[0],
    paymentStatus: 'PAID'
  });

  // Bill Items State (Individual rows)
  const [purchaseItems, setPurchaseItems] = useState([]);

  // Load actual data from local SQLite
  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        // Note: These invoke calls assume you have implemented these queries in main.rs
        // If not yet present, the UI will wait for them.
        const supplierList = await invoke('get_all_suppliers').catch(() => []);
        const productList = await invoke('get_all_products').catch(() => []);
        setSuppliers(supplierList);
        setProducts(productList);
      } catch (error) {
        console.error("Initialization error:", error);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  const addNewRow = () => {
    setPurchaseItems([...purchaseItems, {
      productId: '',
      name: '',
      qty: 0,
      purchasePrice: 0,
      mrp: 0,
      taxPercent: 5,
      taxAmount: 0,
      total: 0
    }]);
  };

  const updateItem = (index, field, value) => {
    const updated = [...purchaseItems];
    const item = { ...updated[index], [field]: value };
    
    // Auto-calculate totals for the row
    if (field === 'qty' || field === 'purchasePrice' || field === 'taxPercent') {
      const taxable = item.qty * item.purchasePrice;
      item.taxAmount = taxable * (item.taxPercent / 100);
      item.total = taxable + item.taxAmount;
    }
    
    updated[index] = item;
    setPurchaseItems(updated);
  };

  const removeItem = (index) => {
    setPurchaseItems(purchaseItems.filter((_, i) => i !== index));
  };

  const totals = purchaseItems.reduce((acc, item) => {
    acc.taxable += item.qty * item.purchasePrice;
    acc.gst += item.taxAmount;
    acc.total += item.total;
    return acc;
  }, { taxable: 0, gst: 0, total: 0 });

  const handleSavePurchase = async () => {
    if (!billDetails.supplierId || purchaseItems.length === 0) return;

    try {
      // 1. Log the Purchase Bill
      await invoke('add_purchase_record', {
        supplierId: parseInt(billDetails.supplierId),
        billNumber: billDetails.billNumber,
        totalAmount: totals.total,
        paidAmount: billDetails.paymentStatus === 'PAID' ? totals.total : 0,
        paymentStatus: billDetails.paymentStatus,
        items: purchaseItems.map(item => ({
          productId: parseInt(item.productId),
          qty: parseFloat(item.qty),
          purchasePrice: parseFloat(item.purchasePrice),
          mrp: parseFloat(item.mrp),
          taxAmount: item.taxAmount
        }))
      });

      // 2. Clear UI
      setPurchaseItems([]);
      setBillDetails({ ...billDetails, billNumber: '' });
      alert("Stock Updated & Purchase Recorded Successfully");
    } catch (error) {
      console.error("Purchase save failed:", error);
    }
  };

  return (
    <div className="flex flex-col h-full gap-6 select-none font-sans overflow-hidden">
      
      {/* HEADER: Bill Info Section */}
      <div className="bg-brand-surface p-8 rounded-[2.5rem] border border-white/5 shadow-2xl shrink-0">
        <h2 className="text-white font-bold text-xl mb-6 flex items-center gap-2">
          <ShoppingBag className="text-brand-blue" /> Stock In (Purchase Bill)
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-widest ml-1">Supplier *</label>
            <div className="relative">
              <Truck className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444]" size={16} />
              <select 
                value={billDetails.supplierId}
                onChange={e => setBillDetails({...billDetails, supplierId: e.target.value})}
                className="w-full bg-brand-dark p-3 pl-10 rounded-xl border border-white/5 text-white font-medium focus:border-brand-blue"
              >
                <option value="">Select Supplier</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-widest ml-1">Bill Number</label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444]" size={16} />
              <input 
                type="text" 
                value={billDetails.billNumber}
                onChange={e => setBillDetails({...billDetails, billNumber: e.target.value})}
                className="w-full bg-brand-dark p-3 pl-10 rounded-xl border border-white/5 text-white font-medium focus:border-brand-blue"
                placeholder="e.g. INV-2024-001"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-widest ml-1">Bill Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444]" size={16} />
              <input 
                type="date" 
                value={billDetails.billDate}
                onChange={e => setBillDetails({...billDetails, billDate: e.target.value})}
                className="w-full bg-brand-dark p-3 pl-10 rounded-xl border border-white/5 text-white font-medium focus:border-brand-blue"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-widest ml-1">Payment</label>
            <select 
              value={billDetails.paymentStatus}
              onChange={e => setBillDetails({...billDetails, paymentStatus: e.target.value})}
              className="w-full bg-brand-dark p-3 rounded-xl border border-white/5 text-white font-medium focus:border-brand-blue"
            >
              <option value="PAID">Full Payment</option>
              <option value="UNPAID">Credit (Udhaar)</option>
              <option value="PARTIAL">Partial Payment</option>
            </select>
          </div>
        </div>
      </div>

      {/* BODY: Itemized Bill Entry */}
      <div className="flex-1 bg-brand-surface rounded-[2.5rem] border border-white/5 flex flex-col overflow-hidden shadow-2xl">
        <div className="grid grid-cols-12 gap-4 px-8 py-4 bg-brand-dark/30 border-b border-white/5 text-[11px] font-black text-[#666] uppercase tracking-[0.2em]">
          <div className="col-span-4">Item Details</div>
          <div className="col-span-1">Qty</div>
          <div className="col-span-2">Pur. Price</div>
          <div className="col-span-2">MRP</div>
          <div className="col-span-1">GST %</div>
          <div className="col-span-2 text-right">Net Total</div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {purchaseItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-[#333]">
              <FileText size={64} strokeWidth={1} />
              <p className="mt-4 font-bold tracking-widest uppercase text-xs">No items added to bill</p>
            </div>
          ) : (
            purchaseItems.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-4 px-4 py-3 items-center bg-brand-dark/20 rounded-2xl border border-white/5 animate-in slide-in-from-left-4 duration-200">
                <div className="col-span-4 relative">
                  <select 
                    value={item.productId}
                    onChange={e => {
                      const p = products.find(prod => prod.id.toString() === e.target.value);
                      updateItem(index, 'productId', e.target.value);
                      if (p) {
                        updateItem(index, 'name', p.name);
                        updateItem(index, 'purchasePrice', p.purchase_price || 0);
                        updateItem(index, 'mrp', p.selling_price || 0);
                      }
                    }}
                    className="w-full bg-brand-dark p-2.5 rounded-xl border border-white/5 text-white font-bold text-sm focus:border-brand-blue outline-none"
                  >
                    <option value="">Select Product...</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                
                <div className="col-span-1">
                  <input type="number" value={item.qty || ''} onChange={e => updateItem(index, 'qty', parseFloat(e.target.value))} className="w-full bg-brand-dark p-2.5 rounded-xl border border-white/5 text-white text-center font-bold" placeholder="0" />
                </div>

                <div className="col-span-2">
                  <input type="number" value={item.purchasePrice || ''} onChange={e => updateItem(index, 'purchasePrice', parseFloat(e.target.value))} className="w-full bg-brand-dark p-2.5 rounded-xl border border-white/5 text-mac-green text-center font-bold" placeholder="0.00" />
                </div>

                <div className="col-span-2">
                  <input type="number" value={item.mrp || ''} onChange={e => updateItem(index, 'mrp', parseFloat(e.target.value))} className="w-full bg-brand-dark p-2.5 rounded-xl border border-white/5 text-white text-center font-bold" placeholder="0.00" />
                </div>

                <div className="col-span-1">
                  <input type="number" value={item.taxPercent || ''} onChange={e => updateItem(index, 'taxPercent', parseFloat(e.target.value))} className="w-full bg-brand-dark p-2.5 rounded-xl border border-white/5 text-mac-yellow text-center font-bold" placeholder="5" />
                </div>

                <div className="col-span-2 flex items-center justify-end gap-3">
                  <span className="text-white font-black text-sm">₹{item.total.toFixed(2)}</span>
                  <button onClick={() => removeItem(index)} className="p-2 text-mac-red hover:bg-mac-red/10 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* FOOTER: Summary & Save */}
        <div className="p-8 bg-brand-dark/40 border-t border-white/5 flex items-center justify-between shrink-0">
          <div className="flex gap-10">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-[#666] uppercase tracking-widest mb-1">Taxable Value</span>
              <span className="text-white font-bold">₹{totals.taxable.toFixed(2)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-mac-yellow uppercase tracking-widest mb-1">GST Input (Total)</span>
              <span className="text-mac-yellow font-bold">+ ₹{totals.gst.toFixed(2)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-white uppercase tracking-widest mb-1">Bill Amount</span>
              <span className="text-2xl font-black text-white tracking-tighter leading-none">₹{totals.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={addNewRow}
              className="px-6 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold flex items-center gap-2 transition-all"
            >
              <Plus size={20} /> Add Item
            </button>
            <button 
              onClick={handleSavePurchase}
              disabled={purchaseItems.length === 0}
              className={`px-10 py-4 rounded-2xl font-black tracking-widest flex items-center gap-2 transition-all shadow-xl ${
                purchaseItems.length === 0 
                ? 'bg-white/5 text-white/20 cursor-not-allowed' 
                : 'bg-brand-blue text-white hover:bg-brand-blue/80 shadow-brand-blue/20'
              }`}
            >
              <Save size={20} /> SAVE BILL & STOCK
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}