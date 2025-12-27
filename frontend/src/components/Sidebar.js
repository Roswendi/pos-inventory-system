import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';
import { 
  FiHome, FiPackage, FiShoppingCart, FiDollarSign, 
  FiUsers, FiMessageCircle, FiBarChart2, FiTruck, FiFileText, FiMapPin
} from 'react-icons/fi';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: FiHome },
    { path: '/products', label: 'Products', icon: FiPackage },
    { path: '/inventory', label: 'Inventory', icon: FiBarChart2 },
    { path: '/pos', label: 'POS', icon: FiShoppingCart },
    { path: '/delivery', label: 'Delivery Orders', icon: FiTruck },
    { path: '/accounting', label: 'Accounting', icon: FiDollarSign },
    { path: '/customers', label: 'Customers', icon: FiUsers },
    { path: '/whatsapp', label: 'WhatsApp CRM', icon: FiMessageCircle },
    { path: '/outlets', label: 'Outlets', icon: FiMapPin },
    { path: '/pos-reports', label: 'POS Reports', icon: FiFileText }
  ];

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-item ${isActive ? 'active' : ''}`}
            >
              <Icon className="sidebar-icon" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;

