const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const outletsPath = path.join(__dirname, '../data/outlets/outlets.json');

// Helper functions
const readOutlets = () => {
  try {
    const dir = path.dirname(outletsPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(outletsPath)) {
      fs.writeFileSync(outletsPath, JSON.stringify([], null, 2));
    }
    const data = fs.readFileSync(outletsPath, 'utf8');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading outlets:', error);
    return [];
  }
};

const writeOutlets = (data) => {
  const dir = path.dirname(outletsPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(outletsPath, JSON.stringify(data, null, 2));
};

// Get all outlets
router.get('/', (req, res) => {
  try {
    console.log('GET /api/outlets - Request received');
    const outlets = readOutlets();
    console.log(`Returning ${outlets.length} outlets`);
    res.json(outlets);
  } catch (error) {
    console.error('Error reading outlets:', error);
    res.status(500).json({ error: 'Failed to read outlets data', details: error.message });
  }
});

// Get outlet by ID
router.get('/:id', (req, res) => {
  const outlets = readOutlets();
  const outlet = outlets.find(o => o.id === req.params.id);
  if (!outlet) {
    return res.status(404).json({ error: 'Outlet not found' });
  }
  res.json(outlet);
});

// Create outlet
router.post('/', (req, res) => {
  const { name, address, city, province, postalCode, phone, email, manager, status } = req.body;
  
  if (!name || !address) {
    return res.status(400).json({ error: 'Name and address are required' });
  }
  
  const outlets = readOutlets();
  
  // Check for duplicate name
  if (outlets.find(o => o.name.toLowerCase() === name.toLowerCase())) {
    return res.status(400).json({ error: 'Outlet with this name already exists' });
  }
  
  const newOutlet = {
    id: uuidv4(),
    name,
    address,
    city: city || '',
    province: province || '',
    postalCode: postalCode || '',
    phone: phone || '',
    email: email || '',
    manager: manager || '',
    status: status || 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  outlets.push(newOutlet);
  writeOutlets(outlets);
  
  res.status(201).json(newOutlet);
});

// Update outlet
router.put('/:id', (req, res) => {
  const outlets = readOutlets();
  const index = outlets.findIndex(o => o.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Outlet not found' });
  }
  
  // Check for duplicate name (excluding current outlet)
  const { name } = req.body;
  if (name && outlets.find(o => o.id !== req.params.id && o.name.toLowerCase() === name.toLowerCase())) {
    return res.status(400).json({ error: 'Outlet with this name already exists' });
  }
  
  outlets[index] = {
    ...outlets[index],
    ...req.body,
    id: req.params.id,
    updatedAt: new Date().toISOString()
  };
  
  writeOutlets(outlets);
  res.json(outlets[index]);
});

// Delete outlet
router.delete('/:id', (req, res) => {
  const outlets = readOutlets();
  const filtered = outlets.filter(o => o.id !== req.params.id);
  
  if (filtered.length === outlets.length) {
    return res.status(404).json({ error: 'Outlet not found' });
  }
  
  writeOutlets(filtered);
  res.json({ message: 'Outlet deleted successfully' });
});

// Get outlet sales performance
router.get('/:id/performance', (req, res) => {
  const { startDate, endDate } = req.query;
  const outlets = readOutlets();
  const outlet = outlets.find(o => o.id === req.params.id);
  
  if (!outlet) {
    return res.status(404).json({ error: 'Outlet not found' });
  }
  
  // Read orders
  const ordersPath = path.join(__dirname, '../data/sales/orders.json');
  let orders = [];
  try {
    orders = JSON.parse(fs.readFileSync(ordersPath, 'utf8'));
  } catch (error) {
    orders = [];
  }
  
  // Filter orders by outlet
  let outletOrders = orders.filter(o => o.outletId === req.params.id);
  
  if (startDate) {
    outletOrders = outletOrders.filter(o => new Date(o.date) >= new Date(startDate));
  }
  if (endDate) {
    outletOrders = outletOrders.filter(o => new Date(o.date) <= new Date(endDate));
  }
  
  // Calculate performance metrics
  const totalRevenue = outletOrders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = outletOrders.length;
  const totalItems = outletOrders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0);
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  
  // Calculate costs (if available)
  const productsPath = path.join(__dirname, '../data/products/products.json');
  let products = [];
  try {
    products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
  } catch (error) {
    products = [];
  }
  
  let totalCost = 0;
  outletOrders.forEach(order => {
    order.items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product && product.cost) {
        totalCost += product.cost * item.quantity;
      }
    });
  });
  
  const grossProfit = totalRevenue - totalCost;
  const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
  
  // Daily breakdown
  const dailyBreakdown = {};
  outletOrders.forEach(order => {
    const day = order.date.split('T')[0];
    if (!dailyBreakdown[day]) {
      dailyBreakdown[day] = { revenue: 0, orders: 0, items: 0, cost: 0 };
    }
    dailyBreakdown[day].revenue += order.total;
    dailyBreakdown[day].orders += 1;
    dailyBreakdown[day].items += order.items.reduce((sum, i) => sum + i.quantity, 0);
    
    order.items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product && product.cost) {
        dailyBreakdown[day].cost += product.cost * item.quantity;
      }
    });
  });
  
  const performance = {
    outlet: {
      id: outlet.id,
      name: outlet.name,
      address: outlet.address
    },
    period: { startDate, endDate },
    summary: {
      totalRevenue,
      totalCost,
      grossProfit,
      profitMargin: parseFloat(profitMargin.toFixed(2)),
      totalOrders,
      totalItems,
      averageOrderValue: parseFloat(averageOrderValue.toFixed(2))
    },
    dailyBreakdown: Object.entries(dailyBreakdown)
      .map(([date, data]) => ({
        date,
        ...data,
        profit: data.revenue - data.cost,
        margin: data.revenue > 0 ? ((data.revenue - data.cost) / data.revenue * 100).toFixed(2) : 0
      }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    orders: outletOrders
  };
  
  res.json(performance);
});

