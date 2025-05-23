import { pgTable, text, serial, integer, boolean, timestamp, json, date, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Role schema
export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const insertRoleSchema = createInsertSchema(roles).pick({
  name: true,
  description: true,
});

// Permission schema
export const permissions = pgTable("permissions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  resource: text("resource").notNull(),
  action: text("action").notNull(), // create, read, update, delete, manage
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const insertPermissionSchema = createInsertSchema(permissions).pick({
  name: true,
  description: true,
  resource: true,
  action: true,
});

// Role-Permission relationship
export const rolePermissions = pgTable("role_permissions", {
  id: serial("id").primaryKey(),
  roleId: integer("role_id").notNull().references(() => roles.id, { onDelete: "cascade" }),
  permissionId: integer("permission_id").notNull().references(() => permissions.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertRolePermissionSchema = createInsertSchema(rolePermissions).pick({
  roleId: true,
  permissionId: true,
});

// User schema with role relationship
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  roleId: integer("role_id").notNull().references(() => roles.id),
  profilePicture: text("profile_picture"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
  lastLogin: timestamp("last_login"),
  isActive: boolean("is_active").notNull().default(true),
  // Password reset and security fields
  passwordResetRequired: boolean("password_reset_required").default(false),
  // Added client-specific fields
  company: text("company"),
  phone: text("phone"),
  website: text("website"),
  notes: text("notes"),
  industry: text("industry"),
  referralSource: text("referral_source"),
  isVip: boolean("is_vip").default(false),
  isPriority: boolean("is_priority").default(false),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  name: true,
  roleId: true,
  profilePicture: true,
  isActive: true,
  passwordResetRequired: true,
  company: true,
  phone: true,
  website: true,
  notes: true,
  industry: true,
  referralSource: true,
  isVip: true,
  isPriority: true,
});

// Project schema
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  thumbnail: text("thumbnail").notNull(),
  category: text("category").notNull(),
  clientId: integer("client_id").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  status: text("status").notNull().default("in-progress"),
  // Add additional project fields needed for client profile view
  progress: integer("progress").default(0),
  budget: integer("budget"),
  teamSize: integer("team_size"),
  website_url: text("website_url"),
  sort_order: integer("sort_order"),
});

// Create a custom project schema that accepts string dates
export const insertProjectSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
  description: z.string().min(10, "Description must be at least 10 characters long"),
  thumbnail: z.string().optional(),
  category: z.string(),
  clientId: z.number(),
  startDate: z.string().or(z.date()), // Accept both string and date
  endDate: z.string().optional().or(z.date().optional()), // Optional string or date
  status: z.string(),
  progress: z.number().optional(),
  budget: z.number().optional(),
  teamSize: z.number().optional(),
  website_url: z.string().optional(),
  sort_order: z.number().optional(),
});

// Testimonial schema
export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  clientName: text("client_name").notNull(),
  company: text("company").notNull(),
  testimonial: text("testimonial").notNull(),
  rating: integer("rating").notNull(),
  profilePicture: text("profile_picture"),
  isActive: boolean("is_active").notNull().default(true),
});

export const insertTestimonialSchema = createInsertSchema(testimonials).pick({
  clientName: true,
  company: true,
  testimonial: true,
  rating: true,
  profilePicture: true,
  isActive: true,
});

// Service schema
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  shortDescription: text("short_description").notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

export const insertServiceSchema = createInsertSchema(services).pick({
  title: true,
  description: true,
  icon: true,
  shortDescription: true,
  isActive: true,
});

// Blog schema
export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  authorId: integer("author_id").notNull(),
  thumbnail: text("thumbnail").notNull(),
  category: text("category").notNull(),
  tags: text("tags"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
  isPublished: boolean("is_published").notNull().default(false),
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).pick({
  title: true,
  content: true,
  authorId: true,
  thumbnail: true,
  category: true,
  tags: true,
  isPublished: true,
});

// Contact message schema
export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  isResolved: boolean("is_resolved").notNull().default(false),
  agreement: boolean("agreement").default(true),
});

export const insertContactMessageSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Valid email is required"),
    phone: z.string().optional(),
    subject: z.string().default("general"),
    message: z.string().min(1, "Message is required"),
    agreement: z.boolean().default(true),
});

