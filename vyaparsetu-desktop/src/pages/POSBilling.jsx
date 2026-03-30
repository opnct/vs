import React, { useState, useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';

export default function POSBilling() {
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [customers, setCustomers] = useState([]);
  const [selectedCust, setSelectedCust] = useState('L1');
  const [status, setStatus] = useState('Ready for input...');
  const searchRef = useRef(null);

  // S1: Data Initialization
  useEffect(() => {
    if (typeof window !== 'undefined' && window.__TAURI_INTERNALS__) {
      invoke('exec_sql_read', { query: "SELECT * FROM inventory" })
        .then(setItems)
        .catch(e => setStatus(`ERR: ${e}`));
        
      invoke('exec_sql_read', { query: "SELECT id, name FROM ledgers WHERE group_id IN ('G3', 'G1')" })
        .then(setCustomers)
        .catch(e => console.error(e));
    } else {
      setStatus('ERR: Native engine missing. Running in standard browser.');
    }
    
    // S2: Keyboard Shortcuts
    const hk = (e) => {
      if (e.key === 'F8') handleCheckout();
      if (e.key === 'F4') setCart([]);
      if (e.key === 'F2') { e.preventDefault(); searchRef.current?.focus(); }
    };
    window.addEventListener('keydown', hk);
    return () => window.removeEventListener('keydown', hk);
  }, [cart, selectedCust]);

  const addToCart = (item) => {
    const existing = cart.find(c => c.id === item.id);
    if(existing) setCart(cart.map(c => c.id === item.id ? {...c, qty: c.qty + 1} : c));
    else setCart([...cart, {...item, qty: 1}]);
  };

  // S3: Tally Double-Entry Checkout
  const handleCheckout = async () => {
    if(cart.length === 0) return setStatus('ERR: Empty Cart.');
    if (!window.__TAURI_INTERNALS__) return setStatus('ERR: Cannot post. Native engine missing.');

    const total = cart.reduce((sum, item) => sum + (item.rate * item.qty), 0);
    try {
      setStatus('Processing Double-Entry transaction...');
      const vchId = await invoke('post_double_entry', { 
        v_type: 'Sales', 
        total, 
        dr_ledger: selectedCust, 
        cr_ledger: 'L2', 
        narration: 'POS Auto-Sale', 
        items: cart 
      });
      setStatus(`OK: Voucher ${vchId} saved. Debit: ${selectedCust}, Credit: L2.`);
      setCart([]);
    } catch (e) { 
      setStatus(`ERR: ${e}`); 
    }
  };

  const total = cart.reduce((sum, item) => sum + (item.rate * item.qty), 0);

  return (
    <div className="flex flex-col h-full gap-4">
      {/* S4: Header & Config */}
      <div>
        <h1 className="text-xl border-b border-np-border pb-2 mb-2">POS Billing / Voucher Type: Sales</h1>
        <div className="flex gap-4">
          <div className="w-1/2">
            <label className="text-np-muted block mb-1">Party A/c Name</label>
            <select value={selectedCust} onChange={e=>setSelectedCust(e.target.value)} className="w-full bg-np-actionBg border border-np-border px-2 py-1.5">
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="w-1/2">
            <label className="text-np-muted block mb-1">Sales Ledger</label>
            <input type="text" value="Local Sales (L2)" disabled className="w-full bg-np-bg border-none" />
          </div>
        </div>
      </div>

      {/* S5: Split Interface */}
      <div className="flex-1 flex gap-4 overflow-hidden">
        
        {/* Left: Inventory List */}
        <div className="w-1/2 flex flex-col border border-np-border bg-np-bg">
          <input ref={searchRef} type="text" placeholder="Search Item (F2)..." value={search} onChange={e => setSearch(e.target.value)} className="w-full p-2 border-b border-np-border bg-np-actionBg" />
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <table>
              <thead><tr><th>Code</th><th>Name</th><th>Stk</th><th>Rate</th></tr></thead>
              <tbody>
                {items.filter(i => i.name.toLowerCase().includes(search.toLowerCase())).map(item => (
                  <tr key={item.id} onClick={() => addToCart(item)} className="cursor-pointer hover:bg-np-tabHover">
                    <td className="text-np-muted">{item.item_code}</td>
                    <td>{item.name}</td>
                    <td className={item.stock < 5 ? 'text-red-400' : ''}>{item.stock}</td>
                    <td className="text-np-accent">{item.rate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Active Cart */}
        <div className="w-1/2 flex flex-col border border-np-border bg-np-bg">
          <div className="bg-np-actionBg p-2 border-b border-np-border font-bold">Item Allocation</div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
            {cart.map((c, i) => (
              <div key={c.id} className="flex justify-between border-b border-np-border/50 py-2 hover:bg-np-tabHover">
                <span>{i+1}. {c.name}</span>
                <div className="text-right">
                  <span className="text-np-muted mr-4">{c.qty} {c.unit} x {c.rate}</span>
                  <span className="text-np-accent">{(c.qty * c.rate).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-4 border-t border-np-border bg-np-actionBg">
            <div className="flex justify-between text-lg mb-4"><span>Total Amount:</span><span className="text-np-accent">{total.toFixed(2)}</span></div>
            <div className="flex gap-2">
              <button onClick={() => setCart([])} className="flex-1 border border-np-border text-np-muted py-2 bg-transparent">Clear (F4)</button>
              <button onClick={handleCheckout} className="flex-[2] bg-np-accent text-black font-bold py-2 border-none">Post Sale (F8)</button>
            </div>
            <div className="mt-2 text-xs text-np-muted">{status}</div>
          </div>
        </div>
      </div>
    </div>
  );
}