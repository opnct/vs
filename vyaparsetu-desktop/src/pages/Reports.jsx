
import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core'; // TAURI v2 IMPORT

export default function Reports() {
  const [data, setData] = useState([]);
  const [cols, setCols] = useState([]);
  const [reportType, setReportType] = useState('DayBook');
  const [log, setLog] = useState('// Report Engine Online');
  
  // S1: Dynamic SQL Engine mapping
  const queries = {
    'DayBook': "SELECT v.date, v.id as voucher_no, v.v_type, l.name as ledger, ve.debit, ve.credit FROM vouchers v JOIN voucher_entries ve ON v.id = ve.voucher_id JOIN ledgers l ON ve.ledger_id = l.id ORDER BY v.date DESC",
    'TrialBalance': "SELECT l.name, g.name as grp, SUM(ve.debit) as total_dr, SUM(ve.credit) as total_cr FROM ledgers l JOIN ledger_groups g ON l.group_id = g.id LEFT JOIN voucher_entries ve ON l.id = ve.ledger_id GROUP BY l.id",
    'StockSummary': "SELECT item_code, name, stock, rate, (stock*rate) as value FROM inventory"
  };

  // S2: Data Execution
  useEffect(() => {
    setLog(`// Executing query for ${reportType}...`);
    invoke('exec_sql_read', { query: queries[reportType] })
      .then(res => {
        setData(res);
        if(res.length > 0) setCols(Object.keys(res[0]));
        else setCols([]);
        setLog(`// Success: Retrieved ${res.length} rows.`);
      })
      .catch(e => setLog(`// Error: ${e}`));
  }, [reportType]);

  // S3: Download Export Logic
  const handleExport = () => alert(`Exporting ${reportType}.csv via Tauri Filesystem API...`);

  // S4: Aggregate Summary Calculation
  const aggregateValue = data.reduce((sum, row) => sum + (row.value || row.total_dr || row.credit || 0), 0);

  return (
    <div className="h-full flex flex-col pb-10 font-mono text-sm gap-4">
      {/* S5: Top Action Bar */}
      <div className="flex justify-between p-4 border border-vscode-border bg-[#252526]">
        <div className="flex gap-4">
          {Object.keys(queries).map(k => (
            <button key={k} onClick={() => setReportType(k)} className={`px-4 py-1.5 rounded-sm font-bold ${reportType === k ? 'bg-vscode-accent text-white' : 'bg-[#1e1e1e] text-vscode-text hover:bg-[#333]'}`}>
              {k}()
            </button>
          ))}
        </div>
        <button onClick={handleExport} className="bg-[#1e1e1e] text-vscode-type px-4 py-1.5 border border-vscode-border rounded-sm hover:bg-[#333] font-bold">export_csv()</button>
      </div>

      <div className="p-3 border border-vscode-border bg-[#1e1e1e] text-vscode-keyword flex items-center">
        <span className="text-vscode-func mr-2">EXEC:</span> {queries[reportType]}
      </div>
      
      <div className="flex-1 flex flex-col border border-vscode-border bg-[#1e1e1e] overflow-hidden">
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {data.length > 0 ? (
            <table className="w-full">
              <thead><tr className="bg-[#252526] sticky top-0">{cols.map(c => <th key={c} className="text-vscode-keyword">{c}</th>)}</tr></thead>
              <tbody>
                {data.map((row, i) => (
                  <tr key={i} className="hover:bg-[#2a2d2e]">
                    {cols.map(c => <td key={c} className={typeof row[c] === 'number' ? 'text-vscode-type' : 'text-vscode-string'}>{row[c]}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-vscode-textDark p-6">// No data records found in the database.</div>
          )}
        </div>
        {/* Footer Aggregation */}
        <div className="p-3 bg-[#252526] border-t border-vscode-border flex justify-end font-bold">
          <span className="text-vscode-text mr-4">AGGREGATE SUM:</span>
          <span className="text-vscode-func">₹{aggregateValue.toFixed(2)}</span>
        </div>
      </div>
      
      <div className="p-2 border border-vscode-border bg-[#252526] text-vscode-textDark text-xs">{log}</div>
    </div>
  );
}
