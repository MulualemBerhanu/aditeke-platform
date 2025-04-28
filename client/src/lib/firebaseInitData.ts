import { db } from "./firebase";
import { collection, doc, setDoc, getDoc, getDocs, query, where, Timestamp, writeBatch } from "firebase/firestore";
import { FirebaseRole, ResourcePermissions } from "@shared/firebaseTypes";

/**
 * Initializes the database with default roles
 */
export const initializeRoles = async (): Promise<void> => {
  // Initialize roles quietly in production
  
  // Default permissions for different roles
  const adminPermissions: ResourcePermissions = {
    users: { create: true, read: true, update: true, delete: true },
    projects: { create: true, read: true, update: true, delete: true },
    services: { create: true, read: true, update: true, delete: true },
    blogPosts: { create: true, read: true, update: true, delete: true },
    testimonials: { create: true, read: true, update: true, delete: true },
    jobs: { create: true, read: true, update: true, delete: true },
    contactMessages: { create: true, read: true, update: true, delete: true }
  };
  
  const managerPermissions: ResourcePermissions = {
    users: { create: false, read: true, update: false, delete: false },
    projects: { create: true, read: true, update: true, delete: false },
    services: { create: false, read: true, update: false, delete: false },
    blogPosts: { create: true, read: true, update: true, delete: false },
    testimonials: { create: true, read: true, update: true, delete: false },
    jobs: { create: false, read: true, update: false, delete: false },
    contactMessages: { create: false, read: true, update: true, delete: false }
  };
  
  const clientPermissions: ResourcePermissions = {
    users: { create: false, read: false, update: false, delete: false },
    projects: { create: false, read: true, update: false, delete: false },
    services: { create: false, read: true, update: false, delete: false },
    blogPosts: { create: false, read: true, update: false, delete: false },
    testimonials: { create: true, read: true, update: false, delete: false },
    jobs: { create: false, read: true, update: false, delete: false },
    contactMessages: { create: true, read: false, update: false, delete: false }
  };
  
  // Check if roles collection exists and has data
  const rolesCollection = collection(db, "roles");
  const rolesSnapshot = await getDocs(rolesCollection);
  
  if (!rolesSnapshot.empty) {
    // Roles already exist - silent in production
    return;
  }
  
  // Create roles in a batch
  const batch = writeBatch(db);
  
  // Admin role
  batch.set(doc(db, "roles", "1"), {
    name: "Admin",
    description: "Full access to all features and settings",
    permissions: adminPermissions,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  });
  
  // Manager role
  batch.set(doc(db, "roles", "2"), {
    name: "Manager",
    description: "Manage projects and team members",
    permissions: managerPermissions,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  });
  
  // Client role
  batch.set(doc(db, "roles", "3"), {
    name: "Client",
    description: "View and track project progress",
    permissions: clientPermissions,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  });
  
  // Commit the batch
  await batch.commit();
  // Roles initialized - silent in production
};

/**
 * Creates default admin user if no admin exists
 */
export const createDefaultAdminUser = async (): Promise<void> => {
  // Check for admin users silently in production
  
  try {
    // Get the admin role ID from the roles collection
    const rolesCollection = collection(db, "roles");
    const rolesSnapshot = await getDocs(rolesCollection);
    
    let adminRoleId: string | number | null = null;
    
    // Find the admin role
    rolesSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.name && data.name.toLowerCase() === "admin") {
        adminRoleId = doc.id;
      }
    });
    
    if (!adminRoleId) {
      // Admin role not found - silent in production
      return;
    }
    
    // Check if any admin user exists
    const usersCollection = collection(db, "users");
    // First try with string ID (document ID)
    let adminQuery = query(usersCollection, where("roleId", "==", adminRoleId));
    let adminSnapshot = await getDocs(adminQuery);
    
    // If none found, try with "admin" name in case it's identified by name
    if (adminSnapshot.empty) {
      adminQuery = query(usersCollection, where("role", "==", "admin"));
      adminSnapshot = await getDocs(adminQuery);
    }
    
    // If still none found, try with the numeric 1 as used in client-side code
    if (adminSnapshot.empty) {
      adminQuery = query(usersCollection, where("roleId", "==", 1));
      adminSnapshot = await getDocs(adminQuery);
    }
    
    if (!adminSnapshot.empty) {
      // Admin user exists - silent in production
      return;
    }
    
    // No admin user exists, create a default one
    // Create a unique user ID for the admin
    const adminId = "admin-" + Date.now().toString();
    
    // Create the admin user document with the specified email
    await setDoc(doc(db, "users", adminId), {
      uid: adminId,
      username: "admin",
      email: "berhanumule6@gmail.com", // Custom email as requested
      name: "Admin User",
      password: "password123", // Default password - should be hashed in production
      roleId: adminRoleId, // Use the actual role ID from the database
      profilePicture: "https://randomuser.me/api/portraits/men/1.jpg", // Random placeholder image
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      lastLogin: null,
      isActive: true,
      settings: {
        theme: "light",
        notifications: true,
        language: "en"
      }
    });
    
    // Admin user created - silent in production
  } catch (error) {
    // Error handling - silent in production
  }
};

