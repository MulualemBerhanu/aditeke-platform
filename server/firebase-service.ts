import { getFirestoreDb, getFirebaseAuth } from './firebase-admin';
import { IStorage } from './storage';
import { 
  User, Role, Permission, Project, Testimonial, Service, BlogPost, 
  ContactMessage, NewsletterSubscriber, Job, ClientCommunication, 
  ClientDocument, ClientInvoice, InsertClientCommunication, 
  InsertClientDocument, InsertClientInvoice 
} from '@shared/schema';

/**
 * Implementation of the IStorage interface using Firebase Firestore
 */
export class FirebaseStorage implements IStorage {
  private db: any; // Using any type to handle both real and mock Firestore
  private auth: any;

  constructor() {
    try {
      // Get Firestore instance
      this.db = getFirestoreDb();
      this.auth = getFirebaseAuth();
      console.log("Firebase services connected successfully");
    } catch (error) {
      console.error("Error initializing Firebase services:", error);
      throw new Error("Failed to initialize Firebase services");
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    try {
      const userRef = this.db.collection('users').where('id', '==', id);
      const snapshot = await userRef.get();
      
      if (snapshot.empty) {
        return undefined;
      }
      
      const userData = snapshot.docs[0].data();
      return userData as User;
    } catch (error) {
      console.error("Error getting user from Firestore:", error);
      throw error;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      // Prevent Firestore error with undefined or empty username
      if (!username) {
        console.log("Invalid username parameter: empty or undefined");
        return undefined;
      }
      
      console.log(`Looking for user with username: ${username}`);
      const userRef = this.db.collection('users').where('username', '==', username);
      const snapshot = await userRef.get();
      
      if (snapshot.empty) {
        console.log(`No user found with username: ${username}`);
        return undefined;
      }
      
      const userData = snapshot.docs[0].data();
      console.log(`User found with username: ${username}`);
      return userData as User;
    } catch (error) {
      console.error("Error getting user by username from Firestore:", error);
      throw error;
    }
  }
  
  async getAllUsers(): Promise<User[]> {
    try {
      const usersRef = this.db.collection('users');
      const snapshot = await usersRef.get();
      
      if (snapshot.empty) {
        return [];
      }
      
      return snapshot.docs.map(doc => doc.data() as User);
    } catch (error) {
      console.error("Error getting all users from Firestore:", error);
      throw error;
    }
  }

  async createUser(user: any): Promise<User> {
    try {
      // Clean up any undefined values to prevent Firestore errors
      const cleanUser = Object.fromEntries(
        Object.entries(user).filter(([_, value]) => value !== undefined)
      );
      
      // Generate a unique ID and ensure no undefined values
      const newUser = {
        ...cleanUser,
        id: Date.now(), // Simple ID generation
        createdAt: new Date().toISOString(),
        updatedAt: null,
        lastLogin: null,
        // Ensure these fields are never undefined
        profilePicture: cleanUser.profilePicture || null,
        isActive: typeof cleanUser.isActive === 'boolean' ? cleanUser.isActive : true
      };
      
      console.log("Creating clean user:", newUser);
      await this.db.collection('users').add(newUser);
      
      return newUser as User;
    } catch (error) {
      console.error("Error creating user in Firestore:", error);
      throw error;
    }
  }

  async updateUser(id: number, userData: any): Promise<User> {
    try {
      const userRef = this.db.collection('users').where('id', '==', id);
      const snapshot = await userRef.get();
      
      if (snapshot.empty) {
        throw new Error(`User with ID ${id} not found`);
      }
      
      const docId = snapshot.docs[0].id;
      const updatedUser = {
        ...snapshot.docs[0].data(),
        ...userData,
        updatedAt: new Date().toISOString()
      };
      
      await this.db.collection('users').doc(docId).update(updatedUser);
      
      return updatedUser as User;
    } catch (error) {
      console.error("Error updating user in Firestore:", error);
      throw error;
    }
  }

  // Role methods
  async getRole(id: number): Promise<Role | undefined> {
    try {
      // In Firestore, we're using ID as document ID
      const roleDoc = await this.db.collection('roles').doc(id.toString()).get();
      
      if (!roleDoc.exists) {
        return undefined;
      }
      
      const roleData = roleDoc.data();
      return { id, ...roleData } as Role;
    } catch (error) {
      console.error("Error getting role from Firestore:", error);
      throw error;
    }
  }

  // Implement all other methods required by IStorage interface
  // Project methods, Testimonial methods, etc.
  // These would follow a similar pattern as the user and role methods above

  // Client Communications methods
  async getClientCommunications(clientId: number): Promise<ClientCommunication[]> {
    try {
      const commRef = this.db.collection('client_communications').where('clientId', '==', clientId);
      const snapshot = await commRef.get();
      
      if (snapshot.empty) {
        return [];
      }
      
      return snapshot.docs.map(doc => doc.data() as ClientCommunication)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error("Error getting client communications from Firestore:", error);
      throw error;
    }
  }
  
  async createClientCommunication(communication: InsertClientCommunication): Promise<ClientCommunication> {
    try {
      const id = Date.now();
      const createdAt = new Date();
      const clientCommunication: ClientCommunication = {
        ...communication,
        id,
        createdAt,
        isRead: communication.isRead !== undefined ? communication.isRead : false,
        // Ensure required fields are not undefined
        type: communication.type || 'message',
        subject: communication.subject || null,
        attachments: communication.attachments || {}
      };
      
      await this.db.collection('client_communications').add(clientCommunication);
      return clientCommunication;
    } catch (error) {
      console.error("Error creating client communication in Firestore:", error);
      throw error;
    }
  }
  
  async markCommunicationAsRead(id: number): Promise<ClientCommunication> {
    try {
      const commRef = this.db.collection('client_communications').where('id', '==', id);
      const snapshot = await commRef.get();
      
      if (snapshot.empty) {
        throw new Error(`Communication with ID ${id} not found`);
      }
      
      const docId = snapshot.docs[0].id;
      const communication = snapshot.docs[0].data() as ClientCommunication;
      communication.isRead = true;
      
      await this.db.collection('client_communications').doc(docId).update({ isRead: true });
      return communication;
    } catch (error) {
      console.error("Error marking communication as read in Firestore:", error);
      throw error;
    }
  }
  
  // Client Documents methods
  async getClientDocuments(clientId: number, category?: string): Promise<ClientDocument[]> {
    try {
      let docsRef = this.db.collection('client_documents').where('clientId', '==', clientId);
      const snapshot = await docsRef.get();
      
      if (snapshot.empty) {
        return [];
      }
      
      let documents = snapshot.docs.map(doc => doc.data() as ClientDocument);
      
      if (category) {
        documents = documents.filter(doc => doc.category === category);
      }
      
      return documents.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
    } catch (error) {
      console.error("Error getting client documents from Firestore:", error);
      throw error;
    }
  }
  
  async uploadClientDocument(document: InsertClientDocument): Promise<ClientDocument> {
    try {
      const id = Date.now();
      const uploadedAt = new Date();
      const clientDocument: ClientDocument = {
        ...document,
        id,
        uploadedAt,
        // Ensure required fields are not undefined
        description: document.description || null,
        category: document.category || null,
        projectId: document.projectId || null
      };
      
      await this.db.collection('client_documents').add(clientDocument);
      return clientDocument;
    } catch (error) {
      console.error("Error uploading client document to Firestore:", error);
      throw error;
    }
  }
  
  async getDocument(id: number): Promise<ClientDocument | undefined> {
    try {
      const docRef = this.db.collection('client_documents').where('id', '==', id);
      const snapshot = await docRef.get();
      
      if (snapshot.empty) {
        return undefined;
      }
      
      return snapshot.docs[0].data() as ClientDocument;
    } catch (error) {
      console.error("Error getting document from Firestore:", error);
      throw error;
    }
  }
  
  async deleteDocument(id: number): Promise<boolean> {
    try {
      const docRef = this.db.collection('client_documents').where('id', '==', id);
      const snapshot = await docRef.get();
      
      if (snapshot.empty) {
        return false;
      }
      
      const docId = snapshot.docs[0].id;
      await this.db.collection('client_documents').doc(docId).delete();
      return true;
    } catch (error) {
      console.error("Error deleting document from Firestore:", error);
      throw error;
    }
  }
  
  // Client Invoices methods
  async getClientInvoices(clientId: number): Promise<ClientInvoice[]> {
    try {
      const invoicesRef = this.db.collection('client_invoices').where('clientId', '==', clientId);
      const snapshot = await invoicesRef.get();
      
      if (snapshot.empty) {
        return [];
      }
      
      return snapshot.docs.map(doc => doc.data() as ClientInvoice)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error("Error getting client invoices from Firestore:", error);
      throw error;
    }
  }
  
  async getInvoice(id: number): Promise<ClientInvoice | undefined> {
    try {
      const invoiceRef = this.db.collection('client_invoices').where('id', '==', id);
      const snapshot = await invoiceRef.get();
      
      if (snapshot.empty) {
        return undefined;
      }
      
      return snapshot.docs[0].data() as ClientInvoice;
    } catch (error) {
      console.error("Error getting invoice from Firestore:", error);
      throw error;
    }
  }
  
  async createClientInvoice(invoice: InsertClientInvoice): Promise<ClientInvoice> {
    try {
      const id = Date.now();
      const createdAt = new Date();
      const clientInvoice: ClientInvoice = {
        ...invoice,
        id,
        createdAt,
        updatedAt: null,
        status: invoice.status || 'pending',
        // Ensure required fields are not undefined
        description: invoice.description || null,
        notes: invoice.notes || null,
        projectId: invoice.projectId || null,
        paidDate: null,
        paidAmount: null,
        stripePaymentIntentId: null,
        paymentMethod: null,
        receiptNumber: null  // New field for manual receipts
      };
      
      await this.db.collection('client_invoices').add(clientInvoice);
      return clientInvoice;
    } catch (error) {
      console.error("Error creating client invoice in Firestore:", error);
      throw error;
    }
  }
  
  async updateInvoiceStatus(id: number, status: string, paymentData?: any): Promise<ClientInvoice> {
    try {
      const invoiceRef = this.db.collection('client_invoices').where('id', '==', id);
      const snapshot = await invoiceRef.get();
      
      if (snapshot.empty) {
        throw new Error(`Invoice with ID ${id} not found`);
      }
      
      const docId = snapshot.docs[0].id;
      const invoice = snapshot.docs[0].data() as ClientInvoice;
      
      // Handle manual payment data
      const updatedInvoice: ClientInvoice = {
        ...invoice,
        status,
        updatedAt: new Date()
      };
      
      // Process payment data for manual receipts
      if (status === 'paid') {
        // Set paid date if not provided
        if (paymentData?.paidDate) {
          updatedInvoice.paidDate = paymentData.paidDate;
        } else if (!updatedInvoice.paidDate) {
          updatedInvoice.paidDate = new Date().toISOString();
        }
        
        // Set payment method
        if (paymentData?.paymentMethod) {
          updatedInvoice.paymentMethod = paymentData.paymentMethod;
        } else if (!updatedInvoice.paymentMethod) {
          updatedInvoice.paymentMethod = 'manual';
        }
        
        // Set paid amount
        if (paymentData?.paidAmount) {
          updatedInvoice.paidAmount = paymentData.paidAmount;
        } else if (!updatedInvoice.paidAmount) {
          updatedInvoice.paidAmount = updatedInvoice.amount;
        }
        
        // Set receipt number
        if (paymentData?.receiptNumber) {
          updatedInvoice.receiptNumber = paymentData.receiptNumber;
        } else if (!updatedInvoice.receiptNumber) {
          updatedInvoice.receiptNumber = `RCPT-${Date.now()}`;
        }
      }
      
      await this.db.collection('client_invoices').doc(docId).update(updatedInvoice);
      return updatedInvoice;
    } catch (error) {
      console.error("Error updating invoice status in Firestore:", error);
      throw error;
    }
  }
  
  // For brevity, we'll add stub implementations for now
  // You can expand these as needed
  
  async getRoleByName(name: string): Promise<Role | undefined> {
    try {
      // Firestore doesn't support case-insensitive search directly,
      // so we need to handle this in application logic
      const snapshot = await this.db.collection('roles').get();
      
      if (snapshot.empty) {
        return undefined;
      }
      
      // Find role with matching name (case-insensitive)
      for (const doc of snapshot.docs) {
        const data = doc.data();
        if (data.name && data.name.toLowerCase() === name.toLowerCase()) {
          // Include the document ID as the role ID if needed
          return {
            ...data,
            id: doc.id
          } as Role;
        }
      }
      
      return undefined;
    } catch (error) {
      console.error("Error getting role by name from Firestore:", error);
      throw error;
    }
  }
  
  async getAllRoles(): Promise<Role[]> {
    try {
      const rolesRef = this.db.collection('roles');
      const snapshot = await rolesRef.get();
      
      if (snapshot.empty) {
        return [];
      }
      
      return snapshot.docs.map((doc: any) => doc.data() as Role);
    } catch (error) {
      console.error("Error getting all roles from Firestore:", error);
      throw error;
    }
  }
  
  async createRole(role: any): Promise<Role> {
    try {
      // Generate a unique ID
      const newRole = {
        ...role,
        id: Date.now(), // Simple ID generation
        createdAt: new Date(),
        updatedAt: null
      };
      
      await this.db.collection('roles').add(newRole);
      
      return newRole as Role;
    } catch (error) {
      console.error("Error creating role in Firestore:", error);
      throw error;
    }
  }
  
  async updateRole(id: number, roleData: any): Promise<Role> {
    try {
      const roleRef = this.db.collection('roles').where('id', '==', id);
      const snapshot = await roleRef.get();
      
      if (snapshot.empty) {
        throw new Error(`Role with ID ${id} not found`);
      }
      
      const docId = snapshot.docs[0].id;
      const updatedRole = {
        ...snapshot.docs[0].data(),
        ...roleData,
        updatedAt: new Date()
      };
      
      await this.db.collection('roles').doc(docId).update(updatedRole);
      
      return updatedRole as Role;
    } catch (error) {
      console.error("Error updating role in Firestore:", error);
      throw error;
    }
  }
  
  async deleteRole(id: number): Promise<boolean> {
    try {
      const roleRef = this.db.collection('roles').where('id', '==', id);
      const snapshot = await roleRef.get();
      
      if (snapshot.empty) {
        throw new Error(`Role with ID ${id} not found`);
      }
      
      const docId = snapshot.docs[0].id;
      await this.db.collection('roles').doc(docId).delete();
      
      return true;
    } catch (error) {
      console.error("Error deleting role from Firestore:", error);
      throw error;
    }
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
  
  async createPermission(permission: any): Promise<Permission> {
    throw new Error("Method not implemented.");
  }
  
  async updatePermission(id: number, permissionData: any): Promise<Permission> {
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
    try {
      // For development, return an empty array
      // In production, we would fetch the actual permissions from rolePermissions
      return [];
    } catch (error) {
      console.error("Error getting permissions for role:", error);
      return [];
    }
  }
  
  async getRolesForPermission(permissionId: number): Promise<Role[]> {
    try {
      // For development, return an empty array
      // In production, we would fetch the actual roles from rolePermissions
      return [];
    } catch (error) {
      console.error("Error getting roles for permission:", error);
      return [];
    }
  }
  
  async getUserWithPermissions(userId: number): Promise<{ user: User; role: Role; permissions: Permission[] }> {
    try {
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
      
      // Get permissions for that role
      const permissions = await this.getPermissionsForRole(role.id);
      
      return { user, role, permissions };
    } catch (error) {
      console.error("Error getting user with permissions:", error);
      throw error;
    }
  }
  
  async hasPermission(userId: number, resource: string, action: string): Promise<boolean> {
    try {
      // For testing purposes during development, we'll allow access
      // In a production environment, you would implement proper permission checking
      return true;
      
      // When implementing proper permission checking, uncomment this code:
      /*
      const { permissions } = await this.getUserWithPermissions(userId);
      
      // Check if the user has the required permission
      return permissions.some(
        permission => 
          permission.resource === resource && 
          (permission.action === action || permission.action === 'manage')
      );
      */
    } catch (error) {
      console.error("Error checking permissions:", error);
      return false;
    }
  }
  
  async getAllProjects(category?: string): Promise<Project[]> {
    try {
      let projectsRef = this.db.collection('projects');
      
      // Apply category filter if provided
      if (category) {
        projectsRef = projectsRef.where('category', '==', category);
      }
      
      const snapshot = await projectsRef.get();
      
      if (snapshot.empty) {
        return [];
      }
      
      return snapshot.docs.map((doc: any) => doc.data() as Project);
    } catch (error) {
      console.error("Error getting projects from Firestore:", error);
      throw error;
    }
  }
  
  async getProject(id: number): Promise<Project | undefined> {
    try {
      const projectRef = this.db.collection('projects').where('id', '==', id);
      const snapshot = await projectRef.get();
      
      if (snapshot.empty) {
        return undefined;
      }
      
      const projectData = snapshot.docs[0].data();
      return projectData as Project;
    } catch (error) {
      console.error("Error getting project from Firestore:", error);
      throw error;
    }
  }
  
  async getProjectsForClient(clientId: number): Promise<Project[]> {
    try {
      const projectsRef = this.db.collection('projects').where('clientId', '==', clientId);
      const snapshot = await projectsRef.get();
      
      if (snapshot.empty) {
        return [];
      }
      
      return snapshot.docs.map((doc: any) => doc.data() as Project);
    } catch (error) {
      console.error("Error getting client projects from Firestore:", error);
      throw error;
    }
  }
  
  async createProject(project: any): Promise<Project> {
    try {
      // Generate a unique ID and set defaults
      const newProject = {
        ...project,
        id: Date.now(),
        startDate: project.startDate || new Date(),
        endDate: project.endDate || null,
        status: project.status || "Not Started"
      };
      
      await this.db.collection('projects').add(newProject);
      
      return newProject as Project;
    } catch (error) {
      console.error("Error creating project in Firestore:", error);
      throw error;
    }
  }
  
  async updateProject(id: number, projectData: any): Promise<Project> {
    try {
      const projectRef = this.db.collection('projects').where('id', '==', id);
      const snapshot = await projectRef.get();
      
      if (snapshot.empty) {
        throw new Error(`Project with ID ${id} not found`);
      }
      
      const docId = snapshot.docs[0].id;
      const currentProject = snapshot.docs[0].data();
      const updatedProject = {
        ...currentProject,
        ...projectData
      };
      
      await this.db.collection('projects').doc(docId).update(updatedProject);
      
      return updatedProject as Project;
    } catch (error) {
      console.error("Error updating project in Firestore:", error);
      throw error;
    }
  }
  
  async getAllTestimonials(): Promise<Testimonial[]> {
    try {
      const testimonialsRef = this.db.collection('testimonials');
      const snapshot = await testimonialsRef.get();
      
      if (snapshot.empty) {
        return [];
      }
      
      return snapshot.docs.map((doc: any) => doc.data() as Testimonial);
    } catch (error) {
      console.error("Error getting testimonials from Firestore:", error);
      throw error;
    }
  }
  
  async createTestimonial(testimonial: any): Promise<Testimonial> {
    try {
      // Generate a unique ID and set defaults
      const newTestimonial = {
        ...testimonial,
        id: Date.now(),
        isActive: testimonial.isActive !== undefined ? testimonial.isActive : true,
        profilePicture: testimonial.profilePicture || null
      };
      
      await this.db.collection('testimonials').add(newTestimonial);
      
      return newTestimonial as Testimonial;
    } catch (error) {
      console.error("Error creating testimonial in Firestore:", error);
      throw error;
    }
  }
  
  async getAllServices(): Promise<Service[]> {
    try {
      const servicesRef = this.db.collection('services');
      const snapshot = await servicesRef.get();
      
      if (snapshot.empty) {
        return [];
      }
      
      return snapshot.docs.map((doc: any) => doc.data() as Service);
    } catch (error) {
      console.error("Error getting services from Firestore:", error);
      throw error;
    }
  }
  
  async getService(id: number): Promise<Service | undefined> {
    try {
      const serviceRef = this.db.collection('services').where('id', '==', id);
      const snapshot = await serviceRef.get();
      
      if (snapshot.empty) {
        return undefined;
      }
      
      const serviceData = snapshot.docs[0].data();
      return serviceData as Service;
    } catch (error) {
      console.error("Error getting service from Firestore:", error);
      throw error;
    }
  }
  
  async createService(service: any): Promise<Service> {
    try {
      // Generate a unique ID and set defaults
      const newService = {
        ...service,
        id: Date.now(),
        isActive: service.isActive !== undefined ? service.isActive : true,
      };
      
      await this.db.collection('services').add(newService);
      
      return newService as Service;
    } catch (error) {
      console.error("Error creating service in Firestore:", error);
      throw error;
    }
  }
  
  async getAllBlogPosts(category?: string): Promise<BlogPost[]> {
    try {
      let blogPostsRef = this.db.collection('blogPosts');
      
      // Apply category filter if provided
      if (category) {
        blogPostsRef = blogPostsRef.where('category', '==', category);
      }
      
      const snapshot = await blogPostsRef.get();
      
      if (snapshot.empty) {
        return [];
      }
      
      return snapshot.docs.map((doc: any) => doc.data() as BlogPost);
    } catch (error) {
      console.error("Error getting blog posts from Firestore:", error);
      throw error;
    }
  }
  
  async getBlogPost(id: number): Promise<BlogPost | undefined> {
    try {
      const blogPostRef = this.db.collection('blogPosts').where('id', '==', id);
      const snapshot = await blogPostRef.get();
      
      if (snapshot.empty) {
        return undefined;
      }
      
      const blogPostData = snapshot.docs[0].data();
      return blogPostData as BlogPost;
    } catch (error) {
      console.error("Error getting blog post from Firestore:", error);
      throw error;
    }
  }
  
  async createBlogPost(blogPost: any): Promise<BlogPost> {
    try {
      // Generate a unique ID and set defaults
      const newBlogPost = {
        ...blogPost,
        id: Date.now(),
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: blogPost.tags || null,
        isPublished: blogPost.isPublished !== undefined ? blogPost.isPublished : false
      };
      
      await this.db.collection('blogPosts').add(newBlogPost);
      
      return newBlogPost as BlogPost;
    } catch (error) {
      console.error("Error creating blog post in Firestore:", error);
      throw error;
    }
  }
  
  async saveContactMessage(message: any): Promise<ContactMessage> {
    try {
      // Generate a unique ID and set defaults
      const newMessage = {
        ...message,
        id: Date.now(),
        createdAt: new Date(),
        isResolved: false,
        phone: message.phone || null
      };
      
      await this.db.collection('contactMessages').add(newMessage);
      
      return newMessage as ContactMessage;
    } catch (error) {
      console.error("Error saving contact message in Firestore:", error);
      throw error;
    }
  }
  
  async addNewsletterSubscriber(subscriber: any): Promise<NewsletterSubscriber> {
    try {
      // Generate a unique ID and set defaults
      const newSubscriber = {
        ...subscriber,
        id: Date.now(),
        subscriptionDate: new Date(),
        isActive: true,
        name: subscriber.name || null
      };
      
      await this.db.collection('newsletterSubscribers').add(newSubscriber);
      
      return newSubscriber as NewsletterSubscriber;
    } catch (error) {
      console.error("Error adding newsletter subscriber in Firestore:", error);
      throw error;
    }
  }
  
  async getAllJobs(): Promise<Job[]> {
    try {
      const jobsRef = this.db.collection('jobs');
      const snapshot = await jobsRef.get();
      
      if (snapshot.empty) {
        return [];
      }
      
      return snapshot.docs.map((doc: any) => doc.data() as Job);
    } catch (error) {
      console.error("Error getting jobs from Firestore:", error);
      throw error;
    }
  }
  
  async getJob(id: number): Promise<Job | undefined> {
    try {
      const jobRef = this.db.collection('jobs').where('id', '==', id);
      const snapshot = await jobRef.get();
      
      if (snapshot.empty) {
        return undefined;
      }
      
      const jobData = snapshot.docs[0].data();
      return jobData as Job;
    } catch (error) {
      console.error("Error getting job from Firestore:", error);
      throw error;
    }
  }
  
  async createJob(job: any): Promise<Job> {
    try {
      // Generate a unique ID and set defaults
      const newJob = {
        ...job,
        id: Date.now(),
        postedDate: job.postedDate || new Date(),
        isActive: job.isActive !== undefined ? job.isActive : true
      };
      
      await this.db.collection('jobs').add(newJob);
      
      return newJob as Job;
    } catch (error) {
      console.error("Error creating job in Firestore:", error);
      throw error;
    }
  }
}