// Get all outlets performance summary
router.get('/performance/summary', (req, res) => {
  const { startDate, endDate } = req.query;
  const outlets = readOutlets();
  
  // Read orders
  const ordersPath = path.join(__dirname, '../data/sales/orders.json');
  let orders = [];
  try {
    orders = JSON.parse(fs.readFileSync(ordersPath, 'utf8'));
  } catch (error) {
    orders = [];
  }
  
  // Read products for cost calculation
  const productsPath = path.join(__dirname, '../data/products/products.json');
  let products = [];
  try {
    products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
  } catch (error) {
    products = [];
  }
  
  // Filter orders by date
  let filteredOrders = orders;
  if (startDate) {
    filteredOrders = filteredOrders.filter(o => new Date(o.date) >= new Date(startDate));
  }
  if (endDate) {
    filteredOrders = filteredOrders.filter(o => new Date(o.date) <= new Date(endDate));
  }
  
  // Calculate performance for each outlet
  const outletPerformance = outlets.map(outlet => {
    const outletOrders = filteredOrders.filter(o => o.outletId === outlet.id);
    
    const totalRevenue = outletOrders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = outletOrders.length;
    
    let totalCost = 0;
    outletOrders.forEach(order => {
      order.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product && product.cost) {
          totalCost += product.cost * item.quantity;
        }
      });
    });
    
    const grossProfit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
    
    return {
      outletId: outlet.id,
      outletName: outlet.name,
      totalRevenue,
      totalCost,
      grossProfit,
      profitMargin: parseFloat(profitMargin.toFixed(2)),
      totalOrders,
      averageOrderValue: totalOrders > 0 ? parseFloat((totalRevenue / totalOrders).toFixed(2)) : 0
    };
  });
  
  // Sort by revenue descending
  outletPerformance.sort((a, b) => b.totalRevenue - a.totalRevenue);
  
  res.json({
    period: { startDate, endDate },
    outlets: outletPerformance,
    summary: {
      totalOutlets: outlets.length,
      totalRevenue: outletPerformance.reduce((sum, o) => sum + o.totalRevenue, 0),
      totalCost: outletPerformance.reduce((sum, o) => sum + o.totalCost, 0),
      totalProfit: outletPerformance.reduce((sum, o) => sum + o.grossProfit, 0)
    }
  });
});

module.exports = router;

