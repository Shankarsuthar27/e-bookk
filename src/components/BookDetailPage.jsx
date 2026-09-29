import React, { useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  Star,
  ShoppingBag,
  Bookmark,
  Share2,
  Check,
  QrCode
} from 'lucide-react';
import { EBOOKS } from '../data/books';
import AdBanner from './AdBanner';

const StarRating = ({ rating = 5, size = 16 }) => (
  <div className="flex items-center gap-0.5">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={size}
        className={i < rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}
      />
    ))}
  </div>
);

export default function BookDetailPage({
  book,
  onBack,
  onAddToCart,
  onPayNow,
  wishlist,
  onToggleWishlist,
  onSelectBook,
  currentLang = 'en',
  t
}) {
  const isWishlisted = wishlist.has(book.id);

  // Scroll to top when book opens or changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [book.id]);

  const m = t?.modal || {};

  const displayTitle = currentLang === 'en' ? (book.titleEn || book.shortTitle || book.title) : book.title;
  const displayAuthor = currentLang === 'en' ? (book.authorEn || book.author) : book.author;
  const displayLanguage = currentLang === 'en' ? (book.languageEn || book.language) : book.language;
  const displayCharacters = currentLang === 'en' ? (book.charactersEn || book.characters) : book.characters;
  const displayTheme = currentLang === 'en' ? (book.themeEn || book.theme) : book.theme;
  const displayGenre = currentLang === 'en' ? (book.genreEn || book.genre) : book.genre;
  const displayDescription = currentLang === 'en' ? (book.descriptionEn || book.description) : book.description;
  const displayLongDescription = currentLang === 'en'
    ? (book.longDescriptionEn || book.longDescription || book.description)
    : (book.longDescription || book.description);
  const displayReviews = (currentLang === 'en' && book.mockReviewsEn) ? book.mockReviewsEn : (book.mockReviews || []);

  const authorPrefix = m.authorPrefix || (currentLang === 'hi' ? 'लेखक' : 'Author');
  const mainThemeLabel = m.mainTheme || (currentLang === 'hi' ? 'मुख्य विषय' : 'Main Theme');
  const charactersLabel = m.characters || (currentLang === 'hi' ? 'मुख्य पात्र' : 'Key Characters');
  const languageLabel = m.language || (currentLang === 'hi' ? 'भाषा' : 'Language');
  const publishedLabel = m.published || (currentLang === 'hi' ? 'प्रकाशन' : 'Published');
  const genreLabel = m.genre || (currentLang === 'hi' ? 'विधा / शैली' : 'Genre / Style');
  const pagesLabel = m.pages || (currentLang === 'hi' ? 'पृष्ठ' : 'Pages');
  const readerReviewsLabel = m.readerReviews || (currentLang === 'hi' ? 'पाठक समीक्षाएं' : 'Reader Reviews');
  const addToCartLabel = m.addToCartBtn || (currentLang === 'hi' ? 'कार्ट में जोड़ें' : 'Add to Cart');

  // Similar books from library
  const similarBooks = useMemo(() => {
    const list = EBOOKS.filter((b) => b.id !== book.id);
    const sameCat = list.filter((b) => b.category === book.category);
    const diffCat = list.filter((b) => b.category !== book.category);
    return [...sameCat, ...diffCat].slice(0, 6);
  }, [book.id, book.category]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: displayTitle,
        text: `Check out "${displayTitle}" by ${displayAuthor} on STAX E-Books for just ₹${book.price}!`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      alert(t?.linkCopiedToast || (currentLang === 'hi' ? 'लिंक कॉपी हो गया!' : 'Link copied to clipboard!'));
    }
  };

  // Structured specification items for simple table display
  const specs = [
    { label: authorPrefix, value: displayAuthor },
    { label: publishedLabel, value: book.published },
    { label: languageLabel, value: displayLanguage },
    { label: charactersLabel, value: displayCharacters },
    { label: genreLabel, value: displayGenre },
    { label: mainThemeLabel, value: displayTheme },
    ...(book.pages ? [{ label: pagesLabel, value: `${book.pages} ${currentLang === 'hi' ? 'पृष्ठ' : 'pages'}` }] : [])
  ].filter((item) => Boolean(item.value));

  return (
    <div className="min-h-screen bg-white text-slate-900 pb-20">
      {/* ─── Simple Sticky Back Nav Bar ──────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 sticky top-14 sm:top-16 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium text-sm transition-colors cursor-pointer group"
            id="back-to-browse-btn"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span>{t?.backToBrowse || (currentLang === 'hi' ? 'वापस जाएँ' : 'Back')}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              title={t?.shareTooltip || (currentLang === 'hi' ? 'शेयर करें' : 'Share')}
              aria-label="Share this book"
            >
              <Share2 size={17} />
            </button>
            <button
              onClick={() => onToggleWishlist(book.id)}
              className={`p-2 rounded-full border transition-colors cursor-pointer ${
                isWishlisted
                  ? 'bg-rose-50 border-rose-200 text-rose-600'
                  : 'border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
              title={isWishlisted ? (t?.bookmarkedTooltip || 'Bookmarked') : (t?.bookmarkTooltip || 'Bookmark')}
              aria-label="Bookmark"
            >
              <Bookmark size={17} className={isWishlisted ? 'fill-rose-600 text-rose-600' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Main Content Container ────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Clean Cover Presentation */}
          <div className="md:col-span-4 lg:col-span-4 flex flex-col items-center md:items-start">
            <div className="w-full max-w-[240px] sm:max-w-[260px] md:max-w-none">
              <div className="relative aspect-[3/4.2] w-full rounded-md border border-slate-200 overflow-hidden bg-slate-50 shadow-md">
                <span className="absolute top-2 left-2 z-10 bg-neutral-900 text-white text-[9px] font-black px-2 py-0.5 rounded tracking-wider uppercase">
                  PDF
                </span>
                <img
                  src={book.coverImage || book.coverUrl}
                  alt={displayTitle}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Clean format pills */}
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500 font-medium">
                <span className="inline-flex items-center gap-1">
                  <Check size={14} className="text-emerald-600" />
                  {currentLang === 'hi' ? 'हाई क्वालिटी PDF' : 'High Quality PDF'}
                </span>
                <span>·</span>
                <span>{currentLang === 'hi' ? 'तत्काल डाउनलोड' : 'Instant Download'}</span>
              </div>
            </div>

            {/* Desktop Sponsored Ad Placement under book cover */}
            <div className="hidden md:flex flex-col items-center mt-6 w-full">
              <AdBanner currentLang={currentLang} variant="card" />
            </div>
          </div>

          {/* Right Column: Book Details & Actions */}
          <div className="md:col-span-8 lg:col-span-8 space-y-6">
            {/* Title & Author */}
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-2">
                <span>{t?.categories?.[book.category] || book.category}</span>
                {book.published && <span>· {book.published}</span>}
                {book.isTopSeller && (
                  <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                    {currentLang === 'hi' ? 'बेस्टसेलर' : 'Top Selling'}
                  </span>
                )}
              </div>

              <h1 className="font-serif font-bold text-slate-900 text-2xl sm:text-3xl lg:text-4xl leading-snug">
                {displayTitle}
              </h1>

              {currentLang === 'en' && book.title && book.title !== displayTitle && (
                <p className="text-sm font-serif italic text-slate-500 mt-1">
                  {t?.originalHindiTitle || 'Original Hindi'}: <span className="font-medium text-slate-700 not-italic">{book.title}</span>
                </p>
              )}

              <p className="text-slate-700 text-base sm:text-lg font-medium mt-2">
                <span className="text-slate-500">{authorPrefix}: </span>
                <span className="font-semibold text-slate-900">{displayAuthor}</span>
              </p>

              {/* Rating */}
              <div className="flex items-center gap-2 mt-2 text-xs sm:text-sm text-slate-600">
                <StarRating rating={book.rating} size={15} />
                <span className="font-bold text-slate-900">{book.rating}.0</span>
                <span className="text-slate-400">·</span>
                <span>{book.reviews || 620} {readerReviewsLabel}</span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-500">{book.views || `${book.reviews || 85}K views`}</span>
              </div>
            </div>

            {/* Price & Action Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5">
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                  ₹{book.price}
                </span>
                {book.originalPrice && book.originalPrice > book.price && (
                  <span className="text-base text-slate-400 line-through">
                    ₹{book.originalPrice}
                  </span>
                )}
                {book.originalPrice && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {currentLang === 'hi' ? `₹${book.originalPrice - book.price} की छूट` : `Save ₹${book.originalPrice - book.price}`}
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  id={`detail-pay-now-${book.id}`}
                  onClick={() => {
                    if (onPayNow) {
                      onPayNow(book);
                    } else {
                      onAddToCart(book);
                    }
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.99] text-white py-3 px-5 rounded-lg font-bold text-sm sm:text-base transition-all cursor-pointer shadow-sm shadow-blue-600/20"
                >
                  <QrCode size={18} />
                  <span>{currentLang === 'hi' ? `₹${book.price} का भुगतान करें (QR)` : `Pay ₹${book.price} (UPI QR)`}</span>
                </button>

                <button
                  id={`detail-add-to-cart-${book.id}`}
                  onClick={() => onAddToCart(book)}
                  className="flex-1 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white py-3 px-5 rounded-lg font-semibold text-sm sm:text-base transition-colors cursor-pointer shadow-xs"
                >
                  <ShoppingBag size={17} />
                  <span>{addToCartLabel}</span>
                </button>

                <button
                  onClick={() => onToggleWishlist(book.id)}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium text-sm border transition-colors cursor-pointer ${
                    isWishlisted
                      ? 'bg-rose-50 border-rose-200 text-rose-700'
                      : 'border-slate-300 text-slate-700 hover:bg-slate-100 bg-white'
                  }`}
                >
                  <Bookmark size={16} className={isWishlisted ? 'fill-rose-700 text-rose-700' : ''} />
                  <span>{isWishlisted ? (t?.bookmarkedTooltip || 'Bookmarked') : (t?.bookmarkTooltip || 'Save')}</span>
                </button>
              </div>

              <p className="text-[11px] text-slate-500 mt-3">
                ✓ {currentLang === 'hi' ? 'भुगतान के बाद तुरंत PDF डाउनलोड लिंक प्राप्त करें · आजीवन उपयोग' : 'Instant PDF download link immediately after checkout · Lifetime access'}
              </p>
            </div>

            {/* Key Specifications (Clean Table / Definition List) */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200">
                <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {currentLang === 'hi' ? 'मुख्य विवरण' : 'Key Information'}
                </h2>
              </div>
              <div className="divide-y divide-slate-100 text-xs sm:text-sm">
                {specs.map((item, index) => (
                  <div key={index} className="grid grid-cols-3 sm:grid-cols-4 px-4 py-3 bg-white">
                    <span className="font-semibold text-slate-500 col-span-1">{item.label}</span>
                    <span className="text-slate-800 col-span-2 sm:col-span-3 font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Book Description */}
            <div className="pt-2 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {t?.bookDetailsTitle || (currentLang === 'hi' ? 'पुस्तक के बारे में' : 'About the Book')}
              </h2>
              <div className="text-slate-700 text-sm sm:text-base leading-relaxed space-y-3">
                <p>{displayLongDescription}</p>
                {displayDescription && displayLongDescription !== displayDescription && (
                  <p className="text-slate-600 text-xs sm:text-sm italic pl-3 border-l-2 border-slate-300">
                    &ldquo;{displayDescription}&rdquo;
                  </p>
                )}
              </div>
            </div>

            {/* Reader Reviews */}
            {displayReviews.length > 0 && (
              <div className="pt-4 space-y-3">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  {readerReviewsLabel} ({displayReviews.length})
                </h3>
                <div className="space-y-2.5">
                  {displayReviews.map((review, idx) => (
                    <div key={idx} className="bg-slate-50 rounded-lg p-3.5 border border-slate-200/80">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-xs sm:text-sm text-slate-800">{review.name}</span>
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

        {/* Mobile Sponsored Ad before similar books */}
        <div className="md:hidden my-8 flex justify-center">
          <AdBanner currentLang={currentLang} variant="card" />
        </div>

        {/* ─── Similar Books (Readers Also Enjoyed) ─────────────────────────── */}
        <section className="mt-14 pt-8 border-t border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                {t?.similarBooksTitle || (currentLang === 'hi' ? 'पाठक इन्हें भी पसंद करते हैं' : 'Readers Also Enjoyed')}
              </h2>
            </div>
            <button
              onClick={onBack}
              className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 hover:underline cursor-pointer"
            >
              {t?.viewAllBooks || (currentLang === 'hi' ? 'सभी पुस्तकें देखें' : 'View all books')} →
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {similarBooks.map((simBook) => {
              const simTitle = currentLang === 'en' ? (simBook.titleEn || simBook.shortTitle || simBook.title) : simBook.title;
              const simAuthor = currentLang === 'en' ? (simBook.authorEn || simBook.author) : simBook.author;
              const isSimWishlisted = wishlist.has(simBook.id);
              return (
                <article
                  key={simBook.id}
                  onClick={() => onSelectBook(simBook)}
                  className="bg-white rounded-lg border border-slate-200/90 p-2.5 flex flex-col justify-between cursor-pointer hover:shadow-md transition-shadow active:scale-[0.99] group"
                >
                  <div className="relative aspect-[3/4.2] w-full rounded border border-slate-200/80 overflow-hidden mb-2 bg-slate-50">
                    <span className="absolute top-1.5 left-1.5 z-10 bg-neutral-900 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase">
                      PDF
                    </span>
                    <span className="absolute bottom-1.5 right-1.5 z-10 bg-slate-950/85 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                      ₹{simBook.price}
                    </span>
                    <img
                      src={simBook.coverImage || simBook.coverUrl}
                      alt={simTitle}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>

                  <h4 className="font-bold text-slate-900 text-xs line-clamp-2 min-h-[32px] group-hover:text-indigo-600 transition-colors">
                    {simTitle}
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate mb-1">
                    {simAuthor}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                    <span className="font-bold text-slate-900">₹{simBook.price}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleWishlist(simBook.id);
                      }}
                      className="p-1 text-slate-400 hover:text-slate-900"
                    >
                      <Bookmark size={13} className={isSimWishlisted ? 'fill-slate-900 text-slate-900' : ''} />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
