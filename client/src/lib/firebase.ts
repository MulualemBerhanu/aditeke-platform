import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult,
  signOut,
  Auth
} from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
let firebaseApp;
let auth: Auth | null = null;

try {
  // Only initialize if we have the minimum required config
  if (import.meta.env.VITE_FIREBASE_API_KEY && 
      import.meta.env.VITE_FIREBASE_PROJECT_ID && 
      import.meta.env.VITE_FIREBASE_APP_ID) {
    firebaseApp = initializeApp(firebaseConfig);
    auth = getAuth(firebaseApp);
    console.log('Firebase initialized successfully');
  } else {
    console.warn('Firebase not initialized: Missing environment variables');
  }
} catch (error) {
  console.error('Error initializing Firebase:', error);
}

// Google sign-in provider
const googleProvider = new GoogleAuthProvider();

// Login with Google
// Use redirect method for Replit compatibility (popup may not work in some environments)
export const loginWithGoogle = async () => {
  if (!auth) {
    throw new Error('Firebase Auth not initialized');
  }
  
  try {
    // Using redirect for better compatibility with iframes & Replit environment
    await signInWithRedirect(auth, googleProvider);
  } catch (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }
};

// Handle the redirect result
export const handleRedirectResult = async () => {
  if (!auth) {
    return null;
  }
  
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      // User successfully signed in with redirect
      const user = result.user;
      // Get the ID token to send to your backend
      const idToken = await user.getIdToken();
      return { user, idToken };
    }
    return null;
  } catch (error) {
    console.error('Error handling redirect:', error);
    throw error;
  }
};

// Get auth result - helper function for login page
export const getAuthResult = async () => {
  return handleRedirectResult();
};

// Logout user
export const logoutUser = async () => {
  if (!auth) {
    return;
  }
  
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

// Export auth instance for use throughout the app
export { auth };