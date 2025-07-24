import { 
  users, properties, audits, auditItems,
  type User, type InsertUser, 
  type Property, type InsertProperty,
  type Audit, type InsertAudit,
  type AuditItem, type InsertAuditItem
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  
  // Property methods
  getAllProperties(): Promise<Property[]>;
  getProperty(id: number): Promise<Property | undefined>;
  createProperty(property: InsertProperty): Promise<Property>;
  
  // Audit methods
  getAllAudits(): Promise<Audit[]>;
  getAuditsByAuditor(auditorId: number): Promise<Audit[]>;
  getAuditsByReviewer(reviewerId: number): Promise<Audit[]>;
  getAuditsByProperty(propertyId: number): Promise<Audit[]>;
  getAudit(id: number): Promise<Audit | undefined>;
  createAudit(audit: InsertAudit): Promise<Audit>;
  updateAudit(id: number, audit: Partial<Audit>): Promise<Audit | undefined>;
  
  // Audit item methods
  getAuditItems(auditId: number): Promise<AuditItem[]>;
  createAuditItem(item: InsertAuditItem): Promise<AuditItem>;
  updateAuditItem(id: number, item: Partial<AuditItem>): Promise<AuditItem | undefined>;
}

// Database-based storage implementation
export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  // Property methods
  async getAllProperties(): Promise<Property[]> {
    return db.select().from(properties);
  }

  async getProperty(id: number): Promise<Property | undefined> {
    const result = await db.select().from(properties).where(eq(properties.id, id));
    return result[0];
  }

  async createProperty(property: InsertProperty): Promise<Property> {
    const result = await db.insert(properties).values(property).returning();
    return result[0];
  }

  // Audit methods
  async getAllAudits(): Promise<Audit[]> {
    return db.select().from(audits);
  }

  async getAuditsByAuditor(auditorId: number): Promise<Audit[]> {
    return db.select().from(audits).where(eq(audits.auditorId, auditorId));
  }

  async getAuditsByReviewer(reviewerId: number): Promise<Audit[]> {
    return db.select().from(audits).where(eq(audits.reviewerId, reviewerId));
  }

  async getAuditsByProperty(propertyId: number): Promise<Audit[]> {
    return db.select().from(audits).where(eq(audits.propertyId, propertyId));
  }

  async getAudit(id: number): Promise<Audit | undefined> {
    const result = await db.select().from(audits).where(eq(audits.id, id));
    return result[0];
  }

  async createAudit(audit: InsertAudit): Promise<Audit> {
    const result = await db.insert(audits).values(audit).returning();
    return result[0];
  }

  async updateAudit(id: number, audit: Partial<Audit>): Promise<Audit | undefined> {
    const result = await db.update(audits).set(audit).where(eq(audits.id, id)).returning();
    return result[0];
  }

  // Audit item methods
  async getAuditItems(auditId: number): Promise<AuditItem[]> {
    return db.select().from(auditItems).where(eq(auditItems.auditId, auditId));
  }

  async createAuditItem(item: InsertAuditItem): Promise<AuditItem> {
    const result = await db.insert(auditItems).values(item).returning();
    return result[0];
  }

  async updateAuditItem(id: number, item: Partial<AuditItem>): Promise<AuditItem | undefined> {
    const result = await db.update(auditItems).set(item).where(eq(auditItems.id, id)).returning();
    return result[0];
  }
}

