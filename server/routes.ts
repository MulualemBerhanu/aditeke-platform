import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { initializeDatabase } from "./db-init";
import { updateFirebaseIds } from "./update-id-schema";
import {
  insertUserSchema,
  insertContactMessageSchema,
  insertNewsletterSubscriberSchema,
  insertTestimonialSchema,
  insertServiceSchema,
  insertProjectSchema,
  insertBlogPostSchema,
  insertJobSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);
  
  // API endpoints
  // ===============

  // Get the helper middleware for authorization
  const { requirePermission } = app.locals;
  
  // Role and permission admin routes
  // Get a role by ID (unprotected - needed for login redirection)
  app.get("/api/role/:id", async (req, res) => {
    try {
      const roleId = parseInt(req.params.id);
      if (isNaN(roleId)) {
        return res.status(400).json({ message: "Invalid role ID" });
      }
      
      const role = await storage.getRole(roleId);
      if (!role) {
        return res.status(404).json({ message: "Role not found" });
      }
      
      res.json(role);
    } catch (error) {
      console.error("Error fetching role:", error);
      res.status(500).json({ message: "Error fetching role" });
    }
  });

  // Role management (temporarily made public for development)
  app.get("/api/roles", async (req, res) => {
    try {
      const roles = await storage.getAllRoles();
      console.log("Fetched roles:", JSON.stringify(roles));
      return res.json(roles);
    } catch (error) {
      console.error("Error fetching roles:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/roles", requirePermission("roles", "manage"), async (req, res) => {
    try {
      // In a real app, we would use a proper Zod schema for role validation
      const { name, description } = req.body;
      
      if (!name) {
        return res.status(400).json({ message: "Role name is required" });
      }
      
      // Check if role already exists
      const existingRole = await storage.getRoleByName(name);
      if (existingRole) {
        return res.status(400).json({ message: "Role with this name already exists" });
      }
      
      const role = await storage.createRole({ name, description: description || null });
      return res.status(201).json(role);
    } catch (error) {
      console.error("Error creating role:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Permission management
  app.get("/api/permissions", requirePermission("permissions", "read"), async (req, res) => {
    try {
      const permissions = await storage.getAllPermissions();
      return res.json(permissions);
    } catch (error) {
      console.error("Error fetching permissions:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Role-Permission assignments
  app.post("/api/roles/:roleId/permissions", requirePermission("roles", "manage"), async (req, res) => {
    try {
      const roleId = parseInt(req.params.roleId);
      const { permissionId } = req.body;
      
      if (isNaN(roleId) || !permissionId) {
        return res.status(400).json({ message: "Valid roleId and permissionId are required" });
      }
      
      // Check if role exists
      const role = await storage.getRole(roleId);
      if (!role) {
        return res.status(404).json({ message: "Role not found" });
      }
      
      // Check if permission exists
      const permission = await storage.getPermission(permissionId);
      if (!permission) {
        return res.status(404).json({ message: "Permission not found" });
      }
      
      const rolePermission = await storage.assignPermissionToRole(roleId, permissionId);
      return res.status(201).json(rolePermission);
    } catch (error) {
      console.error("Error assigning permission to role:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // User routes
  app.get("/api/users/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    try {
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't return the password
      const { password, ...userWithoutPassword } = user;
      return res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Get all users (protected with permission)
  app.get("/api/users", requirePermission("users", "read"), async (req, res) => {
    try {
      // Get all users from Firebase directly
      const users = await storage.getAllUsers();
      
      // Remove passwords before sending to client
      const safeUsers = users.map(user => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      return res.json(safeUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Get all client users (for project forms)
  app.get("/api/users/clients", async (req, res) => {
    try {
      // Get all users from the database
      const allUsers = await storage.getAllUsers();
      
      // Filter users with client role (roleId = 1001)
      const clientUsers = allUsers.filter(user => {
        // Handle both string and number roleId values
        const roleId = typeof user.roleId === 'string' ? parseInt(user.roleId) : user.roleId;
        return roleId === 1001 || user.username.toLowerCase().includes('client');
      });
      
      // Remove passwords before sending to client
      const safeClientUsers = clientUsers.map(user => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      console.log(`Found ${safeClientUsers.length} client users for client endpoint`);
      
      return res.json(safeClientUsers);
    } catch (error) {
      console.error("Error fetching client users:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Hardcoded client data as a fallback - now with sequential IDs
  const hardcodedClients = [
    {
      id: 2000,
      name: "Client User 1",
      username: "client1",
      email: "client1@example.com",
      roleId: 1001, // Updated to sequential ID (formerly 3)
      isActive: true
    },
    {
      id: 2001,
      name: "Client User 2",
      username: "client2",
      email: "client2@example.com",
      roleId: 1001, // Updated to sequential ID (formerly 3)
      isActive: true
    },
    {
      id: 2002,
      name: "Client User 3",
      username: "client3",
      email: "client3@example.com",
      roleId: 1001, // Updated to sequential ID (formerly 3)
      isActive: true
    }
  ];

  // Special endpoint for manager dashboard to get client options
  // This fetches all clients from the database
  app.get("/api/manager/client-options", async (req, res) => {
    try {
      console.log("Fetching all client users from database");
      
      // Get all users from the database
      const allUsers = await storage.getAllUsers();
      
      // Filter users with client role (roleId = 1001)
      const clientUsers = allUsers.filter(user => {
        // Handle both string and number roleId values
        const roleId = typeof user.roleId === 'string' ? parseInt(user.roleId) : user.roleId;
        return roleId === 1001 || user.username.toLowerCase().includes('client');
      });
      
      console.log(`Found ${clientUsers.length} client users in database`);
      
      // Force pure JSON response with no HTML by ending request immediately
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(clientUsers));
      return;
    } catch (error) {
      console.error("Error in client options endpoint:", error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: "Internal server error" }));
      return;
    }
  });
  
  // Debug endpoint to check a specific user by username (temporary for development)
  app.get("/api/debug/user/:username", async (req, res) => {
    try {
      const { username } = req.params;
      console.log("Debugging user:", username);
      
      const user = await storage.getUserByUsername(username);
      console.log("User found:", user ? "Yes" : "No");
      console.log("Password exists:", user?.password ? "Yes" : "No");
      
      res.json({ 
        found: !!user,
        hasPassword: !!user?.password,
        passwordLength: user?.password ? user.password.length : 0,
        user: {
          id: user?.id,
          username: user?.username,
          email: user?.email,
          name: user?.name,
          roleId: user?.roleId,
        }
      });
    } catch (error) {
      console.error("Error debugging user:", error);
      res.status(500).json({ message: "Error debugging user", error });
    }
  });
  
  // Create a new manager account with a password (temporary for development)
  app.post("/api/debug/create-new-manager", async (req, res) => {
    try {
      console.log("Creating new manager account...");
      
      // Get the manager role ID
      const managerRole = await storage.getRoleByName("manager");
      if (!managerRole) {
        return res.status(404).json({ message: "Manager role not found" });
      }
      
      // Create a new manager user with password
      const newManagerData = {
        username: "manager2",
        password: "password123", // Plain text for now, would be hashed in production
        email: "manager2@example.com",
        name: "Manager User 2",
        roleId: managerRole.id,
        isActive: true
      };
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(newManagerData.username);
      if (existingUser) {
        return res.status(200).json({ 
          success: true,
          message: "Manager account already exists with username: " + newManagerData.username
        });
      }
      
      const newManager = await storage.createUser(newManagerData);
      console.log("New manager account created!");
      
      res.json({ 
        success: true,
        message: "New manager account created with username: " + newManagerData.username,
        user: {
          id: newManager.id,
          username: newManager.username,
          email: newManager.email,
          roleId: newManager.roleId
        }
      });
    } catch (error) {
      console.error("Error creating new manager account:", error);
      res.status(500).json({ message: "Error creating new manager account", error });
    }
  });
  
  // Create a new client account with a password (temporary for development)
  app.post("/api/debug/create-new-client", async (req, res) => {
    try {
      console.log("Creating new client account...");
      
      // Get the client role ID
      const clientRole = await storage.getRoleByName("client");
      if (!clientRole) {
        return res.status(404).json({ message: "Client role not found" });
      }
      
      // Create a new client user with password
      const newClientData = {
        username: "client2",
        password: "password123", // Plain text for now, would be hashed in production
        email: "client2@example.com",
        name: "Client User 2",
        roleId: clientRole.id,
        isActive: true
      };
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(newClientData.username);
      if (existingUser) {
        return res.status(200).json({ 
          success: true,
          message: "Client account already exists with username: " + newClientData.username
        });
      }
      
      const newClient = await storage.createUser(newClientData);
      console.log("New client account created!");
      
      res.json({ 
        success: true,
        message: "New client account created with username: " + newClientData.username,
        user: {
          id: newClient.id,
          username: newClient.username,
          email: newClient.email,
          roleId: newClient.roleId
        }
      });
    } catch (error) {
      console.error("Error creating new client account:", error);
      res.status(500).json({ message: "Error creating new client account", error });
    }
  });
  
  // Create a new user (protected with permission)
  app.post("/api/users", requirePermission("users", "manage"), async (req, res) => {
    try {
      console.log("Received user creation request:", JSON.stringify(req.body));
      
      const userData = insertUserSchema.parse(req.body);
      console.log("User data validated successfully:", JSON.stringify(userData));
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        console.log("Username already exists:", userData.username);
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Create the user
      console.log("Creating user in storage:", JSON.stringify(userData));
      const user = await storage.createUser(userData);
      console.log("User created:", JSON.stringify(user));
      
      // Remove password before sending to client
      const { password, ...userWithoutPassword } = user;
      console.log("Sending response:", JSON.stringify(userWithoutPassword));
      
      res.setHeader('Content-Type', 'application/json');
      return res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation error:", JSON.stringify(error.errors));
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      console.error("Error creating user:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Contact form submission
  app.post("/api/contact", async (req, res) => {
    try {
      const messageData = insertContactMessageSchema.parse(req.body);
      const message = await storage.saveContactMessage(messageData);
      return res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid contact data", errors: error.errors });
      }
      console.error("Error saving contact message:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Newsletter subscription
  app.post("/api/newsletter/subscribe", async (req, res) => {
    try {
      const subscriberData = insertNewsletterSubscriberSchema.parse(req.body);
      const subscriber = await storage.addNewsletterSubscriber(subscriberData);
      return res.status(201).json(subscriber);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid subscription data", errors: error.errors });
      }
      console.error("Error adding newsletter subscriber:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Services
  app.get("/api/services", async (req, res) => {
    try {
      const services = await storage.getAllServices();
      return res.json(services);
    } catch (error) {
      console.error("Error fetching services:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Create service (protected)
  app.post("/api/services", requirePermission("services", "manage"), async (req, res) => {
    try {
      const serviceData = insertServiceSchema.parse(req.body);
      const service = await storage.createService(serviceData);
      return res.status(201).json(service);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid service data", errors: error.errors });
      }
      console.error("Error creating service:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Testimonials
  app.get("/api/testimonials", async (req, res) => {
    try {
      const testimonials = await storage.getAllTestimonials();
      return res.json(testimonials);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Projects/Portfolio
  app.get("/api/projects", async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const projects = await storage.getAllProjects(category);
      return res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Get projects for a specific client
  app.get("/api/clients/:clientId/projects", async (req, res) => {
    try {
      const clientId = parseInt(req.params.clientId);
      if (isNaN(clientId)) {
        return res.status(400).json({ message: "Invalid client ID" });
      }
      
      // Check if client exists
      const client = await storage.getUser(clientId);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      // Check if user is authorized (either has permission or is the client themselves)
      const isClient = req.user && (req.user.id === clientId || req.user.id === client.id);
      const hasPermission = req.user && await storage.hasPermission(req.user.id, "projects", "read");
      
      if (!isClient && !hasPermission) {
        console.log(`Unauthorized access: User ${req.user?.id} tried to access projects for client ${clientId}`);
        return res.status(403).json({ message: "Unauthorized to view these projects" });
      }
      
      // Get all projects and filter for the client
      const allProjects = await storage.getAllProjects();
      console.log(`Found ${allProjects.length} total projects`);
      
      // Filter to get only projects assigned to this client
      const projects = allProjects.filter(project => 
        project.clientId === clientId || 
        project.clientId === Number(clientId) || 
        String(project.clientId) === String(clientId)
      );
      
      console.log(`Filtered ${projects.length} projects for client ${clientId}`);
      return res.json(projects);
    } catch (error) {
      console.error("Error fetching client projects:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Get a specific project
  app.get("/api/projects/:id", requirePermission("projects", "read"), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      return res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Create a new project (protected)
  app.post("/api/projects", requirePermission("projects", "manage"), async (req, res) => {
    try {
      console.log("Received project creation request:", JSON.stringify(req.body));
      
      const projectData = insertProjectSchema.parse(req.body);
      console.log("Project data validated successfully:", JSON.stringify(projectData));
      
      // Create the project
      const project = await storage.createProject(projectData);
      console.log("Project created:", JSON.stringify(project));
      
      return res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation error:", JSON.stringify(error.errors));
        return res.status(400).json({ message: "Invalid project data", errors: error.errors });
      }
      console.error("Error creating project:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Update a project (protected)
  app.patch("/api/projects/:id", requirePermission("projects", "manage"), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      
      // Check if project exists
      const existingProject = await storage.getProject(id);
      if (!existingProject) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Validate request body
      const projectData = req.body;
      
      // Update the project
      const updatedProject = await storage.updateProject(id, projectData);
      
      return res.json(updatedProject);
    } catch (error) {
      console.error("Error updating project:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Clear sessions to handle ID format change
  app.get("/api/clear-sessions", (req, res) => {
    // Block Vite middleware from intercepting this request
    res.locals.isApiRoute = true;
    
    try {
      // Destroy the current session
      if (req.session) {
        req.session.destroy((err) => {
          if (err) {
            console.error("Error destroying session:", err);
            // Force pure JSON response with no HTML by ending request immediately
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
              success: false, 
              message: "Failed to clear session", 
              error: err.message 
            }));
            return;
          }
          
          // Force pure JSON response with no HTML by ending request immediately
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            success: true, 
            message: "Session cleared successfully. You can now login with your username and password."
          }));
        });
      } else {
        // Force pure JSON response with no HTML by ending request immediately
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: true, 
          message: "No active session found. You can now login with your username and password."
        }));
      }
    } catch (error) {
      console.error("Error clearing session:", error);
      // Force pure JSON response with no HTML by ending request immediately
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        success: false, 
        message: "Error clearing session", 
        error: error instanceof Error ? error.message : String(error)
      }));
    }
  });

  // Fix client2 user with sequential ID
  app.get("/api/fix-client2-user", async (req, res) => {
    // Block Vite middleware from intercepting this request
    res.locals.isApiRoute = true;
    try {
      // Delete the old client2 user if it exists
      const oldClient = await storage.getUserByUsername("client2");
      if (oldClient && oldClient.id !== 2001) {
        console.log(`Found old client2 user with ID ${oldClient.id}. Creating new one with sequential ID.`);
        
        // Get client role
        const clientRole = await storage.getRoleByName("client");
        if (!clientRole) {
          return res.status(404).json({ message: "Client role not found" });
        }
        
        // Create new client with sequential ID - force ID to be 2001
        const clientData = {
          id: 2001, // Force the sequential ID in the client range
          username: "client2",
          password: "password123", // Plain text for now
          email: "client2@example.com",
          name: "Client User 2",
          roleId: clientRole.id,
          isActive: true
        };
        
        const newClient = await storage.createUser(clientData);
        
        // Force pure JSON response with no HTML by ending request immediately
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          message: "Client2 user fixed with sequential ID",
          oldId: oldClient.id,
          newId: newClient.id
        }));
      } else if (oldClient) {
        // Force pure JSON response with no HTML by ending request immediately
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          message: "Client2 already has sequential ID",
          id: oldClient.id
        }));
      } else {
        // Create new client with sequential ID
        const clientRole = await storage.getRoleByName("client");
        if (!clientRole) {
          return res.status(404).json({ message: "Client role not found" });
        }
        
        const clientData = {
          id: 2001, // Force the sequential ID in the client range  
          username: "client2",
          password: "password123", // Plain text for now
          email: "client2@example.com",
          name: "Client User 2",
          roleId: clientRole.id,
          isActive: true
        };
        
        const newClient = await storage.createUser(clientData);
        
        // Force pure JSON response with no HTML by ending request immediately
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          message: "Client2 user created with sequential ID",
          id: newClient.id
        }));
      }
    } catch (error) {
      console.error("Error fixing client2 user:", error);
      // Force pure JSON response with no HTML by ending request immediately
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        message: "Error fixing client2 user", 
        error: error instanceof Error ? error.message : String(error)
      }));
    }
  });

  // Fix manager2 user with sequential ID
  app.get("/api/fix-manager2-user", async (req, res) => {
    // Block Vite middleware from intercepting this request
    res.locals.isApiRoute = true;
    try {
      // Delete the old manager2 user if it exists
      const oldManager = await storage.getUserByUsername("manager2");
      if (oldManager && oldManager.id !== 50000 && oldManager.id !== 50001) {
        console.log(`Found old manager2 user with ID ${oldManager.id}. Creating new one with sequential ID.`);
        
        // Get manager role
        const managerRole = await storage.getRoleByName("manager");
        if (!managerRole) {
          return res.status(404).json({ message: "Manager role not found" });
        }
        
        // Create new manager with sequential ID - force ID to be 50001
        const managerData = {
          id: 50001, // Force the sequential ID in the manager range
          username: "manager2",
          password: "password123", // Plain text for now
          email: "manager2@example.com",
          name: "Manager User 2",
          roleId: managerRole.id,
          isActive: true
        };
        
        const newManager = await storage.createUser(managerData);
        
        // Force pure JSON response with no HTML by ending request immediately
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          message: "Manager2 user fixed with sequential ID",
          oldId: oldManager.id,
          newId: newManager.id
        }));
      } else if (oldManager) {
        // Force pure JSON response with no HTML by ending request immediately
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          message: "Manager2 already has sequential ID",
          id: oldManager.id
        }));
      } else {
        // Create new manager with sequential ID
        const managerRole = await storage.getRoleByName("manager");
        if (!managerRole) {
          return res.status(404).json({ message: "Manager role not found" });
        }
        
        const managerData = {
          id: 50001, // Force the sequential ID in the manager range  
          username: "manager2",
          password: "password123", // Plain text for now
          email: "manager2@example.com",
          name: "Manager User 2",
          roleId: managerRole.id,
          isActive: true
        };
        
        const newManager = await storage.createUser(managerData);
        
        // Force pure JSON response with no HTML by ending request immediately
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          message: "Manager2 user created with sequential ID",
          id: newManager.id
        }));
      }
    } catch (error) {
      console.error("Error fixing manager2 user:", error);
      // Force pure JSON response with no HTML by ending request immediately
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        message: "Error fixing manager2 user", 
        error: error instanceof Error ? error.message : String(error)
      }));
    }
  });
  
  // Special endpoint for getting project assignments - avoid middleware issues
  app.post("/api/projects/:id/assign-test", async (req, res, next) => {
    // Block Vite middleware from intercepting this request
    res.locals.isApiRoute = true;
    
    try {
      const projectId = parseInt(req.params.id);
      const { clientId } = req.body;
      
      console.log(`[TEST] Assigning project ${projectId} to client ${clientId}`);
      
      if (isNaN(projectId)) {
        console.log("Invalid project ID");
        // Send a pure JSON response with no HTML
        res.setHeader('Content-Type', 'application/json');
        res.status(400).send(JSON.stringify({ message: "Invalid project ID" }));
        return;
      }
      
      if (!clientId || isNaN(parseInt(clientId.toString()))) {
        console.log("Invalid client ID");
        res.setHeader('Content-Type', 'application/json');
        res.status(400).send(JSON.stringify({ message: "Valid client ID is required" }));
        return;
      }
      
      // Convert to number if it's a string
      const clientIdNum = typeof clientId === 'string' ? parseInt(clientId) : clientId;
      
      // Use our hardcoded client list for reliability
      const clientRef = hardcodedClients.find(c => c.id === clientIdNum);
      if (!clientRef) {
        console.log(`No client found with ID ${clientIdNum} in hardcoded client list`);
        res.setHeader('Content-Type', 'application/json');
        res.status(404).send(JSON.stringify({ message: "Client not found" }));
        return;
      }
      
      console.log(`Found client: ${clientRef.name} (${clientRef.username}) with roleId: ${clientRef.roleId}`);
      console.log(`[TEST] Project ${projectId} successfully assigned to client ${clientIdNum} (${clientRef.name})`);
      
      // Return success for testing
      const responseData = { 
        success: true, 
        message: `Project ${projectId} assigned to client ${clientIdNum}`,
        project: {
          id: projectId,
          title: "Test Project",
          clientId: clientIdNum,
          clientName: clientRef.name
        }
      };
      
      console.log("Sending response:", JSON.stringify(responseData));
      res.setHeader('Content-Type', 'application/json');
      res.status(200).send(JSON.stringify(responseData));
    } catch (error) {
      console.error("Error in test assign project endpoint:", error);
      res.setHeader('Content-Type', 'application/json');
      res.status(500).send(JSON.stringify({ message: "Internal server error" }));
    }
  });
  
  // Assign a project to a client (protected with real auth)
  app.post("/api/projects/:id/assign", requirePermission("projects", "manage"), async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const { clientId } = req.body;
      
      console.log(`Assigning project ${projectId} to client ${clientId}`);
      
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      
      if (!clientId || isNaN(parseInt(clientId.toString()))) {
        return res.status(400).json({ message: "Valid client ID is required" });
      }
      
      // Convert to number if it's a string
      const clientIdNum = typeof clientId === 'string' ? parseInt(clientId) : clientId;
      
      // Check if project exists
      const existingProject = await storage.getProject(projectId);
      if (!existingProject) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Instead of searching DB, use our hardcoded client list for reliability
      const clientRef = hardcodedClients.find(c => c.id === clientIdNum);
      if (!clientRef) {
        console.log(`No client found with ID ${clientIdNum} in hardcoded client list`);
        return res.status(404).json({ message: "Client not found" });
      }
      
      console.log(`Found client: ${clientRef.name} (${clientRef.username}) with roleId: ${clientRef.roleId}`);
      
      // Update the project with the new client ID
      const updatedProject = await storage.updateProject(projectId, { clientId: clientIdNum });
      
      console.log(`Project ${projectId} successfully assigned to client ${clientIdNum} (${clientRef.name})`);
      return res.json(updatedProject);
    } catch (error) {
      console.error("Error assigning project:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Blog posts
  app.get("/api/blog", async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const blogPosts = await storage.getAllBlogPosts(category);
      return res.json(blogPosts);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/blog/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid blog post ID" });
    }
    
    try {
      const blogPost = await storage.getBlogPost(id);
      if (!blogPost) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      return res.json(blogPost);
    } catch (error) {
      console.error("Error fetching blog post:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Create blog post (protected)
  app.post("/api/blog", requirePermission("blog_posts", "manage"), async (req, res) => {
    try {
      // If the user is authenticated, we can access req.user
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      // Set the author ID to the current user
      const blogPostData = {
        ...insertBlogPostSchema.parse(req.body),
        authorId: req.user.id
      };
      
      const blogPost = await storage.createBlogPost(blogPostData);
      return res.status(201).json(blogPost);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid blog post data", errors: error.errors });
      }
      console.error("Error creating blog post:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Jobs/Careers
  app.get("/api/jobs", async (req, res) => {
    try {
      const jobs = await storage.getAllJobs();
      return res.json(jobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Create job posting (protected)
  app.post("/api/jobs", requirePermission("jobs", "manage"), async (req, res) => {
    try {
      const jobData = insertJobSchema.parse(req.body);
      const job = await storage.createJob(jobData);
      return res.status(201).json(job);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid job data", errors: error.errors });
      }
      console.error("Error creating job:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Protected route for viewing contact messages
  app.get("/api/contact-messages", requirePermission("contact_messages", "read"), async (req, res) => {
    try {
      // This would be implemented in a real application with pagination
      // For now, let's simulate a basic response
      const messages = []; // This would come from storage.getAllContactMessages() in a real implementation
      return res.json(messages);
    } catch (error) {
      console.error("Error fetching contact messages:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Special endpoint to update Firebase IDs to sequential pattern
  app.post("/api/admin/update-firebase-ids", requirePermission("admin", "manage"), async (req, res) => {
    try {
      console.log("Starting Firebase ID update process...");
      const result = await updateFirebaseIds();
      
      // Force pure JSON response with no HTML by ending request immediately
      if (result) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: true, 
          message: "Firebase IDs updated successfully to sequential format",
          idRanges: {
            projects: "Starting at 500",
            clients: "Starting at 2000",
            roles: "Starting at 1000",
            services: "Starting at 3000",
            testimonials: "Starting at 4000",
            blogPosts: "Starting at 5000"
          }
        }));
      } else {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: false, 
          message: "Failed to update Firebase IDs" 
        }));
      }
    } catch (error) {
      console.error("Error updating Firebase IDs:", error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        success: false, 
        message: "Error updating Firebase IDs", 
        error: String(error) 
      }));
    }
  });
  
  // Debug endpoint to update Firebase IDs (temporary - not protected)
  app.post("/api/debug/update-firebase-ids", async (req, res) => {
    try {
      console.log("Starting Firebase ID update process (DEBUG mode)...");
      const result = await updateFirebaseIds();
      
      // Force pure JSON response with no HTML by ending request immediately
      if (result) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: true, 
          message: "Firebase IDs updated successfully to sequential format",
          idRanges: {
            projects: "Starting at 500",
            clients: "Starting at 2000",
            roles: "Starting at 1000",
            services: "Starting at 3000",
            testimonials: "Starting at 4000",
            blogPosts: "Starting at 5000"
          }
        }));
      } else {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: false, 
          message: "Failed to update Firebase IDs" 
        }));
      }
    } catch (error) {
      console.error("Error updating Firebase IDs:", error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        success: false, 
        message: "Error updating Firebase IDs", 
        error: String(error) 
      }));
    }
  });
  
  // Protected route for viewing newsletter subscribers
  app.get("/api/newsletter-subscribers", requirePermission("newsletter_subscribers", "manage"), async (req, res) => {
    try {
      // This would be implemented in a real application with pagination
      // For now, let's simulate a basic response
      const subscribers = []; // This would come from storage.getAllNewsletterSubscribers() in a real implementation
      return res.json(subscribers);
    } catch (error) {
      console.error("Error fetching newsletter subscribers:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Special endpoint to initialize the database with sample data
  // This would typically be protected or disabled in production
  app.post("/api/init-database", async (req, res) => {
    try {
      const result = await initializeDatabase();
      if (result) {
        return res.status(200).json({ message: "Database initialized successfully" });
      } else {
        return res.status(500).json({ message: "Database initialization failed" });
      }
    } catch (error) {
      console.error("Error initializing database:", error);
      return res.status(500).json({ message: "Database initialization failed", error: error.message });
    }
  });

  // Endpoint to assign a project to a client
  app.post("/api/projects/assign", async (req, res) => {
    try {
      const { projectId, clientId } = req.body;
      
      if (!projectId || !clientId) {
        return res.status(400).json({ 
          success: false, 
          message: "Missing projectId or clientId in request body" 
        });
      }
      
      // First, get the project and client to ensure they exist
      const project = await storage.getProject(Number(projectId));
      const client = await storage.getUser(Number(clientId));
      
      if (!project) {
        return res.status(404).json({ 
          success: false, 
          message: `Project with ID ${projectId} not found` 
        });
      }
      
      if (!client) {
        return res.status(404).json({ 
          success: false, 
          message: `Client with ID ${clientId} not found` 
        });
      }
      
      // Check if client has the client role (roleId can be string or number)
      // Convert roleId to string for comparison (handles both string and number types)
      const clientRoleIdString = String(client.roleId);
      if (clientRoleIdString !== "1001") {
        return res.status(400).json({ 
          success: false, 
          message: "The specified user is not a client" 
        });
      }
      
      // Update the project with the client ID
      const updatedProject = await storage.updateProject(Number(projectId), { 
        clientId: Number(clientId) 
      });
      
      // Return success response with the updated project
      return res.status(200).json({
        success: true,
        message: `Project ${projectId} assigned to client ${clientId}`,
        project: updatedProject
      });
    } catch (error) {
      console.error("Error assigning project to client:", error);
      return res.status(500).json({ 
        success: false, 
        message: "An error occurred while assigning the project", 
        error: String(error) 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
