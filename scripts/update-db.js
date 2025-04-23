import { execSync } from 'child_process';

// Function to run the database initialization
function initializeDatabase() {
  try {
    console.log('Running database initialization...');
    execSync('NODE_ENV=development tsx server/db-init.ts', { stdio: 'inherit' });
    console.log('Database initialization completed successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

// Execute the initialization
initializeDatabase();