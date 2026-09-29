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
 * to keep the build ultra-lightweight and prevent memory allocation crashes.
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

export default function QRScannerModal({ isOpen, onClose, onScanSuccess, currentLang = 'en', t }) {
  const [cameraError, setCameraError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScannedResult, setLastScannedResult] = useState(null);
  const [scanMode, setScanMode] = useState('camera'); // 'camera' | 'upload'

  const html5QrCodeRef = useRef(null);
  const fileInputRef = useRef(null);
  const scannerContainerId = 'vite-qr-reader-viewport';

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
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
          currentLang === 'hi'
            ? 'आपके ब्राउज़र या डिवाइस पर कैमरा समर्थित नहीं है। कृपया फ़ाइल अपलोड विकल्प का उपयोग करें।'
            : 'Camera access is not supported by your browser or environment. Please use Image Upload below.'
        );
      }

      const Html5QrcodeClass = await loadHtml5QrcodeScript();

      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5QrcodeClass(scannerContainerId, {
          verbose: false,
        });
      }

      const qrScanner = html5QrCodeRef.current;
      const config = {
        fps: 10,
        qrbox: { width: 220, height: 220 },
        aspectRatio: 1.0,
      };

      await qrScanner.start(
        { facingMode: 'environment' },
        config,
        (decodedText) => {
          handleSuccess(decodedText);
        },
        () => {}
      );

      setIsInitializing(false);
      setIsScanning(true);
    } catch (err) {
      console.warn('Camera notice:', err);
      setIsInitializing(false);
      setIsScanning(false);

      if (err.name === 'NotAllowedError' || err.message?.includes('Permission denied')) {
        setCameraError(
          currentLang === 'hi'
            ? 'कैमरा अनुमति अस्वीकार कर दी गई। कृपया ब्राउज़र सेटिंग में कैमरा अनुमति दें या नीचे QR इमेज अपलोड करें।'
            : 'Camera permission was denied. Please allow camera access in browser settings, or upload a QR image below.'
        );
      } else if (err.name === 'NotFoundError' || err.message?.includes('No camera')) {
        setCameraError(
          currentLang === 'hi'
            ? 'कोई कैमरा नहीं मिला। आप QR इमेज अपलोड करके या सिमुलेटर बटन दबाकर तुरंत टेस्ट कर सकते हैं।'
            : 'No camera device found on this system. You can test by uploading the QR image or clicking the instant simulator button.'
        );
      } else {
        setCameraError(
          err.message ||
            (currentLang === 'hi'
              ? 'कैमरा शुरू करने में असमर्थ। कृपया QR फ़ोटो अपलोड करें।'
              : 'Unable to access camera feed. Please try uploading the QR image file.')
        );
      }
    }
  }, [handleSuccess, currentLang]);

  useEffect(() => {
    if (isOpen && scanMode === 'camera') {
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
      setCameraError(
        currentLang === 'hi'
          ? 'अपलोड की गई छवि में वैध QR कोड नहीं मिला।'
          : 'Could not find a valid QR code in the uploaded image. Please try another file.'
      );
    }
  };

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
                {currentLang === 'hi' ? 'प्रमोशनल QR कोड स्कैन करें' : 'Scan Promotional QR Code'}
              </h2>
              <p className="text-[11px] text-slate-500">
                {currentLang === 'hi' ? 'छूट और विशेष ई-बुक्स अनलॉक करें' : 'Scan to unlock discounts or special e-books'}
              </p>
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
            <span>{currentLang === 'hi' ? 'लाइव कैमरा' : 'Live Camera'}</span>
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
            <span>{currentLang === 'hi' ? 'इमेज अपलोड' : 'Upload Image'}</span>
          </button>
        </div>

        {/* Viewport Body */}
        <div className="p-5 flex flex-col items-center justify-center">
          {scanMode === 'camera' ? (
            <div className="w-full flex flex-col items-center">
              <div className="relative w-full max-w-[270px] aspect-square rounded-2xl overflow-hidden bg-slate-900 border-2 border-slate-700 shadow-inner flex items-center justify-center">
                <div id={scannerContainerId} className="w-full h-full object-cover" />

                {isScanning && !cameraError && (
                  <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_12px_rgba(59,130,246,0.9)] animate-pulse pointer-events-none" />
                )}

                <div className="absolute inset-5 border-2 border-dashed border-white/40 rounded-xl pointer-events-none" />

                {isInitializing && !cameraError && (
                  <div className="absolute inset-0 bg-slate-900/80 flex flex-col items-center justify-center text-white gap-2 p-4 text-center">
                    <RefreshCw size={24} className="animate-spin text-blue-400" />
                    <p className="text-xs font-semibold">
                      {currentLang === 'hi' ? 'कैमरा शुरू हो रहा है...' : 'Starting camera...'}
                    </p>
                  </div>
                )}
              </div>

              {cameraError && (
                <div className="mt-3 w-full p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5 animate-in fade-in">
                  <ShieldAlert size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-amber-950">
                      {currentLang === 'hi' ? 'कैमरा उपलब्ध नहीं है' : 'Camera Not Available'}
                    </p>
                    <p className="text-[11px] leading-relaxed text-amber-800">{cameraError}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/60 hover:bg-slate-50 transition-colors text-center">
              <Upload size={32} className="text-slate-400 mb-2" />
              <p className="text-xs font-bold text-slate-800 mb-1">
                {currentLang === 'hi' ? 'QR कोड फ़ोटो चुनें' : 'Upload QR Code Image'}
              </p>
              <p className="text-[11px] text-slate-500 mb-3 max-w-[220px]">
                {currentLang === 'hi'
                  ? 'किसी भी प्रमोशनल QR कोड का स्क्रीनशॉट या फोटो चुनें।'
                  : 'Select any photo or screenshot of a promo QR code to scan.'}
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
                {currentLang === 'hi' ? 'फ़ाइल चुनें' : 'Choose Image File'}
              </button>
            </div>
          )}

          {lastScannedResult && (
            <div className="mt-3 w-full p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
              <span className="font-semibold truncate">
                {currentLang === 'hi' ? 'कोड स्कैन सफल! लाभ लागू किए जा रहे हैं...' : 'Code Detected! Applying perks...'}
              </span>
            </div>
          )}

          {/* Shankar Suthar UPI QR One-Click Demo Button */}
          <div className="w-full mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2">
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span className="font-semibold text-slate-700">
                {currentLang === 'hi' ? 'त्वरित टेस्ट / सिम्युलेटर:' : 'Quick Test / Simulator:'}
              </span>
              <span className="text-[10px] text-blue-600 font-bold">Shankar Suthar QR</span>
            </div>
            <button
              type="button"
              onClick={handleInstantDemoScan}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer group"
            >
              <Sparkles size={14} className="text-amber-500 group-hover:scale-110 transition-transform" />
              <span>
                {currentLang === 'hi'
                  ? 'Shankar Suthar UPI QR टेस्ट करें'
                  : 'Simulate Shankar Suthar UPI QR Code'}
              </span>
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
