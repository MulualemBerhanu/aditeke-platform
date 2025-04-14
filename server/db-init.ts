import { storage } from './storage';
import { Role, Permission, RolePermission, User, InsertUser, InsertRole, InsertPermission, InsertProject, InsertService, InsertTestimonial, InsertBlogPost } from '@shared/schema';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

// Utility to hash passwords for user accounts
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

// Function to initialize Roles and Permissions
async function initializeRolesAndPermissions() {
  console.log("Initializing roles and permissions...");
  
  // Create roles
  const roles = [
    { name: 'admin', description: 'Administrator with full access' },
    { name: 'manager', description: 'Manager with limited administrative access' },
    { name: 'client', description: 'Client with access to their own projects' }
  ];
  
  // Create permissions
  const resources = ['user', 'project', 'service', 'blog', 'testimonial', 'job'];
  const actions = ['create', 'read', 'update', 'delete', 'manage'];
  
  const permissions: InsertPermission[] = [];
  
  // Generate all permission combinations
  for (const resource of resources) {
    for (const action of actions) {
      permissions.push({
        name: `${resource}:${action}`,
        resource,
        action,
        description: `Permission to ${action} ${resource}s`
      });
    }
  }
  
  // Save roles and get their IDs
  const roleInstances: Role[] = [];
  for (const roleData of roles) {
    try {
      const role = await storage.createRole(roleData as InsertRole);
      roleInstances.push(role);
      console.log(`Created role: ${role.name} (ID: ${role.id})`);
    } catch (error) {
      console.error(`Error creating role ${roleData.name}:`, error);
    }
  }
  
  // Save permissions and get their IDs
  const permissionInstances: Permission[] = [];
  for (const permData of permissions) {
    try {
      const permission = await storage.createPermission(permData);
      permissionInstances.push(permission);
    } catch (error) {
      console.error(`Error creating permission ${permData.name}:`, error);
    }
  }
  
  // Link roles with permissions
  if (roleInstances.length > 0 && permissionInstances.length > 0) {
    // Find role IDs
    const adminRole = roleInstances.find(r => r.name === 'admin');
    const managerRole = roleInstances.find(r => r.name === 'manager');
    const clientRole = roleInstances.find(r => r.name === 'client');
    
    if (adminRole) {
      // Assign all permissions to admin
      for (const perm of permissionInstances) {
        try {
          await storage.assignPermissionToRole(adminRole.id, perm.id);
          console.log(`Assigned ${perm.name} to admin role`);
        } catch (error) {
          console.error(`Error assigning permission ${perm.name} to admin:`, error);
        }
      }
    }
    
    if (managerRole) {
      // Assign specific permissions to manager
      const managerPermissions = permissionInstances.filter(p => 
        p.name.startsWith('project:') || 
        p.name.startsWith('service:') || 
        p.name.startsWith('blog:') ||
        p.name === 'user:read'
      );
      
      for (const perm of managerPermissions) {
        try {
          await storage.assignPermissionToRole(managerRole.id, perm.id);
          console.log(`Assigned ${perm.name} to manager role`);
        } catch (error) {
          console.error(`Error assigning permission ${perm.name} to manager:`, error);
        }
      }
    }
    
    if (clientRole) {
      // Assign limited permissions to client
      const clientPermissions = permissionInstances.filter(p => 
        p.name === 'project:read' || 
        p.name === 'service:read' || 
        p.name === 'blog:read'
      );
      
      for (const perm of clientPermissions) {
        try {
          await storage.assignPermissionToRole(clientRole.id, perm.id);
          console.log(`Assigned ${perm.name} to client role`);
        } catch (error) {
          console.error(`Error assigning permission ${perm.name} to client:`, error);
        }
      }
    }
  }
  
  return { roles: roleInstances, permissions: permissionInstances };
}

