'use client';

import React from 'react';
import { Trash2, Sparkles, FileText, CheckCircle2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export default function CartItem({ item }) {
  const { removeFromCart } = useCart();

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-4 shadow-xs hover:shadow-md transition-shadow flex items-start sm:items-center justify-between gap-3 sm:gap-4 relative group">
      {/* Special Unlocked Banner */}
      {item.isSpecialUnlocked && (
        <span className="absolute -top-2.5 right-4 z-10 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
          <Sparkles size={10} />
          QR Secret Unlocked
        </span>
      )}

      {/* Left: Book Cover Image & Badge */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <div className="relative w-16 sm:w-20 aspect-[3/4.2] rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0 shadow-2xs">
          <img
            src={item.coverUrl}
            alt={item.titleEn || item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <span className="absolute top-1 left-1 bg-black/80 text-white text-[8px] font-black px-1 rounded uppercase">
            PDF
          </span>
        </div>

        {/* Middle: Details */}
        <div className="space-y-1 min-w-0">
          <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight truncate">
            {item.title}
          </h3>
          {item.titleEn && item.titleEn !== item.title && (
            <p className="text-xs text-slate-500 truncate">
              {item.titleEn}
            </p>
          )}
          <p className="text-xs text-slate-600 font-medium">
            <span className="text-slate-400">by </span>
            {item.author}
          </p>

          <div className="flex items-center gap-2 pt-0.5">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
              <CheckCircle2 size={10} />
              Instant PDF Download
            </span>
            {item.pages && (
              <span className="text-[10px] text-slate-400">
                {item.pages} pages
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Price & Remove Button */}
      <div className="flex flex-col items-end justify-between self-stretch sm:self-center gap-2 flex-shrink-0">
        <div className="text-right">
          <span className="text-base sm:text-lg font-black text-slate-950 tracking-tight">
            ₹{item.price}
          </span>
          {item.originalPrice && item.originalPrice > item.price && (
            <p className="text-[11px] text-slate-400 line-through">
              ₹{item.originalPrice}
            </p>
          )}
        </div>

        <button
          onClick={() => removeFromCart(item.id)}
          className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer group/btn"
          title="Remove item"
          aria-label={`Remove ${item.title}`}
        >
          <Trash2 size={15} className="group-hover/btn:scale-110 transition-transform" />
          <span className="hidden sm:inline">Remove</span>
        </button>
      </div>
    </div>
  );
}
