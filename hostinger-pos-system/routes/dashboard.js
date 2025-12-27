const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const ordersPath = path.join(__dirname, '../data/sales/orders.json');
const productsPath = path.join(__dirname, '../data/products/products.json');
const customersPath = path.join(__dirname, '../data/customers/customers.json');
const accountsPath = path.join(__dirname, '../data/accounting/accounts.json');
const messagesPath = path.join(__dirname, '../data/customers/messages.json');

// Helper functions
const readOrders = () => {
  try {
    return JSON.parse(fs.readFileSync(ordersPath, 'utf8'));
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

const readCustomers = () => {
  try {
    return JSON.parse(fs.readFileSync(customersPath, 'utf8'));
  } catch (error) {
    return [];
  }
};

const readAccounts = () => {
  try {
    return JSON.parse(fs.readFileSync(accountsPath, 'utf8'));
  } catch (error) {
    return [];
  }
};

const readMessages = () => {
  try {
    return JSON.parse(fs.readFileSync(messagesPath, 'utf8'));
  } catch (error) {
    return [];
  }
};

// Get dashboard summary
router.get('/summary', (req, res) => {
  const { startDate, endDate } = req.query;
  
  const orders = readOrders();
  const products = readProducts();
  const customers = readCustomers();
  const accounts = readAccounts();
  const messages = readMessages();
  
  // Filter orders by date if provided
  let filteredOrders = orders;
  if (startDate) {
    filteredOrders = filteredOrders.filter(o => new Date(o.date) >= new Date(startDate));
  }
  if (endDate) {
    filteredOrders = filteredOrders.filter(o => new Date(o.date) <= new Date(endDate));
  }
  
  // Sales metrics
  const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = filteredOrders.length;
  const totalItemsSold = filteredOrders.reduce((sum, o) => 
    sum + o.items.reduce((s, i) => s + i.quantity, 0), 0);
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  
  // Inventory metrics
  const totalProducts = products.length;
  const lowStockItems = products.filter(p => (p.stock || 0) <= (p.minStock || 10));
  const totalStockValue = products.reduce((sum, p) => 
    sum + ((p.stock || 0) * (p.cost || 0)), 0);
  
  // Customer metrics
  const totalCustomers = customers.length;
  const activeCustomers = new Set(filteredOrders.map(o => o.customerId).filter(Boolean)).size;
  
  // Accounting metrics
  const revenueAccount = accounts.find(a => a.code === '41000');
  const expenseAccount = accounts.find(a => a.code === '51000');
  const totalRevenueAccount = revenueAccount?.balance || 0;
  const totalExpenses = accounts
    .filter(a => a.type === 'expense')
    .reduce((sum, a) => sum + (a.balance || 0), 0);
  const netProfit = totalRevenueAccount - totalExpenses;
  
  // WhatsApp metrics
  const recentMessages = messages.filter(m => {
    const msgDate = new Date(m.timestamp);
    const daysAgo = (Date.now() - msgDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysAgo <= 7;
  });
  const unreadMessages = messages.filter(m => !m.isRead && m.type === 'incoming').length;
  
  res.json({
    sales: {
      totalRevenue,
      totalOrders,
      totalItemsSold,
      averageOrderValue,
      todayRevenue: filteredOrders
        .filter(o => {
          const orderDate = new Date(o.date);
          const today = new Date();
          return orderDate.toDateString() === today.toDateString();
        })
        .reduce((sum, o) => sum + o.total, 0)
    },
    inventory: {
      totalProducts,
      lowStockItems: lowStockItems.length,
      lowStockItemsList: lowStockItems.map(p => ({
        id: p.id,
        name: p.name,
        stock: p.stock,
        minStock: p.minStock
      })),
      totalStockValue
    },
    customers: {
      totalCustomers,
      activeCustomers,
      newCustomers: customers.filter(c => {
        const createdDate = new Date(c.createdAt);
        const daysAgo = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysAgo <= 30;
      }).length
    },
    accounting: {
      totalRevenue: totalRevenueAccount,
      totalExpenses,
      netProfit,
      profitMargin: totalRevenueAccount > 0 
        ? ((netProfit / totalRevenueAccount) * 100).toFixed(2) 
        : 0
    },
    whatsapp: {
      recentMessages: recentMessages.length,
      unreadMessages,
      totalMessages: messages.length
    }
  });
});

// Get sales chart data
router.get('/sales-chart', (req, res) => {
  const { period = '7d' } = req.query;
  const orders = readOrders();
  
  let days = 7;
  if (period === '30d') days = 30;
  if (period === '90d') days = 90;
  if (period === '1y') days = 365;
  
  const chartData = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayOrders = orders.filter(o => {
      const orderDate = new Date(o.date).toISOString().split('T')[0];
      return orderDate === dateStr;
    });
    
    chartData.push({
      date: dateStr,
      revenue: dayOrders.reduce((sum, o) => sum + o.total, 0),
      orders: dayOrders.length
    });
  }
  
  res.json(chartData);
});

// Get top products
router.get('/top-products', (req, res) => {
  const { limit = 10 } = req.query;
  const orders = readOrders();
  const products = readProducts();
  
  const productSales = {};
  
  orders.forEach(order => {
    order.items.forEach(item => {
      if (!productSales[item.productId]) {
        productSales[item.productId] = {
          productId: item.productId,
          quantity: 0,
          revenue: 0
        };
      }
      productSales[item.productId].quantity += item.quantity;
      productSales[item.productId].revenue += item.total;
    });
  });
  
  const topProducts = Object.values(productSales)
    .map(sale => {
      const product = products.find(p => p.id === sale.productId);
      return {
        ...sale,
        productName: product?.name || 'Unknown',
        productImage: product?.image || ''
      };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, parseInt(limit));
  
  res.json(topProducts);
});

module.exports = router;

