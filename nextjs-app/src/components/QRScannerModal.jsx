'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Camera,
  X,
  AlertCircle,
  CheckCircle2,
  Upload,
  RefreshCw,
  Sparkles,
  QrCode,
  ShieldAlert,
} from 'lucide-react';
// Exact decoded string from the user's uploaded Google Pay QR image
const SHANKAR_SUTHAR_UPI_QR_STRING =
  'upi://pay?pa=ss2137789@okhdfcbank&pn=shankar%20suthar&aid=uGICAgID3-avSYg';

/**
 * Dynamically loads minified html5-qrcode from /html5-qrcode.min.js
 * to keep the bundle lightweight and prevent memory allocation crashes.
 */
function loadHtml5QrcodeScript() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Window not available'));
      return;
    }
    if (window.Html5Qrcode) {
      resolve(window.Html5Qrcode);
      return;
    }
    const existing = document.getElementById('html5-qrcode-script');
    if (existing) {
      existing.addEventListener('load', () => resolve(window.Html5Qrcode));
      existing.addEventListener('error', (e) => reject(e));
      return;
    }
    const script = document.createElement('script');
    script.id = 'html5-qrcode-script';
    script.src = '/html5-qrcode.min.js';
    script.async = true;
    script.onload = () => resolve(window.Html5Qrcode);
    script.onerror = () => reject(new Error('Failed to load QR scanner library'));
    document.head.appendChild(script);
  });
}

