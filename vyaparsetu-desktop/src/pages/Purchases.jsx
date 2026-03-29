import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, Trash2, Save, ShoppingBag, 
  Truck, Hash, Calendar, FileText,
  Loader2, Search, ChevronRight, Package
} from 'lucide-react';

export default function Purchases() {
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Bill Header State
  const [billDetails, setBillDetails] = useState({
    supplierId: '',
    billNumber: '',
    billDate: new Date().toISOString().split('T')[0],
    paymentStatus: 'PAID'
  });

  // Bill Items State
  const [purchaseItems, setPurchaseItems] = useState([]);

  // 1. Fetch real Suppliers and Products from SQLite via Electron IPC
  const initData = useCallback(async () => {
    try {
      setLoading(true);
      if (window.electronAPI) {
        const [supplierList, productList] = await Promise.all([
          window.electronAPI.invoke('get_all_suppliers'),
          window.electronAPI.invoke('get_all_products')
        ]);
        setSuppliers(supplierList || []);
        setProducts(productList || []);
      }
    } catch (error) {
      console.error("Purchases Initialization error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initData();
  }, [initData]);

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
    
    // Auto-calculate row financials
    if (field === 'qty' || field === 'purchasePrice' || field === 'taxPercent') {
      const taxable = (item.qty || 0) * (item.purchasePrice || 0);
      item.taxAmount = taxable * ((item.taxPercent || 0) / 100);
      item.total = taxable + item.taxAmount;
    }
    
    updated[index] = item;
    setPurchaseItems(updated);
  };

  const removeItem = (index) => {
    setPurchaseItems(purchaseItems.filter((_, i) => i !== index));
  };

  const totals = purchaseItems.reduce((acc, item) => {
    acc.taxable += (item.qty * item.purchasePrice);
    acc.gst += item.taxAmount;
    acc.total += item.total;
    return acc;
  }, { taxable: 0, gst: 0, total: 0 });

  // 2. Save Purchase Bill & Update Inventory Stock via Electron IPC
  const handleSavePurchase = async () => {
    if (!billDetails.supplierId || purchaseItems.length === 0) return;
    setIsSaving(true);

    try {
      if (window.electronAPI) {
        await window.electronAPI.invoke('add_purchase_record', {
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
      }

      // Clear UI and notify
      setPurchaseItems([]);
      setBillDetails({ ...billDetails, billNumber: '' });
      // Refresh inventory if needed (though local state is cleared)
      await initData();
    } catch (error) {
      console.error("Purchase save failed:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-6 select-none font-sans overflow-hidden">
      
      {/* HEADER: Bill Context */}
      <div className="bg-[#1c1c1e] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl shrink-0 relative overflow-hidden">
        {loading && (
          <div className="absolute inset-0 bg-[#1c1c1e]/60 backdrop-blur-sm z-20 flex items-center justify-center">
            <Loader2 className="animate-spin text-[#007AFF]" size={32} />
          </div>
        )}
        
        <h2 className="text-white font-bold text-xl mb-6 flex items-center gap-2">
          <ShoppingBag className="text-[#007AFF]" /> Stock In Management
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[#888888] uppercase tracking-widest ml-1">Distributor / Supplier *</label>
            <div className="relative">
              <Truck className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444]" size={16} />
              <select 
                value={billDetails.supplierId}
                onChange={e => setBillDetails({...billDetails, supplierId: e.target.value})}
                className="w-full bg-[#0a0a0a] p-3 pl-10 rounded-xl border border-white/5 text-white font-bold focus:border-[#007AFF] outline-none cursor-pointer"
              >
                <option value="">Choose Supplier...</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[#888888] uppercase tracking-widest ml-1">Invoice / Bill Number</label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444]" size={16} />
              <input 
                type="text" 
                value={billDetails.billNumber}
                onChange={e => setBillDetails({...billDetails, billNumber: e.target.value})}
                className="w-full bg-[#0a0a0a] p-3 pl-10 rounded-xl border border-white/5 text-white font-medium focus:border-[#007AFF] outline-none"
                placeholder="Bill ID"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[#888888] uppercase tracking-widest ml-1">Entry Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444]" size={16} />
              <input 
                type="date" 
                value={billDetails.billDate}
                onChange={e => setBillDetails({...billDetails, billDate: e.target.value})}
                className="w-full bg-[#0a0a0a] p-3 pl-10 rounded-xl border border-white/5 text-white font-bold focus:border-[#007AFF] outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[#888888] uppercase tracking-widest ml-1">Payment Status</label>
            <select 
              value={billDetails.paymentStatus}
              onChange={e => setBillDetails({...billDetails, paymentStatus: e.target.value})}
              className="w-full bg-[#0a0a0a] p-3 rounded-xl border border-white/5 text-white font-bold focus:border-[#007AFF] outline-none cursor-pointer"
            >
              <option value="PAID">Full Payment</option>
              <option value="UNPAID">Credit (Pending)</option>
              <option value="PARTIAL">Partial Payment</option>
            </select>
          </div>
        </div>
      </div>

      {/* BODY: Line Items Table */}
      <div className="flex-1 bg-[#1c1c1e] rounded-[2.5rem] border border-white/5 flex flex-col overflow-hidden shadow-2xl relative">
        
        <div className="grid grid-cols-12 gap-4 px-8 py-4 bg-[#0a0a0a]/30 border-b border-white/5 text-[10px] font-black text-[#555] uppercase tracking-[0.2em]">
          <div className="col-span-4">Item Details</div>
          <div className="col-span-1 text-center">Qty</div>
          <div className="col-span-2 text-center">Cost Price</div>
          <div className="col-span-2 text-center">Target MRP</div>
          <div className="col-span-1 text-center">GST %</div>
          <div className="col-span-2 text-right">Net Total</div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {purchaseItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-[#222]">
              <Package size={64} strokeWidth={1} />
              <p className="mt-4 font-bold tracking-widest uppercase text-xs">Add products to this purchase bill</p>
            </div>
          ) : (
            purchaseItems.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-4 px-4 py-2 items-center bg-[#0a0a0a]/20 rounded-2xl border border-white/5 transition-all group">
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
                    className="w-full bg-[#0a0a0a] p-3 rounded-xl border border-white/5 text-white font-bold text-sm focus:border-[#007AFF] outline-none"
                  >
                    <option value="">Select Item...</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                
                <div className="col-span-1">
                  <input type="number" value={item.qty || ''} onChange={e => updateItem(index, 'qty', parseFloat(e.target.value))} className="w-full bg-[#0a0a0a] p-3 rounded-xl border border-white/5 text-white text-center font-black" placeholder="0" />
                </div>

                <div className="col-span-2">
                  <input type="number" step="0.01" value={item.purchasePrice || ''} onChange={e => updateItem(index, 'purchasePrice', parseFloat(e.target.value))} className="w-full bg-[#0a0a0a] p-3 rounded-xl border border-white/5 text-[#4ade80] text-center font-black" placeholder="0.00" />
                </div>

                <div className="col-span-2">
                  <input type="number" step="0.01" value={item.mrp || ''} onChange={e => updateItem(index, 'mrp', parseFloat(e.target.value))} className="w-full bg-[#0a0a0a] p-3 rounded-xl border border-white/5 text-white text-center font-black" placeholder="0.00" />
                </div>

                <div className="col-span-1">
                  <input type="number" value={item.taxPercent || ''} onChange={e => updateItem(index, 'taxPercent', parseFloat(e.target.value))} className="w-full bg-[#0a0a0a] p-3 rounded-xl border border-white/5 text-[#F5A623] text-center font-black" placeholder="5" />
                </div>

                <div className="col-span-2 flex items-center justify-end gap-3">
                  <span className="text-white font-black text-sm">₹{item.total.toFixed(2)}</span>
                  <button onClick={() => removeItem(index)} className="p-2 text-[#333] hover:text-[#f87171] transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* FOOTER: Live Bill Totals */}
        <div className="p-8 bg-[#0a0a0a]/40 border-t border-white/5 flex items-center justify-between shrink-0">
          <div className="flex gap-12">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-[#444] uppercase tracking-widest mb-1">Taxable Value</span>
              <span className="text-white font-bold">₹{totals.taxable.toFixed(2)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-[#F5A623]/80 uppercase tracking-widest mb-1">Input GST Credit</span>
              <span className="text-[#F5A623] font-bold">+ ₹{totals.gst.toFixed(2)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-white uppercase tracking-widest mb-1">Final Purchase Cost</span>
              <span className="text-3xl font-black text-white tracking-tighter leading-none">₹{totals.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={addNewRow}
              className="px-6 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold flex items-center gap-2 transition-all active:scale-95"
            >
              <Plus size={20} /> Add Item
            </button>
            <button 
              onClick={handleSavePurchase}
              disabled={purchaseItems.length === 0 || isSaving}
              className={`px-10 py-4 rounded-2xl font-black tracking-widest flex items-center gap-2 transition-all shadow-xl active:scale-95 ${
                purchaseItems.length === 0 || isSaving
                ? 'bg-white/5 text-white/20 cursor-not-allowed' 
                : 'bg-[#007AFF] text-white hover:bg-[#007AFF]/80 shadow-[0_0_20px_rgba(0,122,255,0.4)]'
              }`}
            >
              {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              {isSaving ? 'UPDATING STOCK...' : 'SAVE & UPDATE STOCK'}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}