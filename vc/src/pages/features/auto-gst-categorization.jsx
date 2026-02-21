import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FeatureAutoGstCategorization() {
  return (
    <div className='min-h-screen bg-black text-white p-24'>
      <Link to='/' className='text-[#005ea2] uppercase font-black text-xs flex items-center gap-2 mb-12'><ArrowLeft size=16/> Back</Link>
      <h1 className='text-7xl font-black uppercase tracking-tighter mb-6 italic'>Auto-GST Categorizer</h1>
      <p className='text-xl text-zinc-500 max-w-2xl'>Automatic HSN finding and tax mapping</p>
    </div>
  );
}