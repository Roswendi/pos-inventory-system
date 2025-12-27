import React, { useState, useEffect, useRef } from 'react';
import { productsAPI, uploadAPI } from '../services/api';
import './Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [imageMethod, setImageMethod] = useState('url'); // 'url' or 'upload'
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    category: '',
    price: '',
    cost: '',
    stock: '',
    minStock: '10',
    unit: 'pcs',
    image: ''
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await productsAPI.getAll();
      setProducts(response.data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await uploadAPI.uploadImage(formData);
      return response.data.url;
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image. Please try again or use URL instead.');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = await handleFileUpload(file);
      if (imageUrl) {
        setFormData({ ...formData, image: imageUrl });
      }
    }
  };

  const handlePasteImage = async (e) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        const imageUrl = await handleFileUpload(file);
        if (imageUrl) {
          setFormData({ ...formData, image: imageUrl });
        }
        break;
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await productsAPI.update(editingProduct.id, formData);
      } else {
        await productsAPI.create(formData);
      }
      setShowModal(false);
      setEditingProduct(null);
      resetForm();
      loadProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      description: product.description || '',
      category: product.category || '',
      price: product.price,
      cost: product.cost || '',
      stock: product.stock || '',
      minStock: product.minStock || '10',
      unit: product.unit || 'pcs',
      image: product.image || ''
    });
    // Set image method based on existing image
    setImageMethod(product.image && product.image.startsWith('http') ? 'url' : 'upload');
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productsAPI.delete(id);
        loadProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error deleting product');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      sku: '',
      description: '',
      category: '',
      price: '',
      cost: '',
      stock: '',
      minStock: '10',
      unit: 'pcs',
      image: ''
    });
    setImageMethod('url');
  };

  if (loading) {
    return <div>Loading products...</div>;
  }

  return (
    <div className="products-page">
      <div className="page-header">
        <h1 className="page-title">Products</h1>
        <p className="page-subtitle">Manage your product catalog</p>
      </div>

      <div className="action-bar">
        <button className="btn btn-primary" onClick={() => { setShowModal(true); setEditingProduct(null); resetForm(); }}>
          Add Product
        </button>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{product.sku}</td>
                <td>{product.category || 'General'}</td>
                <td>Rp {product.price.toLocaleString('id-ID')}</td>
                <td>
                  <span className={`badge ${product.stock <= product.minStock ? 'badge-danger' : 'badge-success'}`}>
                    {product.stock} {product.unit}
                  </span>
                </td>
                <td>
                  {product.stock <= product.minStock ? (
                    <span className="badge badge-warning">Low Stock</span>
                  ) : (
                    <span className="badge badge-success">In Stock</span>
                  )}
                </td>
                <td>
                  <button className="btn btn-outline" onClick={() => handleEdit(product)}>Edit</button>
                  <button className="btn btn-danger" onClick={() => handleDelete(product.id)} style={{ marginLeft: '5px' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); setEditingProduct(null); resetForm(); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">SKU</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </div>
              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">Price *</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Cost</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">Stock</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Min Stock</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Unit</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Product Image</label>
                
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ marginRight: '15px' }}>
                    <input
                      type="radio"
                      name="imageMethod"
                      value="upload"
                      checked={imageMethod === 'upload'}
                      onChange={(e) => setImageMethod(e.target.value)}
                    />
                    {' '}Upload File (Copy-Paste or Browse)
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="imageMethod"
                      value="url"
                      checked={imageMethod === 'url'}
                      onChange={(e) => setImageMethod(e.target.value)}
                    />
                    {' '}Use URL
                  </label>
                </div>

                {imageMethod === 'upload' ? (
                  <>
                    <div 
                      className="image-upload-area"
                      onPaste={handlePasteImage}
                      onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = '#0066FF'; }}
                      onDragLeave={(e) => { e.currentTarget.style.borderColor = '#DEE2E6'; }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.currentTarget.style.borderColor = '#DEE2E6';
                        const file = e.dataTransfer.files[0];
                        if (file && file.type.startsWith('image/')) {
                          handleFileUpload(file).then(url => {
                            if (url) setFormData({ ...formData, image: url });
                          });
                        }
                      }}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                      />
                      {uploading ? (
                        <div style={{ padding: '20px' }}>
                          <div>⏳ Uploading image... Please wait</div>
                        </div>
                      ) : formData.image ? (
                        <div style={{ textAlign: 'center' }}>
                          <img 
                            src={formData.image.startsWith('http') ? formData.image : `${window.location.protocol}//${window.location.host}${formData.image}`}
                            alt="Preview" 
                            style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '4px', border: '1px solid #DEE2E6', marginBottom: '10px' }}
                            onError={(e) => { 
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'block';
                            }}
                          />
                          <div style={{ display: 'none' }}>Image failed to load</div>
                          <div>
                            <button 
                              type="button" 
                              className="btn btn-outline btn-sm"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              Change Image
                            </button>
                            <button 
                              type="button" 
                              className="btn btn-outline btn-sm"
                              onClick={() => setFormData({ ...formData, image: '' })}
                              style={{ marginLeft: '10px' }}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                          <div style={{ fontSize: '48px', marginBottom: '10px' }}>📷</div>
                          <div style={{ marginBottom: '10px' }}>
                            <strong>Drag & Drop image here</strong>
                          </div>
                          <div style={{ marginBottom: '10px', color: '#6C757D' }}>OR</div>
                          <button 
                            type="button" 
                            className="btn btn-outline"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            Browse Files
                          </button>
                          <div style={{ marginTop: '10px', fontSize: '12px', color: '#6C757D' }}>
                            You can also <strong>paste (Cmd+V / Ctrl+V)</strong> an image from clipboard
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <input
                      type="url"
                      className="form-control"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                    />
                    <small style={{ color: '#6C757D', fontSize: '12px' }}>
                      Enter image URL. You can use image hosting services like Imgur, Cloudinary, etc.
                    </small>
                    {formData.image && (
                      <div style={{ marginTop: '10px' }}>
                        <img 
                          src={formData.image} 
                          alt="Preview" 
                          style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '4px', border: '1px solid #DEE2E6' }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">Save</button>
                <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); setEditingProduct(null); resetForm(); }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;

