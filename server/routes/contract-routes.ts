/**
 * Contract management routes
 * Handles creating, viewing, and signing contracts
 */

import { Router } from "express";
import { db } from "../db";
import { clientContracts, clientDocuments } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// Create a router instance
const router = Router();

/**
 * Get all contracts for a client
 * GET /api/contracts/client/:clientId
 */
router.get("/contracts/client/:clientId", async (req, res) => {
  // Check authentication
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const clientId = parseInt(req.params.clientId);
    if (isNaN(clientId)) {
      return res.status(400).json({ error: "Invalid client ID" });
    }

    // Only allow managers/admins or the client themselves to view their contracts
    const userRole = req.user?.roleId;
    const userId = req.user?.id;
    
    if (userRole !== 1000 && userRole !== 1002 && userId !== clientId) {
      return res.status(403).json({ error: "Forbidden: Insufficient permissions" });
    }

    // Get all contracts for this client, ordered by most recent first
    const contracts = await db.select()
      .from(clientContracts)
      .where(eq(clientContracts.clientId, clientId))
      .orderBy(desc(clientContracts.createdAt));

    return res.status(200).json(contracts);
  } catch (error) {
    console.error("Error fetching client contracts:", error);
    return res.status(500).json({ error: "Failed to fetch contracts" });
  }
});

/**
 * Get a specific contract by ID
 * GET /api/contracts/:id
 */
router.get("/contracts/:id", async (req, res) => {
  // Check authentication
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const contractId = parseInt(req.params.id);
    if (isNaN(contractId)) {
      return res.status(400).json({ error: "Invalid contract ID" });
    }

    // Get the contract
    const [contract] = await db.select()
      .from(clientContracts)
      .where(eq(clientContracts.id, contractId));

    if (!contract) {
      return res.status(404).json({ error: "Contract not found" });
    }

    // Check permissions - only the client, managers, or admins can view contracts
    const userRole = req.user?.roleId;
    const userId = req.user?.id;
    
    if (userRole !== 1000 && userRole !== 1002 && userId !== contract.clientId) {
      return res.status(403).json({ error: "Forbidden: Insufficient permissions" });
    }

    return res.status(200).json(contract);
  } catch (error) {
    console.error("Error fetching contract:", error);
    return res.status(500).json({ error: "Failed to fetch contract" });
  }
});

/**
 * Sign a contract
 * POST /api/contracts/:id/sign
 */
router.post("/contracts/:id/sign", async (req, res) => {
  // Check authentication
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const contractId = parseInt(req.params.id);
    if (isNaN(contractId)) {
      return res.status(400).json({ error: "Invalid contract ID" });
    }

    // Get the contract
    const [contract] = await db.select()
      .from(clientContracts)
      .where(eq(clientContracts.id, contractId));

    if (!contract) {
      return res.status(404).json({ error: "Contract not found" });
    }

    // Verify that the authenticated user is the client who owns this contract
    if (req.user?.id !== contract.clientId) {
      return res.status(403).json({ error: "Forbidden: Only the contract owner can sign" });
    }

    // Validate request body
    const signatureSchema = z.object({
      signatureData: z.string().min(1), // Base64 encoded signature image
    });

    const { signatureData } = signatureSchema.parse(req.body);

    // Update the contract
    const [updatedContract] = await db.update(clientContracts)
      .set({
        status: "signed",
        signedAt: new Date(),
        signatureData,
        ipAddress: req.ip || "Unknown",
        updatedAt: new Date(),
      })
      .where(eq(clientContracts.id, contractId))
      .returning();

    // Generate a signed PDF version (optional implementation)
    // This would create a PDF with the contract content and signature

    return res.status(200).json({
      message: "Contract signed successfully",
      contract: updatedContract,
    });
  } catch (error) {
    console.error("Error signing contract:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: "Failed to sign contract" });
  }
});

/**
 * Create a new contract for a client
 * POST /api/contracts
 * (Manager/Admin only)
 */
