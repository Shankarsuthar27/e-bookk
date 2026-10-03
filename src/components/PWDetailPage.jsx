import React, { useEffect, useState } from 'react';
import {
  ArrowLeft, ShoppingCart, Check, Star, Zap, Atom,
  BookOpen, Video, FileText, GraduationCap, Sparkles, Package
} from 'lucide-react';

// ─── Batch product definitions ────────────────────────────────────────────────
export const PW_BATCHES = [
  // ── CLASS 11 ──
  {
    id: 'pw-arjuna-10-neet-batch',
    title: 'ARJUNA 1.0 NEET BATCH',
    shortTitle: 'Arjuna 1.0 NEET',
    class: 11, batchName: 'ARJUNA', version: '1.0', type: 'NEET', price: 99,
    coverImage: '/p1.png',
    description: 'Complete NEET preparation for Class 11 — Physics, Chemistry & Biology lectures + PDF notes.',
  },
  {
    id: 'pw-arjuna-20-neet-batch',
    title: 'ARJUNA 2.0 NEET BATCH',
    shortTitle: 'Arjuna 2.0 NEET',
    class: 11, batchName: 'ARJUNA', version: '2.0', type: 'NEET', price: 99,
    coverImage: '/p1.png',
    description: 'Upgraded NEET batch with enhanced lecture series and comprehensive study material for Class 11.',
  },
  {
    id: 'pw-arjuna-10-jee-batch',
    title: 'ARJUNA 1.0 JEE BATCH',
    shortTitle: 'Arjuna 1.0 JEE',
    class: 11, batchName: 'ARJUNA', version: '1.0', type: 'JEE', price: 99,
    coverImage: '/p1.png',
    description: 'Full JEE Mains & Advanced preparation for Class 11 — lectures + detailed PDF notes.',
  },
  {
    id: 'pw-arjuna-20-jee-batch',
    title: 'ARJUNA 2.0 JEE BATCH',
    shortTitle: 'Arjuna 2.0 JEE',
    class: 11, batchName: 'ARJUNA', version: '2.0', type: 'JEE', price: 99,
    coverImage: '/p1.png',
    description: 'Upgraded JEE batch with advanced problem-solving sessions and revision PDFs for Class 11.',
  },
  // ── CLASS 12 ──
  {
    id: 'pw-lakshya-10-jee-batch',
    title: 'LAKSHYA 1.0 JEE BATCH',
    shortTitle: 'Lakshya 1.0 JEE',
    class: 12, batchName: 'LAKSHYA', version: '1.0', type: 'JEE', price: 99,
    coverImage: '/p1.png',
    description: 'Comprehensive JEE Mains & Advanced batch for Class 12 — lectures + PDF notes.',
  },
  {
    id: 'pw-lakshya-20-jee-batch',
    title: 'LAKSHYA 2.0 JEE BATCH',
    shortTitle: 'Lakshya 2.0 JEE',
    class: 12, batchName: 'LAKSHYA', version: '2.0', type: 'JEE', price: 99,
    coverImage: '/p1.png',
    description: 'Enhanced JEE batch with updated syllabus coverage and deep-dive revision sessions for Class 12.',
  },
  {
    id: 'pw-lakshya-10-neet-batch',
    title: 'LAKSHYA 1.0 NEET BATCH',
    shortTitle: 'Lakshya 1.0 NEET',
    class: 12, batchName: 'LAKSHYA', version: '1.0', type: 'NEET', price: 99,
    coverImage: '/p1.png',
    description: 'Full NEET batch for Class 12 — Biology, Chemistry & Physics lectures with downloadable notes.',
  },
  {
    id: 'pw-lakshya-20-neet-batch',
    title: 'LAKSHYA 2.0 NEET BATCH',
    shortTitle: 'Lakshya 2.0 NEET',
    class: 12, batchName: 'LAKSHYA', version: '2.0', type: 'NEET', price: 99,
    coverImage: '/p1.png',
    description: 'Upgraded NEET batch with advanced topic coverage and high-yield PDF revision notes for Class 12.',
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────
const BatchCard = ({ batch, onAddToCart, cartIds }) => {
  const inCart = cartIds.has(batch.id);
  const [justAdded, setJustAdded] = useState(false);

  const formattedBatchName = batch.batchName.charAt(0).toUpperCase() + batch.batchName.slice(1).toLowerCase();
  const displayName = `${formattedBatchName} ${batch.version}`;

  const handleAdd = () => {
    if (inCart) return;
    onAddToCart(batch);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  return (
    <div
      className={`relative flex flex-col rounded-[26px] overflow-hidden bg-white border transition-all duration-300 group
        hover:-translate-y-1 hover:shadow-xl
        ${inCart
          ? 'border-indigo-600 shadow-lg ring-2 ring-indigo-600/30'
          : 'border-slate-200/90 hover:border-blue-400 shadow-md'
        }`}
    >
      {/* ── Top Header Section (Royal Blue Gradient with Curved Circles) ── */}
      <div
        className="relative p-5 sm:p-6 pb-6 overflow-hidden text-white flex-shrink-0"
        style={{
          background: 'linear-gradient(155deg, #18338f 0%, #1e42b8 55%, #18379c 100%)'
        }}
      >
        {/* Subtle decorative circles from reference image */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute top-1/3 -right-8 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-16 -left-12 w-44 h-44 rounded-full bg-white/10 pointer-events-none" />

        {/* Top bar: PW Logo + Preparation Title & ONLINE pill */}
        <div className="relative z-10 flex items-center justify-between gap-2 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-xs flex-shrink-0 p-1 overflow-hidden">
              <img
                src="/pw-logo.png"
                alt="Physics Wallah"
                className="w-full h-full object-contain rounded-xl"
              />
            </div>
            <div>
              <p className="text-white/80 text-[11px] font-semibold leading-tight">Physics Wallah</p>
              <p className="text-white text-xs font-bold leading-tight mt-0.5">{batch.type} Preparation</p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full text-[10px] font-bold text-white bg-white/15 border border-white/20 tracking-wider uppercase backdrop-blur-xs flex-shrink-0">
            ONLINE
          </span>
        </div>

        {/* Batch Tag + Title */}
        <div className="relative z-10 mb-2">
          <span className="text-amber-300 font-extrabold text-[11px] tracking-widest uppercase block mb-1">
            {batch.type} BATCH
          </span>
          <h3 className="text-white font-black text-3xl sm:text-[2rem] tracking-tight leading-tight">
            {displayName}
          </h3>
        </div>

        {/* Description */}
        <p className="relative z-10 text-white/85 text-xs sm:text-[13px] leading-relaxed line-clamp-3">
          {batch.description}
        </p>
      </div>

      {/* ── Lower White Section ── */}
      <div className="p-5 sm:p-6 flex flex-col flex-1 bg-white justify-between">
        {/* BATCH INCLUDES */}
        <div className="mb-5">
          <p className="text-[11px] font-black text-slate-400 tracking-widest uppercase mb-3.5">
            BATCH INCLUDES
          </p>
          <div className="grid grid-cols-2 gap-y-3 gap-x-2">
            {[
              { label: 'Live classes' },
              { label: 'Study material' },
              { label: 'Practice tests' },
              { label: 'Doubt support' }
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0 text-[#1e42b8]">
                  <Check size={12} strokeWidth={3} />
                </div>
                <span className="text-xs font-semibold text-slate-700 truncate">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Row */}
        <div className="pt-4 border-t border-slate-100 mb-5">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-slate-400 text-[11px] font-medium block mb-0.5">
                Special batch price
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-[#18338f] tracking-tight leading-none">
                  ₹{batch.price}
                </span>
                <span className="text-slate-400 text-xs font-medium">
                  one time
                </span>
              </div>
            </div>

            <span className="bg-amber-100/90 text-amber-800 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-amber-200/70">
              Best value
            </span>
          </div>
        </div>

        {/* Enroll Button */}
        <button
          type="button"
          onClick={handleAdd}
          disabled={inCart}
          className={`w-full py-3.5 px-4 rounded-2xl text-sm font-bold transition-all duration-200 select-none flex items-center justify-center gap-2
            ${inCart
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 cursor-default'
              : 'bg-[#1e42b8] hover:bg-[#18338f] active:scale-[0.98] text-white shadow-md shadow-blue-900/20 hover:shadow-lg cursor-pointer'
            }`}
        >
          {inCart ? (
            <>
              <Check size={16} strokeWidth={2.5} className="text-emerald-600" />
              {justAdded ? 'Added to Cart!' : 'In Cart'}
            </>
          ) : (
            <>Enroll in {displayName}</>
          )}
        </button>

        {/* Subtext */}
        <p className="text-slate-400 text-[11px] font-medium text-center mt-3">
          Secure checkout · Instant batch access
        </p>
      </div>
    </div>
  );
};

// ─── Main PWDetailPage — full-page component ──────────────────────────────────
export default function PWDetailPage({ onBack, onAddToCart, cartItems = [] }) {
  const cartIds = new Set(cartItems.map((i) => i.id));
  const pwInCartCount = PW_BATCHES.filter((b) => cartIds.has(b.id)).length;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleAddToCart = (batch) => { if (onAddToCart) onAddToCart(batch); };

  const class11 = PW_BATCHES.filter((b) => b.class === 11);
  const class12 = PW_BATCHES.filter((b) => b.class === 12);

  return (
    <div className="min-h-screen w-full bg-[#fafbfc] text-slate-900 pb-16">
      {/* ── Rainbow accent top line ── */}
      <div
        className="h-[3px] w-full"
        style={{ background: 'linear-gradient(90deg, #4f46e5 0%, #7c3aed 35%, #06b6d4 70%, #4f46e5 100%)' }}
      />

      {/* ── Sticky sub-bar ── */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900
              hover:bg-slate-100 transition-all cursor-pointer select-none flex-shrink-0"
          >
            <ArrowLeft size={16} /> Back
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="font-black text-slate-900 text-base sm:text-lg leading-tight tracking-tight truncate">
              PW JEE &amp; NEET Batches
            </h1>
            <p className="text-slate-500 text-xs font-medium">Select a batch &amp; add to cart</p>
          </div>

          {pwInCartCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200">
              <ShoppingCart size={13} /> {pwInCartCount} in cart
            </div>
          )}

          <div className="flex-shrink-0 px-3.5 py-1.5 rounded-xl text-white text-sm font-black shadow-sm hidden sm:block bg-gradient-to-r from-indigo-600 to-violet-600">
            ₹99
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* ── HERO BANNER SECTION ── */}
        <div
          className="relative rounded-2xl sm:rounded-3xl overflow-hidden mt-6 mb-8 border border-slate-200 shadow-lg bg-slate-900"
        >
          <img
            src="/p1.png"
            alt="PW Physics Lecture Series by OG"
            className="w-full object-cover"
            style={{ maxHeight: '340px', objectPosition: 'center top' }}
          />
          {/* gradient */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to bottom, rgba(15,23,42,0.15) 0%, rgba(15,23,42,0.55) 45%, rgba(15,23,42,0.95) 100%)'
            }}
          />
          {/* Overlay content */}
          <div className="absolute bottom-0 left-0 right-0 px-6 sm:px-10 pb-7 pt-16">
            <div className="flex items-end justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] font-black tracking-widest text-indigo-300 uppercase bg-indigo-950/70 border border-indigo-500/30 px-2.5 py-0.5 rounded-full">
                    Physics Wallah
                  </span>
                  <Sparkles size={13} className="text-amber-400" />
                </div>
                <h2 className="text-white font-black text-2xl sm:text-3xl lg:text-4xl leading-tight tracking-tight mb-1 drop-shadow-sm">
                  Complete JEE &amp; NEET Package
                </h2>
                <p className="text-slate-300 text-sm sm:text-base font-medium">
                  AG Sir Physics · Sarvam Kota Lectures
                </p>
              </div>
              <div className="text-right pb-1 flex-shrink-0">
                <span
                  className="text-5xl sm:text-6xl font-black leading-none block text-white drop-shadow-md"
                  style={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #c7d2fe 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  ₹99
                </span>
                <span className="text-indigo-200 text-[10px] font-black tracking-widest block uppercase mt-1">
                  Per Batch
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── CHANNEL INFO ── */}
        <div className="flex items-center gap-4 px-5 py-4 rounded-2xl border border-slate-200 bg-white shadow-xs mb-8">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm bg-white border border-slate-200 p-1.5 overflow-hidden">
            <img src="/pw-logo.png" alt="Physics Wallah" className="w-full h-full object-contain rounded-xl" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-black text-slate-900 text-sm sm:text-base leading-tight">
              AG SIR PHYSICS LECTURES · SARVAM KOTA LECTURES
            </p>
            <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={13} className="text-amber-400 fill-amber-400" />
                ))}
              </div>
              <span className="text-slate-500 text-xs font-medium">
                3,615+ subscribers · Trusted PW content
              </span>
            </div>
          </div>
          <div className="hidden sm:flex flex-col gap-1.5 flex-shrink-0">
            {['Lectures ✓', 'PDFs ✓'].map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-bold px-3 py-1 rounded-full text-indigo-700 bg-indigo-50 border border-indigo-200 text-center tracking-wide"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* ── CLASS 11 ── */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-blue-200 bg-blue-50 text-sm font-black text-blue-900 tracking-wide shadow-xs">
              🔵 CLASS 11 BATCHES · <span className="text-blue-600 font-bold">ARJUNA</span>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-blue-200 via-blue-100 to-transparent" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {class11.map((b) => (
              <BatchCard key={b.id} batch={b} onAddToCart={handleAddToCart} cartIds={cartIds} />
            ))}
          </div>
        </div>

        {/* ── CLASS 12 ── */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-purple-200 bg-purple-50 text-sm font-black text-purple-900 tracking-wide shadow-xs">
              ⭕ CLASS 12 BATCHES · <span className="text-purple-600 font-bold">LAKSHYA</span>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-purple-200 via-purple-100 to-transparent" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {class12.map((b) => (
              <BatchCard key={b.id} batch={b} onAddToCart={handleAddToCart} cartIds={cartIds} />
            ))}
          </div>
        </div>

        {/* ── Info footer strip ── */}
        <div className="flex items-start gap-3.5 p-5 rounded-2xl border border-indigo-100 bg-indigo-50/70">
          <Package size={20} className="text-indigo-600 flex-shrink-0 mt-0.5" />
          <p className="text-slate-700 text-sm leading-relaxed">
            Each batch includes{' '}
            <span className="text-indigo-900 font-bold">video lectures</span> and{' '}
            <span className="text-indigo-900 font-bold">downloadable PDF notes</span>.{' '}
            Add one or multiple batches to your cart — ₹99 per batch.
          </p>
        </div>
      </div>
    </div>
  );
}
