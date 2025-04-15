import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import firebaseAdmin from "./firebase-admin";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

// Password hashing function
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// Password verification function
async function comparePasswords(supplied: string, stored: string | undefined) {
  // Handle undefined or null passwords
  if (!stored) {
    console.log("Warning: Stored password is undefined or null");
    return false;
  }
  
  // Handle the case where the password is stored in plain text (for demo purposes only)
  if (!stored.includes('.')) {
    return supplied === stored;
  }
  
  // Normal password comparison for properly hashed passwords
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Verify Firebase ID token and get corresponding user
async function verifyFirebaseToken(token: string) {
  try {
    if (!firebaseAdmin) {
      console.warn("Firebase Admin SDK not initialized, using mock verification");
      // Return mock decoded token for development environment
      return { 
        uid: "mock-firebase-uid",
        email: "mock-firebase@example.com",
        name: "Mock Firebase User",
        picture: null
      };
    }
    
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error("Error verifying Firebase token:", error);
    throw error;
  }
}

// Find or create user from Firebase user data
async function findOrCreateFirebaseUser(firebaseUser: any) {
  try {
    // Find if user already exists by email
    let user = await storage.getUserByUsername(firebaseUser.email);
    
    if (!user) {
      // User doesn't exist, create a new one
      // Get the client role
      const clientRole = await storage.getRoleByName("client");
      if (!clientRole) {
        throw new Error("Client role not found");
      }
      
      // Create a random password for the user (they'll use Firebase authentication)
      const randomPassword = randomBytes(16).toString("hex");
      const hashedPassword = await hashPassword(randomPassword);
      
      // Create the user
      user = await storage.createUser({
        username: firebaseUser.email, // Use email as username for Firebase users
        email: firebaseUser.email,
        name: firebaseUser.name || firebaseUser.email.split("@")[0], // Use name if available, or extract from email
        password: hashedPassword,
        roleId: clientRole.id,
        profilePicture: firebaseUser.picture || null,
        isActive: true
      });
    }
    
    return user;
  } catch (error) {
    console.error("Error finding or creating Firebase user:", error);
    throw error;
  }
}

// Firebase authentication middleware
function authenticateFirebaseToken() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(); // No Firebase token, proceed to next middleware
      }
      
      const idToken = authHeader.split("Bearer ")[1];
      if (!idToken) {
        return next();
      }
      
      // Verify the token
      const decodedToken = await verifyFirebaseToken(idToken);
      
      // Find or create the user in our database
      const user = await findOrCreateFirebaseUser({
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name,
        picture: decodedToken.picture
      });
      
      // Log the user in (using Passport.js)
      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        next();
      });
    } catch (error) {
      // Don't send an error - just proceed without authentication
      next();
    }
  };
}

export function setupAuth(app: Express) {
  // Session configuration
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "aditeke-super-secret-key", // Use environment variable in production
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // Only use secure cookies in production
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax" // Essential for cross-domain cookies in production
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Apply Firebase authentication middleware to all requests
  app.use(authenticateFirebaseToken());

  // Configure local strategy for username/password authentication
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false, { message: "Invalid username or password" });
        }
        
        // Return user without sensitive information
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  // Serialize user to the session (store only user ID)
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from the session (retrieve full user from user ID)
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return done(new Error(`User with id ${id} not found`));
      }
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Registration endpoint
  app.post("/api/register", async (req, res, next) => {
    try {
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Get the client role
      const clientRole = await storage.getRoleByName("client");
      if (!clientRole) {
        return res.status(500).json({ message: "Client role not found" });
      }

      // Hash password and create user
      const hashedPassword = await hashPassword(req.body.password);
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword,
        roleId: req.body.roleId || clientRole.id, // Default to client role if not specified
      });

      // Log in the newly registered user
      req.login(user, (err) => {
        if (err) return next(err);
        
        // Return user without sensitive information
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      next(error);
    }
  });

  // Login endpoint
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: info?.message || "Authentication failed" });
      }
      
      req.login(user, (err) => {
        if (err) return next(err);
        
        // Return user without sensitive information
        const { password, ...userWithoutPassword } = user;
        res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });

  // Firebase login endpoint - converts a Firebase ID token to a session
  app.post("/api/firebase/login", async (req, res, next) => {
    try {
      const { idToken } = req.body;
      
      if (!idToken) {
        return res.status(400).json({ message: "ID token is required" });
      }
      
      // Verify the token
      const decodedToken = await verifyFirebaseToken(idToken);
      
      // Find or create the user in our database
      const user = await findOrCreateFirebaseUser({
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name || decodedToken.email?.split("@")[0],
        picture: decodedToken.picture
      });
      
      // Log the user in
      req.login(user, (err) => {
        if (err) return next(err);
        
        // Return user without sensitive information
        const { password, ...userWithoutPassword } = user;
        res.status(200).json(userWithoutPassword);
      });
    } catch (error) {
      console.error("Firebase login error:", error);
      res.status(401).json({ message: "Invalid ID token" });
    }
  });

  // Logout endpoint
  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  // Get current user endpoint
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    // Return user without sensitive information
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });

  // Helper middleware for protected routes
  app.use("/api/protected/*", (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  });

  // Authorization middleware helper
  function requirePermission(resource: string, action: string) {
    return async (req: Request, res: Response, next: NextFunction) => {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const hasPermission = await storage.hasPermission(req.user.id, resource, action);
      if (!hasPermission) {
        return res.status(403).json({ 
          message: `You don't have permission to ${action} ${resource}` 
        });
      }
      
      next();
    };
  }

  // Export the permission middleware to be used in routes
  app.locals.requirePermission = requirePermission;

  // Public endpoint for getting roles (used for signup/login pages)
  app.get("/api/public/roles", async (req, res) => {
    try {
      const roles = await storage.getAllRoles();
      return res.json(roles);
    } catch (error) {
      console.error("Error fetching roles:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
}