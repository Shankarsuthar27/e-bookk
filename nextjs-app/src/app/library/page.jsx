'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth, signOut, onAuthStateChanged } from '@/utils/firebase/client';
import { BookOpen, LogOut, CheckCircle2, Loader2, Library } from 'lucide-react';

export default function LibraryPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        // Redirect to login if unauthenticated
        router.push('/login?next=/library');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <Loader2 size={32} className="animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo-icon.png" alt="STAX" className="w-10 h-10 object-contain drop-shadow-xs" />
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">My STAX Library</h1>
              <p className="text-xs text-slate-500">
                Logged in as <span className="font-semibold text-slate-700">{user.email || user.displayName}</span>
              </p>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Welcome card */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-start gap-3">
          <CheckCircle2 size={20} className="text-emerald-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-emerald-900 space-y-1">
            <p className="font-bold">Firebase Authentication Verified!</p>
            <p>
              Your session is securely managed with Firebase Auth. You can access all your purchased and unlocked Hindi e-books.
            </p>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center pt-4">
          <a href="/" className="text-xs font-semibold text-blue-600 hover:underline">
            ← Browse Catalog
          </a>
        </div>
      </div>
    </div>
  );
}
