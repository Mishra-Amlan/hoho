import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";
import { seedDatabase } from "./seedDatabase";

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
      
      const audit = await storage.updateAudit(id, updateData);
      
      if (!audit) {
        return res.status(404).json({ message: "Audit not found" });
      }
      
      console.log('Updated audit:', audit);
      res.json(audit);
    } catch (error) {
      console.error('Update audit error:', error);
      res.status(500).json({ message: "Failed to update audit", error: error.message });
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
      res.status(500).json({ message: "Failed to update audit item" });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);
  return httpServer;
}
