import React from 'react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { FolderSearch } from 'lucide-react';

export default function PremiumTable({ 
  data = [], 
  columns = [], 
  onRowClick 
}) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full overflow-x-auto custom-scrollbar rounded-b-[2.5rem]">
      <table className="w-full text-left border-collapse min-w-max select-none">
        
        {/* Sleek Tiny Uppercase Headers */}
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b border-[#2a2a2a] bg-[#0a0a0a]/30">
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="py-4 px-6 text-[10px] font-black text-[#888888] uppercase tracking-[0.2em] whitespace-nowrap"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        {/* Borderless Body Rows */}
        <tbody>
          {table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                onClick={() => onRowClick && onRowClick(row.original)}
                className={`group transition-colors border-b border-[#2a2a2a] last:border-0 ${
                  onRowClick 
                    ? 'cursor-pointer hover:bg-[#252525]/80' 
                    : 'hover:bg-[#1c1c1e]/50'
                }`}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="py-4 px-6 text-[14px] text-white font-medium align-middle">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="py-24">
                <div className="flex flex-col items-center justify-center text-[#333]">
                  <FolderSearch size={48} strokeWidth={1} />
                  <p className="mt-4 text-[#888888] text-[10px] font-bold uppercase tracking-widest">
                    No records found
                  </p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
        
      </table>
    </div>
  );
}