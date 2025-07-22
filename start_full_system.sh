#!/bin/bash

echo "🏨 Hotel Audit Management System - Full Stack Startup"
echo "====================================================="

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found. Please run setup first."
    exit 1
fi

# Start PostgreSQL if not running
echo "🗄️  Starting PostgreSQL..."
sudo service postgresql start

# Function to start backend
start_backend() {
    echo "🐍 Starting Python Backend (FastAPI + Gemini AI)..."
    cd python_backend
    source ../venv/bin/activate
    uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
    BACKEND_PID=$!
    cd ..
    echo "✅ Backend started with PID: $BACKEND_PID"
}

# Function to start frontend
start_frontend() {
    echo "⚛️  Starting React Frontend..."
    npm run dev &
    FRONTEND_PID=$!
    echo "✅ Frontend started with PID: $FRONTEND_PID"
}

# Start both services
start_backend
sleep 3
start_frontend

echo ""
echo "🎉 System startup complete!"
echo "============================="
echo ""
echo "🌐 Access your application:"
echo "  • Frontend (React):     http://localhost:5173"
echo "  • Backend API:          http://localhost:8000"
echo "  • API Documentation:    http://localhost:8000/docs"
echo "  • Integration Test:     file://$(pwd)/test_integration.html"
echo ""
echo "🔐 Test Credentials:"
echo "  • Admin:     admin / admin123"
echo "  • Auditor:   sarah.johnson / auditor123"
echo "  • Reviewer:  lisa.thompson / reviewer123"
echo ""
echo "🤖 AI Features:"
echo "  • Gemini API integrated for smart audit analysis"
echo "  • Photo analysis, report generation, score suggestions"
echo ""
echo "💡 To stop all services:"
echo "  kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "Press Ctrl+C to stop all services..."

# Wait for user interrupt
trap "echo 'Stopping services...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" SIGINT

# Keep script running
wait
