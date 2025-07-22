#!/usr/bin/env python3
"""
Server startup script
Handles database initialization and server startup
"""

import uvicorn
import asyncio
import sys
import os

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import create_tables
from init_db import main as init_db

def start_server():
    """Start the FastAPI server"""
    print("🚀 Starting Hotel Audit Management API Server...")
    
    # Initialize database
    try:
        print("📊 Setting up database...")
        create_tables()
        print("✅ Database setup completed")
    except Exception as e:
        print(f"❌ Database setup failed: {e}")
        print("🔧 Attempting to initialize database...")
        try:
            init_db()
        except Exception as init_error:
            print(f"❌ Database initialization failed: {init_error}")
            print("💡 Please ensure PostgreSQL is running and accessible")
            sys.exit(1)
    
    # Start the server
    print("🌐 Starting FastAPI server on http://localhost:8000")
    print("📖 API documentation available at http://localhost:8000/docs")
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )

if __name__ == "__main__":
    start_server()
