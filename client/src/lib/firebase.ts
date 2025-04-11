import { initializeApp } from "firebase/app";
import { getAuth, signInWithRedirect, getRedirectResult, GoogleAuthProvider, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Use environment variables or fallback to empty string
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || ""}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || ""}.appspot.com`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
};

// Initialize Firebase if key is available
let app: ReturnType<typeof initializeApp> | undefined;
let auth: ReturnType<typeof getAuth> | undefined;
let db: ReturnType<typeof getFirestore> | undefined;
let storage: ReturnType<typeof getStorage> | undefined;
let googleProvider: GoogleAuthProvider | undefined;

if (firebaseConfig.apiKey) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  googleProvider = new GoogleAuthProvider();
} else {
  console.warn("Firebase configuration is not available. Firebase services will be disabled.");
}

// Authentication functions
export const loginWithGoogle = async () => {
  if (!auth || !googleProvider) {
    console.error("Firebase auth is not initialized");
    return null;
  }
  
  try {
    await signInWithRedirect(auth, googleProvider);
    return null; // User will be available after redirect
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

export const getAuthResult = async () => {
  if (!auth) {
    console.error("Firebase auth is not initialized");
    return null;
  }
  
  try {
    const result = await getRedirectResult(auth);
    return result?.user || null;
  } catch (error) {
    console.error("Error getting auth result:", error);
    throw error;
  }
};

export const logoutUser = async () => {
  if (!auth) {
    console.error("Firebase auth is not initialized");
    return;
  }
  
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

export { auth, db, storage };