// Function to create initial users
async function initializeUsers(roles: Role[]) {
  console.log("Initializing users...");
  
  // Find role IDs
  const adminRole = roles.find(r => r.name === 'admin');
  const managerRole = roles.find(r => r.name === 'manager');
  const clientRole = roles.find(r => r.name === 'client');
  
  if (!adminRole || !managerRole || !clientRole) {
    console.error("Cannot create users - required roles not found");
    return;
  }
  
  // Create admin user
  const adminUser: InsertUser = {
    username: 'admin',
    password: await hashPassword('password123'),
    email: 'admin@aditeke.com',
    name: 'Admin User',
    roleId: adminRole.id,
    profilePicture: null,
    isActive: true
  };
  
  // Create manager user
  const managerUser: InsertUser = {
    username: 'manager',
    password: await hashPassword('password123'),
    email: 'manager@aditeke.com',
    name: 'Manager User',
    roleId: managerRole.id,
    profilePicture: null,
    isActive: true
  };
  
  // Create client user
  const clientUser: InsertUser = {
    username: 'client',
    password: await hashPassword('password123'),
    email: 'client@example.com',
    name: 'Client User',
    roleId: clientRole.id,
    profilePicture: null,
    isActive: true
  };
  
  const users = [adminUser, managerUser, clientUser];
  const createdUsers: User[] = [];
  
  for (const userData of users) {
    try {
      const user = await storage.createUser(userData);
      createdUsers.push(user);
      console.log(`Created user: ${user.username} (ID: ${user.id})`);
    } catch (error) {
      console.error(`Error creating user ${userData.username}:`, error);
    }
  }
  
  return createdUsers;
}

// Function to initialize service offerings
async function initializeServices() {
  console.log("Initializing services...");
  
  const services = [
    {
      title: 'Web Development',
      icon: 'code',
      shortDescription: 'Create modern, responsive websites and web applications',
      description: 'We build cutting-edge web applications using the latest technologies including React, Angular, Node.js, and more. Our web development services focus on performance, security, and scalability.',
      isActive: true
    },
    {
      title: 'Mobile App Development',
      icon: 'smartphone',
      shortDescription: 'Native and cross-platform mobile applications',
      description: 'Our mobile development team creates beautiful, high-performance applications for iOS and Android. We specialize in React Native and Flutter for cross-platform development, and Swift/Kotlin for native apps.',
      isActive: true
    },
    {
      title: 'UI/UX Design',
      icon: 'palette',
      shortDescription: 'Intuitive user interfaces and engaging experiences',
      description: 'Our design team crafts beautiful, intuitive interfaces that engage users and enhance your brand. We follow a user-centered design process that includes research, wireframing, prototyping, and usability testing.',
      isActive: true
    },
    {
      title: 'Cloud Solutions',
      icon: 'cloud',
      shortDescription: 'Scalable infrastructure and serverless applications',
      description: 'We help businesses leverage cloud technologies for improved scalability, reliability, and performance. Our experts are certified in AWS, Azure, and Google Cloud, providing migration, architecture, and optimization services.',
      isActive: true
    },
    {
      title: 'AI & Machine Learning',
      icon: 'brain',
      shortDescription: 'Intelligent systems and data analysis',
      description: 'Harness the power of artificial intelligence and machine learning for your business. We develop custom machine learning models, chatbots, recommendation systems, and data analysis solutions tailored to your specific needs.',
      isActive: true
    },
    {
      title: 'DevOps & Automation',
      icon: 'settings',
      shortDescription: 'Streamline development and deployment',
      description: 'Our DevOps engineers implement continuous integration/continuous deployment (CI/CD) pipelines, infrastructure as code, and automated testing frameworks to improve development efficiency and software quality.',
      isActive: true
    }
  ];
  
  const createdServices = [];
  
  for (const serviceData of services) {
    try {
      const service = await storage.createService(serviceData as InsertService);
      createdServices.push(service);
      console.log(`Created service: ${service.title} (ID: ${service.id})`);
    } catch (error) {
      console.error(`Error creating service ${serviceData.title}:`, error);
    }
  }
  
  return createdServices;
}

