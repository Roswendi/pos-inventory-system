# TDO POS System - Client Deployment Guide

Complete guide for deploying the POS system for client use on computers, tablets, and iPads.

## Table of Contents
1. [Deployment Options](#deployment-options)
2. [System Requirements](#system-requirements)
3. [Web-Based Deployment (Recommended)](#web-based-deployment-recommended)
4. [PWA Installation (Tablets/iPads)](#pwa-installation-tabletsipads)
5. [Local Network Deployment](#local-network-deployment)
6. [Cloud Deployment](#cloud-deployment)
7. [Mobile App Deployment](#mobile-app-deployment)
8. [Setup Instructions](#setup-instructions)
9. [Client Access Methods](#client-access-methods)

---

## Deployment Options

### Option 1: Web-Based (Easiest - Recommended)
- ✅ Works on all devices (Windows, Mac, iPad, Android tablets)
- ✅ No installation needed
- ✅ Easy updates
- ✅ Accessible via browser
- ✅ Can be installed as PWA on tablets/iPads

### Option 2: Local Network Deployment
- ✅ Fast performance
- ✅ Works offline (after initial load)
- ✅ No internet required
- ✅ Secure (local network only)

### Option 3: Cloud Deployment
- ✅ Accessible from anywhere
- ✅ Automatic backups
- ✅ Scalable
- ✅ Professional hosting

### Option 4: Mobile App (Advanced)
- ✅ Native app experience
- ✅ App store distribution
- ⚠️ More complex setup

---

## System Requirements

### Server Requirements (Backend)
- **Operating System**: Windows, macOS, or Linux
- **Node.js**: Version 14.x or higher
- **RAM**: Minimum 2GB, Recommended 4GB+
- **Storage**: 500MB for application + data storage
- **Network**: For multi-device access, local network or internet connection

### Client Device Requirements
- **Computers (Windows/Mac)**:
  - Modern web browser (Chrome, Edge, Firefox, Safari)
  - Internet connection OR local network access
  - Minimum screen resolution: 1024x768

- **Tablets/iPads**:
  - iOS 12+ (iPad)
  - Android 8+ (Android tablets)
  - Modern browser (Safari, Chrome)
  - Internet connection OR local network access
  - Can install as PWA (Progressive Web App)

### Network Requirements
- **Local Network**: Router/WiFi for local access
- **Internet**: Required for cloud deployment
- **Ports**: 
  - Backend: 5001 (configurable)
  - Frontend: 3000 (development) or 80/443 (production)

---

## Web-Based Deployment (Recommended)

### Method 1: Local Network Deployment (Best for Single Location)

#### Setup Steps:

**1. Install on Server Computer:**
```bash
# Navigate to project
cd "pos-inventory-system"

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

**2. Build Frontend for Production:**
```bash
cd frontend
npm run build
```

**3. Configure Backend to Serve Frontend:**
Update `backend/server.js` to serve the built frontend:
```javascript
// Add this before routes
const path = require('path');
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Add catch-all route (after API routes)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});
```

**4. Start Production Server:**
```bash
cd backend
NODE_ENV=production npm start
```

**5. Find Server IP Address:**
```bash
# On Mac/Linux:
ifconfig | grep "inet "

# On Windows:
ipconfig
```

**6. Access from Client Devices:**
- Open browser on any device (computer, tablet, iPad)
- Go to: `http://[SERVER_IP]:5001`
- Example: `http://192.168.1.100:5001`

**⚠️ IMPORTANT: Use Port 5001, NOT 3000!**
- Port 3000 is for development only (React dev server)
- Port 5001 is for production/client deployment
- In production, backend serves both API and frontend on port 5001
- Clients only need to access port 5001

---

### Method 2: Cloud Deployment (Best for Multiple Locations)

#### Option A: Railway (Backend) + Netlify (Frontend)

**Backend Deployment (Railway):**
1. Sign up at https://railway.app
2. Create new project
3. Connect GitHub repository
4. Add environment variables:
   - `PORT=5001`
   - `JWT_SECRET=your-secret-key`
5. Deploy

**Frontend Deployment (Netlify):**
1. Sign up at https://netlify.com
2. Build command: `cd frontend && npm install && npm run build`
3. Publish directory: `frontend/build`
4. Add environment variable:
   - `REACT_APP_API_URL=https://your-railway-app.railway.app/api`
5. Deploy

**Access:**
- Clients access via: `https://your-app.netlify.app`

#### Option B: VPS Deployment (DigitalOcean, AWS, etc.)

**Setup:**
1. Create VPS instance (Ubuntu recommended)
2. Install Node.js and PM2
3. Clone repository
4. Build and deploy
5. Configure domain name (optional)
6. Set up SSL certificate (Let's Encrypt)

---

## PWA Installation (Tablets/iPads)

The application is already configured as a Progressive Web App (PWA), which means clients can install it on their tablets/iPads like a native app.

### Installation Steps:

**For iPad (Safari):**
1. Open Safari browser
2. Navigate to your POS system URL
3. Tap the Share button (square with arrow)
4. Tap "Add to Home Screen"
5. Enter app name (e.g., "TDO POS")
6. Tap "Add"
7. App icon appears on home screen

**For Android Tablets (Chrome):**
1. Open Chrome browser
2. Navigate to your POS system URL
3. Tap menu (3 dots)
4. Tap "Add to Home screen" or "Install app"
5. Confirm installation
6. App icon appears on home screen

**Benefits:**
- ✅ Works like native app
- ✅ Offline capability (after initial load)
- ✅ No app store needed
- ✅ Easy updates

---

## Local Network Deployment

### Complete Setup Guide

**1. Server Setup:**
```bash
# On the server computer
cd "pos-inventory-system/backend"

# Install PM2 for process management
npm install -g pm2

# Start backend with PM2
pm2 start server.js --name "pos-backend"
pm2 save
pm2 startup  # Follow instructions to auto-start on boot
```

**2. Frontend Build:**
```bash
cd "../frontend"
npm run build
```

**3. Configure Backend to Serve Frontend:**
Add to `backend/server.js`:
```javascript
const path = require('path');

// Serve static files from React app
app.use(express.static(path.join(__dirname, '../frontend/build')));

// API routes (keep existing)
app.use('/api/products', productsRoutes);
// ... other routes

// Catch-all handler: send back React's index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});
```

**4. Start Production Server:**
```bash
cd backend
NODE_ENV=production node server.js
```

**5. Client Access:**
- All devices on same WiFi network can access
- URL: `http://[SERVER_IP]:5001`
- Works on: Computers, iPads, Android tablets

---

## Cloud Deployment

### Railway + Netlify Setup

**Backend (Railway):**
1. Create account at railway.app
2. New Project → Deploy from GitHub
3. Select repository
4. Add environment variables:
   ```
   PORT=5001
   JWT_SECRET=your-secret-key-here
   NODE_ENV=production
   ```
5. Deploy

**Frontend (Netlify):**
1. Create account at netlify.com
2. New site → Deploy from GitHub
3. Build settings:
   - Base directory: `frontend`
   - Build command: `npm install && npm run build`
   - Publish directory: `frontend/build`
4. Environment variables:
   ```
   REACT_APP_API_URL=https://your-app.railway.app/api
   ```
5. Deploy

**Client Access:**
- URL: `https://your-app.netlify.app`
- Works on all devices with internet

---

## Mobile App Deployment

### Using Capacitor (Recommended)

**1. Install Capacitor:**
```bash
cd frontend
npm install @capacitor/core @capacitor/cli
npm install @capacitor/ios @capacitor/android
npx cap init
```

**2. Build:**
```bash
npm run build
```

**3. Add Platforms:**
```bash
npx cap add ios
npx cap add android
```

**4. Sync:**
```bash
npx cap sync
```

**5. Open in Native IDEs:**
```bash
# iOS (Mac only)
npx cap open ios

# Android
npx cap open android
```

**6. Build Apps:**
- iOS: Xcode → Archive → App Store
- Android: Android Studio → Build → Generate Signed APK

---

## Setup Instructions

### Quick Start for Client Deployment

**Step 1: Prepare Server Computer**
```bash
# Install Node.js (if not installed)
# Download from: https://nodejs.org

# Verify installation
node --version  # Should be 14.x or higher
npm --version
```

**Step 2: Install Application**
```bash
# Copy entire pos-inventory-system folder to server
# Navigate to folder
cd pos-inventory-system

# Install backend
cd backend
npm install

# Install frontend
cd ../frontend
npm install
```

**Step 3: Build for Production**
```bash
cd frontend
npm run build
```

**Step 4: Configure Backend**
Update `backend/server.js` to serve frontend:
```javascript
const path = require('path');
app.use(express.static(path.join(__dirname, '../frontend/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});
```

**Step 5: Start Server**
```bash
cd backend
NODE_ENV=production node server.js
```

**Step 6: Get Server IP**
```bash
# Mac/Linux
ifconfig | grep "inet "

# Windows
ipconfig
```

**Step 7: Access from Client Devices**
- Open browser
- Go to: `http://[SERVER_IP]:5001`
- Login with default credentials:
  - Username: `admin`
  - Password: `admin123`

---

## Client Access Methods

### Method 1: Direct IP Access (Local Network)
- **URL**: `http://192.168.1.100:5001`
- **Best for**: Single location, local network
- **Devices**: All devices on same WiFi

### Method 2: Domain Name (Local)
- **Setup**: Configure local DNS or hosts file
- **URL**: `http://pos.local:5001`
- **Best for**: Easier access, memorable name

### Method 3: Cloud URL (Internet)
- **URL**: `https://your-app.netlify.app`
- **Best for**: Multiple locations, remote access
- **Devices**: Any device with internet

### Method 4: PWA Installation
- **Method**: Add to home screen
- **Best for**: Tablets/iPads, frequent use
- **Benefits**: App-like experience, offline capable

---

## Production Checklist

### Before Client Deployment:

- [ ] Change default admin password
- [ ] Configure server IP or domain
- [ ] Set up SSL certificate (for HTTPS)
- [ ] Configure firewall rules
- [ ] Set up automatic backups
- [ ] Test on all device types
- [ ] Create user accounts for staff
- [ ] Set up outlet locations
- [ ] Configure payment methods
- [ ] Test POS functionality
- [ ] Set up data backup schedule

### Security Checklist:

- [ ] Change JWT_SECRET in backend
- [ ] Use strong passwords
- [ ] Enable HTTPS (SSL certificate)
- [ ] Configure firewall
- [ ] Regular backups
- [ ] Update dependencies regularly

---

## Maintenance

### Daily:
- Monitor server status
- Check backup completion
- Monitor error logs

### Weekly:
- Review sales reports
- Check system performance
- Update if needed

### Monthly:
- Update dependencies
- Review security
- Optimize database

---

## Troubleshooting

### Client Can't Access:
1. Check server is running
2. Verify IP address is correct
3. Check firewall settings
4. Ensure devices on same network
5. Try different browser

### Slow Performance:
1. Check server resources (RAM/CPU)
2. Optimize database
3. Clear browser cache
4. Check network speed

### Connection Errors:
1. Verify backend is running
2. Check port 5001 is open
3. Verify API URL in frontend
4. Check CORS settings

---

## Support

For deployment assistance:
1. Check server logs: `backend/server.js` console
2. Check browser console (F12)
3. Verify network connectivity
4. Test API endpoint: `http://[SERVER_IP]:5001/api/health`

---

## Summary

**Easiest Method for Clients:**
1. Deploy on local server computer
2. Build frontend: `npm run build`
3. Configure backend to serve frontend
4. Start server: `node server.js`
5. Access from: `http://[SERVER_IP]:5001`
6. Install as PWA on tablets/iPads

**Best for Multiple Locations:**
1. Deploy backend to Railway
2. Deploy frontend to Netlify
3. Access from: `https://your-app.netlify.app`
4. Works on all devices with internet

The application is ready for client deployment! 🚀

