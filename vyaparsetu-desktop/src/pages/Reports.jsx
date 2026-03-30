
import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';

export default function Reports() {
  const [data, setData] = useState([]);
  const [cols, setCols] = useState([]);
  const [reportType, setReportType] = useState('DayBook');
  
  // S1: Dynamic SQL Engine for Reports
  const queries = {
    'DayBook': "SELECT v.date, v.id as voucher_no, v.v_type, l.name as ledger, ve.debit, ve.credit FROM vouchers v JOIN voucher_entries ve ON v.id = ve.voucher_id JOIN ledgers l ON ve.ledger_id = l.id ORDER BY v.date DESC",
    'TrialBalance': "SELECT l.name, g.name as grp, SUM(ve.debit) as total_dr, SUM(ve.credit) as total_cr FROM ledgers l JOIN ledger_groups g ON l.group_id = g.id LEFT JOIN voucher_entries ve ON l.id = ve.ledger_id GROUP BY l.id",
    'StockSummary': "SELECT item_code, name, stock, rate, (stock*rate) as value FROM inventory"
  };

  // S2: Data Execution
  useEffect(() => {
    invoke('exec_sql_read', { query: queries[reportType] })
      .then(res => {
        setData(res);
        if(res.length > 0) setCols(Object.keys(res[0]));
        else setCols([]);
      })
      .catch(console.error);
  }, [reportType]);

  // S3: Download Export Logic (Simulated trigger)
  const handleExport = () => alert(`Exporting ${reportType}.csv...`);

  return (
    <div className="h-full flex flex-col pb-10 font-mono text-sm gap-4">
      {/* S4: Top Action Bar */}
      <div className="flex justify-between p-3 border border-vscode-border bg-[#252526]">
        <div className="flex gap-2">
          {Object.keys(queries).map(k => (
            <button key={k} onClick={() => setReportType(k)} className={`px-3 py-1 rounded ${reportType === k ? 'bg-vscode-accent text-white' : 'bg-[#1e1e1e] text-vscode-text'}`}>
              {k}
            </button>
          ))}
        </div>
        <button onClick={handleExport} className="bg-[#1e1e1e] text-vscode-type px-3 py-1 border border-vscode-border rounded hover:bg-[#333]">Export CSV</button>
      </div>

      <div className="p-2 border border-vscode-border bg-[#1e1e1e] text-vscode-keyword flex items-center">
        <span className="text-vscode-func mr-2">EXEC:</span> {queries[reportType]}
      </div>
      
      {/* S5: Dynamic Grid Renderer */}
      <div className="flex-1 p-2 border border-vscode-border bg-[#1e1e1e] overflow-y-auto custom-scrollbar">
        {data.length > 0 ? (
          <table>
            <thead><tr>{cols.map(c => <th key={c} className="text-vscode-keyword">{c}</th>)}</tr></thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} className="hover:bg-[#2a2d2e]">
                  {cols.map(c => <td key={c} className={typeof row[c] === 'number' ? 'text-vscode-type' : 'text-vscode-string'}>{row[c]}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-vscode-textDark p-4">// No data records found.</div>
        )}
      </div>
    </div>
  );
}
