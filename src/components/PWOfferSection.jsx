import React, { useEffect, useRef, useState } from 'react';
import { Video, FlaskConical, BookOpen, Zap, ArrowRight, ExternalLink, Play, FileText, GraduationCap, Atom } from 'lucide-react';

// ─── Feature Card Data ────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: Video,
    label: 'JEE Lectures',
    desc: 'Complete lecture content for JEE preparation',
    bg: 'bg-indigo-50',
    border: 'border-indigo-100',
    iconColor: 'text-indigo-600',
  },
  {
    icon: FlaskConical,
    label: 'NEET Lectures',
    desc: 'Study material for NEET preparation',
    bg: 'bg-violet-50',
    border: 'border-violet-100',
    iconColor: 'text-violet-600',
  },
  {
    icon: FileText,
    label: 'PDF Notes',
    desc: 'Downloadable notes for revision',
    bg: 'bg-cyan-50',
    border: 'border-cyan-100',
    iconColor: 'text-cyan-600',
  },
  {
    icon: Zap,
    label: 'Affordable Access',
    desc: 'Complete package for only \u20b999',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    iconColor: 'text-amber-600',
  },
];

// ─── Inline PW Logo SVG ────────────────────────────────────────────────────────
const PWLogo = ({ size = 48 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Physics Wallah Logo"
  >
    <circle cx="50" cy="50" r="48" fill="white" />
    <path d="M 18 20 A 38 38 0 0 1 82 20" stroke="#111827" strokeWidth="5" strokeLinecap="round" fill="none" />
    <path d="M 18 80 A 38 38 0 0 0 82 80" stroke="#111827" strokeWidth="5" strokeLinecap="round" fill="none" />
    <circle cx="50" cy="50" r="32" fill="#111827" />
    <text x="50" y="47" textAnchor="middle" fontFamily="Georgia, serif" fontWeight="bold" fontSize="22" fill="white">P</text>
    <text x="50" y="68" textAnchor="middle" fontFamily="Georgia, serif" fontWeight="bold" fontSize="18" fill="white">W</text>
  </svg>
);

// ─── Background decorative shapes ─────────────────────────────────────────────
const BgShapes = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden="true">
    <div
      className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-[0.07]"
      style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }}
    />
    <div
      className="absolute -bottom-24 -right-24 w-[480px] h-[480px] rounded-full opacity-[0.08]"
      style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }}
    />
    <div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.04]"
      style={{ background: 'radial-gradient(circle, #06b6d4 0%, transparent 60%)' }}
    />
    <Atom className="absolute top-8 right-12 text-indigo-300 opacity-20 w-10 h-10" />
    <GraduationCap className="absolute bottom-10 left-10 text-violet-300 opacity-20 w-10 h-10" />
    <BookOpen className="absolute top-1/2 right-8 text-cyan-300 opacity-15 w-8 h-8" />
  </div>
);

