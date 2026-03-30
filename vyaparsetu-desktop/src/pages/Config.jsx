
import React from 'react';
export default function Config() {
  return (
    <div className="flex flex-col h-full gap-6 max-w-2xl">
      <h1 className="text-xl border-b border-np-border pb-2">System Configuration (F12)</h1>
      <div className="space-y-4">
        <div>
          <label className="text-np-muted block">Company Name</label>
          <input type="text" defaultValue="VyaparSetu Retail" className="w-full" />
        </div>
        <div>
          <label className="text-np-muted block">Financial Year From</label>
          <input type="date" defaultValue="2024-04-01" className="w-full" />
        </div>
        <div>
          <label className="text-np-muted block">Enable GST Features</label>
          <select className="w-full"><option>Yes</option><option>No</option></select>
        </div>
        <button className="bg-np-accent text-black font-bold px-6">Save Settings</button>
      </div>
    </div>
  );
}
