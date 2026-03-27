import React, { useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Database } from 'lucide-react';

/**
 * DataTable Engine
 * A virtualized, highly-optimized table built to render thousands of rows from SQLite directly into React.
 */
export default function DataTable({ data, columns, searchPlaceholder = "Search records..." }) {
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="flex flex-col h-full w-full bg-brand-surface rounded-[2rem] border border-white/5 shadow-soft-3d overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header & Global Database Search */}
      <div className="p-5 border-b border-white/5 flex items-center justify-between bg-black/20">
        <div className="flex items-center gap-3 bg-brand-dark px-4 py-2.5 rounded-full border border-white/5 focus-within:border-brand-blue/30 transition-all w-80 group">
          <Search size={18} className="text-[#888888] group-focus-within:text-brand-blue transition-colors" />
          <input
            value={globalFilter ?? ''}
            onChange={e => setGlobalFilter(e.target.value)}
            placeholder={searchPlaceholder}
            className="bg-transparent border-none outline-none text-sm text-white placeholder-[#555] w-full font-medium"
          />
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-dark border border-white/5 text-xs font-bold text-[#A1A1AA] tracking-widest uppercase">
          <Database size={14} className="text-mac-green" />
          {table.getFilteredRowModel().rows.length} Records Found
        </div>
      </div>

      {/* Virtualized Table Container */}
      <div className="flex-1 overflow-auto custom-scrollbar relative">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-[#1A1A1A] z-10 shadow-md">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="border-b border-white/10">
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="p-5 text-xs font-black text-[#666] uppercase tracking-widest cursor-pointer hover:text-white transition-colors group select-none whitespace-nowrap bg-[#1A1A1A]"
                  >
                    <div className="flex items-center gap-2">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      <span className="text-[#333] group-hover:text-brand-blue transition-colors">
                        {{
                          asc: <ChevronUp size={14} className="text-brand-blue" />,
                          desc: <ChevronDown size={14} className="text-brand-blue" />,
                        }[header.column.getIsSorted()] ?? null}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map(row => (
                <tr key={row.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="p-5 text-sm font-medium text-white whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="p-16 text-center">
                  <div className="flex flex-col items-center justify-center text-[#555]">
                    <Database size={48} strokeWidth={1} className="mb-4 opacity-50" />
                    <p className="font-bold tracking-widest uppercase text-xs">No matching records found in the database.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Advanced Pagination Footer */}
      <div className="p-4 border-t border-white/5 flex items-center justify-between bg-black/20">
        <div className="flex items-center gap-4">
          <span className="text-xs font-medium text-[#888888] flex items-center gap-1.5">
            Page <strong className="text-white px-1.5 py-0.5 bg-white/10 rounded-md">{table.getState().pagination.pageIndex + 1}</strong> of{' '}
            <strong className="text-white">{table.getPageCount()}</strong>
          </span>
          <select
            value={table.getState().pagination.pageSize}
            onChange={e => table.setPageSize(Number(e.target.value))}
            className="bg-brand-dark border border-white/5 rounded-lg px-3 py-1.5 text-xs text-[#A1A1AA] font-bold outline-none cursor-pointer hover:border-white/20 transition-all"
          >
            {[10, 20, 50, 100].map(pageSize => (
              <option key={pageSize} value={pageSize}>Show {pageSize} rows</option>
            ))}
          </select>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="p-2.5 rounded-xl bg-white/5 text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="p-2.5 rounded-xl bg-white/5 text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      
    </div>
  );
}