#!/bin/bash

# Simple Deployment Script - Easy to Run
# Just run: bash SIMPLE_DEPLOY.sh

echo "Starting deployment preparation..."
echo ""

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "Current directory: $(pwd)"
echo ""

# Check if we're in the right place
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "ERROR: backend or frontend folder not found!"
    echo "Please make sure you're in the pos-inventory-system directory"
    exit 1
fi

echo "✓ Found backend and frontend folders"
echo ""

# Build frontend
echo "Step 1: Building frontend..."
cd frontend
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi
npm run build
if [ ! -d "build" ]; then
    echo "ERROR: Frontend build failed!"
    exit 1
fi
echo "✓ Frontend built successfully"
cd ..

# Prepare backend
echo ""
echo "Step 2: Preparing backend..."
cd backend
if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install --production
fi
echo "✓ Backend ready"
cd ..

# Create deployment package
echo ""
echo "Step 3: Creating deployment package..."
rm -rf deploy-package
mkdir deploy-package

# Copy backend
echo "Copying backend files..."
cp -r backend deploy-package/
rm -rf deploy-package/backend/node_modules 2>/dev/null
rm -rf deploy-package/backend/.git 2>/dev/null

# Copy frontend build
echo "Copying frontend build..."
cp -r frontend/build deploy-package/frontend-build

# Create .env.example
cat > deploy-package/backend/.env.example << 'EOF'
NODE_ENV=production
PORT=5001
JWT_SECRET=your-super-secret-key-change-this-in-production
EOF

# Create archive
echo "Creating archive..."
cd deploy-package
tar -czf ../pos-system-deploy.tar.gz .
cd ..
rm -rf deploy-package

echo ""
echo "=========================================="
echo "✓ DEPLOYMENT PACKAGE CREATED!"
echo "=========================================="
echo ""
echo "File: pos-system-deploy.tar.gz"
echo ""
echo "Next steps:"
echo "1. Upload pos-system-deploy.tar.gz to Hostinger"
echo "2. Extract it on your server"
echo "3. Follow DEPLOY_TO_HOSTINGER.md guide"
echo ""
echo "Done! 🚀"

