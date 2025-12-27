#!/bin/bash

# Hostinger-Compatible Deployment Script
# Creates structure that Hostinger can recognize

echo "=========================================="
echo "Hostinger-Compatible Deployment Package"
echo "=========================================="
echo ""

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Check directories
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "ERROR: backend or frontend folder not found!"
    exit 1
fi

echo "Step 1: Building frontend..."
cd frontend
if [ ! -d "node_modules" ]; then
    npm install
fi
npm run build
if [ ! -d "build" ]; then
    echo "ERROR: Frontend build failed!"
    exit 1
fi
cd ..

echo ""
echo "Step 2: Creating Hostinger-compatible structure..."

# Clean up old deployment
rm -rf hostinger-deploy
mkdir -p hostinger-deploy

# Copy backend files to root (Hostinger expects this)
echo "Copying backend files..."
cp -r backend/* hostinger-deploy/
rm -rf hostinger-deploy/node_modules 2>/dev/null

# Copy frontend build
echo "Copying frontend build..."
cp -r frontend/build hostinger-deploy/public

# Create package.json in root (Hostinger requirement)
echo "Creating root package.json..."
cat > hostinger-deploy/package.json << 'EOF'
{
  "name": "pos-inventory-system",
  "version": "1.0.0",
  "description": "POS Inventory Accounting System",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "body-parser": "^1.20.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.2",
    "multer": "^1.4.5-lts.1",
    "qrcode-terminal": "^0.12.0",
    "uuid": "^9.0.0",
    "whatsapp-web.js": "^1.23.0"
  },
  "engines": {
    "node": ">=14.0.0",
    "npm": ">=6.0.0"
  }
}
EOF

# Update server.js to serve frontend from public folder
echo "Updating server.js for Hostinger..."
# Create a modified server.js that serves from public folder
cat > hostinger-deploy/server.js << 'SERVER_EOF'
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

// Import routes
const productsRoutes = require('./routes/products');
const inventoryRoutes = require('./routes/inventory');
const posRoutes = require('./routes/pos');
const accountingRoutes = require('./routes/accounting');
const customersRoutes = require('./routes/customers');
const whatsappRoutes = require('./routes/whatsapp');
const dashboardRoutes = require('./routes/dashboard');
const authRoutes = require('./routes/auth');
const deliveryRoutes = require('./routes/delivery');
const paymentsRoutes = require('./routes/payments');
const uploadRoutes = require('./routes/upload');
const posReportsRoutes = require('./routes/pos-reports');
const outletsRoutes = require('./routes/outlets');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Initialize data directories
const dataDir = path.join(__dirname, 'data');
const uploadsDir = path.join(__dirname, 'uploads');
const dirs = ['products', 'inventory', 'sales', 'customers', 'accounting', 'users', 'outlets'];
dirs.forEach(dir => {
  const dirPath = path.join(dataDir, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Initialize default data files
const initDataFiles = () => {
  const dataFiles = {
    'products/products.json': [],
    'inventory/stock.json': [],
    'inventory/transactions.json': [],
    'sales/orders.json': [],
    'sales/receipts.json': [],
    'sales/delivery-orders.json': [],
    'sales/payments.json': [],
    'sales/cancellations.json': [],
    'sales/waste.json': [],
    'sales/promotions.json': [],
    'sales/tables.json': [],
    'customers/customers.json': [],
    'accounting/accounts.json': require('./data/defaultAccounts.json'),
    'accounting/transactions.json': [],
    'users/users.json': [],
    'outlets/outlets.json': []
  };

  Object.entries(dataFiles).forEach(([filePath, defaultData]) => {
    const fullPath = path.join(dataDir, filePath);
    if (!fs.existsSync(fullPath)) {
      fs.writeFileSync(fullPath, JSON.stringify(defaultData, null, 2));
    }
  });
};

initDataFiles();

// Routes
app.use('/api/products', productsRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/pos', posRoutes);
app.use('/api/accounting', accountingRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/pos-reports', posReportsRoutes);
app.use('/api/outlets', outletsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'POS Inventory System API is running' });
});

// Serve React app from public folder (Hostinger structure)
const publicPath = path.join(__dirname, 'public');
if (fs.existsSync(publicPath)) {
  app.use(express.static(publicPath));
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(path.join(publicPath, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 API: http://localhost:${PORT}/api`);
  if (fs.existsSync(publicPath)) {
    console.log(`🌐 Frontend: http://localhost:${PORT}`);
  }
});

SERVER_EOF

# Copy defaultAccounts.json if it exists
if [ -f "backend/data/defaultAccounts.json" ]; then
    mkdir -p hostinger-deploy/data
    cp backend/data/defaultAccounts.json hostinger-deploy/data/
fi

# Create .env.example
cat > hostinger-deploy/.env.example << 'EOF'
NODE_ENV=production
PORT=5001
JWT_SECRET=your-super-secret-key-change-this-in-production
EOF

# Create deployment instructions
cat > hostinger-deploy/HOSTINGER_DEPLOY_INSTRUCTIONS.txt << 'EOF'
HOSTINGER DEPLOYMENT INSTRUCTIONS
==================================

METHOD 1: Via File Manager (Recommended)
-----------------------------------------
1. Upload ALL files in this folder to Hostinger
2. Via hPanel → File Manager
3. Upload to your domain folder (public_html or www)
4. OR upload to a subfolder like: public_html/pos-system

METHOD 2: Via FTP
-----------------
1. Use FileZilla
2. Connect to Hostinger FTP
3. Upload all files in this folder
4. Maintain folder structure

METHOD 3: Via Hostinger Node.js App
------------------------------------
1. In hPanel, go to Node.js section
2. Create new Node.js application
3. Set startup file: server.js
4. Upload all files from this folder
5. Set port (usually provided by Hostinger)
6. Start application

AFTER UPLOAD:
-------------
1. SSH to server or use Terminal in hPanel
2. Navigate to uploaded folder
3. Install dependencies: npm install --production
4. Create .env file: cp .env.example .env
5. Edit .env with your settings
6. Set permissions:
   chmod -R 755 .
   chmod -R 777 data
   chmod -R 777 uploads
7. Start: npm start (or use PM2: pm2 start server.js)

ACCESS:
-------
- http://your-domain.com (if in public_html)
- http://your-domain.com/pos-system (if in subfolder)
EOF

# Create archive
echo ""
echo "Step 3: Creating archive..."
cd hostinger-deploy
tar -czf ../hostinger-pos-system.tar.gz .
cd ..

echo ""
echo "=========================================="
echo "✓ HOSTINGER-COMPATIBLE PACKAGE CREATED!"
echo "=========================================="
echo ""
echo "Package: hostinger-pos-system.tar.gz"
echo ""
echo "Structure:"
echo "  - package.json (in root - Hostinger requirement)"
echo "  - server.js (in root - Hostinger requirement)"
echo "  - public/ (frontend build)"
echo "  - routes/ (API routes)"
echo "  - data/ (data files)"
echo ""
echo "Next steps:"
echo "1. Extract: tar -xzf hostinger-pos-system.tar.gz"
echo "2. Upload ALL files to Hostinger (not the tar.gz)"
echo "3. Follow HOSTINGER_DEPLOY_INSTRUCTIONS.txt"
echo ""
echo "Done! 🚀"

