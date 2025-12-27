const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const ordersPath = path.join(__dirname, '../data/sales/orders.json');
const deliveryOrdersPath = path.join(__dirname, '../data/sales/delivery-orders.json');

// Helper functions
const readOrders = () => {
  try {
    return JSON.parse(fs.readFileSync(ordersPath, 'utf8'));
  } catch (error) {
    return [];
  }
};

const writeOrders = (data) => {
  fs.writeFileSync(ordersPath, JSON.stringify(data, null, 2));
};

const readDeliveryOrders = () => {
  try {
    return JSON.parse(fs.readFileSync(deliveryOrdersPath, 'utf8'));
  } catch (error) {
    return [];
  }
};

const writeDeliveryOrders = (data) => {
  fs.writeFileSync(deliveryOrdersPath, JSON.stringify(data, null, 2));
};

// Delivery service configurations
const deliveryServices = {
  'gofood': {
    name: 'GoFood',
    apiEndpoint: 'https://api.gojek.com/food/orders',
    paymentMethods: ['gopay', 'ovo', 'cash', 'credit-card'],
    commissionRate: 0.15, // 15% commission
    webhookUrl: '/api/delivery/webhook/gofood'
  },
  'shopeefood': {
    name: 'ShopeeFood',
    apiEndpoint: 'https://api.shopee.co.id/food/orders',
    paymentMethods: ['shopeepay', 'ovo', 'dana', 'cash'],
    commissionRate: 0.12, // 12% commission
    webhookUrl: '/api/delivery/webhook/shopeefood'
  },
  'grabfood': {
    name: 'GrabFood',
    apiEndpoint: 'https://api.grab.com/food/orders',
    paymentMethods: ['grabpay', 'ovo', 'dana', 'cash'],
    commissionRate: 0.18, // 18% commission
    webhookUrl: '/api/delivery/webhook/grabfood'
  }
};

// Get all delivery services
router.get('/services', (req, res) => {
  res.json(Object.keys(deliveryServices).map(key => ({
    id: key,
    ...deliveryServices[key]
  })));
});

// Create delivery order
router.post('/order', (req, res) => {
  const { items, customerInfo, deliveryService, paymentMethod, deliveryAddress, notes } = req.body;
  
  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'Order items are required' });
  }
  
  if (!deliveryService || !deliveryServices[deliveryService]) {
    return res.status(400).json({ error: 'Valid delivery service is required' });
  }
  
  const service = deliveryServices[deliveryService];
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const commission = subtotal * service.commissionRate;
  const deliveryFee = req.body.deliveryFee || 0;
  const total = subtotal - commission + deliveryFee;
  
  const deliveryOrder = {
    id: uuidv4(),
    orderNumber: `DEL-${Date.now()}`,
    deliveryService: deliveryService,
    serviceName: service.name,
    items: items,
    customerInfo: {
      name: customerInfo.name || 'Customer',
      phone: customerInfo.phone || '',
      email: customerInfo.email || '',
      address: deliveryAddress || ''
    },
    subtotal,
    commission,
    deliveryFee,
    total,
    paymentMethod: paymentMethod || 'online',
    status: 'pending', // pending, confirmed, preparing, ready, out_for_delivery, delivered, cancelled
    deliveryAddress: deliveryAddress || '',
    notes: notes || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  const deliveryOrders = readDeliveryOrders();
  deliveryOrders.push(deliveryOrder);
  writeDeliveryOrders(deliveryOrders);
  
  // Also create regular order for accounting
  const order = {
    id: uuidv4(),
    orderNumber: deliveryOrder.orderNumber,
    items: items,
    customerId: null,
    subtotal,
    discount: commission, // Commission as discount
    tax: 0,
    total: subtotal - commission,
    paymentMethod: paymentMethod || 'online',
    status: 'completed',
    orderType: 'delivery',
    deliveryService: deliveryService,
    date: new Date().toISOString(),
    userId: 'system'
  };
  
  const orders = readOrders();
  orders.push(order);
  writeOrders(orders);
  
  res.status(201).json({
    order: deliveryOrder,
    message: `Order created for ${service.name}`,
    nextSteps: {
      syncToService: `/api/delivery/sync/${deliveryOrder.id}`,
      updateStatus: `/api/delivery/status/${deliveryOrder.id}`
    }
  });
});

