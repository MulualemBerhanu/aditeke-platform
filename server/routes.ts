import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
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
  // Role management (protected by system permissions)
  app.get("/api/roles", requirePermission("roles", "read"), async (req, res) => {
    try {
      const roles = await storage.getAllRoles();
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
      // In a real application, you would implement pagination here
      const users = await Promise.all(
        Array.from({ length: 10 }, (_, i) => storage.getUser(i + 1))
      );
      
      // Filter out null values and remove passwords
      const filteredUsers = users
        .filter(user => user !== undefined)
        .map(user => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { password, ...userWithoutPassword } = user!;
          return userWithoutPassword;
        });
      
      return res.json(filteredUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
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

  const httpServer = createServer(app);
  return httpServer;
}
