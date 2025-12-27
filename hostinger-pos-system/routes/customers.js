const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const customersPath = path.join(__dirname, '../data/customers/customers.json');
const ordersPath = path.join(__dirname, '../data/sales/orders.json');

// Helper functions
const readCustomers = () => {
  try {
    return JSON.parse(fs.readFileSync(customersPath, 'utf8'));
  } catch (error) {
    return [];
  }
};

const writeCustomers = (data) => {
  fs.writeFileSync(customersPath, JSON.stringify(data, null, 2));
};

const readOrders = () => {
  try {
    return JSON.parse(fs.readFileSync(ordersPath, 'utf8'));
  } catch (error) {
    return [];
  }
};

// Get all customers
router.get('/', (req, res) => {
  const customers = readCustomers();
  res.json(customers);
});

// Get customer by ID
router.get('/:id', (req, res) => {
  const customers = readCustomers();
  const customer = customers.find(c => c.id === req.params.id);
  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }
  
  // Get customer orders
  const orders = readOrders();
  const customerOrders = orders.filter(o => o.customerId === req.params.id);
  
  const totalSpent = customerOrders.reduce((sum, o) => sum + o.total, 0);
  
  res.json({
    ...customer,
    totalOrders: customerOrders.length,
    totalSpent,
    lastOrderDate: customerOrders.length > 0 
      ? customerOrders.sort((a, b) => new Date(b.date) - new Date(a.date))[0].date 
      : null
  });
});

// Create customer
router.post('/', (req, res) => {
  const customers = readCustomers();
  const newCustomer = {
    id: uuidv4(),
    name: req.body.name,
    email: req.body.email || '',
    phone: req.body.phone || '',
    whatsapp: req.body.whatsapp || req.body.phone || '',
    address: req.body.address || '',
    city: req.body.city || '',
    postalCode: req.body.postalCode || '',
    country: req.body.country || 'Indonesia',
    customerType: req.body.customerType || 'retail',
    notes: req.body.notes || '',
    tags: req.body.tags || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  customers.push(newCustomer);
  writeCustomers(customers);
  res.status(201).json(newCustomer);
});

// Update customer
router.put('/:id', (req, res) => {
  const customers = readCustomers();
  const index = customers.findIndex(c => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Customer not found' });
  }
  
  customers[index] = {
    ...customers[index],
    ...req.body,
    id: req.params.id,
    updatedAt: new Date().toISOString()
  };
  
  writeCustomers(customers);
  res.json(customers[index]);
});

// Delete customer
router.delete('/:id', (req, res) => {
  const customers = readCustomers();
  const filtered = customers.filter(c => c.id !== req.params.id);
  if (filtered.length === customers.length) {
    return res.status(404).json({ error: 'Customer not found' });
  }
  writeCustomers(filtered);
  res.json({ message: 'Customer deleted successfully' });
});

// Search customers
router.get('/search/:query', (req, res) => {
  const customers = readCustomers();
  const query = req.params.query.toLowerCase();
  
  const results = customers.filter(c => 
    c.name.toLowerCase().includes(query) ||
    c.email.toLowerCase().includes(query) ||
    c.phone.includes(query) ||
    c.whatsapp.includes(query)
  );
  
  res.json(results);
});

module.exports = router;

