import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq, sql, like, ilike, inArray } from 'drizzle-orm';
import postgres from 'postgres';
import {
  users, type User, type InsertUser,
  roles, type Role, type InsertRole,
  permissions, type Permission, type InsertPermission,
  rolePermissions, type RolePermission, type InsertRolePermission,
  projects, type Project, type InsertProject,
  testimonials, type Testimonial, type InsertTestimonial,
  services, type Service, type InsertService,
  blogPosts, type BlogPost, type InsertBlogPost,
  contactMessages, type ContactMessage, type InsertContactMessage,
  newsletterSubscribers, type NewsletterSubscriber, type InsertNewsletterSubscriber,
  jobs, type Job, type InsertJob,
  clientCommunications, type ClientCommunication, type InsertClientCommunication,
  clientDocuments, type ClientDocument, type InsertClientDocument,
  clientInvoices, type ClientInvoice, type InsertClientInvoice
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<InsertUser>): Promise<User>;
  
  // Role methods
  getRole(id: number): Promise<Role | undefined>;
  getRoleByName(name: string): Promise<Role | undefined>;
  getAllRoles(): Promise<Role[]>;
  createRole(role: InsertRole): Promise<Role>;
  updateRole(id: number, roleData: Partial<InsertRole>): Promise<Role>;
  deleteRole(id: number): Promise<boolean>;
  
  // Permission methods
  getPermission(id: number): Promise<Permission | undefined>;
  getPermissionByName(name: string): Promise<Permission | undefined>;
  getAllPermissions(): Promise<Permission[]>;
  getPermissionsByResource(resource: string): Promise<Permission[]>;
  createPermission(permission: InsertPermission): Promise<Permission>;
  updatePermission(id: number, permissionData: Partial<InsertPermission>): Promise<Permission>;
  deletePermission(id: number): Promise<boolean>;
  
  // Role-Permission methods
  assignPermissionToRole(roleId: number, permissionId: number): Promise<RolePermission>;
  removePermissionFromRole(roleId: number, permissionId: number): Promise<boolean>;
  getPermissionsForRole(roleId: number): Promise<Permission[]>;
  getRolesForPermission(permissionId: number): Promise<Role[]>;
  
  // User-Role-Permission methods
  getUserWithPermissions(userId: number): Promise<{ user: User; role: Role; permissions: Permission[] }>;
  hasPermission(userId: number, resource: string, action: string): Promise<boolean>;
  
  // Project methods
  getAllProjects(category?: string): Promise<Project[]>;
  getProjectsForClient(clientId: number): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, projectData: Partial<InsertProject>): Promise<Project>;
  
  // Testimonial methods
  getAllTestimonials(): Promise<Testimonial[]>;
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;
  
  // Service methods
  getAllServices(): Promise<Service[]>;
  getService(id: number): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  
  // Blog methods
  getAllBlogPosts(category?: string): Promise<BlogPost[]>;
  getBlogPost(id: number): Promise<BlogPost | undefined>;
  createBlogPost(blogPost: InsertBlogPost): Promise<BlogPost>;
  
  // Contact methods
  saveContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  
  // Newsletter methods
  addNewsletterSubscriber(subscriber: InsertNewsletterSubscriber): Promise<NewsletterSubscriber>;
  
  // Job methods
  getAllJobs(): Promise<Job[]>;
  getJob(id: number): Promise<Job | undefined>;
  createJob(job: InsertJob): Promise<Job>;
  
  // Client Communications methods
  getClientCommunications(clientId: number): Promise<ClientCommunication[]>;
  createClientCommunication(communication: InsertClientCommunication): Promise<ClientCommunication>;
  markCommunicationAsRead(id: number): Promise<ClientCommunication>;
  
  // Client Documents methods
  getClientDocuments(clientId: number, category?: string): Promise<ClientDocument[]>;
  uploadClientDocument(document: InsertClientDocument): Promise<ClientDocument>;
  getDocument(id: number): Promise<ClientDocument | undefined>;
  deleteDocument(id: number): Promise<boolean>;
  
  // Client Invoices methods
  getClientInvoices(clientId: number): Promise<ClientInvoice[]>;
  getInvoice(id: number): Promise<ClientInvoice | undefined>;
  createClientInvoice(invoice: InsertClientInvoice): Promise<ClientInvoice>;
  updateInvoiceStatus(id: number, status: string, paymentData?: Partial<InsertClientInvoice>): Promise<ClientInvoice>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private roles: Map<number, Role>;
  private permissions: Map<number, Permission>;
  private rolePermissions: Map<number, RolePermission>;
  private projects: Map<number, Project>;
  private testimonials: Map<number, Testimonial>;
  private services: Map<number, Service>;
  private blogPosts: Map<number, BlogPost>;
  private contactMessages: Map<number, ContactMessage>;
  private newsletterSubscribers: Map<number, NewsletterSubscriber>;
  private jobs: Map<number, Job>;
  private clientCommunications: Map<number, ClientCommunication>;
  private clientDocuments: Map<number, ClientDocument>;
  private clientInvoices: Map<number, ClientInvoice>;
  
  private userIdCounter: number;
  private roleIdCounter: number;
  private permissionIdCounter: number;
  private rolePermissionIdCounter: number;
  private projectIdCounter: number;
  private testimonialIdCounter: number;
  private serviceIdCounter: number;
  private blogPostIdCounter: number;
  private contactMessageIdCounter: number;
  private newsletterSubscriberIdCounter: number;
  private jobIdCounter: number;
  private clientCommunicationIdCounter: number;
  private clientDocumentIdCounter: number;
  private clientInvoiceIdCounter: number;

  constructor() {
    this.users = new Map();
    this.roles = new Map();
    this.permissions = new Map();
    this.rolePermissions = new Map();
    this.projects = new Map();
    this.testimonials = new Map();
    this.services = new Map();
    this.blogPosts = new Map();
    this.contactMessages = new Map();
    this.newsletterSubscribers = new Map();
    this.jobs = new Map();
    this.clientCommunications = new Map();
    this.clientDocuments = new Map();
    this.clientInvoices = new Map();
    
    this.userIdCounter = 1;
    this.roleIdCounter = 1;
    this.permissionIdCounter = 1;
    this.rolePermissionIdCounter = 1;
    this.projectIdCounter = 1;
    this.testimonialIdCounter = 1;
    this.serviceIdCounter = 1;
    this.blogPostIdCounter = 1;
    this.contactMessageIdCounter = 1;
    this.newsletterSubscriberIdCounter = 1;
    this.jobIdCounter = 1;
    this.clientCommunicationIdCounter = 1;
    this.clientDocumentIdCounter = 1;
    this.clientInvoiceIdCounter = 1;

    // Add initial demo data
    try {
      // Initialize roles first since other entities depend on them
      this.initializeRolesAndPermissions()
        .then(() => {
          // Then initialize the rest of the data
          this.initializeServices();
          this.initializeTestimonials();
          this.initializeProjects();
          this.initializeUsers();
          console.log("Demo data initialized successfully");
        })
        .catch(error => {
          console.error("Error initializing demo data:", error);
        });
    } catch (error) {
      console.error("Error in initialization:", error);
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt, 
      updatedAt: null, 
      lastLogin: null,
      profilePicture: insertUser.profilePicture || null,
      isActive: insertUser.isActive !== undefined ? insertUser.isActive : true
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    
    const updatedUser: User = {
      ...user,
      ...userData,
      updatedAt: new Date(),
      id
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Role methods
  async getRole(id: number): Promise<Role | undefined> {
    return this.roles.get(id);
  }
  
  async getRoleByName(name: string): Promise<Role | undefined> {
    return Array.from(this.roles.values()).find(role => role.name === name);
  }
  
  async getAllRoles(): Promise<Role[]> {
    return Array.from(this.roles.values());
  }
  
  async createRole(insertRole: InsertRole): Promise<Role> {
    const id = this.roleIdCounter++;
    const createdAt = new Date();
    const role: Role = {
      ...insertRole,
      id,
      createdAt,
      updatedAt: null
    };
    this.roles.set(id, role);
    return role;
  }
  
  async updateRole(id: number, roleData: Partial<InsertRole>): Promise<Role> {
    const role = this.roles.get(id);
    if (!role) {
      throw new Error(`Role with id ${id} not found`);
    }
    
    const updatedRole: Role = {
      ...role,
      ...roleData,
      updatedAt: new Date(),
      id
    };
    
    this.roles.set(id, updatedRole);
    return updatedRole;
  }
  
  async deleteRole(id: number): Promise<boolean> {
    // Check if role is in use by any users
    const usersWithRole = Array.from(this.users.values()).filter(user => user.roleId === id);
    if (usersWithRole.length > 0) {
      throw new Error(`Cannot delete role with id ${id} because it is assigned to ${usersWithRole.length} users`);
    }
    
    return this.roles.delete(id);
  }
  
  // Permission methods
  async getPermission(id: number): Promise<Permission | undefined> {
    return this.permissions.get(id);
  }
  
  async getPermissionByName(name: string): Promise<Permission | undefined> {
    return Array.from(this.permissions.values()).find(permission => permission.name === name);
  }
  
  async getAllPermissions(): Promise<Permission[]> {
    return Array.from(this.permissions.values());
  }
  
  async getPermissionsByResource(resource: string): Promise<Permission[]> {
    return Array.from(this.permissions.values()).filter(permission => permission.resource === resource);
  }
  
  async createPermission(insertPermission: InsertPermission): Promise<Permission> {
    const id = this.permissionIdCounter++;
    const createdAt = new Date();
    const permission: Permission = {
      ...insertPermission,
      id,
      createdAt,
      updatedAt: null
    };
    this.permissions.set(id, permission);
    return permission;
  }
  
  async updatePermission(id: number, permissionData: Partial<InsertPermission>): Promise<Permission> {
    const permission = this.permissions.get(id);
    if (!permission) {
      throw new Error(`Permission with id ${id} not found`);
    }
    
    const updatedPermission: Permission = {
      ...permission,
      ...permissionData,
      updatedAt: new Date(),
      id
    };
    
    this.permissions.set(id, updatedPermission);
    return updatedPermission;
  }
  
  async deletePermission(id: number): Promise<boolean> {
    // Check if permission is assigned to any roles
    const rolePermissionsWithPermission = Array.from(this.rolePermissions.values()).filter(rp => rp.permissionId === id);
    if (rolePermissionsWithPermission.length > 0) {
      throw new Error(`Cannot delete permission with id ${id} because it is assigned to ${rolePermissionsWithPermission.length} roles`);
    }
    
    return this.permissions.delete(id);
  }
  
  // Role-Permission methods
  async assignPermissionToRole(roleId: number, permissionId: number): Promise<RolePermission> {
    // Check if role exists
    const role = this.roles.get(roleId);
    if (!role) {
      throw new Error(`Role with id ${roleId} not found`);
    }
    
    // Check if permission exists
    const permission = this.permissions.get(permissionId);
    if (!permission) {
      throw new Error(`Permission with id ${permissionId} not found`);
    }
    
    // Check if assignment already exists
    const existingAssignment = Array.from(this.rolePermissions.values()).find(
      rp => rp.roleId === roleId && rp.permissionId === permissionId
    );
    
    if (existingAssignment) {
      return existingAssignment; // If the assignment already exists, return it
    }
    
    // Create new assignment
    const id = this.rolePermissionIdCounter++;
    const createdAt = new Date();
    const rolePermission: RolePermission = {
      id,
      roleId,
      permissionId,
      createdAt
    };
    
    this.rolePermissions.set(id, rolePermission);
    return rolePermission;
  }
  
  async removePermissionFromRole(roleId: number, permissionId: number): Promise<boolean> {
    const rolePermissionToRemove = Array.from(this.rolePermissions.values()).find(
      rp => rp.roleId === roleId && rp.permissionId === permissionId
    );
    
    if (!rolePermissionToRemove) {
      return false; // Nothing to remove
    }
    
    return this.rolePermissions.delete(rolePermissionToRemove.id);
  }
  
  async getPermissionsForRole(roleId: number): Promise<Permission[]> {
    // Get all role-permission assignments for this role
    const rolePermissionsForRole = Array.from(this.rolePermissions.values()).filter(
      rp => rp.roleId === roleId
    );
    
    // Get all permission IDs
    const permissionIds = rolePermissionsForRole.map(rp => rp.permissionId);
    
    // Get all permissions with these IDs
    return Array.from(this.permissions.values()).filter(
      permission => permissionIds.includes(permission.id)
    );
  }
  
  async getRolesForPermission(permissionId: number): Promise<Role[]> {
    // Get all role-permission assignments for this permission
    const rolePermissionsForPermission = Array.from(this.rolePermissions.values()).filter(
      rp => rp.permissionId === permissionId
    );
    
    // Get all role IDs
    const roleIds = rolePermissionsForPermission.map(rp => rp.roleId);
    
    // Get all roles with these IDs
    return Array.from(this.roles.values()).filter(
      role => roleIds.includes(role.id)
    );
  }
  
  // User-Role-Permission methods
  async getUserWithPermissions(userId: number): Promise<{ user: User; role: Role; permissions: Permission[] }> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error(`User with id ${userId} not found`);
    }
    
    const role = this.roles.get(user.roleId);
    if (!role) {
      throw new Error(`Role with id ${user.roleId} not found for user ${userId}`);
    }
    
    const permissions = await this.getPermissionsForRole(role.id);
    
    return { user, role, permissions };
  }
  
  async hasPermission(userId: number, resource: string, action: string): Promise<boolean> {
    try {
      const { permissions } = await this.getUserWithPermissions(userId);
      
      // Check if user has a permission for this resource and action
      return permissions.some(
        permission => 
          permission.resource === resource && 
          (permission.action === action || permission.action === 'manage')
      );
    } catch (error) {
      return false;
    }
  }

  // Project methods
  async getAllProjects(category?: string): Promise<Project[]> {
    const projects = Array.from(this.projects.values());
    
    if (category && category !== 'all') {
      return projects.filter(project => project.category === category);
    }
    
    return projects;
  }
  
  async getProjectsForClient(clientId: number): Promise<Project[]> {
    const projects = Array.from(this.projects.values());
    return projects.filter(project => project.clientId === clientId);
  }

  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = this.projectIdCounter++;
    const project: Project = { ...insertProject, id };
    this.projects.set(id, project);
    return project;
  }
  
  async updateProject(id: number, projectData: Partial<InsertProject>): Promise<Project> {
    const project = this.projects.get(id);
    if (!project) {
      throw new Error(`Project with id ${id} not found`);
    }
    
    const updatedProject: Project = {
      ...project,
      ...projectData,
    };
    
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  // Testimonial methods
  async getAllTestimonials(): Promise<Testimonial[]> {
    return Array.from(this.testimonials.values()).filter(testimonial => testimonial.isActive);
  }

  async createTestimonial(insertTestimonial: InsertTestimonial): Promise<Testimonial> {
    const id = this.testimonialIdCounter++;
    const testimonial: Testimonial = { ...insertTestimonial, id };
    this.testimonials.set(id, testimonial);
    return testimonial;
  }

  // Service methods
  async getAllServices(): Promise<Service[]> {
    return Array.from(this.services.values()).filter(service => service.isActive);
  }

  async getService(id: number): Promise<Service | undefined> {
    return this.services.get(id);
  }

  async createService(insertService: InsertService): Promise<Service> {
    const id = this.serviceIdCounter++;
    const service: Service = { ...insertService, id };
    this.services.set(id, service);
    return service;
  }

  // Blog methods
  async getAllBlogPosts(category?: string): Promise<BlogPost[]> {
    const blogPosts = Array.from(this.blogPosts.values()).filter(post => post.isPublished);
    
    if (category) {
      return blogPosts.filter(post => post.category === category);
    }
    
    return blogPosts;
  }

  async getBlogPost(id: number): Promise<BlogPost | undefined> {
    return this.blogPosts.get(id);
  }

  async createBlogPost(insertBlogPost: InsertBlogPost): Promise<BlogPost> {
    const id = this.blogPostIdCounter++;
    const createdAt = new Date();
    const blogPost: BlogPost = { 
      ...insertBlogPost, 
      id,
      createdAt,
      updatedAt: createdAt
    };
    this.blogPosts.set(id, blogPost);
    return blogPost;
  }

  // Contact methods
  async saveContactMessage(insertContactMessage: InsertContactMessage): Promise<ContactMessage> {
    const id = this.contactMessageIdCounter++;
    const createdAt = new Date();
    const contactMessage: ContactMessage = {
      ...insertContactMessage,
      id,
      createdAt,
      isResolved: false
    };
    this.contactMessages.set(id, contactMessage);
    return contactMessage;
  }

  // Newsletter methods
  async addNewsletterSubscriber(insertSubscriber: InsertNewsletterSubscriber): Promise<NewsletterSubscriber> {
    // Check if subscriber already exists
    const existingSubscriber = Array.from(this.newsletterSubscribers.values()).find(
      subscriber => subscriber.email === insertSubscriber.email
    );
    
    if (existingSubscriber) {
      // If subscriber exists but is inactive, reactivate them
      if (!existingSubscriber.isActive) {
        existingSubscriber.isActive = true;
        this.newsletterSubscribers.set(existingSubscriber.id, existingSubscriber);
      }
      return existingSubscriber;
    }
    
    // Create new subscriber
    const id = this.newsletterSubscriberIdCounter++;
    const subscriptionDate = new Date();
    const subscriber: NewsletterSubscriber = {
      ...insertSubscriber,
      id,
      subscriptionDate,
      isActive: true
    };
    this.newsletterSubscribers.set(id, subscriber);
    return subscriber;
  }

  // Job methods
  async getAllJobs(): Promise<Job[]> {
    return Array.from(this.jobs.values()).filter(job => job.isActive);
  }

  async getJob(id: number): Promise<Job | undefined> {
    return this.jobs.get(id);
  }

  async createJob(insertJob: InsertJob): Promise<Job> {
    const id = this.jobIdCounter++;
    const postedDate = new Date();
    const job: Job = { ...insertJob, id, postedDate };
    this.jobs.set(id, job);
    return job;
  }
  
  // Client Communications methods
  async getClientCommunications(clientId: number): Promise<ClientCommunication[]> {
    return Array.from(this.clientCommunications.values())
      .filter(comm => comm.clientId === clientId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async createClientCommunication(communication: InsertClientCommunication): Promise<ClientCommunication> {
    const id = this.clientCommunicationIdCounter++;
    const createdAt = new Date();
    const clientCommunication: ClientCommunication = {
      ...communication,
      id,
      createdAt,
      isRead: communication.isRead !== undefined ? communication.isRead : false
    };
    this.clientCommunications.set(id, clientCommunication);
    return clientCommunication;
  }
  
  async markCommunicationAsRead(id: number): Promise<ClientCommunication> {
    const communication = this.clientCommunications.get(id);
    if (!communication) {
      throw new Error(`Communication with id ${id} not found`);
    }
    
    communication.isRead = true;
    this.clientCommunications.set(id, communication);
    return communication;
  }
  
  // Client Documents methods
  async getClientDocuments(clientId: number, category?: string): Promise<ClientDocument[]> {
    let documents = Array.from(this.clientDocuments.values())
      .filter(doc => doc.clientId === clientId);
      
    if (category) {
      documents = documents.filter(doc => doc.category === category);
    }
    
    return documents.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  }
  
  async uploadClientDocument(document: InsertClientDocument): Promise<ClientDocument> {
    const id = this.clientDocumentIdCounter++;
    const uploadedAt = new Date();
    const clientDocument: ClientDocument = {
      ...document,
      id,
      uploadedAt
    };
    this.clientDocuments.set(id, clientDocument);
    return clientDocument;
  }
  
  async getDocument(id: number): Promise<ClientDocument | undefined> {
    return this.clientDocuments.get(id);
  }
  
  async deleteDocument(id: number): Promise<boolean> {
    return this.clientDocuments.delete(id);
  }
  
  // Client Invoices methods
  async getClientInvoices(clientId: number): Promise<ClientInvoice[]> {
    return Array.from(this.clientInvoices.values())
      .filter(invoice => invoice.clientId === clientId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async getInvoice(id: number): Promise<ClientInvoice | undefined> {
    return this.clientInvoices.get(id);
  }
  
  async createClientInvoice(invoice: InsertClientInvoice): Promise<ClientInvoice> {
    const id = this.clientInvoiceIdCounter++;
    const createdAt = new Date();
    const clientInvoice: ClientInvoice = {
      ...invoice,
      id,
      createdAt,
      updatedAt: null,
      status: invoice.status || 'pending'
    };
    this.clientInvoices.set(id, clientInvoice);
    return clientInvoice;
  }
  
  async updateInvoiceStatus(id: number, status: string, paymentData?: Partial<InsertClientInvoice>): Promise<ClientInvoice> {
    const invoice = this.clientInvoices.get(id);
    if (!invoice) {
      throw new Error(`Invoice with id ${id} not found`);
    }
    
    const updatedInvoice: ClientInvoice = {
      ...invoice,
      ...paymentData,
      status,
      updatedAt: new Date()
    };
    
    if (status === 'paid' && !updatedInvoice.paidDate) {
      updatedInvoice.paidDate = new Date();
    }
    
    this.clientInvoices.set(id, updatedInvoice);
    return updatedInvoice;
  }

  // Initialize sample data methods
  private async initializeRolesAndPermissions() {
    // Create roles
    const adminRole = await this.createRole({
      name: "admin",
      description: "Administrator with full access to all features"
    });
    
    const managerRole = await this.createRole({
      name: "manager",
      description: "Manager with access to manage most resources except system settings"
    });
    
    const clientRole = await this.createRole({
      name: "client",
      description: "Client with limited access to personal projects and services"
    });
    
    const guestRole = await this.createRole({
      name: "guest",
      description: "Guest with minimal access to public information only"
    });
    
    // Create permissions for different resources
    
    // User resource permissions
    const viewUsers = await this.createPermission({
      name: "view_users",
      description: "View user profiles",
      resource: "users",
      action: "read"
    });
    
    const manageUsers = await this.createPermission({
      name: "manage_users",
      description: "Create, update, and delete users",
      resource: "users",
      action: "manage"
    });
    
    // Project resource permissions
    const viewProjects = await this.createPermission({
      name: "view_projects",
      description: "View projects",
      resource: "projects",
      action: "read"
    });
    
    const manageProjects = await this.createPermission({
      name: "manage_projects",
      description: "Create, update, and delete projects",
      resource: "projects",
      action: "manage"
    });
    
    // Service resource permissions
    const viewServices = await this.createPermission({
      name: "view_services",
      description: "View services",
      resource: "services",
      action: "read"
    });
    
    const manageServices = await this.createPermission({
      name: "manage_services",
      description: "Create, update, and delete services",
      resource: "services",
      action: "manage"
    });
    
    // Blog resource permissions
    const viewBlogPosts = await this.createPermission({
      name: "view_blog_posts",
      description: "View blog posts",
      resource: "blog_posts",
      action: "read"
    });
    
    const manageBlogPosts = await this.createPermission({
      name: "manage_blog_posts",
      description: "Create, update, and delete blog posts",
      resource: "blog_posts",
      action: "manage"
    });
    
    // Job resource permissions
    const viewJobs = await this.createPermission({
      name: "view_jobs",
      description: "View job listings",
      resource: "jobs",
      action: "read"
    });
    
    const manageJobs = await this.createPermission({
      name: "manage_jobs",
      description: "Create, update, and delete job listings",
      resource: "jobs",
      action: "manage"
    });
    
    // Contact message permissions
    const viewContactMessages = await this.createPermission({
      name: "view_contact_messages",
      description: "View contact messages",
      resource: "contact_messages",
      action: "read"
    });
    
    const manageContactMessages = await this.createPermission({
      name: "manage_contact_messages",
      description: "Manage contact messages",
      resource: "contact_messages",
      action: "manage"
    });
    
    // Newsletter permissions
    const manageNewsletterSubscribers = await this.createPermission({
      name: "manage_newsletter_subscribers",
      description: "Manage newsletter subscribers",
      resource: "newsletter_subscribers",
      action: "manage"
    });
    
    // System permissions
    const manageRoles = await this.createPermission({
      name: "manage_roles",
      description: "Create, update, and delete roles",
      resource: "roles",
      action: "manage"
    });
    
    const managePermissions = await this.createPermission({
      name: "manage_permissions",
      description: "Create, update, and delete permissions",
      resource: "permissions",
      action: "manage"
    });
    
    // Assign permissions to roles
    
    // Admin role - gets all permissions
    await this.assignPermissionToRole(adminRole.id, viewUsers.id);
    await this.assignPermissionToRole(adminRole.id, manageUsers.id);
    await this.assignPermissionToRole(adminRole.id, viewProjects.id);
    await this.assignPermissionToRole(adminRole.id, manageProjects.id);
    await this.assignPermissionToRole(adminRole.id, viewServices.id);
    await this.assignPermissionToRole(adminRole.id, manageServices.id);
    await this.assignPermissionToRole(adminRole.id, viewBlogPosts.id);
    await this.assignPermissionToRole(adminRole.id, manageBlogPosts.id);
    await this.assignPermissionToRole(adminRole.id, viewJobs.id);
    await this.assignPermissionToRole(adminRole.id, manageJobs.id);
    await this.assignPermissionToRole(adminRole.id, viewContactMessages.id);
    await this.assignPermissionToRole(adminRole.id, manageContactMessages.id);
    await this.assignPermissionToRole(adminRole.id, manageNewsletterSubscribers.id);
    await this.assignPermissionToRole(adminRole.id, manageRoles.id);
    await this.assignPermissionToRole(adminRole.id, managePermissions.id);
    
    // Manager role - gets most management permissions except system
    await this.assignPermissionToRole(managerRole.id, viewUsers.id);
    await this.assignPermissionToRole(managerRole.id, viewProjects.id);
    await this.assignPermissionToRole(managerRole.id, manageProjects.id);
    await this.assignPermissionToRole(managerRole.id, viewServices.id);
    await this.assignPermissionToRole(managerRole.id, manageServices.id);
    await this.assignPermissionToRole(managerRole.id, viewBlogPosts.id);
    await this.assignPermissionToRole(managerRole.id, manageBlogPosts.id);
    await this.assignPermissionToRole(managerRole.id, viewJobs.id);
    await this.assignPermissionToRole(managerRole.id, manageJobs.id);
    await this.assignPermissionToRole(managerRole.id, viewContactMessages.id);
    await this.assignPermissionToRole(managerRole.id, manageContactMessages.id);
    await this.assignPermissionToRole(managerRole.id, manageNewsletterSubscribers.id);
    
    // Client role - gets view permissions and project management
    await this.assignPermissionToRole(clientRole.id, viewUsers.id);
    await this.assignPermissionToRole(clientRole.id, viewProjects.id);
    await this.assignPermissionToRole(clientRole.id, viewServices.id);
    await this.assignPermissionToRole(clientRole.id, viewBlogPosts.id);
    await this.assignPermissionToRole(clientRole.id, viewJobs.id);
    
    // Guest role - gets only view permissions for public resources
    await this.assignPermissionToRole(guestRole.id, viewServices.id);
    await this.assignPermissionToRole(guestRole.id, viewBlogPosts.id);
    await this.assignPermissionToRole(guestRole.id, viewJobs.id);
  }
  
  private async initializeUsers() {
    // Get roles
    const adminRole = await this.getRoleByName("admin");
    const managerRole = await this.getRoleByName("manager");
    const clientRole = await this.getRoleByName("client");
    
    if (!adminRole || !managerRole || !clientRole) {
      console.error("Roles not found. Make sure to initialize roles first.");
      return;
    }
    
    const adminUser: InsertUser = {
      username: "admin",
      password: "password123", // in production this should be hashed
      email: "admin@aditeke.com",
      name: "Admin User",
      roleId: adminRole.id,
      profilePicture: "https://randomuser.me/api/portraits/men/1.jpg",
      isActive: true
    };
    
    const managerUser: InsertUser = {
      username: "manager",
      password: "password123", // in production this should be hashed
      email: "manager@aditeke.com",
      name: "Manager User",
      roleId: managerRole.id,
      profilePicture: "https://randomuser.me/api/portraits/men/5.jpg",
      isActive: true
    };
    
    const clientUser: InsertUser = {
      username: "client",
      password: "password123", // in production this should be hashed
      email: "client@example.com",
      name: "Client User",
      roleId: clientRole.id,
      profilePicture: "https://randomuser.me/api/portraits/women/1.jpg",
      isActive: true
    };
    
    await this.createUser(adminUser);
    await this.createUser(managerUser);
    await this.createUser(clientUser);
  }

  private initializeServices() {
    const services: InsertService[] = [
      {
        title: "Web Development",
        shortDescription: "Custom websites and web applications that are responsive, fast, and built with modern technologies.",
        description: "Our web development team creates custom websites and web applications tailored to your specific needs. We use the latest technologies and frameworks to ensure your website is responsive, fast, and secure. Whether you need a simple corporate website or a complex web application, we have the expertise to deliver exceptional results.",
        icon: "fa-laptop-code",
        isActive: true
      },
      {
        title: "Mobile App Development",
        shortDescription: "Native and cross-platform mobile applications for iOS and Android devices with seamless user experiences.",
        description: "We build native and cross-platform mobile applications for iOS and Android devices that provide seamless user experiences. Our mobile app development team uses the latest technologies to create high-performance, feature-rich applications that meet your business objectives and delight your users.",
        icon: "fa-mobile-alt",
        isActive: true
      },
      {
        title: "AI Solutions",
        shortDescription: "Intelligent AI-powered applications, chatbots, and automation tools to streamline your business processes.",
        description: "Our AI solutions leverage the latest advancements in artificial intelligence to help businesses automate processes, gain insights, and enhance customer experiences. We develop intelligent chatbots, recommendation engines, predictive analytics systems, and other AI-powered applications tailored to your specific business needs.",
        icon: "fa-brain",
        isActive: true
      },
      {
        title: "Business Intelligence",
        shortDescription: "Data analytics and reporting tools that provide actionable insights to drive informed business decisions.",
        description: "Our business intelligence solutions help you transform raw data into actionable insights that drive informed business decisions. We develop custom data analytics, visualization, and reporting tools that make it easy to understand your data and identify trends, patterns, and opportunities for growth.",
        icon: "fa-chart-line",
        isActive: true
      },
      {
        title: "Cybersecurity",
        shortDescription: "Robust security solutions to protect your digital assets, data, and applications from threats.",
        description: "Our cybersecurity experts provide comprehensive security solutions to protect your digital assets, data, and applications from internal and external threats. We offer security assessments, penetration testing, vulnerability scanning, and custom security implementations to ensure your business remains secure in the face of evolving cyber threats.",
        icon: "fa-shield-alt",
        isActive: true
      },
      {
        title: "Cloud Solutions",
        shortDescription: "Scalable cloud infrastructure, migration services, and cloud-native application development.",
        description: "We help businesses leverage the power of cloud computing with scalable infrastructure, migration services, and cloud-native application development. Our cloud solutions are designed to improve efficiency, reduce costs, and enhance flexibility, allowing your business to scale with ease and stay ahead of the competition.",
        icon: "fa-cloud",
        isActive: true
      }
    ];
    
    services.forEach(service => this.createService(service));
  }

  private initializeTestimonials() {
    const testimonials: InsertTestimonial[] = [
      {
        clientName: "Sarah Johnson",
        company: "FashionRetail Inc.",
        testimonial: "AdiTeke transformed our business with their custom e-commerce platform. The solution increased our online sales by 75% within the first three months. Their team was professional, responsive, and delivered exactly what we needed.",
        rating: 5,
        profilePicture: "https://randomuser.me/api/portraits/women/12.jpg",
        isActive: true
      },
      {
        clientName: "Michael Chen",
        company: "TechSupport Solutions",
        testimonial: "The AI chatbot developed by AdiTeke reduced our customer service response time by 80% and improved satisfaction scores. Their expertise in AI and machine learning is truly impressive.",
        rating: 5,
        profilePicture: "https://randomuser.me/api/portraits/men/32.jpg",
        isActive: true
      },
      {
        clientName: "Elena Rodriguez",
        company: "FinSecure Bank",
        testimonial: "Our mobile banking app developed by AdiTeke has received outstanding user feedback. The team was meticulous about security while delivering an intuitive interface. Highly recommended!",
        rating: 4.5,
        profilePicture: "https://randomuser.me/api/portraits/women/65.jpg",
        isActive: true
      }
    ];
    
    testimonials.forEach(testimonial => this.createTestimonial(testimonial));
  }

  private initializeProjects() {
    const projects: InsertProject[] = [
      {
        title: "E-commerce Platform",
        description: "Custom online store with advanced search and payment integrations",
        thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80",
        category: "web",
        clientId: 2,
        startDate: new Date("2023-01-15"),
        endDate: new Date("2023-04-30"),
        status: "completed"
      },
      {
        title: "AdiTeke Business App",
        description: "Enterprise business management solution with real-time analytics",
        thumbnail: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80",
        category: "mobile",
        clientId: 2,
        startDate: new Date("2023-02-10"),
        endDate: new Date("2023-06-15"),
        status: "completed"
      },
      {
        title: "AI Support Chatbot",
        description: "Intelligent customer service solution with natural language processing",
        thumbnail: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80",
        category: "ai",
        clientId: 2,
        startDate: new Date("2023-03-20"),
        endDate: new Date("2023-07-10"),
        status: "completed"
      },
      {
        title: "Real Estate Platform",
        description: "Property listing and management system with virtual tours",
        thumbnail: "https://images.unsplash.com/photo-1586892478382-ab0e5267354f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80",
        category: "web ecommerce",
        clientId: 2,
        startDate: new Date("2023-04-05"),
        endDate: new Date("2023-08-20"),
        status: "completed"
      },
      {
        title: "Fitness Tracking App",
        description: "AI-powered workout planner and health monitoring system",
        thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80",
        category: "mobile ai",
        clientId: 2,
        startDate: new Date("2023-05-12"),
        endDate: null,
        status: "in-progress"
      },
      {
        title: "Analytics Dashboard",
        description: "Business intelligence platform with predictive analytics",
        thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80",
        category: "web ai",
        clientId: 2,
        startDate: new Date("2023-06-01"),
        endDate: null,
        status: "in-progress"
      }
    ];
    
    projects.forEach(project => this.createProject(project));
  }
}

// PostgreSQL implementation
export class PostgresStorage implements IStorage {
  private db: ReturnType<typeof drizzle>;
  private client: ReturnType<typeof postgres>;

  constructor() {
    // Create PostgreSQL client
    this.client = postgres(process.env.DATABASE_URL!);

    // Create drizzle instance
    this.db = drizzle(this.client);
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    // Try to find user by username first
    const resultByUsername = await this.db.select().from(users).where(eq(users.username, username));
    if (resultByUsername.length > 0) {
      return resultByUsername[0];
    }
    
    // If not found by username, try by email
    const resultByEmail = await this.db.select().from(users).where(eq(users.email, username));
    return resultByEmail[0];
  }
  
  async getAllUsers(): Promise<User[]> {
    return await this.db.select().from(users);
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(user).returning();
    return result[0];
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User> {
    const result = await this.db.update(users)
      .set({
        ...userData,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
    
    if (result.length === 0) {
      throw new Error(`User with id ${id} not found`);
    }
    
    return result[0];
  }

  // Project methods
  async getAllProjects(category?: string): Promise<Project[]> {
    if (category && category !== 'all') {
      // Simple match for category - in production might want to use tags or better filtering
      return await this.db.select().from(projects).where(like(projects.category, `%${category}%`));
    }
    return await this.db.select().from(projects);
  }

  async getProject(id: number): Promise<Project | undefined> {
    const result = await this.db.select().from(projects).where(eq(projects.id, id));
    return result[0];
  }

  async createProject(project: InsertProject): Promise<Project> {
    const result = await this.db.insert(projects).values(project).returning();
    return result[0];
  }

  // Testimonial methods
  async getAllTestimonials(): Promise<Testimonial[]> {
    return await this.db.select().from(testimonials).where(eq(testimonials.isActive, true));
  }

  async createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial> {
    const result = await this.db.insert(testimonials).values(testimonial).returning();
    return result[0];
  }

  // Service methods
  async getAllServices(): Promise<Service[]> {
    return await this.db.select().from(services).where(eq(services.isActive, true));
  }

  async getService(id: number): Promise<Service | undefined> {
    const result = await this.db.select().from(services).where(eq(services.id, id));
    return result[0];
  }

  async createService(service: InsertService): Promise<Service> {
    const result = await this.db.insert(services).values(service).returning();
    return result[0];
  }

  // Blog methods
  async getAllBlogPosts(category?: string): Promise<BlogPost[]> {
    if (category) {
      return await this.db.select()
        .from(blogPosts)
        .where(
          sql`${blogPosts.isPublished} = true AND ${blogPosts.category} = ${category}`
        );
    }
    return await this.db.select().from(blogPosts).where(eq(blogPosts.isPublished, true));
  }

  async getBlogPost(id: number): Promise<BlogPost | undefined> {
    const result = await this.db.select().from(blogPosts).where(eq(blogPosts.id, id));
    return result[0];
  }

  async createBlogPost(blogPost: InsertBlogPost): Promise<BlogPost> {
    const result = await this.db.insert(blogPosts).values({
      ...blogPost,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    return result[0];
  }

  // Contact methods
  async saveContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const result = await this.db.insert(contactMessages).values({
      ...message,
      createdAt: new Date(),
      isResolved: false
    }).returning();
    return result[0];
  }

  // Newsletter methods
  async addNewsletterSubscriber(subscriber: InsertNewsletterSubscriber): Promise<NewsletterSubscriber> {
    // Check if subscriber already exists
    const existingSubscriber = await this.db.select()
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.email, subscriber.email));
    
    if (existingSubscriber.length > 0) {
      // If subscriber exists but is inactive, reactivate them
      if (!existingSubscriber[0].isActive) {
        const updated = await this.db.update(newsletterSubscribers)
          .set({ isActive: true })
          .where(eq(newsletterSubscribers.id, existingSubscriber[0].id))
          .returning();
        return updated[0];
      }
      return existingSubscriber[0];
    }
    
    // Create new subscriber
    const result = await this.db.insert(newsletterSubscribers).values({
      ...subscriber,
      subscriptionDate: new Date(),
      isActive: true
    }).returning();
    return result[0];
  }

  // Job methods
  async getAllJobs(): Promise<Job[]> {
    return await this.db.select().from(jobs).where(eq(jobs.isActive, true));
  }

  async getJob(id: number): Promise<Job | undefined> {
    const result = await this.db.select().from(jobs).where(eq(jobs.id, id));
    return result[0];
  }

  async createJob(job: InsertJob): Promise<Job> {
    const result = await this.db.insert(jobs).values({
      ...job,
      postedDate: new Date()
    }).returning();
    return result[0];
  }
  
  // The following methods are implemented with stubs for now
  
  async getRole(id: number): Promise<Role | undefined> {
    const result = await this.db.select().from(roles).where(eq(roles.id, id));
    return result[0];
  }
  
  async getRoleByName(name: string): Promise<Role | undefined> {
    const result = await this.db.select().from(roles).where(eq(roles.name, name));
    return result[0];
  }
  
  async getAllRoles(): Promise<Role[]> {
    return await this.db.select().from(roles);
  }
  
  async createRole(role: InsertRole): Promise<Role> {
    throw new Error("Method not implemented.");
  }
  
  async updateRole(id: number, roleData: Partial<InsertRole>): Promise<Role> {
    throw new Error("Method not implemented.");
  }
  
  async deleteRole(id: number): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
  
  async getPermission(id: number): Promise<Permission | undefined> {
    throw new Error("Method not implemented.");
  }
  
  async getPermissionByName(name: string): Promise<Permission | undefined> {
    throw new Error("Method not implemented.");
  }
  
  async getAllPermissions(): Promise<Permission[]> {
    throw new Error("Method not implemented.");
  }
  
  async getPermissionsByResource(resource: string): Promise<Permission[]> {
    throw new Error("Method not implemented.");
  }
  
  async createPermission(permission: InsertPermission): Promise<Permission> {
    throw new Error("Method not implemented.");
  }
  
  async updatePermission(id: number, permissionData: Partial<InsertPermission>): Promise<Permission> {
    throw new Error("Method not implemented.");
  }
  
  async deletePermission(id: number): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
  
  async assignPermissionToRole(roleId: number, permissionId: number): Promise<any> {
    throw new Error("Method not implemented.");
  }
  
  async removePermissionFromRole(roleId: number, permissionId: number): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
  
  async getPermissionsForRole(roleId: number): Promise<Permission[]> {
    // Get the role permissions
    const rolePermissionsResult = await this.db.select()
      .from(rolePermissions)
      .where(eq(rolePermissions.roleId, roleId));
    
    if (rolePermissionsResult.length === 0) {
      return []; // No permissions for this role
    }
    
    // Get the permission IDs
    const permissionIds = rolePermissionsResult.map(rp => rp.permissionId);
    
    // Get the permissions
    const permissionsResult = await this.db.select()
      .from(permissions)
      .where(inArray(permissions.id, permissionIds));
    
    return permissionsResult;
  }
  
  async getRolesForPermission(permissionId: number): Promise<Role[]> {
    // Get the role-permission connections
    const rolePermissionsResult = await this.db.select()
      .from(rolePermissions)
      .where(eq(rolePermissions.permissionId, permissionId));
    
    if (rolePermissionsResult.length === 0) {
      return []; // No roles for this permission
    }
    
    // Get the role IDs
    const roleIds = rolePermissionsResult.map(rp => rp.roleId);
    
    // Get the roles
    const rolesResult = await this.db.select()
      .from(roles)
      .where(inArray(roles.id, roleIds));
    
    return rolesResult;
  }
  
  async getUserWithPermissions(userId: number): Promise<{ user: User; role: Role; permissions: Permission[] }> {
    // Get the user
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with id ${userId} not found`);
    }
    
    // Get the user's role
    const role = await this.getRole(user.roleId);
    if (!role) {
      throw new Error(`Role with id ${user.roleId} not found`);
    }
    
    // Get the role's permissions
    const permissions = await this.getPermissionsForRole(role.id);
    
    return { user, role, permissions };
  }
  
  async hasPermission(userId: number, resource: string, action: string): Promise<boolean> {
    try {
      // Get the user with permissions
      const { user, role, permissions } = await this.getUserWithPermissions(userId);
      
      // Admin role has all permissions
      if (role.name === 'admin') {
        return true;
      }
      
      // Check if the user has the specific permission
      return permissions.some(
        permission => permission.resource === resource && permission.action === action
      );
    } catch (error) {
      console.error(`Error checking permission for user ${userId}:`, error);
      return false;
    }
  }

  // Initialize the database with sample data
  async initializeDatabase() {
    // Check if we have any services - if not, add sample data
    const existingServices = await this.db.select().from(services);
    
    if (existingServices.length === 0) {
      // Initialize sample data
      await this.initializeServices();
      await this.initializeTestimonials();
      await this.initializeProjects();
      await this.initializeUsers();
      console.log("Database initialized with sample data");
    } else {
      console.log("Database already contains data, skipping initialization");
    }
  }

  // Sample data initialization methods
  private async initializeUsers() {
    // First, get the roles by name
    const adminRole = await this.db.select().from(roles).where(eq(roles.name, "admin")).limit(1);
    const clientRole = await this.db.select().from(roles).where(eq(roles.name, "client")).limit(1);
    
    if (adminRole.length === 0 || clientRole.length === 0) {
      console.error("Roles not found. Make sure to initialize roles first.");
      return;
    }
    
    const adminUser: InsertUser = {
      username: "admin",
      password: "password123", // in production this should be hashed
      email: "admin@aditeke.com",
      name: "Admin User",
      roleId: adminRole[0].id,
      profilePicture: "https://randomuser.me/api/portraits/men/1.jpg"
    };
    
    const clientUser: InsertUser = {
      username: "client",
      password: "password123", // in production this should be hashed
      email: "client@example.com",
      name: "Client User",
      roleId: clientRole[0].id,
      profilePicture: "https://randomuser.me/api/portraits/women/1.jpg"
    };
    
    // Check if users already exist
    const existingAdmin = await this.db.select().from(users).where(eq(users.username, "admin")).limit(1);
    const existingClient = await this.db.select().from(users).where(eq(users.username, "client")).limit(1);
    
    if (existingAdmin.length === 0) {
      await this.createUser(adminUser);
    }
    
    if (existingClient.length === 0) {
      await this.createUser(clientUser);
    }
  }

  private async initializeServices() {
    const services: InsertService[] = [
      {
        title: "Web Development",
        shortDescription: "Custom websites and web applications that are responsive, fast, and built with modern technologies.",
        description: "Our web development team creates custom websites and web applications tailored to your specific needs. We use the latest technologies and frameworks to ensure your website is responsive, fast, and secure. Whether you need a simple corporate website or a complex web application, we have the expertise to deliver exceptional results.",
        icon: "fa-laptop-code",
        isActive: true
      },
      {
        title: "Mobile App Development",
        shortDescription: "Native and cross-platform mobile applications for iOS and Android devices with seamless user experiences.",
        description: "We build native and cross-platform mobile applications for iOS and Android devices that provide seamless user experiences. Our mobile app development team uses the latest technologies to create high-performance, feature-rich applications that meet your business objectives and delight your users.",
        icon: "fa-mobile-alt",
        isActive: true
      },
      {
        title: "AI Solutions",
        shortDescription: "Intelligent AI-powered applications, chatbots, and automation tools to streamline your business processes.",
        description: "Our AI solutions leverage the latest advancements in artificial intelligence to help businesses automate processes, gain insights, and enhance customer experiences. We develop intelligent chatbots, recommendation engines, predictive analytics systems, and other AI-powered applications tailored to your specific business needs.",
        icon: "fa-brain",
        isActive: true
      },
      {
        title: "Business Intelligence",
        shortDescription: "Data analytics and reporting tools that provide actionable insights to drive informed business decisions.",
        description: "Our business intelligence solutions help you transform raw data into actionable insights that drive informed business decisions. We develop custom data analytics, visualization, and reporting tools that make it easy to understand your data and identify trends, patterns, and opportunities for growth.",
        icon: "fa-chart-line",
        isActive: true
      },
      {
        title: "Cybersecurity",
        shortDescription: "Robust security solutions to protect your digital assets, data, and applications from threats.",
        description: "Our cybersecurity experts provide comprehensive security solutions to protect your digital assets, data, and applications from internal and external threats. We offer security assessments, penetration testing, vulnerability scanning, and custom security implementations to ensure your business remains secure in the face of evolving cyber threats.",
        icon: "fa-shield-alt",
        isActive: true
      },
      {
        title: "Cloud Solutions",
        shortDescription: "Scalable cloud infrastructure, migration services, and cloud-native application development.",
        description: "We help businesses leverage the power of cloud computing with scalable infrastructure, migration services, and cloud-native application development. Our cloud solutions are designed to improve efficiency, reduce costs, and enhance flexibility, allowing your business to scale with ease and stay ahead of the competition.",
        icon: "fa-cloud",
        isActive: true
      }
    ];
    
    for (const service of services) {
      await this.createService(service);
    }
  }

  private async initializeTestimonials() {
    const testimonials: InsertTestimonial[] = [
      {
        clientName: "Sarah Johnson",
        company: "FashionRetail Inc.",
        testimonial: "AdiTeke transformed our business with their custom e-commerce platform. The solution increased our online sales by 75% within the first three months. Their team was professional, responsive, and delivered exactly what we needed.",
        rating: 5,
        profilePicture: "https://randomuser.me/api/portraits/women/12.jpg",
        isActive: true
      },
      {
        clientName: "Michael Chen",
        company: "TechSupport Solutions",
        testimonial: "The AI chatbot developed by AdiTeke reduced our customer service response time by 80% and improved satisfaction scores. Their expertise in AI and machine learning is truly impressive.",
        rating: 5,
        profilePicture: "https://randomuser.me/api/portraits/men/32.jpg",
        isActive: true
      },
      {
        clientName: "Elena Rodriguez",
        company: "FinSecure Bank",
        testimonial: "Our mobile banking app developed by AdiTeke has received outstanding user feedback. The team was meticulous about security while delivering an intuitive interface. Highly recommended!",
        rating: 4.5,
        profilePicture: "https://randomuser.me/api/portraits/women/65.jpg",
        isActive: true
      }
    ];
    
    for (const testimonial of testimonials) {
      await this.createTestimonial(testimonial);
    }
  }

  private async initializeProjects() {
    const projects: InsertProject[] = [
      {
        title: "E-commerce Platform",
        description: "Custom online store with advanced search and payment integrations",
        thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80",
        category: "web",
        clientId: 2,
        startDate: new Date("2023-01-15"),
        endDate: new Date("2023-04-30"),
        status: "completed"
      },
      {
        title: "AdiTeke Business App",
        description: "Enterprise business management solution with real-time analytics",
        thumbnail: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80",
        category: "mobile",
        clientId: 2,
        startDate: new Date("2023-02-10"),
        endDate: new Date("2023-06-15"),
        status: "completed"
      },
      {
        title: "AI Support Chatbot",
        description: "Intelligent customer service solution with natural language processing",
        thumbnail: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80",
        category: "ai",
        clientId: 2,
        startDate: new Date("2023-03-20"),
        endDate: new Date("2023-07-10"),
        status: "completed"
      },
      {
        title: "Real Estate Platform",
        description: "Property listing and management system with virtual tours",
        thumbnail: "https://images.unsplash.com/photo-1586892478382-ab0e5267354f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80",
        category: "web ecommerce",
        clientId: 2,
        startDate: new Date("2023-04-05"),
        endDate: new Date("2023-08-20"),
        status: "completed"
      },
      {
        title: "Fitness Tracking App",
        description: "AI-powered workout planner and health monitoring system",
        thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80",
        category: "mobile ai",
        clientId: 2,
        startDate: new Date("2023-05-12"),
        endDate: null,
        status: "in-progress"
      }
    ];
    
    for (const project of projects) {
      await this.createProject(project);
    }
  }
}

// Initialize storage - Try PostgreSQL first, then Firebase, then MemStorage
// Import the FirebaseStorage implementation
import { FirebaseStorage } from './firebase-service';

// Create the storage instance with proper fallback
let storageInstance: IStorage;
try {
  // First try PostgreSQL
  if (process.env.DATABASE_URL) {
    storageInstance = new PostgresStorage();
    console.log("Using PostgreSQL as the storage backend");
  } else {
    // Then try Firebase
    try {
      storageInstance = new FirebaseStorage();
      console.log("Using Firebase Firestore as the storage backend");
    } catch (firebaseError) {
      console.warn("Failed to initialize Firebase storage, falling back to in-memory storage:", firebaseError);
      storageInstance = new MemStorage();
    }
  }
} catch (error) {
  console.warn("Failed to initialize PostgreSQL storage, falling back to in-memory storage:", error);
  storageInstance = new MemStorage();
}

export const storage: IStorage = storageInstance;

// Function to switch storage implementations
export function setStorageImplementation(newStorage: IStorage): void {
  storageInstance = newStorage;
  // Since JS exports are references, we need to update all methods on the storage object
  Object.keys(newStorage).forEach(key => {
    if (typeof newStorage[key as keyof IStorage] === 'function') {
      (storage as any)[key] = (...args: any[]) => {
        return (newStorage as any)[key](...args);
      };
    }
  });
  console.log('Storage implementation changed successfully');
}
