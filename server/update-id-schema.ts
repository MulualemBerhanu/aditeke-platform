import { getFirestoreDb } from './firebase-admin';
import { log } from './vite';

/**
 * Update database IDs to sequential pattern:
 * - Projects: Starting at 500
 * - Clients: Starting at 2000
 * - Managers: Starting at 50000
 * - Admins: Starting at 60000
 * - Roles: Starting at 1000
 * - Services: Starting at 3000
 * - Testimonials: Starting at 4000
 * - Blog Posts: Starting at 5000
 */
export async function updateFirebaseIds() {
  try {
    const db = getFirestoreDb();
    log("Starting database ID schema update...");

    // Update projects (start at 500)
    await updateCollectionIds(db, 'projects', 500);
    
    // Update users with client role (start at 2000)
    await updateClientIds(db, 2000);
    
    // Update users with manager role (start at 50000)
    await updateManagerIds(db, 50000);
    
    // Update users with admin role (start at 60000)
    await updateAdminIds(db, 60000);
    
    // Update roles (start at 1000)
    await updateCollectionIds(db, 'roles', 1000);
    
    // Update services (start at 3000)
    await updateCollectionIds(db, 'services', 3000);
    
    // Update testimonials (start at 4000)
    await updateCollectionIds(db, 'testimonials', 4000);
    
    // Update blog posts (start at 5000)
    await updateCollectionIds(db, 'blog_posts', 5000);
    
    log("Database ID schema update completed successfully!");
    return true;
  } catch (error) {
    log(`Error updating database ID schema: ${error}`);
    return false;
  }
}

/**
 * Generic function to update IDs for a collection
 */
async function updateCollectionIds(db: any, collectionName: string, startId: number) {
  const snapshot = await db.collection(collectionName).get();
  if (snapshot.empty) {
    log(`No documents found in ${collectionName} collection`);
    return;
  }
  
  log(`Updating ${snapshot.size} documents in ${collectionName} collection...`);
  
  let currentId = startId;
  const batch = db.batch();
  const updates: { [key: string]: number } = {};
  
  snapshot.forEach((doc: any) => {
    const data = doc.data();
    const oldId = data.id;
    const newId = currentId++;
    
    // Store mapping of old to new IDs for relationship updates
    updates[oldId] = newId;
    
    // Create new document with updated ID
    const updatedData = { ...data, id: newId };
    batch.set(doc.ref, updatedData);
    
    log(`Updated ${collectionName} ID: ${oldId} -> ${newId}`);
  });
  
  await batch.commit();
  log(`Successfully updated ${snapshot.size} documents in ${collectionName} collection`);
  
  return updates;
}

/**
 * Specialized function to update client user IDs
 */
async function updateClientIds(db: any, startId: number) {
  // First get the client role ID
  const roleSnapshot = await db.collection('roles').where('name', '==', 'client').get();
  if (roleSnapshot.empty) {
    log('Client role not found');
    return;
  }
  
  const clientRoleId = roleSnapshot.docs[0].data().id;
  log(`Found client role with ID: ${clientRoleId}`);
  
  // Get all users with client role
  const snapshot = await db.collection('users').where('roleId', '==', clientRoleId).get();
  if (snapshot.empty) {
    log('No client users found');
    return;
  }
  
  log(`Updating ${snapshot.size} client users...`);
  
  let currentId = startId;
  const batch = db.batch();
  const updates: { [key: string]: number } = {};
  
  snapshot.forEach((doc: any) => {
    const data = doc.data();
    const oldId = data.id;
    const newId = currentId++;
    
    // Store mapping of old to new IDs
    updates[oldId] = newId;
    
    // Create new document with updated ID
    const updatedData = { ...data, id: newId };
    batch.set(doc.ref, updatedData);
    
    log(`Updated client user ID: ${oldId} -> ${newId}`);
  });
  
  await batch.commit();
  log(`Successfully updated ${snapshot.size} client users`);
  
  // Now update project references to client IDs
  await updateClientReferences(db, updates);
  
  return updates;
}

/**
 * Specialized function to update manager user IDs
 */
async function updateManagerIds(db: any, startId: number) {
  // First get the manager role ID
  const roleSnapshot = await db.collection('roles').where('name', '==', 'manager').get();
  if (roleSnapshot.empty) {
    log('Manager role not found');
    return;
  }
  
  const managerRoleId = roleSnapshot.docs[0].data().id;
  log(`Found manager role with ID: ${managerRoleId}`);
  
  // Get all users with manager role
  const snapshot = await db.collection('users').where('roleId', '==', managerRoleId).get();
  if (snapshot.empty) {
    log('No manager users found');
    return;
  }
  
  log(`Updating ${snapshot.size} manager users...`);
  
  let currentId = startId;
  const batch = db.batch();
  const updates: { [key: string]: number } = {};
  
  snapshot.forEach((doc: any) => {
    const data = doc.data();
    const oldId = data.id;
    const newId = currentId++;
    
    // Store mapping of old to new IDs
    updates[oldId] = newId;
    
    // Create new document with updated ID
    const updatedData = { ...data, id: newId };
    batch.set(doc.ref, updatedData);
    
    log(`Updated manager user ID: ${oldId} -> ${newId}`);
  });
  
  await batch.commit();
  log(`Successfully updated ${snapshot.size} manager users`);
  
  return updates;
}

/**
 * Specialized function to update admin user IDs
 */
async function updateAdminIds(db: any, startId: number) {
  // First get the admin role ID
  const roleSnapshot = await db.collection('roles').where('name', '==', 'admin').get();
  if (roleSnapshot.empty) {
    log('Admin role not found');
    return;
  }
  
  const adminRoleId = roleSnapshot.docs[0].data().id;
  log(`Found admin role with ID: ${adminRoleId}`);
  
  // Get all users with admin role
  const snapshot = await db.collection('users').where('roleId', '==', adminRoleId).get();
  if (snapshot.empty) {
    log('No admin users found');
    return;
  }
  
  log(`Updating ${snapshot.size} admin users...`);
  
  let currentId = startId;
  const batch = db.batch();
  const updates: { [key: string]: number } = {};
  
  snapshot.forEach((doc: any) => {
    const data = doc.data();
    const oldId = data.id;
    const newId = currentId++;
    
    // Store mapping of old to new IDs
    updates[oldId] = newId;
    
    // Create new document with updated ID
    const updatedData = { ...data, id: newId };
    batch.set(doc.ref, updatedData);
    
    log(`Updated admin user ID: ${oldId} -> ${newId}`);
  });
  
  await batch.commit();
  log(`Successfully updated ${snapshot.size} admin users`);
  
  return updates;
}

/**
 * Update project references to client IDs
 */
async function updateClientReferences(db: any, clientIdUpdates: { [key: string]: number }) {
  const projectsSnapshot = await db.collection('projects').get();
  if (projectsSnapshot.empty) {
    log('No projects found to update client references');
    return;
  }
  
  log(`Checking ${projectsSnapshot.size} projects for client references...`);
  
  const batch = db.batch();
  let updatedCount = 0;
  
  projectsSnapshot.forEach((doc: any) => {
    const data = doc.data();
    const oldClientId = data.clientId;
    
    if (oldClientId && clientIdUpdates[oldClientId]) {
      const newClientId = clientIdUpdates[oldClientId];
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
}