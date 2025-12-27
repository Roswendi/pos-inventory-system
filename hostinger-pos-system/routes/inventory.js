const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const stockPath = path.join(__dirname, '../data/inventory/stock.json');
const transactionsPath = path.join(__dirname, '../data/inventory/transactions.json');
const productsPath = path.join(__dirname, '../data/products/products.json');

// Helper functions
const readStock = () => {
  try {
    return JSON.parse(fs.readFileSync(stockPath, 'utf8'));
  } catch (error) {
    return [];
  }
};

const writeStock = (data) => {
  fs.writeFileSync(stockPath, JSON.stringify(data, null, 2));
};

const readTransactions = () => {
  try {
    return JSON.parse(fs.readFileSync(transactionsPath, 'utf8'));
  } catch (error) {
    return [];
  }
};

const writeTransactions = (data) => {
  fs.writeFileSync(transactionsPath, JSON.stringify(data, null, 2));
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
    product.stock = Math.max(0, (product.stock || 0) + quantity);
    fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));
  }
};

// Get all stock levels
router.get('/stock', (req, res) => {
  const stock = readStock();
  const products = readProducts();
  
  // Merge stock data with product info
  const stockWithProducts = stock.map(item => {
    const product = products.find(p => p.id === item.productId);
    return {
      ...item,
      product: product || null
    };
  });
  
  res.json(stockWithProducts);
});

// Get low stock items
router.get('/stock/low', (req, res) => {
  const products = readProducts();
  const lowStock = products.filter(p => (p.stock || 0) <= (p.minStock || 10));
  res.json(lowStock);
});

// Get inventory transactions
router.get('/transactions', (req, res) => {
  const transactions = readTransactions();
  const { startDate, endDate, type } = req.query;
  
  let filtered = transactions;
  
  if (startDate) {
    filtered = filtered.filter(t => new Date(t.date) >= new Date(startDate));
  }
  if (endDate) {
    filtered = filtered.filter(t => new Date(t.date) <= new Date(endDate));
  }
  if (type) {
    filtered = filtered.filter(t => t.type === type);
  }
  
  res.json(filtered);
});

// Add stock (Stock In)
router.post('/stock-in', (req, res) => {
  const { productId, quantity, reason, notes } = req.body;
  
  if (!productId || !quantity) {
    return res.status(400).json({ error: 'Product ID and quantity are required' });
  }
  
  const transaction = {
    id: uuidv4(),
    productId,
    type: 'stock-in',
    quantity: parseInt(quantity),
    reason: reason || 'Manual Entry',
    notes: notes || '',
    date: new Date().toISOString(),
    userId: req.body.userId || 'system'
  };
  
  const transactions = readTransactions();
  transactions.push(transaction);
  writeTransactions(transactions);
  
  // Update product stock
  updateProductStock(productId, parseInt(quantity));
  
  res.status(201).json(transaction);
});

// Remove stock (Stock Out)
router.post('/stock-out', (req, res) => {
  const { productId, quantity, reason, notes } = req.body;
  
  if (!productId || !quantity) {
    return res.status(400).json({ error: 'Product ID and quantity are required' });
  }
  
  const products = readProducts();
  const product = products.find(p => p.id === productId);
  
  if (!product || (product.stock || 0) < parseInt(quantity)) {
    return res.status(400).json({ error: 'Insufficient stock' });
  }
  
  const transaction = {
    id: uuidv4(),
    productId,
    type: 'stock-out',
    quantity: parseInt(quantity),
    reason: reason || 'Manual Entry',
    notes: notes || '',
    date: new Date().toISOString(),
    userId: req.body.userId || 'system'
  };
  
  const transactions = readTransactions();
  transactions.push(transaction);
  writeTransactions(transactions);
  
  // Update product stock
  updateProductStock(productId, -parseInt(quantity));
  
  res.status(201).json(transaction);
});

// Adjust stock
router.post('/stock-adjust', (req, res) => {
  const { productId, newQuantity, reason, notes } = req.body;
  
  if (!productId || newQuantity === undefined) {
    return res.status(400).json({ error: 'Product ID and new quantity are required' });
  }
  
  const products = readProducts();
  const product = products.find(p => p.id === productId);
  
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  const oldQuantity = product.stock || 0;
  const difference = parseInt(newQuantity) - oldQuantity;
  
  const transaction = {
    id: uuidv4(),
    productId,
    type: 'adjustment',
    quantity: difference,
    oldQuantity,
    newQuantity: parseInt(newQuantity),
    reason: reason || 'Stock Adjustment',
    notes: notes || '',
    date: new Date().toISOString(),
    userId: req.body.userId || 'system'
  };
  
  const transactions = readTransactions();
  transactions.push(transaction);
  writeTransactions(transactions);
  
  // Update product stock
  updateProductStock(productId, difference);
  
  res.status(201).json(transaction);
});

module.exports = router;

