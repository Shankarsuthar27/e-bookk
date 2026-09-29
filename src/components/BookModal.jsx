import React, { useEffect, useRef } from 'react';
import { X, Star, ShoppingBag, Heart, BookOpen, Tag, Calendar, FileText, Sparkles, Users, Globe2, Bookmark, Flame } from 'lucide-react';
import BookCover from './BookCover';

const StarRating = ({ rating, size = 16 }) => (
  <div className="flex items-center gap-0.5">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={size}
        className={i < rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}
      />
    ))}
  </div>
);

export default function BookModal({
  book,
  onClose,
  onAddToCart,
  wishlist,
  onToggleWishlist,
  currentLang = 'en',
  t
}) {
  const overlayRef = useRef(null);
  const isWishlisted = wishlist.has(book.id);

  const m = t?.modal || {
    authorPrefix: currentLang === 'hi' ? 'लेखक' : 'Author',
    mainTheme: currentLang === 'hi' ? 'मुख्य विषय' : 'Main Theme',
    characters: currentLang === 'hi' ? 'मुख्य पात्र' : 'Key Characters',
    language: currentLang === 'hi' ? 'भाषा' : 'Language',
    published: currentLang === 'hi' ? 'प्रकाशन' : 'Published',
    pages: currentLang === 'hi' ? 'पृष्ठ' : 'Pages',
    readerReviews: currentLang === 'hi' ? 'पाठक समीक्षाएं' : 'Reader Reviews',
    addToCartBtn: currentLang === 'hi' ? 'कार्ट में जोड़ें' : 'Add to Cart',
    topSellerBadge: '🔥 #1 Top Selling · Best Seller'
  };

  // Close on overlay click
  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const discount = book.originalPrice
    ? Math.round(((book.originalPrice - book.price) / book.originalPrice) * 100)
    : null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`Book details: ${book.title}`}
    >
      <div className="modal-enter bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl relative border border-slate-100">
        {/* Close button */}
        <button
          id="modal-close-btn"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/90 hover:bg-slate-100 shadow-md flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X size={18} className="text-slate-700" />
        </button>

        <div className="flex flex-col sm:flex-row">
          {/* Book cover column */}
          <div className="sm:w-64 flex-shrink-0 bg-gradient-to-b from-slate-100 to-slate-200 p-8 flex flex-col justify-center items-center rounded-t-3xl sm:rounded-l-3xl sm:rounded-tr-none border-b sm:border-b-0 sm:border-r border-slate-200/60">
            <div className="w-full max-w-[170px] shadow-2xl transform hover:scale-105 transition-transform duration-300">
              <BookCover
                title={book.title}
                author={book.author}
                coverImage={book.coverImage}
                coverUrl={book.coverUrl}
                coverBg={book.coverBg}
              />
            </div>
            {book.isTopSeller && (
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white text-[11px] font-extrabold uppercase tracking-wider shadow-md shadow-orange-500/30 border border-amber-200/50">
                <Flame size={12} className="fill-yellow-200 text-yellow-200" />
                <span>#1 Top Seller</span>
              </div>
            )}
            {book.theme && (
              <div className="mt-3 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-xl text-[11px] font-semibold text-slate-700 text-center shadow-sm border border-slate-200/60">
                {book.theme}
              </div>
            )}
          </div>

          {/* Details column */}
          <div className="flex-1 p-7 sm:p-8">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {book.isTopSeller && (
                <span className="top-seller-shimmer top-seller-glow text-white text-xs font-black uppercase tracking-wider py-1.5 px-3.5 rounded-full flex items-center gap-1.5 shadow-md border border-amber-200/60">
                  <Flame size={14} className="fill-yellow-300 text-yellow-300 animate-pulse" />
                  <span>{m.topSellerBadge || '🔥 #1 Top Selling'}</span>
                </span>
              )}
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100/60">
                {t?.categories?.[book.category] || book.category}
              </span>
              {book.genre && (
                <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200/60">
                  {book.genre}
                </span>
              )}
              {book.isNew && !book.isTopSeller && (
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100/60">
                  {currentLang === 'hi' ? 'लोकप्रिय' : 'Popular'}
                </span>
              )}
              {discount && (
                <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-100/60">
                  {discount}% {currentLang === 'hi' ? 'छूट' : 'OFF'}
                </span>
              )}
            </div>

            <h2 className="font-serif font-bold text-slate-900 text-2xl sm:text-3xl leading-snug mb-1">
              {currentLang === 'en' ? (book.shortTitle || book.title) : book.title}
            </h2>
            <p className="text-slate-600 text-base mb-3 font-medium">
              {m.authorPrefix}: <span className="text-indigo-600 font-bold">{book.author}</span>
            </p>

            {/* Main theme bar */}
            {book.theme && (
              <div className="flex items-start gap-2 mb-4 text-xs font-medium text-amber-900 bg-amber-50/90 px-3.5 py-2 rounded-xl border border-amber-200/70">
                <Sparkles size={15} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-950">{m.mainTheme}:</span> {book.theme}
                </div>
              </div>
            )}

            {/* Quick Overview Info Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-5 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs">
              {book.characters && (
                <div className="col-span-2 sm:col-span-3 flex items-center gap-2 text-slate-700">
                  <Users size={14} className="text-rose-500 flex-shrink-0" />
                  <span><strong>{m.characters}:</strong> {book.characters}</span>
                </div>
              )}
              {book.language && (
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Globe2 size={13} className="text-indigo-500" />
                  <span><strong>{m.language}:</strong> {book.language}</span>
                </div>
              )}
              {book.published && (
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Calendar size={13} className="text-teal-600" />
                  <span><strong>{m.published}:</strong> {book.published}</span>
                </div>
              )}
              {book.pages && (
                <div className="flex items-center gap-1.5 text-slate-600">
                  <FileText size={13} className="text-amber-600" />
                  <span><strong>{m.pages}:</strong> {book.pages}</span>
                </div>
              )}
            </div>

            {/* Rating row */}
            <div className="flex items-center gap-3 mb-4">
              <StarRating rating={book.rating} />
              <span className="text-sm text-slate-500 font-medium">
                {book.rating}.0 · {book.reviews} {m.readerReviews}
              </span>
            </div>

            {/* Description */}
            <div className="text-slate-700 text-sm leading-relaxed mb-6">
              <p className="mb-2">{book.longDescription || book.description}</p>
            </div>

            {/* Price & Action row */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
              <div className="flex items-baseline gap-2.5">
                <span className="text-3xl font-extrabold text-slate-900">₹{book.price}</span>
                {book.originalPrice && (
                  <span className="text-base text-slate-400 line-through font-medium">₹{book.originalPrice}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  id={`wishlist-btn-${book.id}`}
                  onClick={() => onToggleWishlist(book.id)}
                  className={`w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all duration-200 cursor-pointer ${
                    isWishlisted
                      ? 'bg-rose-500 border-rose-500 text-white shadow-md'
                      : 'border-slate-200 text-slate-400 hover:border-rose-300 hover:text-rose-500 bg-white'
                  }`}
                  aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart size={18} className={isWishlisted ? 'fill-white' : ''} />
                </button>
                <button
                  id={`modal-add-to-cart-${book.id}`}
                  onClick={() => { onAddToCart(book); onClose(); }}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white px-6 py-2.5 rounded-full font-semibold text-sm transition-all shadow-lg shadow-indigo-600/30 cursor-pointer"
                >
                  <ShoppingBag size={16} />
                  {m.addToCartBtn}
                </button>
              </div>
            </div>

            {/* Reader Reviews */}
            {book.mockReviews && book.mockReviews.length > 0 && (
              <div>
                <h3 className="font-semibold text-slate-800 text-sm mb-3 flex items-center gap-2">
                  <BookOpen size={16} className="text-indigo-600" />
                  {m.readerReviews} ({book.mockReviews.length})
                </h3>
                <div className="space-y-3">
                  {book.mockReviews.map((review, idx) => (
                    <div key={idx} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-semibold text-sm text-slate-800">{review.name}</span>
                        <StarRating rating={review.rating} size={13} />
                      </div>
                      <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">&ldquo;{review.text}&rdquo;</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
