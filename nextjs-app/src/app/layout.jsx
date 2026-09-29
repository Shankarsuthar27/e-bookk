import { CartProvider } from '@/context/CartContext';
import './globals.css';

export const metadata = {
  title: 'STAX E-Books — Cart & Checkout',
  description: 'Modern E-Book Cart and Checkout with integrated QR scanner and UPI payments.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#f8fafc] text-slate-900 min-h-screen">
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
