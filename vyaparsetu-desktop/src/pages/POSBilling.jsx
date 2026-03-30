
import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';

export default function POSBilling() {
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('// Status: Ready (F8 to Checkout)');

  useEffect(() => {
    invoke('get_inventory').then(setItems).catch(e => setStatus(`// Error: ${e}`));
    
    const handleKey = (e) => {
      if (e.key === 'F8') handleCheckout();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [cart]); // Dependency on cart to ensure checkout gets latest data

  const addToCart = (item) => {
    const existing = cart.find(c => c.id === item.id);
    if(existing) setCart(cart.map(c => c.id === item.id ? {...c, qty: c.qty + 1} : c));
    else setCart([...cart, {...item, qty: 1}]);
  };

  const handleCheckout = async () => {
    if(cart.length === 0) return setStatus('// Error: Cart is empty');
    const total = cart.reduce((sum, item) => sum + (item.rate * item.qty), 0);
    try {
      setStatus('// Processing double-entry transaction...');
      const vchId = await invoke('post_pos_sale', { total, items: cart });
      setStatus(`// Success: Voucher [${vchId}] posted to DB. Cash debited, Sales credited.`);
      setCart([]);
    } catch (e) {
      setStatus(`// Error: ${e}`);
    }
  };

  const total = cart.reduce((sum, item) => sum + (item.rate * item.qty), 0);

  return (
    <div className="flex h-full gap-4 pb-10">
      <div className="flex-1 flex flex-col border border-vscode-border bg-[#1e1e1e]">
        <div className="bg-[#252526] px-4 py-2 text-xs font-mono text-vscode-keyword border-b border-vscode-border">pos_scanner.rs</div>
        <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
          <input type="text" placeholder="Scan Barcode or Search Item..." value={search} onChange={e => setSearch(e.target.value)} className="w-full mb-4" autoFocus />
          <table className="w-full">
            <thead><tr><th>Code</th><th>Item Name</th><th>Stock</th><th>Rate</th></tr></thead>
            <tbody>
              {items.filter(i => i.name.toLowerCase().includes(search.toLowerCase())).map(item => (
                <tr key={item.id} onClick={() => addToCart(item)} className="cursor-pointer hover:bg-[#2a2d2e]">
                  <td className="text-vscode-string">"{item.code}"</td>
                  <td className="text-vscode-text">{item.name}</td>
                  <td className="text-vscode-type">{item.stock}</td>
                  <td className="text-vscode-func">₹{item.rate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="w-[400px] flex flex-col border border-vscode-border bg-[#1e1e1e]">
        <div className="bg-[#252526] px-4 py-2 text-xs font-mono text-vscode-keyword border-b border-vscode-border">active_cart.json</div>
        <div className="p-4 flex-1 overflow-y-auto custom-scrollbar font-mono text-sm">
          <span className="text-vscode-keyword">const</span> <span className="text-vscode-func">cart</span> = [
          {cart.map((c, i) => (
            <div key={c.id} className="pl-4">
              {'{'} <span className="text-vscode-textDark">id:</span> <span className="text-vscode-string">"{c.id}"</span>, <span className="text-vscode-textDark">name:</span> <span className="text-vscode-string">"{c.name}"</span>, <span className="text-vscode-textDark">qty:</span> <span className="text-vscode-type">{c.qty}</span>, <span className="text-vscode-textDark">rate:</span> <span className="text-vscode-type">{c.rate}</span> {'}'}{i < cart.length - 1 ? ',' : ''}
            </div>
          ))}
          ];
        </div>
        <div className="p-4 border-t border-vscode-border bg-[#252526]">
          <div className="flex justify-between font-mono text-lg mb-4 text-vscode-text"><span>Total:</span><span className="text-vscode-func">₹{total.toFixed(2)}</span></div>
          <button onClick={handleCheckout} className="w-full bg-vscode-accent text-white font-sans py-2 rounded-sm hover:bg-blue-600 focus:outline-none">Post Sale (F8)</button>
          <div className="mt-2 text-xs font-mono text-vscode-textDark">{status}</div>
        </div>
      </div>
    </div>
  );
}
