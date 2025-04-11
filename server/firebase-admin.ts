import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK using environment variables
// In a production environment, you should use a secure method for storing these credentials
let firebaseAdmin: admin.app.App | undefined;

try {
  if (process.env.VITE_FIREBASE_PROJECT_ID) {
    firebaseAdmin = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.VITE_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL || undefined,
        privateKey: process.env.FIREBASE_PRIVATE_KEY ? 
          process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n") : 
          undefined,
      }),
      databaseURL: `https://${process.env.VITE_FIREBASE_PROJECT_ID}.firebaseio.com`,
    });
    console.log("Firebase Admin SDK initialized successfully");
  } else {
    console.warn("Firebase Admin SDK initialization skipped due to missing credentials");
  }
} catch (error) {
  console.error("Error initializing Firebase Admin SDK:", error);
}

export default firebaseAdmin;