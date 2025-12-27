const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const ordersPath = path.join(__dirname, '../data/sales/orders.json');
const receiptsPath = path.join(__dirname, '../data/sales/receipts.json');
const cancellationsPath = path.join(__dirname, '../data/sales/cancellations.json');
const wastePath = path.join(__dirname, '../data/sales/waste.json');
const promotionsPath = path.join(__dirname, '../data/sales/promotions.json');
const paymentsPath = path.join(__dirname, '../data/sales/payments.json');
const tablesPath = path.join(__dirname, '../data/sales/tables.json');
const productsPath = path.join(__dirname, '../data/products/products.json');

// Helper functions
const readOrders = () => {
  try {
    return JSON.parse(fs.readFileSync(ordersPath, 'utf8'));
  } catch (error) {
    return [];
  }
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

const readWaste = () => {
  try {
    if (!fs.existsSync(wastePath)) {
      fs.writeFileSync(wastePath, JSON.stringify([], null, 2));
    }
    return JSON.parse(fs.readFileSync(wastePath, 'utf8'));
  } catch (error) {
    return [];
  }
};

const readPromotions = () => {
  try {
    if (!fs.existsSync(promotionsPath)) {
      fs.writeFileSync(promotionsPath, JSON.stringify([], null, 2));
    }
    return JSON.parse(fs.readFileSync(promotionsPath, 'utf8'));
  } catch (error) {
    return [];
  }
};

const readPayments = () => {
  try {
    if (!fs.existsSync(paymentsPath)) {
      fs.writeFileSync(paymentsPath, JSON.stringify([], null, 2));
    }
    return JSON.parse(fs.readFileSync(paymentsPath, 'utf8'));
  } catch (error) {
    return [];
  }
};

const readTables = () => {
  try {
    if (!fs.existsSync(tablesPath)) {
      fs.writeFileSync(tablesPath, JSON.stringify([], null, 2));
    }
    return JSON.parse(fs.readFileSync(tablesPath, 'utf8'));
  } catch (error) {
    return [];
  }
};

const readProducts = () => {
  try {
    return JSON.parse(fs.readFileSync(productsPath, 'utf8'));
  } catch (error) {
    return [];
  }
};

// Promotional Report
router.get('/promotional', (req, res) => {
  const { startDate, endDate } = req.query;
  const promotions = readPromotions();
  const orders = readOrders();
  
  let filteredPromotions = promotions;
  if (startDate) {
    filteredPromotions = filteredPromotions.filter(p => new Date(p.date) >= new Date(startDate));
  }
  if (endDate) {
    filteredPromotions = filteredPromotions.filter(p => new Date(p.date) <= new Date(endDate));
  }
  
  // Get orders with promotions
  let filteredOrders = orders;
  if (startDate) {
    filteredOrders = filteredOrders.filter(o => new Date(o.date) >= new Date(startDate));
  }
  if (endDate) {
    filteredOrders = filteredOrders.filter(o => new Date(o.date) <= new Date(endDate));
  }
  
  const promotionalOrders = filteredOrders.filter(o => o.promotionId || o.discount > 0);
  
  const report = {
    period: { startDate, endDate },
    totalPromotions: filteredPromotions.length,
    totalPromotionalOrders: promotionalOrders.length,
    totalDiscountGiven: promotionalOrders.reduce((sum, o) => sum + (o.discount || 0), 0),
    totalRevenue: promotionalOrders.reduce((sum, o) => sum + o.total, 0),
    promotions: filteredPromotions,
    orders: promotionalOrders.map(o => ({
      orderNumber: o.orderNumber,
      date: o.date,
      discount: o.discount || 0,
      total: o.total,
      promotionId: o.promotionId
    }))
  };
  
  res.json(report);
});

// Waste Report
router.get('/waste', (req, res) => {
  const { startDate, endDate } = req.query;
  const waste = readWaste();
  
  let filtered = waste;
  if (startDate) {
    filtered = filtered.filter(w => new Date(w.date) >= new Date(startDate));
  }
  if (endDate) {
    filtered = filtered.filter(w => new Date(w.date) <= new Date(endDate));
  }
  
  const products = readProducts();
  const wasteWithProducts = filtered.map(w => {
    const product = products.find(p => p.id === w.productId);
    return {
      ...w,
      productName: product?.name || 'Unknown',
      productSku: product?.sku || 'N/A'
    };
  });
  
  const report = {
    period: { startDate, endDate },
    totalWasteItems: filtered.length,
    totalWasteValue: filtered.reduce((sum, w) => sum + (w.cost * w.quantity), 0),
    wasteByProduct: wasteWithProducts.reduce((acc, w) => {
      const key = w.productId;
      if (!acc[key]) {
        acc[key] = {
          productId: w.productId,
          productName: w.productName,
          productSku: w.productSku,
          quantity: 0,
          totalCost: 0,
          items: []
        };
      }
      acc[key].quantity += w.quantity;
      acc[key].totalCost += w.cost * w.quantity;
      acc[key].items.push(w);
      return acc;
    }, {}),
    items: wasteWithProducts
  };
  
  res.json(report);
});

// POS Daily Closing Report
router.get('/daily-closing', (req, res) => {
  const { date } = req.query;
  const targetDate = date || new Date().toISOString().split('T')[0];
  
  const orders = readOrders();
  const payments = readPayments();
  const cancellations = readCancellations();
  
  const dayOrders = orders.filter(o => o.date.startsWith(targetDate));
  const dayPayments = payments.filter(p => p.date && p.date.startsWith(targetDate));
  const dayCancellations = cancellations.filter(c => c.date && c.date.startsWith(targetDate));
  
  const paymentMethods = {};
  dayOrders.forEach(o => {
    const method = o.paymentMethod || 'cash';
    if (!paymentMethods[method]) {
      paymentMethods[method] = { count: 0, amount: 0 };
    }
    paymentMethods[method].count++;
    paymentMethods[method].amount += o.total;
  });
  
  const report = {
    date: targetDate,
    summary: {
      totalOrders: dayOrders.length,
      totalRevenue: dayOrders.reduce((sum, o) => sum + o.total, 0),
      totalItems: dayOrders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0),
      totalDiscount: dayOrders.reduce((sum, o) => sum + (o.discount || 0), 0),
      totalCancellations: dayCancellations.length,
      cancellationValue: dayCancellations.reduce((sum, c) => sum + (c.amount || 0), 0)
    },
    paymentMethods,
    orders: dayOrders,
    cancellations: dayCancellations
  };
  
  res.json(report);
});