// Function to initialize projects
async function initializeProjects(users: User[]) {
  console.log("Initializing projects...");
  
  // Find a client user
  const clientUser = users.find(u => u.roleId === users.find(r => r.username === 'client')?.roleId);
  
  if (!clientUser) {
    console.error("Cannot create projects - client user not found");
    return [];
  }
  
  const projects = [
    {
      title: 'E-commerce Platform',
      description: 'A full-featured e-commerce platform with product management, shopping cart, and payment processing capabilities.',
      thumbnail: 'ecommerce-thumbnail.jpg',
      category: 'Web Development',
      clientId: clientUser.id,
      startDate: new Date(2024, 0, 15),
      endDate: new Date(2024, 3, 30),
      status: 'In Progress'
    },
    {
      title: 'Healthcare Mobile App',
      description: 'A mobile application for healthcare providers to manage patient records, appointments, and telemedicine sessions.',
      thumbnail: 'healthcare-app-thumbnail.jpg',
      category: 'Mobile App Development',
      clientId: clientUser.id,
      startDate: new Date(2023, 9, 10),
      endDate: new Date(2024, 1, 28),
      status: 'Completed'
    },
    {
      title: 'AI-Powered Analytics Dashboard',
      description: 'An analytics dashboard that uses machine learning to provide insights and predictions based on business data.',
      thumbnail: 'analytics-dashboard-thumbnail.jpg',
      category: 'AI & Machine Learning',
      clientId: clientUser.id,
      startDate: new Date(2024, 2, 5),
      endDate: null,
      status: 'Planning'
    }
  ];
  
  const createdProjects = [];
  
  for (const projectData of projects) {
    try {
      const project = await storage.createProject(projectData as InsertProject);
      createdProjects.push(project);
      console.log(`Created project: ${project.title} (ID: ${project.id})`);
    } catch (error) {
      console.error(`Error creating project ${projectData.title}:`, error);
    }
  }
  
  return createdProjects;
}

// Function to initialize testimonials
async function initializeTestimonials() {
  console.log("Initializing testimonials...");
  
  const testimonials = [
    {
      clientName: 'John Smith',
      company: 'TechCorp Inc.',
      testimonial: 'AdiTeke Software Solutions delivered an exceptional e-commerce platform that exceeded our expectations. Their team was professional, responsive, and delivered the project on time and within budget.',
      rating: 5,
      profilePicture: 'john-smith.jpg',
      isActive: true
    },
    {
      clientName: 'Sarah Johnson',
      company: 'HealthPlus',
      testimonial: 'Working with AdiTeke on our healthcare app was a pleasure. They understood our complex requirements and created an intuitive, secure application that our staff and patients love to use.',
      rating: 5,
      profilePicture: 'sarah-johnson.jpg',
      isActive: true
    },
    {
      clientName: 'Michael Wong',
      company: 'DataInsight Analytics',
      testimonial: 'The AI-powered dashboard AdiTeke developed has transformed our business intelligence capabilities. Their expertise in machine learning and data visualization is truly impressive.',
      rating: 4,
      profilePicture: 'michael-wong.jpg',
      isActive: true
    }
  ];
  
  const createdTestimonials = [];
  
  for (const testimonialData of testimonials) {
    try {
      const testimonial = await storage.createTestimonial(testimonialData as InsertTestimonial);
      createdTestimonials.push(testimonial);
      console.log(`Created testimonial from: ${testimonial.clientName} (ID: ${testimonial.id})`);
    } catch (error) {
      console.error(`Error creating testimonial from ${testimonialData.clientName}:`, error);
    }
  }
  
  return createdTestimonials;
}

