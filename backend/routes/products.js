const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const dataPath = path.join(__dirname, '../data/products/products.json');

// Helper function to read data
const readData = () => {
  try {
    const data = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

// Helper function to write data
const writeData = (data) => {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
};

// Get all products
router.get('/', (req, res) => {
  const products = readData();
  res.json(products);
});

// Get product by ID
router.get('/:id', (req, res) => {
  const products = readData();
  const product = products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});

// Create product
router.post('/', (req, res) => {
  const products = readData();
  const newProduct = {
    id: uuidv4(),
    name: req.body.name,
    sku: req.body.sku || `SKU-${Date.now()}`,
    description: req.body.description || '',
    category: req.body.category || 'General',
    price: parseFloat(req.body.price) || 0,
    cost: parseFloat(req.body.cost) || 0,
    stock: parseInt(req.body.stock) || 0,
    minStock: parseInt(req.body.minStock) || 10,
    unit: req.body.unit || 'pcs',
    image: req.body.image || '',
    barcode: req.body.barcode || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  products.push(newProduct);
  writeData(products);
  res.status(201).json(newProduct);
});

// Update product
router.put('/:id', (req, res) => {
  const products = readData();
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }
  products[index] = {
    ...products[index],
    ...req.body,
    id: req.params.id,
    updatedAt: new Date().toISOString()
  };
  writeData(products);
  res.json(products[index]);
});

// Delete product
router.delete('/:id', (req, res) => {
  const products = readData();
  const filtered = products.filter(p => p.id !== req.params.id);
  if (filtered.length === products.length) {
    return res.status(404).json({ error: 'Product not found' });
  }
  writeData(filtered);
  res.json({ message: 'Product deleted successfully' });
});

module.exports = router;

