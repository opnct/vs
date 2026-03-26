import React, { useState, useEffect, useCallback } from 'react';
import { X, Delete, Divide, Minus, Plus, X as Multiply, Equal } from 'lucide-react';

export default function CalculatorModal({ isOpen, onClose }) {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');

  const handleClear = () => {
    setDisplay('0');
    setExpression('');
  };

  const handleBackspace = useCallback(() => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  }, [display]);

  const handleInput = useCallback((val) => {
    if (display === '0' && !isNaN(val)) {
      setDisplay(val);
    } else {
      setDisplay(display + val);
    }
  }, [display]);

  const handleCalculate = useCallback(() => {
    try {
      // Basic math evaluation using Function constructor for safety over eval()
      // Replaces visual symbols with JS operators
      const result = new Function(`return ${display.replace(/×/g, '*').replace(/÷/g, '/')}`)();
      setDisplay(result.toString());
    } catch (error) {
      setDisplay('Error');
      setTimeout(() => setDisplay('0'), 1500);
    }
  }, [display]);

  // Global Keyboard Listeners
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key >= '0' && e.key <= '9') handleInput(e.key);
      if (['+', '-', '.', '*', '/'].includes(e.key)) {
        const symbol = e.key === '*' ? '×' : e.key === '/' ? '÷' : e.key;
        handleInput(symbol);
      }
      if (e.key === 'Enter' || e.key === '=') handleCalculate();
      if (e.key === 'Backspace') handleBackspace();
      if (e.key === 'Escape') onClose();
      if (e.key === 'c' || e.key === 'C') handleClear();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleInput, handleCalculate, handleBackspace, onClose]);

  if (!isOpen) return null;

  const buttons = [
    { label: 'C', action: handleClear, color: 'text-mac-red bg-mac-red/10' },
    { label: '÷', action: () => handleInput('÷'), color: 'text-brand-blue bg-brand-blue/10' },
    { label: '×', action: () => handleInput('×'), color: 'text-brand-blue bg-brand-blue/10' },
    { label: '⌫', action: handleBackspace, color: 'text-mac-yellow bg-mac-yellow/10' },
    { label: '7', action: () => handleInput('7') },
    { label: '8', action: () => handleInput('8') },
    { label: '9', action: () => handleInput('9') },
    { label: '-', action: () => handleInput('-'), color: 'text-brand-blue bg-brand-blue/10' },
    { label: '4', action: () => handleInput('4') },
    { label: '5', action: () => handleInput('5') },
    { label: '6', action: () => handleInput('6') },
    { label: '+', action: () => handleInput('+'), color: 'text-brand-blue bg-brand-blue/10' },
    { label: '1', action: () => handleInput('1') },
    { label: '2', action: () => handleInput('2') },
    { label: '3', action: () => handleInput('3') },
    { label: '=', action: handleCalculate, color: 'bg-brand-blue text-white row-span-2' },
    { label: '0', action: () => handleInput('0'), color: 'col-span-2' },
    { label: '.', action: () => handleInput('.') },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-[320px] bg-brand-surface rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200">
        
        {/* Header with macOS dots */}
        <div className="p-4 flex items-center justify-between border-b border-white/5">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-mac-red"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-mac-yellow"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-mac-green"></div>
          </div>
          <button onClick={onClose} className="text-[#A1A1AA] hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Display Area */}
        <div className="p-6 bg-brand-dark flex flex-col items-end justify-center min-h-[120px]">
          <div className="text-[#666] text-sm font-bold tracking-widest uppercase mb-1">Calculator</div>
          <div className="text-white text-4xl font-black tracking-tighter truncate w-full text-right">
            {display}
          </div>
        </div>

        {/* Keypad */}
        <div className="p-4 grid grid-cols-4 gap-2 bg-brand-surface">
          {buttons.map((btn, idx) => (
            <button
              key={idx}
              onClick={btn.action}
              className={`
                ${btn.color || 'bg-white/5 text-white hover:bg-white/10'} 
                h-14 rounded-2xl flex items-center justify-center text-lg font-bold transition-all active:scale-95
                ${btn.color?.includes('row-span-2') ? 'h-[7.5rem]' : ''}
              `}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Footer Hint */}
        <div className="p-3 bg-brand-dark/50 text-center">
          <p className="text-[10px] text-[#444] font-bold uppercase tracking-widest">
            Esc to Close • Enter to Total
          </p>
        </div>
      </div>
    </div>
  );
}