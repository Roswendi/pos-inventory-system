#!/bin/bash

# TDO POS System Launcher
# Double-click this file to start the POS system

PROJECT_DIR="/Users/endiroswendi/Documents/ Old Laptop Documents/CAO/FINANCIAL REPORT/pos-inventory-system"

# Build frontend if not built
if [ ! -d "$PROJECT_DIR/frontend/build" ]; then
    echo "Building frontend..."
    cd "$PROJECT_DIR/frontend"
    npm run build
    if [ ! -d "build" ]; then
        osascript -e 'display dialog "Frontend build failed! Please check for errors." buttons {"OK"} default button "OK" with icon stop'
        exit 1
    fi
fi

# Start backend server
cd "$PROJECT_DIR/backend"

# Check if server is already running
if ! lsof -ti:5001 > /dev/null 2>&1; then
    echo "Starting TDO POS System..."
    # Start server in new Terminal window
    osascript -e 'tell app "Terminal" to do script "cd '"'"''"$PROJECT_DIR/backend"'"'"' && echo \"🚀 TDO POS System Backend Starting...\" && echo \"\" && echo \"📱 To access from other devices:\" && echo \"   Use the IP address shown below\" && echo \"\" && NODE_ENV=production node server.js"'
    # Wait for server to start
    sleep 5
else
    echo "Server is already running!"
fi

# Open browser
open "http://localhost:5001"

echo "TDO POS System should open in your browser!"

