import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  ShoppingBag,
  Search,
  Menu,
  Star,
  ArrowRight,
  BookOpen,
  X,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Globe,
  Heart,
  Sparkles,
  Feather,
  Flame,
  Bookmark,
  User,
  Home,
  Compass,
  PackageCheck,
  Database
} from 'lucide-react';
import { EBOOKS } from './data/books';
import { TRANSLATIONS, AVAILABLE_LANGUAGES } from './data/translations';
import BookCover from './components/BookCover';
import BookDetailPage from './components/BookDetailPage';
import SignInModal from './components/SignInModal';
import CartCheckoutModal from './components/CartCheckoutModal';
import CartPage from './components/CartPage';
import OrdersModal from './components/OrdersModal';
import UserMenuDropdown from './components/UserMenuDropdown';
import {
  auth,
  signOut,
  onAuthStateChanged,
  saveUserToDatabase,
  getUserFromDatabase,
  syncUserCartToDatabase,
  syncUserWishlistToDatabase,
  recordUserPurchaseInDatabase,
} from './firebase';

// ─── Utility ──────────────────────────────────────────────────────────────────


// Category definitions with bilingual keys
const CATEGORIES = [
  { key: 'all', raw: 'सभी (All)', en: 'All', hi: 'सभी (All)' },
  { key: 'poetry', raw: 'शायरी व काव्य', en: 'Poetry & Shayari', hi: 'शायरी व काव्य' },
  { key: 'classics', raw: 'क्लासिक', en: 'Classics', hi: 'क्लासिक' },
  { key: 'love', raw: 'प्रेम व विरह', en: 'Love & Separation', hi: 'प्रेम व विरह' },
  { key: 'social', raw: 'सामाजिक यथार्थ', en: 'Social Realism', hi: 'सामाजिक यथार्थ' },
  { key: 'modern', raw: 'आधुनिक रिश्ते', en: 'Modern Relationships', hi: 'आधुनिक रिश्ते' },
  { key: 'psychological', raw: 'मनोवैज्ञानिक', en: 'Psychological', hi: 'मनोवैज्ञानिक' },
  { key: 'philosophical', raw: 'दार्शनिक', en: 'Philosophical', hi: 'दार्शनिक' }
];

// ─── Language Selector Dropdown (matches user's screenshot exactly) ────────────

