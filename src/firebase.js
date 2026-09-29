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

// Your web app's Firebase configuration provided by Firebase Console
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDI-1hIHMi9HjLCpob7kto2kh56Uu5pBSY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "e-book-1b4d4.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "e-book-1b4d4",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "e-book-1b4d4.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "813933033349",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:813933033349:web:fcdc02fd50114ac783b6ec",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-W7C6X2Q4DV"
};

// Initialize Firebase App singleton
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Firebase Firestore Database
export const db = getFirestore(app);

export const GOOGLE_WEB_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  "813933033349-he7n23tar4fs6u08biho2l08gondnt9s.apps.googleusercontent.com";

// Google OAuth parameters (prompt account picker with Web Client ID)
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
        '%c[Firebase Firestore Info]%c Database "(default)" has not been created yet in Firebase Console for project "e-book-1b4d4". Running seamlessly in local offline storage mode.\n\nTo enable Cloud Firestore:\n1. Visit https://console.firebase.google.com/project/e-book-1b4d4/firestore\n2. Click "Create database" with ID "(default)"\n3. Select your location and test mode.',
        'background: #f59e0b; color: #000; font-weight: bold; padding: 2px 6px; border-radius: 4px;',
        'color: #94a3b8; font-weight: normal;'
      );
    }
    return true;
  }
  return false;
}

/**
 * Saves or updates a user document in the Firebase Firestore Database ('users' collection).
 * Stores comprehensive user profile and auth metadata.
 * Gracefully falls back to localStorage if Firestore is not yet provisioned.
 *
 * @param {import('firebase/auth').User | object} user - The authenticated Firebase user object
 * @param {object} [extraData={}] - Additional profile metadata (e.g. source, name, cart)
 * @returns {Promise<object|null>} The saved user payload
 */
