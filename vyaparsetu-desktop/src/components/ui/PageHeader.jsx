
import React from 'react';
export default function PageHeader({ title, description }) {
  return (
    <div className="mb-10 max-w-3xl">
      <h1 className="text-4xl font-bold text-brand-text tracking-tight mb-4">{title}</h1>
      {description && <p className="text-brand-text text-base leading-relaxed">{description}</p>}
      <div className="w-full h-px bg-brand-border mt-8"></div>
    </div>
  );
}