// Monthly POS Report
router.get('/monthly', (req, res) => {
  const { year, month } = req.query;
  const targetYear = parseInt(year) || new Date().getFullYear();
  const targetMonth = parseInt(month) || new Date().getMonth() + 1;
  
  const orders = readOrders();
  const cancellations = readCancellations();
  
  const monthOrders = orders.filter(o => {
    const orderDate = new Date(o.date);
    return orderDate.getFullYear() === targetYear && orderDate.getMonth() + 1 === targetMonth;
  });
  
  const monthCancellations = cancellations.filter(c => {
    if (!c.date) return false;
    const cancelDate = new Date(c.date);
    return cancelDate.getFullYear() === targetYear && cancelDate.getMonth() + 1 === targetMonth;
  });
  
  // Daily breakdown
  const dailyBreakdown = {};
  monthOrders.forEach(o => {
    const day = o.date.split('T')[0];
    if (!dailyBreakdown[day]) {
      dailyBreakdown[day] = { orders: 0, revenue: 0, items: 0 };
    }
    dailyBreakdown[day].orders++;
    dailyBreakdown[day].revenue += o.total;
    dailyBreakdown[day].items += o.items.reduce((sum, i) => sum + i.quantity, 0);
  });
  
  const report = {
    period: { year: targetYear, month: targetMonth },
    summary: {
      totalOrders: monthOrders.length,
      totalRevenue: monthOrders.reduce((sum, o) => sum + o.total, 0),
      totalItems: monthOrders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0),
      averageOrderValue: monthOrders.length > 0 ? monthOrders.reduce((sum, o) => sum + o.total, 0) / monthOrders.length : 0,
      totalCancellations: monthCancellations.length,
      cancellationValue: monthCancellations.reduce((sum, c) => sum + (c.amount || 0), 0)
    },
    dailyBreakdown: Object.entries(dailyBreakdown).map(([date, data]) => ({
      date,
      ...data
    })).sort((a, b) => a.date.localeCompare(b.date)),
    orders: monthOrders
  };
  
  res.json(report);
});

// Change Payment Report
router.get('/change-payment', (req, res) => {
  const { startDate, endDate } = req.query;
  const payments = readPayments();
  
  let filtered = payments.filter(p => p.type === 'change' || p.originalPaymentMethod !== p.newPaymentMethod);
  if (startDate) {
    filtered = filtered.filter(p => new Date(p.date) >= new Date(startDate));
  }
  if (endDate) {
    filtered = filtered.filter(p => new Date(p.date) <= new Date(endDate));
  }
  
  const report = {
    period: { startDate, endDate },
    totalChanges: filtered.length,
    changesByMethod: filtered.reduce((acc, p) => {
      const from = p.originalPaymentMethod || 'unknown';
      const to = p.newPaymentMethod || p.paymentMethod || 'unknown';
      const key = `${from}->${to}`;
      if (!acc[key]) {
        acc[key] = { from, to, count: 0, totalAmount: 0 };
      }
      acc[key].count++;
      acc[key].totalAmount += p.amount || 0;
      return acc;
    }, {}),
    changes: filtered
  };
  
  res.json(report);
});

