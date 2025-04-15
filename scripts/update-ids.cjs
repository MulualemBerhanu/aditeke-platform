#!/usr/bin/env node

const { execSync } = require('child_process');
const https = require('https');
const http = require('http');
const fs = require('fs');

// Configuration for ID ranges
const ID_RANGES = {
  projects: 500,
  clients: 2000,
  roles: 1000,
  services: 3000,
  testimonials: 4000,
  blogPosts: 5000
};

// Firebase admin setup (simplified for script)
let admin;
try {
  admin = require('firebase-admin');
  
  // Check if app is already initialized
  try {
    admin.app();
  } catch (e) {
    // Initialize the app with service account credentials
    // Try to load from environment variables first
    let serviceAccount;
    
    if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      serviceAccount = {
        projectId: process.env.VITE_FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL
      };
    } else {
      // Try to load from a local service account file as fallback
      try {
        serviceAccount = require('../firebase-key.json');
      } catch (err) {
        console.log('No firebase-key.json found, using environment variables only');
      }
    }
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
} catch (error) {
  console.error('Failed to initialize Firebase Admin:', error);
  process.exit(1);
}

// Get Firestore database
const db = admin.firestore();

// Helper function to log with timestamp
function log(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}

// Function to update collection IDs
async function updateCollectionIds(collectionName, startId) {
  log(`Starting update of '${collectionName}' collection with IDs starting at ${startId}`);
  
  try {
    // Get all documents in the collection
    const snapshot = await db.collection(collectionName).get();
    
    if (snapshot.empty) {
      log(`No documents found in '${collectionName}' collection`);
      return {};
    }
    
    log(`Found ${snapshot.size} documents in '${collectionName}' collection`);
    
    // Map of old IDs to new IDs
    const idMap = {};
    let currentId = startId;
    const batch = db.batch();
    
    // Update each document
    snapshot.forEach(doc => {
      const data = doc.data();
      const oldId = data.id;
      const newId = currentId++;
      
      // Store mapping
      idMap[oldId] = newId;
      
      // Update document
      batch.update(doc.ref, { id: newId });
      
      log(`Mapped ID: ${oldId} -> ${newId}`);
    });
    
    // Commit the batch
    await batch.commit();
    log(`Successfully updated ${snapshot.size} documents in '${collectionName}' collection`);
    
    return idMap;
  } catch (error) {
    log(`Error updating '${collectionName}' collection: ${error.message}`);
    throw error;
  }
}

// Function to update client user IDs
async function updateClientIds(startId) {
  log(`Starting update of client user IDs starting at ${startId}`);
  
  try {
    // First get the client role
    const roleSnapshot = await db.collection('roles').where('name', '==', 'client').get();
    
    if (roleSnapshot.empty) {
      log('Client role not found');
      return {};
    }
    
    const clientRole = roleSnapshot.docs[0].data();
    log(`Found client role with ID: ${clientRole.id}`);
    
    // Get all users with client role
    const snapshot = await db.collection('users').where('roleId', '==', clientRole.id).get();
    
    if (snapshot.empty) {
      log('No client users found');
      return {};
    }
    
    log(`Found ${snapshot.size} client users`);
    
    // Map of old IDs to new IDs
    const idMap = {};
    let currentId = startId;
    const batch = db.batch();
    
    // Update each client user
    snapshot.forEach(doc => {
      const data = doc.data();
      const oldId = data.id;
      const newId = currentId++;
      
      // Store mapping
      idMap[oldId] = newId;
      
      // Update document
      batch.update(doc.ref, { id: newId });
      
      log(`Mapped client ID: ${oldId} -> ${newId}`);
    });
    
    // Commit the batch
    await batch.commit();
    log(`Successfully updated ${snapshot.size} client users`);
    
    return idMap;
  } catch (error) {
    log(`Error updating client user IDs: ${error.message}`);
    throw error;
  }
}

// Function to update project references to client IDs
async function updateClientReferences(clientIdMap) {
  log('Updating client references in projects...');
  
  try {
    if (Object.keys(clientIdMap).length === 0) {
      log('No client ID mappings to update');
      return;
    }
    
    // Get all projects
    const snapshot = await db.collection('projects').get();
    
    if (snapshot.empty) {
      log('No projects found');
      return;
    }
    
    log(`Found ${snapshot.size} projects to check for client references`);
    
    let updatedCount = 0;
    const batch = db.batch();
    
    // Check each project for client references
    snapshot.forEach(doc => {
      const data = doc.data();
      const oldClientId = data.clientId;
      
      if (oldClientId && clientIdMap[oldClientId]) {
        const newClientId = clientIdMap[oldClientId];
        batch.update(doc.ref, { clientId: newClientId });
        log(`Updated project (ID: ${data.id}) client reference: ${oldClientId} -> ${newClientId}`);
        updatedCount++;
      }
    });
    
    if (updatedCount > 0) {
      await batch.commit();
      log(`Successfully updated client references in ${updatedCount} projects`);
    } else {
      log('No client references needed updating in projects');
    }
  } catch (error) {
    log(`Error updating client references: ${error.message}`);
    throw error;
  }
}

// Main function to update all IDs
async function updateAllIds() {
  try {
    log('Starting database ID update process');
    
    // Update project IDs
    const projectIdMap = await updateCollectionIds('projects', ID_RANGES.projects);
    
    // Update client user IDs
    const clientIdMap = await updateClientIds(ID_RANGES.clients);
    
    // Update client references in projects
    await updateClientReferences(clientIdMap);
    
    // Update role IDs
    await updateCollectionIds('roles', ID_RANGES.roles);
    
    // Update service IDs
    await updateCollectionIds('services', ID_RANGES.services);
    
    // Update testimonial IDs
    await updateCollectionIds('testimonials', ID_RANGES.testimonials);
    
    // Update blog post IDs
    await updateCollectionIds('blog_posts', ID_RANGES.blogPosts);
    
    log('Database ID schema update completed successfully!');
    return true;
  } catch (error) {
    log(`Error updating database ID schema: ${error.message}`);
    return false;
  } finally {
    // Clean exit - important to terminate the Firebase connection
    process.exit(0);
  }
}

// Run the update
updateAllIds();