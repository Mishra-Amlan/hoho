import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ['admin', 'auditor', 'reviewer', 'corporate', 'hotelgm'] }).notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  region: text("region").notNull(),
  image: text("image"),
  lastAuditScore: integer("last_audit_score"),
  nextAuditDate: timestamp("next_audit_date"),
  status: text("status", { enum: ['green', 'amber', 'red'] }).default('green'),
  createdAt: timestamp("created_at").defaultNow(),
});

export const audits = pgTable("audits", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  auditorId: integer("auditor_id").references(() => users.id),
  reviewerId: integer("reviewer_id").references(() => users.id),
  status: text("status", { enum: ['scheduled', 'in_progress', 'submitted', 'reviewed', 'completed'] }).default('scheduled'),
  overallScore: integer("overall_score"),
  cleanlinessScore: integer("cleanliness_score"),
  brandingScore: integer("branding_score"),
  operationalScore: integer("operational_score"),
  complianceZone: text("compliance_zone", { enum: ['green', 'amber', 'red'] }),
  findings: jsonb("findings"),
  actionPlan: jsonb("action_plan"),
  submittedAt: timestamp("submitted_at"),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const auditItems = pgTable("audit_items", {
  id: serial("id").primaryKey(),
  auditId: integer("audit_id").references(() => audits.id).notNull(),
  category: text("category").notNull(),
  item: text("item").notNull(),
  score: integer("score"),
  comments: text("comments"),
  photos: jsonb("photos"),
  status: text("status", { enum: ['pending', 'completed'] }).default('pending'),
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