// Function to initialize blog posts
async function initializeBlogPosts(users: User[]) {
  console.log("Initializing blog posts...");
  
  // Find an admin user (author)
  const adminUser = users.find(u => u.username === 'admin');
  
  if (!adminUser) {
    console.error("Cannot create blog posts - admin user not found");
    return [];
  }
  
  const blogPosts = [
    {
      title: 'The Future of Web Development: Trends to Watch in 2025',
      content: `
        <p>As we move further into 2025, several emerging technologies are reshaping the landscape of web development. In this post, we'll explore the most influential trends that developers should be paying attention to.</p>
        
        <h2>WebAssembly Becomes Mainstream</h2>
        <p>WebAssembly (WASM) has matured significantly, enabling near-native performance for web applications. We're seeing more complex applications being ported to the web, from advanced gaming engines to professional creative tools.</p>
        
        <h2>AI-Assisted Development</h2>
        <p>Artificial intelligence isn't just changing how we interact with applications—it's changing how we build them. AI-powered development tools are improving code quality, automating routine tasks, and helping developers identify potential issues before they arise.</p>
        
        <h2>Edge Computing</h2>
        <p>The distribution of computing resources closer to the user is leading to unprecedented performance improvements. Edge functions and serverless architectures are becoming the standard for modern web applications.</p>
        
        <h2>Progressive Web Apps 2.0</h2>
        <p>PWAs continue to evolve, with enhanced capability APIs and improved integration with operating systems. The line between web and native applications continues to blur.</p>
      `,
      thumbnail: 'web-dev-trends-thumbnail.jpg',
      category: 'Web Development',
      authorId: adminUser.id,
      tags: 'webassembly,ai,edge computing,pwa',
      isPublished: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: 'Building Secure Mobile Applications: Best Practices',
      content: `
        <p>Security should be a primary concern for all mobile application developers. With the increasing amount of sensitive data stored on mobile devices, implementing robust security measures is essential.</p>
        
        <h2>Secure Authentication</h2>
        <p>Implement multi-factor authentication and biometric verification options where possible. Use secure, industry-standard authentication protocols and consider passwordless authentication methods.</p>
        
        <h2>Data Encryption</h2>
        <p>Encrypt all sensitive data, both in transit and at rest. Use strong, up-to-date encryption algorithms and properly manage encryption keys.</p>
        
        <h2>Code Protection</h2>
        <p>Implement code obfuscation and tamper detection mechanisms to prevent reverse engineering. Regularly conduct security audits and penetration testing.</p>
        
        <h2>Secure API Communication</h2>
        <p>Use HTTPS for all API communication and implement proper API authentication. Validate all data received from APIs and implement rate limiting to prevent abuse.</p>
      `,
      thumbnail: 'mobile-security-thumbnail.jpg',
      category: 'Mobile Development',
      authorId: adminUser.id,
      tags: 'security,mobile,encryption,authentication',
      isPublished: true,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // One week ago
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    },
    {
      title: 'Implementing Machine Learning in Business Applications',
      content: `
        <p>Machine learning can provide significant competitive advantages when properly integrated into business applications. Here's how to approach ML implementation in your next project.</p>
        
        <h2>Identifying Suitable Use Cases</h2>
        <p>Not every problem requires a machine learning solution. Focus on areas where pattern recognition, prediction, or personalization can add genuine value to your application.</p>
        
        <h2>Data Strategy</h2>
        <p>The quality of your machine learning models depends heavily on the quality of your data. Develop a comprehensive data strategy encompassing collection, preprocessing, and ongoing model training.</p>
        
        <h2>Choosing the Right Approach</h2>
        <p>Consider whether you need custom models or if pre-trained models and ML services can meet your requirements. Balance development complexity against performance and cost.</p>
        
        <h2>Deployment and Monitoring</h2>
        <p>Plan for how models will be deployed, updated, and monitored in production. Implement systems to detect model drift and performance degradation over time.</p>
      `,
      thumbnail: 'ml-business-thumbnail.jpg',
      category: 'Artificial Intelligence',
      authorId: adminUser.id,
      tags: 'machine learning,ai,business intelligence',
      isPublished: true,
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // Two weeks ago
      updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
    }
  ];
  
  const createdBlogPosts = [];
  
  for (const postData of blogPosts) {
    try {
      const post = await storage.createBlogPost(postData as InsertBlogPost);
      createdBlogPosts.push(post);
      console.log(`Created blog post: ${post.title} (ID: ${post.id})`);
    } catch (error) {
      console.error(`Error creating blog post ${postData.title}:`, error);
    }
  }
  
  return createdBlogPosts;
}

// Main function to initialize all database collections
export async function initializeDatabase() {
  console.log("Starting Firestore database initialization...");
  
  try {
    // Initialize roles and permissions first
    const { roles } = await initializeRolesAndPermissions();
    
    // Then initialize users (which depend on roles)
    const users = await initializeUsers(roles);
    
    // Initialize other collections
    const userArray = users || [];
    await Promise.all([
      initializeServices(),
      initializeProjects(userArray),
      initializeTestimonials(),
      initializeBlogPosts(userArray)
    ]);
    
    console.log("Database initialization completed successfully!");
    return true;
  } catch (error) {
    console.error("Database initialization failed:", error);
    return false;
  }
}