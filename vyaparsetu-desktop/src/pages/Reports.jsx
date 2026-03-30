
import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core'; 

export default function Reports() {
  const [data, setData] = useState([]);
  const [cols, setCols] = useState([]);
  const [reportType, setReportType] = useState('DayBook');
  
  // S1: Advanced SQL Tally Reports
  const queries = {
    'DayBook': "SELECT v.date as Date, v.id as Vch_No, v.v_type as Type, l.name as Particulars, ve.debit as Debit, ve.credit as Credit, v.narration FROM vouchers v JOIN voucher_entries ve ON v.id = ve.voucher_id JOIN ledgers l ON ve.ledger_id = l.id ORDER BY v.date DESC",
    'TrialBalance': "SELECT l.name as Particulars, g.name as Group_Name, SUM(ve.debit) as Debit_Total, SUM(ve.credit) as Credit_Total FROM ledgers l JOIN ledger_groups g ON l.group_id = g.id LEFT JOIN voucher_entries ve ON l.id = ve.ledger_id GROUP BY l.id",
    'StockSummary': "SELECT item_code as Code, name as Particulars, stock as Closing_Bal, rate as Rate, (stock*rate) as Value FROM inventory"
  };

  // S2: Data Execution
  useEffect(() => {
    invoke('exec_sql_read', { query: queries[reportType] })
      .then(res => {
        setData(res);
        if(res.length > 0) setCols(Object.keys(res[0]));
        else setCols([]);
      }).catch(console.error);
  }, [reportType]);

  // S3: CSV Export
  const handleExport = () => alert(`Exporting ${reportType}.csv...`);

  // S4: Aggregate Engine
  const getTotals = () => {
    if(reportType === 'TrialBalance') {
      const dr = data.reduce((s, r) => s + (r.Debit_Total||0), 0);
      const cr = data.reduce((s, r) => s + (r.Credit_Total||0), 0);
      return `Total Dr: ${dr.toFixed(2)} | Total Cr: ${cr.toFixed(2)}`;
    }
    if(reportType === 'StockSummary') {
      const val = data.reduce((s, r) => s + (r.Value||0), 0);
      return `Total Stock Value: ${val.toFixed(2)}`;
    }
    return `Total Rows: ${data.length}`;
  };

  return (
    <div className="h-full flex flex-col gap-4">
      <h1 className="text-xl border-b border-np-border pb-2">Display More Reports</h1>
      
      {/* S5: Action Bar */}
      <div className="flex gap-4 border-b border-np-border pb-2">
        {Object.keys(queries).map(k => (
          <button key={k} onClick={() => setReportType(k)} className={`border-none ${reportType === k ? 'bg-np-accent text-black font-bold' : 'bg-transparent text-np-text'}`}>
            {k}
          </button>
        ))}
        <button onClick={handleExport} className="ml-auto bg-np-bg">Export CSV</button>
      </div>
      
      {/* S6: Data View */}
      <div className="flex-1 flex flex-col border border-np-border overflow-hidden bg-np-bg">
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {data.length > 0 ? (
            <table>
              <thead><tr className="bg-np-actionBg">{cols.map(c => <th key={c}>{c}</th>)}</tr></thead>
              <tbody>
                {data.map((row, i) => (
                  <tr key={i} className="hover:bg-np-tabHover">
                    {cols.map(c => <td key={c} className={typeof row[c] === 'number' ? 'text-np-accent' : ''}>{row[c]}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-6 text-np-muted">No data records found.</div>
          )}
        </div>
        
        {/* Footer Aggregation */}
        <div className="p-2 bg-np-actionBg border-t border-np-border flex justify-end font-bold text-np-accent">
          {getTotals()}
        </div>
      </div>
    </div>
  );
}
