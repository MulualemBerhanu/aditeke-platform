import * as admin from "firebase-admin";

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
}

// Initialize Firebase Admin SDK using environment variables or a mock
let firebaseAdminInstance: admin.app.App | MockFirebaseAdmin;

try {
  // Check if we have the minimum Firebase credentials
  if (
    process.env.VITE_FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  ) {
    // Initialize the real Firebase Admin SDK
    const serviceAccount = {
      projectId: process.env.VITE_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    };
    
    // Initialize Firebase if it's not already initialized
    try {
      firebaseAdminInstance = admin.app();
    } catch {
      firebaseAdminInstance = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
    
    console.log("Firebase Admin SDK initialized successfully");
  } else {
    // Use a mock implementation for development
    firebaseAdminInstance = new MockFirebaseAdmin();
    console.warn("Using mock Firebase Admin (development mode)");
  }
} catch (error) {
  console.error("Error initializing Firebase Admin SDK:", error);
  // Fallback to mock implementation
  firebaseAdminInstance = new MockFirebaseAdmin();
  console.warn("Falling back to mock Firebase Admin implementation");
}

export default firebaseAdminInstance;