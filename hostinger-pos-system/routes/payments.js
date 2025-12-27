const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const paymentsPath = path.join(__dirname, '../data/sales/payments.json');

// Helper functions
const readPayments = () => {
  try {
    return JSON.parse(fs.readFileSync(paymentsPath, 'utf8'));
  } catch (error) {
    return [];
  }
};

const writePayments = (data) => {
  fs.writeFileSync(paymentsPath, JSON.stringify(data, null, 2));
};

// Payment gateway configurations for Indonesia
const paymentGateways = {
  'gopay': {
    name: 'GoPay',
    provider: 'Gojek',
    fee: 0.01, // 1% transaction fee
    apiEndpoint: 'https://api.gojek.com/payments',
    supportedMethods: ['gopay', 'gopay-later']
  },
  'ovo': {
    name: 'OVO',
    provider: 'OVO',
    fee: 0.015, // 1.5% transaction fee
    apiEndpoint: 'https://api.ovo.id/payments',
    supportedMethods: ['ovo', 'ovo-points']
  },
  'dana': {
    name: 'DANA',
    provider: 'DANA',
    fee: 0.01, // 1% transaction fee
    apiEndpoint: 'https://api.dana.id/payments',
    supportedMethods: ['dana', 'dana-kredit']
  },
  'shopeepay': {
    name: 'ShopeePay',
    provider: 'Shopee',
    fee: 0.01, // 1% transaction fee
    apiEndpoint: 'https://api.shopee.co.id/payments',
    supportedMethods: ['shopeepay']
  },
  'grabpay': {
    name: 'GrabPay',
    provider: 'Grab',
    fee: 0.015, // 1.5% transaction fee
    apiEndpoint: 'https://api.grab.com/payments',
    supportedMethods: ['grabpay', 'grabpay-later']
  },
  'linkaja': {
    name: 'LinkAja',
    provider: 'Telkomsel',
    fee: 0.01, // 1% transaction fee
    apiEndpoint: 'https://api.linkaja.com/payments',
    supportedMethods: ['linkaja']
  },
  'qris': {
    name: 'QRIS',
    provider: 'Bank Indonesia',
    fee: 0.004, // 0.4% transaction fee
    apiEndpoint: 'https://api.qris.id/payments',
    supportedMethods: ['qris']
  }
};

// Get all payment gateways
router.get('/gateways', (req, res) => {
  res.json(Object.keys(paymentGateways).map(key => ({
    id: key,
    ...paymentGateways[key]
  })));
});

// Process payment
router.post('/process', async (req, res) => {
  const { orderId, amount, paymentMethod, gateway, customerInfo } = req.body;
  
  if (!orderId || !amount || !paymentMethod) {
    return res.status(400).json({ error: 'Order ID, amount, and payment method are required' });
  }
  
  const gatewayConfig = paymentGateways[gateway];
  if (!gatewayConfig) {
    return res.status(400).json({ error: 'Invalid payment gateway' });
  }
  
  const transactionFee = amount * gatewayConfig.fee;
  const totalAmount = amount + transactionFee;
  
  // Simulate payment processing
  // In production, this would call the actual payment gateway API
  const payment = {
    id: uuidv4(),
    orderId,
    amount,
    transactionFee,
    totalAmount,
    paymentMethod,
    gateway: gateway,
    gatewayName: gatewayConfig.name,
    status: 'pending', // pending, processing, success, failed, refunded
    customerInfo: customerInfo || {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simulate payment success (90% success rate)
  const isSuccess = Math.random() > 0.1;
  payment.status = isSuccess ? 'success' : 'failed';
  payment.transactionId = isSuccess ? `TXN-${Date.now()}` : null;
  payment.updatedAt = new Date().toISOString();
  
  const payments = readPayments();
  payments.push(payment);
  writePayments(payments);
  
  if (isSuccess) {
    res.json({
      success: true,
      payment: payment,
      message: `Payment processed successfully via ${gatewayConfig.name}`
    });
  } else {
    res.status(400).json({
      success: false,
      payment: payment,
      error: 'Payment processing failed. Please try again.'
    });
  }
});

// Get payment by ID
router.get('/:id', (req, res) => {
  const payments = readPayments();
  const payment = payments.find(p => p.id === req.params.id);
  if (!payment) {
    return res.status(404).json({ error: 'Payment not found' });
  }
  res.json(payment);
});

// Get payments by order ID
router.get('/order/:orderId', (req, res) => {
  const payments = readPayments();
  const orderPayments = payments.filter(p => p.orderId === req.params.orderId);
  res.json(orderPayments);
});

// Refund payment
router.post('/:id/refund', async (req, res) => {
  const { reason } = req.body;
  const payments = readPayments();
  const payment = payments.find(p => p.id === req.params.id);
  
  if (!payment) {
    return res.status(404).json({ error: 'Payment not found' });
  }
  
  if (payment.status !== 'success') {
    return res.status(400).json({ error: 'Can only refund successful payments' });
  }
  
  // Simulate refund processing
  payment.status = 'refunded';
  payment.refundReason = reason || 'Customer request';
  payment.refundedAt = new Date().toISOString();
  payment.updatedAt = new Date().toISOString();
  
  writePayments(payments);
  
  res.json({
    success: true,
    payment: payment,
    message: 'Refund processed successfully'
  });
});

// Get payment statistics
router.get('/stats/summary', (req, res) => {
  const payments = readPayments();
  const { startDate, endDate } = req.query;
  
  let filtered = payments.filter(p => p.status === 'success');
  
  if (startDate) {
    filtered = filtered.filter(p => new Date(p.createdAt) >= new Date(startDate));
  }
  if (endDate) {
    filtered = filtered.filter(p => new Date(p.createdAt) <= new Date(endDate));
  }
  
  const stats = {
    totalPayments: filtered.length,
    totalAmount: filtered.reduce((sum, p) => sum + p.amount, 0),
    totalFees: filtered.reduce((sum, p) => sum + p.transactionFee, 0),
    byGateway: {},
    byMethod: {},
    averageTransaction: 0
  };
  
  filtered.forEach(payment => {
    // By gateway
    if (!stats.byGateway[payment.gateway]) {
      stats.byGateway[payment.gateway] = {
        count: 0,
        amount: 0
      };
    }
    stats.byGateway[payment.gateway].count++;
    stats.byGateway[payment.gateway].amount += payment.amount;
    
    // By method
    if (!stats.byMethod[payment.paymentMethod]) {
      stats.byMethod[payment.paymentMethod] = {
        count: 0,
        amount: 0
      };
    }
    stats.byMethod[payment.paymentMethod].count++;
    stats.byMethod[payment.paymentMethod].amount += payment.amount;
  });
  
  stats.averageTransaction = filtered.length > 0 ? stats.totalAmount / filtered.length : 0;
  
  res.json(stats);
});

module.exports = router;

