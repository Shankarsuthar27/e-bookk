'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

const CartContext = createContext(null);

// Initial starter demo books in cart
const INITIAL_DEMO_CART = [
  {
    id: 'godaan-1',
    title: 'गोदान (Godaan)',
    author: 'मुंशी प्रेमचंद (Munshi Premchand)',
    price: 49,
    originalPrice: 199,
    coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80',
    category: 'Classics',
    isSecretBook: false,
  },
  {
    id: 'jaun-1',
    title: 'जौन एलिया - शायरी व गज़ल संग्रह',
    author: 'जौन एलिया (Jaun Elia)',
    price: 49,
    originalPrice: 149,
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&auto=format&fit=crop&q=80',
    category: 'Poetry',
    isSecretBook: false,
  },
];

// Special Secret/Collector's Edition E-Book unlocked via Shankar Suthar UPI QR Code
const SECRET_COLLECTORS_EBOOK = {
  id: 'madhushala-special',
  title: 'मधुशाला (Madhushala) - Special Collector Edition',
  author: 'हरिवंश राय बच्चन (Harivansh Rai Bachchan)',
  price: 0,
  originalPrice: 199,
  coverImage: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&auto=format&fit=crop&q=80',
  category: 'Collector Exclusive',
  isSecretBook: true,
  badge: 'QR Exclusive · FREE',
};

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(INITIAL_DEMO_CART);
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [secretBookUnlocked, setSecretBookUnlocked] = useState(false);
  const [toast, setToast] = useState(null);

  // Auto-clear toast after 4s
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ id: Date.now(), message, type });
  }, []);

  // Add item to cart
  const addToCart = useCallback((book) => {
    setCartItems((prev) => {
      const exists = prev.some((item) => item.id === book.id);
      if (exists) {
        showToast(`"${book.title}" is already in your cart!`, 'info');
        return prev;
      }
      showToast(`Added "${book.title}" to cart!`, 'success');
      return [...prev, book];
    });
  }, [showToast]);

  // Remove item from cart
  const removeFromCart = useCallback((bookId) => {
    setCartItems((prev) => {
      const itemToRemove = prev.find((item) => item.id === bookId);
      if (itemToRemove?.isSecretBook) {
        setSecretBookUnlocked(false);
      }
      if (itemToRemove) {
        showToast(`Removed "${itemToRemove.title}" from cart`, 'info');
      }
      return prev.filter((item) => item.id !== bookId);
    });
  }, [showToast]);

  // Clear entire cart
  const clearCart = useCallback(() => {
    setCartItems([]);
    setAppliedDiscount(null);
    setSecretBookUnlocked(false);
  }, []);

  /**
   * QR Action Logic:
   * Parses decoded QR string and triggers:
   * 1. If Shankar Suthar UPI QR: Applies ₹20 discount AND unlocks exclusive Collector's Edition e-book!
   * 2. If promo coupon code: Applies percentage or flat discount
   * 3. If book identifier: Adds specified e-book to cart
   */
  const scanQRCode = useCallback((decodedText) => {
    const raw = (decodedText || '').trim();
    if (!raw) return { success: false, message: 'Empty QR code' };

    // Case 1: Shankar Suthar UPI QR Code (Google Pay)
    // Format: upi://pay?pa=ss2137789@okhdfcbank&pn=shankar%20suthar&aid=...
    if (
      raw.includes('ss2137789') ||
      raw.toLowerCase().includes('shankar') ||
      raw.startsWith('upi://pay')
    ) {
      setAppliedDiscount({
        code: 'SHANKAR-UPI-VIP',
        amount: 20,
        type: 'flat',
        label: 'Shankar Suthar UPI Promo (-₹20)',
        upiId: 'ss2137789@okhdfcbank',
        payee: 'shankar suthar',
      });

      // Automatically add the hidden/special e-book to the cart
      setCartItems((prev) => {
        const alreadyHasSecret = prev.some((b) => b.id === SECRET_COLLECTORS_EBOOK.id);
        if (!alreadyHasSecret) {
          setSecretBookUnlocked(true);
          return [SECRET_COLLECTORS_EBOOK, ...prev];
        }
        return prev;
      });

      showToast(
        '🎉 Verified Shankar Suthar UPI QR! ₹20 discount applied + Special Collector’s Edition unlocked!',
        'success'
      );

      return {
        success: true,
        type: 'upi_promo',
        message: 'Shankar Suthar UPI VIP discount applied & secret e-book unlocked!',
      };
    }

    // Case 2: General Promotional Codes
    if (raw.toUpperCase().includes('STAX20') || raw.toUpperCase().includes('SAVE20')) {
      setAppliedDiscount({
        code: 'STAX20',
        amount: 20,
        type: 'flat',
        label: 'Promo Code STAX20 (-₹20)',
      });
      showToast('🎉 QR Coupon STAX20 Applied! ₹20 saved.', 'success');
      return { success: true, type: 'discount', message: '₹20 discount applied!' };
    }

    if (raw.toUpperCase().includes('FREEBOOK') || raw.toUpperCase().includes('COLLECTOR')) {
      setCartItems((prev) => {
        if (!prev.some((b) => b.id === SECRET_COLLECTORS_EBOOK.id)) {
          setSecretBookUnlocked(true);
          return [SECRET_COLLECTORS_EBOOK, ...prev];
        }
        return prev;
      });
      showToast('📖 Special E-Book Unlocked & Added to Cart!', 'success');
      return { success: true, type: 'secret_book', message: 'Special e-book added!' };
    }

    // Default fallback: treat as custom promo
    setAppliedDiscount({
      code: 'SPECIAL-QR',
      amount: 10,
      type: 'flat',
      label: 'Special QR Discount (-₹10)',
    });
    showToast('✨ QR Code recognized! ₹10 promotional discount applied.', 'success');
    return { success: true, type: 'general', message: '₹10 discount applied!' };
  }, [showToast]);

  // Financial Computations
  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + (item.price || 0), 0);
  }, [cartItems]);

  const discountAmount = useMemo(() => {
    if (!appliedDiscount) return 0;
    if (appliedDiscount.type === 'flat') {
      return Math.min(appliedDiscount.amount, subtotal);
    }
    if (appliedDiscount.type === 'percent') {
      return Math.round((subtotal * appliedDiscount.percentage) / 100);
    }
    return 0;
  }, [appliedDiscount, subtotal]);

  const finalTotal = useMemo(() => {
    return Math.max(0, subtotal - discountAmount);
  }, [subtotal, discountAmount]);

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    clearCart,
    appliedDiscount,
    secretBookUnlocked,
    scanQRCode,
    subtotal,
    discountAmount,
    finalTotal,
    itemCount: cartItems.length,
    toast,
    showToast,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