// Memory storage implementation for development testing
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private properties: Map<number, Property>;
  private audits: Map<number, Audit>;
  private auditItems: Map<number, AuditItem>;
  private currentUserId: number;
  private currentPropertyId: number;
  private currentAuditId: number;
  private currentAuditItemId: number;

  constructor() {
    this.users = new Map();
    this.properties = new Map();
    this.audits = new Map();
    this.auditItems = new Map();
    this.currentUserId = 1;
    this.currentPropertyId = 1;
    this.currentAuditId = 1;
    this.currentAuditItemId = 1;
    
    // Initialize with demo data
    this.initializeData();
  }

  private initializeData() {
    // Create demo users for each role
    this.createUser({
      username: 'admin',
      password: 'password',
      role: 'admin',
      name: 'Admin User',
      email: 'admin@hotel.com'
    });

    this.createUser({
      username: 'auditor',
      password: 'password', 
      role: 'auditor',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@audit.com'
    });

    this.createUser({
      username: 'reviewer',
      password: 'password',
      role: 'reviewer', 
      name: 'Michael Chen',
      email: 'michael.chen@qa.com'
    });

    this.createUser({
      username: 'corporate',
      password: 'password',
      role: 'corporate',
      name: 'Corporate User',
      email: 'corporate@hotel.com'
    });

    this.createUser({
      username: 'hotelgm',
      password: 'password',
      role: 'hotelgm',
      name: 'Hotel GM',
      email: 'gm@tajpalace.com'
    });

    // Create demo properties
    this.createProperty({
      name: 'Taj Palace, New Delhi',
      location: 'New Delhi',
      region: 'North India',
      image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300'
    });

    this.createProperty({
      name: 'Taj Mahal, Mumbai',
      location: 'Mumbai', 
      region: 'West India',
      image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300'
    });

    this.createProperty({
      name: 'Taj Lake Palace, Udaipur',
      location: 'Udaipur',
      region: 'West India',
      image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300'
    });

    // Create some demo audits for testing
    setTimeout(async () => {
      await this.createAudit({
        propertyId: 1,
        auditorId: 2, // Sarah Johnson
        reviewerId: 3  // Michael Chen
      });

      await this.createAudit({
        propertyId: 2,
        auditorId: 2,
        reviewerId: 3
      });

      // Create audit items for the first audit
      await this.createAuditItem({
        auditId: 1,
        category: 'Cleanliness',
        item: 'Lobby cleanliness standards',
        score: 4,
        comments: 'Very good overall, minor improvements needed in corners'
      });

      await this.createAuditItem({
        auditId: 1,
        category: 'Branding',
        item: 'Logo placement compliance',
        score: 3,
        comments: 'Some inconsistencies with brand guidelines'
      });
    }, 100);
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Property methods  
  async getAllProperties(): Promise<Property[]> {
    return Array.from(this.properties.values());
  }

  async getProperty(id: number): Promise<Property | undefined> {
    return this.properties.get(id);
  }

  async createProperty(insertProperty: InsertProperty): Promise<Property> {
    const id = this.currentPropertyId++;
    const property: Property = {
      ...insertProperty,
      id,
      image: insertProperty.image || null,
      lastAuditScore: Math.floor(Math.random() * 40) + 60, // 60-100
      nextAuditDate: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000), // Within 90 days
      status: ['green', 'amber', 'red'][Math.floor(Math.random() * 3)] as 'green' | 'amber' | 'red',
      createdAt: new Date()
    };
    this.properties.set(id, property);
    return property;
  }

  // Audit methods
  async getAllAudits(): Promise<Audit[]> {
    return Array.from(this.audits.values());
  }

  async getAuditsByAuditor(auditorId: number): Promise<Audit[]> {
    return Array.from(this.audits.values()).filter(audit => audit.auditorId === auditorId);
  }

  async getAuditsByReviewer(reviewerId: number): Promise<Audit[]> {
    return Array.from(this.audits.values()).filter(audit => audit.reviewerId === reviewerId);
  }

  async getAuditsByProperty(propertyId: number): Promise<Audit[]> {
    return Array.from(this.audits.values()).filter(audit => audit.propertyId === propertyId);
  }

  async getAudit(id: number): Promise<Audit | undefined> {
    return this.audits.get(id);
  }

  async createAudit(insertAudit: InsertAudit): Promise<Audit> {
    const id = this.currentAuditId++;
    const audit: Audit = {
      ...insertAudit,
      id,
      auditorId: insertAudit.auditorId || null,
      reviewerId: insertAudit.reviewerId || null,
      status: 'scheduled',
      overallScore: null,
      cleanlinessScore: null,
      brandingScore: null, 
      operationalScore: null,
      complianceZone: null,
      findings: null,
      actionPlan: null,
      submittedAt: null,
      reviewedAt: null,
      createdAt: new Date()
    };
    this.audits.set(id, audit);
    return audit;
  }

  async updateAudit(id: number, updateData: Partial<Audit>): Promise<Audit | undefined> {
    const audit = this.audits.get(id);
    if (!audit) return undefined;
    
    const updatedAudit = { ...audit, ...updateData };
    this.audits.set(id, updatedAudit);
    return updatedAudit;
  }

  // Audit item methods
  async getAuditItems(auditId: number): Promise<AuditItem[]> {
    return Array.from(this.auditItems.values()).filter(item => item.auditId === auditId);
  }

  async createAuditItem(insertItem: InsertAuditItem): Promise<AuditItem> {
    const id = this.currentAuditItemId++;
    const item: AuditItem = {
      ...insertItem,
      id,
      score: insertItem.score || null,
      comments: insertItem.comments || null,
      aiAnalysis: null,
      photos: insertItem.photos || null,
      status: 'pending'
    };
    this.auditItems.set(id, item);
    return item;
  }

  async updateAuditItem(id: number, updateData: Partial<AuditItem>): Promise<AuditItem | undefined> {
    const item = this.auditItems.get(id);
    if (!item) return undefined;
    
    const updatedItem = { ...item, ...updateData };
    this.auditItems.set(id, updatedItem);
    return updatedItem;
  }
}

// Use database storage for production, memory storage for development testing
export const storage: IStorage = process.env.NODE_ENV === 'development' && process.env.USE_MEMORY_STORAGE === 'true' 
  ? new MemStorage() 
  : new DatabaseStorage();