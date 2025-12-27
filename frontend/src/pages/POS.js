import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsAPI, posAPI, customersAPI, deliveryAPI, paymentsAPI, posCancellationAPI, outletsAPI } from '../services/api';
import './POS.css';

const POS = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [orderType, setOrderType] = useState('dine-in'); // dine-in, delivery
  const [deliveryService, setDeliveryService] = useState('gofood');
  const [deliveryServices, setDeliveryServices] = useState([]);
  const [paymentGateways, setPaymentGateways] = useState([]);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [currentOrder, setCurrentOrder] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelItem, setCancelItem] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [posUser, setPosUser] = useState(null);
  const [outlets, setOutlets] = useState([]);
  const [selectedOutlet, setSelectedOutlet] = useState(null);
  
  const paymentMethods = [
    { value: 'cash', label: 'Cash (Tunai)' },
    { value: 'credit-card', label: 'Credit Card (Kartu Kredit)' },
    { value: 'debit-card', label: 'Debit Card (Kartu Debit)' },
    { value: 'gopay', label: 'GoPay' },
    { value: 'ovo', label: 'OVO' },
    { value: 'dana', label: 'DANA' },
    { value: 'shopeepay', label: 'ShopeePay' },
    { value: 'grabpay', label: 'GrabPay' },
    { value: 'qris', label: 'QRIS (Quick Response Indonesian Standard)' }
  ];
  const [discount, setDiscount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Check if user is logged in (either admin or POS user)
    const token = localStorage.getItem('token');
    const posToken = localStorage.getItem('posToken');
    const posUserData = localStorage.getItem('posUser');
    
    // If no authentication at all, redirect to login
    if (!token && !posToken) {
      navigate('/pos-login');
      return;
    }
    
    // If POS token exists, use POS user
    if (posToken && posUserData) {
      try {
        setPosUser(JSON.parse(posUserData));
      } catch (error) {
        console.error('Error parsing POS user data:', error);
        // If admin token exists, continue with admin access
        if (!token) {
          navigate('/pos-login');
          return;
        }
      }
    } else if (token) {
      // Admin user accessing POS - set a default user object
      setPosUser({ username: 'admin', role: 'admin', name: 'Administrator' });
    } else {
      navigate('/pos-login');
      return;
    }
    
    loadProducts();
    loadCustomers();
    loadDeliveryServices();
    loadPaymentGateways();
    loadOutlets();
  }, [navigate]);

  const loadOutlets = async () => {
    try {
      const response = await outletsAPI.getAll();
      setOutlets(response.data);
      // Auto-select first active outlet if available
      const activeOutlet = response.data.find(o => o.status === 'active');
      if (activeOutlet) {
        setSelectedOutlet(activeOutlet.id);
      }
    } catch (error) {
      console.error('Error loading outlets:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await productsAPI.getAll();
      setProducts(response.data);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadCustomers = async () => {
    try {
      const response = await customersAPI.getAll();
      setCustomers(response.data);
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const loadDeliveryServices = async () => {
    try {
      const response = await deliveryAPI.getServices();
      setDeliveryServices(response.data);
    } catch (error) {
      console.error('Error loading delivery services:', error);
    }
  };

  const loadPaymentGateways = async () => {
    try {
      const response = await paymentsAPI.getGateways();
      setPaymentGateways(response.data);
    } catch (error) {
      console.error('Error loading payment gateways:', error);
    }
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.productId === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity: 1,
        image: product.image
      }]);
    }
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      setCart(cart.filter(item => item.productId !== productId));
    } else {
      setCart(cart.map(item =>
        item.productId === productId
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const handleRequestCancel = (item) => {
    setCancelItem(item);
    setShowCancelModal(true);
  };

  const submitCancelRequest = async () => {
    if (!cancelReason.trim()) {
      alert('Please provide a reason for cancellation');
      return;
    }

    if (!currentOrder) {
      alert('No active order to cancel item from');
      return;
    }

    try {
      await posCancellationAPI.requestCancel({
        orderId: currentOrder.id,
        itemId: cancelItem.productId,
        reason: cancelReason,
        requestedBy: posUser?.username || 'cashier'
      });
      
      alert('Cancellation request submitted. Waiting for manager approval.');
      setShowCancelModal(false);
      setCancelReason('');
      setCancelItem(null);
    } catch (error) {
      console.error('Error requesting cancellation:', error);
      alert(error.response?.data?.error || 'Error requesting cancellation');
    }
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return subtotal - discount;
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Cart is empty');
      return;
    }

    try {
      // If delivery order
      if (orderType === 'delivery') {
        if (!deliveryAddress) {
          alert('Delivery address is required');
          return;
        }
        
        const response = await deliveryAPI.createOrder({
          items: cart.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
          })),
          deliveryService: deliveryService,
          paymentMethod: paymentMethod,
          customerInfo: {
            name: customerName || 'Customer',
            phone: customerPhone || '',
            email: ''
          },
          deliveryAddress: deliveryAddress,
          deliveryFee: 0,
          notes: ''
        });

        // Process payment if online payment
        if (['gopay', 'ovo', 'dana', 'shopeepay', 'grabpay', 'qris'].includes(paymentMethod)) {
          const gateway = paymentGateways.find(g => 
            g.supportedMethods.includes(paymentMethod)
          );
          if (gateway) {
            await paymentsAPI.processPayment({
              orderId: response.data.order.id,
              amount: response.data.order.total,
              paymentMethod: paymentMethod,
              gateway: gateway.id,
              customerInfo: {
                name: customerName,
                phone: customerPhone
              }
            });
          }
        }

        alert(`Delivery order created! Order #${response.data.order.orderNumber}\nService: ${response.data.order.serviceName}`);
        
        // Sync to delivery service
        await deliveryAPI.syncOrder(response.data.order.id);
        
        setCart([]);
        setDeliveryAddress('');
        setCustomerName('');
        setCustomerPhone('');
        loadProducts();
        return;
      }

      // Regular POS order
      if (!selectedOutlet && outlets.length > 0) {
        alert('Please select an outlet location');
        return;
      }
      
      const response = await posAPI.createOrder({
        items: cart,
        customerId: selectedCustomer,
        outletId: selectedOutlet,
        paymentMethod,
        discount: parseFloat(discount) || 0,
        userId: posUser?.id || 'system'
      });

      setCurrentOrder(response.data.order);
      alert(`Order created successfully! Order #${response.data.order.orderNumber}`);
      setCart([]);
      setSelectedCustomer(null);
      setDiscount(0);
      loadProducts();
    } catch (error) {
      console.error('Error creating order:', error);
      alert(error.response?.data?.error || 'Error creating order');
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pos-page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Point of Sale</h1>
          <p className="page-subtitle">Process sales transactions</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span>Logged in as: <strong>{posUser?.name || posUser?.username}</strong> ({posUser?.role})</span>
          <button className="btn btn-outline" onClick={() => {
            const token = localStorage.getItem('token');
            const posToken = localStorage.getItem('posToken');
            
            // If POS user, logout to POS login
            if (posToken) {
              localStorage.removeItem('posToken');
              localStorage.removeItem('posUser');
              navigate('/pos-login');
            } else if (token) {
              // If admin user, just go back to dashboard
              navigate('/');
            }
          }}>Logout</button>
        </div>
      </div>

      <div className="pos-container">
        <div className="pos-products">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="products-grid">
            {filteredProducts.map(product => (
              <div
                key={product.id}
                className="product-card"
                onClick={() => addToCart(product)}
              >
                {product.image ? (
                  <div className="product-image-container">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="product-image"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                ) : (
                  <div className="product-image-placeholder">
                    <span>📦</span>
                  </div>
                )}
                <div className="product-name">{product.name}</div>
                <div className="product-price">Rp {product.price.toLocaleString('id-ID')}</div>
                <div className="product-stock">Stock: {product.stock}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="pos-cart">
          <div className="card">
            <div className="card-header">Cart</div>
            
            {outlets.length > 0 && (
              <div className="form-group">
                <label className="form-label">Outlet Location *</label>
                <select
                  className="form-control"
                  value={selectedOutlet || ''}
                  onChange={(e) => setSelectedOutlet(e.target.value)}
                  required
                >
                  <option value="">Select Outlet</option>
                  {outlets.filter(o => o.status === 'active').map(outlet => (
                    <option key={outlet.id} value={outlet.id}>
                      {outlet.name} - {outlet.city || outlet.address}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Order Type</label>
              <select
                className="form-control"
                value={orderType}
                onChange={(e) => setOrderType(e.target.value)}
              >
                <option value="dine-in">Dine In</option>
                <option value="delivery">Delivery (GoFood/ShopeeFood/GrabFood)</option>
              </select>
            </div>

            {orderType === 'delivery' && (
              <>
                <div className="form-group">
                  <label className="form-label">Delivery Service</label>
                  <select
                    className="form-control"
                    value={deliveryService}
                    onChange={(e) => setDeliveryService(e.target.value)}
                  >
                    {deliveryServices.map(service => (
                      <option key={service.id} value={service.id}>
                        {service.name} (Commission: {(service.commissionRate * 100).toFixed(1)}%)
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Customer Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Customer Phone *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="081234567890"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Delivery Address *</label>
                  <textarea
                    className="form-control"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Enter full delivery address"
                    rows="3"
                    required
                  />
                </div>
              </>
            )}

            {orderType === 'dine-in' && (
              <div className="form-group">
                <label className="form-label">Customer</label>
                <select
                  className="form-control"
                  value={selectedCustomer || ''}
                  onChange={(e) => setSelectedCustomer(e.target.value || null)}
                >
                  <option value="">Walk-in Customer</option>
                  {customers.map(customer => {
                    const customerTypeLabels = {
                      'retail': 'Retail',
                      'wholesale': 'Wholesale',
                      'corporate': 'Corporate',
                      'delivery': 'Delivery (Online)',
                      'dine-in': 'Dine In'
                    };
                    const typeLabel = customerTypeLabels[customer.customerType] || customer.customerType;
                    return (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} ({typeLabel}) - {customer.phone || customer.whatsapp || 'No phone'}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

            <div className="cart-items">
              {cart.length === 0 ? (
                <p>Cart is empty</p>
              ) : (
                cart.map(item => (
                  <div key={item.productId} className="cart-item">
                    {item.image && (
                      <img 
                        src={item.image} 
                        alt={item.productName}
                        className="cart-item-image"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    )}
                    <div className="cart-item-info">
                      <div className="cart-item-name">{item.productName}</div>
                      <div className="cart-item-price">Rp {item.price.toLocaleString('id-ID')}</div>
                    </div>
                    <div className="cart-item-actions">
                      <button
                        className="btn btn-outline"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      >
                        -
                      </button>
                      <span className="cart-item-quantity">{item.quantity}</span>
                      <button
                        className="btn btn-outline"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <div className="cart-item-total">
                      Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                    </div>
                    {currentOrder && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleRequestCancel(item)}
                        style={{ marginLeft: '10px' }}
                        title="Request cancellation (requires manager approval)"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="cart-summary">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>Rp {calculateSubtotal().toLocaleString('id-ID')}</span>
              </div>
              <div className="form-group">
                <label className="form-label">Discount</label>
                <input
                  type="number"
                  className="form-control"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="summary-row total">
                <span>Total:</span>
                <span>Rp {calculateTotal().toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Payment Method (Metode Pembayaran)</label>
              <select
                className="form-control"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                {paymentMethods.map(method => (
                  <option key={method.value} value={method.value}>{method.label}</option>
                ))}
              </select>
            </div>

            <button
              className="btn btn-primary btn-block"
              onClick={handleCheckout}
              disabled={cart.length === 0}
            >
              Checkout
            </button>
          </div>
        </div>
      </div>

      {/* Cancellation Modal */}
      {showCancelModal && (
        <div className="modal-overlay" onClick={() => { setShowCancelModal(false); setCancelItem(null); setCancelReason(''); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Request Item Cancellation</h2>
            <p><strong>Item:</strong> {cancelItem?.productName}</p>
            <p><strong>Quantity:</strong> {cancelItem?.quantity}</p>
            <p><strong>Amount:</strong> Rp {(cancelItem?.price * cancelItem?.quantity).toLocaleString('id-ID')}</p>
            <div className="form-group">
              <label className="form-label">Reason for Cancellation *</label>
              <textarea
                className="form-control"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Enter reason for cancellation..."
                rows="4"
                required
              />
              <small style={{ color: '#6C757D', fontSize: '12px' }}>
                This request requires manager approval
              </small>
            </div>
            <div className="modal-actions">
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={submitCancelRequest}
                disabled={!cancelReason.trim()}
              >
                Submit Request
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => { setShowCancelModal(false); setCancelItem(null); setCancelReason(''); }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POS;

