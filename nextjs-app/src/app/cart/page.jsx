'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Trash2,
  QrCode,
  ArrowRight,
  ShieldCheck,
  Tag,
  Sparkles,
  BookOpen,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Info,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import QRScannerModal from '@/components/QRScannerModal';
import CheckoutPaymentModal from '@/components/CheckoutPaymentModal';

export default function CartCheckoutPage() {
  const {
    cartItems,
    removeFromCart,
    clearCart,
    subtotal,
    appliedDiscount,
    discountAmount,
    finalTotal,
    scanQRCode,
    toast,
  } = useCart();

  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [manualCode, setManualCode] = useState('');

  const handleManualPromoApply = (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    scanQRCode(manualCode);
    setManualCode('');
  };

  const handleScanSuccess = (decodedString) => {
    scanQRCode(decodedString);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 pb-20 pt-6 px-4 sm:px-6 lg:px-8">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-xl border text-xs sm:text-sm font-semibold flex items-center gap-3 animate-in slide-in-from-bottom duration-200 max-w-sm ${
            toast.type === 'success'
              ? 'bg-emerald-950 text-emerald-100 border-emerald-800'
              : 'bg-slate-900 text-white border-slate-700'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" />
          ) : (
            <Info size={18} className="text-blue-400 flex-shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
      />

      {/* UPI Checkout Payment Modal with Shankar Suthar QR */}
      <CheckoutPaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        finalTotal={finalTotal}
        cartItems={cartItems}
        onPaymentSuccess={() => {
          clearCart();
        }}
      />

      <div className="max-w-6xl mx-auto">
        {/* Navigation Breadcrumb / Back button */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Continue Shopping</span>
          </Link>

          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            STAX E-Books Checkout
          </span>
        </div>

        {/* Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight flex items-center gap-3">
              <span>Shopping Cart</span>
              <span className="text-sm font-bold bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Review your selected e-books and complete your instant digital purchase.
            </p>
          </div>
        </div>

        {/* Main Content: Split Layout (Cart Items + Order Summary) */}
        {cartItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* Left Column: Cart Items List (8 cols on lg) */}
            <div className="lg:col-span-8 space-y-3.5">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl p-3.5 sm:p-4 border transition-all shadow-xs flex items-center gap-3.5 sm:gap-4 ${
                    item.isSecretBook
                      ? 'border-amber-300 bg-amber-50/30'
                      : 'border-slate-200/90 hover:border-slate-300'
                  }`}
                >
                  {/* Book Cover Thumbnail */}
                  <div className="relative w-16 sm:w-20 aspect-[3/4.2] rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200/80 shadow-2xs">
                    <img
                      src={item.coverImage}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    {item.isSecretBook && (
                      <span className="absolute top-1 left-1 bg-amber-500 text-white text-[8px] font-black px-1 rounded uppercase tracking-wider">
                        VIP
                      </span>
                    )}
                  </div>

                  {/* Book Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {item.category || 'E-Book PDF'}
                      </span>
                      {item.isSecretBook && (
                        <span className="text-[10px] font-extrabold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                          QR Exclusive
                        </span>
                      )}
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate" title={item.title}>
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 truncate mb-2">{item.author}</p>

                    {/* Price and Format Tag */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm sm:text-base font-black text-slate-950 font-sans">
                        ₹{item.price}
                      </span>
                      {item.originalPrice && item.originalPrice > item.price && (
                        <span className="text-xs text-slate-400 line-through">
                          ₹{item.originalPrice}
                        </span>
                      )}
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                        Instant PDF
                      </span>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 sm:p-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer flex-shrink-0"
                    title={`Remove ${item.title}`}
                    aria-label={`Remove ${item.title}`}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}

              {/* Clear Cart Action */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={clearCart}
                  className="text-xs font-semibold text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  Clear all items
                </button>
              </div>
            </div>

            {/* Right Column: Order Summary (4 cols on lg, sticky) */}
            <div className="lg:col-span-4 lg:sticky lg:top-8 space-y-4">
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-5">
                <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
                  Order Summary
                </h2>

                {/* Subtotal & Discount Rows */}
                <div className="space-y-2.5 text-xs sm:text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal ({cartItems.length} items):</span>
                    <span className="font-bold text-slate-900 font-sans">₹{subtotal}</span>
                  </div>

                  {/* QR Discount Row if applied */}
                  {appliedDiscount && (
                    <div className="flex justify-between items-center text-emerald-700 bg-emerald-50/80 border border-emerald-200/80 p-2.5 rounded-xl animate-in fade-in">
                      <div className="flex items-center gap-1.5">
                        <Tag size={14} className="text-emerald-600 flex-shrink-0" />
                        <span className="font-bold text-xs">{appliedDiscount.label}</span>
                      </div>
                      <span className="font-black text-emerald-800 font-sans">-₹{discountAmount}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-600">
                    <span>Instant Digital Delivery:</span>
                    <span className="font-bold text-emerald-600">FREE</span>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                    <div>
                      <span className="text-sm font-bold text-slate-900">Total Price:</span>
                      <p className="text-[10px] text-slate-400">Inclusive of all digital taxes</p>
                    </div>
                    <span className="text-xl sm:text-2xl font-black text-blue-700 font-sans">
                      ₹{finalTotal}
                    </span>
                  </div>
                </div>

                {/* Manual Coupon or QR Code string input fallback */}
                <form onSubmit={handleManualPromoApply} className="pt-2">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Have a QR Code String / Coupon?
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                      placeholder="e.g. STAX20 or paste UPI string"
                      className="flex-1 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-600 transition-all placeholder:text-slate-400"
                    />
                    <button
                      type="submit"
                      className="bg-slate-900 hover:bg-black text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                </form>

                {/* Proceed to UPI Payment Button */}
                <button
                  id="nextjs-cart-pay-button"
                  onClick={() => setIsPaymentOpen(true)}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.99] text-white font-bold py-3.5 px-4 rounded-2xl text-sm shadow-md shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer select-none"
                >
                  <QrCode size={18} />
                  <span>Pay ₹{finalTotal} — Show UPI QR Code</span>
                  <ArrowRight size={16} />
                </button>

                {/* Trust Badges */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400">
                  <ShieldCheck size={14} className="text-emerald-500" />
                  <span>256-Bit Encrypted UPI Transfer · Instant PDF Delivery</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Empty Cart State */
          <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <ShoppingBag size={28} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-1">Your Cart is Empty</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Explore our rich library of Hindi classics, poetry, and literature to add books to your collection.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-5 rounded-xl shadow-xs transition-colors"
            >
              <BookOpen size={14} />
              <span>Browse Hindi E-Books</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
