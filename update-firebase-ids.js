// Simple script to update Firebase IDs to sequential format
import { updateFirebaseIds } from './server/update-id-schema.js';

console.log('Starting Firebase ID update process...');

updateFirebaseIds()
  .then(result => {
    if (result) {
      console.log('Firebase IDs updated successfully to sequential format');
      console.log('ID Ranges:');
      console.log('- Projects: Starting at 500');
      console.log('- Clients: Starting at 2000');
      console.log('- Roles: Starting at 1000');
      console.log('- Services: Starting at 3000');
      console.log('- Testimonials: Starting at 4000');
      console.log('- Blog Posts: Starting at 5000');
    } else {
      console.log('Failed to update Firebase IDs');
    }
    process.exit(0);
  })
  .catch(error => {
    console.error('Error updating Firebase IDs:', error);
    process.exit(1);
  });