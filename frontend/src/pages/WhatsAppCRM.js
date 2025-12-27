import React, { useState, useEffect } from 'react';
import { whatsappAPI, customersAPI } from '../services/api';
import './WhatsAppCRM.css';

const WhatsAppCRM = () => {
  const [status, setStatus] = useState(null);
  const [messages, setMessages] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [sendData, setSendData] = useState({
    phone: '',
    message: ''
  });
  const [templateData, setTemplateData] = useState({
    name: '',
    content: '',
    category: 'general'
  });

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      loadStatus();
      loadMessages();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([
        loadStatus(),
        loadMessages(),
        loadTemplates(),
        loadCustomers()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadStatus = async () => {
    try {
      const response = await whatsappAPI.getStatus();
      setStatus(response.data);
    } catch (error) {
      console.error('Error loading status:', error);
    }
  };

  const loadMessages = async () => {
    try {
      const response = await whatsappAPI.getMessages();
      setMessages(response.data.slice(0, 50));
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const loadTemplates = async () => {
    try {
      const response = await whatsappAPI.getTemplates();
      setTemplates(response.data);
    } catch (error) {
      console.error('Error loading templates:', error);
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

  const handleInit = async () => {
    try {
      await whatsappAPI.init();
      alert('WhatsApp initialization started. Check the server console for QR code.');
    } catch (error) {
      console.error('Error initializing WhatsApp:', error);
      alert('Error initializing WhatsApp');
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    try {
      await whatsappAPI.sendMessage(sendData);
      alert('Message sent successfully!');
      setShowSendModal(false);
      setSendData({ phone: '', message: '' });
      loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      alert(error.response?.data?.error || 'Error sending message');
    }
  };

  const handleSaveTemplate = async (e) => {
    e.preventDefault();
    try {
      await whatsappAPI.createTemplate(templateData);
      setShowTemplateModal(false);
      setTemplateData({ name: '', content: '', category: 'general' });
      loadTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Error saving template');
    }
  };

  const sendTemplate = async (template, customer) => {
    try {
      await whatsappAPI.sendTemplate({
        phone: customer.whatsapp || customer.phone,
        templateId: template.id
      });
      alert('Template sent successfully!');
      loadMessages();
    } catch (error) {
      console.error('Error sending template:', error);
      alert('Error sending template');
    }
  };

  return (
    <div className="whatsapp-page">
      <div className="page-header">
        <h1 className="page-title">WhatsApp CRM</h1>
        <p className="page-subtitle">Manage customer communications</p>
      </div>

      <div className="card">
        <div className="card-header">WhatsApp Status</div>
        <div className="whatsapp-status">
          <div className="status-item">
            <span>Status:</span>
            <span className={`badge ${status?.isReady ? 'badge-success' : 'badge-danger'}`}>
              {status?.isReady ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          {!status?.isReady && (
            <button className="btn btn-primary" onClick={handleInit}>
              Initialize WhatsApp
            </button>
          )}
          {status?.qrCode && (
            <div className="qr-info">
              <p>Scan QR code from server console to connect</p>
            </div>
          )}
        </div>
      </div>

      <div className="action-bar">
        <button className="btn btn-primary" onClick={() => setShowSendModal(true)}>
          Send Message
        </button>
        <button className="btn btn-secondary" onClick={() => setShowTemplateModal(true)}>
          Create Template
        </button>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">Message Templates</div>
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {templates.map(template => (
                <tr key={template.id}>
                  <td>{template.name}</td>
                  <td><span className="badge badge-info">{template.category}</span></td>
                  <td>
                    <button
                      className="btn btn-outline"
                      onClick={() => {
                        const customer = customers[0];
                        if (customer) {
                          sendTemplate(template, customer);
                        } else {
                          alert('No customers available');
                        }
                      }}
                    >
                      Send
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-header">Recent Messages</div>
          <div className="messages-list">
            {messages.map(message => (
              <div key={message.id} className={`message-item ${message.type}`}>
                <div className="message-header">
                  <span>{message.type === 'incoming' ? 'From' : 'To'}: {message.from || message.to}</span>
                  <span className="message-time">
                    {new Date(message.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="message-body">{message.body}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showSendModal && (
        <div className="modal-overlay" onClick={() => setShowSendModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Send WhatsApp Message</h2>
            <form onSubmit={handleSend}>
              <div className="form-group">
                <label className="form-label">Customer</label>
                <select
                  className="form-control"
                  value={sendData.phone}
                  onChange={(e) => {
                    const customer = customers.find(c => c.id === e.target.value);
                    setSendData({
                      ...sendData,
                      phone: customer?.whatsapp || customer?.phone || ''
                    });
                  }}
                >
                  <option value="">Select Customer</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} - {customer.whatsapp || customer.phone}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  className="form-control"
                  value={sendData.phone}
                  onChange={(e) => setSendData({ ...sendData, phone: e.target.value })}
                  placeholder="6281234567890"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Message</label>
                <textarea
                  className="form-control"
                  value={sendData.message}
                  onChange={(e) => setSendData({ ...sendData, message: e.target.value })}
                  rows="5"
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">Send</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowSendModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTemplateModal && (
        <div className="modal-overlay" onClick={() => setShowTemplateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Create Message Template</h2>
            <form onSubmit={handleSaveTemplate}>
              <div className="form-group">
                <label className="form-label">Template Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={templateData.name}
                  onChange={(e) => setTemplateData({ ...templateData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-control"
                  value={templateData.category}
                  onChange={(e) => setTemplateData({ ...templateData, category: e.target.value })}
                >
                  <option value="general">General</option>
                  <option value="promotion">Promotion</option>
                  <option value="order">Order</option>
                  <option value="support">Support</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Content</label>
                <textarea
                  className="form-control"
                  value={templateData.content}
                  onChange={(e) => setTemplateData({ ...templateData, content: e.target.value })}
                  rows="8"
                  required
                  placeholder="Use {{variable}} for dynamic content"
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">Save</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowTemplateModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsAppCRM;

