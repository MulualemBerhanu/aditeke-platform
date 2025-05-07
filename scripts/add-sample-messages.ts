// Script to add sample message data for testing
import { db } from '../server/db';
import { clientCommunications } from '../shared/schema';

async function addSampleMessages() {
  try {
    console.log('Adding sample client communications...');
    
    // We'll use these existing users from the database:
    // Client: ID 2000 (client@example.com)
    // Manager: ID 50000 (manager@aditeke.com)
    const clientId = 2000;
    const managerId = 50000;
    
    // Sample messages between client and manager
    const messages = [
      {
        clientId: clientId,
        managerId: managerId,
        message: "Hello, I need some help with my current project. Can we schedule a call to discuss the requirements?",
        subject: "Project Requirements Discussion",
        type: "standard",
        isRead: false,
        attachments: {},
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) // 4 days ago
      },
      {
        clientId: clientId,
        managerId: managerId,
        message: "Thank you for your previous help. I've uploaded the specifications document for review. Please let me know if you need anything else.",
        subject: "Updated Specifications Document",
        type: "standard",
        isRead: true,
        attachments: {},
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      },
      {
        clientId: clientId,
        managerId: managerId,
        message: "There's an issue with the latest deployment. Several features are not working as expected. This needs immediate attention.",
        subject: "Urgent: Production Issues",
        type: "urgent",
        isRead: false,
        attachments: {},
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000) // 12 hours ago
      },
      {
        managerId: managerId,
        clientId: clientId,
        message: "I've reviewed your requirements document and have a few questions. Can we meet tomorrow at 2 PM to discuss? I've made some notes in the attached document.",
        subject: "RE: Project Requirements Discussion",
        type: "standard",
        isRead: false,
        attachments: {},
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      },
      {
        managerId: managerId,
        clientId: clientId,
        message: "We're investigating the production issues and should have a fix deployed within the next hour. I'll keep you updated on our progress.",
        subject: "RE: Urgent: Production Issues",
        type: "urgent",
        isRead: false,
        attachments: {},
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000) // 8 hours ago
      }
    ];
    
    // Insert messages into the database
    const result = await db.insert(clientCommunications).values(messages).returning();
    
    console.log(`Successfully added ${result.length} sample messages.`);
    console.log('Sample messages:', result);
  } catch (error) {
    console.error('Error adding sample messages:', error);
  } finally {
    process.exit(0);
  }
}

// Run the function
addSampleMessages();