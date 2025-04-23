import { db } from './db';
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { users, roles, permissions, rolePermissions, projects, services, testimonials } from '@shared/schema';
import { eq } from 'drizzle-orm';

const scryptAsync = promisify(scrypt);

// Password hashing function
async function hashPassword(password: string) {
  if (!password) {
    throw new Error("Password cannot be empty");
  }
  
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// Main initialization function
async function initializeDatabase() {
  console.log('Starting database initialization...');
  
  try {
    // Initialize Roles
    console.log('Initializing roles...');
    await initializeRoles();
    
    // Initialize Permissions
    console.log('Initializing permissions...');
    await initializePermissions();
    
    // Set up role-permission mappings
    console.log('Setting up role permissions...');
    await initializeRolePermissions();
    
    // Initialize Users with proper roles
    console.log('Initializing users...');
    await initializeUsers();
    
    // Initialize Services
    console.log('Initializing services...');
    await initializeServices();
    
    // Initialize Testimonials
    console.log('Initializing testimonials...');
    await initializeTestimonials();
    
    // Initialize Projects
    console.log('Initializing projects...');
    await initializeProjects();
    
    console.log('Database initialization completed successfully!');
    return true;
  } catch (error) {
    console.error('Database initialization failed:', error);
    return false;
  }
}

// Initialize roles
async function initializeRoles() {
  // Clear existing roles first to avoid duplicates
  await db.delete(roles);
  
  // Create standard roles
  const rolesToCreate = [
    { id: 1000, name: 'manager', description: 'Manager role for overseeing client projects' },
    { id: 1001, name: 'client', description: 'Client role for accessing own projects and information' },
    { id: 1002, name: 'admin', description: 'Administrator role with full system access' }
  ];
  
  for (const role of rolesToCreate) {
    await db.insert(roles).values({
      id: role.id,
      name: role.name,
      description: role.description,
      createdAt: new Date(),
      updatedAt: null
    });
  }
  
  console.log(`Created ${rolesToCreate.length} roles`);
}

// Initialize permissions
async function initializePermissions() {
  // Clear existing permissions first
  await db.delete(permissions);
  
  // Create standard permissions
  const permissionsToCreate = [
    // User management permissions
    { id: 100, name: 'user_view_all', resource: 'user', action: 'view_all', description: 'View all users' },
    { id: 101, name: 'user_create', resource: 'user', action: 'create', description: 'Create users' },
    { id: 102, name: 'user_update', resource: 'user', action: 'update', description: 'Update users' },
    { id: 103, name: 'user_delete', resource: 'user', action: 'delete', description: 'Delete users' },
    
    // Project management permissions
    { id: 200, name: 'project_view_all', resource: 'project', action: 'view_all', description: 'View all projects' },
    { id: 201, name: 'project_view_own', resource: 'project', action: 'view_own', description: 'View own projects' },
    { id: 202, name: 'project_create', resource: 'project', action: 'create', description: 'Create projects' },
    { id: 203, name: 'project_update', resource: 'project', action: 'update', description: 'Update projects' },
    { id: 204, name: 'project_delete', resource: 'project', action: 'delete', description: 'Delete projects' },
    
    // Role and permission management
    { id: 300, name: 'role_manage', resource: 'role', action: 'manage', description: 'Manage roles and permissions' },
    
    // Service management
    { id: 400, name: 'service_manage', resource: 'service', action: 'manage', description: 'Manage company services' },
    
    // Blog management
    { id: 500, name: 'blog_manage', resource: 'blog', action: 'manage', description: 'Manage blog posts' },
    
    // Report access
    { id: 600, name: 'reports_view', resource: 'reports', action: 'view', description: 'View reports' },
    
    // Dashboard access
    { id: 700, name: 'dashboard_admin', resource: 'dashboard', action: 'admin', description: 'Access admin dashboard' },
    { id: 701, name: 'dashboard_manager', resource: 'dashboard', action: 'manager', description: 'Access manager dashboard' },
    { id: 702, name: 'dashboard_client', resource: 'dashboard', action: 'client', description: 'Access client dashboard' }
  ];
  
  for (const permission of permissionsToCreate) {
    await db.insert(permissions).values({
      id: permission.id,
      name: permission.name,
      resource: permission.resource,
      action: permission.action,
      description: permission.description,
      createdAt: new Date(),
      updatedAt: null
    });
  }
  
  console.log(`Created ${permissionsToCreate.length} permissions`);
}

// Connect roles and permissions
async function initializeRolePermissions() {
  // Clear existing role-permissions first
  await db.delete(rolePermissions);
  
  // Role-permission mappings
  const mappings = [
    // Admin role gets all permissions
    { roleId: 1002, permissionIds: [100, 101, 102, 103, 200, 201, 202, 203, 204, 300, 400, 500, 600, 700, 701, 702] },
    
    // Manager role gets limited permissions
    { roleId: 1000, permissionIds: [100, 200, 201, 202, 203, 400, 500, 600, 701, 702] },
    
    // Client role gets very limited permissions
    { roleId: 1001, permissionIds: [201, 702] }
  ];
  
  for (const mapping of mappings) {
    for (const permissionId of mapping.permissionIds) {
      await db.insert(rolePermissions).values({
        // Remove the id field as it's likely auto-generated, or the schema expects a number not a string
        roleId: mapping.roleId,
        permissionId: permissionId
      });
    }
  }
  
  console.log('Role permissions assigned');
}

// Initialize test users
async function initializeUsers() {
  // Clear existing users first to avoid conflicts
  await db.delete(users);
  
  // Create demo users for each role
  const usersToCreate = [
    {
      id: 60000, // Admin ID range starts at 60000
      username: 'admin@aditeke.com',
      password: await hashPassword('adminPassword123'),
      email: 'admin@aditeke.com',
      name: 'Admin User',
      roleId: 1002, // Admin role
      isActive: true,
      profilePicture: '/images/avatars/admin-avatar.jpg',
    },
    {
      id: 50000, // Manager ID range starts at 50000
      username: 'manager@aditeke.com',
      password: await hashPassword('managerPassword123'),
      email: 'manager@aditeke.com',
      name: 'Manager User',
      roleId: 1000, // Manager role
      isActive: true,
      profilePicture: '/images/avatars/manager-avatar.jpg',
    },
    {
      id: 2000, // Client ID range starts at 2000
      username: 'client@example.com',
      password: await hashPassword('clientPassword123'),
      email: 'client@example.com',
      name: 'Client User',
      roleId: 1001, // Client role
      isActive: true,
      profilePicture: '/images/avatars/client-avatar.jpg',
      company: 'Example Client Company',
      phone: '+1234567890',
      address: '123 Client St, City, Country',
    }
  ];
  
  for (const user of usersToCreate) {
    await db.insert(users).values({
      ...user,
      createdAt: new Date(),
      updatedAt: null,
      lastLogin: null,
      isPriority: false
    });
  }
  
  console.log(`Created ${usersToCreate.length} users`);
}

// Initialize sample services
async function initializeServices() {
  // Clear existing services
  await db.delete(services);
  
  const servicesToCreate = [
    {
      id: 3000,
      title: 'Custom Software Development',
      description: 'End-to-end custom software development services for businesses of all sizes. We create tailored solutions that address your specific business challenges.',
      shortDescription: 'Tailored software solutions for your business needs',
      icon: 'code',
      isActive: true
    },
    {
      id: 3001,
      title: 'Mobile App Development',
      description: 'Professional mobile application development for iOS and Android platforms. We build engaging, high-performance mobile apps that deliver exceptional user experiences.',
      shortDescription: 'Native and cross-platform mobile applications',
      icon: 'smartphone',
      isActive: true
    },
    {
      id: 3002,
      title: 'Web Application Development',
      description: 'Custom web application development services that help businesses streamline operations and improve customer engagement through intuitive interfaces and robust functionality.',
      shortDescription: 'Modern, responsive web applications',
      icon: 'globe',
      isActive: true
    },
    {
      id: 3003,
      title: 'UI/UX Design',
      description: 'User-centered design services that create intuitive, engaging interfaces for web and mobile applications. We focus on creating experiences that delight users while achieving business goals.',
      shortDescription: 'Creating delightful user experiences',
      icon: 'layout',
      isActive: true
    },
    {
      id: 3004,
      title: 'Cloud Solutions',
      description: 'Comprehensive cloud consulting and implementation services to help businesses leverage the full potential of cloud technologies for improved scalability, security, and cost efficiency.',
      shortDescription: 'Scalable, secure cloud infrastructure',
      icon: 'cloud',
      isActive: true
    }
  ];
  
  for (const service of servicesToCreate) {
    await db.insert(services).values(service);
  }
  
  console.log(`Created ${servicesToCreate.length} services`);
}

// Initialize testimonials
async function initializeTestimonials() {
  // Clear existing testimonials
  await db.delete(testimonials);
  
  const testimonialsToCreate = [
    {
      id: 4000,
      clientName: 'Sarah Johnson',
      company: 'TechGrow Solutions',
      testimonial: 'AdiTeke transformed our business with their custom software solution. Their team was professional, responsive, and delivered beyond our expectations.',
      rating: 5,
      profilePicture: '/images/testimonials/client1.jpg',
      isActive: true
    },
    {
      id: 4001,
      clientName: 'Michael Chen',
      company: 'Innovate Retail',
      testimonial: 'Working with AdiTeke on our mobile app was a fantastic experience. They understood our needs perfectly and created an app that our customers love using.',
      rating: 5,
      profilePicture: '/images/testimonials/client2.jpg',
      isActive: true
    },
    {
      id: 4002,
      clientName: 'Emily Rodriguez',
      company: 'HealthPlus',
      testimonial: 'The team at AdiTeke helped us modernize our healthcare platform. Their expertise in security and user experience was exactly what we needed.',
      rating: 4,
      profilePicture: '/images/testimonials/client3.jpg',
      isActive: true
    }
  ];
  
  for (const testimonial of testimonialsToCreate) {
    await db.insert(testimonials).values(testimonial);
  }
  
  console.log(`Created ${testimonialsToCreate.length} testimonials`);
}

// Initialize projects
async function initializeProjects() {
  // Clear existing projects
  await db.delete(projects);
  
  const projectsToCreate = [
    {
      id: 500,
      title: 'Genesis Group Home Website',
      description: 'Professional website design and development for Genesis Group Home, featuring responsive design, service information, and contact functionality.',
      status: 'completed',
      category: 'Web Development',
      clientId: 2000,
      startDate: new Date('2023-11-15'),
      endDate: new Date('2024-01-10'),
      thumbnail: '/images/projects/genesis-group-home.svg',
      progress: 100,
      budget: 12000,
      teamSize: 3,
      website_url: 'https://genesisgrouphome.com',
      sort_order: 1 // High priority - actual project
    },
    {
      id: 501,
      title: 'Personal Portfolio Website',
      description: 'Modern portfolio website for Mulualem Berhanu showcasing professional experience, skills, and projects with a clean, interactive design.',
      status: 'completed',
      category: 'Web Development',
      clientId: 2000,
      startDate: new Date('2023-10-01'),
      endDate: new Date('2023-12-15'),
      thumbnail: '/images/projects/portfolio-thumb.svg',
      progress: 100,
      budget: 8000,
      teamSize: 2,
      website_url: 'http://MulualemBerhanu.com',
      sort_order: 2 // High priority - actual project
    },
    {
      id: 502,
      title: 'Mobile Banking Application',
      description: 'Secure mobile banking application for a financial institution, featuring account management, transfers, and biometric authentication.',
      status: 'in-progress',
      category: 'Mobile Development',
      clientId: 2000,
      startDate: new Date('2024-04-01'),
      endDate: null,
      thumbnail: '/images/projects/social-media-app.svg',
      progress: 65,
      budget: 30000,
      teamSize: 6,
      sort_order: 10
    },
    {
      id: 503,
      title: 'E-commerce Platform Redesign',
      description: 'Complete redesign and modernization of an e-commerce platform, including payment integration, inventory management, and a responsive UI.',
      status: 'completed',
      category: 'Web Development',
      clientId: 2000,
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-03-20'),
      thumbnail: '/images/projects/ecommerce-platform.svg',
      progress: 100,
      budget: 15000,
      teamSize: 5,
      sort_order: 15
    },
    {
      id: 504,
      title: 'Healthcare Management System',
      description: 'Development of a comprehensive healthcare management system for patient records, appointment scheduling, and billing.',
      status: 'planning',
      category: 'Software Development',
      clientId: 2000,
      startDate: new Date('2024-05-10'),
      endDate: null,
      thumbnail: '/images/projects/hotel-booking.svg',
      progress: 20,
      budget: 25000,
      teamSize: 7,
      sort_order: 20
    }
  ];
  
  for (const project of projectsToCreate) {
    await db.insert(projects).values(project);
  }
  
  console.log(`Created ${projectsToCreate.length} projects`);
}

// Export the initialization function
export { initializeDatabase };

// In ESM we can't use require.main === module, so we'll export the function directly
// If someone wants to run this directly, they can use:
// node --loader tsx server/db-init.ts