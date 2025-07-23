import { sqliteTable, text, integer, blob } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// For SQL Server compatibility, we'll use a more compatible schema
// Note: You can switch back to PostgreSQL by changing imports and table definitions

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull(), // 'admin', 'auditor', 'reviewer', 'corporate', 'hotelgm'
  name: text("name").notNull(),
  email: text("email").notNull(),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

export const properties = sqliteTable("properties", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  location: text("location").notNull(),
  region: text("region").notNull(),
  image: text("image"),
  lastAuditScore: integer("last_audit_score"),
  nextAuditDate: text("next_audit_date"), // Using text for timestamp compatibility
  status: text("status").default('green'), // 'green', 'amber', 'red'
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

export const audits = sqliteTable("audits", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  propertyId: integer("property_id").notNull().references(() => properties.id),
  auditorId: integer("auditor_id").references(() => users.id),
  reviewerId: integer("reviewer_id").references(() => users.id),
  status: text("status").default('scheduled'), // 'scheduled', 'in_progress', 'submitted', 'reviewed', 'completed'
  overallScore: integer("overall_score"),
  cleanlinessScore: integer("cleanliness_score"),
  brandingScore: integer("branding_score"),
  operationalScore: integer("operational_score"),
  complianceZone: text("compliance_zone"), // 'green', 'amber', 'red'
  findings: text("findings"), // JSON as text
  actionPlan: text("action_plan"), // JSON as text
  submittedAt: text("submitted_at"), // Using text for timestamp compatibility
  reviewedAt: text("reviewed_at"), // Using text for timestamp compatibility
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

export const auditItems = sqliteTable("audit_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  auditId: integer("audit_id").notNull().references(() => audits.id),
  category: text("category").notNull(),
  item: text("item").notNull(),
  score: integer("score"),
  comments: text("comments"),
  photos: text("photos"), // JSON as text
  status: text("status").default('pending'), // 'pending', 'completed'
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
  name: true,
  email: true,
});

export const insertPropertySchema = createInsertSchema(properties).pick({
  name: true,
  location: true,
  region: true,
  image: true,
});

export const insertAuditSchema = createInsertSchema(audits).pick({
  propertyId: true,
  auditorId: true,
  reviewerId: true,
});

export const insertAuditItemSchema = createInsertSchema(auditItems).pick({
  auditId: true,
  category: true,
  item: true,
  score: true,
  comments: true,
  photos: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Property = typeof properties.$inferSelect;
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Audit = typeof audits.$inferSelect;
export type InsertAudit = z.infer<typeof insertAuditSchema>;
export type AuditItem = typeof auditItems.$inferSelect;
export type InsertAuditItem = z.infer<typeof insertAuditItemSchema>;

export type UserRole = 'admin' | 'auditor' | 'reviewer' | 'corporate' | 'hotelgm';
export type ComplianceZone = 'green' | 'amber' | 'red';
export type AuditStatus = 'scheduled' | 'in_progress' | 'submitted' | 'reviewed' | 'completed';
