import admin from "firebase-admin";
import { applicationDefault, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { ServiceAccount } from "firebase-admin";

// Mock Firebase Admin for development if credentials are missing
class MockFirebaseAdmin {
  auth() {
    return {
      verifyIdToken: async (token: string) => {
        console.log("Mock Firebase verifying token:", token.substring(0, 10) + "...");
        // Return a mock decoded token (would be validated in production)
        return {
          uid: "mock-user-id",
          email: "mock-user@example.com",
          name: "Mock User",
          picture: null
        };
      }
    };
  }
  
  firestore() {
    // Mock firestore implementation
    return {
      collection: () => {
        return {
          doc: () => {},
          add: () => {},
          get: async () => ({ empty: true, docs: [] }),
          where: () => ({
            get: async () => ({ empty: true, docs: [] })
          })
        };
      }
    };
  }
}

// Initialize Firebase Admin SDK using environment variables or a mock
let firebaseAdminInstance: any; // Using any type to accommodate both real Firebase and mock

try {
  // Check if we have the minimum Firebase credentials
  if (
    process.env.VITE_FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  ) {
    // Initialize the real Firebase Admin SDK
    const serviceAccount: ServiceAccount = {
      projectId: process.env.VITE_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    };
    
    try {
      // Try to get existing app
      firebaseAdminInstance = admin.app();
      console.log("Using existing Firebase Admin SDK instance");
    } catch {
      // Initialize new app
      try {
        // Use the directly imported cert function
        firebaseAdminInstance = admin.initializeApp({
          credential: cert(serviceAccount as any),
        });
        console.log("Firebase Admin SDK initialized successfully");
      } catch (initError) {
        console.error("Error during Firebase initialization:", initError);
        throw initError;
      }
    }
    
    // Test the Firebase connection
    try {
      const db = getFirestore();
      const auth = getAuth();
      console.log("Firebase services are available");
    } catch (serviceError) {
      console.error("Error accessing Firebase services:", serviceError);
      throw serviceError;
    }
  } else {
    console.warn("Firebase credentials missing - using mock implementation");
    firebaseAdminInstance = new MockFirebaseAdmin();
  }
} catch (error) {
  console.error("Error initializing Firebase Admin SDK:", error);
  
  // Only use mock in development, not in production
  if (process.env.NODE_ENV === 'development') {
    firebaseAdminInstance = new MockFirebaseAdmin();
    console.warn("WARNING: Using mock Firebase implementation for development only");
  } else {
    console.error("CRITICAL: Firebase initialization failed in production environment");
    // In production, we don't want to use mock implementations
    // This will cause Firebase operations to fail rather than use insecure mocks
    firebaseAdminInstance = null;
  }
}

// Export a function to get Firestore database instance
export function getFirestoreDb() {
  if (!firebaseAdminInstance) {
    console.error("Firestore request failed - Firebase Admin not initialized");
    throw new Error("Firebase Firestore not available");
  }
  
  if (firebaseAdminInstance instanceof MockFirebaseAdmin) {
    if (process.env.NODE_ENV === 'production') {
      console.error("CRITICAL: Attempted to use mock Firestore in production");
      throw new Error("Firebase Firestore not properly configured");
    }
    console.warn("Using mock Firestore implementation (development only)");
    return firebaseAdminInstance.firestore();
  }
  
  try {
    return getFirestore();
  } catch (error) {
    console.error("Error getting Firestore:", error);
    
    // Only use mock in development mode
    if (process.env.NODE_ENV === 'development') {
      console.warn("Falling back to mock Firestore (development only)");
      const mockFirebaseAdmin = new MockFirebaseAdmin();
      return mockFirebaseAdmin.firestore();
    } else {
      throw new Error("Firebase Firestore service unavailable");
    }
  }
}

// Export a function to get Auth instance
export function getFirebaseAuth() {
  if (!firebaseAdminInstance) {
    console.error("Auth request failed - Firebase Admin not initialized");
    throw new Error("Firebase Authentication not available");
  }
  
  if (firebaseAdminInstance instanceof MockFirebaseAdmin) {
    if (process.env.NODE_ENV === 'production') {
      console.error("CRITICAL: Attempted to use mock Auth in production");
      throw new Error("Firebase Authentication not properly configured");
    }
    console.warn("Using mock Authentication implementation (development only)");
    return firebaseAdminInstance.auth();
  }
  
  try {
    return getAuth();
  } catch (error) {
    console.error("Error getting Auth:", error);
    
    // Only use mock in development mode
    if (process.env.NODE_ENV === 'development') {
      console.warn("Falling back to mock Authentication (development only)");
      const mockFirebaseAdmin = new MockFirebaseAdmin();
      return mockFirebaseAdmin.auth();
    } else {
      throw new Error("Firebase Authentication service unavailable");
    }
  }
}

export default firebaseAdminInstance;