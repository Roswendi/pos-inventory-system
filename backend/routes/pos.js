const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const ordersPath = path.join(__dirname, '../data/sales/orders.json');
const receiptsPath = path.join(__dirname, '../data/sales/receipts.json');
const cancellationsPath = path.join(__dirname, '../data/sales/cancellations.json');
const productsPath = path.join(__dirname, '../data/products/products.json');
const transactionsPath = path.join(__dirname, '../data/accounting/transactions.json');

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

const readReceipts = () => {
  try {
    return JSON.parse(fs.readFileSync(receiptsPath, 'utf8'));
  } catch (error) {
    return [];
  }
};

const writeReceipts = (data) => {
  fs.writeFileSync(receiptsPath, JSON.stringify(data, null, 2));
};

const readCancellations = () => {
  try {
    if (!fs.existsSync(cancellationsPath)) {
      fs.writeFileSync(cancellationsPath, JSON.stringify([], null, 2));
    }
    return JSON.parse(fs.readFileSync(cancellationsPath, 'utf8'));
  } catch (error) {
    return [];
  }
};

const writeCancellations = (data) => {
  fs.writeFileSync(cancellationsPath, JSON.stringify(data, null, 2));
};

const readProducts = () => {
  try {
    return JSON.parse(fs.readFileSync(productsPath, 'utf8'));
  } catch (error) {
    return [];
  }
};

const updateProductStock = (productId, quantity) => {
  const products = readProducts();
  const product = products.find(p => p.id === productId);
  if (product) {
    product.stock = Math.max(0, (product.stock || 0) - quantity);
    fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));
  }
};

const createAccountingTransaction = (order) => {
  const transactions = JSON.parse(fs.readFileSync(transactionsPath, 'utf8'));
  
  // Debit: Cash (11000)
  transactions.push({
    id: uuidv4(),
    date: order.date,
    accountCode: '11000',
    type: 'debit',
    amount: order.total,
    description: `Penjualan Order #${order.orderNumber}`,
    reference: order.id,
    referenceType: 'sale'
  });
  
  // Credit: Revenue (41000)
  transactions.push({
    id: uuidv4(),
    date: order.date,
    accountCode: '41000',
    type: 'credit',
    amount: order.total,
    description: `Penjualan Order #${order.orderNumber}`,
    reference: order.id,
    referenceType: 'sale'
  });
  
  // Debit: COGS (51000) - if products have cost
  const totalCost = order.items.reduce((sum, item) => {
    const products = readProducts();
    const product = products.find(p => p.id === item.productId);
    return sum + ((product?.cost || 0) * item.quantity);
  }, 0);
  
  if (totalCost > 0) {
    transactions.push({
      id: uuidv4(),
      date: order.date,
      accountCode: '51000',
      type: 'debit',
      amount: totalCost,
      description: `HPP Order #${order.orderNumber}`,
      reference: order.id,
      referenceType: 'sale'
    });
    
    // Credit: Inventory (13000)
    transactions.push({
      id: uuidv4(),
      date: order.date,
      accountCode: '13000',
      type: 'credit',
      amount: totalCost,
      description: `HPP Order #${order.orderNumber}`,
      reference: order.id,
      referenceType: 'sale'
    });
  }
  
  fs.writeFileSync(transactionsPath, JSON.stringify(transactions, null, 2));
};

// Create new order
router.post('/order', (req, res) => {
  const { items, customerId, paymentMethod, discount, tax } = req.body;
  
  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'Order items are required' });
  }
  
  const products = readProducts();
  let subtotal = 0;
  const orderItems = [];
  
  // Validate and calculate order
  for (const item of items) {
    const product = products.find(p => p.id === item.productId);
    if (!product) {
      return res.status(400).json({ error: `Product ${item.productId} not found` });
    }
    if ((product.stock || 0) < item.quantity) {
      return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
    }
    
    const itemTotal = product.price * item.quantity;
    subtotal += itemTotal;
    
    orderItems.push({
      productId: product.id,
      productName: product.name,
      quantity: item.quantity,
      price: product.price,
      total: itemTotal
    });
    
    // Update stock
    updateProductStock(product.id, item.quantity);
  }
  
  const discountAmount = parseFloat(discount || 0);
  const taxAmount = parseFloat(tax || 0);
  const total = subtotal - discountAmount + taxAmount;
  
  const order = {
    id: uuidv4(),
    orderNumber: `ORD-${Date.now()}`,
    items: orderItems,
    customerId: customerId || null,
    outletId: req.body.outletId || null,
    subtotal,
    discount: discountAmount,
    tax: taxAmount,
    total,
    paymentMethod: paymentMethod || 'cash',
    status: 'completed',
    date: new Date().toISOString(),
    userId: req.body.userId || 'system'
  };
  
  const orders = readOrders();
  orders.push(order);
  writeOrders(orders);
  
  // Create receipt
  const receipt = {
    id: uuidv4(),
    orderId: order.id,
    orderNumber: order.orderNumber,
    ...order,
    receiptNumber: `RCP-${Date.now()}`
  };
  
  const receipts = readReceipts();
  receipts.push(receipt);
  writeReceipts(receipts);
  
  // Create accounting transactions
  createAccountingTransaction(order);
  
  res.status(201).json({ order, receipt });
});

// Get all orders
router.get('/orders', (req, res) => {
  const orders = readOrders();
  const { startDate, endDate, status } = req.query;
  
  let filtered = orders;
  
  if (startDate) {
    filtered = filtered.filter(o => new Date(o.date) >= new Date(startDate));
  }
  if (endDate) {
    filtered = filtered.filter(o => new Date(o.date) <= new Date(endDate));
  }
  if (status) {
    filtered = filtered.filter(o => o.status === status);
  }
  
  res.json(filtered);
});

