#!/bin/bash

# POS System Deployment Script for Hostinger
# This script prepares your application for deployment

echo "=========================================="
echo "POS System - Deployment Preparation"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Error: Please run this script from the pos-inventory-system directory"
    exit 1
fi

echo "📦 Step 1: Building Frontend..."
cd frontend
if [ ! -d "node_modules" ]; then
    echo "   Installing frontend dependencies..."
    npm install
fi
npm run build
if [ ! -d "build" ]; then
    echo "❌ Frontend build failed!"
    exit 1
fi
echo "${GREEN}✓ Frontend built successfully${NC}"
cd ..

echo ""
echo "📦 Step 2: Preparing Backend..."
cd backend
if [ ! -d "node_modules" ]; then
    echo "   Installing backend dependencies..."
    npm install --production
fi
echo "${GREEN}✓ Backend dependencies installed${NC}"
cd ..

echo ""
echo "📦 Step 3: Creating deployment package..."
# Create temporary directory
mkdir -p deploy-package

# Copy backend (excluding node_modules and .git)
echo "   Copying backend files..."
cp -r backend deploy-package/
rm -rf deploy-package/backend/node_modules
rm -rf deploy-package/backend/.git 2>/dev/null

# Copy frontend build
echo "   Copying frontend build..."
cp -r frontend/build deploy-package/frontend-build

# Create .env.example
echo "   Creating .env.example..."
cat > deploy-package/backend/.env.example << EOF
NODE_ENV=production
PORT=5001
JWT_SECRET=your-super-secret-key-change-this-in-production
EOF

# Create deployment instructions
echo "   Creating deployment instructions..."
cat > deploy-package/DEPLOY_INSTRUCTIONS.txt << 'EOF'
DEPLOYMENT INSTRUCTIONS FOR HOSTINGER
=====================================

1. Upload all files in this folder to your server

2. On your server, create .env file in backend folder:
   cd backend
   nano .env
   
   Add:
   NODE_ENV=production
   PORT=5001
   JWT_SECRET=your-super-secret-key-change-this

3. Install dependencies:
   cd backend
   npm install --production

4. Start application:
   - If using PM2: pm2 start server.js --name "pos-system"
   - If using Hostinger Node.js: Start from hPanel

5. Configure Nginx (if using VPS):
   - See DEPLOY_TO_HOSTINGER.md for Nginx config

6. Set file permissions:
   chmod -R 755 backend
   chmod -R 777 backend/data
   chmod -R 777 backend/uploads

7. Access your application:
   - VPS: http://your-server-ip:5001
   - Cloud: https://your-domain.com
EOF

# Create archive
echo "   Creating archive..."
tar -czf pos-system-deploy.tar.gz \
    -C deploy-package \
    backend/ \
    frontend-build/ \
    DEPLOY_INSTRUCTIONS.txt \
    2>/dev/null

# Cleanup
rm -rf deploy-package

echo ""
echo "${GREEN}✓ Deployment package created: pos-system-deploy.tar.gz${NC}"
echo ""
echo "📤 Next Steps:"
echo "   1. Upload pos-system-deploy.tar.gz to your Hostinger server"
echo "   2. Extract: tar -xzf pos-system-deploy.tar.gz"
echo "   3. Follow instructions in DEPLOY_INSTRUCTIONS.txt"
echo "   4. See DEPLOY_TO_HOSTINGER.md for detailed guide"
echo ""
echo "${GREEN}Deployment package ready! 🚀${NC}"
