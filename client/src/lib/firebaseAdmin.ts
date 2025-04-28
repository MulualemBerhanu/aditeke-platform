import { initializeFirestoreData } from "./firebaseInitData";

/**
 * Initializes the Firebase database with required collections and default data
 */
export const initializeFirebaseDatabase = async () => {
  try {
    // Initialize Firestore with roles and default users
    await initializeFirestoreData();
    // Initialization complete - silent in production
  } catch (error) {
    // Error handling - silent in production
    throw error;
  }
};