// Get order by ID
router.get('/orders/:id', (req, res) => {
  const orders = readOrders();
  const order = orders.find(o => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json(order);
});

// Get receipt by order ID
router.get('/receipt/:orderId', (req, res) => {
  const receipts = readReceipts();
  const receipt = receipts.find(r => r.orderId === req.params.orderId);
  if (!receipt) {
    return res.status(404).json({ error: 'Receipt not found' });
  }
  res.json(receipt);
});

// Get sales summary
router.get('/summary', (req, res) => {
  const orders = readOrders();
  const { startDate, endDate } = req.query;
  
  let filtered = orders;
  if (startDate) {
    filtered = filtered.filter(o => new Date(o.date) >= new Date(startDate));
  }
  if (endDate) {
    filtered = filtered.filter(o => new Date(o.date) <= new Date(endDate));
  }
  
  const summary = {
    totalOrders: filtered.length,
    totalRevenue: filtered.reduce((sum, o) => sum + o.total, 0),
    totalItems: filtered.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0),
    averageOrderValue: filtered.length > 0 ? filtered.reduce((sum, o) => sum + o.total, 0) / filtered.length : 0
  };
  
  res.json(summary);
});

// Request item cancellation (requires manager approval)
router.post('/cancel-item', (req, res) => {
  const { orderId, itemId, reason, requestedBy } = req.body;
  
  if (!orderId || !itemId || !reason) {
    return res.status(400).json({ error: 'Order ID, item ID, and reason are required' });
  }
  
  const orders = readOrders();
  const order = orders.find(o => o.id === orderId);
  
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  
  const item = order.items.find(i => i.productId === itemId);
  if (!item) {
    return res.status(404).json({ error: 'Item not found in order' });
  }
  
  const cancellations = readCancellations();
  const cancellation = {
    id: uuidv4(),
    orderId,
    orderNumber: order.orderNumber,
    itemId,
    productId: item.productId,
    productName: item.productName,
    quantity: item.quantity,
    price: item.price,
    amount: item.total,
    reason,
    status: 'pending', // pending, approved, rejected
    requestedBy: requestedBy || 'system',
    requestedAt: new Date().toISOString(),
    approvedBy: null,
    approvedAt: null,
    rejectedBy: null,
    rejectedAt: null
  };
  
  cancellations.push(cancellation);
  writeCancellations(cancellations);
  
  res.status(201).json({ cancellation, message: 'Cancellation request created. Waiting for manager approval.' });
});

// Get pending cancellations
router.get('/cancellations/pending', (req, res) => {
  const cancellations = readCancellations();
  const pending = cancellations.filter(c => c.status === 'pending');
  res.json(pending);
});

// Approve cancellation (manager only)
router.post('/cancellations/:id/approve', (req, res) => {
  const { id } = req.params;
  const { approvedBy } = req.body;
  
  const cancellations = readCancellations();
  const cancellation = cancellations.find(c => c.id === id);
  
  if (!cancellation) {
    return res.status(404).json({ error: 'Cancellation request not found' });
  }
  
  if (cancellation.status !== 'pending') {
    return res.status(400).json({ error: 'Cancellation request already processed' });
  }
  
  // Update cancellation status
  cancellation.status = 'approved';
  cancellation.approvedBy = approvedBy || 'manager';
  cancellation.approvedAt = new Date().toISOString();
  
  // Update order - remove item
  const orders = readOrders();
  const order = orders.find(o => o.id === cancellation.orderId);
  if (order) {
    // Remove item from order
    order.items = order.items.filter(i => i.productId !== cancellation.itemId);
    
    // Recalculate totals
    order.subtotal = order.items.reduce((sum, i) => sum + i.total, 0);
    order.total = order.subtotal - (order.discount || 0) + (order.tax || 0);
    
    // Restore stock
    const products = readProducts();
    const product = products.find(p => p.id === cancellation.productId);
    if (product) {
      product.stock = (product.stock || 0) + cancellation.quantity;
      fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));
    }
    
    writeOrders(orders);
  }
  
  writeCancellations(cancellations);
  
  res.json({ cancellation, message: 'Cancellation approved and item removed from order' });
});

// Reject cancellation (manager only)
router.post('/cancellations/:id/reject', (req, res) => {
  const { id } = req.params;
  const { rejectedBy, rejectionReason } = req.body;
  
  const cancellations = readCancellations();
  const cancellation = cancellations.find(c => c.id === id);
  
  if (!cancellation) {
    return res.status(404).json({ error: 'Cancellation request not found' });
  }
  
  if (cancellation.status !== 'pending') {
    return res.status(400).json({ error: 'Cancellation request already processed' });
  }
  
  cancellation.status = 'rejected';
  cancellation.rejectedBy = rejectedBy || 'manager';
  cancellation.rejectedAt = new Date().toISOString();
  cancellation.rejectionReason = rejectionReason || 'No reason provided';
  
  writeCancellations(cancellations);
  
  res.json({ cancellation, message: 'Cancellation request rejected' });
});

// Get all cancellations
router.get('/cancellations', (req, res) => {
  const { status, startDate, endDate } = req.query;
  let cancellations = readCancellations();
  
  if (status) {
    cancellations = cancellations.filter(c => c.status === status);
  }
  if (startDate) {
    cancellations = cancellations.filter(c => new Date(c.requestedAt) >= new Date(startDate));
  }
  if (endDate) {
    cancellations = cancellations.filter(c => new Date(c.requestedAt) <= new Date(endDate));
  }
  
  res.json(cancellations);
});

module.exports = router;

