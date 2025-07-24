import { db } from "./db";
import { users, properties, audits, auditItems } from "@shared/schema";

export async function seedDatabase() {
  console.log("Seeding database...");

  try {
    // Check if users already exist to avoid duplicate seeding
    const existingUsers = await db.select().from(users);
    if (existingUsers.length > 0) {
      console.log("Database already seeded");
      return;
    }

    console.log("Creating demo users...");

    // Create demo users for each role
    await db.insert(users).values([
      {
        username: 'admin',
        password: 'password',
        role: 'admin',
        name: 'Admin User',
        email: 'admin@hotel.com'
      },
      {
        username: 'auditor',
        password: 'password',
        role: 'auditor',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@audit.com'
      },
      {
        username: 'reviewer',
        password: 'password',
        role: 'reviewer',
        name: 'Michael Chen',
        email: 'michael.chen@qa.com'
      },
      {
        username: 'corporate',
        password: 'password',
        role: 'corporate',
        name: 'Corporate User',
        email: 'corporate@hotel.com'
      },
      {
        username: 'hotelgm',
        password: 'password',
        role: 'hotelgm',
        name: 'Hotel GM',
        email: 'gm@tajpalace.com'
      }
    ]);

    // Create demo properties
    await db.insert(properties).values([
      {
        name: 'Taj Palace, New Delhi',
        location: 'New Delhi',
        region: 'North India',
        image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
        lastAuditScore: 85,
        nextAuditDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        status: 'green'
      },
      {
        name: 'Taj Mahal, Mumbai',
        location: 'Mumbai',
        region: 'West India',
        image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
        lastAuditScore: 72,
        nextAuditDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        status: 'amber'
      },
      {
        name: 'Taj Lake Palace, Udaipur',
        location: 'Udaipur',
        region: 'North India',
        image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
        lastAuditScore: 92,
        nextAuditDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
        status: 'green'
      }
    ]);

    // Create demo audits
    await db.insert(audits).values([
      {
        propertyId: 1,
        auditorId: 2, // Sarah Johnson
        reviewerId: 3, // Michael Chen
        status: 'in_progress',
        overallScore: null,
        cleanlinessScore: null,
        brandingScore: null,
        operationalScore: null,
        complianceZone: null,
        findings: null,
        actionPlan: null,
        submittedAt: null,
        reviewedAt: null
      },
      {
        propertyId: 2,
        auditorId: 2, // Sarah Johnson
        reviewerId: 3, // Michael Chen
        status: 'scheduled',
        overallScore: null,
        cleanlinessScore: null,
        brandingScore: null,
        operationalScore: null,
        complianceZone: null,
        findings: null,
        actionPlan: null,
        submittedAt: null,
        reviewedAt: null
      }
    ]);

    // Create demo audit items
    await db.insert(auditItems).values([
      {
        auditId: 1,
        category: 'Cleanliness',
        item: 'Lobby cleanliness standards',
        score: 4,
        comments: 'Very good overall, minor improvements needed in corners',
        aiAnalysis: 'Good performance with attention to detail. Recommend focusing on corner areas for consistent cleanliness standards.',
        photos: null,
        status: 'completed'
      },
      {
        auditId: 1,
        category: 'Branding',
        item: 'Logo placement compliance',
        score: 3,
        comments: 'Some inconsistencies with brand guidelines',
        aiAnalysis: 'Moderate compliance with brand standards. Several placement inconsistencies identified that require attention.',
        photos: null,
        status: 'completed'
      },
      {
        auditId: 1,
        category: 'Operational',
        item: 'Staff uniform compliance',
        score: null,
        comments: 'Item pending auditor completion',
        aiAnalysis: null,
        photos: null,
        status: 'pending'
      }
    ]);

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}