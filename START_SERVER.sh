#!/bin/bash

# TDO POS System - Start Server Script
# This script helps start the server correctly

echo "🚀 TDO POS System - Starting Server"
echo "===================================="
echo ""

# Navigate to backend directory
cd "$(dirname "$0")/backend" || exit 1

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org"
    exit 1
fi

# Check if server.js exists
if [ ! -f "server.js" ]; then
    echo "❌ server.js not found!"
    echo "Current directory: $(pwd)"
    echo "Files in directory:"
    ls -la
    exit 1
fi

echo "✓ Node.js version: $(node --version)"
echo "✓ server.js found"
echo ""

# Check if port 5001 is in use
if lsof -ti:5001 > /dev/null 2>&1; then
    echo "⚠️  Port 5001 is already in use!"
    echo ""
    echo "Options:"
    echo "1. Kill the process using port 5001"
    echo "2. Use a different port"
    echo ""
    read -p "Kill process on port 5001? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Stopping process on port 5001..."
        lsof -ti:5001 | xargs kill -9 2>/dev/null
        sleep 2
        echo "✓ Port 5001 is now free"
    else
        echo "Please stop the process manually or use a different port"
        exit 1
    fi
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo ""
echo "🚀 Starting server..."
echo "   Press Ctrl+C to stop"
echo ""

# Start server
node server.js

