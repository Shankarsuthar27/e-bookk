'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  saveUserToDatabase,
  onAuthStateChanged,
} from '@/utils/firebase/client';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

/**
 * Official Google Brand 4-Color SVG Icon
 */
const GoogleIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get('next') || '/';
  const errorParam = searchParams.get('error');

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(errorParam || '');
  const [successMsg, setSuccessMsg] = useState('');

  // Automatically check if user is already signed in - if so, never display sign-in page
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsRedirecting(true);
        router.replace(nextUrl);
      } else {
        setCheckingAuth(false);
      }
    });

    return () => unsubscribe();
  }, [router, nextUrl]);

  useEffect(() => {
    if (errorParam) {
      setErrorMsg(decodeURIComponent(errorParam));
    }
  }, [errorParam]);

  // Email/Password login or registration with Firebase
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email || !password) {
      setErrorMsg('Please enter both your email address and password.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      let cred;
      if (isSignUp) {
        cred = await createUserWithEmailAndPassword(auth, email, password);
        setSuccessMsg('Account created successfully! Redirecting...');
      } else {
        cred = await signInWithEmailAndPassword(auth, email, password);
        setSuccessMsg('Signed in successfully! Opening your digital library...');
      }

      if (cred?.user) {
        await saveUserToDatabase(cred.user, {
          source: isSignUp ? 'email_signup' : 'email_login',
        });
      }

      setIsRedirecting(true);
      setTimeout(() => {
        router.replace(nextUrl);
        router.refresh();
      }, 500);
    } catch (err) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Authentication error. Please check credentials.');
    }
  };

  // Google OAuth with Firebase
  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setOauthLoading(true);

    try {
      const res = await signInWithPopup(auth, googleProvider);
      if (res?.user) {
        await saveUserToDatabase(res.user, {
          source: 'google_oauth',
        });
      }
      setSuccessMsg('Signed in with Google successfully!');
      setIsRedirecting(true);
      setTimeout(() => {
        router.replace(nextUrl);
        router.refresh();
      }, 500);
    } catch (err) {
      setOauthLoading(false);
      if (err.code !== 'auth/popup-closed-by-user') {
        if (err.code === 'auth/unauthorized-domain') {
          const domain = typeof window !== 'undefined' ? window.location.hostname : 'this domain';
          setErrorMsg(`Domain (${domain}) is not authorized for OAuth. Please add it to Firebase Console > Authentication > Settings > Authorized domains.`);
        } else {
          setErrorMsg(err.message || 'Failed to complete Google sign-in.');
        }
      }
    }
  };

  if (checkingAuth || isRedirecting) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-xl flex flex-col items-center space-y-4 max-w-sm w-full text-center animate-in fade-in duration-150">
          <Loader2 size={36} className="animate-spin text-blue-600" />
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {isRedirecting ? 'Signed in! Redirecting...' : 'Checking session...'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {isRedirecting ? 'Taking you to your books...' : 'Please wait while we verify your account.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex items-center justify-center p-3 sm:p-4 md:p-6 font-sans text-slate-900">
      {/* ── Outer Split-Screen Card with Compact Rounded Corners ──────────── */}
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200/90 flex flex-col lg:flex-row my-auto max-h-[92vh]">
        
        {/* ── LEFT COLUMN: Rounded 3-Column Masonry Collage with Stat Cards ── */}
        <div className="hidden lg:block lg:w-1/2 p-3 bg-[#0a0d14] relative overflow-hidden select-none">
          {/* Subtle ambient lighting */}
          <div className="absolute -top-16 -left-16 w-60 h-60 bg-orange-600/15 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-60 h-60 bg-emerald-600/15 rounded-full blur-2xl pointer-events-none" />

          {/* 3-Column Masonry Grid */}
          <div className="grid grid-cols-3 gap-2.5 h-full overflow-hidden rounded-2xl">
            
            {/* Column 1 */}
            <div className="flex flex-col gap-2.5">
              <div className="h-28 rounded-xl overflow-hidden bg-slate-800 relative">
                <img
                  src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80"
                  alt="Cozy reading with coffee"
                  className="w-full h-full object-cover filter brightness-95"
                />
                <span className="absolute bottom-1.5 left-1.5 bg-black/60 backdrop-blur-xs text-white text-[8px] font-bold px-1.5 py-0.5 rounded">
                  E-Reading
                </span>
              </div>
              <div className="h-40 rounded-xl overflow-hidden bg-slate-800 relative">
                <img
                  src="https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&auto=format&fit=crop&q=80"
                  alt="Aesthetic stack of literature books"
                  className="w-full h-full object-cover filter brightness-95"
                />
                <span className="absolute bottom-1.5 left-1.5 bg-black/60 backdrop-blur-xs text-white text-[8px] font-bold px-1.5 py-0.5 rounded">
                  Digital Collection
                </span>
              </div>
              <div className="h-32 rounded-xl overflow-hidden bg-slate-800 relative">
                <img
                  src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=400&auto=format&fit=crop&q=80"
                  alt="Classical Library Bookshelf"
                  className="w-full h-full object-cover filter brightness-90"
                />
                <span className="absolute bottom-1.5 left-1.5 bg-black/60 backdrop-blur-xs text-white text-[8px] font-bold px-1.5 py-0.5 rounded">
                  Heritage Books
                </span>
              </div>
              <div className="h-28 rounded-xl overflow-hidden bg-slate-800 relative">
                <img
                  src="https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=400&auto=format&fit=crop&q=80"
                  alt="Reading book pages"
                  className="w-full h-full object-cover filter brightness-90"
                />
                <span className="absolute bottom-1.5 left-1.5 bg-black/60 backdrop-blur-xs text-white text-[8px] font-bold px-1.5 py-0.5 rounded">
                  Instant PDF
                </span>
              </div>
            </div>

            {/* Column 2 */}
            <div className="flex flex-col gap-2.5">
              {/* VIBRANT ORANGE STAT CARD (Exact match to 41% card in reference) */}
              <div className="bg-[#E64A19] hover:bg-[#D84315] transition-colors rounded-xl p-3.5 text-white flex flex-col justify-between shadow-md">
                <div>
                  <span className="text-3xl xl:text-4xl font-black tracking-tight leading-none block mb-1.5 font-sans">
                    41%
                  </span>
                  <p className="text-[11px] font-medium leading-snug text-white/95">
                    of readers say instant digital e-books revived their regular daily reading habits.
                  </p>
                </div>
              </div>

              <div className="h-36 rounded-xl overflow-hidden bg-slate-800 relative">
                <img
                  src="https://images.unsplash.com/photo-1532012164546-f432f2e37b73?w=400&auto=format&fit=crop&q=80"
                  alt="Open book in sunlit room"
                  className="w-full h-full object-cover filter brightness-95"
                />
                <span className="absolute bottom-1.5 left-1.5 bg-black/60 backdrop-blur-xs text-white text-[8px] font-bold px-1.5 py-0.5 rounded">
                  Timeless Classics
                </span>
              </div>

              {/* VIBRANT GREEN STAT CARD (Exact match to 76% card in reference) */}
              <div className="bg-[#10B981] hover:bg-[#059669] transition-colors rounded-xl p-3.5 text-white flex flex-col justify-between shadow-md">
                <div>
                  <span className="text-3xl xl:text-4xl font-black tracking-tight leading-none block mb-1.5 font-sans">
                    76%
                  </span>
                  <p className="text-[11px] font-medium leading-snug text-white/95">
                    of book lovers admit instant digital library access significantly expanded their literary horizon.
                  </p>
                </div>
              </div>

              <div className="h-24 rounded-xl overflow-hidden bg-slate-800 relative">
                <img
                  src="https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&auto=format&fit=crop&q=80"
                  alt="Stack of literature books"
                  className="w-full h-full object-cover filter brightness-90"
                />
                <span className="absolute bottom-1.5 left-1.5 bg-black/60 backdrop-blur-xs text-white text-[8px] font-bold px-1.5 py-0.5 rounded">
                  ₹49 Flat
                </span>
              </div>
            </div>

            {/* Column 3 */}
            <div className="flex flex-col gap-2.5">
              <div className="h-36 rounded-xl overflow-hidden bg-slate-800 relative">
                <img
                  src="https://images.unsplash.com/photo-1507842229440-9b48c081308a?w=400&auto=format&fit=crop&q=80"
                  alt="Grand library interior"
                  className="w-full h-full object-cover filter brightness-95"
                />
                <span className="absolute bottom-1.5 left-1.5 bg-black/60 backdrop-blur-xs text-white text-[8px] font-bold px-1.5 py-0.5 rounded">
                  Grand Library
                </span>
              </div>
              <div className="h-32 rounded-xl overflow-hidden bg-slate-800 relative">
                <img
                  src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&auto=format&fit=crop&q=80"
                  alt="Reading book stack"
                  className="w-full h-full object-cover filter brightness-95"
                />
                <span className="absolute bottom-1.5 left-1.5 bg-black/60 backdrop-blur-xs text-white text-[8px] font-bold px-1.5 py-0.5 rounded">
                  Poetry & Novels
                </span>
              </div>
              <div className="h-36 rounded-xl overflow-hidden bg-slate-800 relative">
                <img
                  src="https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=400&auto=format&fit=crop&q=80"
                  alt="Cozy reading study room"
                  className="w-full h-full object-cover filter brightness-95"
                />
                <span className="absolute bottom-1.5 left-1.5 bg-black/60 backdrop-blur-xs text-white text-[8px] font-bold px-1.5 py-0.5 rounded">
                  Any Device
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* ── RIGHT COLUMN: Authentication Card ────────────────────────────── */}
        <div className="w-full lg:w-1/2 p-5 sm:p-7 lg:p-8 flex flex-col justify-between overflow-y-auto">
          
          {/* Top Row: Switch between Sign in / Sign up */}
          <div className="flex items-center justify-end gap-1.5 text-xs text-slate-500 mb-3 sm:mb-4">
            <span className="text-[11px] sm:text-xs">{isSignUp ? 'Already have an account?' : "Don't have an account?"}</span>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className="font-semibold text-slate-900 hover:text-blue-600 px-2.5 py-1 rounded-md border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-xs transition-all cursor-pointer"
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </div>

          {/* Form Content */}
          <div className="max-w-[340px] w-full mx-auto my-auto space-y-4">
            
            {/* Header Titles */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 mb-2">
                <img src="/logo-icon.png" alt="STAX" className="w-8 h-8 object-contain" />
                <span className="font-black text-xl tracking-tight text-slate-900 font-sans">
                  STAX<span className="text-blue-600">.</span>
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-950 tracking-tight">
                {isSignUp ? 'Create your account' : 'Welcome back'}
              </h1>
              <p className="text-xs text-slate-500 leading-relaxed">
                {isSignUp
                  ? 'Join our reader community and unlock instant access to classic e-books.'
                  : 'Welcome to STAX E-Books, please enter your login details below to access your library.'}
              </p>
            </div>

            {/* Error Banner */}
            {errorMsg && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                <AlertCircle size={15} className="flex-shrink-0 mt-0.5 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Success Banner */}
            {successMsg && (
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
                <CheckCircle2 size={15} className="flex-shrink-0 mt-0.5 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleEmailAuth} className="space-y-3">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin2233"
                  disabled={isLoading || oauthLoading}
                  className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all disabled:opacity-50"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  disabled={isLoading || oauthLoading}
                  className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all disabled:opacity-50"
                />
              </div>

              {!isSignUp && (
                <div className="flex justify-end pt-0.5">
                  <Link
                    href="/forgot-password"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    Forgot the password?
                  </Link>
                </div>
              )}

              {/* Solid Blue Login Button */}
              <button
                type="submit"
                disabled={isLoading || oauthLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white py-2.5 px-4 rounded-lg font-bold text-xs sm:text-sm transition-all shadow-sm shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>{isSignUp ? 'Create Account' : 'Login'}</span>
                )}
              </button>
            </form>

            {/* Divider: ── OR ── */}
            <div className="relative flex items-center justify-center py-0.5">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest absolute">
                OR
              </span>
            </div>

            {/* Google OAuth Button with PKCE Flow */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading || oauthLoading}
              className="w-full bg-white hover:bg-slate-50 active:scale-[0.99] border border-slate-200 text-slate-700 hover:text-slate-900 font-semibold py-2.5 px-3.5 rounded-lg text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all shadow-2xs cursor-pointer disabled:opacity-60"
            >
              {oauthLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin text-slate-500" />
                  <span>Connecting to Google...</span>
                </>
              ) : (
                <>
                  <GoogleIcon className="w-4 h-4 flex-shrink-0" />
                  <span>Sign in with Google</span>
                </>
              )}
            </button>

            <p className="text-center text-[10px] text-slate-400 leading-tight">
              By continuing, you agree to STAX Terms of Service and Privacy Policy.
            </p>
          </div>

          {/* Footer branding */}
          <div className="pt-3 text-center text-[10px] text-slate-400">
            &copy; {new Date().getFullYear()} STAX E-Books · All rights reserved.
          </div>
        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 size={32} className="animate-spin text-blue-600" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
