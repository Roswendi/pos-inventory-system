import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import POSLogin from './pages/POSLogin';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Inventory from './pages/Inventory';
import POS from './pages/POS';
import DeliveryOrders from './pages/DeliveryOrders';
import Accounting from './pages/Accounting';
import Customers from './pages/Customers';
import WhatsAppCRM from './pages/WhatsAppCRM';
import Outlets from './pages/Outlets';
import POSReports from './pages/POSReports';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isPOSAuthenticated, setIsPOSAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const posToken = localStorage.getItem('posToken');
    setIsAuthenticated(!!token);
    setIsPOSAuthenticated(!!posToken);
    setLoading(false);
  }, []);

  const handleLogin = (token) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
  };

  const handlePOSLogin = (user) => {
    setIsPOSAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  const handlePOSLogout = () => {
    localStorage.removeItem('posToken');
    localStorage.removeItem('posUser');
    setIsPOSAuthenticated(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        {/* POS Login Route */}
        <Route 
          path="/pos-login" 
          element={
            isPOSAuthenticated ? (
              <Navigate to="/pos" />
            ) : (
              <POSLogin onLogin={handlePOSLogin} />
            )
          } 
        />
        
        {/* Standalone POS Route - For Cashiers/Managers with POS Login */}
        <Route 
          path="/pos-standalone" 
          element={
            isPOSAuthenticated ? (
              <POS />
            ) : (
              <Navigate to="/pos-login" />
            )
          } 
        />

        {/* Main App Routes - Requires Admin Login */}
        <Route 
          path="*" 
          element={
            !isAuthenticated ? (
              <Login onLogin={handleLogin} />
            ) : (
              <div className="app">
                <Navbar onLogout={handleLogout} />
                <div className="app-body">
                  <Sidebar />
                  <main className="main-content">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/products" element={<Products />} />
                      <Route path="/inventory" element={<Inventory />} />
                      <Route path="/pos" element={<POS />} />
                      <Route path="/delivery" element={<DeliveryOrders />} />
                      <Route path="/accounting" element={<Accounting />} />
                      <Route path="/customers" element={<Customers />} />
                      <Route path="/whatsapp" element={<WhatsAppCRM />} />
                      <Route path="/outlets" element={<Outlets />} />
                      <Route path="/pos-reports" element={<POSReports />} />
                      <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                  </main>
                </div>
              </div>
            )
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;

