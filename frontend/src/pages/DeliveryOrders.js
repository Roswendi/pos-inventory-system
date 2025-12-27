import React, { useState, useEffect } from 'react';
import { deliveryAPI, paymentsAPI } from '../services/api';
import './DeliveryOrders.css';

const DeliveryOrders = () => {
  const [orders, setOrders] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [formData, setFormData] = useState({
    items: [],
    deliveryService: 'gofood',
    paymentMethod: 'gopay',
    customerInfo: {
      name: '',
      phone: '',
      email: '',
      address: ''
    },
    deliveryAddress: '',
    deliveryFee: 0,
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ordersRes, servicesRes] = await Promise.all([
        deliveryAPI.getOrders(),
        deliveryAPI.getServices()
      ]);
      setOrders(ordersRes.data);
      setServices(servicesRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await deliveryAPI.updateStatus(orderId, newStatus);
      loadData();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating order status');
    }
  };

  const handleSyncOrder = async (orderId) => {
    try {
      const response = await deliveryAPI.syncOrder(orderId);
      alert(`Order synced to ${response.data.serviceName}! Tracking: ${response.data.trackingUrl}`);
      loadData();
    } catch (error) {
      console.error('Error syncing order:', error);
      alert('Error syncing order to delivery service');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { class: 'badge-warning', label: 'Pending' },
      'confirmed': { class: 'badge-info', label: 'Confirmed' },
      'preparing': { class: 'badge-info', label: 'Preparing' },
      'ready': { class: 'badge-success', label: 'Ready' },
      'out_for_delivery': { class: 'badge-primary', label: 'Out for Delivery' },
      'delivered': { class: 'badge-success', label: 'Delivered' },
      'cancelled': { class: 'badge-danger', label: 'Cancelled' }
    };
    const config = statusConfig[status] || { class: 'badge-secondary', label: status };
    return <span className={`badge ${config.class}`}>{config.label}</span>;
  };

  const getServiceIcon = (service) => {
    const icons = {
      'gofood': '🟢',
      'shopeefood': '🟠',
      'grabfood': '🟣'
    };
    return icons[service] || '📦';
  };

  if (loading) {
    return <div>Loading delivery orders...</div>;
  }

  return (
    <div className="delivery-orders-page">
      <div className="page-header">
        <h1 className="page-title">Delivery Orders</h1>
        <p className="page-subtitle">Manage GoFood, ShopeeFood & GrabFood orders</p>
      </div>

      <div className="delivery-stats">
        <div className="stat-card">
          <div className="stat-label">Total Orders</div>
          <div className="stat-value">{orders.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending</div>
          <div className="stat-value">{orders.filter(o => o.status === 'pending').length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">In Progress</div>
          <div className="stat-value">{orders.filter(o => ['confirmed', 'preparing', 'ready', 'out_for_delivery'].includes(o.status)).length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Delivered</div>
          <div className="stat-value">{orders.filter(o => o.status === 'delivered').length}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">All Delivery Orders</div>
        <table className="table">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Service</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>{order.orderNumber}</td>
                <td>
                  <span className="service-badge">
                    {getServiceIcon(order.deliveryService)} {order.serviceName}
                  </span>
                </td>
                <td>
                  <div>{order.customerInfo.name}</div>
                  <small>{order.customerInfo.phone}</small>
                </td>
                <td>{order.items.length} items</td>
                <td>Rp {order.total.toLocaleString('id-ID')}</td>
                <td>{getStatusBadge(order.status)}</td>
                <td>
                  <span className="badge badge-info">{order.paymentMethod}</span>
                </td>
                <td>
                  <div className="action-buttons">
                    {order.status === 'pending' && !order.serviceOrderId && (
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => handleSyncOrder(order.id)}
                      >
                        Sync to {order.serviceName}
                      </button>
                    )}
                    {order.status !== 'delivered' && order.status !== 'cancelled' && (
                      <select
                        className="form-control form-control-sm"
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="preparing">Preparing</option>
                        <option value="ready">Ready</option>
                        <option value="out_for_delivery">Out for Delivery</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    )}
                    {order.trackingUrl && (
                      <a 
                        href={order.trackingUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn btn-outline btn-sm"
                      >
                        Track
                      </a>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <div className="card-header">Delivery Services</div>
        <div className="services-grid">
          {services.map(service => (
            <div key={service.id} className="service-card">
              <div className="service-icon">{getServiceIcon(service.id)}</div>
              <div className="service-name">{service.name}</div>
              <div className="service-info">
                <div>Commission: {(service.commissionRate * 100).toFixed(1)}%</div>
                <div>Payment: {service.paymentMethods.join(', ')}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DeliveryOrders;

