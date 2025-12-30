import axios from 'axios';

// Auto-detect API URL based on current hostname
const getApiBaseUrl = () => {
  // If REACT_APP_API_URL is set, use it
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Get current hostname and protocol
  const hostname = window.location.hostname;
  const protocol = window.location.protocol; // http: or https:
  const port = window.location.port;
  
  // If on Railway or production (not localhost), use same origin
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    // Production: use same origin (Railway serves both frontend and API)
    // IMPORTANT: Always use the same protocol (HTTPS in production)
    // Never include port in production (Railway handles this)
    return `${protocol}//${hostname}/api`;
  }
  
  // Default to localhost for local development
  return 'http://localhost:5001/api';
};

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  // Use POS token for POS-related routes, otherwise use main token
  const isPOSRoute = config.url?.includes('/pos') || config.url?.includes('/pos-reports');
  const token = isPOSRoute 
    ? localStorage.getItem('posToken') || localStorage.getItem('token')
    : localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Products API
export const productsAPI = {
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`)
};

// Inventory API
export const inventoryAPI = {
  getStock: () => api.get('/inventory/stock'),
  getLowStock: () => api.get('/inventory/stock/low'),
  getTransactions: (params) => api.get('/inventory/transactions', { params }),
  stockIn: (data) => api.post('/inventory/stock-in', data),
  stockOut: (data) => api.post('/inventory/stock-out', data),
  stockAdjust: (data) => api.post('/inventory/stock-adjust', data)
};

// POS API
export const posAPI = {
  createOrder: (data) => api.post('/pos/order', data),
  getOrders: (params) => api.get('/pos/orders', { params }),
  getOrder: (id) => api.get(`/pos/orders/${id}`),
  getReceipt: (orderId) => api.get(`/pos/receipt/${orderId}`),
  getSummary: (params) => api.get('/pos/summary', { params })
};

// Accounting API
export const accountingAPI = {
  getAccounts: () => api.get('/accounting/accounts'),
  getAccount: (code) => api.get(`/accounting/accounts/${code}`),
  createAccount: (data) => api.post('/accounting/accounts', data),
  getTransactions: (params) => api.get('/accounting/transactions', { params }),
  createTransaction: (data) => api.post('/accounting/transactions', data),
  createJournalEntry: (data) => api.post('/accounting/journal-entry', data),
  getBalanceSheet: (params) => api.get('/accounting/balance-sheet', { params }),
  getProfitLoss: (params) => api.get('/accounting/profit-loss', { params })
};

// Customers API
export const customersAPI = {
  getAll: () => api.get('/customers'),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`),
  search: (query) => api.get(`/customers/search/${query}`)
};

// WhatsApp API
export const whatsappAPI = {
  getStatus: () => api.get('/whatsapp/status'),
  init: () => api.post('/whatsapp/init'),
  sendMessage: (data) => api.post('/whatsapp/send', data),
  getMessages: (params) => api.get('/whatsapp/messages', { params }),
  getTemplates: () => api.get('/whatsapp/templates'),
  createTemplate: (data) => api.post('/whatsapp/templates', data),
  updateTemplate: (id, data) => api.put(`/whatsapp/templates/${id}`, data),
  deleteTemplate: (id) => api.delete(`/whatsapp/templates/${id}`),
  sendTemplate: (data) => api.post('/whatsapp/send-template', data)
};

// Dashboard API
export const dashboardAPI = {
  getSummary: (params) => api.get('/dashboard/summary', { params }),
  getSalesChart: (params) => api.get('/dashboard/sales-chart', { params }),
  getTopProducts: (params) => api.get('/dashboard/top-products', { params })
};

// Auth API
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me')
};

// Delivery API
export const deliveryAPI = {
  getServices: () => api.get('/delivery/services'),
  createOrder: (data) => api.post('/delivery/order', data),
  getOrders: (params) => api.get('/delivery/orders', { params }),
  getOrder: (id) => api.get(`/delivery/orders/${id}`),
  updateStatus: (id, status) => api.put(`/delivery/orders/${id}/status`, { status }),
  syncOrder: (id) => api.post(`/delivery/sync/${id}`),
  getStats: (params) => api.get('/delivery/stats', { params })
};

// Payments API
export const paymentsAPI = {
  getGateways: () => api.get('/payments/gateways'),
  processPayment: (data) => api.post('/payments/process', data),
  getPayment: (id) => api.get(`/payments/${id}`),
  getOrderPayments: (orderId) => api.get(`/payments/order/${orderId}`),
  refundPayment: (id, reason) => api.post(`/payments/${id}/refund`, { reason }),
  getStats: (params) => api.get('/payments/stats/summary', { params })
};

// Upload API
export const uploadAPI = {
  uploadImage: (formData) => {
    return api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  deleteImage: (filename) => api.delete(`/upload/image/${filename}`)
};

// POS Reports API
export const posReportsAPI = {
  getPromotional: (params) => api.get('/pos-reports/promotional', { params }),
  getWaste: (params) => api.get('/pos-reports/waste', { params }),
  getDailyClosing: (params) => api.get('/pos-reports/daily-closing', { params }),
  getMonthly: (params) => api.get('/pos-reports/monthly', { params }),
  getChangePayment: (params) => api.get('/pos-reports/change-payment', { params }),
  getGuestCommon: (params) => api.get('/pos-reports/guest-common', { params }),
  getMoveTable: (params) => api.get('/pos-reports/move-table', { params }),
  getBranchMenu: (params) => api.get('/pos-reports/branch-menu', { params })
};

// POS Cancellation API
export const posCancellationAPI = {
  requestCancel: (data) => api.post('/pos/cancel-item', data),
  getPending: () => api.get('/pos/cancellations/pending'),
  getAll: (params) => api.get('/pos/cancellations', { params }),
  approve: (id, data) => api.post(`/pos/cancellations/${id}/approve`, data),
  reject: (id, data) => api.post(`/pos/cancellations/${id}/reject`, data)
};

// Outlets API
export const outletsAPI = {
  getAll: () => api.get('/outlets'),
  getById: (id) => api.get(`/outlets/${id}`),
  create: (data) => api.post('/outlets', data),
  update: (id, data) => api.put(`/outlets/${id}`, data),
  delete: (id) => api.delete(`/outlets/${id}`),
  getPerformance: (id, params) => api.get(`/outlets/${id}/performance`, { params }),
  getPerformanceSummary: (params) => api.get('/outlets/performance/summary', { params })
};

export default api;

