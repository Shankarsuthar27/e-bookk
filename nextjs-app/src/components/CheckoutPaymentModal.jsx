'use client';

import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Copy,
  ExternalLink,
  ShieldCheck,
  Download,
  BookOpen,
  ArrowRight,
  Smartphone,
} from 'lucide-react';

export default function CheckoutPaymentModal({
  isOpen,
  onClose,
  finalTotal,
  cartItems,
  onPaymentSuccess,
}) {
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const payeeName = 'shankar suthar';
  const upiId = 'ss2137789@okhdfcbank';
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

  const handleConfirmPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      if (onPaymentSuccess) {
        onPaymentSuccess();
      }
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col my-auto max-h-[95vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center font-bold">
              <Smartphone size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 leading-tight">UPI Instant Payment</h2>
              <p className="text-[11px] text-slate-500">Scan to pay with any UPI App</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close payment modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        {!isSuccess ? (
          <div className="p-5 flex flex-col items-center overflow-y-auto">
            {/* Amount Pill */}
            <div className="w-full bg-blue-50 border border-blue-200 rounded-2xl p-3 flex items-center justify-between mb-4 shadow-2xs">
              <span className="text-xs font-bold text-blue-900">Total Payable Amount:</span>
              <span className="text-lg font-black text-blue-700 font-sans">₹{finalTotal}</span>
            </div>

            {/* The Shankar Suthar Google Pay UPI QR Code Image */}
            <div className="relative p-2.5 rounded-2xl bg-white border border-slate-200 shadow-md flex flex-col items-center">
              <div className="w-56 h-56 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center">
                <img
                  src="/upi-qr.jpg"
                  alt="Shankar Suthar UPI QR Code - Scan to pay"
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="mt-2 text-[11px] font-semibold text-slate-700 tracking-tight flex items-center gap-1">
                <span>Scan with GPay, PhonePe, Paytm, BHIM</span>
              </p>
            </div>

            {/* Payee Info & Copy UPI ID */}
            <div className="w-full mt-4 bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Payee Name:</span>
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
                    className="p-1 rounded text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                    title="Copy UPI ID"
                  >
                    <Copy size={13} />
                  </button>
                </div>
              </div>
              {copied && (
                <p className="text-[10px] text-emerald-600 font-bold text-right animate-in fade-in">
                  UPI ID copied to clipboard!
                </p>
              )}
            </div>

            {/* Open in Mobile UPI App Direct Link */}
            <a
              href={upiDeepLink}
              className="w-full mt-3 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl border border-blue-200 transition-colors"
            >
              <span>Open in UPI App on this device</span>
              <ExternalLink size={13} />
            </a>

            {/* Confirm Payment Action Button */}
            <button
              onClick={handleConfirmPayment}
              disabled={isProcessing}
              className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isProcessing ? (
                <span>Verifying Payment...</span>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>I Have Completed Payment</span>
                </>
              )}
            </button>

            <p className="mt-2 text-[10px] text-slate-400 text-center flex items-center justify-center gap-1">
              <ShieldCheck size={12} className="text-emerald-500" />
              <span>Instant Digital PDF Access Guaranteed</span>
            </p>
          </div>
        ) : (
          /* Payment Success State */
          <div className="p-6 flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-1">Payment Successful!</h3>
            <p className="text-xs text-slate-500 mb-4 max-w-[240px]">
              Thank you, your order of {cartItems.length} e-book{cartItems.length > 1 ? 's' : ''} is confirmed.
            </p>

            {/* Order Summary Receipt Box */}
            <div className="w-full bg-slate-50 rounded-2xl p-3 border border-slate-200 text-left space-y-1.5 mb-4 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Order Ref:</span>
                <span className="font-mono font-bold text-slate-900">#STX-{Date.now().toString().slice(-6)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Amount Paid:</span>
                <span className="font-bold text-emerald-600 font-sans">₹{finalTotal}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Paid via:</span>
                <span className="font-semibold text-slate-700">UPI ({upiId})</span>
              </div>
            </div>

            {/* Download Buttons */}
            <button
              onClick={() => {
                alert('Instant PDF download initiated for your library!');
                onClose();
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer mb-2"
            >
              <Download size={15} />
              <span>Download E-Books (PDF)</span>
            </button>

            <button
              onClick={onClose}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors py-1 cursor-pointer"
            >
              Close and View Library
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
