import React, { useEffect, useState } from 'react';
import { ShoppingBag, Heart, CheckCircle2, X } from 'lucide-react';

/**
 * ToastContainer — renders a stack of toast notifications in the top-right corner.
 * Each toast auto-dismisses after 3.5 s.
 */
export default function ToastContainer({ toasts, removeToast }) {
  return (
    <div
      className="fixed top-20 right-4 z-[200] flex flex-col gap-3 pointer-events-none"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
}

function Toast({ toast, onRemove }) {
  const [exiting, setExiting] = useState(false);

  const handleDismiss = () => {
    setExiting(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  useEffect(() => {
    const timeout = setTimeout(() => handleDismiss(), 3500);
    return () => clearTimeout(timeout);
  }, []);

  const icons = {
    cart: <ShoppingBag size={17} className="text-indigo-500 flex-shrink-0" />,
    wishlist_add: <Heart size={17} className="text-rose-500 fill-rose-500 flex-shrink-0" />,
    wishlist_remove: <Heart size={17} className="text-slate-400 flex-shrink-0" />,
    success: <CheckCircle2 size={17} className="text-emerald-500 flex-shrink-0" />,
  };

  return (
    <div
      className={`pointer-events-auto flex items-center gap-3 bg-white border border-slate-100 shadow-xl rounded-2xl px-4 py-3 min-w-[260px] max-w-xs ${
        exiting ? 'toast-exit' : 'toast-enter'
      }`}
    >
      {icons[toast.type] || icons.success}
      <p className="text-sm text-slate-700 font-medium flex-1 leading-snug">{toast.message}</p>
      <button
        onClick={handleDismiss}
        className="text-slate-300 hover:text-slate-500 transition-colors flex-shrink-0 ml-1"
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </button>
    </div>
  );
}
