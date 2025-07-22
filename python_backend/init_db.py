#!/usr/bin/env python3
"""
Database initialization script
Creates tables and seeds initial data
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.models import Base, User, Property, Audit
from app.core.security import get_password_hash
from app.core.config import settings
from datetime import datetime, timedelta
import sys

def create_tables():
    """Create all database tables"""
    engine = create_engine(settings.DATABASE_URL)
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully")
    return engine

def seed_initial_data(engine):
    """Seed initial data for testing"""
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Check if data already exists
        existing_users = db.query(User).count()
        if existing_users > 0:
            print("ℹ️ Database already contains data, skipping seed")
            return
        
        # Create sample users
        users_data = [
            {
                "username": "admin",
                "password": get_password_hash("admin123"),
                "role": "admin",
                "name": "System Administrator",
                "email": "admin@hotel-audit.com"
            },
            {
                "username": "sarah.johnson",
                "password": get_password_hash("auditor123"),
                "role": "auditor",
                "name": "Sarah Johnson",
                "email": "sarah.johnson@hotel-audit.com"
            },
            {
                "username": "mike.chen",
                "password": get_password_hash("auditor123"),
                "role": "auditor",
                "name": "Mike Chen",
                "email": "mike.chen@hotel-audit.com"
            },
            {
                "username": "lisa.thompson",
                "password": get_password_hash("reviewer123"),
                "role": "reviewer",
                "name": "Lisa Thompson",
                "email": "lisa.thompson@hotel-audit.com"
            },
            {
                "username": "raj.patel",
                "password": get_password_hash("corporate123"),
                "role": "corporate",
                "name": "Raj Patel",
                "email": "raj.patel@hotel-audit.com"
            },
            {
                "username": "priya.sharma",
                "password": get_password_hash("hotelgm123"),
                "role": "hotelgm",
                "name": "Priya Sharma",
                "email": "priya.sharma@tajpalace.com"
            }
        ]
        
        for user_data in users_data:
            user = User(**user_data)
            db.add(user)
        
        db.commit()
        print("✅ Sample users created")
        
        # Create sample properties
        properties_data = [
            {
                "name": "Taj Palace, New Delhi",
                "location": "New Delhi",
                "region": "North India",
                "image": "https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
                "last_audit_score": 85,
                "next_audit_date": datetime.now() + timedelta(days=30),
                "status": "green"
            },
            {
                "name": "Taj Gateway, Mumbai",
                "location": "Mumbai",
                "region": "West India",
                "image": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
                "last_audit_score": 78,
                "next_audit_date": datetime.now() + timedelta(days=15),
                "status": "amber"
            },
            {
                "name": "Taj Coromandel, Chennai",
                "location": "Chennai",
                "region": "South India",
                "image": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
                "last_audit_score": 92,
                "next_audit_date": datetime.now() + timedelta(days=45),
                "status": "green"
            },
            {
                "name": "Taj Bengal, Kolkata",
                "location": "Kolkata",
                "region": "East India",
                "image": "https://images.unsplash.com/photo-1568992687947-868a62a9f521?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
                "last_audit_score": 88,
                "next_audit_date": datetime.now() + timedelta(days=20),
                "status": "green"
            }
        ]
        
        for prop_data in properties_data:
            property = Property(**prop_data)
            db.add(property)
        
        db.commit()
        print("✅ Sample properties created")
        
        # Create a sample audit
        audit = Audit(
            property_id=1,  # Taj Palace
            auditor_id=2,   # Sarah Johnson
            reviewer_id=4,  # Lisa Thompson
            status="in_progress",
            overall_score=85,
            cleanliness_score=90,
            branding_score=82,
            operational_score=83,
            compliance_zone="green"
        )
        db.add(audit)
        db.commit()
        
        print("✅ Sample audit created")
        print("\n🎉 Database initialization completed successfully!")
        print("\nSample login credentials:")
        print("Admin: admin / admin123")
        print("Auditor: sarah.johnson / auditor123")
        print("Reviewer: lisa.thompson / reviewer123")
        print("Corporate: raj.patel / corporate123")
        print("Hotel GM: priya.sharma / hotelgm123")
        
    except Exception as e:
        print(f"❌ Error seeding data: {e}")
        db.rollback()
        raise
    finally:
        db.close()

def main():
    try:
        print("🚀 Initializing database...")
        engine = create_tables()
        seed_initial_data(engine)
        
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
