
import React from 'react';
import PageHeader from '../components/ui/PageHeader';
export default function POSBilling() {
  return (
    <div className="max-w-4xl animate-in fade-in duration-300">
      <PageHeader title="Retail POS" description="Lightning fast barcode billing. Auto-deducts inventory and automatically posts Sales Vouchers to accounting ledgers in real-time." />
      <div className="p-8 border border-brand-border rounded-md bg-brand-sidebar text-center text-brand-muted text-sm">
        POS Scanner Ready. Link to Inventory module to begin billing.
      </div>
    </div>
  );
}
