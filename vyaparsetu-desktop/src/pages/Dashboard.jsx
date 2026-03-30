
import React from 'react';
import { useAppStore } from '../store/useAppStore';

export default function Dashboard() {
  const openFile = useAppStore(state => state.openFile);
  return (
    <div className="max-w-4xl p-8 font-sans">
      <h1 className="text-3xl font-normal text-vscode-text mb-2">VyaparSetu Workspace</h1>
      <p className="text-vscode-textDark mb-8 text-sm">TallyPrime Desktop Engine built on Rust + Tauri + VS Code UI.</p>
      
      <div className="grid grid-cols-2 gap-10">
        <div>
          <h2 className="text-lg text-vscode-text mb-4 font-semibold">Start</h2>
          <ul className="space-y-2 text-sm">
            <li><button onClick={() => openFile('POS_Terminal.rs')} className="text-vscode-accent hover:underline">New POS Sale (F8)</button></li>
            <li><button onClick={() => openFile('Chart_Of_Accounts.json')} className="text-vscode-accent hover:underline">Create Ledger (Ctrl+L)</button></li>
            <li><button onClick={() => openFile('Inventory_Master.sql')} className="text-vscode-accent hover:underline">Add Stock Item</button></li>
          </ul>
        </div>
        <div>
          <h2 className="text-lg text-vscode-text mb-4 font-semibold">Recent Reports</h2>
          <ul className="space-y-2 text-sm">
            <li className="flex gap-2"><span className="text-vscode-type">day_book</span><span className="text-vscode-textDark">src/reports</span></li>
            <li className="flex gap-2"><span className="text-vscode-type">profit_loss</span><span className="text-vscode-textDark">src/reports</span></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
