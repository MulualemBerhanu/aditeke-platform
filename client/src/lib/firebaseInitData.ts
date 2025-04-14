import { db } from "./firebase";
import { collection, doc, setDoc, getDoc, getDocs, query, where, Timestamp, writeBatch } from "firebase/firestore";
import { FirebaseRole, ResourcePermissions } from "@shared/firebaseTypes";

/**
 * Initializes the database with default roles
 */
export const initializeRoles = async (): Promise<void> => {
  console.log("Initializing roles...");
  
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
    console.log("Roles collection already initialized with", rolesSnapshot.size, "roles");
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
  console.log("Roles initialized successfully");
};

/**
 * Creates default admin user if no admin exists
 */
export const createDefaultAdminUser = async (): Promise<void> => {
  console.log("Checking for admin users...");
  
  // Check if any admin user exists
  const usersCollection = collection(db, "users");
  const adminQuery = query(usersCollection, where("roleId", "==", 1));
  const adminSnapshot = await getDocs(adminQuery);
  
  if (!adminSnapshot.empty) {
    console.log("Admin user already exists");
    return;
  }
  
  // No admin user exists, create a default one
  console.log("No admin user found, creating default admin...");
  
  // Create a unique user ID for the admin
  const adminId = "admin-" + Date.now().toString();
  
  // Create the admin user document with the specified email
  await setDoc(doc(db, "users", adminId), {
    uid: adminId,
    username: "admin",
    email: "berhanumule6@gmail.com", // Custom email as requested
    name: "Admin User",
    roleId: 1,
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
  
  console.log("Default admin user created successfully with email: berhanumule6@gmail.com");
};

/**
 * Creates default manager user if no manager exists
 */
export const createDefaultManagerUser = async (): Promise<void> => {
  console.log("Checking for manager users...");
  
  // Check if any manager user exists
  const usersCollection = collection(db, "users");
  const managerQuery = query(usersCollection, where("roleId", "==", 2));
  const managerSnapshot = await getDocs(managerQuery);
  
  if (!managerSnapshot.empty) {
    console.log("Manager user already exists");
    return;
  }
  
  // No manager user exists, create a default one
  console.log("No manager user found, creating default manager...");
  
  // Create a unique user ID for the manager
  const managerId = "manager-" + Date.now().toString();
  
  // Create the manager user document with the specified email
  await setDoc(doc(db, "users", managerId), {
    uid: managerId,
    username: "manager",
    email: "berhanumule6@gmail.com", // Same email as admin for now
    name: "Manager User",
    roleId: 2,
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
  
  console.log("Default manager user created successfully with email: berhanumule6@gmail.com");
};

/**
 * Checks for client users but does not create a default
 * since client users will be created through the UI as requested
 */
export const checkClientUsers = async (): Promise<void> => {
  console.log("Checking for client users...");
  
  // Check if any client user exists
  const usersCollection = collection(db, "users");
  const clientQuery = query(usersCollection, where("roleId", "==", 3));
  const clientSnapshot = await getDocs(clientQuery);
  
  if (!clientSnapshot.empty) {
    console.log("Client users exist:", clientSnapshot.size);
  } else {
    console.log("No client users found. They will be created through the UI.");
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
    
    console.log("Firebase database initialized successfully with initial data");
  } catch (error) {
    console.error("Error initializing Firebase database:", error);
    throw error;
  }
};