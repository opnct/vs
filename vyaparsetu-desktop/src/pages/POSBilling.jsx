
import React, { useState, useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/tauri';

export default function POSBilling() {
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [customers, setCustomers] = useState([]);
  const [selectedCust, setSelectedCust] = useState('');
  const [status, setStatus] = useState('// S1: Engine Ready. Press F8 to Post.');
  const searchRef = useRef(null);

  useEffect(() => {
    // S2: Load Dependencies
    invoke('exec_sql_read', { query: "SELECT * FROM inventory" }).then(setItems).catch(e => setStatus(`// Err: ${e}`));
    invoke('exec_sql_read', { query: "SELECT id, name FROM ledgers WHERE group_id = 'G3'" }).then(setCustomers);
    
    // S3: Keyboard Shortcuts
    const handleKey = (e) => {
      if (e.key === 'F8') handleCheckout();
      if (e.key === 'F4') setCart([]);
      if (e.key === 'F2') searchRef.current?.focus();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [cart, selectedCust]);

  const addToCart = (item) => {
    const existing = cart.find(c => c.id === item.id);
    if(existing) setCart(cart.map(c => c.id === item.id ? {...c, qty: c.qty + 1} : c));
    else setCart([...cart, {...item, qty: 1}]);
  };

  const handleCheckout = async () => {
    if(cart.length === 0) return setStatus('// Error: Cart is empty');
    const total = cart.reduce((sum, item) => sum + (item.rate * item.qty), 0);
    try {
      setStatus('// Processing Double-Entry...');
      // S4: Execute Complex Transaction
      const vchId = await invoke('post_pos_sale', { total, items: cart, customerId: selectedCust || null });
      setStatus(`// Success: Voucher [${vchId}] posted. Press F4 to clear.`);
      setCart([]);
    } catch (e) { setStatus(`// Error: ${e}`); }
  };

  const total = cart.reduce((sum, item) => sum + (item.rate * item.qty), 0);

  return (
    <div className="flex h-full gap-4 pb-10">
      {/* S5: Inventory & Search Pane */}
      <div className="flex-1 flex flex-col border border-vscode-border bg-[#1e1e1e]">
        <div className="bg-[#252526] px-4 py-2 text-xs font-mono text-vscode-keyword border-b border-vscode-border">scanner_module.rs</div>
        <div className="p-4 flex-1 flex flex-col min-h-0">
          <input ref={searchRef} type="text" placeholder="Scan Barcode or Search (F2)..." value={search} onChange={e => setSearch(e.target.value)} className="w-full mb-4" />
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <table>
              <thead><tr><th>Code</th><th>Name</th><th>Stock</th><th>Rate</th></tr></thead>
              <tbody>
                {items.filter(i => i.name.toLowerCase().includes(search.toLowerCase())).map(item => (
                  <tr key={item.id} onClick={() => addToCart(item)} className="cursor-pointer hover:bg-[#2a2d2e]">
                    <td className="text-vscode-string">"{item.item_code}"</td>
                    <td className="text-vscode-text">{item.name}</td>
                    <td className="text-vscode-type">{item.stock}</td>
                    <td className="text-vscode-func">₹{item.rate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* S6: Cart & Checkout Pane */}
      <div className="w-[400px] flex flex-col border border-vscode-border bg-[#1e1e1e]">
        <div className="bg-[#252526] px-4 py-2 text-xs font-mono text-vscode-keyword border-b border-vscode-border">transaction_cart.json</div>
        
        <div className="p-4 border-b border-vscode-border">
          <select value={selectedCust} onChange={e=>setSelectedCust(e.target.value)} className="w-full">
            <option value="">Cash Customer (L1)</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="p-4 flex-1 overflow-y-auto custom-scrollbar font-mono text-sm">
          <span className="text-vscode-keyword">const</span> <span className="text-vscode-func">cart</span> = [
          {cart.map((c, i) => (
            <div key={c.id} className="pl-4">
              {'{'} <span className="text-vscode-textDark">id:</span> <span className="text-vscode-string">"{c.id}"</span>, <span className="text-vscode-textDark">qty:</span> <span className="text-vscode-type">{c.qty}</span>, <span className="text-vscode-textDark">rate:</span> <span className="text-vscode-type">{c.rate}</span> {'}'}{i < cart.length - 1 ? ',' : ''}
            </div>
          ))}
          ];
        </div>
        
        <div className="p-4 border-t border-vscode-border bg-[#252526]">
          <div className="flex justify-between font-mono text-lg mb-4 text-vscode-text"><span>Total:</span><span className="text-vscode-func">₹{total.toFixed(2)}</span></div>
          <button onClick={handleCheckout} className="w-full bg-vscode-accent text-white font-sans py-2 rounded hover:bg-blue-600 font-bold mb-2">Post Sale (F8)</button>
          <button onClick={() => setCart([])} className="w-full border border-vscode-border text-vscode-text font-sans py-1.5 rounded hover:bg-vscode-border text-xs">Clear Cart (F4)</button>
          <div className="mt-4 text-xs font-mono text-vscode-textDark break-all">{status}</div>
        </div>
      </div>
    </div>
  );
}
