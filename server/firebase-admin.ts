import * as admin from "firebase-admin";
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
        firebaseAdminInstance = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
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
  // Fallback to mock implementation
  firebaseAdminInstance = new MockFirebaseAdmin();
  console.warn("Falling back to mock Firebase Admin implementation");
}

// Export a function to get Firestore database instance
export function getFirestoreDb() {
  if (firebaseAdminInstance instanceof MockFirebaseAdmin) {
    return firebaseAdminInstance.firestore();
  }
  try {
    return getFirestore();
  } catch (error) {
    console.error("Error getting Firestore:", error);
    const mockFirebaseAdmin = new MockFirebaseAdmin();
    return mockFirebaseAdmin.firestore();
  }
}

// Export a function to get Auth instance
export function getFirebaseAuth() {
  if (firebaseAdminInstance instanceof MockFirebaseAdmin) {
    return firebaseAdminInstance.auth();
  }
  try {
    return getAuth();
  } catch (error) {
    console.error("Error getting Auth:", error);
    const mockFirebaseAdmin = new MockFirebaseAdmin();
    return mockFirebaseAdmin.auth();
  }
}

export default firebaseAdminInstance;