import React, { useState, useEffect } from 'react';
import { inventoryAPI, productsAPI } from '../services/api';
import './Inventory.css';

const Inventory = () => {
  const [stock, setStock] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [transactionType, setTransactionType] = useState('stock-in');
  const [formData, setFormData] = useState({
    productId: '',
    quantity: '',
    reason: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [stockRes, lowStockRes, transactionsRes] = await Promise.all([
        inventoryAPI.getStock(),
        inventoryAPI.getLowStock(),
        inventoryAPI.getTransactions()
      ]);
      setStock(stockRes.data);
      setLowStock(lowStockRes.data);
      setTransactions(transactionsRes.data);
    } catch (error) {
      console.error('Error loading inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (transactionType === 'stock-in') {
        await inventoryAPI.stockIn(formData);
      } else if (transactionType === 'stock-out') {
        await inventoryAPI.stockOut(formData);
      } else {
        await inventoryAPI.stockAdjust({
          ...formData,
          newQuantity: formData.quantity
        });
      }
      setShowModal(false);
      setFormData({ productId: '', quantity: '', reason: '', notes: '' });
      loadData();
    } catch (error) {
      console.error('Error processing transaction:', error);
      alert(error.response?.data?.error || 'Error processing transaction');
    }
  };

  if (loading) {
    return <div>Loading inventory...</div>;
  }

  return (
    <div className="inventory-page">
      <div className="page-header">
        <h1 className="page-title">Inventory Management</h1>
        <p className="page-subtitle">Track and manage stock levels</p>
      </div>

      <div className="action-bar">
        <button className="btn btn-primary" onClick={() => { setShowModal(true); setTransactionType('stock-in'); }}>
          Stock In
        </button>
        <button className="btn btn-secondary" onClick={() => { setShowModal(true); setTransactionType('stock-out'); }}>
          Stock Out
        </button>
        <button className="btn btn-outline" onClick={() => { setShowModal(true); setTransactionType('adjustment'); }}>
          Adjust Stock
        </button>
      </div>

      {lowStock.length > 0 && (
        <div className="card alert-card">
          <div className="card-header">Low Stock Alert</div>
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Current Stock</th>
                <th>Min Stock</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {lowStock.map(product => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td><span className="badge badge-danger">{product.stock}</span></td>
                  <td>{product.minStock}</td>
                  <td><span className="badge badge-warning">Low Stock</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="card">
        <div className="card-header">Stock Levels</div>
        <table className="table">
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Current Stock</th>
              <th>Min Stock</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {stock.map(item => (
              <tr key={item.productId}>
                <td>{item.product?.name || 'Unknown'}</td>
                <td>{item.product?.sku || '-'}</td>
                <td>{item.product?.stock || 0}</td>
                <td>{item.product?.minStock || 10}</td>
                <td>
                  {item.product && item.product.stock <= item.product.minStock ? (
                    <span className="badge badge-warning">Low</span>
                  ) : (
                    <span className="badge badge-success">OK</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <div className="card-header">Recent Transactions</div>
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Product</th>
              <th>Type</th>
              <th>Quantity</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {transactions.slice(0, 20).map(transaction => (
              <tr key={transaction.id}>
                <td>{new Date(transaction.date).toLocaleDateString()}</td>
                <td>{transaction.productId}</td>
                <td>
                  <span className={`badge ${
                    transaction.type === 'stock-in' ? 'badge-success' :
                    transaction.type === 'stock-out' ? 'badge-danger' :
                    'badge-info'
                  }`}>
                    {transaction.type}
                  </span>
                </td>
                <td>{transaction.quantity}</td>
                <td>{transaction.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>
              {transactionType === 'stock-in' ? 'Stock In' :
               transactionType === 'stock-out' ? 'Stock Out' :
               'Adjust Stock'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Product</label>
                <select
                  className="form-control"
                  value={formData.productId}
                  onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                  required
                >
                  <option value="">Select Product</option>
                  {stock.map(item => (
                    <option key={item.productId} value={item.productId}>
                      {item.product?.name || 'Unknown'}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">
                  {transactionType === 'adjustment' ? 'New Quantity' : 'Quantity'}
                </label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  required
                  min="1"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Reason</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea
                  className="form-control"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="3"
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">Submit</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;

