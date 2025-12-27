import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import './POSLogin.css';

const POSLogin = ({ onLogin }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login({ username, password });
      const { token, user } = response.data;
      
      // Check if user has POS access (cashier, manager, or admin)
      if (!['cashier', 'manager', 'admin'].includes(user.role)) {
        setError('Access denied. Only cashiers and managers can access POS.');
        setLoading(false);
        return;
      }
      
      localStorage.setItem('posToken', token);
      localStorage.setItem('posUser', JSON.stringify(user));
      if (onLogin) {
        onLogin(user);
      }
      // Navigate to standalone POS for cashiers/managers
      navigate('/pos-standalone');
    } catch (error) {
      setError(error.response?.data?.error || 'Invalid username or password');
      setLoading(false);
    }
  };

  return (
    <div className="pos-login-container">
      <div className="pos-login-box">
        <div className="pos-login-header">
          <h1>TDO POS System</h1>
          <p>Point of Sale Login</p>
        </div>
        
        <form onSubmit={handleSubmit} className="pos-login-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label>User ID</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your User ID"
              required
              autoFocus
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="btn-login"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login to POS'}
          </button>
        </form>
        
        <div className="pos-login-footer">
          <p>Default credentials:</p>
          <p>Cashier: cashier / admin123</p>
          <p>Manager: manager / admin123</p>
        </div>
      </div>
    </div>
  );
};

export default POSLogin;

