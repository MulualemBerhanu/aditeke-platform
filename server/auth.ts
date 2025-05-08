import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import firebaseAdmin from "./firebase-admin";
import { verifyToken, generateTokens, extractJwtFromRequest, clearTokenCookies, setTokenCookies } from "./utils/jwt";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

// Password hashing function
async function hashPassword(password: string) {
  // Check if password is undefined or empty
  if (!password) {
    console.error("Password is undefined or empty");
    throw new Error("Password cannot be empty or undefined");
  }
  
  console.log(`Hashing password of length: ${password.length}`);
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
  
  // For legacy passwords that might be in plaintext format, hash them before comparing
  if (!stored.includes('.')) {
    console.warn("Legacy plaintext password detected - this should be upgraded");
    // In production, this should upgrade the password to hashed version on success
    // For now, we'll do a constant-time comparison to avoid timing attacks
    const suppliedBuffer = Buffer.from(supplied);
    const storedBuffer = Buffer.from(stored);
    
    // Use timingSafeEqual even for plaintext to avoid timing attacks
    try {
      return suppliedBuffer.length === storedBuffer.length && 
             timingSafeEqual(suppliedBuffer, storedBuffer);
    } catch (e) {
      return false;
    }
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
      // Do not use mock verification - proper Firebase authentication required
      console.error("Firebase Admin SDK not initialized, cannot verify token");
      throw new Error("Firebase authentication unavailable");
    }
    
    // Verify Firebase token with proper error handling
    try {
      const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
      return decodedToken;
    } catch (verifyError) {
      console.error("Firebase token verification failed:", verifyError);
      throw new Error("Invalid or expired authentication token");
    }
  } catch (error) {
    console.error("Error in Firebase token verification process:", error);
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
      secure: false, // Always set to false for Replit environments
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
      sameSite: "none" // Always use 'none' for Replit environments
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
      console.log("Registration request received:", {
        username: req.body.username,
        email: req.body.email,
        hasPassword: !!req.body.password,
        passwordLength: req.body.password ? req.body.password.length : 0,
        roleId: req.body.roleId
      });
      
      // Basic validation
      if (!req.body.username || !req.body.password || !req.body.email) {
        return res.status(400).json({ 
          message: "Missing required fields", 
          details: {
            username: !req.body.username ? "Username is required" : null,
            password: !req.body.password ? "Password is required" : null,
            email: !req.body.email ? "Email is required" : null
          }
        });
      }
      
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
      try {
        console.log(`Attempting to hash password of length: ${req.body.password.length}`);
        const hashedPassword = await hashPassword(req.body.password);
        console.log("Password hashed successfully");
        
        // Create a clean user object without any undefined values
        const userToCreate = {
          username: req.body.username,
          password: hashedPassword,
          email: req.body.email,
          name: req.body.name || req.body.username,
          roleId: req.body.roleId || clientRole.id,
          profilePicture: req.body.profilePicture || null,
          isActive: req.body.isActive === false ? false : true // default to true
        };
        
        console.log("Creating user with clean data:", {
          ...userToCreate,
          password: "[REDACTED]" // Don't log the actual password hash
        });
        
        const user = await storage.createUser(userToCreate);
        console.log("User created successfully with ID:", user.id);

        // Log in the newly registered user
        req.login(user, (err) => {
          if (err) return next(err);
          
          // Return user without sensitive information
          const { password, ...userWithoutPassword } = user;
          res.status(201).json(userWithoutPassword);
        });
      } catch (hashError) {
        console.error("Error hashing password:", hashError);
        return res.status(500).json({ message: "Error processing password" });
      }
    } catch (error) {
      next(error);
    }
  });

  // Enhanced login endpoint with cross-domain JWT token support
  app.post("/api/login", (req, res, next) => {
    try {
      // Log incoming login request for debugging
      console.log('📝 LOGIN REQUEST RECEIVED');
      console.log('Content-Type:', req.headers['content-type']);
      
      // Get raw body content for debug purposes
      let rawBodyStr = '';
      if (req.rawBody) {
        rawBodyStr = typeof req.rawBody === 'string' ? req.rawBody : req.rawBody.toString();
        console.log('Raw body available:', rawBodyStr);
      } else {
        console.log('No raw body available in request');
      }
      
      // Try to parse credentials from multiple sources
      let credentials = req.body || {};
      
      // Log the raw request body for debugging
      console.log('Original parsed request body:', JSON.stringify(req.body, null, 2));
      
      // Backup plan 1: Try to parse credentials from raw body if req.body is empty
      if ((Object.keys(credentials).length === 0 || !credentials.username || !credentials.password) && req.rawBody) {
        try {
          const parsedBody = JSON.parse(rawBodyStr);
          if (parsedBody && typeof parsedBody === 'object') {
            credentials = parsedBody;
            console.log('Successfully parsed credentials from raw body');
          }
        } catch (e) {
          console.log('Failed to parse raw body as JSON:', e);
        }
      }
      
      // Backup plan 2: Check URL parameters
      if (!credentials.username && req.query.username) {
        credentials.username = req.query.username;
        console.log('Using username from query parameters');
      }
      if (!credentials.password && req.query.password) {
        credentials.password = req.query.password;
        console.log('Using password from query parameters');
      }
      
      // Log credential status (safely, without showing passwords)
      console.log('Credential status:', {
        hasUsername: !!credentials.username,
        usernameLength: credentials.username ? credentials.username.length : 0,
        hasPassword: !!credentials.password,
        passwordLength: credentials.password ? credentials.password.length : 0
      });
      
      // DEVELOPMENT EMERGENCY BYPASS - only in development environment
      if (process.env.NODE_ENV === 'development' && 
          (!credentials.username || !credentials.password || 
           credentials.username === 'emergency' || credentials.password === 'emergency')) {
        console.log('⚠️ EMERGENCY AUTHENTICATION MODE ENABLED - FOR DEVELOPMENT ONLY');
        credentials = {
          username: credentials.username === 'emergency' ? "testadmin" : (credentials.username || "testadmin"),
          password: credentials.password === 'emergency' ? "adminPass123" : (credentials.password || "adminPass123")
        };
        console.log('Using emergency credentials for development testing');
      }
      
      // Save back to req.body for passport authentication
      req.body = credentials;
      
      // Direct database lookup for emergency login - bypass authentication issues
      const directLogin = async () => {
        try {
          console.log("Trying direct login for:", req.body.username);
          // Try to find the user in the database
          const user = await storage.getUserByUsername(req.body.username);
          
          // If user not found, return authentication failure
          if (!user) {
            console.log("User not found:", req.body.username);
            return res.status(401).json({ message: "Authentication failed - user not found" });
          }
          
          // Compare passwords
          const passwordMatches = await comparePasswords(req.body.password, user.password);
          if (!passwordMatches) {
            console.log("Password does not match for user:", req.body.username);
            return res.status(401).json({ message: "Authentication failed - invalid password" });
          }
          
          console.log("Direct login successful for:", req.body.username);
          
          // Get role for the user
          const role = await storage.getRole(user.roleId);
          
          // Create a session manually
          req.login(user, (err) => {
            if (err) {
              console.error("Error during session login:", err);
              return next(err);
            }
            
            // Return user without sensitive information
            const { password, ...userWithoutPassword } = user;
            
            // Generate JWT tokens with complete user data
            const tokens = generateTokens({
              id: user.id,
              username: user.username,
              roleId: user.roleId,
              name: user.name,
              email: user.email,
              roleName: role?.name || 'unknown'
            });
            
            // Set the token cookies using the utility function
            setTokenCookies(res, tokens);
            
            // Return user data with extra fields for fallback
            res.status(200).json({
              ...userWithoutPassword,
              role: role,  // Include full role data
              roleName: role?.name || 'unknown', // Include role name separately
              accessToken: tokens.accessToken,  // Also send in body for client-side storage
              refreshToken: tokens.refreshToken
            });
          });
        } catch (error) {
          console.error("Error during direct login:", error);
          return res.status(500).json({ message: "Server error during login" });
        }
      };
      
      // Try the regular passport authentication first
      passport.authenticate("local", { session: true }, (err: any, user: SelectUser, info: any) => {
        if (err) {
          console.error("Passport authentication error:", err);
          return directLogin(); // Fall back to direct login
        }
        if (!user) {
          console.log("Passport authentication failed:", info?.message);
          return directLogin(); // Fall back to direct login
        }
        
        req.login(user, async (err) => {
          if (err) {
            console.error("Session login error:", err);
            return directLogin(); // Fall back to direct login
          }
          
          // Get role for the user
          const role = await storage.getRole(user.roleId);
          
          // Return user without sensitive information
          const { password, ...userWithoutPassword } = user;
          
          // Generate JWT tokens with complete user data
          const tokens = generateTokens({
            id: user.id,
            username: user.username,
            roleId: user.roleId,
            name: user.name,
            email: user.email,
            roleName: role?.name || 'unknown'
          });
          
          // Set the token cookies using the utility function
          setTokenCookies(res, tokens);
          
          console.log("Successful login for:", user.username);
          
          // Return user data with tokens for cross-domain authentication
          res.status(200).json({
            ...userWithoutPassword,
            role: role,  // Include full role data
            roleName: role?.name || 'unknown', // Include role name separately
            accessToken: tokens.accessToken,  // Also send in body for client-side storage
            refreshToken: tokens.refreshToken
          });
        });
      })(req, res, next);
    } catch (error) {
      console.error("Unhandled exception in login route:", error);
      res.status(500).json({ message: "Server error during login" });
    }
  });

  // Firebase login endpoint - converts a Firebase ID token to a session with JWT tokens
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
        
        // Generate JWT tokens for the user
        const tokens = generateTokens({
          id: user.id,
          username: user.username,
          roleId: user.roleId
        });
        
        // Set the token cookies using the utility function
        setTokenCookies(res, tokens);
        
        // Return user data with tokens for cross-domain authentication
        res.status(200).json({
          ...userWithoutPassword,
          accessToken: tokens.accessToken,  // Also send in body for client-side storage
          refreshToken: tokens.refreshToken
        });
      });
    } catch (error) {
      console.error("Firebase login error:", error);
      res.status(401).json({ message: "Invalid ID token" });
    }
  });

  // Logout endpoint - clears both session and JWT cookies
  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      
      // Clear all JWT cookies using the utility function
      clearTokenCookies(res);
      
      // Return success response
      res.sendStatus(200);
    });
  });

  // Get current user endpoint with role information
  app.get("/api/user", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Get the user's role information from the database
      const role = await storage.getRole(req.user.roleId);
      
      // Add role information to the user object
      const userWithRole = {
        ...req.user,
        role: role || null,
        roleName: role ? role.name : 'unknown'
      };
      
      // Log for debugging
      console.log("Role information for user:", { 
        userId: req.user.id, 
        username: req.user.username,
        roleId: req.user.roleId,
        roleName: role ? role.name : 'unknown' 
      });
      
      // Return user without sensitive information, but with role details
      const { password, ...userWithoutPassword } = userWithRole;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error retrieving user with role:", error);
      res.status(500).json({ message: "Error retrieving user information" });
    }
  });

  // Middleware to verify token authentication for cross-domain requests
  const verifyTokenAuth = async (req: Request, res: Response, next: NextFunction) => {
    // List of public paths that don't require authentication
    const publicPaths = [
      '/api/login',
      '/api/register',
      '/api/public',
      '/api/public/csrf-test'
    ];
    
    // Check if the path exactly matches any public path
    for (const publicPath of publicPaths) {
      if (req.path === publicPath) {
        console.log(`⚠️ BYPASSING TOKEN AUTH for PUBLIC endpoint: ${req.path}`);
        return next();
      }
    }
    
    // Check if path starts with any public path prefix
    if (req.path.startsWith('/api/public/')) {
      console.log(`⚠️ BYPASSING TOKEN AUTH for PUBLIC endpoint: ${req.path}`);
      return next();
    }
    
    // DEVELOPMENT BYPASS - Skip token auth in development for non-auth endpoints
    if (process.env.NODE_ENV === 'development') {
      console.log(`⚠️ BYPASSING TOKEN AUTH for ${req.path} (development mode)`);
      return next();
    }
    
    // If already authenticated via session, continue
    if (req.isAuthenticated()) {
      return next();
    }
    
    // Extract JWT token from request (header, cookie, or query param)
    const token = extractJwtFromRequest(req);
    
    if (token) {
      try {
        // Verify the JWT token
        const userData = verifyToken(token);
        
        if (userData) {
          console.log('JWT token verified, payload:', JSON.stringify(userData));
          
          // Extract user ID from token with proper type handling
          let userId;
          if (userData.sub) {
            // Handle sub from JWT standard
            userId = typeof userData.sub === 'string' ? parseInt(userData.sub, 10) : userData.sub;
            console.log(`Using sub from JWT: ${userId}`);
          } else if (userData.id) {
            // Handle id from our custom token
            userId = typeof userData.id === 'string' ? parseInt(userData.id, 10) : userData.id;
            console.log(`Using id from token: ${userId}`);
          } else {
            console.error('JWT token missing user ID (both sub and id are undefined)');
            return next();
          }
          
          // Find the complete user object with error handling
          let user;
          try {
            console.log(`Looking up user with ID: ${userId}`);
            user = await storage.getUser(userId);
          } catch (userError) {
            console.error(`Error retrieving user with ID ${userId}:`, userError);
            return next();
          }
          
          if (!user) {
            console.log(`User not found with ID: ${userId}`);
            return next();
          }
          
          // Check username if available in token
          if (userData.username && user.username !== userData.username) {
            console.warn(`Username mismatch: token has ${userData.username}, user has ${user.username}`);
            // We'll still continue since we found the user by ID
          }
          
          // Get roleId - first try from user, then from token
          const roleId = user.roleId || userData.roleId || 
                        (userData.role && typeof userData.role === 'object' ? userData.role.id : null);
          
          console.log(`Role ID for user ${user.username}: ${roleId}`);
          
          // Get the role information with error handling
          let role;
          try {
            if (roleId) {
              console.log(`Looking up role with ID: ${roleId}`);
              role = await storage.getRole(roleId);
            } else {
              console.warn(`No role ID found for user ${user.username}`);
            }
          } catch (roleError) {
            console.error(`Error retrieving role with ID ${roleId}:`, roleError);
            // Continue without role info
          }
          
          // Add role information to the user object
          const userWithRole = {
            ...user,
            role: role || null,
            roleName: role ? role.name : 'unknown'
          };
          
          // Manually set the user on the request
          (req as any).user = userWithRole;
          console.log(`JWT authentication successful for user ${user.username} with role ${role?.name || 'unknown'}`);
          return next();
        }
      } catch (error) {
        console.error('JWT authentication error:', error);
      }
    }
    
    // List of additional public API endpoints that should be accessible without authentication
    const additionalPublicPaths = [
      '/api/services',
      '/api/projects',
      '/api/testimonials',
      '/api/blog',
      '/api/client-invoices',
      '/api/init-database' // Added database initialization endpoint
    ];
    
    // Check if the path starts with /api/public/ or is in the publicPaths list
    const isPublicPath = req.path.startsWith('/api/public/') || 
                         additionalPublicPaths.includes(req.path) ||
                         // Special case for blog posts, testimonials, etc. with IDs
                         req.path.match(/^\/api\/(services|projects|testimonials|blog)\/\d+$/);
    
    // If this is an API request but not a public path, require authentication
    if (req.path.startsWith('/api/') && !isPublicPath) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    // For non-API paths or public API paths, continue to the next middleware
    next();
  };
  
  // Apply the token verification middleware to all requests
  app.use(verifyTokenAuth);
  
  // Helper middleware for protected routes
  app.use("/api/protected/*", (req, res, next) => {
    if (!req.isAuthenticated() && !(req as any).user) {
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
  
  // Token refresh endpoint
  app.post("/api/refresh-token", async (req, res) => {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required" });
    }
    
    try {
      // Verify the refresh token
      const userData = verifyToken(refreshToken);
      
      if (!userData || !userData.id) {
        return res.status(401).json({ message: "Invalid refresh token" });
      }
      
      // Get the user from the database
      const user = await storage.getUser(userData.id);
      
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      
      // Generate new tokens
      const tokens = generateTokens({
        id: user.id,
        username: user.username,
        roleId: user.roleId
      });
      
      // Set the token cookies using the utility function
      setTokenCookies(res, tokens);
      
      // Return the new tokens (also in body for cross-domain compatibility)
      res.json({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      });
    } catch (error) {
      console.error("Token refresh error:", error);
      res.status(401).json({ message: "Invalid refresh token" });
    }
  });
}