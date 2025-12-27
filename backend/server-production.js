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

// Serve static files from React app (for production)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
}

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

// Create uploads directory for images
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

// Test outlets route before registering
try {
  console.log('Testing outlets route import...');
  const testOutlets = require('./routes/outlets');
  console.log('✓ Outlets route imported successfully');
} catch (error) {
  console.error('✗ ERROR importing outlets route:', error.message);
  console.error(error.stack);
}

// API Routes
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

// Register outlets route with explicit logging
console.log('Registering outlets route...');
app.use('/api/outlets', outletsRoutes);
console.log('✓ Outlets route registered successfully at /api/outlets');

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'POS Inventory System API is running' });
});

// Serve React app for all non-API routes (production only)
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
  if (process.env.NODE_ENV === 'production') {
    console.log(`🌐 Frontend served from: ${path.join(__dirname, '../frontend/build')}`);
    console.log(`💡 Access from other devices: http://[YOUR_IP]:${PORT}`);
  }
});

