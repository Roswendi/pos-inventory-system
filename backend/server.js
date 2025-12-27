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

// Initialize default users after data files are created
// This ensures the users.json file exists before auth routes try to use it
setTimeout(() => {
  try {
    const authRoutes = require('./routes/auth');
    console.log('✓ Default users initialization triggered');
  } catch (error) {
    console.error('✗ ERROR initializing auth routes:', error.message);
  }
}, 100);

// Test outlets route before registering
try {
  console.log('Testing outlets route import...');
  const testOutlets = require('./routes/outlets');
  console.log('✓ Outlets route imported successfully');
} catch (error) {
  console.error('✗ ERROR importing outlets route:', error.message);
  console.error(error.stack);
}

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

// Debug: Log all registered routes
console.log('📋 Registered API routes:');
console.log('  - /api/products');
console.log('  - /api/inventory');
console.log('  - /api/pos');
console.log('  - /api/accounting');
console.log('  - /api/customers');
console.log('  - /api/whatsapp');
console.log('  - /api/dashboard');
console.log('  - /api/auth');
console.log('  - /api/delivery');
console.log('  - /api/payments');
console.log('  - /api/upload');
console.log('  - /api/pos-reports');
console.log('  - /api/outlets ✓');

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'POS Inventory System API is running' });
});

// Serve React app (when frontend is built)
// Check for public folder first (Railway), then frontend/build (local)
const frontendBuildPath = fs.existsSync(path.join(__dirname, 'public'))
  ? path.join(__dirname, 'public')
  : path.join(__dirname, '../frontend/build');

// Check if frontend build exists and serve it
if (fs.existsSync(frontendBuildPath)) {
  console.log('✓ Frontend build found, serving static files');
  app.use(express.static(frontendBuildPath));
  
  // Serve React app for all non-API routes
  app.get('*', (req, res) => {
    // Don't serve frontend for API routes
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
  });
} else {
  console.log('⚠️  Frontend build not found. Run: cd frontend && npm run build');
  // Provide helpful message
  app.get('/', (req, res) => {
    res.send(`
      <html>
        <head><title>TDO POS System</title></head>
        <body style="font-family: Arial; padding: 40px; text-align: center;">
          <h1>TDO POS System</h1>
          <p>Frontend not built yet.</p>
          <p>Please run: <code>cd frontend && npm run build</code></p>
          <p>Then restart the server.</p>
          <hr>
          <p>API is running at: <a href="/api/health">/api/health</a></p>
        </body>
      </html>
    `);
  });
}

app.listen(PORT, '0.0.0.0', () => {
  const os = require('os');
  const networkInterfaces = os.networkInterfaces();
  let localIP = 'localhost';
  
  // Find local IP address
  for (const interfaceName in networkInterfaces) {
    const addresses = networkInterfaces[interfaceName];
    for (const address of addresses) {
      if (address.family === 'IPv4' && !address.internal) {
        localIP = address.address;
        break;
      }
    }
    if (localIP !== 'localhost') break;
  }
  
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
  console.log(`🌐 Access from other devices on your network:`);
  console.log(`   http://${localIP}:${PORT}`);
  if (process.env.NODE_ENV === 'production') {
    console.log(`💡 Frontend served from build directory`);
  }
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use!`);
    console.error(`   Please stop the other process or use a different port.`);
    console.error(`   To kill process on port ${PORT}, run: lsof -ti:${PORT} | xargs kill`);
  } else {
    console.error('❌ Server error:', err);
  }
  process.exit(1);
});

