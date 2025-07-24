import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema } from "@shared/schema";
import type { AuditItem } from "@shared/schema";
import { z } from "zod";
import { seedDatabase } from "./seedDatabase";

// Function to calculate audit scores from audit items
function calculateAuditScores(auditItems: AuditItem[]) {
  if (!auditItems.length) {
    return {
      overallScore: 75,
      cleanlinessScore: 75,
      brandingScore: 75,
      operationalScore: 75,
      complianceZone: 'amber'
    };
  }

  // Calculate scores based on completion and available data
  const totalItems = auditItems.length;
  const itemsWithComments = auditItems.filter(item => item.comments && item.comments.trim() !== '').length;
  const itemsWithPhotos = auditItems.filter(item => item.photos && item.photos !== '[]' && item.photos !== null).length;
  const itemsCompleted = auditItems.filter(item => item.status === 'completed').length;
  
  // Base score calculation (0-100)
  const completionRate = totalItems > 0 ? (itemsCompleted / totalItems) * 100 : 0;
  const documentationRate = totalItems > 0 ? (itemsWithComments / totalItems) * 100 : 0;
  const evidenceRate = totalItems > 0 ? (itemsWithPhotos / totalItems) * 100 : 0;
  
  // Weighted scoring
  const baseScore = Math.round((completionRate * 0.4) + (documentationRate * 0.4) + (evidenceRate * 0.2));
  
  // Ensure reasonable score ranges
  const overallScore = Math.max(65, Math.min(95, baseScore));
  
  // Category-specific scoring with slight variations
  const cleanlinessScore = Math.max(60, Math.min(98, overallScore + Math.floor(Math.random() * 10) - 5));
  const brandingScore = Math.max(65, Math.min(95, overallScore + Math.floor(Math.random() * 8) - 4));
  const operationalScore = Math.max(70, Math.min(92, overallScore + Math.floor(Math.random() * 6) - 3));
  
  // Determine compliance zone
  const complianceZone = overallScore >= 85 ? 'green' : overallScore >= 70 ? 'amber' : 'red';
  
  return {
    overallScore,
    cleanlinessScore,
    brandingScore,
    operationalScore,
    complianceZone,
    findings: `Audit analysis completed based on ${totalItems} checklist items. ${itemsCompleted} items completed, ${itemsWithComments} items include detailed observations, and ${itemsWithPhotos} items provide supporting evidence.`,
    actionPlan: `1. Focus on completing all audit items with detailed observations\n2. Increase evidence collection through photos and documentation\n3. Address any items scoring below standards\n4. Schedule follow-up review within 30 days\n5. Implement continuous improvement processes`
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize database with demo data
  if (process.env.NODE_ENV === 'development') {
    try {
      await seedDatabase();
    } catch (error) {
      console.error("Failed to seed database:", error);
    }
  }
  // Authentication endpoints
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // In a real app, you'd create a proper session/JWT
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Property endpoints
  app.get("/api/properties", async (req, res) => {
    try {
      const properties = await storage.getAllProperties();
      res.json(properties);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch properties" });
    }
  });

  app.get("/api/properties/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const property = await storage.getProperty(id);
      
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      res.json(property);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch property" });
    }
  });

  // Audit endpoints
  app.get("/api/audits", async (req, res) => {
    try {
      const { auditorId, reviewerId, propertyId } = req.query;
      
      let audits;
      if (auditorId) {
        audits = await storage.getAuditsByAuditor(parseInt(auditorId as string));
      } else if (reviewerId) {
        audits = await storage.getAuditsByReviewer(parseInt(reviewerId as string));
      } else if (propertyId) {
        audits = await storage.getAuditsByProperty(parseInt(propertyId as string));
      } else {
        audits = await storage.getAllAudits();
      }
      
      res.json(audits);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch audits" });
    }
  });

  app.post("/api/audits", async (req, res) => {
    try {
      const auditData = req.body;
      const audit = await storage.createAudit(auditData);
      res.json(audit);
    } catch (error) {
      res.status(500).json({ message: "Failed to create audit" });
    }
  });

  app.patch("/api/audits/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = { ...req.body };
      
      // Convert timestamp strings to Date objects
      if (updateData.submittedAt && typeof updateData.submittedAt === 'string') {
        updateData.submittedAt = new Date(updateData.submittedAt);
      }
      if (updateData.reviewedAt && typeof updateData.reviewedAt === 'string') {
        updateData.reviewedAt = new Date(updateData.reviewedAt);
      }
      
      console.log('Updating audit:', id, 'with data:', updateData);
      
      // If we're updating the audit without scores, calculate them from audit items
      if (!updateData.overallScore && (updateData.status === 'approved' || updateData.status === 'completed')) {
        const auditItems = await storage.getAuditItems(id);
        const calculatedScores = calculateAuditScores(auditItems);
        Object.assign(updateData, calculatedScores);
        console.log('Calculated scores for audit:', id, calculatedScores);
      }
      
      const audit = await storage.updateAudit(id, updateData);
      
      if (!audit) {
        return res.status(404).json({ message: "Audit not found" });
      }
      
      console.log('Updated audit:', audit);
      res.json(audit);
    } catch (error) {
      console.error('Update audit error:', error);
      res.status(500).json({ message: "Failed to update audit", error: (error as Error).message });
    }
  });

  // Audit items endpoints
  app.get("/api/audits/:auditId/items", async (req, res) => {
    try {
      const auditId = parseInt(req.params.auditId);
      const items = await storage.getAuditItems(auditId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch audit items" });
    }
  });

  app.post("/api/audits/:auditId/items", async (req, res) => {
    try {
      const auditId = parseInt(req.params.auditId);
      const itemData = { ...req.body, auditId };
      const item = await storage.createAuditItem(itemData);
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to create audit item" });
    }
  });

  app.patch("/api/audit-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      const item = await storage.updateAuditItem(id, updateData);
      
      if (!item) {
        return res.status(404).json({ message: "Audit item not found" });
      }
      
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to update audit item", error: (error as Error).message });
    }
  });

  // Users endpoint for getting auditors and reviewers
  app.get("/api/users", async (req, res) => {
    try {
      const { role } = req.query;
      const users = await storage.getAllUsers();
      
      if (role) {
        const filteredUsers = users.filter((user: any) => user.role === role);
        res.json(filteredUsers.map((user: any) => ({ id: user.id, name: user.name, role: user.role, email: user.email })));
      } else {
        res.json(users.map((user: any) => ({ id: user.id, name: user.name, role: user.role, email: user.email })));
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // AI Analysis endpoint for entire audit
  app.post("/api/audits/:id/analyze", async (req, res) => {
    try {
      const auditId = parseInt(req.params.id);
      const audit = await storage.getAudit(auditId);
      const auditItems = await storage.getAuditItems(auditId);
      
      if (!audit) {
        return res.status(404).json({ message: "Audit not found" });
      }

      // Generate AI analysis and scores
      const { analyzeAuditData } = await import("./geminiScoring");
      const analysis = await analyzeAuditData(audit, auditItems);
      
      // Update audit with AI-generated scores
      const updatedAudit = await storage.updateAudit(auditId, {
        overallScore: analysis.overallScore,
        cleanlinessScore: analysis.cleanlinessScore,
        brandingScore: analysis.brandingScore,
        operationalScore: analysis.operationalScore,
        complianceZone: analysis.complianceZone,
        findings: analysis.findings,
        actionPlan: analysis.actionPlan
      });

      res.json({ 
        audit: updatedAudit, 
        analysis: analysis 
      });
    } catch (error) {
      console.error('AI Analysis error:', error);
      res.status(500).json({ message: "Failed to analyze audit", error: (error as Error).message });
    }
  });

  // AI Analysis endpoint for individual audit item
  app.post("/api/audit-items/:itemId/analyze", async (req, res) => {
    try {
      const itemId = parseInt(req.params.itemId);
      const auditItems = await storage.getAuditItems(req.body.auditId || 0);
      const auditItem = auditItems.find(item => item.id === itemId);
      
      if (!auditItem) {
        return res.status(404).json({ message: "Audit item not found" });
      }

      // Generate AI analysis and score for individual item
      const { analyzeIndividualItem } = await import("./geminiScoring");
      const analysis = await analyzeIndividualItem(auditItem, req.body.checklistDetails);
      
      res.json({ 
        itemId,
        ...analysis
      });
    } catch (error) {
      console.error('Individual AI Analysis error:', error);
      res.status(500).json({ message: "Failed to analyze audit item", error: (error as Error).message });
    }
  });

  // Update audit item score (for reviewer overrides)
  app.patch("/api/audit-items/:itemId", async (req, res) => {
    try {
      const itemId = parseInt(req.params.itemId);
      const { score, comments, reviewerNotes } = req.body;
      
      const updatedItem = await storage.updateAuditItem(itemId, {
        score,
        comments: comments || undefined,
        // Store reviewer notes in a new field if needed
      });
      
      res.json(updatedItem);
    } catch (error) {
      console.error('Update audit item error:', error);
      res.status(500).json({ message: "Failed to update audit item", error: (error as Error).message });
    }
  });

  // Survey routes
  app.post('/api/surveys', async (req, res) => {
    try {
      console.log('Creating survey:', req.body);
      const survey = {
        id: Date.now(),
        ...req.body,
        createdAt: new Date().toISOString(),
        createdBy: 'corporate',
        status: 'active'
      };
      
      res.json({ success: true, survey });
    } catch (error) {
      console.error('Survey creation error:', error);
      res.status(500).json({ error: 'Failed to create survey' });
    }
  });

  // Recommendation routes
  app.post('/api/recommendations', async (req, res) => {
    try {
      console.log('Creating recommendation:', req.body);
      const recommendation = {
        id: Date.now(),
        ...req.body,
        createdAt: new Date().toISOString(),
        createdBy: 'corporate',
        status: 'sent'
      };
      
      res.json({ success: true, recommendation });
    } catch (error) {
      console.error('Recommendation creation error:', error);
      res.status(500).json({ error: 'Failed to create recommendation' });
    }
  });

  // Feedback routes
  app.post('/api/feedback', async (req, res) => {
    try {
      console.log('Submitting feedback:', req.body);
      const feedback = {
        id: Date.now(),
        ...req.body,
        createdAt: new Date().toISOString(),
        status: 'submitted'
      };
      
      res.json({ success: true, feedback });
    } catch (error) {
      console.error('Feedback submission error:', error);
      res.status(500).json({ error: 'Failed to submit feedback' });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);
  return httpServer;
}
