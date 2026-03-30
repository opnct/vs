
import React from 'react';
import PageHeader from '../components/ui/PageHeader';
import ActionBlock from '../components/ui/ActionBlock';
import { Rocket, Keyboard, BookTemplate, PartyPopper, Tag, Palette, LayoutTemplate, XCircle, Columns, Activity } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="max-w-4xl animate-in fade-in duration-300">
      <PageHeader 
        title="Get started" 
        description={<span>VyaparSetu is a new type of retail POS and ERP that <strong>works like a doc</strong>. It makes Tally-level accounting easy, fast, and offers tons of powerful features out of the box. Just navigate the sidebar or use shortcuts to get started!</span>}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-8">
        <div>
          <h3 className="text-lg font-bold text-brand-text mb-4">Start here</h3>
          <div className="space-y-1">
            <ActionBlock title="Create a sales voucher" icon={Rocket} color="text-pink-500" to="/vouchers" />
            <ActionBlock title="Keyboard shortcuts (Tally style)" icon={Keyboard} color="text-pink-600" to="/settings" />
            <ActionBlock title="How to use and create ledgers" icon={BookTemplate} color="text-pink-700" to="/ledgers" />
            <ActionBlock title="Create Thank You POS invoices" icon={PartyPopper} color="text-pink-500" to="/pos" />
            <ActionBlock title="How to name stock items" icon={Tag} color="text-pink-600" to="/inventory" />
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-bold text-brand-text mb-4">Make it your own</h3>
          <div className="space-y-1">
            <ActionBlock title="Customize your invoice layout" icon={Palette} color="text-purple-500" to="/settings" />
            <ActionBlock title="Create a multi-godown setup" icon={LayoutTemplate} color="text-purple-600" to="/inventory" />
            <ActionBlock title="Configure GST parameters" icon={XCircle} color="text-purple-700" to="/gst" />
            <ActionBlock title="Column layout (Day Book)" icon={Columns} color="text-purple-500" to="/reports" />
            <ActionBlock title="Progress bar (Sales Goal)" icon={Activity} color="text-purple-600" to="/reports" />
          </div>
        </div>
      </div>
    </div>
  );
}