export async function saveUserToDatabase(user, extraData = {}) {
  if (!user || !user.uid) {
    return null;
  }

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

  // Keep local backup copy in localStorage
  try {
    localStorage.setItem(`stax_user_${user.uid}`, JSON.stringify({
      ...payload,
      savedAt: new Date().toISOString(),
    }));
  } catch (_) {}

  // If Firestore is already determined to be not created yet, skip network call
  if (!isFirestoreAvailable) {
    return payload;
  }

  try {
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(
      userDocRef,
      {
        ...payload,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    console.log(`[Firebase DB] ✅ Profile saved to Cloud Firestore for: ${payload.email || user.uid}`);
    return payload;
  } catch (err) {
    const isMissingDb = checkFirestoreError(err);
    if (!isMissingDb) {
      console.warn('[Firebase DB] Could not sync user to Firestore:', err.message);
    }
    return payload;
  }
}

/**
 * Retrieves a user document from the Firebase Firestore Database.
 * Falls back to localStorage cache if Firestore is unprovisioned or offline.
 *
 * @param {string} uid - Firebase Auth UID
 * @returns {Promise<object|null>}
 */
export async function getUserFromDatabase(uid) {
  if (!uid) return null;

  if (!isFirestoreAvailable) {
    try {
      const cached = localStorage.getItem(`stax_user_${uid}`);
      if (cached) return JSON.parse(cached);
    } catch (_) {}
    return null;
  }

  try {
    const userDocRef = doc(db, 'users', uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (err) {
    checkFirestoreError(err);
    try {
      const cached = localStorage.getItem(`stax_user_${uid}`);
      if (cached) return JSON.parse(cached);
    } catch (_) {}
    return null;
  }
}

/**
 * Updates specific fields on an existing user in the Firebase database.
 * Falls back to localStorage cache if Firestore is unprovisioned.
 *
 * @param {string} uid - User UID
 * @param {object} updates - Fields to update
 */
export async function updateUserDataInDatabase(uid, updates = {}) {
  if (!uid) return;

  // Always update local cache
  try {
    const cached = localStorage.getItem(`stax_user_${uid}`);
    const data = cached ? JSON.parse(cached) : {};
    localStorage.setItem(`stax_user_${uid}`, JSON.stringify({ ...data, ...updates }));
  } catch (_) {}

  if (!isFirestoreAvailable) return;

  try {
    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    console.log(`[Firebase DB] ✅ Updated Firestore fields for user ${uid}`);
  } catch (err) {
    checkFirestoreError(err);
  }
}

/**
 * Saves a completed purchase order to Cloud Firestore ('orders' collection).
 *
 * @param {object} orderData - Information about the purchased items, amount, user UID, and payment method
 * @returns {Promise<object|null>}
 */
export async function saveOrderToDatabase(orderData = {}) {
  const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const payload = {
    orderId,
    createdAt: new Date().toISOString(),
    status: 'completed',
    ...orderData,
  };

  try {
    localStorage.setItem(`stax_order_${orderId}`, JSON.stringify(payload));
  } catch (_) {}

  if (!isFirestoreAvailable) return payload;

  try {
    const orderDocRef = doc(db, 'orders', orderId);
    await setDoc(orderDocRef, {
      ...payload,
      createdAtServer: serverTimestamp(),
    });
    console.log(`[Firebase DB] ✅ Successfully recorded order ${orderId} in Cloud Firestore.`);
    return payload;
  } catch (err) {
    checkFirestoreError(err);
    return payload;
  }
}

/**
 * Synchronizes the user's active cart to Firestore Database.
 *
 * @param {string} uid - User UID
 * @param {Array} cartItems - Array of book items
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
    category: item.category || 'Hindi Literature',
  }));
  return updateUserDataInDatabase(uid, { cart: cleanCart });
}

/**
 * Synchronizes the user's wishlist / bookmark IDs to Firestore Database.
 *
 * @param {string} uid - User UID
 * @param {Array|Set} wishlistIds - Array or Set of book IDs
 */
export async function syncUserWishlistToDatabase(uid, wishlistIds = []) {
  if (!uid) return;
  const idsArray = Array.isArray(wishlistIds) ? wishlistIds : Array.from(wishlistIds || []);
  return updateUserDataInDatabase(uid, { wishlist: idsArray });
}

/**
 * Records newly purchased books and completed order in the user's document.
 *
 * @param {string} uid - User UID
 * @param {Array} bookIds - Array of purchased book IDs
 * @param {string} orderId - Associated order ID
 */
export async function recordUserPurchaseInDatabase(uid, bookIds = [], orderId = null) {
  if (!uid) return;
  try {
    const user = await getUserFromDatabase(uid);
    const existingBooks = Array.isArray(user?.purchasedBooks) ? user.purchasedBooks : [];
    const updatedBooks = Array.from(new Set([...existingBooks, ...bookIds]));

    const existingOrders = Array.isArray(user?.orders) ? user.orders : [];
    const updatedOrders = orderId ? Array.from(new Set([...existingOrders, orderId])) : existingOrders;

    await updateUserDataInDatabase(uid, {
      purchasedBooks: updatedBooks,
      orders: updatedOrders,
      cart: [], // Clear cart in database after successful purchase
    });
    console.log(`[Firebase DB] ✅ Recorded ${bookIds.length} purchased books for user ${uid}.`);
  } catch (err) {
    console.warn('[Firebase DB] Could not record purchase in user doc:', err);
  }
}

/**
 * Retrieves all orders for a specific user from Firestore.
 *
 * @param {string} uid - User UID
 * @returns {Promise<Array>}
 */
export async function getUserOrdersFromDatabase(uid) {
  if (!uid) return [];

  // Offline / fallback cache check
  const getOfflineOrders = () => {
    try {
      const orders = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('stax_order_')) {
          const item = JSON.parse(localStorage.getItem(key));
          if (item && (item.userId === uid || item.userId === 'guest')) {
            orders.push(item);
          }
        }
      }
      return orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (_) {
      return [];
    }
  };

  if (!isFirestoreAvailable) {
    return getOfflineOrders();
  }

  try {
    const ordersCol = collection(db, 'orders');
    const q = query(ordersCol, where('userId', '==', uid));
    const snap = await getDocs(q);
    const results = [];
    snap.forEach((docSnap) => {
      results.push({ id: docSnap.id, ...docSnap.data() });
    });
    results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return results.length > 0 ? results : getOfflineOrders();
  } catch (err) {
    checkFirestoreError(err);
    return getOfflineOrders();
  }
}

// Initialize Analytics safely on client side
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