const LanguageDropdown = ({ currentLang, onSelectLang, t }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close when clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayCode = currentLang === 'hi' ? 'HI' : 'EN';

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown Trigger Button: 🌐 EN ^ / 🌐 HI ^ */}
      <button
        id="language-selector-btn"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg bg-neutral-100/90 hover:bg-neutral-200/90 text-neutral-800 text-xs sm:text-sm font-semibold border border-neutral-300/80 transition-colors cursor-pointer select-none"
        aria-label="Select preferred language"
        aria-expanded={isOpen}
      >
        <Globe size={15} className="text-neutral-700 flex-shrink-0" />
        <span className="font-bold tracking-wide">{displayCode}</span>
        {isOpen ? (
          <ChevronUp size={14} className="text-neutral-700 flex-shrink-0" />
        ) : (
          <ChevronDown size={14} className="text-neutral-700 flex-shrink-0" />
        )}
      </button>

      {/* Popover Card: Exact match to user's uploaded screenshot */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-24px)] bg-white rounded-xl shadow-2xl border border-slate-200/90 py-3.5 px-4 z-50 animate-in fade-in zoom-in-95 duration-150"
          role="menu"
          aria-orientation="vertical"
        >
          {/* Header */}
          <h3 className="font-bold text-slate-900 text-base mb-3 select-none">
            {t.preferredLangTitle || 'Preferred Language'}
          </h3>

          {/* Divider */}
          <div className="h-[1px] bg-slate-200 -mx-4 mb-2.5" />

          {/* Radio Options List */}
          <div className="space-y-1">
            {AVAILABLE_LANGUAGES.map((lang) => {
              const isSelected = currentLang === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => {
                    onSelectLang(lang.code);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3.5 py-2 px-1 text-left rounded-md hover:bg-slate-50 transition-colors cursor-pointer group"
                  role="menuitemradio"
                  aria-checked={isSelected}
                >
                  {/* Custom Radio Button matching screenshot */}
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                      isSelected
                        ? 'border-black'
                        : 'border-slate-800 group-hover:border-black'
                    }`}
                  >
                    {isSelected && (
                      <div className="w-2.5 h-2.5 bg-black rounded-full" />
                    )}
                  </div>

                  {/* Language Label */}
                  <span
                    className={`text-[15px] ${
                      isSelected
                        ? 'font-bold text-slate-950'
                        : 'font-medium text-slate-800 group-hover:text-black'
                    }`}
                  >
                    {lang.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div className="h-[1px] bg-slate-200 -mx-4 my-2.5" />

          {/* Learn More Link */}
          <a
            href="#about"
            onClick={() => setIsOpen(false)}
            className="block font-bold text-slate-900 text-sm hover:text-indigo-600 transition-colors py-1 cursor-pointer"
          >
            {t.learnMore || 'Learn more'}
          </a>
        </div>
      )}
    </div>
  );
};

// ─── Header ───────────────────────────────────────────────────────────────────

const Header = ({
  cartCount,
  isScrolled,
  wishlistCount,
  searchQuery,
  setSearchQuery,
  onOpenCart,
  onOpenOrders,
  onLogoClick,
  currentLang,
  onSelectLang,
  t,
  onOpenSignIn,
  onSignOut,
  user,
  activeCategoryKey,
  onSelectCategory
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Close drawer on Escape or back navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsDrawerOpen(false);
    };
    if (isDrawerOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-xs py-1.5 sm:py-3'
            : 'bg-[#fcfcfc] sm:bg-white py-1.5 sm:py-3 border-b border-neutral-200/90 sm:border-slate-200/80'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          {/* ─── MOBILE VIEW NAVBAR (≡  [STAX]    [ Search  🔍 ] [ 🛍️ Cart ]) ─── */}
          <div className="md:hidden flex items-center justify-between gap-2 sm:gap-3 h-10">
            {/* Left: Hamburger Menu Icon + STAX Logo */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <button
                id="mobile-menu-trigger-btn"
                onClick={() => setIsDrawerOpen(true)}
                className="p-1 -ml-1 text-neutral-800 hover:text-black hover:bg-neutral-100 rounded-md transition-colors cursor-pointer select-none flex items-center justify-center"
                aria-label="Open navigation menu"
              >
                <Menu size={22} strokeWidth={2.4} />
              </button>

              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (onLogoClick) onLogoClick();
                }}
                className="flex items-center gap-1.5 hover:opacity-90 transition-opacity select-none group"
                id="mobile-header-logo"
              >
                <img
                  src="/logo-icon.png"
                  alt="STAX Logo"
                  className="w-7 h-7 object-contain drop-shadow-2xs group-hover:scale-105 transition-transform"
                />
                <span className="text-[17px] sm:text-[18px] font-black tracking-tight text-slate-950 font-sans leading-none">
                  STAX<span className="text-[#1E40AF]">.</span>
                </span>
              </a>
            </div>

            {/* Right: Rounded Rectangular Search Box + Cart Button next right to it */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-1 justify-end max-w-[240px] sm:max-w-[280px]">
              <div className="flex-1 relative min-w-0">
                <input
                  id="mobile-scribd-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search"
                  className="w-full h-8 bg-white border border-neutral-300 rounded-md pl-2.5 pr-7 text-xs text-neutral-800 placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-400/30 transition-all font-sans"
                />
                {searchQuery ? (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-1.5 top-1.5 text-neutral-400 hover:text-neutral-700 p-0.5 cursor-pointer"
                    aria-label="Clear search"
                  >
                    <X size={14} />
                  </button>
                ) : (
                  <Search
                    size={15}
                    className="absolute right-2 top-2 text-neutral-700 pointer-events-none stroke-[2.2]"
                  />
                )}
              </div>

              {/* Cart Button next right to search bar */}
              <button
                id="mobile-header-cart-btn"
                onClick={onOpenCart}
                className="relative p-1.5 text-neutral-800 hover:text-indigo-600 hover:bg-neutral-100 rounded-full transition-colors flex-shrink-0 cursor-pointer flex items-center justify-center select-none"
                aria-label={`${t.cartTitle || 'Cart'} (${cartCount} items)`}
                title={t.cartTitle || 'Cart'}
              >
                <ShoppingBag size={20} className="stroke-[2.2]" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-indigo-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* ─── DESKTOP VIEW NAVBAR (md: and above) ────────────────────────── */}
          <div className="hidden md:flex items-center justify-between gap-6">
            {/* Brand Logo */}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (onLogoClick) onLogoClick();
              }}
              className="flex items-center gap-2.5 cursor-pointer flex-shrink-0 group"
              id="header-logo"
            >
              <img
                src="/logo-icon.png"
                alt="STAX Logo"
                className="w-10 h-10 object-contain drop-shadow-xs group-hover:scale-105 transition-transform"
              />
              <div className="flex flex-col">
                <span className="font-black text-2xl tracking-tight text-slate-950 leading-none font-sans">
                  STAX<span className="text-[#1E40AF]">.</span>
                </span>
                <span className="text-[9.5px] font-semibold text-slate-500 tracking-wider uppercase mt-0.5">
                  {t.logoSub || 'हिन्दी साहित्य'}
                </span>
              </div>
            </a>

            {/* Center Search Input */}
            <div className="flex-1 max-w-xl mx-4">
              <div className="relative w-full">
                <input
                  id="book-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchPlaceholder || 'Search Hindi e-books, novels, poetry, PDFs...'}
                  className="w-full bg-slate-100 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-full pl-9 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all placeholder:text-slate-400"
                />
                <Search size={15} className="absolute left-3.5 top-2.5 text-slate-400 pointer-events-none" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
                    aria-label={t.clearSearch || 'Clear search'}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2.5 flex-shrink-0">
              {/* Language Dropdown */}
              <LanguageDropdown
                currentLang={currentLang}
                onSelectLang={onSelectLang}
                t={t}
              />

              {/* Wishlist / Bookmarks Icon */}
              <a
                href="#catalog"
                id="header-wishlist-btn"
                className="relative text-slate-600 hover:text-slate-900 transition-colors p-2 rounded-full hover:bg-slate-100 flex items-center justify-center"
                aria-label={`${t.bookmarksTitle} (${wishlistCount} items)`}
                title={t.bookmarksTitle}
              >
                <Bookmark className="w-4 h-4 sm:w-5 sm:h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-slate-900 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {wishlistCount}
                  </span>
                )}
              </a>

              {/* Cart Button */}
              <button
                id="header-cart-btn"
                onClick={onOpenCart}
                className="relative text-slate-600 hover:text-indigo-600 transition-colors p-2 rounded-full hover:bg-indigo-50 flex items-center justify-center"
                aria-label={`${t.cartTitle} (${cartCount} items)`}
                title={t.cartTitle}
              >
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                {cartCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-indigo-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* My Orders / Purchases Button for Signed-in Users */}
              {user && (
                <button
                  id="header-orders-btn"
                  onClick={onOpenOrders}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 transition-colors cursor-pointer"
                  title={currentLang === 'hi' ? 'मेरे ऑर्डर्स व डाउनलोड' : 'My Orders & Downloads'}
                >
                  <PackageCheck size={14} />
                  <span className="hidden sm:inline">
                    {currentLang === 'hi' ? 'मेरे ऑर्डर्स' : 'My Orders'}
                  </span>
                </button>
              )}

              {/* User Account / Log Out Dropdown (Matches user reference) */}
              {user ? (
                <UserMenuDropdown
                  user={user}
                  onSignOut={onSignOut}
                  onGoToMarket={() => {
                    if (onLogoClick) onLogoClick();
                    const el = document.getElementById('catalog');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  onOpenOrders={onOpenOrders}
                  currentLang={currentLang}
                />
              ) : (
                <button
                  id="header-signin-btn"
                  onClick={onOpenSignIn}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800 transition-colors cursor-pointer"
                  title={currentLang === 'hi' ? 'साइन इन' : 'Sign in'}
                >
                  <User className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                  <span className="max-w-[90px] truncate">
                    {currentLang === 'hi' ? 'साइन इन' : 'Sign in'}
                  </span>
                </button>
              )}

              {/* Flat ₹49 badge indicator */}
              <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-bold">
                <span>{t.flatPriceBadge || 'Flat ₹49 / PDF'}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Mobile Slide-out Drawer Menu (Accessible via ≡) ────────────────── */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 left-0 w-[285px] max-w-[85vw] bg-white shadow-2xl flex flex-col justify-between z-50 animate-in slide-in-from-left duration-200">
            <div>
              {/* Drawer Top Bar */}
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-200/90">
                <div className="flex items-center gap-2">
                  <img src="/logo-icon.png" alt="STAX Logo" className="w-7 h-7 object-contain" />
                  <span className="text-lg font-black tracking-tight text-slate-950 font-sans">
                    STAX<span className="text-[#1E40AF]">.</span>
                  </span>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1 rounded-md text-slate-500 hover:text-black hover:bg-slate-100 transition-colors cursor-pointer"
                  aria-label="Close navigation menu"
                >
                  <X size={20} />
                </button>
              </div>

              {/* User Account / Sign In section */}
              <div className="p-3 border-b border-slate-100 bg-slate-50/50">
                {user ? (
                  <div className="bg-[#12161f] border border-slate-700/80 rounded-2xl shadow-sm p-2.5">
                    {/* Top User Card with vibrant blue border matching uploaded reference */}
                    <div className="rounded-xl border-2 border-blue-500 bg-[#181d27] px-3.5 py-2.5 mb-2 shadow-xs">
                      <div className="font-bold text-white text-sm leading-snug truncate">
                        {user.name || user.email?.split('@')[0] || 'Suthar Hostel'}
                      </div>
                      <div className="text-xs text-slate-300 font-normal leading-tight truncate mt-0.5">
                        {user.email || 'hostelsuthar@gmail.com'}
                      </div>
                    </div>

                    {/* Menu Action Items */}
                    <div className="space-y-0.5">
                      <button
                        onClick={() => {
                          setIsDrawerOpen(false);
                          if (onLogoClick) onLogoClick();
                          const el = document.getElementById('catalog');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="w-full text-left px-3 py-2 text-sm font-semibold text-slate-200 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors cursor-pointer"
                      >
                        Market
                      </button>

                      {onOpenOrders && (
                        <button
                          onClick={() => {
                            setIsDrawerOpen(false);
                            onOpenOrders();
                          }}
                          className="w-full text-left px-3 py-2 text-sm font-semibold text-slate-200 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors cursor-pointer"
                        >
                          {currentLang === 'hi' ? 'मेरे ऑर्डर्स' : 'My Orders'}
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setIsDrawerOpen(false);
                          if (onSignOut) onSignOut();
                        }}
                        className="w-full text-left px-3 py-2 text-sm font-semibold text-slate-200 hover:text-white hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                      >
                        Log Out
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setIsDrawerOpen(false);
                      onOpenSignIn();
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-3 rounded-lg text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    <User size={15} />
                    <span>{currentLang === 'hi' ? 'साइन इन करें' : 'Sign in to STAX'}</span>
                  </button>
                )}
              </div>

              {/* Navigation Links */}
              <div className="p-3 space-y-1">
                {/* Language Switcher */}
                <div className="px-2 py-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    {t.preferredLangTitle || 'Preferred Language'}
                  </p>
                  <div className="flex items-center gap-2">
                    {AVAILABLE_LANGUAGES.map((lang) => {
                      const isSelected = currentLang === lang.code;
                      return (
                        <button
                          key={lang.code}
                          onClick={() => {
                            onSelectLang(lang.code);
                          }}
                          className={`flex-1 py-1.5 px-2.5 rounded-md text-xs font-bold transition-all border cursor-pointer ${
                            isSelected
                              ? 'bg-slate-950 text-white border-slate-950 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {lang.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="h-[1px] bg-slate-100 my-1" />

                {/* Shopping Cart */}
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    onOpenCart();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-black transition-colors text-xs font-semibold cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <ShoppingBag size={17} className="text-slate-500" />
                    <span>{t.cartTitle || 'Cart'}</span>
                  </div>
                  {cartCount > 0 && (
                    <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {cartCount}
                    </span>
                  )}
                </button>

                {/* Saved Books / Wishlist */}
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    const el = document.getElementById('catalog');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-black transition-colors text-xs font-semibold cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Bookmark size={17} className="text-slate-500" />
                    <span>{t.bookmarksTitle || 'Saved Books'}</span>
                  </div>
                  {wishlistCount > 0 && (
                    <span className="bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {wishlistCount}
                    </span>
                  )}
                </button>

                {/* My Orders / Purchases */}
                {user && (
                  <button
                    onClick={() => {
                      setIsDrawerOpen(false);
                      if (onOpenOrders) onOpenOrders();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-blue-700 bg-blue-50/70 hover:bg-blue-100 transition-colors text-xs font-semibold cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <PackageCheck size={17} className="text-blue-600" />
                      <span>{currentLang === 'hi' ? 'मेरे ऑर्डर्स व डाउनलोड' : 'My Orders & Purchases'}</span>
                    </div>
                    <span className="text-[10px] font-bold bg-blue-200/80 text-blue-900 px-2 py-0.5 rounded-full">
                      Firestore
                    </span>
                  </button>
                )}

                <div className="h-[1px] bg-slate-100 my-1" />

                {/* Categories */}
                <div className="px-2 pt-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    {currentLang === 'hi' ? 'श्रेणियां' : 'Categories'}
                  </p>
                  <div className="space-y-0.5 max-h-[220px] overflow-y-auto">
                    {CATEGORIES.map((cat) => {
                      const label = currentLang === 'en' ? cat.en : cat.hi;
                      const isSelected = activeCategoryKey === cat.key;
                      return (
                        <button
                          key={cat.key}
                          onClick={() => {
                            if (onSelectCategory) onSelectCategory(cat.key);
                            setIsDrawerOpen(false);
                            const el = document.getElementById('catalog');
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-50 text-indigo-700 font-bold'
                              : 'text-slate-600 hover:text-black hover:bg-slate-50'
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Bottom Promo */}
            <div className="p-4 border-t border-slate-100 text-center">
              <div className="inline-block px-3 py-1 rounded bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold mb-2">
                {t.flatPriceBadge || 'Flat ₹49 / Instant PDF'}
              </div>
              <p className="text-[10px] text-slate-400">
                &copy; {new Date().getFullYear()} STAX E-Books · All rights reserved.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ─── Document Card (exact style of user's image) ──────────────────────────────

const DocumentCard = ({
  book,
  onOpenModal,
  wishlist,
  onToggleWishlist,
  onAddToCart,
  currentLang,
  t,
  className = ''
}) => {
  const isWishlisted = wishlist.has(book.id);

  // In English mode, show English title and English author
  const displayTitle = currentLang === 'en' ? (book.titleEn || book.shortTitle || book.title) : book.title;
  const displayAuthor = currentLang === 'en' ? (book.authorEn || book.author) : book.author;

  const addedByText = currentLang === 'en'
    ? (book.addedBy ? book.addedBy.replace(book.author, displayAuthor) : `Added by ${displayAuthor.split(' ')[0]}...`)
    : (book.addedBy ? book.addedBy.replace('Added by', t.addedByPrefix || 'अपलोडर') : `${t.addedByPrefix || 'अपलोडर'} ${book.author.split(' ')[0]}...`);

  const viewsText = book.views || `${book.reviews || 85}K ${t.viewsSuffix || 'views'}`;

  const discountPercent = book.originalPrice && book.originalPrice > book.price
    ? Math.round(((book.originalPrice - book.price) / book.originalPrice) * 100)
    : null;

  return (
    <article
      onClick={() => onOpenModal(book)}
      className={`bg-white rounded-lg border border-slate-200/90 p-2.5 sm:p-3 flex flex-col justify-between cursor-pointer hover:shadow-md transition-shadow active:scale-[0.99] select-none group h-full ${className}`}
      role="button"
      tabIndex={0}
      aria-label={`View ${displayTitle}`}
      onKeyDown={(e) => e.key === 'Enter' && onOpenModal(book)}
    >
      {/* Cover Image Frame with PDF Badge & Price Pill */}
      <div className="relative aspect-[3/4.2] w-full rounded border border-slate-200/80 overflow-hidden mb-2.5 bg-slate-50 flex items-center justify-center shadow-2xs">
        {/* Solid Black PDF Badge */}
        <span className="absolute top-1.5 left-1.5 z-10 bg-neutral-900/95 text-white text-[9px] font-black tracking-wider px-1.5 py-0.5 rounded leading-none shadow-xs uppercase">
          PDF
        </span>

        {/* Optional Top Seller Flame Icon */}
        {book.isTopSeller && (
          <span className="absolute top-1.5 right-1.5 z-10 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded leading-none shadow-xs flex items-center gap-0.5">
            <Flame size={9} className="fill-white" />
          </span>
        )}

        {/* Floating Price Tag on Cover */}
        <span className="absolute bottom-1.5 right-1.5 z-10 bg-slate-950/85 backdrop-blur-xs text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow-xs tracking-tight">
          ₹{book.price}
        </span>

        <img
          src={book.coverImage || book.coverUrl}
          alt={displayTitle}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>

      {/* Book Title & Uploader info */}
      <div className="flex-1 flex flex-col">
        <h3
          className="font-bold text-slate-900 text-xs sm:text-[13px] leading-snug line-clamp-2 min-h-[34px] sm:min-h-[36px] mb-0.5 group-hover:text-indigo-600 transition-colors"
          title={displayTitle}
        >
          {displayTitle}
        </h3>
        <p className="text-[11px] text-slate-500 truncate mb-1">
          {addedByText}
        </p>

        {/* Price Row: Current Price + Strikethrough Original + Discount */}
        <div className="flex items-center gap-1.5 mt-auto pt-1 mb-2">
          <span className="font-black text-slate-950 text-sm sm:text-[15px] tracking-tight">
            ₹{book.price}
          </span>
          {book.originalPrice && book.originalPrice > book.price && (
            <span className="text-[11px] text-slate-400 line-through font-normal">
              ₹{book.originalPrice}
            </span>
          )}
          {discountPercent && (
            <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60 ml-auto">
              {discountPercent}% {currentLang === 'hi' ? 'छूट' : 'OFF'}
            </span>
          )}
        </div>
      </div>

      {/* Card Footer: Views, Quick Add to Cart & Bookmark */}
      <div className="mt-auto pt-1.5 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100">
        <span className="font-medium text-slate-600">
          {viewsText}
        </span>
        <div className="flex items-center gap-0.5">
          {onAddToCart && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(book);
              }}
              className="p-1 rounded hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
              aria-label={t.addToCartBtn || 'Add to Cart'}
              title={t.addToCartBtn || 'Add to Cart'}
            >
              <ShoppingBag size={14} />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(book.id);
            }}
            className="p-1 -mr-1 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
            aria-label={isWishlisted ? (t.bookmarkedTooltip || 'Bookmarked') : (t.bookmarkTooltip || 'Bookmark')}
            title={isWishlisted ? (t.bookmarkedTooltip || 'Bookmarked') : (t.bookmarkTooltip || 'Bookmark')}
          >
            <Bookmark
              size={14}
              className={isWishlisted ? 'fill-slate-900 text-slate-900' : 'text-slate-400'}
            />
          </button>
        </div>
      </div>
    </article>
  );
};

// ─── Horizontal Document Carousel Row ─────────────────────────────────────────

const DocumentCarouselRow = ({ title, books, onOpenModal, wishlist, onToggleWishlist, onAddToCart, currentLang, t }) => {
  const rowRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (rowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [books]);

  const scroll = (direction) => {
    if (rowRef.current) {
      const offset = direction === 'left' ? -380 : 380;
      rowRef.current.scrollBy({ left: offset, behavior: 'smooth' });
      setTimeout(checkScroll, 350);
    }
  };

  return (
    <section className="mb-8 sm:mb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-3">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-950 tracking-tight">
          {title}
        </h2>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative group">
        {/* Left Arrow Button */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-1 sm:left-2 top-[42%] -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white shadow-md border border-slate-200/90 flex items-center justify-center text-slate-700 hover:bg-slate-50 active:scale-95 transition-all z-20 cursor-pointer"
            aria-label={`Scroll ${title} left`}
          >
            <ChevronLeft size={18} />
          </button>
        )}

        {/* Carousel Container */}
        <div
          ref={rowRef}
          onScroll={checkScroll}
          className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 hide-scrollbar snap-x scroll-smooth"
        >
          {books.map((book) => (
            <div key={book.id} className="snap-start flex-shrink-0 w-[148px] sm:w-[168px] lg:w-[185px]">
              <DocumentCard
                book={book}
                onOpenModal={onOpenModal}
                wishlist={wishlist}
                onToggleWishlist={onToggleWishlist}
                onAddToCart={onAddToCart}
                currentLang={currentLang}
                t={t}
              />
            </div>
          ))}
        </div>

        {/* Right Arrow Button */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-1 sm:right-2 top-[42%] -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white shadow-md border border-slate-200/90 flex items-center justify-center text-slate-700 hover:bg-slate-50 active:scale-95 transition-all z-20 cursor-pointer"
            aria-label={`Scroll ${title} right`}
          >
            <ChevronRight size={18} />
          </button>
        )}
      </div>
    </section>
  );
};

// ─── Footer ───────────────────────────────────────────────────────────────────

const Footer = ({ currentLang, t }) => {
  const f = t.footer || {};

  return (
    <footer className="bg-slate-950 text-slate-300 py-14 px-6 border-t border-slate-900 mt-16" id="about">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="col-span-1">
          <div
            className="flex items-center gap-2.5 mb-4 cursor-pointer group"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="w-9 h-9 rounded-xl bg-white/10 p-1 flex items-center justify-center backdrop-blur-xs border border-white/10 group-hover:bg-white/15 transition-colors">
              <img src="/logo-icon.png" alt="STAX Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-black text-xl tracking-tight text-white font-sans">
              STAX<span className="text-blue-500">.</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            {f.tagline || 'हिन्दी साहित्य और कालजयी उपन्यासों का डिजिटल संग्रह।'}
          </p>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4 text-xs uppercase tracking-wider">
            {f.categoriesHead || 'Top Categories'}
          </h4>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-400">
            <li><a href="#catalog" className="hover:text-indigo-400 transition-colors">{currentLang === 'hi' ? 'शायरी व काव्य' : 'Poetry & Shayari'}</a></li>
            <li><a href="#catalog" className="hover:text-indigo-400 transition-colors">{currentLang === 'hi' ? 'क्लासिक उपन्यास' : 'Classic Novels'}</a></li>
            <li><a href="#catalog" className="hover:text-indigo-400 transition-colors">{currentLang === 'hi' ? 'प्रेम और विरह' : 'Love & Separation'}</a></li>
            <li><a href="#catalog" className="hover:text-indigo-400 transition-colors">{currentLang === 'hi' ? 'सामाजिक यथार्थ' : 'Social Realism'}</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4 text-xs uppercase tracking-wider">
            {f.authorsHead || 'Featured Authors'}
          </h4>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-400">
            <li><span className="hover:text-indigo-400 transition-colors">{currentLang === 'hi' ? 'जौन एलिया' : 'Jaun Elia'}</span></li>
            <li><span className="hover:text-indigo-400 transition-colors">{currentLang === 'hi' ? 'धर्मवीर भारती' : 'Dharmaveer Bharati'}</span></li>
            <li><span className="hover:text-indigo-400 transition-colors">{currentLang === 'hi' ? 'मुंशी प्रेमचंद' : 'Munshi Premchand'}</span></li>
            <li><span className="hover:text-indigo-400 transition-colors">{currentLang === 'hi' ? 'विनोद कुमार शुक्ल' : 'Vinod Kumar Shukla'}</span></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4 text-xs uppercase tracking-wider">
            {f.libraryHead || 'Digital Library'}
          </h4>
          <p className="text-xs sm:text-sm text-slate-400 mb-3">
            {f.libraryText || 'All e-books available for instant digital download in high-resolution PDF format.'}
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-amber-400 font-semibold">
            <span>{f.securedPayment || 'Flat ₹49 · 100% Secure Checkout'}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-slate-900 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} {f.copyright || 'STAX E-Books. All rights reserved.'}
      </div>
    </footer>
  );
};

// ─── Main App Root ────────────────────────────────────────────────────────────

export default function App() {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('stax_cart');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return [];
  });
  const [isCartPage, setIsCartPage] = useState(false);
  const cartCount = cartItems.length;
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('stax_wishlist');
      if (saved) return new Set(JSON.parse(saved));
    } catch (_) {}
    return new Set();
  });
  const [purchasedBooks, setPurchasedBooks] = useState(new Set());
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryKey, setActiveCategoryKey] = useState('all');
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const pendingBookToAddRef = useRef(null);
  const pendingOpenCartRef = useRef(false);
  const authInitializedRef = useRef(false);

  // Language state: 'en' or 'hi' (persisted in localStorage, default is 'en' or saved)
  const [currentLang, setCurrentLang] = useState(() => {
    try {
      return localStorage.getItem('stax_preferred_lang') || 'en';
    } catch {
      return 'en';
    }
  });

  // Current translation dictionary
  const t = useMemo(() => {
    return TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  }, [currentLang]);

  // No-op for deleted toasts
  const addToast = useCallback(() => {}, []);

  // Scroll listener for sticky shadow
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sync document title and HTML lang
  useEffect(() => {
    document.title = t.docTitle || (currentLang === 'hi' ? 'STAX — हिन्दी साहित्य एवं उपन्यास डिजिटल संग्रह' : 'STAX — Hindi Literature & Classic Novels Digital Library');
    document.documentElement.lang = currentLang;
  }, [currentLang, t]);

  // Subscribe to Firebase Auth and auto-sync user data to Firebase Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      authInitializedRef.current = true;
      if (user) {
        setIsSignInOpen(false);
        try {
          await saveUserToDatabase(user);
          // Load user's cloud-persisted data from Cloud Firestore
          const dbUser = await getUserFromDatabase(user.uid);
          if (dbUser) {
            // Restore or merge Cart from Firestore
            if (Array.isArray(dbUser.cart) && dbUser.cart.length > 0) {
              setCartItems(dbUser.cart);
              try {
                localStorage.setItem('stax_cart', JSON.stringify(dbUser.cart));
              } catch (_) {}
            } else if (cartItems.length > 0) {
              // Sync current cart to user's Firestore doc
              syncUserCartToDatabase(user.uid, cartItems);
            }

            // Restore or merge Wishlist from Firestore
            if (Array.isArray(dbUser.wishlist) && dbUser.wishlist.length > 0) {
              setWishlist((prev) => {
                const combined = new Set([...prev, ...dbUser.wishlist]);
                try {
                  localStorage.setItem('stax_wishlist', JSON.stringify(Array.from(combined)));
                } catch (_) {}
                syncUserWishlistToDatabase(user.uid, Array.from(combined));
                return combined;
              });
            }

            // Restore Purchased Books list
            if (Array.isArray(dbUser.purchasedBooks)) {
              setPurchasedBooks(new Set(dbUser.purchasedBooks));
            }
          }
        } catch (e) {
          console.warn('[Firebase DB] Auth state change save error:', e);
        }
        setCurrentUser({
          uid: user.uid,
          email: user.email,
          name: user.displayName || user.email?.split('@')[0],
          photoURL: user.photoURL,
        });
      } else {
        setCurrentUser(null);
        if (window.location.hash === '#cart') {
          setIsCartPage(false);
          pendingOpenCartRef.current = true;
          setIsSignInOpen(true);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setIsCartPage(false);
      if (window.location.hash === '#cart') {
        window.history.pushState(null, '', window.location.pathname + window.location.search);
      }
      addToast(currentLang === 'hi' ? 'आप सफलतापूर्वक लॉगआउट हो गए हैं।' : 'Signed out successfully.', 'info');
    } catch (err) {
      console.warn('Sign out error:', err);
      setCurrentUser(null);
    }
  }, [addToast, currentLang]);

  // Language change handler
  const handleSelectLang = useCallback((langCode) => {
    setCurrentLang(langCode);
    try {
      localStorage.setItem('stax_preferred_lang', langCode);
    } catch (err) {
      // Ignore localStorage errors
    }
    const targetT = TRANSLATIONS[langCode] || TRANSLATIONS.en;
    addToast(targetT.langSwitchedToast, 'success');
  }, [addToast]);

  const handleOpenCart = useCallback(() => {
    if (!currentUser) {
      pendingOpenCartRef.current = true;
      setIsSignInOpen(true);
      addToast(
        t.cartSignInPrompt || (currentLang === 'hi'
          ? 'अपनी शॉपिंग कार्ट देखने के लिए कृपया पहले साइन इन करें।'
          : 'Please sign in to access your shopping cart.'),
        'info'
      );
      return;
    }
    setIsCartPage(true);
    setSelectedBook(null);
    window.location.hash = '#cart';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentUser, addToast, currentLang, t]);

  // Add to cart with Firestore persistence (Sign-in required)
  const handleAddToCart = useCallback((book) => {
    if (!currentUser) {
      pendingBookToAddRef.current = book;
      setIsSignInOpen(true);
      addToast(
        currentLang === 'hi'
          ? 'कार्ट में किताब जोड़ने के लिए कृपया पहले साइन इन करें।'
          : 'Please sign in to add books to your cart.',
        'info'
      );
      return;
    }

    setCartItems((prev) => {
      if (prev.some((item) => item.id === book.id)) return prev;
      const nextCart = [...prev, book];
      try {
        localStorage.setItem('stax_cart', JSON.stringify(nextCart));
      } catch (_) {}
      if (currentUser?.uid) {
        syncUserCartToDatabase(currentUser.uid, nextCart);
      }
      return nextCart;
    });
    handleOpenCart();
    const bookTitle = currentLang === 'en' ? (book.titleEn || book.shortTitle || book.title) : book.title;
    addToast(`"${bookTitle}" ${t.cartAddedToast || 'added to cart!'} (₹${book.price})`, 'cart');
  }, [currentUser, handleOpenCart, addToast, currentLang, t]);

  // Remove from cart with Firestore persistence
  const handleRemoveFromCart = useCallback((id) => {
    setCartItems((prev) => {
      const nextCart = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem('stax_cart', JSON.stringify(nextCart));
      } catch (_) {}
      if (currentUser?.uid) {
        syncUserCartToDatabase(currentUser.uid, nextCart);
      }
      return nextCart;
    });
    addToast(currentLang === 'hi' ? 'किताब कार्ट से हटा दी गई।' : 'Book removed from cart.', 'info');
  }, [currentUser, currentLang, addToast]);

  // Clear cart with Firestore persistence
  const handleClearCart = useCallback(() => {
    setCartItems([]);
    try {
      localStorage.removeItem('stax_cart');
    } catch (_) {}
    if (currentUser?.uid) {
      syncUserCartToDatabase(currentUser.uid, []);
    }
    addToast(currentLang === 'hi' ? 'कार्ट खाली कर दिया गया।' : 'Cart cleared.', 'info');
  }, [currentUser, currentLang, addToast]);

  // Immediate Pay via UPI QR (Sign-in required)
  const handlePayNow = useCallback((book) => {
    if (!currentUser) {
      pendingBookToAddRef.current = book;
      setIsSignInOpen(true);
      addToast(
        currentLang === 'hi'
          ? 'खरीदारी करने के लिए कृपया पहले साइन इन करें।'
          : 'Please sign in before proceeding to purchase.',
        'info'
      );
      return;
    }

    setCartItems((prev) => {
      if (prev.some((item) => item.id === book.id)) return prev;
      const nextCart = [book, ...prev];
      try {
        localStorage.setItem('stax_cart', JSON.stringify(nextCart));
      } catch (_) {}
      if (currentUser?.uid) {
        syncUserCartToDatabase(currentUser.uid, nextCart);
      }
      return nextCart;
    });
    handleOpenCart();
    const bookTitle = currentLang === 'en' ? (book.titleEn || book.shortTitle || book.title) : book.title;
    addToast(
      currentLang === 'hi'
        ? `"${bookTitle}" के लिए UPI QR चेकआउट लोड हो गया है।`
        : `UPI QR checkout loaded for "${bookTitle}".`,
      'info'
    );
  }, [currentUser, handleOpenCart, currentLang, addToast]);

  // Wishlist toggle with Firestore persistence
  const handleToggleWishlist = useCallback((bookId) => {
    const book = EBOOKS.find((b) => b.id === bookId);
    const bookTitle = book ? (currentLang === 'en' ? (book.titleEn || book.shortTitle || book.title) : book.title) : '';

    setWishlist((prev) => {
      const next = new Set(prev);
      if (next.has(bookId)) {
        next.delete(bookId);
        addToast(`"${bookTitle}" ${t.wishlistRemovedToast || 'removed from bookmarks'}`, 'wishlist_remove');
      } else {
        next.add(bookId);
        addToast(`"${bookTitle}" ${t.wishlistAddedToast || 'saved to bookmarks ♥'}`, 'wishlist_add');
      }
      try {
        localStorage.setItem('stax_wishlist', JSON.stringify(Array.from(next)));
      } catch (_) {}
      if (currentUser?.uid) {
        syncUserWishlistToDatabase(currentUser.uid, Array.from(next));
      }
      return next;
    });
  }, [addToast, currentLang, t, currentUser]);

  const handleOpenBook = useCallback((book) => {
    setSelectedBook(book);
    setIsCartPage(false);
    window.location.hash = `book-${book.id}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleBackToHome = useCallback(() => {
    setSelectedBook(null);
    setIsCartPage(false);
    if (window.location.hash.startsWith('#book-') || window.location.hash === '#cart') {
      window.history.pushState(null, '', window.location.pathname + window.location.search);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Deep linking and browser back/forward buttons
  useEffect(() => {
    const syncFromHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#book-')) {
        const bookId = hash.replace('#book-', '');
        const found = EBOOKS.find((b) => String(b.id) === bookId);
        if (found) {
          setSelectedBook(found);
          setIsCartPage(false);
          return;
        }
      } else if (hash === '#cart') {
        if (!currentUser && authInitializedRef.current) {
          setIsCartPage(false);
          pendingOpenCartRef.current = true;
          setIsSignInOpen(true);
          return;
        }
        setIsCartPage(true);
        setSelectedBook(null);
        return;
      } else if (!hash || hash === '#' || hash === '#catalog' || hash === '#about') {
        setSelectedBook(null);
        setIsCartPage(false);
      }
    };

    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  // 1. Row: Documents recommended for you (exact match to user's screenshot)
  const recommendedBooks = useMemo(() => {
    const order = ['jaun-1', 'gunahon-1', 'godaan-1', 'deewar-1', 10, 6, 2, 1, 3, 5, 4, 7, 8, 9];
    return order
      .map((id) => EBOOKS.find((b) => b.id === id))
      .filter(Boolean);
  }, []);

  // 2. Row: Similar To Jaun Elia
  const similarToJaunBooks = useMemo(() => {
    const order = ['gunahon-1', 'jaun-1', 'godaan-1', 1, 3, 7];
    return order
      .map((id) => EBOOKS.find((b) => b.id === id))
      .filter(Boolean);
  }, []);

  // 3. Row: Similar To Gunahon Ka Devta (Hindi) - Dharmaveer Bharti
  const similarToGunahonBooks = useMemo(() => {
    const order = ['godaan-1', 10, 'deewar-1', 4, 6, 5, 8, 9, 2];
    return order
      .map((id) => EBOOKS.find((b) => b.id === id))
      .filter(Boolean);
  }, []);

  // Search filtered books
  const filteredSearchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return EBOOKS.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        (b.titleEn && b.titleEn.toLowerCase().includes(q)) ||
        (b.shortTitle && b.shortTitle.toLowerCase().includes(q)) ||
        b.author.toLowerCase().includes(q) ||
        (b.authorEn && b.authorEn.toLowerCase().includes(q)) ||
        (b.theme && b.theme.toLowerCase().includes(q)) ||
        (b.themeEn && b.themeEn.toLowerCase().includes(q)) ||
        (b.tags && b.tags.some((tag) => tag.toLowerCase().includes(q)))
    );
  }, [searchQuery]);

  // Active category raw string for filtering
  const activeCategoryObj = useMemo(() => {
    return CATEGORIES.find((c) => c.key === activeCategoryKey) || CATEGORIES[0];
  }, [activeCategoryKey]);

  // Catalog filtered by category
  const filteredCatalogBooks = useMemo(() => {
    return EBOOKS.filter((book) => {
      return activeCategoryObj.key === 'all' || book.category === activeCategoryObj.raw;
    });
  }, [activeCategoryObj]);

  return (
    <div className="min-h-screen bg-[#fafbfc] font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">

      {/* Header with Language Selector Dropdown */}
      <Header
        cartCount={cartCount}
        isScrolled={isScrolled}
        wishlistCount={wishlist.size}
        searchQuery={searchQuery}
        setSearchQuery={(q) => {
          setSearchQuery(q);
          if (selectedBook && q) {
            handleBackToHome();
          }
        }}
        onOpenCart={handleOpenCart}
        onOpenOrders={() => setIsOrdersOpen(true)}
        onLogoClick={handleBackToHome}
        currentLang={currentLang}
        onSelectLang={handleSelectLang}
        t={t}
        onOpenSignIn={() => setIsSignInOpen(true)}
        onSignOut={handleSignOut}
        user={currentUser}
        activeCategoryKey={activeCategoryKey}
        onSelectCategory={setActiveCategoryKey}
      />

      {/* Authentication Modal (Split-Screen UI matching reference image) */}
      <SignInModal
        isOpen={isSignInOpen && !currentUser}
        onClose={() => {
          setIsSignInOpen(false);
          pendingBookToAddRef.current = null;
          pendingOpenCartRef.current = false;
        }}
        onLoginSuccess={(u) => {
          setCurrentUser(u);
          setIsSignInOpen(false);
          addToast(currentLang === 'hi' ? `स्वागत है, ${u.name || u.email}!` : `Welcome back, ${u.name || u.email}!`, 'success');
          if (pendingBookToAddRef.current) {
            const pendingBook = pendingBookToAddRef.current;
            pendingBookToAddRef.current = null;
            pendingOpenCartRef.current = false;
            setCartItems((prev) => {
              if (prev.some((item) => item.id === pendingBook.id)) return prev;
              const nextCart = [...prev, pendingBook];
              try {
                localStorage.setItem('stax_cart', JSON.stringify(nextCart));
              } catch (_) {}
              if (u?.uid) {
                syncUserCartToDatabase(u.uid, nextCart);
              }
              return nextCart;
            });
            setIsCartPage(true);
            setSelectedBook(null);
            window.location.hash = '#cart';
            window.scrollTo({ top: 0, behavior: 'smooth' });
            const bookTitle = currentLang === 'en' ? (pendingBook.titleEn || pendingBook.shortTitle || pendingBook.title) : pendingBook.title;
            addToast(`"${bookTitle}" ${t.cartAddedToast || 'added to cart!'} (₹${pendingBook.price})`, 'cart');
          } else if (pendingOpenCartRef.current) {
            pendingOpenCartRef.current = false;
            setIsCartPage(true);
            setSelectedBook(null);
            window.location.hash = '#cart';
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        currentLang={currentLang}
        t={t}
      />

      {/* Orders & Purchases Modal (Powered by Cloud Firestore) */}
      <OrdersModal
        isOpen={isOrdersOpen}
        onClose={() => setIsOrdersOpen(false)}
        currentUser={currentUser}
        currentLang={currentLang}
        t={t}
        addToast={addToast}
        onOpenBook={handleOpenBook}
      />

      {/* Conditional View: Full Page Book Detail View vs. Full Page Cart View vs. Home Page */}
      {selectedBook ? (
        <main className="pt-14 sm:pt-16 pb-12">
          <BookDetailPage
            book={selectedBook}
            onBack={handleBackToHome}
            onAddToCart={handleAddToCart}
            onPayNow={handlePayNow}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
            onSelectBook={handleOpenBook}
            currentLang={currentLang}
            t={t}
          />
        </main>
      ) : isCartPage ? (
        <main className="pt-14 sm:pt-16 pb-12">
          <CartPage
            cartItems={cartItems}
            onRemoveItem={handleRemoveFromCart}
            onClearCart={handleClearCart}
            onBack={handleBackToHome}
            onOpenBook={handleOpenBook}
            currentLang={currentLang}
            t={t}
            addToast={addToast}
            currentUser={currentUser}
            onOpenSignIn={() => setIsSignInOpen(true)}
            onPaymentSuccess={(order, items) => {
              setPurchasedBooks((prev) => new Set([...prev, ...items.map((i) => i.id)]));
            }}
          />
        </main>
      ) : (
        <main className="pt-16 sm:pt-18 md:pt-20 pb-16">
          {/* Top Category Filter Pills Bar */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 hide-scrollbar">
              {CATEGORIES.map((cat) => {
                const label = currentLang === 'en' ? cat.en : cat.hi;
                const isSelected = activeCategoryKey === cat.key;
                return (
                  <button
                    key={cat.key}
                    onClick={() => {
                      setActiveCategoryKey(cat.key);
                      if (cat.key !== 'all') {
                        const el = document.getElementById('catalog');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* If Active Search Query -> Show Live Search Results Grid */}
          {searchQuery.trim() ? (
            <section className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-950 tracking-tight">
                  {t.searchResultTitle || 'Search results'}: "{searchQuery}" ({filteredSearchResults.length})
                </h2>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs font-semibold text-indigo-600 hover:underline cursor-pointer"
                >
                  {t.clearSearch || 'Clear search'}
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
                {filteredSearchResults.map((book) => (
                  <DocumentCard
                    key={book.id}
                    book={book}
                    onOpenModal={handleOpenBook}
                    wishlist={wishlist}
                    onToggleWishlist={handleToggleWishlist}
                    onAddToCart={handleAddToCart}
                    currentLang={currentLang}
                    t={t}
                  />
                ))}
              </div>

              {filteredSearchResults.length === 0 && (
                <div className="py-20 text-center bg-white rounded-2xl border border-slate-200/80 my-4">
                  <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-slate-700 mb-1">
                    {t.noBooksFound || 'No books found'}
                  </h3>
                  <p className="text-slate-500 text-sm mb-4">
                    {t.noBooksSub || 'Please try searching with another keyword or category.'}
                  </p>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-sm font-semibold text-indigo-600 hover:underline cursor-pointer"
                  >
                    {t.viewAllBooks || 'View all books'}
                  </button>
                </div>
              )}
            </section>
          ) : (
            <>
              {/* 1. Documents recommended for you */}
              <DocumentCarouselRow
                title={t.recommendedTitle || 'Documents recommended for you'}
                books={recommendedBooks}
                onOpenModal={handleOpenBook}
                wishlist={wishlist}
                onToggleWishlist={handleToggleWishlist}
                onAddToCart={handleAddToCart}
                currentLang={currentLang}
                t={t}
              />

              {/* 2. Similar To Jaun Elia */}
              <DocumentCarouselRow
                title={t.similarToJaunTitle || 'Similar To Jaun Elia'}
                books={similarToJaunBooks}
                onOpenModal={handleOpenBook}
                wishlist={wishlist}
                onToggleWishlist={handleToggleWishlist}
                onAddToCart={handleAddToCart}
                currentLang={currentLang}
                t={t}
              />

              {/* 3. Similar To Gunahon Ka Devta (Hindi) - Dharmaveer Bharti */}
              <DocumentCarouselRow
                title={t.similarToGunahonTitle || 'Similar To Gunahon Ka Devta (Hindi) - Dharmaveer Bharti'}
                books={similarToGunahonBooks}
                onOpenModal={handleOpenBook}
                wishlist={wishlist}
                onToggleWishlist={handleToggleWishlist}
                onAddToCart={handleAddToCart}
                currentLang={currentLang}
                t={t}
              />

              {/* 4. Full Catalog Grid (Filterable by Category) */}
              <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 sm:mt-12" id="catalog">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-950 tracking-tight">
                      {t.allEbooksTitle || 'All E-Books & Novels (Flat ₹49 each)'}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                      {filteredCatalogBooks.length} {t.allEbooksSub || 'timeless masterpieces · Instant PDF download'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
                  {filteredCatalogBooks.map((book) => (
                    <DocumentCard
                      key={book.id}
                      book={book}
                      onOpenModal={handleOpenBook}
                      wishlist={wishlist}
                      onToggleWishlist={handleToggleWishlist}
                      onAddToCart={handleAddToCart}
                      currentLang={currentLang}
                      t={t}
                    />
                  ))}
                </div>
              </section>
            </>
          )}
        </main>
      )}

      {/* Footer */}
      <Footer currentLang={currentLang} t={t} />
    </div>
  );
}