export default function QRScannerModal({ isOpen, onClose, onScanSuccess }) {
  const [cameraError, setCameraError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScannedResult, setLastScannedResult] = useState(null);
  const [scanMode, setScanMode] = useState('camera'); // 'camera' | 'upload'

  const html5QrCodeRef = useRef(null);
  const fileInputRef = useRef(null);
  const scannerContainerId = 'qr-reader-viewport';

  // Handle successful scan
  const handleSuccess = useCallback(
    (decodedText) => {
      setLastScannedResult(decodedText);
      if (onScanSuccess) {
        onScanSuccess(decodedText);
      }
      // Stop scanner and close after short delay
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
      setTimeout(() => {
        onClose();
      }, 700);
    },
    [onScanSuccess, onClose]
  );

  // Initialize camera scanner
  const startCameraScanner = useCallback(async () => {
    setCameraError(null);
    setIsInitializing(true);
    setIsScanning(false);

    try {
      // Check if mediaDevices API is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
          'Camera access is not supported by your browser or environment. Please use Image Upload below.'
        );
      }

      const Html5QrcodeClass = await loadHtml5QrcodeScript();

      // Initialize Html5Qrcode instance
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5QrcodeClass(scannerContainerId, {
          verbose: false,
        });
      }

      const qrScanner = html5QrCodeRef.current;

      const config = {
        fps: 10,
        qrbox: { width: 230, height: 230 },
        aspectRatio: 1.0,
      };

      // Attempt back camera first (environment), fallback to user camera
      await qrScanner.start(
        { facingMode: 'environment' },
        config,
        (decodedText) => {
          handleSuccess(decodedText);
        },
        () => {
          // Frame error (silently ignore while searching)
        }
      );

      setIsInitializing(false);
      setIsScanning(true);
    } catch (err) {
      console.warn('Camera initialization notice:', err);
      setIsInitializing(false);
      setIsScanning(false);

      if (err.name === 'NotAllowedError' || err.message?.includes('Permission denied')) {
        setCameraError(
          'Camera permission was denied. Please allow camera access in your browser settings, or upload a QR image below.'
        );
      } else if (err.name === 'NotFoundError' || err.message?.includes('No camera')) {
        setCameraError(
          'No camera device found on this system. You can test by uploading the QR image or clicking the instant demo button.'
        );
      } else {
        setCameraError(
          err.message || 'Unable to access camera feed. Please try uploading the QR image file.'
        );
      }
    }
  }, [handleSuccess]);

  // Start or stop scanner based on modal visibility
  useEffect(() => {
    if (isOpen && scanMode === 'camera') {
      // Short delay for DOM element to mount
      const timer = setTimeout(() => {
        startCameraScanner();
      }, 200);
      return () => clearTimeout(timer);
    }

    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, [isOpen, scanMode, startCameraScanner]);

  // Handle image file upload scan
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const Html5QrcodeClass = await loadHtml5QrcodeScript();
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5QrcodeClass(scannerContainerId);
      }
      const decodedText = await html5QrCodeRef.current.scanFile(file, true);
      handleSuccess(decodedText);
    } catch (err) {
      setCameraError('Could not find a valid QR code in the uploaded image. Please try another file.');
    }
  };

  // Instant demo scan trigger for Shankar Suthar UPI QR
  const handleInstantDemoScan = () => {
    handleSuccess(SHANKAR_SUTHAR_UPI_QR_STRING);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col my-auto max-h-[95vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold">
              <QrCode size={18} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                Scan Promotional QR Code
              </h2>
              <p className="text-[11px] text-slate-500">Scan to unlock VIP discounts or special e-books</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close scanner"
          >
            <X size={18} />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex border-b border-slate-100 px-5 pt-2 bg-slate-50/30">
          <button
            onClick={() => setScanMode('camera')}
            className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              scanMode === 'camera'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Camera size={14} />
            <span>Live Camera</span>
          </button>
          <button
            onClick={() => {
              if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
                html5QrCodeRef.current.stop().catch(() => {});
              }
              setScanMode('upload');
            }}
            className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              scanMode === 'upload'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload size={14} />
            <span>Upload Image</span>
          </button>
        </div>

        {/* Viewport Body */}
        <div className="p-5 flex flex-col items-center justify-center">
          {scanMode === 'camera' ? (
            <div className="w-full flex flex-col items-center">
              {/* Camera Container */}
              <div className="relative w-full max-w-[280px] aspect-square rounded-2xl overflow-hidden bg-slate-900 border-2 border-slate-700 shadow-inner flex items-center justify-center">
                {/* Scanner Target Frame */}
                <div id={scannerContainerId} className="w-full h-full object-cover" />

                {/* Laser animation line while active */}
                {isScanning && !cameraError && (
                  <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_12px_rgba(59,130,246,0.9)] animate-pulse pointer-events-none" />
                )}

                {/* Corner guide overlay */}
                <div className="absolute inset-5 border-2 border-dashed border-white/40 rounded-xl pointer-events-none" />

                {/* Loading State */}
                {isInitializing && !cameraError && (
                  <div className="absolute inset-0 bg-slate-900/80 flex flex-col items-center justify-center text-white gap-2 p-4 text-center">
                    <RefreshCw size={24} className="animate-spin text-blue-400" />
                    <p className="text-xs font-semibold">Starting camera...</p>
                  </div>
                )}
              </div>

              {/* Camera Error Message */}
              {cameraError && (
                <div className="mt-3 w-full p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5 animate-in fade-in">
                  <ShieldAlert size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-amber-950">Camera Not Available</p>
                    <p className="text-[11px] leading-relaxed text-amber-800">{cameraError}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* File Upload Mode */
            <div className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/60 hover:bg-slate-50 transition-colors text-center">
              <Upload size={32} className="text-slate-400 mb-2" />
              <p className="text-xs font-bold text-slate-800 mb-1">Upload QR Code Image</p>
              <p className="text-[11px] text-slate-500 mb-3 max-w-[220px]">
                Select any photo or screenshot of a promo QR code to scan.
              </p>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                Choose Image File
              </button>
            </div>
          )}

          {/* Success Flash */}
          {lastScannedResult && (
            <div className="mt-3 w-full p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
              <span className="font-semibold truncate">Code Detected! Applying perks...</span>
            </div>
          )}

          {/* Shankar Suthar UPI QR One-Click Demo Button */}
          <div className="w-full mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2">
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span className="font-semibold text-slate-700">Quick Test / Simulator:</span>
              <span className="text-[10px] text-blue-600 font-bold">Shankar Suthar QR</span>
            </div>
            <button
              type="button"
              onClick={handleInstantDemoScan}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer group"
            >
              <Sparkles size={14} className="text-amber-500 group-hover:scale-110 transition-transform" />
              <span>Simulate Shankar Suthar UPI QR Code</span>
            </button>
            <p className="text-[10px] text-slate-400 text-center">
              Decodes: <code className="text-slate-600 font-mono">ss2137789@okhdfcbank</code> (₹20 Off + Secret Book)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
