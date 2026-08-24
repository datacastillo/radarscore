'use client';

import { useState, useRef, useEffect } from 'react';
import { Info } from 'lucide-react';

interface InfoTooltipProps {
  text: string;
  /** Posición del tooltip respecto al ícono. Por defecto 'top'. */
  side?: 'top' | 'bottom';
  /** Tamaño del ícono. Por defecto 3.5 (w-3.5 h-3.5) */
  size?: 'sm' | 'md';
}

export default function InfoTooltip({ text, side = 'top', size = 'sm' }: InfoTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);

  // En móvil, cerrar el tooltip si se toca afuera
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  const iconSize = size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5';

  return (
    <span
      ref={containerRef}
      className="relative inline-flex items-center"
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(prev => !prev);
        }}
        className="text-slate-500 hover:text-emerald-400 transition cursor-pointer shrink-0 select-none"
        aria-label="Más información"
      >
        <Info className={iconSize} />
      </button>

      {isOpen && (
        <span
          onClick={(e) => e.stopPropagation()}
          className={`absolute z-50 ${side === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'} left-1/2 -translate-x-1/2 w-56 sm:w-64 bg-[#0c0f17] border border-emerald-500/30 rounded-xl p-3 text-[11px] text-slate-300 leading-relaxed font-normal shadow-2xl normal-case tracking-normal select-text`}
        >
          {text}
          <span
            className={`absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-[#0c0f17] border-emerald-500/30 rotate-45 ${
              side === 'top' ? '-bottom-1 border-b border-r' : '-top-1 border-t border-l'
            }`}
          />
        </span>
      )}
    </span>
  );
}