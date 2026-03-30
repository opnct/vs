
import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';

export default function Reports() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    // Simulated fetch of complex join query for Day Book
    invoke('get_ledgers').then(res => setData(JSON.stringify(res, null, 2)));
  }, []);

  return (
    <div className="h-full flex flex-col pb-10 font-mono text-sm">
      <div className="p-2 border border-vscode-border bg-[#252526] text-vscode-keyword">SELECT * FROM financial_reports WHERE date = 'today';</div>
      <div className="flex-1 p-4 border border-t-0 border-vscode-border bg-[#1e1e1e] overflow-y-auto custom-scrollbar text-vscode-string whitespace-pre">
        {data || '// Compiling report data...'}
      </div>
    </div>
  );
}
