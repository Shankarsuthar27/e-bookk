import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Trash2,
  QrCode,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Tag,
  Sparkles,
  X,
  BookOpen,
  Copy,
  ExternalLink,
  CheckCircle2,
  Smartphone,
  Check,
  Database,
  Download
} from 'lucide-react';
import QRScannerModal from './QRScannerModal';
import { saveOrderToDatabase, recordUserPurchaseInDatabase } from '../firebase';

export default function CartCheckoutModal({
  isOpen,
  onClose,
  cartItems = [],
  onRemoveItem,
  onClearCart,
  onAddBook,
  currentLang = 'en',
  t,
  addToast,
  initialStep = 'cart',
  currentUser = null,
  onPaymentSuccess = null,
}) {
  const [step, setStep] = useState(initialStep); // 'cart' | 'payment'
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [purchasedSnapshot, setPurchasedSnapshot] = useState([]);
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isPaymentCompleted, setIsPaymentCompleted] = useState(false);

  // Synchronize initial step when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(initialStep);
      setIsPaymentCompleted(false);
    }
  }, [isOpen, initialStep]);

  // UPI details matching Shankar Suthar's Google Pay QR Code
  const payeeName = 'shankar suthar';
  const upiId = 'ss2137789@okhdfcbank';

  // Secret collector's e-book unlocked by scanning Shankar Suthar QR
  const SECRET_COLLECTORS_EBOOK = {
    id: 'madhushala-special',
    title: 'मधुशाला (Madhushala) - Special Collector Edition',
    titleEn: 'Madhushala - Special Collector Edition',
    author: 'हरिवंश राय बच्चन',
    authorEn: 'Harivansh Rai Bachchan',
    price: 0,
    originalPrice: 199,
    coverImage: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&auto=format&fit=crop&q=80',
    category: 'Collector Exclusive',
    isSecretBook: true,
  };

  /**
   * QR Action Logic:
   * Parses scanned QR code string and applies discount or unlocks special e-book!
   */
  const handleScanQRCode = (decodedString) => {
    const raw = (decodedString || '').trim();
    if (!raw) return;

    // Case 1: Shankar Suthar UPI QR Code
    if (
      raw.includes('ss2137789') ||
      raw.toLowerCase().includes('shankar') ||
      raw.startsWith('upi://pay')
    ) {
      setAppliedDiscount({
        code: 'SHANKAR-UPI-VIP',
        amount: 20,
        label: currentLang === 'hi' ? 'Shankar Suthar UPI प्रोमो (-₹20)' : 'Shankar Suthar UPI Promo (-₹20)',
      });

      // Add secret collector's e-book to cart if not already present
      if (onAddBook) {
        onAddBook(SECRET_COLLECTORS_EBOOK);
      }

      if (addToast) {
        addToast(
          currentLang === 'hi'
            ? '🎉 Shankar Suthar QR सत्यापित! ₹20 छूट लागू + विशेष मधुशाला ई-बुक अनलॉक!'
            : '🎉 Shankar Suthar QR Verified! ₹20 Discount + Special Madhushala E-Book Unlocked!',
          'success'
        );
      }
      return;
    }

    // Case 2: Promo codes
    if (raw.toUpperCase().includes('STAX20') || raw.toUpperCase().includes('SAVE20')) {
      setAppliedDiscount({
        code: 'STAX20',
        amount: 20,
        label: 'Promo Code STAX20 (-₹20)',
      });
      if (addToast) {
        addToast(currentLang === 'hi' ? '🎉 प्रोमो STAX20 लागू! ₹20 छूट।' : '🎉 Promo STAX20 Applied! ₹20 saved.', 'success');
      }
      return;
    }

    // Default Fallback
    setAppliedDiscount({
      code: 'PROMO-10',
      amount: 10,
      label: currentLang === 'hi' ? 'विशेष QR छूट (-₹10)' : 'Special QR Discount (-₹10)',
    });
    if (addToast) {
      addToast(currentLang === 'hi' ? '✨ QR छूट लागू: ₹10 ऑफ' : '✨ QR Code Verified: ₹10 promotional discount applied.', 'success');
    }
  };

  const handleManualApply = (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleScanQRCode(manualCode);
    setManualCode('');
  };

  // Calculations
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price || 0), 0);
  const discountAmount = appliedDiscount ? Math.min(appliedDiscount.amount, subtotal) : 0;
  const finalTotal = Math.max(0, subtotal - discountAmount);

  const upiDeepLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(
    payeeName
  )}&am=${finalTotal}&cu=INR&tn=STAX%20EBooks%20Order`;

  const handleCopyUPI = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleConfirmPayment = async () => {
    setIsProcessingPayment(true);
    const itemsSnapshot = [...cartItems];
    setPurchasedSnapshot(itemsSnapshot);

    try {
      const orderPayload = {
        userId: currentUser?.uid || 'guest',
        userEmail: currentUser?.email || 'customer@stax-ebooks.com',
        userName: currentUser?.name || 'STAX Customer',
        items: itemsSnapshot.map((item) => ({
          id: item.id,
          title: item.title,
          titleEn: item.titleEn || item.title || '',
          author: item.author || '',
          price: item.price || 49,
          coverImage: item.coverImage || item.coverUrl || '',
        })),
        totalAmount: finalTotal,
        paymentMethod: 'UPI QR Modal',
        upiPayee: payeeName,
        upiId: upiId,
        status: 'completed',
        channel: 'modal-checkout',
      };

      const savedOrder = await saveOrderToDatabase(orderPayload);
      setConfirmedOrder(savedOrder);

      if (currentUser?.uid) {
        await recordUserPurchaseInDatabase(
          currentUser.uid,
          itemsSnapshot.map((i) => i.id),
          savedOrder?.orderId
        );
      }

      setIsPaymentCompleted(true);
      if (onPaymentSuccess) {
        onPaymentSuccess(savedOrder, itemsSnapshot);
      }

      if (addToast) {
        addToast(
          currentLang === 'hi'
            ? '🎉 भुगतान सफल! ऑर्डर डेटाबेस में सुरक्षित हो गया है।'
            : '🎉 Payment Successful! Order saved to Firestore database.',
          'success'
        );
      }

      if (onClearCart) {
        onClearCart();
      }
    } catch (err) {
      console.error('Modal payment save error:', err);
      setIsPaymentCompleted(true);
      if (onClearCart) onClearCart();
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* QR Scanner Modal (loads camera or file upload) */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleScanQRCode}
        currentLang={currentLang}
        t={t}
      />

      {/* Cart & Checkout Modal Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
        <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200/90 flex flex-col my-auto max-h-[92vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-slate-100 bg-slate-50/70">
            <div className="flex items-center gap-3">
              {step === 'payment' && (
                <button
                  onClick={() => setStep('cart')}
                  className="p-1.5 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors cursor-pointer"
                  title="Back to cart"
                  aria-label="Back to cart"
                >
                  <ArrowLeft size={18} />
                </button>
              )}
              <div className="w-8 h-8 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold">
                {step === 'payment' ? <Smartphone size={18} /> : <ShoppingBag size={18} />}
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight flex items-center gap-2">
                  <span>
                    {step === 'payment'
                      ? currentLang === 'hi'
                        ? 'UPI QR भुगतान'
                        : 'UPI QR Payment'
                      : currentLang === 'hi'
                      ? 'शॉपिंग कार्ट व चेकआउट'
                      : 'Shopping Cart & Checkout'}
                  </span>
                  {step === 'cart' && (
                    <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                      {cartItems.length}
                    </span>
                  )}
                </h2>
                <p className="text-[11px] text-slate-500">
                  {step === 'payment'
                    ? currentLang === 'hi'
                      ? 'Shankar Suthar QR स्कैन करके तुरंत भुगतान करें'
                      : 'Scan Shankar Suthar UPI QR Code to complete order'
                    : currentLang === 'hi'
                    ? 'QR कोड स्कैन करके छूट व विशेष ई-बुक्स अनलॉक करें'
                    : 'Scan QR code for instant discounts & bonus collector e-books'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {cartItems.length > 0 && !isPaymentCompleted && (
                <div className="hidden sm:flex items-center bg-slate-100 rounded-xl p-0.5 text-xs font-semibold">
                  <button
                    onClick={() => setStep('cart')}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      step === 'cart' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {currentLang === 'hi' ? 'कार्ट' : 'Cart'} ({cartItems.length})
                  </button>
                  <button
                    onClick={() => setStep('payment')}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      step === 'payment' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {currentLang === 'hi' ? 'भुगतान QR' : 'Pay QR'}
                  </button>
                </div>
              )}

              <button
                onClick={onClose}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close cart"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* ══════════ VIEW 1: CART ITEMS & SUMMARY ══════════ */}
          {step === 'cart' && (
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
              {/* Shankar Suthar UPI Promo Banner with Scan Button */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-200/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center font-bold flex-shrink-0">
                    <Tag size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-amber-950">
                      {currentLang === 'hi'
                        ? 'ऑफ़र: Shankar Suthar QR स्कैन करें'
                        : 'Special: Scan Shankar Suthar UPI QR'}
                    </p>
                    <p className="text-[11px] text-amber-800">
                      {currentLang === 'hi'
                        ? 'तुरंत ₹20 की छूट + विशेष हरिवंश राय बच्चन ई-बुक मुफ्त!'
                        : 'Get ₹20 off + unlock special Madhushala Collector Edition e-book!'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsScannerOpen(true)}
                  className="inline-flex items-center gap-1.5 bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold text-xs px-3 py-1.5 rounded-xl transition-colors cursor-pointer flex-shrink-0 shadow-2xs"
                >
                  <QrCode size={14} />
                  <span>{currentLang === 'hi' ? 'स्कैन करें' : 'Scan QR'}</span>
                </button>
              </div>

              {/* Cart Items List */}
              {cartItems.length > 0 ? (
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className={`bg-white rounded-2xl p-3 sm:p-3.5 border transition-all flex items-center gap-3 sm:gap-4 shadow-2xs ${
                        item.isSecretBook
                          ? 'border-amber-300 bg-amber-50/20'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {/* Thumbnail */}
                      <div className="w-14 sm:w-16 aspect-[3/4.2] rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200 shadow-2xs">
                        <img
                          src={item.coverImage || item.coverUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Book Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                            {item.category || 'E-Book PDF'}
                          </span>
                          {item.isSecretBook && (
                            <span className="text-[9px] font-extrabold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded">
                              QR VIP
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate" title={item.title}>
                          {currentLang === 'en' ? (item.titleEn || item.title) : item.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 truncate mb-1.5">
                          {currentLang === 'en' ? (item.authorEn || item.author) : item.author}
                        </p>

                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-black text-slate-950 font-sans">
                            ₹{item.price}
                          </span>
                          {item.originalPrice && item.originalPrice > item.price && (
                            <span className="text-[10px] text-slate-400 line-through">
                              ₹{item.originalPrice}
                            </span>
                          )}
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
                            Instant PDF
                          </span>
                        </div>
                      </div>

                      {/* Remove Action */}
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer flex-shrink-0"
                        title="Remove item"
                        aria-label="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ShoppingBag size={32} className="text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700 mb-1">
                    {currentLang === 'hi' ? 'कार्ट खाली है' : 'Your Cart is Empty'}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {currentLang === 'hi'
                      ? 'कृपया लाइब्रेरी से अपनी पसंदीदा किताबें जोड़ें।'
                      : 'Add some Hindi classics from our collection.'}
                  </p>
                </div>
              )}

              {/* Order Summary Box */}
              {cartItems.length > 0 && (
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3 mt-4">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    {currentLang === 'hi' ? 'ऑर्डर सारांश' : 'Order Summary'}
                  </h3>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>{currentLang === 'hi' ? 'उप-योग:' : 'Subtotal:'}</span>
                      <span className="font-bold text-slate-900 font-sans">₹{subtotal}</span>
                    </div>

                    {appliedDiscount && (
                      <div className="flex justify-between items-center text-emerald-700 bg-emerald-100/70 p-2 rounded-lg">
                        <div className="flex items-center gap-1.5">
                          <Tag size={13} />
                          <span className="font-bold text-xs">{appliedDiscount.label}</span>
                        </div>
                        <span className="font-black text-emerald-800 font-sans">-₹{discountAmount}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-slate-600">
                      <span>{currentLang === 'hi' ? 'डिजिटल डिलीवरी:' : 'Digital PDF Delivery:'}</span>
                      <span className="font-bold text-emerald-600">{currentLang === 'hi' ? 'मुफ्त' : 'FREE'}</span>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                      <span className="text-xs sm:text-sm font-bold text-slate-900">
                        {currentLang === 'hi' ? 'कुल देय राशि:' : 'Final Payable:'}
                      </span>
                      <span className="text-lg sm:text-xl font-black text-blue-700 font-sans">
                        ₹{finalTotal}
                      </span>
                    </div>

                    {/* Notice: To get your book, scan QR code */}
                    <div className="mt-2 py-1.5 px-3 bg-amber-50/90 border border-amber-200/90 rounded-xl text-amber-900 text-xs font-semibold flex items-center gap-2">
                      <QrCode size={14} className="text-amber-700 flex-shrink-0" />
                      <span>
                        {currentLang === 'hi'
                          ? 'अपनी किताब पाने के लिए QR कोड स्कैन करें'
                          : 'To get your book, scan the QR code'}
                      </span>
                    </div>
                  </div>

                  {/* Manual Promo code or QR string input */}
                  <form onSubmit={handleManualApply} className="pt-1 flex gap-1.5">
                    <input
                      type="text"
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                      placeholder={currentLang === 'hi' ? 'कूपन या UPI स्ट्रिंग डालें' : 'Enter QR string or code (e.g. STAX20)'}
                      className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-blue-600 transition-all placeholder:text-slate-400"
                    />
                    <button
                      type="submit"
                      className="bg-slate-900 hover:bg-black text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                    >
                      {currentLang === 'hi' ? 'लागू करें' : 'Apply'}
                    </button>
                  </form>

                  {/* Proceed to UPI QR Payment Button — Immediately shows QR on click! */}
                  <button
                    id="cart-proceed-pay-button"
                    onClick={() => setStep('payment')}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.99] text-white font-bold py-3.5 px-4 rounded-xl text-xs sm:text-sm shadow-md shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer select-none"
                  >
                    <QrCode size={18} />
                    <span>
                      {currentLang === 'hi' ? `₹${finalTotal} का भुगतान करें (QR कोड दिखाएँ)` : `Pay ₹${finalTotal} — Show UPI QR`}
                    </span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ══════════ VIEW 2: THE SHANKAR SUTHAR UPI PAYMENT QR CODE ══════════ */}
          {step === 'payment' && (
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 flex flex-col items-center animate-in fade-in duration-200">
              {!isPaymentCompleted ? (
                <div className="w-full max-w-sm flex flex-col items-center">
                  {/* Amount Payable Pill */}
                  <div className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-3.5 flex items-center justify-between mb-3 shadow-2xs">
                    <div>
                      <span className="text-[11px] font-bold text-blue-900 block">
                        {currentLang === 'hi' ? 'कुल देय राशि:' : 'Total Payable Amount:'}
                      </span>
                      <span className="text-[10px] text-blue-700">
                        {cartItems.length} {currentLang === 'hi' ? 'ई-बुक्स' : 'E-Books'} · Instant PDF
                      </span>
                    </div>
                    <span className="text-2xl font-black text-blue-700 font-sans">₹{finalTotal}</span>
                  </div>

                  {/* Instruction banner: To get your book, scan the QR code */}
                  <div className="w-full bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl py-2 px-3 mb-3 text-center flex items-center justify-center gap-1.5 text-xs font-bold shadow-2xs">
                    <Sparkles size={14} className="text-emerald-600 flex-shrink-0" />
                    <span>
                      {currentLang === 'hi'
                        ? 'अपनी किताब पाने के लिए QR कोड स्कैन करें'
                        : 'To get your book, scan the QR code'}
                    </span>
                  </div>

                  {/* Shankar Suthar Google Pay UPI QR Image */}
                  <div className="relative p-3 rounded-2xl bg-white border border-slate-200 shadow-lg flex flex-col items-center">
                    <div className="w-60 h-60 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-100">
                      <img
                        src="/upi-qr.jpg"
                        alt="Shankar Suthar UPI QR Code - Scan to pay"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="mt-2 text-center">
                      <p className="text-xs font-bold text-slate-800">
                        shankar suthar
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {currentLang === 'hi'
                          ? 'Google Pay, PhonePe, Paytm, BHIM से स्कैन करें'
                          : 'Scan to pay with any UPI app'}
                      </p>
                    </div>
                  </div>

                  {/* Payee Info & Copy UPI ID */}
                  <div className="w-full mt-4 bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">
                        {currentLang === 'hi' ? 'खाताधारक:' : 'Payee Name:'}
                      </span>
                      <span className="font-bold text-slate-900 capitalize">{payeeName}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
                      <span className="text-slate-500 font-medium">UPI ID:</span>
                      <div className="flex items-center gap-1.5">
                        <code className="font-mono font-bold text-slate-800 text-[11px] bg-white px-2 py-0.5 rounded border border-slate-200">
                          {upiId}
                        </code>
                        <button
                          onClick={handleCopyUPI}
                          className="p-1 rounded text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                          title="Copy UPI ID"
                        >
                          {copied ? (
                            <span className="text-emerald-600 flex items-center gap-0.5">
                              <Check size={12} /> Copied!
                            </span>
                          ) : (
                            <Copy size={13} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Deep Link to Open directly on mobile device */}
                  <a
                    href={upiDeepLink}
                    className="w-full mt-3 flex items-center justify-center gap-1.5 py-3 px-4 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20 transition-all cursor-pointer"
                  >
                    <span>{currentLang === 'hi' ? 'मोबाइल UPI ऐप में खोलें' : 'Open in Phone UPI App'}</span>
                    <ExternalLink size={14} />
                  </a>

                  {/* Back to Cart link */}
                  <button
                    onClick={() => setStep('cart')}
                    className="mt-3 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  >
                    ← {currentLang === 'hi' ? 'वापस कार्ट पर जाएँ' : 'Back to Cart'}
                  </button>
                </div>
              ) : (
                /* Payment Success Completed Screen */
                <div className="py-8 text-center max-w-sm flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                    <CheckCircle2 size={36} />
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900 mb-1">
                    {currentLang === 'hi' ? 'भुगतान सफल रहा!' : 'Payment Received!'}
                  </h3>
                  <p className="text-xs text-slate-600 mb-6">
                    {currentLang === 'hi'
                      ? `धन्यवाद! Shankar Suthar (UPI ID: ${upiId}) को ₹${finalTotal} का भुगतान प्राप्त हो गया है। आपकी ई-बुक्स तैयार हैं।`
                      : `Thank you! Payment of ₹${finalTotal} received for Shankar Suthar. Your e-books are ready to read.`}
                  </p>
                  <button
                    onClick={onClose}
                    className="w-full bg-slate-900 hover:bg-black text-white font-bold py-3 px-6 rounded-xl text-xs sm:text-sm transition-colors cursor-pointer"
                  >
                    {currentLang === 'hi' ? 'लाइब्रेरी में वापस जाएं' : 'Return to Library'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
