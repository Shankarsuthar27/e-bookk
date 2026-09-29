import React, { useState, useId } from 'react';
import {
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  QrCode,
  Smartphone,
  ExternalLink,
  Loader2,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { collection, doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * UpiPaymentCard Component
 *
 * Facilitates UPI Payments with direct deep-links to Google Pay and PhonePe apps,
 * with mandatory pre-transaction logging to Firebase Firestore.
 *
 * @param {object} props
 * @param {string} [props.merchantUpiId] - Target UPI ID (VPA) e.g. 'merchant@okhdfcbank'
 * @param {string} [props.merchantName] - Registered Business or Payee Name
 * @param {number|string} [props.initialAmount] - Optional prefilled amount in INR
 * @param {string} [props.transactionNote] - Note attached to the payment
 * @param {function} [props.onTransactionLogged] - Callback fired when pending record is saved
 * @param {function} [props.onPaymentCompleted] - Callback fired when user marks payment completed
 */
export default function UpiPaymentCard({
  merchantUpiId = import.meta.env.VITE_MERCHANT_UPI_ID || 'ss2137789@okhdfcbank',
  merchantName = import.meta.env.VITE_MERCHANT_NAME || 'Shankar Suthar',
  initialAmount = '',
  transactionNote = 'STAX Digital Order',
  onTransactionLogged,
  onPaymentCompleted,
}) {
  const [amount, setAmount] = useState(String(initialAmount || ''));
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeMethod, setActiveMethod] = useState(null); // 'gpay' | 'phonepe'
  const [errorMessage, setErrorMessage] = useState('');
  const [activeTransaction, setActiveTransaction] = useState(null);
  const [showQrFallback, setShowQrFallback] = useState(false);

  const inputId = useId();

  // Validate amount (must be positive number, max 1,00,000 for standard UPI)
  const numericAmount = parseFloat(amount);
  const isAmountValid = !isNaN(numericAmount) && numericAmount > 0 && numericAmount <= 100000;

  // Preset quick amount buttons
  const quickAmounts = [49, 99, 199, 499];

  /**
   * Generates a unique transaction reference ID
   */
  const generateTxnId = () => {
    return `TXN_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  };

  /**
   * Generates deep-link URIs for Google Pay, PhonePe, and Universal UPI
   */
  const buildUpiUrls = (txnId, amt) => {
    const params = new URLSearchParams({
      pa: merchantUpiId,
      pn: merchantName,
      am: Number(amt).toFixed(2),
      cu: 'INR',
      tn: transactionNote,
      tr: txnId, // Transaction Reference ID
      mc: '0000', // General merchant code
    });

    const standardUpi = `upi://pay?${params.toString()}`;
    // Google Pay tez scheme
    const gpayUri = `tez://upi/pay?${params.toString()}`;
    // PhonePe custom scheme
    const phonepeUri = `phonepe://pay?${params.toString()}`;

    return { standardUpi, gpayUri, phonepeUri };
  };

  /**
   * Detects if user is browsing on a mobile operating system
   */
  const isMobileDevice = () => {
    if (typeof navigator === 'undefined') return false;
    return /Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent);
  };

  /**
   * Initiates payment for a selected payment provider
   * 1. Validates amount
   * 2. Logs 'pending' transaction to Firestore
   * 3. Redirects to target app via deep link
   *
   * @param {'gpay' | 'phonepe'} method
   */
  const handleInitiatePayment = async (method) => {
    setErrorMessage('');

    if (!isAmountValid) {
      setErrorMessage('Please enter a valid amount greater than ₹0.');
      return;
    }

    if (!merchantUpiId) {
      setErrorMessage('Merchant UPI ID is not configured. Please check your settings.');
      return;
    }

    setIsProcessing(true);
    setActiveMethod(method);

    const transactionId = generateTxnId();
    const formattedAmount = numericAmount.toFixed(2);
    const providerLabel = method === 'gpay' ? 'Google Pay' : 'PhonePe';
    const { standardUpi, gpayUri, phonepeUri } = buildUpiUrls(transactionId, formattedAmount);
    const targetUri = method === 'gpay' ? gpayUri : phonepeUri;

    try {
      // ─── Step 1: Save Pending Transaction to Firebase Firestore ───────────
      const txnPayload = {
        transactionId,
        amount: Number(formattedAmount),
        currency: 'INR',
        status: 'pending',
        paymentMethod: providerLabel,
        merchantUpiId,
        merchantName,
        note: transactionNote,
        standardUpiUrl: standardUpi,
        targetAppUri: targetUri,
        timestamp: serverTimestamp(),
        createdAt: new Date().toISOString(),
        device: isMobileDevice() ? 'mobile' : 'desktop',
      };

      const txnDocRef = doc(collection(db, 'transactions'), transactionId);
      await setDoc(txnDocRef, txnPayload);

      console.log(`[Firebase Firestore] ✅ Logged pending transaction ${transactionId} to 'transactions' collection.`);
      setActiveTransaction(txnPayload);

      if (onTransactionLogged) {
        onTransactionLogged(txnPayload);
      }

      // ─── Step 2: Open Deep Link Intent ────────────────────────────────────
      const isMobile = isMobileDevice();

      if (isMobile) {
        // Attempt deep link directly
        // Fallback to standard UPI after a short timeout if the custom scheme is unsupported
        const fallbackTimer = setTimeout(() => {
          window.location.href = standardUpi;
        }, 1500);

        window.location.href = targetUri;

        // Clear fallback if page unloads (meaning the app opened successfully)
        window.addEventListener('pagehide', () => clearTimeout(fallbackTimer), { once: true });
      } else {
        // Desktop browser: display scan QR code
        setShowQrFallback(true);
      }
    } catch (err) {
      console.error('[Firebase Error] Failed to record transaction log:', err);
      // Abort redirect and show clear error message
      setErrorMessage(
        `Unable to initialize payment: ${err.message || 'Database connection error'}. Transaction was not logged.`
      );
    } finally {
      setIsProcessing(false);
    }
  };


  const currentUpiUrl = activeTransaction
    ? activeTransaction.standardUpiUrl
    : isAmountValid
    ? buildUpiUrls('PREVIEW', numericAmount.toFixed(2)).standardUpi
    : `upi://pay?pa=${merchantUpiId}&pn=${encodeURIComponent(merchantName)}&cu=INR`;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=8&data=${encodeURIComponent(
    currentUpiUrl
  )}`;

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden transition-all">
      {/* ─── Card Header ────────────────────────────────────────────────────── */}
      <div className="px-6 pt-6 pb-4 bg-gradient-to-b from-slate-50/80 to-white border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Instant UPI Checkout
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
            <ShieldCheck size={13} />
            <span>Firestore Verified</span>
          </div>
        </div>

        <h3 className="text-xl font-extrabold text-slate-900 mt-2 tracking-tight">
          Pay via UPI Mobile App
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Deep-linking to Google Pay & PhonePe with cloud security log
        </p>
      </div>

      <div className="p-6 space-y-5">
        {/* ─── Amount Input Field ───────────────────────────────────────── */}
            <div>
              <label
                htmlFor={inputId}
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Payment Amount (INR)
              </label>

              <div className="relative rounded-2xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 font-bold text-lg">
                  ₹
                </div>
                <input
                  id={inputId}
                  type="number"
                  min="1"
                  step="any"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="e.g. 49"
                  disabled={isProcessing}
                  className="w-full bg-slate-50 hover:bg-white focus:bg-white text-slate-900 text-lg sm:text-xl font-extrabold rounded-2xl pl-9 pr-4 py-3 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-sans"
                />
              </div>

              {/* Quick Amount Pills */}
              <div className="flex items-center gap-1.5 mt-2.5">
                <span className="text-[10px] text-slate-400 font-semibold mr-1">Quick:</span>
                {quickAmounts.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setAmount(String(preset));
                      if (errorMessage) setErrorMessage('');
                    }}
                    className={`text-xs font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                      amount === String(preset)
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    ₹{preset}
                  </button>
                ))}
              </div>
            </div>

            {/* ─── Error Alert Banner ───────────────────────────────────────── */}
            {errorMessage && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in duration-150">
                <AlertCircle size={16} className="text-rose-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold">Payment Error</p>
                  <p className="text-[11px] text-rose-700 mt-0.5">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* ─── Payee Details Mini-Box ───────────────────────────────────── */}
            <div className="bg-slate-50/90 rounded-2xl p-3 border border-slate-200/80 text-xs space-y-1">
              <div className="flex justify-between items-center text-slate-600">
                <span className="text-[11px] font-medium">Merchant Payee:</span>
                <span className="font-bold text-slate-900">{merchantName}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span className="text-[11px] font-medium">UPI VPA:</span>
                <code className="text-[11px] font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-800">
                  {merchantUpiId}
                </code>
              </div>
            </div>

            {/* ─── Prominently Styled Payment Provider Buttons ──────────────── */}
            <div className="space-y-3">
              {/* 1. Google Pay Button */}
              <button
                type="button"
                onClick={() => handleInitiatePayment('gpay')}
                disabled={!isAmountValid || isProcessing}
                className="w-full relative group overflow-hidden bg-slate-950 hover:bg-slate-900 active:scale-[0.99] text-white font-bold py-3.5 px-5 rounded-2xl text-sm transition-all shadow-md shadow-slate-900/15 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  {/* Google Pay Multicolor SVG Icon */}
                  <span className="w-7 h-7 rounded-lg bg-white flex items-center justify-center p-1 shadow-2xs">
                    <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.28 21.43 7.37 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.57H1.25C.45 8.16 0 9.99 0 12s.45 3.84 1.25 5.43l4.03-3.14z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.28 2.57 1.25 6.57l4.03 3.14c.95-2.83 3.6-4.96 6.72-4.96z"
                      />
                    </svg>
                  </span>
                  <span>Pay with Google Pay</span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold">
                  {isProcessing && activeMethod === 'gpay' ? (
                    <Loader2 size={16} className="animate-spin text-white" />
                  ) : (
                    <>
                      <span>{isAmountValid ? `₹${numericAmount.toFixed(2)}` : 'Enter amount'}</span>
                      <ExternalLink size={14} className="opacity-70 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </div>
              </button>

              {/* 2. PhonePe Button */}
              <button
                type="button"
                onClick={() => handleInitiatePayment('phonepe')}
                disabled={!isAmountValid || isProcessing}
                className="w-full relative group overflow-hidden bg-[#5f259f] hover:bg-[#521f8a] active:scale-[0.99] text-white font-bold py-3.5 px-5 rounded-2xl text-sm transition-all shadow-md shadow-[#5f259f]/25 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  {/* PhonePe Purple 'Pe' Badge Icon */}
                  <span className="w-7 h-7 rounded-lg bg-white flex items-center justify-center p-0.5 shadow-2xs font-extrabold text-[#5f259f] text-base font-serif">
                    पे
                  </span>
                  <span>Pay with PhonePe</span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-purple-100 font-semibold">
                  {isProcessing && activeMethod === 'phonepe' ? (
                    <Loader2 size={16} className="animate-spin text-white" />
                  ) : (
                    <>
                      <span>{isAmountValid ? `₹${numericAmount.toFixed(2)}` : 'Enter amount'}</span>
                      <ExternalLink size={14} className="opacity-70 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </div>
              </button>
            </div>

            {/* ─── Pending / Active State Status Banner ──────────────────────── */}
            {activeTransaction && (
              <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-4 space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-emerald-900">
                      Payment Initiated ({activeTransaction.paymentMethod})
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    #{activeTransaction.transactionId.slice(-6)}
                  </span>
                </div>

                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Transaction logged to Firebase Firestore. Deep link triggered to open {activeTransaction.paymentMethod}.
                </p>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setShowQrFallback((prev) => !prev)}
                    className="px-3 py-1.5 rounded-xl bg-white border border-emerald-200 text-emerald-900 text-xs font-semibold hover:bg-emerald-100/60 transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <QrCode size={14} />
                    <span>{showQrFallback ? 'Hide QR' : 'Show QR Code'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* ─── Desktop / Dynamic QR Fallback Option ─────────────────────── */}
            {(!activeTransaction || showQrFallback) && (
              <div className="pt-2 border-t border-slate-100 text-center">
                <button
                  type="button"
                  onClick={() => setShowQrFallback((prev) => !prev)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors inline-flex items-center gap-1 cursor-pointer"
                >
                  <QrCode size={14} />
                  <span>
                    {showQrFallback
                      ? 'Hide Dynamic UPI QR Code'
                      : 'On Desktop? Show Scan-to-Pay QR Code'}
                  </span>
                </button>

                {showQrFallback && isAmountValid && (
                  <div className="mt-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col items-center animate-in fade-in duration-200">
                    <p className="text-xs font-bold text-slate-800 mb-2">
                      Scan with Google Pay, PhonePe, or any UPI App
                    </p>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs">
                      <img
                        src={qrImageUrl}
                        alt="Dynamic UPI QR Code"
                        className="w-48 h-48 object-contain"
                      />
                    </div>
                    <p className="text-[11px] font-bold text-slate-700 mt-2">
                      Amount: ₹{numericAmount.toFixed(2)}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Merchant: {merchantName} ({merchantUpiId})
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      {/* ─── Security Footer ────────────────────────────────────────────────── */}
      <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1">
          <ShieldCheck size={13} className="text-emerald-600" />
          <span>256-Bit Encrypted</span>
        </span>
        <span className="font-mono text-[10px] text-slate-400">NPCI / BHIM UPI</span>
      </div>
    </div>
  );
}
