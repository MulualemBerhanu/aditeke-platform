import {
  users, type User, type InsertUser,
  projects, type Project, type InsertProject,
  testimonials, type Testimonial, type InsertTestimonial,
  services, type Service, type InsertService,
  blogPosts, type BlogPost, type InsertBlogPost,
  contactMessages, type ContactMessage, type InsertContactMessage,
  newsletterSubscribers, type NewsletterSubscriber, type InsertNewsletterSubscriber,
  jobs, type Job, type InsertJob
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Project methods
  getAllProjects(category?: string): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  
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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private projects: Map<number, Project>;
  private testimonials: Map<number, Testimonial>;
  private services: Map<number, Service>;
  private blogPosts: Map<number, BlogPost>;
  private contactMessages: Map<number, ContactMessage>;
  private newsletterSubscribers: Map<number, NewsletterSubscriber>;
  private jobs: Map<number, Job>;
  
  private userIdCounter: number;
  private projectIdCounter: number;
  private testimonialIdCounter: number;
  private serviceIdCounter: number;
  private blogPostIdCounter: number;
  private contactMessageIdCounter: number;
  private newsletterSubscriberIdCounter: number;
  private jobIdCounter: number;

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.testimonials = new Map();
    this.services = new Map();
    this.blogPosts = new Map();
    this.contactMessages = new Map();
    this.newsletterSubscribers = new Map();
    this.jobs = new Map();
    
    this.userIdCounter = 1;
    this.projectIdCounter = 1;
    this.testimonialIdCounter = 1;
    this.serviceIdCounter = 1;
    this.blogPostIdCounter = 1;
    this.contactMessageIdCounter = 1;
    this.newsletterSubscriberIdCounter = 1;
    this.jobIdCounter = 1;

    // Add initial demo data
    this.initializeServices();
    this.initializeTestimonials();
    this.initializeProjects();
    this.initializeUsers();
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

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Project methods
  async getAllProjects(category?: string): Promise<Project[]> {
    const projects = Array.from(this.projects.values());
    
    if (category && category !== 'all') {
      return projects.filter(project => project.category === category);
    }
    
    return projects;
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

  // Initialize sample data methods
  private initializeUsers() {
    const adminUser: InsertUser = {
      username: "admin",
      password: "password123", // in production this should be hashed
      email: "admin@aditeke.com",
      name: "Admin User",
      role: "admin",
      profilePicture: "https://randomuser.me/api/portraits/men/1.jpg"
    };
    
    const clientUser: InsertUser = {
      username: "client",
      password: "password123", // in production this should be hashed
      email: "client@example.com",
      name: "Client User",
      role: "client",
      profilePicture: "https://randomuser.me/api/portraits/women/1.jpg"
    };
    
    this.createUser(adminUser);
    this.createUser(clientUser);
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
        title: "Mobile Banking App",
        description: "Secure financial management application with real-time analytics",
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

export const storage = new MemStorage();
