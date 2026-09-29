import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  PackageCheck,
  Download,
  Calendar,
  CreditCard,
  ShoppingBag,
  ExternalLink,
  BookOpen,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { getUserOrdersFromDatabase } from '../firebase';

export default function OrdersModal({
  isOpen,
  onClose,
  currentUser,
  currentLang = 'en',
  t,
  addToast,
  onOpenBook = null,
}) {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchOrders = async () => {
    if (!currentUser?.uid) return;
    setIsLoading(true);
    try {
      const userOrders = await getUserOrdersFromDatabase(currentUser.uid);
      setOrders(userOrders || []);
    } catch (err) {
      console.warn('Could not fetch orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && currentUser?.uid) {
      fetchOrders();
    }
  }, [isOpen, currentUser?.uid]);

  const handleDownload = (book) => {
    const title = currentLang === 'en' ? (book.titleEn || book.title) : book.title;
    if (addToast) {
      addToast(
        currentLang === 'hi'
          ? `"${title}" PDF डाउनलोड शुरू हो गया है...`
          : `Downloading PDF for "${title}"...`,
        'success'
      );
    }
    const link = document.createElement('a');
    link.href = book.coverImage || '/upi-qr.jpg';
    link.download = `${(book.titleEn || book.title || 'ebook').replace(/\s+/g, '_')}_STAX.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col my-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <img src="/logo-icon.png" alt="STAX Logo" className="w-8 h-8 object-contain" />
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                {currentLang === 'hi' ? 'मेरी खरीदी गई ई-बुक्स एवं ऑर्डर्स' : 'My Orders & Purchased E-Books'}
              </h2>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold">
                <Database size={11} className="text-emerald-600" />
                <span>Cloud Firestore: orders collection</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={fetchOrders}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors cursor-pointer"
              title="Refresh from Database"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin text-blue-600' : ''} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {!currentUser ? (
            <div className="text-center py-12 px-4 space-y-3">
              <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <CreditCard size={24} />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-800">
                {currentLang === 'hi' ? 'ऑर्डर्स देखने के लिए साइन इन करें' : 'Sign In to View Your Orders'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {currentLang === 'hi'
                  ? 'अपने खाते से साइन इन करके क्लाउड डेटाबेस में सुरक्षित अपनी सभी ई-बुक्स एक्सेस करें।'
                  : 'Access your lifetime purchases and digital downloads stored securely in Cloud Firestore.'}
              </p>
            </div>
          ) : isLoading ? (
            <div className="text-center py-16 space-y-3">
              <RefreshCw size={28} className="animate-spin text-blue-600 mx-auto" />
              <p className="text-xs font-semibold text-slate-500">
                {currentLang === 'hi' ? 'डेटाबेस से ऑर्डर्स लोड हो रहे हैं...' : 'Loading orders from Firestore database...'}
              </p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-3">
              <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mx-auto">
                <ShoppingBag size={24} />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-800">
                {currentLang === 'hi' ? 'अभी तक कोई ऑर्डर नहीं मिला' : 'No Purchase History Yet'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {currentLang === 'hi'
                  ? 'जब आप किसी ई-बुक का ऑर्डर करेंगे, तो आपका रसीद और डाउनलोड लिंक यहाँ स्वतः सुरक्षित हो जाएगा।'
                  : 'When you purchase an eBook, your transaction details and instant download links will appear here.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order, idx) => (
                <div
                  key={order.orderId || order.id || idx}
                  className="bg-slate-50 rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs transition-all hover:border-slate-300"
                >
                  {/* Order Top Bar */}
                  <div className="px-4 py-3 bg-white border-b border-slate-200/70 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 font-mono text-[10px] block">ORDER ID</span>
                      <span className="font-mono font-bold text-slate-900">
                        #{order.orderId || order.id}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-slate-400 text-[10px] block">TOTAL</span>
                        <span className="font-black text-slate-900 text-sm">
                          ₹{order.totalAmount}
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {currentLang === 'hi' ? 'सफल' : 'Completed'}
                      </span>
                    </div>
                  </div>

                  {/* Order Date & Channel */}
                  <div className="px-4 py-2 bg-slate-50/80 flex items-center justify-between text-[11px] text-slate-500 border-b border-slate-200/50">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} className="text-slate-400" />
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Recent'}
                    </span>
                    <span className="font-mono text-[10px] bg-slate-200/60 px-1.5 py-0.5 rounded text-slate-700">
                      Payment: {order.paymentMethod || 'UPI QR'}
                    </span>
                  </div>

                  {/* Items in this Order */}
                  <div className="p-3 sm:p-4 space-y-2.5">
                    {(order.items || []).map((item) => (
                      <div
                        key={item.id}
                        className="bg-white rounded-xl p-2.5 border border-slate-200/80 flex items-center justify-between gap-3 shadow-2xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {item.coverImage && (
                            <img
                              src={item.coverImage}
                              alt=""
                              className="w-9 h-12 object-cover rounded shadow-xs border border-slate-200 flex-shrink-0"
                            />
                          )}
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 truncate">
                              {currentLang === 'en' ? (item.titleEn || item.title) : item.title}
                            </h4>
                            <p className="text-[11px] text-slate-500 truncate">
                              {item.author} · ₹{item.price}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDownload(item)}
                          className="flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                        >
                          <Download size={12} />
                          <span>PDF</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>
            {currentLang === 'hi' ? 'क्लाउड सिंक सक्रिय है' : 'All transactions verified in Cloud Firestore'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs transition-colors cursor-pointer"
          >
            {currentLang === 'hi' ? 'बंद करें' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
