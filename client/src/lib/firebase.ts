import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  User as FirebaseUser
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  query,
  where,
  getDocs,
  Timestamp
} from "firebase/firestore";
import { toast } from "@/hooks/use-toast";

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// User Authentication Functions
export const registerWithEmailPassword = async (
  email: string, 
  password: string, 
  username: string, 
  name: string, 
  roleId: number
) => {
  try {
    // Create authentication account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update display name
    await updateProfile(user, {
      displayName: name
    });
    
    // Store additional user info in Firestore
    await createUserDocument(user, { username, name, roleId });
    
    toast({
      title: "Registration successful",
      description: "Your account has been created.",
    });
    
    return user;
  } catch (error: any) {
    console.error("Error during registration:", error);
    toast({
      title: "Registration failed",
      description: error.message,
      variant: "destructive",
    });
    throw error;
  }
};

export const loginWithEmailPassword = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update last login
    await updateUserLastLogin(user.uid);
    
    return await getUserWithRole(user);
  } catch (error: any) {
    console.error("Error during login:", error);
    toast({
      title: "Login failed",
      description: error.message,
      variant: "destructive",
    });
    throw error;
  }
};

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Check if user exists in our database
    const userDoc = await getDoc(doc(db, "users", user.uid));
    
    if (!userDoc.exists()) {
      // First time Google login - assign default client role
      await createUserDocument(user, { 
        username: user.email?.split('@')[0] || user.uid.substring(0, 8),
        name: user.displayName || "User", 
        roleId: 3 // Default to Client role
      });
    } else {
      // Update last login
      await updateUserLastLogin(user.uid);
    }
    
    return await getUserWithRole(user);
  } catch (error: any) {
    console.error("Error during Google login:", error);
    toast({
      title: "Google login failed",
      description: error.message,
      variant: "destructive",
    });
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    return true;
  } catch (error: any) {
    console.error("Error during logout:", error);
    toast({
      title: "Logout failed",
      description: error.message,
      variant: "destructive",
    });
    throw error;
  }
};

// Firestore helper functions
const createUserDocument = async (
  user: FirebaseUser, 
  additionalData: { username: string; name: string; roleId: number }
) => {
  try {
    // Check if username already exists
    const usernameQuery = query(
      collection(db, "users"),
      where("username", "==", additionalData.username)
    );
    
    const usernameSnapshot = await getDocs(usernameQuery);
    
    if (!usernameSnapshot.empty) {
      throw new Error("Username already exists. Please choose another username.");
    }
    
    // Reference to user document
    const userRef = doc(db, "users", user.uid);
    
    // Create user document with provided data
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      username: additionalData.username,
      name: additionalData.name,
      roleId: additionalData.roleId,
      profilePicture: user.photoURL || "",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      lastLogin: Timestamp.now(),
      isActive: true,
      settings: {
        theme: "light",
        notifications: true,
        language: "en"
      }
    });
    
    return userRef;
  } catch (error) {
    console.error("Error creating user document:", error);
    throw error;
  }
};

const updateUserLastLogin = async (uid: string) => {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    lastLogin: Timestamp.now(),
    updatedAt: Timestamp.now()
  });
};

const getUserWithRole = async (user: FirebaseUser) => {
  // Get user document
  const userDoc = await getDoc(doc(db, "users", user.uid));
  
  if (!userDoc.exists()) {
    throw new Error("User not found in database");
  }
  
  const userData = userDoc.data();
  
  // Get role
  const roleDoc = await getDoc(doc(db, "roles", userData.roleId.toString()));
  
  if (!roleDoc.exists()) {
    throw new Error("Role not found in database");
  }
  
  const roleData = roleDoc.data();
  
  // Return combined user and role information
  return {
    ...userData,
    role: roleData
  };
};

// Export Firebase instances
export { auth, db };