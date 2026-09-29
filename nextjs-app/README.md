# Next.js (App Router) + Firebase Auth E-Book Platform

A modern, responsive Sign-In and Authentication implementation for an e-book e-commerce platform built with **Next.js (App Router)**, **React**, **Tailwind CSS**, and **Firebase Authentication**.

---

## 📸 Architecture & Design

- **Split-Screen Layout**:
  - **Left**: Curated dark 3-column masonry grid featuring reader photography, e-book stats (**41%** and **76%** vibrant cards), and literary motifs.
  - **Right**: Clean, high-converting authentication card with Email/Password and one-click Google OAuth login.
- **Mobile First**: Automatically collapses into a sleek single-column view on small devices.
- **Firebase Auth**: Fast client-side authentication supporting Google Popup Sign-In (`signInWithPopup`), Email/Password registration (`createUserWithEmailAndPassword`), and login (`signInWithEmailAndPassword`).
- **Cart & Checkout**: Full page add to cart, order summary, and UPI QR Code checkout with Shankar Suthar Google Pay integration.

---

## 📁 File Structure

```text
nextjs-app/
├── .env.local.example
├── README.md
└── src/
    ├── middleware.js                 # Global route middleware
    ├── context/
    │   └── CartContext.jsx           # Global cart state management
    ├── app/
    │   ├── login/
    │   │   └── page.jsx              # Split-screen responsive Sign-In page (Firebase Auth)
    │   ├── library/
    │   │   └── page.jsx              # Protected user library (Firebase Auth)
    │   └── cart/
    │       └── page.jsx              # Full-page cart & UPI QR checkout
    └── utils/
        └── firebase/
            └── client.js             # Firebase client SDK initialization & auth helpers
```

---

## ⚙️ Environment Variables

Create `.env.local` in your Next.js project root:

```env
# Firebase Web App Credentials (from Firebase Console > Project Settings > General > Your Apps)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyYourFirebaseApiKey
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456

# Optional: Production site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 🚀 Setup & Firebase Authentication

### 1. Install Required Dependencies
```bash
npm install firebase lucide-react
```

### 2. Configure Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/) and select or create your project.
2. Under **Build** -> **Authentication**, click **Get Started**.
3. Under **Sign-in method**, enable:
   - **Email/Password**
   - **Google** (Select project support email and save)
4. Under **Project Settings** -> **General** -> **Your apps**, create a **Web App** (</>) and copy your `firebaseConfig` keys into `.env.local`.

### 3. Run Development Server
```bash
npm run dev
```
Visit `http://localhost:3000/login` to see the live split-screen Sign-In page and `http://localhost:3000/cart` for the cart & checkout!
