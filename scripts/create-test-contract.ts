import { db } from "../server/db";
import { clientContracts } from "../shared/schema";

async function createTestContract() {
  try {
    console.log("Creating test contract...");
    
    // Sample contract data
    const contractData = {
      title: "Software Development Agreement",
      content: `
        <h1>Software Development Agreement</h1>
        <p>This Software Development Agreement (the "Agreement") is entered into as of May 2, 2025 (the "Effective Date") by and between AdiTeke Software Solutions ("Developer") and Client ("Client").</p>
        
        <h2>1. Services</h2>
        <p>Developer agrees to provide software development services (the "Services") to Client as specified in the attached Statement of Work.</p>
        
        <h2>2. Payment</h2>
        <p>Client shall pay Developer for the Services in accordance with the payment schedule specified in the Statement of Work.</p>
        
        <h2>3. Term</h2>
        <p>This Agreement shall commence on the Effective Date and continue until completion of the Services, unless earlier terminated in accordance with this Agreement.</p>
        
        <h2>4. Ownership of Work Product</h2>
        <p>Upon full payment by Client, all work product created by Developer for Client under this Agreement shall be owned by Client.</p>
        
        <h2>5. Confidentiality</h2>
        <p>Each party agrees to maintain the confidentiality of any proprietary information received from the other party.</p>
        
        <h2>6. Warranty</h2>
        <p>Developer warrants that the Services will be performed in a professional manner consistent with industry standards.</p>
        
        <h2>7. Limitation of Liability</h2>
        <p>Developer's liability under this Agreement shall be limited to the amount paid by Client to Developer under this Agreement.</p>
        
        <h2>8. Independent Contractor</h2>
        <p>Developer is an independent contractor and not an employee of Client.</p>
        
        <h2>9. Governing Law</h2>
        <p>This Agreement shall be governed by the laws of the State of Oregon.</p>
        
        <h2>10. Entire Agreement</h2>
        <p>This Agreement constitutes the entire agreement between the parties with respect to the subject matter hereof.</p>
      `,
      clientId: 2000, // Test client ID
      projectId: 502, // Test project ID
      createdById: 1000, // Manager ID
      status: "pending",
      version: "1.0",
      notes: "Please review and sign at your earliest convenience."
    };
    
    // Insert the contract into the database
    const [newContract] = await db
      .insert(clientContracts)
      .values(contractData)
      .returning();
    
    console.log("Test contract created successfully:", newContract);
    return newContract;
  } catch (error) {
    console.error("Error creating test contract:", error);
    throw error;
  }
}

// Execute the function
createTestContract()
  .then(() => {
    console.log("Script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });

export { createTestContract };