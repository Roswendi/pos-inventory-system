# Direct Deployment to Hostinger - No GitHub Needed

Simple guide to deploy your POS system directly to Hostinger without using GitHub.

## Table of Contents
1. [Method 1: FTP Upload (Recommended)](#method-1-ftp-upload-recommended)
2. [Method 2: File Manager Upload](#method-2-file-manager-upload)
3. [Method 3: Hostinger Node.js App](#method-3-hostinger-nodejs-app)
4. [Post-Deployment Setup](#post-deployment-setup)
5. [Troubleshooting](#troubleshooting)

---

## Method 1: FTP Upload (Recommended)

### Step 1: Get FTP Credentials

1. Log into Hostinger hPanel
2. Go to **FTP Accounts** or **File Manager**
3. Note your FTP credentials:
   - FTP Host: `ftp.your-domain.com` or IP address
   - FTP Username: (your username)
   - FTP Password: (your password)
   - Port: `21`

### Step 2: Download FileZilla (Free FTP Client)

1. Download: https://filezilla-project.org/download.php?type=client
2. Install FileZilla

### Step 3: Prepare Files Locally

Run the deployment script to prepare files:

```bash
cd "/Users/endiroswendi/Documents/ Old Laptop Documents/CAO/FINANCIAL REPORT/pos-inventory-system"
bash HOSTINGER_DEPLOY.sh
```

This creates: `hostinger-pos-system.tar.gz`

### Step 4: Extract Files

1. Extract `hostinger-pos-system.tar.gz` on your computer
2. You'll get a folder with all files ready

### Step 5: Connect via FTP

1. Open FileZilla
2. Enter FTP credentials:
   - **Host:** `ftp.your-domain.com` (or IP from Hostinger)
   - **Username:** Your FTP username
   - **Password:** Your FTP password
   - **Port:** `21`
3. Click **Quickconnect**

### Step 6: Upload Files

1. **Left side (Local):** Navigate to extracted folder
2. **Right side (Remote):** Navigate to your domain folder (usually `public_html` or `www`)
3. **Select all files** from left side
4. **Drag and drop** to right side
5. Wait for upload to complete

### Step 7: Configure on Server

1. SSH to server (or use Terminal in hPanel)
2. Navigate to uploaded folder:
```bash
cd public_html  # or wherever you uploaded
```

3. Install dependencies:
```bash
npm install --production
```

4. Create `.env` file:
```bash
cp .env.example .env
nano .env
```

Add:
```
NODE_ENV=production
PORT=5001
JWT_SECRET=your-super-secret-key-change-this
```

5. Set permissions:
```bash
chmod -R 755 .
chmod -R 777 data
chmod -R 777 uploads
```

6. Start application (if using VPS):
```bash
pm2 start server.js --name "pos-system"
pm2 save
```

---

## Method 2: File Manager Upload

### Step 1: Prepare Files

Run deployment script:
```bash
bash HOSTINGER_DEPLOY.sh
```

Extract `hostinger-pos-system.tar.gz` on your computer.

### Step 2: Upload via File Manager

1. Log into Hostinger hPanel
2. Go to **File Manager**
3. Navigate to your domain folder (`public_html` or `www`)
4. Click **Upload** button
5. Select **all files** from extracted folder
6. Click **Upload**
7. Wait for upload to complete

### Step 3: Configure

Follow Step 7 from Method 1 above.

---

## Method 3: Hostinger Node.js App

### Step 1: Access Node.js Section

1. Log into Hostinger hPanel
2. Find **Node.js** or **Applications** section
3. Click **Create Node.js App**

### Step 2: Configure App

1. **App Name:** `pos-system`
2. **Node.js Version:** `18.x` (or latest LTS)
3. **Startup File:** `server.js`
4. **Port:** `5001` (or use provided port)
5. Click **Create**

### Step 3: Upload Files

**Option A: Via File Manager**
1. Go to File Manager
2. Navigate to Node.js app folder (usually in `nodejs-apps/pos-system/`)
3. Upload all files from extracted `hostinger-pos-system.tar.gz`

**Option B: Via FTP**
1. Connect via FTP
2. Navigate to Node.js app folder
3. Upload all files

### Step 4: Install Dependencies

1. In hPanel, go to Node.js section
2. Click on your app
3. Open **Terminal** or **SSH**
4. Run:
```bash
npm install --production
```

### Step 5: Set Environment Variables

1. In Node.js app settings
2. Go to **Environment Variables**
3. Add:
   - `NODE_ENV=production`
   - `JWT_SECRET=your-secret-key`
   - `PORT=5001` (or provided port)

### Step 6: Start Application

1. In Node.js app settings
2. Click **Start** or **Restart**
3. Application should be running

### Step 7: Configure Domain

1. In Node.js app settings
2. Add your domain
3. Access via: `https://your-domain.com`

---

## Post-Deployment Setup

### 1. Verify Application is Running

Check if server is running:
```bash
# On server
ps aux | grep node
# Or
pm2 list
```

### 2. Test API

Open browser:
```
http://your-domain.com/api/health
```

Should return: `{"status":"OK",...}`

### 3. Access Application

Open browser:
```
https://your-domain.com
```

Login with:
- Username: `admin`
- Password: `admin123`

### 4. Set Up SSL (HTTPS)

If not already set up:

1. In hPanel, go to **SSL**
2. Install **Let's Encrypt** certificate (free)
3. Enable **Force HTTPS**

### 5. Configure Nginx (VPS Only)

If using VPS, set up Nginx reverse proxy:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Troubleshooting

### Issue: Application Not Starting

**Check:**
```bash
# Check if Node.js is installed
node --version

# Check if dependencies installed
ls node_modules

# Check logs
pm2 logs pos-system
# Or
tail -f server.log
```

**Fix:**
- Install Node.js if missing
- Run `npm install --production`
- Check `.env` file exists
- Verify port is not in use

### Issue: Cannot Access Application

**Check:**
- Server is running
- Port is correct
- Firewall allows connections
- Domain DNS is correct

**Fix:**
- Start server: `pm2 start server.js`
- Check firewall settings
- Verify domain points to server

### Issue: 500 Internal Server Error

**Check:**
- File permissions
- `.env` file exists
- Dependencies installed
- Server logs

**Fix:**
```bash
chmod -R 755 .
chmod -R 777 data
chmod -R 777 uploads
```

### Issue: API Not Working

**Check:**
- API URL is correct
- CORS is configured
- Server is running

**Fix:**
- Verify server is running
- Check API endpoints in browser console
- Review server logs

---

## Quick Reference

### Important Commands

```bash
# Install dependencies
npm install --production

# Start with PM2
pm2 start server.js --name "pos-system"

# View logs
pm2 logs pos-system

# Restart
pm2 restart pos-system

# Stop
pm2 stop pos-system

# Check status
pm2 status
```

### Important Files

- `server.js` - Main server file
- `package.json` - Dependencies
- `.env` - Environment variables
- `public/` - Frontend build
- `data/` - Data storage
- `uploads/` - Uploaded images

### File Permissions

```bash
# Application files
chmod -R 755 .

# Data and uploads (writable)
chmod -R 777 data
chmod -R 777 uploads
```

---

## Summary

**Easiest Method:**
1. Run `bash HOSTINGER_DEPLOY.sh`
2. Extract `hostinger-pos-system.tar.gz`
3. Upload via FTP using FileZilla
4. SSH to server and run `npm install`
5. Start with PM2 or Hostinger Node.js app

**No GitHub needed!** Just upload files directly to Hostinger.

---

**Need help?** Check Hostinger support or review the troubleshooting section above.

