import React from 'react';
import './Navbar.css';

const Navbar = ({ onLogout }) => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="navbar-logo-container">
          <img 
            src="/logo512.png" 
            alt="TDO Logo" 
            className="navbar-logo"
            onError={(e) => {
              // Hide logo if not found, text will still show
              e.target.style.display = 'none';
            }}
          />
          <div className="navbar-title">
            <span className="navbar-title-main">TDO</span>
            <span className="navbar-title-sub">POS System</span>
          </div>
        </div>
      </div>
      <div className="navbar-actions">
        <button className="btn btn-outline" onClick={onLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;