// ─── Main PWOfferSection Component ────────────────────────────────────────────
export default function PWOfferSection({ onOpenPWDetail, onAddToCart, cartItems = [] }) {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="pw-jee-neet-offer"
      aria-labelledby="pw-offer-heading"
      className="relative max-w-7xl mx-auto px-4 sm:px-6 my-10 sm:my-14"
    >
      {/* Outer wrapper card */}
      <div
        className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/80 shadow-lg"
        style={{
          background: 'linear-gradient(135deg, #f8faff 0%, #f0f4ff 40%, #faf5ff 70%, #f8faff 100%)',
        }}
      >
        <BgShapes />

        {/* Two-column grid: content left, pricing card right */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-0">

          {/* ─────────── LEFT COLUMN ─────────── */}
          <div className="px-6 sm:px-10 pt-8 sm:pt-10 pb-8 lg:pb-10">

            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide mb-5 text-white shadow-sm"
              style={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(16px)',
                transition: 'opacity 0.6s ease, transform 0.6s ease',
                transitionDelay: '0ms',
              }}
            >
              <span>🔥</span>
              JEE &amp; NEET SPECIAL OFFER
            </div>

            {/* Main Heading */}
            <h2
              id="pw-offer-heading"
              className="text-2xl sm:text-3xl lg:text-[2.1rem] font-black text-slate-950 tracking-tight leading-tight mb-4 max-w-xl"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'opacity 0.65s ease, transform 0.65s ease',
                transitionDelay: '80ms',
              }}
            >
              Complete PW{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 60%, #4338ca 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                JEE &amp; NEET
              </span>{' '}
              Lectures + PDF Notes
            </h2>

            {/* Subheading */}
            <p
              className="text-sm sm:text-base text-slate-600 max-w-lg leading-relaxed mb-7"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'opacity 0.65s ease, transform 0.65s ease',
                transitionDelay: '140ms',
              }}
            >
              Access comprehensive Physics Wallah study lectures and PDF notes for JEE &amp; NEET preparation — all for just{' '}
              <span className="font-black text-indigo-600">₹99</span>.
            </p>

            {/* Feature Cards Grid */}
            <div
              className="grid grid-cols-2 gap-3 mb-8 sm:mb-9 max-w-xl"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(24px)',
                transition: 'opacity 0.65s ease, transform 0.65s ease',
                transitionDelay: '200ms',
              }}
            >
              {FEATURES.map((feat, i) => {
                const Icon = feat.icon;
                return (
                  <div
                    key={feat.label}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border ${feat.border} ${feat.bg}
                      hover:shadow-md transition-all duration-200 cursor-default`}
                    style={{
                      opacity: isVisible ? 1 : 0,
                      transform: isVisible ? 'translateY(0)' : 'translateY(16px)',
                      transition: 'opacity 0.6s ease, transform 0.6s ease, box-shadow 0.2s ease',
                      transitionDelay: `${240 + i * 55}ms`,
                    }}
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white shadow-xs flex items-center justify-center">
                      <Icon size={16} className={feat.iconColor} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 text-xs sm:text-[13px] leading-snug">{feat.label}</p>
                      <p className="text-[11px] sm:text-xs text-slate-500 leading-snug mt-0.5">{feat.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA Buttons */}
            <div
              className="flex flex-wrap items-center gap-3"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(16px)',
                transition: 'opacity 0.65s ease, transform 0.65s ease',
                transitionDelay: '460ms',
              }}
            >
              {/* Primary CTA button */}
              <button
                type="button"
                id="pw-offer-cta-primary"
                onClick={() => onOpenPWDetail?.()}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-black text-white
                  hover:-translate-y-0.5 active:scale-95 transition-all duration-200 select-none cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 60%, #4f46e5 100%)',
                  boxShadow: '0 4px 20px -4px rgba(99,102,241,0.55)',
                }}
                aria-label="Get access to PW JEE and NEET content for ₹99"
              >
                Get Access for ₹99
                <ArrowRight size={16} />
              </button>

              {/* Secondary text link */}
              <button
                type="button"
                id="pw-offer-cta-secondary"
                onClick={() => onOpenPWDetail?.()}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700
                  hover:underline underline-offset-2 transition-colors select-none cursor-pointer"
                aria-label="View details about the PW JEE and NEET offer"
              >
                View Details
                <ExternalLink size={13} />
              </button>
            </div>

            {/* Trust line */}
            <p
              className="mt-5 text-[11px] text-slate-400 flex items-center gap-1.5"
              style={{
                opacity: isVisible ? 1 : 0,
                transition: 'opacity 0.65s ease',
                transitionDelay: '540ms',
              }}
            >
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
              One-time payment · Instant access · No subscription required
            </p>
          </div>
          {/* ─────────── END LEFT COLUMN ─────────── */}

          {/* ─────────── RIGHT COLUMN — Image-forward Pricing Card ─────────── */}
          <div
            className="relative flex items-center justify-center px-6 py-8 lg:py-10 lg:pr-10 lg:pl-4"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateX(0)' : 'translateX(32px)',
              transition: 'opacity 0.7s ease, transform 0.7s ease',
              transitionDelay: '180ms',
            }}
          >
            {/* Vertical divider on desktop */}
            <div
              className="hidden lg:block absolute left-0 top-8 bottom-8 w-px"
              style={{ background: 'linear-gradient(to bottom, transparent, rgba(148,163,184,0.35), transparent)' }}
            />

            {/* Card wrapper */}
            <div
              className="relative w-full max-w-[300px] rounded-2xl overflow-hidden select-none"
              style={{
                background: 'linear-gradient(160deg, #1e1b4b 0%, #312e81 55%, #1e1b4b 100%)',
                boxShadow: '0 24px 64px -12px rgba(99,102,241,0.45), 0 0 0 1px rgba(99,102,241,0.18)',
                animation: isVisible ? 'pwFloatCard 4.5s ease-in-out infinite' : 'none',
              }}
              aria-label="PW Physics Lecture Series — ₹99 one-time access"
            >
              {/* Rainbow accent top border */}
              <div
                className="absolute inset-x-0 top-0 h-[3px] z-20"
                style={{ background: 'linear-gradient(90deg, #818cf8, #a78bfa, #67e8f9, #a78bfa, #818cf8)' }}
              />

              {/* ── IMAGE SECTION (top) ── */}
              <div className="relative w-full overflow-hidden" style={{ aspectRatio: '1/1' }}>
                <img
                  src="/p1.png"
                  alt="PW Physics Lecture Series by OG — Class 11th"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />

                {/* Dark vignette at bottom of image so text below bleeds in nicely */}
                <div
                  className="absolute inset-x-0 bottom-0 h-16 pointer-events-none"
                  style={{ background: 'linear-gradient(to bottom, transparent, rgba(30,27,75,0.92))' }}
                />

                {/* Floating ₹99 badge — top-right of image */}
                <div
                  className="absolute top-3 right-3 z-10 px-3 py-1.5 rounded-xl"
                  style={{
                    background: 'linear-gradient(135deg, #312e81 0%, #4f46e5 100%)',
                    boxShadow: '0 4px 20px -4px rgba(99,102,241,0.7), 0 0 0 1.5px rgba(129,140,248,0.4)',
                  }}
                >
                  <span
                    className="text-2xl font-black leading-none block"
                    style={{
                      background: 'linear-gradient(135deg, #a5f3fc 0%, #c4b5fd 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      filter: 'drop-shadow(0 0 8px rgba(129,140,248,0.8))',
                    }}
                  >
                    ₹99
                  </span>
                  <span className="text-indigo-300 text-[9px] font-bold tracking-wider block text-center -mt-0.5">
                    ONLY
                  </span>
                </div>

                {/* "Physics Wallah" label on bottom of image */}
                <div className="absolute bottom-2 left-3 z-10 flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-md bg-white flex items-center justify-center p-0.5 shadow-xs overflow-hidden">
                    <img src="/pw-logo.png" alt="PW" className="w-full h-full object-contain" />
                  </div>
                  <span className="text-indigo-200 text-[10px] font-bold tracking-widest uppercase">
                    Physics Wallah
                  </span>
                </div>
              </div>

              {/* ── CONTENT SECTION (below image) ── */}
              <div className="relative z-10 px-5 pt-4 pb-5 flex flex-col">

                {/* Package title row */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <p className="text-white font-black text-base leading-tight tracking-tight">
                      PW JEE + NEET
                    </p>
                    <p className="text-indigo-300 text-xs font-semibold tracking-wide mt-0.5">
                      LECTURES + NOTES
                    </p>
                  </div>
                  {/* ₹99 large text — secondary prominent display */}
                  <div className="text-right flex-shrink-0">
                    <span
                      className="text-3xl font-black leading-none"
                      style={{
                        background: 'linear-gradient(135deg, #a5f3fc 0%, #818cf8 50%, #c4b5fd 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        filter: 'drop-shadow(0 0 12px rgba(129,140,248,0.6))',
                      }}
                    >
                      ₹99
                    </span>
                    <span className="block text-indigo-400 text-[9px] font-semibold tracking-wide -mt-0.5">
                      one-time
                    </span>
                  </div>
                </div>

                {/* Divider */}
                <div
                  className="w-full h-px mb-3"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(129,140,248,0.4), transparent)' }}
                />

                {/* Inclusions */}
                <div className="space-y-1.5 mb-4">
                  {[
                    { icon: Play, label: 'JEE Lectures' },
                    { icon: FlaskConical, label: 'NEET Lectures' },
                    { icon: FileText, label: 'PDF Notes' },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(99,102,241,0.35)' }}
                      >
                        <Icon size={10} className="text-indigo-300" />
                      </div>
                      <span className="text-indigo-100 text-xs font-medium flex-1">{label}</span>
                      <span className="text-emerald-400 text-xs font-bold">✓</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <button
                  type="button"
                  id="pw-card-cta-btn"
                  onClick={() => onOpenPWDetail?.()}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-black text-indigo-950
                    hover:-translate-y-0.5 active:scale-95 transition-all duration-200 cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, #a5f3fc 0%, #818cf8 60%, #c4b5fd 100%)',
                    boxShadow: '0 4px 18px -4px rgba(129,140,248,0.65)',
                  }}
                  aria-label="Get access now for ₹99"
                >
                  Get Access Now
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
          {/* ─────────── END RIGHT COLUMN ─────────── */}
        </div>
      </div>

      {/* Float keyframe injected via a style tag */}
      <style>{`
        @keyframes pwFloatCard {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-8px); }
        }
      `}</style>
    </section>
  );
}
