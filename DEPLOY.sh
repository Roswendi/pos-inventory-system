#!/bin/bash

# TDO POS System - Quick Deployment Script
# This script builds and starts the production server

echo "🚀 TDO POS System - Deployment Script"
echo "======================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org"
    exit 1
fi

echo "✓ Node.js version: $(node --version)"
echo ""

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
if [ ! -d "node_modules" ]; then
    npm install
fi
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
if [ ! -d "node_modules" ]; then
    npm install
fi

# Build frontend
echo "🔨 Building frontend for production..."
npm run build

if [ ! -d "build" ]; then
    echo "❌ Build failed! Check for errors above."
    exit 1
fi

echo "✓ Frontend built successfully!"
cd ..

# Get IP address
echo ""
echo "🌐 Network Information:"
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    IP=$(hostname -I | awk '{print $1}')
else
    IP="YOUR_IP_ADDRESS"
fi

echo "   Server IP: $IP"
echo "   Port: 5001"
echo "   Access URL: http://$IP:5001"
echo ""

# Start server
echo "🚀 Starting production server..."
echo "   Server will run on port 5001"
echo "   Clients access: http://$IP:5001"
echo "   Press Ctrl+C to stop"
echo ""
cd backend
NODE_ENV=production node server.js

