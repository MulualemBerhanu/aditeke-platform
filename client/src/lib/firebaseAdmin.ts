import { db } from "./firebase";
import { doc, setDoc, getDoc, Timestamp, writeBatch } from "firebase/firestore";

/**
 * Initializes the roles collection in Firestore if it doesn't exist
 */
export const initializeRolesCollection = async () => {
  console.log("Checking if roles collection is initialized...");
  
  try {
    // Check if Admin role exists
    const adminRoleRef = doc(db, "roles", "1");
    const adminRoleDoc = await getDoc(adminRoleRef);
    
    // If admin role exists, assume roles are initialized
    if (adminRoleDoc.exists()) {
      console.log("Roles collection is already initialized.");
      return;
    }
    
    console.log("Initializing roles collection...");
    
    // Create batch to add all roles at once
    const batch = writeBatch(db);
    
    // Add Admin role
    batch.set(doc(db, "roles", "1"), {
      name: "Admin",
      description: "Full access to all system functions",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      permissions: {
        users: { create: true, read: true, update: true, delete: true },
        projects: { create: true, read: true, update: true, delete: true },
        services: { create: true, read: true, update: true, delete: true },
        blogPosts: { create: true, read: true, update: true, delete: true },
        testimonials: { create: true, read: true, update: true, delete: true },
        jobs: { create: true, read: true, update: true, delete: true },
        contactMessages: { create: true, read: true, update: true, delete: true }
      }
    });
    
    // Add Manager role
    batch.set(doc(db, "roles", "2"), {
      name: "Manager",
      description: "Manages projects and clients",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      permissions: {
        users: { create: false, read: true, update: false, delete: false },
        projects: { create: true, read: true, update: true, delete: false },
        services: { create: false, read: true, update: false, delete: false },
        blogPosts: { create: true, read: true, update: true, delete: false },
        testimonials: { create: true, read: true, update: true, delete: false },
        jobs: { create: false, read: true, update: false, delete: false },
        contactMessages: { create: false, read: true, update: true, delete: false }
      }
    });
    
    // Add Client role
    batch.set(doc(db, "roles", "3"), {
      name: "Client",
      description: "Client with access to their projects",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      permissions: {
        users: { create: false, read: false, update: false, delete: false },
        projects: { create: false, read: true, update: false, delete: false },
        services: { create: false, read: true, update: false, delete: false },
        blogPosts: { create: false, read: true, update: false, delete: false },
        testimonials: { create: true, read: true, update: false, delete: false },
        jobs: { create: false, read: true, update: false, delete: false },
        contactMessages: { create: true, read: false, update: false, delete: false }
      }
    });
    
    // Commit the batch
    await batch.commit();
    
    console.log("Roles collection initialized successfully.");
  } catch (error) {
    console.error("Error initializing roles collection:", error);
    throw error;
  }
};

/**
 * Creates initial admin user if no users exist
 */
export const createInitialAdminUser = async () => {
  try {
    // Check if we need to create the default admin
    // This function is meant to be called from registration page or admin setup
    console.log("This function would create an initial admin user if implemented.");
  } catch (error) {
    console.error("Error creating initial admin user:", error);
    throw error;
  }
};

export const initializeFirebaseDatabase = async () => {
  try {
    await initializeRolesCollection();
    console.log("Firebase database initialization complete!");
  } catch (error) {
    console.error("Error initializing Firebase database:", error);
  }
};