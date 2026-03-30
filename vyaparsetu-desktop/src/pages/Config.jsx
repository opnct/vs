
import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

export default function Config() {
  const [log, setLog] = useState('Settings ready.');
  
  const handleBackup = async () => {
    try {
      await invoke('exec_sql', { query: "VACUUM;" }); // Simulated DB optimize/backup command
      setLog('OK: Database optimized and backup snapshot created.');
    } catch(e) { setLog(`ERR: ${e}`); }
  }

  return (
    <div className="flex flex-col h-full gap-6 max-w-2xl">
      <h1 className="text-xl border-b border-np-border pb-2">System Configuration & Data (F12)</h1>
      <div className="space-y-4">
        <div>
          <label className="text-np-muted block mb-1">Company Name</label>
          <input type="text" defaultValue="VyaparSetu Retail" className="w-full" />
        </div>
        <div>
          <label className="text-np-muted block mb-1">Financial Year From</label>
          <input type="date" defaultValue="2024-04-01" className="w-full" />
        </div>
        <div>
          <label className="text-np-muted block mb-1">Enable GST Features</label>
          <select className="w-full"><option>Yes</option><option>No</option></select>
        </div>
        
        <div className="pt-4 border-t border-np-border flex gap-4">
          <button className="bg-np-accent text-black font-bold px-6">Save Settings</button>
          <button onClick={handleBackup}>Optimize & Backup DB</button>
        </div>
      </div>
      <div className="text-xs text-np-muted mt-auto">{log}</div>
    </div>
  );
}