// Newsletter subscriber schema
export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  subscriptionDate: timestamp("subscription_date").notNull().defaultNow(),
  isActive: boolean("is_active").notNull().default(true),
});

export const insertNewsletterSubscriberSchema = createInsertSchema(newsletterSubscribers).pick({
  email: true,
  name: true,
});

// Jobs schema
export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  requirements: text("requirements").notNull(),
  location: text("location").notNull(),
  department: text("department").notNull(),
  employmentType: text("employment_type").notNull(),
  postedDate: timestamp("posted_date").notNull().defaultNow(),
  isActive: boolean("is_active").notNull().default(true),
});

export const insertJobSchema = createInsertSchema(jobs).pick({
  title: true,
  description: true,
  requirements: true,
  location: true,
  department: true,
  employmentType: true,
  isActive: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Role = typeof roles.$inferSelect;
export type InsertRole = z.infer<typeof insertRoleSchema>;

export type Permission = typeof permissions.$inferSelect;
export type InsertPermission = z.infer<typeof insertPermissionSchema>;

export type RolePermission = typeof rolePermissions.$inferSelect;
export type InsertRolePermission = z.infer<typeof insertRolePermissionSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type Testimonial = typeof testimonials.$inferSelect;
export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;

export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;

export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;

export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
export type InsertNewsletterSubscriber = z.infer<typeof insertNewsletterSubscriberSchema>;

export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;

// Client Communications schema
export const clientCommunications = pgTable("client_communications", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  managerId: integer("manager_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  isRead: boolean("is_read").notNull().default(false),
  subject: text("subject"),
  type: text("type").notNull().default("email"), // email, call, meeting, etc.
  attachments: json("attachments"), // JSON array of attachment URLs
  fromManager: boolean("from_manager").notNull().default(false), // Flag to indicate if sent by manager
});

export const insertClientCommunicationSchema = createInsertSchema(clientCommunications).pick({
  clientId: true,
  managerId: true,
  message: true,
  subject: true,
  type: true,
  attachments: true,
  isRead: true,
  fromManager: true,
});

// Client Documents schema
export const clientDocuments = pgTable("client_documents", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  uploadedById: integer("uploaded_by_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  filename: text("filename").notNull(),
  fileUrl: text("file_url").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
  category: text("category"), // contract, proposal, invoice, etc.
  description: text("description"),
  projectId: integer("project_id").references(() => projects.id),
});

export const insertClientDocumentSchema = createInsertSchema(clientDocuments).pick({
  clientId: true,
  uploadedById: true,
  filename: true,
  fileUrl: true,
  fileType: true,
  fileSize: true,
  category: true,
  description: true,
  projectId: true,
});

// Client Support Tickets schema
export const clientSupportTickets = pgTable("client_support_tickets", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  assignedToId: integer("assigned_to_id").references(() => users.id),
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("open"), // open, in-progress, closed, on-hold
  priority: text("priority").notNull().default("medium"), // low, medium, high, urgent
  category: text("category").notNull(), // billing, technical, feature-request, etc.
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
  closedAt: timestamp("closed_at"),
  attachments: json("attachments"), // JSON array of attachment URLs
  resolution: text("resolution"),
});

export const insertClientSupportTicketSchema = createInsertSchema(clientSupportTickets).pick({
  clientId: true,
  assignedToId: true,
  subject: true,
  description: true,
  status: true,
  priority: true,
  category: true,
  attachments: true,
});

// Client Invoices schema
export const clientInvoices = pgTable("client_invoices", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  projectId: integer("project_id").references(() => projects.id),
  invoiceNumber: text("invoice_number").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("USD"),
  status: text("status").notNull().default("pending"), // pending, paid, overdue, cancelled
  issueDate: date("issue_date").notNull(),
  dueDate: date("due_date").notNull(),
  paidDate: date("paid_date"),
  paidAmount: decimal("paid_amount", { precision: 10, scale: 2 }), // Amount actually paid
  description: text("description"),
  items: json("items").notNull(), // JSON array of line items
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  paymentMethod: text("payment_method"),
  receiptNumber: text("receipt_number"), // Manual receipt number
});