// Guest Common Report
router.get('/guest-common', (req, res) => {
  const { startDate, endDate } = req.query;
  const orders = readOrders();
  
  let filtered = orders;
  if (startDate) {
    filtered = filtered.filter(o => new Date(o.date) >= new Date(startDate));
  }
  if (endDate) {
    filtered = filtered.filter(o => new Date(o.date) <= new Date(endDate));
  }
  
  // Group by customer
  const customerStats = {};
  filtered.forEach(o => {
    const customerId = o.customerId || 'walk-in';
    if (!customerStats[customerId]) {
      customerStats[customerId] = {
        customerId,
        orderCount: 0,
        totalSpent: 0,
        averageOrderValue: 0,
        lastOrderDate: null
      };
    }
    customerStats[customerId].orderCount++;
    customerStats[customerId].totalSpent += o.total;
    if (!customerStats[customerId].lastOrderDate || new Date(o.date) > new Date(customerStats[customerId].lastOrderDate)) {
      customerStats[customerId].lastOrderDate = o.date;
    }
  });
  
  Object.keys(customerStats).forEach(id => {
    customerStats[id].averageOrderValue = customerStats[id].totalSpent / customerStats[id].orderCount;
  });
  
  const report = {
    period: { startDate, endDate },
    totalCustomers: Object.keys(customerStats).length,
    walkInCustomers: customerStats['walk-in']?.orderCount || 0,
    registeredCustomers: Object.values(customerStats).filter(c => c.customerId !== 'walk-in').length,
    topCustomers: Object.values(customerStats)
      .filter(c => c.customerId !== 'walk-in')
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 20),
    customerStats: Object.values(customerStats)
  };
  
  res.json(report);
});

// Move Table Report
router.get('/move-table', (req, res) => {
  const { startDate, endDate } = req.query;
  const tables = readTables();
  
  let filtered = tables.filter(t => t.type === 'move');
  if (startDate) {
    filtered = filtered.filter(t => new Date(t.date) >= new Date(startDate));
  }
  if (endDate) {
    filtered = filtered.filter(t => new Date(t.date) <= new Date(endDate));
  }
  
  const report = {
    period: { startDate, endDate },
    totalMoves: filtered.length,
    movesByTable: filtered.reduce((acc, t) => {
      const from = t.fromTable || 'unknown';
      const to = t.toTable || 'unknown';
      const key = `${from}->${to}`;
      if (!acc[key]) {
        acc[key] = { from, to, count: 0 };
      }
      acc[key].count++;
      return acc;
    }, {}),
    moves: filtered
  };
  
  res.json(report);
});

// Branch Menu Report
router.get('/branch-menu', (req, res) => {
  const { startDate, endDate, branchId } = req.query;
  const orders = readOrders();
  const products = readProducts();
  
  let filtered = orders;
  if (branchId) {
    filtered = filtered.filter(o => o.branchId === branchId);
  }
  if (startDate) {
    filtered = filtered.filter(o => new Date(o.date) >= new Date(startDate));
  }
  if (endDate) {
    filtered = filtered.filter(o => new Date(o.date) <= new Date(endDate));
  }
  
  // Aggregate by product
  const productStats = {};
  filtered.forEach(o => {
    o.items.forEach(item => {
      if (!productStats[item.productId]) {
        const product = products.find(p => p.id === item.productId);
        productStats[item.productId] = {
          productId: item.productId,
          productName: product?.name || item.productName || 'Unknown',
          productSku: product?.sku || 'N/A',
          quantity: 0,
          revenue: 0,
          orderCount: 0
        };
      }
      productStats[item.productId].quantity += item.quantity;
      productStats[item.productId].revenue += item.total || (item.price * item.quantity);
      productStats[item.productId].orderCount++;
    });
  });
  
  const report = {
    period: { startDate, endDate, branchId },
    totalProducts: Object.keys(productStats).length,
    totalItems: Object.values(productStats).reduce((sum, p) => sum + p.quantity, 0),
    totalRevenue: Object.values(productStats).reduce((sum, p) => sum + p.revenue, 0),
    topProducts: Object.values(productStats)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 50),
    products: Object.values(productStats).sort((a, b) => b.revenue - a.revenue)
  };
  
  res.json(report);
});

module.exports = router;

