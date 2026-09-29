import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Store, LogOut, PackageCheck } from 'lucide-react';

/**
 * User Account & Log Out Dropdown
 * Matches user's custom design with a blue-bordered account card, Market link, and Log Out button.
 */
export default function UserMenuDropdown({
  user,
  onSignOut,
  onGoToMarket,
  onOpenOrders,
  currentLang = 'en',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close when clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (!user) return null;

  const displayName = user.name || (user.email ? user.email.split('@')[0] : 'Suthar Hostel');
  const displayEmail = user.email || 'hostelsuthar@gmail.com';

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button: User Pill */}
      <button
        id="user-menu-trigger-btn"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full transition-all duration-150 cursor-pointer select-none border ${
          isOpen
            ? 'bg-slate-900 text-white border-blue-500 shadow-md ring-2 ring-blue-500/20'
            : 'bg-slate-100 hover:bg-slate-200/90 text-slate-800 border-slate-200 shadow-xs'
        }`}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={displayName}
            className="w-5 h-5 rounded-full object-cover border border-slate-300"
          />
        ) : (
          <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
            {displayName[0]?.toUpperCase() || 'U'}
          </div>
        )}
        <span className="max-w-[95px] truncate font-semibold text-xs leading-none">
          {displayName}
        </span>
        <ChevronDown
          size={13}
          className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-400' : ''}`}
        />
      </button>

      {/* Popover Dropdown matching user's screenshot exactly */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-60 sm:w-64 bg-[#12161f] border border-slate-700/80 rounded-2xl shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150 select-none"
          role="menu"
          aria-orientation="vertical"
        >
          {/* Top User Card with vibrant blue border matching uploaded reference */}
          <div className="rounded-xl border-2 border-blue-500 bg-[#181d27] px-3.5 py-2.5 mb-2 shadow-xs">
            <div className="font-bold text-white text-[13px] sm:text-sm leading-snug truncate">
              {displayName}
            </div>
            <div className="text-[11px] sm:text-xs text-slate-300 font-normal leading-tight truncate mt-0.5">
              {displayEmail}
            </div>
          </div>

          {/* Menu Action Items */}
          <div className="space-y-0.5">
            {/* Market */}
            <button
              id="user-menu-market-btn"
              onClick={() => {
                setIsOpen(false);
                if (onGoToMarket) onGoToMarket();
              }}
              className="w-full text-left px-3 py-2 text-sm font-semibold text-slate-200 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors cursor-pointer flex items-center justify-between"
              role="menuitem"
            >
              <span>Market</span>
            </button>

            {/* My Orders (if available) */}
            {onOpenOrders && (
              <button
                id="user-menu-orders-btn"
                onClick={() => {
                  setIsOpen(false);
                  onOpenOrders();
                }}
                className="w-full text-left px-3 py-2 text-sm font-semibold text-slate-200 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors cursor-pointer flex items-center justify-between"
                role="menuitem"
              >
                <span>{currentLang === 'hi' ? 'मेरे ऑर्डर्स' : 'My Orders'}</span>
              </button>
            )}

            {/* Log Out */}
            <button
              id="user-menu-logout-btn"
              onClick={() => {
                setIsOpen(false);
                if (onSignOut) onSignOut();
              }}
              className="w-full text-left px-3 py-2 text-sm font-semibold text-slate-200 hover:text-white hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer flex items-center justify-between"
              role="menuitem"
            >
              <span>Log Out</span>
            </button>
          </div>

          {/* Sub-footer Brand */}
          <div className="pt-2 mt-1.5 border-t border-slate-800/80 px-2.5 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <img src="/logo-icon.png" alt="STAX" className="w-3.5 h-3.5 object-contain" />
              <span>STAX Digital Archive</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
