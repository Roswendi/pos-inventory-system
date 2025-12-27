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

