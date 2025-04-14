import { Timestamp } from "firebase/firestore";

// User types
export interface FirebaseUser {
  uid: string;
  email: string | null;
  username: string;
  name: string;
  roleId: number;
  profilePicture: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLogin: Timestamp | null;
  isActive: boolean;
  phoneNumber?: string;
  twoFactorEnabled?: boolean;
  settings: {
    theme: string;
    notifications: boolean;
    language: string;
  };
}

// Role types
export interface Permission {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
}

export interface ResourcePermissions {
  users: Permission;
  projects: Permission;
  services: Permission;
  blogPosts: Permission;
  testimonials: Permission;
  jobs: Permission;
  contactMessages: Permission;
  [key: string]: Permission;
}

export interface FirebaseRole {
  name: string;
  description: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  permissions: ResourcePermissions;
}

// Project types
export interface Attachment {
  name: string;
  url: string;
  type: string;
  size?: number;
  uploadedAt: Timestamp;
  uploadedBy: string;
}

export interface FirebaseProject {
  title: string;
  description: string;
  category: string;
  clientId: string;
  managerId: string;
  status: string;
  startDate: Timestamp;
  endDate?: Timestamp;
  budget: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  attachments?: Attachment[];
}

// Task types
export interface Comment {
  userId: string;
  text: string;
  createdAt: Timestamp;
}

export interface FirebaseTask {
  projectId: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignedTo: string;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  dueDate?: Timestamp;
  completedAt?: Timestamp;
  attachments?: Attachment[];
  comments?: Comment[];
}

// Service types
export interface FirebaseService {
  title: string;
  shortDescription: string;
  fullDescription: string;
  category: string;
  price: number;
  imageUrl: string;
  features: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isActive: boolean;
}

// BlogPost types
export interface BlogComment {
  userId?: string;
  name: string;
  email: string;
  text: string;
  createdAt: Timestamp;
  isApproved: boolean;
}

export interface FirebaseBlogPost {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  authorId: string;
  category: string;
  tags: string[];
  imageUrl: string;
  status: string;
  publishedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  views: number;
  comments?: BlogComment[];
}

// Testimonial types
export interface FirebaseTestimonial {
  clientName: string;
  company: string;
  position: string;
  content: string;
  rating: number;
  imageUrl?: string;
  projectId?: string;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Contact Message types
export interface FirebaseContactMessage {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: string;
  createdAt: Timestamp;
  readAt?: Timestamp;
  repliedAt?: Timestamp;
  assignedTo?: string;
}

// Newsletter Subscriber types
export interface FirebaseNewsletterSubscriber {
  email: string;
  name?: string;
  subscriptionDate: Timestamp;
  isActive: boolean;
  lastEmailSent?: Timestamp;
  interests?: string[];
}

// Job types
export interface SalaryInfo {
  min: number;
  max: number;
  currency: string;
  period: string;
}

export interface JobApplication {
  applicantId: string;
  resumeUrl: string;
  coverLetterUrl?: string;
  appliedAt: Timestamp;
  status: string;
}

export interface FirebaseJob {
  title: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  location: string;
  type: string;
  salary: SalaryInfo;
  department: string;
  postedDate: Timestamp;
  closingDate: Timestamp;
  isActive: boolean;
  applications?: JobApplication[];
}