router.post("/contracts", async (req, res) => {
  // Check authentication and authorization
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Only managers and admins can create contracts
  const userRole = req.user?.roleId;
  if (userRole !== 1000 && userRole !== 1002) {
    return res.status(403).json({ error: "Forbidden: Insufficient permissions" });
  }

  try {
    // Validate request body
    const contractSchema = z.object({
      clientId: z.number(),
      title: z.string().min(1),
      content: z.string().min(1),
      expiresAt: z.string().optional(),
      projectId: z.number().optional(),
      version: z.string().optional(),
      metadata: z.record(z.any()).optional(),
    });

    const contractData = contractSchema.parse(req.body);

    // Create the contract
    const [newContract] = await db.insert(clientContracts)
      .values({
        clientId: contractData.clientId,
        title: contractData.title,
        content: contractData.content,
        status: "pending",
        expiresAt: contractData.expiresAt ? new Date(contractData.expiresAt) : undefined,
        version: contractData.version || "1.0",
        metadata: contractData.metadata || {},
        projectId: contractData.projectId,
        createdAt: new Date(),
      })
      .returning();

    return res.status(201).json(newContract);
  } catch (error) {
    console.error("Error creating contract:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: "Failed to create contract" });
  }
});

/**
 * Generate a PDF version of a contract
 * GET /api/contracts/:id/pdf
 */
router.get("/contracts/:id/pdf", async (req, res) => {
  // Check authentication
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const contractId = parseInt(req.params.id);
    if (isNaN(contractId)) {
      return res.status(400).json({ error: "Invalid contract ID" });
    }

    // Get the contract
    const [contract] = await db.select()
      .from(clientContracts)
      .where(eq(clientContracts.id, contractId));

    if (!contract) {
      return res.status(404).json({ error: "Contract not found" });
    }

    // Check permissions - only the client, managers, or admins can view contracts
    const userRole = req.user?.roleId;
    const userId = req.user?.id;
    
    if (userRole !== 1000 && userRole !== 1002 && userId !== contract.clientId) {
      return res.status(403).json({ error: "Forbidden: Insufficient permissions" });
    }

    // Create a PDF document
    const doc = new PDFDocument({ margin: 50 });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=contract-${contractId}.pdf`);
    
    // Pipe PDF to response
    doc.pipe(res);
    
    // Add contract content
    doc.fontSize(25).text(contract.title, { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(contract.content);
    
    // Add signature if contract is signed
    if (contract.status === 'signed' && contract.signatureData) {
      doc.moveDown();
      doc.fontSize(14).text('Signed:', { underline: true });
      doc.moveDown(0.5);
      
      // Convert base64 signature to image
      if (contract.signatureData.startsWith('data:image')) {
        try {
          const base64Data = contract.signatureData.split(',')[1];
          const signatureBuffer = Buffer.from(base64Data, 'base64');
          
          // Create a temporary file
          const tempFilePath = path.join(__dirname, '..', '..', 'temp', `sig-${uuidv4()}.png`);
          
          // Ensure temp directory exists
          if (!fs.existsSync(path.join(__dirname, '..', '..', 'temp'))) {
            fs.mkdirSync(path.join(__dirname, '..', '..', 'temp'), { recursive: true });
          }
          
          fs.writeFileSync(tempFilePath, signatureBuffer);
          
          // Add image to PDF
          doc.image(tempFilePath, {
            fit: [250, 100],
            align: 'center'
          });
          
          // Clean up temp file after use
          setTimeout(() => {
            try {
              fs.unlinkSync(tempFilePath);
            } catch (e) {
              console.error('Failed to delete temp signature file:', e);
            }
          }, 5000);
        } catch (error) {
          console.error('Error processing signature:', error);
          doc.text('Signature available but could not be rendered');
        }
      } else {
        doc.text('Digitally signed');
      }
      
      doc.moveDown();
      doc.fontSize(10).text(`Signed on: ${contract.signedAt?.toLocaleString()}`);
      doc.fontSize(10).text(`IP Address: ${contract.ipAddress || 'Unknown'}`);
    }
    
    // Finalize PDF
    doc.end();
  } catch (error) {
    console.error("Error generating contract PDF:", error);
    return res.status(500).json({ error: "Failed to generate PDF" });
  }
});

export default router;