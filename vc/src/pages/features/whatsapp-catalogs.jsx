import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FeatureWhatsappCatalogs() {
  return (
    <div className='min-h-screen bg-black text-white p-24'>
      <Link to='/' className='text-[#005ea2] uppercase font-black text-xs flex items-center gap-2 mb-12'><ArrowLeft size=16/> Back</Link>
      <h1 className='text-7xl font-black uppercase tracking-tighter mb-6 italic'>WhatsApp Catalogs</h1>
      <p className='text-xl text-zinc-500 max-w-2xl'>Self-updating local e-commerce store in WhatsApp</p>
    </div>
  );
}