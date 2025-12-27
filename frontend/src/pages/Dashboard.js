import React, { useState, useEffect } from 'react';
import { dashboardAPI, outletsAPI } from '../services/api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FiDollarSign, FiShoppingCart, FiPackage, FiUsers, FiMapPin } from 'react-icons/fi';
import './Dashboard.css';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [salesChart, setSalesChart] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [outletPerformance, setOutletPerformance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [summaryRes, chartRes, productsRes, outletsRes] = await Promise.all([
        dashboardAPI.getSummary().catch(err => {
          console.error('Error fetching summary:', err);
          return { data: null };
        }),
        dashboardAPI.getSalesChart({ period: '7d' }).catch(err => {
          console.error('Error fetching sales chart:', err);
          return { data: [] };
        }),
        dashboardAPI.getTopProducts({ limit: 5 }).catch(err => {
          console.error('Error fetching top products:', err);
          return { data: [] };
        }),
        outletsAPI.getPerformanceSummary({ 
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0]
        }).catch(() => ({ data: null }))
      ]);
      
      if (summaryRes && summaryRes.data) {
        setSummary(summaryRes.data);
      } else {
        // Create default empty summary if API fails
        setSummary({
          sales: { totalRevenue: 0, totalOrders: 0, totalItemsSold: 0, todayRevenue: 0 },
          inventory: { totalProducts: 0, lowStockItems: 0, lowStockItemsList: [] },
          customers: { totalCustomers: 0, activeCustomers: 0 },
          accounting: { totalRevenue: 0, totalExpenses: 0, netProfit: 0, profitMargin: 0 }
        });
      }
      
      setSalesChart(chartRes?.data || []);
      setTopProducts(productsRes?.data || []);
      setOutletPerformance(outletsRes?.data || null);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      // Set default empty data on error
      setSummary({
        sales: { totalRevenue: 0, totalOrders: 0, totalItemsSold: 0, todayRevenue: 0 },
        inventory: { totalProducts: 0, lowStockItems: 0, lowStockItemsList: [] },
        customers: { totalCustomers: 0, activeCustomers: 0 },
        accounting: { totalRevenue: 0, totalExpenses: 0, netProfit: 0, profitMargin: 0 }
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  if (!summary) {
    return <div>No data available</div>;
  }

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Overview of your business</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Total Revenue</span>
            <FiDollarSign className="stat-card-icon" style={{ color: '#28A745' }} />
          </div>
          <div className="stat-card-value">
            Rp {summary.sales.totalRevenue.toLocaleString('id-ID')}
          </div>
          <div className="stat-card-change">
            Today: Rp {summary.sales.todayRevenue.toLocaleString('id-ID')}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Total Orders</span>
            <FiShoppingCart className="stat-card-icon" style={{ color: '#0066FF' }} />
          </div>
          <div className="stat-card-value">{summary.sales.totalOrders}</div>
          <div className="stat-card-change">
            Items sold: {summary.sales.totalItemsSold}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Products</span>
            <FiPackage className="stat-card-icon" style={{ color: '#FFC107' }} />
          </div>
          <div className="stat-card-value">{summary.inventory.totalProducts}</div>
          <div className="stat-card-change" style={{ color: summary.inventory.lowStockItems > 0 ? '#DC3545' : '#28A745' }}>
            {summary.inventory.lowStockItems} low stock items
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Customers</span>
            <FiUsers className="stat-card-icon" style={{ color: '#17A2B8' }} />
          </div>
          <div className="stat-card-value">{summary.customers.totalCustomers}</div>
          <div className="stat-card-change">
            {summary.customers.activeCustomers} active
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">Sales Trend (Last 7 Days)</div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#0066FF" name="Revenue" />
              <Line type="monotone" dataKey="orders" stroke="#28A745" name="Orders" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-header">Top Products</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProducts}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="productName" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#0066FF" name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">Financial Summary</div>
          <div className="financial-summary">
            <div className="financial-item">
              <span>Total Revenue:</span>
              <strong>Rp {summary.accounting.totalRevenue.toLocaleString('id-ID')}</strong>
            </div>
            <div className="financial-item">
              <span>Total Expenses:</span>
              <strong>Rp {summary.accounting.totalExpenses.toLocaleString('id-ID')}</strong>
            </div>
            <div className="financial-item">
              <span>Net Profit:</span>
              <strong style={{ color: summary.accounting.netProfit >= 0 ? '#28A745' : '#DC3545' }}>
                Rp {summary.accounting.netProfit.toLocaleString('id-ID')}
              </strong>
            </div>
            <div className="financial-item">
              <span>Profit Margin:</span>
              <strong>{summary.accounting.profitMargin}%</strong>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">Low Stock Alert</div>
          {summary.inventory.lowStockItemsList.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Stock</th>
                  <th>Min Stock</th>
                </tr>
              </thead>
              <tbody>
                {summary.inventory.lowStockItemsList.map(item => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td><span className="badge badge-danger">{item.stock}</span></td>
                    <td>{item.minStock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>All products are well stocked!</p>
          )}
        </div>
      </div>

      {outletPerformance && outletPerformance.outlets && outletPerformance.outlets.length > 0 && (
        <div className="card" style={{ marginTop: '20px' }}>
          <div className="card-header">
            <FiMapPin style={{ marginRight: '8px' }} />
            Outlet Performance (Last 30 Days)
          </div>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Outlet</th>
                  <th>Revenue</th>
                  <th>Cost</th>
                  <th>Profit</th>
                  <th>Margin</th>
                  <th>Orders</th>
                  <th>Avg Order</th>
                </tr>
              </thead>
              <tbody>
                {outletPerformance.outlets.map(outlet => (
                  <tr key={outlet.outletId}>
                    <td><strong>{outlet.outletName}</strong></td>
                    <td>Rp {outlet.totalRevenue.toLocaleString('id-ID')}</td>
                    <td>Rp {outlet.totalCost.toLocaleString('id-ID')}</td>
                    <td style={{ color: outlet.grossProfit >= 0 ? '#28A745' : '#DC3545', fontWeight: '600' }}>
                      Rp {outlet.grossProfit.toLocaleString('id-ID')}
                    </td>
                    <td>
                      <span className={`badge ${outlet.profitMargin >= 20 ? 'badge-success' : outlet.profitMargin >= 10 ? 'badge-warning' : 'badge-danger'}`}>
                        {outlet.profitMargin}%
                      </span>
                    </td>
                    <td>{outlet.totalOrders}</td>
                    <td>Rp {outlet.averageOrderValue.toLocaleString('id-ID')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '15px', background: '#F9FAFB', borderTop: '1px solid #E5E7EB' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>Total Revenue:</strong> Rp {outletPerformance.summary.totalRevenue.toLocaleString('id-ID')}
              </div>
              <div>
                <strong>Total Profit:</strong> 
                <span style={{ color: outletPerformance.summary.totalProfit >= 0 ? '#28A745' : '#DC3545', marginLeft: '10px' }}>
                  Rp {outletPerformance.summary.totalProfit.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

