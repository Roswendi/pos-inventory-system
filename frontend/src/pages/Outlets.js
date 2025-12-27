import React, { useState, useEffect } from 'react';
import { outletsAPI } from '../services/api';
import './Outlets.css';

const Outlets = () => {
  const [outlets, setOutlets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOutlet, setEditingOutlet] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    phone: '',
    email: '',
    manager: '',
    status: 'active'
  });

  useEffect(() => {
    loadOutlets();
  }, []);

  const loadOutlets = async () => {
    try {
      const response = await outletsAPI.getAll();
      setOutlets(response.data || []);
    } catch (error) {
      console.error('Error loading outlets:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to load outlets. Please check if backend server is running.';
      alert(`Error loading outlets: ${errorMessage}`);
      // Set empty array on error so page doesn't break
      setOutlets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingOutlet) {
        await outletsAPI.update(editingOutlet.id, formData);
      } else {
        await outletsAPI.create(formData);
      }
      setShowModal(false);
      setEditingOutlet(null);
      resetForm();
      loadOutlets();
    } catch (error) {
      console.error('Error saving outlet:', error);
      alert(error.response?.data?.error || 'Error saving outlet');
    }
  };

  const handleEdit = (outlet) => {
    setEditingOutlet(outlet);
    setFormData({
      name: outlet.name,
      address: outlet.address,
      city: outlet.city || '',
      province: outlet.province || '',
      postalCode: outlet.postalCode || '',
      phone: outlet.phone || '',
      email: outlet.email || '',
      manager: outlet.manager || '',
      status: outlet.status || 'active'
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this outlet?')) {
      try {
        await outletsAPI.delete(id);
        loadOutlets();
      } catch (error) {
        console.error('Error deleting outlet:', error);
        alert(error.response?.data?.error || 'Error deleting outlet');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      city: '',
      province: '',
      postalCode: '',
      phone: '',
      email: '',
      manager: '',
      status: 'active'
    });
  };

  if (loading) {
    return <div>Loading outlets...</div>;
  }

  return (
    <div className="outlets-page">
      <div className="page-header">
        <h1 className="page-title">Outlet Locations</h1>
        <p className="page-subtitle">Manage your outlet locations</p>
      </div>

      <div className="action-bar">
        <button 
          className="btn btn-primary" 
          onClick={() => { setShowModal(true); setEditingOutlet(null); resetForm(); }}
        >
          Add Outlet
        </button>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Address</th>
              <th>City</th>
              <th>Province</th>
              <th>Manager</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {outlets.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>
                  No outlets found. Click "Add Outlet" to create one.
                </td>
              </tr>
            ) : (
              outlets.map(outlet => (
                <tr key={outlet.id}>
                  <td><strong>{outlet.name}</strong></td>
                  <td>{outlet.address}</td>
                  <td>{outlet.city || '-'}</td>
                  <td>{outlet.province || '-'}</td>
                  <td>{outlet.manager || '-'}</td>
                  <td>{outlet.phone || '-'}</td>
                  <td>
                    <span className={`badge ${outlet.status === 'active' ? 'badge-success' : 'badge-secondary'}`}>
                      {outlet.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => handleEdit(outlet)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(outlet.id)}
                      style={{ marginLeft: '5px' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); setEditingOutlet(null); resetForm(); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingOutlet ? 'Edit Outlet' : 'Add Outlet'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Outlet Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Address *</label>
                <textarea
                  className="form-control"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows="2"
                  required
                />
              </div>
              
              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Province</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.province}
                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">Postal Code</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Manager</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.manager}
                  onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-control"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              
              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">Save</button>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => { setShowModal(false); setEditingOutlet(null); resetForm(); }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Outlets;