// Get all delivery orders
router.get('/orders', (req, res) => {
  const orders = readDeliveryOrders();
  const { status, service, startDate, endDate } = req.query;
  
  let filtered = orders;
  
  if (status) {
    filtered = filtered.filter(o => o.status === status);
  }
  if (service) {
    filtered = filtered.filter(o => o.deliveryService === service);
  }
  if (startDate) {
    filtered = filtered.filter(o => new Date(o.createdAt) >= new Date(startDate));
  }
  if (endDate) {
    filtered = filtered.filter(o => new Date(o.createdAt) <= new Date(endDate));
  }
  
  res.json(filtered);
});

// Get delivery order by ID
router.get('/orders/:id', (req, res) => {
  const orders = readDeliveryOrders();
  const order = orders.find(o => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Delivery order not found' });
  }
  res.json(order);
});

// Update delivery order status
router.put('/orders/:id/status', (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'];
  
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  
  const orders = readDeliveryOrders();
  const index = orders.findIndex(o => o.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Delivery order not found' });
  }
  
  orders[index].status = status;
  orders[index].updatedAt = new Date().toISOString();
  writeDeliveryOrders(orders);
  
  res.json(orders[index]);
});

// Sync order to delivery service (simulated - in production, this would call actual API)
router.post('/sync/:id', async (req, res) => {
  const orders = readDeliveryOrders();
  const order = orders.find(o => o.id === req.params.id);
  
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  
  const service = deliveryServices[order.deliveryService];
  
  // Simulate API call to delivery service
  // In production, you would make actual HTTP request to service.apiEndpoint
  const syncResult = {
    success: true,
    serviceOrderId: `SRV-${Date.now()}`,
    message: `Order synced to ${service.name}`,
    estimatedDeliveryTime: '30-45 minutes',
    trackingUrl: `https://${order.deliveryService}.com/track/${order.orderNumber}`
  };
  
  // Update order with service info
  const index = orders.findIndex(o => o.id === req.params.id);
  orders[index].serviceOrderId = syncResult.serviceOrderId;
  orders[index].status = 'confirmed';
  orders[index].estimatedDeliveryTime = syncResult.estimatedDeliveryTime;
  orders[index].trackingUrl = syncResult.trackingUrl;
  orders[index].updatedAt = new Date().toISOString();
  writeDeliveryOrders(orders);
  
  res.json(syncResult);
});

// Webhook endpoint for delivery services (to receive order updates)
router.post('/webhook/:service', (req, res) => {
  const { service } = req.params;
  const webhookData = req.body;
  
  if (!deliveryServices[service]) {
    return res.status(400).json({ error: 'Invalid service' });
  }
  
  // Process webhook data
  // In production, verify webhook signature for security
  const orders = readDeliveryOrders();
  const order = orders.find(o => o.serviceOrderId === webhookData.orderId);
  
  if (order) {
    order.status = webhookData.status || order.status;
    order.updatedAt = new Date().toISOString();
    writeDeliveryOrders(orders);
  }
  
  res.json({ received: true });
});

// Get delivery statistics
router.get('/stats', (req, res) => {
  const orders = readDeliveryOrders();
  const { startDate, endDate } = req.query;
  
  let filtered = orders;
  if (startDate) {
    filtered = filtered.filter(o => new Date(o.createdAt) >= new Date(startDate));
  }
  if (endDate) {
    filtered = filtered.filter(o => new Date(o.createdAt) <= new Date(endDate));
  }
  
  const stats = {
    totalOrders: filtered.length,
    byService: {},
    byStatus: {},
    totalRevenue: 0,
    totalCommission: 0,
    averageOrderValue: 0
  };
  
  filtered.forEach(order => {
    // By service
    if (!stats.byService[order.deliveryService]) {
      stats.byService[order.deliveryService] = 0;
    }
    stats.byService[order.deliveryService]++;
    
    // By status
    if (!stats.byStatus[order.status]) {
      stats.byStatus[order.status] = 0;
    }
    stats.byStatus[order.status]++;
    
    // Revenue
    stats.totalRevenue += order.subtotal;
    stats.totalCommission += order.commission;
  });
  
  stats.averageOrderValue = filtered.length > 0 ? stats.totalRevenue / filtered.length : 0;
  
  res.json(stats);
});

module.exports = router;

