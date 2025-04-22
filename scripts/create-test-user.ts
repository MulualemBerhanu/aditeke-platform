import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import postgres from "postgres";
import dotenv from "dotenv";

dotenv.config();

// Password hashing function
async function hashPassword(password: string) {
  const scryptAsync = promisify(scrypt);
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function createTestUser() {
  // Create PostgreSQL client
  const client = postgres(process.env.DATABASE_URL!);
  
  try {
    // Create a test user with manager role
    const hashedPassword = await hashPassword("manager2pass");
    console.log("Generated hashed password:", hashedPassword);
    
    const result = await client`
      INSERT INTO users (
        username, 
        email, 
        password, 
        name, 
        role_id, 
        created_at
      ) VALUES (
        'manager2', 
        'manager2@aditeke.com', 
        ${hashedPassword}, 
        'Second Manager', 
        1000, 
        NOW()
      ) RETURNING id, username, email, name, role_id
    `;
    
    console.log("Created user:", result[0]);
  } catch (error) {
    console.error("Error creating test user:", error);
  } finally {
    // Close the client
    await client.end();
  }
}

createTestUser().catch(console.error);