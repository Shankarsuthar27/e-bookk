import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  serverTimestamp,
  onSnapshot,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDI-1hIHMi9HjLCpob7kto2kh56Uu5pBSY",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "e-book-1b4d4.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "e-book-1b4d4",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "e-book-1b4d4.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "813933033349",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:813933033349:web:fcdc02fd50114ac783b6ec",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-W7C6X2Q4DV"
};

// Singleton Firebase initialization for Next.js App Router
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

export const GOOGLE_WEB_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  "813933033349-he7n23tar4fs6u08biho2l08gondnt9s.apps.googleusercontent.com";

googleProvider.setCustomParameters({
  prompt: 'select_account',
  client_id: GOOGLE_WEB_CLIENT_ID,
});

// Track whether Firestore database is provisioned and available
let isFirestoreAvailable = true;
let hasLoggedFirestoreNotice = false;

function checkFirestoreError(err) {
  const msg = err?.message || String(err);
  if (
    err?.code === 'not-found' ||
    msg.includes("Database '(default)' not found") ||
    msg.includes('(default)') ||
    err?.code === 'failed-precondition'
  ) {
    isFirestoreAvailable = false;
    if (!hasLoggedFirestoreNotice) {
      hasLoggedFirestoreNotice = true;
      console.info(
        '%c[Firebase Firestore Info]%c Database "(default)" has not been created yet in Firebase Console. Next.js app will run in local offline storage mode.',
        'background: #f59e0b; color: #000; font-weight: bold; padding: 2px 6px; border-radius: 4px;',
        'color: #94a3b8; font-weight: normal;'
      );
    }
    return true;
  }
  return false;
}

/**
 * Persists user record into Firestore 'users' collection
 */
export async function saveUserToDatabase(user, extraData = {}) {
  if (!user || !user.uid) return null;

  const displayName =
    user.displayName ||
    extraData.displayName ||
    extraData.name ||
    (user.email ? user.email.split('@')[0] : 'STAX Reader');

  const providerId =
    user.providerData?.[0]?.providerId ||
    extraData.providerId ||
    (user.email ? 'password' : 'google.com');

  const payload = {
    uid: user.uid,
    email: user.email || '',
    displayName,
    photoURL: user.photoURL || extraData.photoURL || null,
    phoneNumber: user.phoneNumber || null,
    providerId,
    emailVerified: Boolean(user.emailVerified),
    updatedAt: new Date().toISOString(),
    ...extraData,
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(`stax_user_${user.uid}`, JSON.stringify(payload));
    } catch (_) {}
  }

  if (!isFirestoreAvailable) return payload;

  try {
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, { ...payload, updatedAt: serverTimestamp() }, { merge: true });
    return payload;
  } catch (err) {
    checkFirestoreError(err);
    return payload;
  }
}

/**
 * Retrieves a user document by UID from Firestore
 */
export async function getUserFromDatabase(uid) {
  if (!uid) return null;

  if (typeof window !== 'undefined' && !isFirestoreAvailable) {
    try {
      const cached = localStorage.getItem(`stax_user_${uid}`);
      if (cached) return JSON.parse(cached);
    } catch (_) {}
    return null;
  }

  try {
    const snap = await getDoc(doc(db, 'users', uid));
    return snap.exists() ? snap.data() : null;
  } catch (err) {
    checkFirestoreError(err);
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(`stax_user_${uid}`);
        if (cached) return JSON.parse(cached);
      } catch (_) {}
    }
    return null;
  }
}

/**
 * Synchronizes the user's active cart to Firestore Database.
 */
export async function syncUserCartToDatabase(uid, cartItems = []) {
  if (!uid) return;
  const cleanCart = (cartItems || []).map((item) => ({
    id: item.id,
    title: item.title,
    titleEn: item.titleEn || item.title || '',
    author: item.author || '',
    price: item.price || 49,
    coverImage: item.coverImage || item.coverUrl || '',
  }));
  try {
    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, { cart: cleanCart, updatedAt: serverTimestamp() });
  } catch (err) {
    checkFirestoreError(err);
  }
}

/**
 * Synchronizes the user's wishlist / bookmark IDs to Firestore Database.
 */
export async function syncUserWishlistToDatabase(uid, wishlistIds = []) {
  if (!uid) return;
  const idsArray = Array.isArray(wishlistIds) ? wishlistIds : Array.from(wishlistIds || []);
  try {
    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, { wishlist: idsArray, updatedAt: serverTimestamp() });
  } catch (err) {
    checkFirestoreError(err);
  }
}

/**
 * Saves completed order to Firestore 'orders' collection
 */
export async function saveOrderToDatabase(orderData = {}) {
  const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const payload = {
    orderId,
    createdAt: new Date().toISOString(),
    status: 'completed',
    ...orderData,
  };

  if (!isFirestoreAvailable) return payload;

  try {
    const orderDocRef = doc(db, 'orders', orderId);
    await setDoc(orderDocRef, {
      ...payload,
      createdAtServer: serverTimestamp(),
    });
    return payload;
  } catch (err) {
    checkFirestoreError(err);
    return payload;
  }
}

/**
 * Records newly purchased books and completed order in the user's document.
 */
export async function recordUserPurchaseInDatabase(uid, bookIds = [], orderId = null) {
  if (!uid) return;
  try {
    const user = await getUserFromDatabase(uid);
    const existingBooks = Array.isArray(user?.purchasedBooks) ? user.purchasedBooks : [];
    const updatedBooks = Array.from(new Set([...existingBooks, ...bookIds]));

    const existingOrders = Array.isArray(user?.orders) ? user.orders : [];
    const updatedOrders = orderId ? Array.from(new Set([...existingOrders, orderId])) : existingOrders;

    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, {
      purchasedBooks: updatedBooks,
      orders: updatedOrders,
      cart: [],
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    checkFirestoreError(err);
  }
}

/**
 * Retrieves all orders for a specific user from Firestore.
 */
export async function getUserOrdersFromDatabase(uid) {
  if (!uid) return [];
  if (!isFirestoreAvailable) return [];

  try {
    const ordersCol = collection(db, 'orders');
    const q = query(ordersCol, where('userId', '==', uid));
    const snap = await getDocs(q);
    const results = [];
    snap.forEach((docSnap) => results.push({ id: docSnap.id, ...docSnap.data() }));
    return results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (err) {
    checkFirestoreError(err);
    return [];
  }
}

// Initialize Analytics on client side
export let analytics = null;
if (typeof window !== 'undefined') {
  isSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    })
    .catch(() => {});
}

export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  serverTimestamp,
  onSnapshot,
};

export default app;
