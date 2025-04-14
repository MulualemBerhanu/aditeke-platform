import { initializeFirestoreData } from "./firebaseInitData";

/**
 * Initializes the Firebase database with required collections and default data
 */
export const initializeFirebaseDatabase = async () => {
  try {
    // Initialize Firestore with roles and default users
    await initializeFirestoreData();
    console.log("Firebase database initialization complete!");
  } catch (error) {
    console.error("Error initializing Firebase database:", error);
    throw error;
  }
};