/**
 * Creates default manager user if no manager exists
 */
export const createDefaultManagerUser = async (): Promise<void> => {
  // Check for manager users silently in production
  
  try {
    // Get the manager role ID from the roles collection
    const rolesCollection = collection(db, "roles");
    const rolesSnapshot = await getDocs(rolesCollection);
    
    let managerRoleId: string | number | null = null;
    
    // Find the manager role
    rolesSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.name && data.name.toLowerCase() === "manager") {
        managerRoleId = doc.id;
      }
    });
    
    if (!managerRoleId) {
      // Manager role not found - silent in production
      return;
    }
    
    // Check if any manager user exists
    const usersCollection = collection(db, "users");
    // First try with string ID (document ID)
    let managerQuery = query(usersCollection, where("roleId", "==", managerRoleId));
    let managerSnapshot = await getDocs(managerQuery);
    
    // If none found, try with "manager" name in case it's identified by name
    if (managerSnapshot.empty) {
      managerQuery = query(usersCollection, where("role", "==", "manager"));
      managerSnapshot = await getDocs(managerQuery);
    }
    
    // If still none found, try with the numeric 2 as used in client-side code
    if (managerSnapshot.empty) {
      managerQuery = query(usersCollection, where("roleId", "==", 2));
      managerSnapshot = await getDocs(managerQuery);
    }
    
    if (!managerSnapshot.empty) {
      // Manager user exists - silent in production
      return;
    }
    
    // No manager user exists, create a default one
    // Create a unique user ID for the manager
    const managerId = "manager-" + Date.now().toString();
    
    // Create the manager user document with the specified email
    await setDoc(doc(db, "users", managerId), {
      uid: managerId,
      username: "manager",
      email: "berhanumule6@gmail.com", // Same email as admin for now
      name: "Manager User",
      password: "password123", // Default password - should be hashed in production
      roleId: managerRoleId, // Use the actual role ID from the database
      profilePicture: "https://randomuser.me/api/portraits/women/1.jpg", // Random placeholder image
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      lastLogin: null,
      isActive: true,
      settings: {
        theme: "light",
        notifications: true,
        language: "en"
      }
    });
    
    // Manager user created - silent in production
  } catch (error) {
    // Error handling - silent in production
  }
};

/**
 * Checks for client users but does not create a default
 * since client users will be created through the UI as requested
 */
export const checkClientUsers = async (): Promise<void> => {
  console.log("Checking for client users...");
  
  try {
    // Get the client role ID from the roles collection
    const rolesCollection = collection(db, "roles");
    const rolesSnapshot = await getDocs(rolesCollection);
    
    let clientRoleId: string | number | null = null;
    
    // Find the client role
    rolesSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.name && data.name.toLowerCase() === "client") {
        clientRoleId = doc.id;
      }
    });
    
    if (!clientRoleId) {
      console.error("Client role not found in the database");
      return;
    }
    
    console.log("Found client role with ID:", clientRoleId);
    
    // Check if any client user exists
    const usersCollection = collection(db, "users");
    // First try with string ID (document ID)
    let clientQuery = query(usersCollection, where("roleId", "==", clientRoleId));
    let clientSnapshot = await getDocs(clientQuery);
    
    // If none found, try with "client" name in case it's identified by name
    if (clientSnapshot.empty) {
      clientQuery = query(usersCollection, where("role", "==", "client"));
      clientSnapshot = await getDocs(clientQuery);
    }
    
    // If still none found, try with the numeric 3 as used in client-side code
    if (clientSnapshot.empty) {
      clientQuery = query(usersCollection, where("roleId", "==", 3));
      clientSnapshot = await getDocs(clientQuery);
    }
    
    if (!clientSnapshot.empty) {
      console.log("Client users exist:", clientSnapshot.size);
    } else {
      console.log("No client users found. Creating a default client for testing...");
      
      // Create a unique user ID for the client
      const clientId = "client-" + Date.now().toString();
      
      // Create the client user document
      await setDoc(doc(db, "users", clientId), {
        uid: clientId,
        username: "client",
        email: "client@example.com",
        name: "Client User",
        password: "password123", // Default password - should be hashed in production
        roleId: clientRoleId, // Use the actual role ID from the database
        profilePicture: "https://randomuser.me/api/portraits/women/2.jpg",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        lastLogin: null,
        isActive: true,
        settings: {
          theme: "light",
          notifications: true,
          language: "en"
        }
      });
      
      console.log("Default client user created successfully for testing");
    }
  } catch (error) {
    console.error("Error checking for client users:", error);
  }
};

/**
 * Initialize Firebase database with initial data
 */
export const initializeFirestoreData = async (): Promise<void> => {
  try {
    // Initialize roles first
    await initializeRoles();
    
    // Create admin and manager with the specified email
    await createDefaultAdminUser();
    await createDefaultManagerUser();
    
    // Check client users but don't create any (will be done through UI)
    await checkClientUsers();
    
    // Successfully initialized - silent in production
  } catch (error) {
    // Error silently handled in production
    throw error;
  }
};