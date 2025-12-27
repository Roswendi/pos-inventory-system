const express = require('express');
const router = express.Router();
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const messagesPath = path.join(__dirname, '../data/customers/messages.json');
const templatesPath = path.join(__dirname, '../data/customers/templates.json');

// Initialize WhatsApp client
let whatsappClient = null;
let isReady = false;
let qrCode = null;

// Helper functions
const readMessages = () => {
  try {
    return JSON.parse(fs.readFileSync(messagesPath, 'utf8'));
  } catch (error) {
    return [];
  }
};

const writeMessages = (data) => {
  fs.writeFileSync(messagesPath, JSON.stringify(data, null, 2));
};

const readTemplates = () => {
  try {
    return JSON.parse(fs.readFileSync(templatesPath, 'utf8'));
  } catch (error) {
    return [];
  }
};

const writeTemplates = (data) => {
  fs.writeFileSync(templatesPath, JSON.stringify(data, null, 2));
};

// Initialize WhatsApp
const initWhatsApp = () => {
  if (whatsappClient) {
    return whatsappClient;
  }

  whatsappClient = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
  });

  whatsappClient.on('qr', (qr) => {
    qrCode = qr;
    qrcode.generate(qr, { small: true });
    console.log('QR Code generated. Scan with WhatsApp.');
  });

  whatsappClient.on('ready', () => {
    isReady = true;
    console.log('WhatsApp client is ready!');
  });

  whatsappClient.on('authenticated', () => {
    console.log('WhatsApp authenticated');
  });

  whatsappClient.on('auth_failure', (msg) => {
    console.error('WhatsApp authentication failure:', msg);
    isReady = false;
  });

  whatsappClient.on('disconnected', () => {
    console.log('WhatsApp client disconnected');
    isReady = false;
  });

  whatsappClient.on('message', async (msg) => {
    // Save incoming message
    const messages = readMessages();
    messages.push({
      id: uuidv4(),
      from: msg.from,
      to: msg.to,
      body: msg.body,
      timestamp: new Date(msg.timestamp * 1000).toISOString(),
      type: 'incoming',
      isRead: false
    });
    writeMessages(messages);
  });

  whatsappClient.initialize();
  return whatsappClient;
};

// Get WhatsApp status
router.get('/status', (req, res) => {
  res.json({
    isReady,
    qrCode: qrCode || null
  });
});

// Initialize WhatsApp connection
router.post('/init', async (req, res) => {
  try {
    if (!whatsappClient) {
      initWhatsApp();
    }
    res.json({ message: 'WhatsApp client initialization started', qrCode });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send message
router.post('/send', async (req, res) => {
  const { phone, message } = req.body;
  
  if (!phone || !message) {
    return res.status(400).json({ error: 'Phone number and message are required' });
  }
  
  if (!isReady) {
    return res.status(400).json({ error: 'WhatsApp client is not ready. Please initialize first.' });
  }
  
  try {
    // Format phone number (remove +, spaces, etc.)
    const formattedPhone = phone.replace(/[^0-9]/g, '');
    const chatId = formattedPhone.includes('@c.us') 
      ? formattedPhone 
      : `${formattedPhone}@c.us`;
    
    const sentMessage = await whatsappClient.sendMessage(chatId, message);
    
    // Save outgoing message
    const messages = readMessages();
    messages.push({
      id: uuidv4(),
      from: 'me',
      to: chatId,
      body: message,
      timestamp: new Date().toISOString(),
      type: 'outgoing',
      messageId: sentMessage.id._serialized
    });
    writeMessages(messages);
    
    res.json({ 
      success: true, 
      messageId: sentMessage.id._serialized,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get messages
router.get('/messages', (req, res) => {
  const messages = readMessages();
  const { phone, startDate, endDate } = req.query;
  
  let filtered = messages;
  
  if (phone) {
    filtered = filtered.filter(m => m.from.includes(phone) || m.to.includes(phone));
  }
  if (startDate) {
    filtered = filtered.filter(m => new Date(m.timestamp) >= new Date(startDate));
  }
  if (endDate) {
    filtered = filtered.filter(m => new Date(m.timestamp) <= new Date(endDate));
  }
  
  res.json(filtered);
});

// Message templates
router.get('/templates', (req, res) => {
  const templates = readTemplates();
  res.json(templates);
});

router.post('/templates', (req, res) => {
  const templates = readTemplates();
  const newTemplate = {
    id: uuidv4(),
    name: req.body.name,
    content: req.body.content,
    category: req.body.category || 'general',
    createdAt: new Date().toISOString()
  };
  
  templates.push(newTemplate);
  writeTemplates(templates);
  res.status(201).json(newTemplate);
});

router.put('/templates/:id', (req, res) => {
  const templates = readTemplates();
  const index = templates.findIndex(t => t.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Template not found' });
  }
  
  templates[index] = {
    ...templates[index],
    ...req.body,
    id: req.params.id
  };
  
  writeTemplates(templates);
  res.json(templates[index]);
});

router.delete('/templates/:id', (req, res) => {
  const templates = readTemplates();
  const filtered = templates.filter(t => t.id !== req.params.id);
  if (filtered.length === templates.length) {
    return res.status(404).json({ error: 'Template not found' });
  }
  writeTemplates(filtered);
  res.json({ message: 'Template deleted successfully' });
});

// Send message using template
router.post('/send-template', async (req, res) => {
  const { phone, templateId, variables } = req.body;
  
  if (!phone || !templateId) {
    return res.status(400).json({ error: 'Phone number and template ID are required' });
  }
  
  const templates = readTemplates();
  const template = templates.find(t => t.id === templateId);
  if (!template) {
    return res.status(404).json({ error: 'Template not found' });
  }
  
  if (!isReady) {
    return res.status(400).json({ error: 'WhatsApp client is not ready. Please initialize first.' });
  }
  
  let message = template.content;
  if (variables) {
    Object.entries(variables).forEach(([key, value]) => {
      message = message.replace(`{{${key}}}`, value);
    });
  }
  
  try {
    // Format phone number (remove +, spaces, etc.)
    const formattedPhone = phone.replace(/[^0-9]/g, '');
    const chatId = formattedPhone.includes('@c.us') 
      ? formattedPhone 
      : `${formattedPhone}@c.us`;
    
    const sentMessage = await whatsappClient.sendMessage(chatId, message);
    
    // Save outgoing message
    const messages = readMessages();
    messages.push({
      id: uuidv4(),
      from: 'me',
      to: chatId,
      body: message,
      timestamp: new Date().toISOString(),
      type: 'outgoing',
      messageId: sentMessage.id._serialized,
      templateId: templateId
    });
    writeMessages(messages);
    
    res.json({ 
      success: true, 
      messageId: sentMessage.id._serialized,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

