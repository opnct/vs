
import React from 'react';
import PageHeader from '../components/ui/PageHeader';
export default function Vouchers() {
  return (
    <div className="max-w-4xl animate-in fade-in duration-300">
      <PageHeader title="Accounting Vouchers" description="The transactional core of your business. Press F4 for Contra, F5 for Payment, F6 for Receipt, F7 for Journal, F8 for Sales, and F9 for Purchases." />
      <div className="p-8 border border-brand-border rounded-md bg-brand-sidebar text-center text-brand-muted text-sm">
        Voucher Entry Interface Ready. Connect POS layout to post Sales Vouchers directly to this ledger engine.
      </div>
    </div>
  );
}