export const insertClientInvoiceSchema = createInsertSchema(clientInvoices).pick({
  clientId: true,
  projectId: true,
  invoiceNumber: true,
  amount: true,
  currency: true,
  status: true,
  issueDate: true,
  dueDate: true,
  paidDate: true,
  paidAmount: true,
  description: true,
  items: true,
  notes: true,
  stripePaymentIntentId: true,
  paymentMethod: true,
  receiptNumber: true,
});

// Contracts schema for client agreements
export const clientContracts = pgTable("client_contracts", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").notNull(), // The full contract text/HTML content
  status: text("status").notNull().default("pending"), // pending, signed, rejected, expired
  documentId: integer("document_id").references(() => clientDocuments.id), // Optional PDF version
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
  expiresAt: timestamp("expires_at"),
  signedAt: timestamp("signed_at"),
  signatureData: text("signature_data"), // Base64 encoded signature image
  ipAddress: text("ip_address"), // IP address at time of signing
  version: text("version").notNull().default("1.0"), // Contract version
  metadata: json("metadata").default({}), // Additional contract metadata
  projectId: integer("project_id").references(() => projects.id), // Optional project association
});

export const insertClientContractSchema = createInsertSchema(clientContracts).pick({
  clientId: true,
  title: true,
  content: true,
  status: true,
  documentId: true,
  expiresAt: true,
  version: true,
  metadata: true,
  projectId: true,
});

// Type exports for new schemas
export type ClientCommunication = typeof clientCommunications.$inferSelect;
export type InsertClientCommunication = z.infer<typeof insertClientCommunicationSchema>;

export type ClientDocument = typeof clientDocuments.$inferSelect;
export type InsertClientDocument = z.infer<typeof insertClientDocumentSchema>;

export type ClientContract = typeof clientContracts.$inferSelect;
export type InsertClientContract = z.infer<typeof insertClientContractSchema>;

export type ClientInvoice = typeof clientInvoices.$inferSelect;
export type InsertClientInvoice = z.infer<typeof insertClientInvoiceSchema>;

export type ClientSupportTicket = typeof clientSupportTickets.$inferSelect;
export type InsertClientSupportTicket = z.infer<typeof insertClientSupportTicketSchema>;

// Password Reset Tokens schema
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").notNull().default(false),
});

export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens).pick({
  userId: true,
  token: true,
  expiresAt: true,
  used: true,
});

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = z.infer<typeof insertPasswordResetTokenSchema>;

// User Notification Settings schema
export const userNotificationSettings = pgTable("user_notification_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  emailNotifications: boolean("email_notifications").notNull().default(true),
  projectUpdates: boolean("project_updates").notNull().default(true),
  documentUploads: boolean("document_uploads").notNull().default(true),
  invoiceReminders: boolean("invoice_reminders").notNull().default(true),
  marketingEmails: boolean("marketing_emails").notNull().default(false),
  smsNotifications: boolean("sms_notifications").notNull().default(false),
  browserNotifications: boolean("browser_notifications").notNull().default(true),
  updatedAt: timestamp("updated_at"),
});

export const insertUserNotificationSettingsSchema = createInsertSchema(userNotificationSettings).omit({
  id: true,
  updatedAt: true,
});

export type UserNotificationSettings = typeof userNotificationSettings.$inferSelect;
export type InsertUserNotificationSettings = z.infer<typeof insertUserNotificationSettingsSchema>;

// User Security Settings schema
export const userSecuritySettings = pgTable("user_security_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  twoFactorEnabled: boolean("two_factor_enabled").notNull().default(false),
  loginAlerts: boolean("login_alerts").notNull().default(true),
  allowMultipleSessions: boolean("allow_multiple_sessions").notNull().default(true),
  sessionTimeout: integer("session_timeout").notNull().default(60), // In minutes
  updatedAt: timestamp("updated_at"),
});

export const insertUserSecuritySettingsSchema = createInsertSchema(userSecuritySettings).omit({
  id: true,
  updatedAt: true,
});

export type UserSecuritySettings = typeof userSecuritySettings.$inferSelect;
export type InsertUserSecuritySettings = z.infer<typeof insertUserSecuritySettingsSchema>;
