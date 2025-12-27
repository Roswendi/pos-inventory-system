# Deploy POS System to Hostinger - Complete Guide

## Table of Contents
1. [Hostinger Hosting Types](#hostinger-hosting-types)
2. [Option 1: VPS Hosting (Recommended)](#option-1-vps-hosting-recommended)
3. [Option 2: Shared Hosting (Limited)](#option-2-shared-hosting-limited)
4. [Option 3: Cloud Hosting](#option-3-cloud-hosting)
5. [Pre-Deployment Checklist](#pre-deployment-checklist)
6. [Step-by-Step Deployment](#step-by-step-deployment)
7. [Post-Deployment Configuration](#post-deployment-configuration)
8. [Troubleshooting](#troubleshooting)

---

## Hostinger Hosting Types

### Check Your Hosting Type

**VPS Hosting** (Best for Node.js):
- ✅ Full server access
- ✅ Can install Node.js
- ✅ Recommended for this app

**Cloud Hosting** (Good for Node.js):
- ✅ Node.js support
- ✅ Scalable
- ✅ Good performance

**Shared Hosting** (Limited):
- ⚠️ Usually doesn't support Node.js
- ⚠️ May need to use alternative methods
- ⚠️ Not recommended for this app

---

## Option 1: VPS Hosting (Recommended)

### Prerequisites
- Hostinger VPS account
- SSH access enabled
- Root or sudo access

### Step 1: Connect to Your VPS

```bash
ssh root@your-server-ip
# Or
ssh username@your-server-ip
```

### Step 2: Install Node.js

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 18.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Verify installation
node --version
npm --version
```

### Step 3: Install PM2 (Process Manager)

```bash
npm install -g pm2
```

### Step 4: Upload Your Application

**Option A: Using Git (Recommended)**

```bash
# Install Git
apt install -y git

# Clone your repository (if using Git)
cd /var/www
git clone your-repository-url pos-inventory-system
cd pos-inventory-system
```

**Option B: Using FTP/SFTP**

1. Use FileZilla or similar FTP client
2. Connect to your server
3. Upload entire `pos-inventory-system` folder to `/var/www/pos-inventory-system`

### Step 5: Install Dependencies

```bash
cd /var/www/pos-inventory-system/backend
npm install --production

cd ../frontend
npm install
npm run build
```

### Step 6: Configure Environment Variables

```bash
cd /var/www/pos-inventory-system/backend
nano .env
```

Add:
```
NODE_ENV=production
PORT=5001
JWT_SECRET=your-super-secret-key-change-this
```

### Step 7: Start with PM2

```bash
cd /var/www/pos-inventory-system/backend
pm2 start server.js --name "pos-system"
pm2 save
pm2 startup
```

### Step 8: Configure Nginx (Reverse Proxy)

```bash
# Install Nginx
apt install -y nginx

# Create Nginx config
nano /etc/nginx/sites-available/pos-system
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Frontend
    location / {
        root /var/www/pos-inventory-system/frontend/build;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Uploads
    location /uploads {
        alias /var/www/pos-inventory-system/backend/uploads;
    }
}
```

Enable the site:
```bash
ln -s /etc/nginx/sites-available/pos-system /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### Step 9: Install SSL Certificate (Let's Encrypt)

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d your-domain.com -d www.your-domain.com
```

### Step 10: Configure Firewall

```bash
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

---

## Option 2: Shared Hosting (Limited)

### If Your Hostinger Plan Doesn't Support Node.js

**Alternative: Use Hostinger's Node.js Hosting (if available)**

1. Log into Hostinger Control Panel (hPanel)
2. Go to "Node.js" section
3. Create new Node.js application
4. Upload your files via File Manager or FTP
5. Set startup file: `backend/server.js`
6. Set port (usually provided by Hostinger)

**Or Use Static Frontend + External Backend:**

1. Deploy frontend to Hostinger (static files)
2. Deploy backend to Railway/Heroku (free tier)
3. Update frontend API URL to point to backend

---

## Option 3: Cloud Hosting

If you have Hostinger Cloud Hosting with Node.js support:

### Step 1: Access hPanel

1. Log into Hostinger
2. Go to hPanel
3. Find "Node.js" or "Applications" section

### Step 2: Create Node.js App

1. Click "Create Node.js App"
2. Select Node.js version (18.x recommended)
3. Set application name: `pos-system`
4. Set startup file: `backend/server.js`
5. Set port: `5001` (or use provided port)

### Step 3: Upload Files

**Via File Manager:**
1. Go to File Manager in hPanel
2. Navigate to your Node.js app directory
3. Upload all files from `pos-inventory-system` folder

**Via FTP:**
1. Use FileZilla
2. Connect using FTP credentials from hPanel
3. Upload entire project folder

### Step 4: Install Dependencies

In hPanel Node.js section:
1. Open Terminal/SSH
2. Run:
```bash
cd backend
npm install --production
cd ../frontend
npm install
npm run build
```

### Step 5: Configure Environment Variables

In hPanel Node.js section:
1. Go to "Environment Variables"
2. Add:
   - `NODE_ENV=production`
   - `JWT_SECRET=your-secret-key`
   - `PORT=5001` (or use provided port)

### Step 6: Start Application

1. In hPanel, click "Start" or "Restart"
2. Application should be running

### Step 7: Configure Domain

1. Point your domain to Hostinger nameservers
2. In hPanel, add domain to your Node.js app
3. Access via: `https://your-domain.com`

---

## Pre-Deployment Checklist

### Before Deploying:

- [ ] Build frontend: `cd frontend && npm run build`
- [ ] Test locally: `cd backend && node server.js`
- [ ] Verify all features work
- [ ] Backup your data files
- [ ] Update API URLs if needed
- [ ] Set strong JWT_SECRET
- [ ] Remove development dependencies
- [ ] Check file permissions

### Files to Upload:

```
pos-inventory-system/
├── backend/
│   ├── routes/
│   ├── data/
│   ├── uploads/
│   ├── server.js
│   ├── package.json
│   └── .env (create on server)
├── frontend/
│   └── build/ (after npm run build)
└── package.json (root, optional)
```

---

## Step-by-Step Deployment

### Quick Deployment Script

Create `deploy.sh`:

```bash
#!/bin/bash

echo "Building frontend..."
cd frontend
npm install
npm run build
cd ..

echo "Preparing backend..."
cd backend
npm install --production
cd ..

echo "Creating deployment package..."
tar -czf pos-system-deploy.tar.gz \
  backend/ \
  frontend/build/ \
  --exclude='node_modules' \
  --exclude='.git'

echo "Deployment package created: pos-system-deploy.tar.gz"
echo "Upload this file to your server and extract it"
```

Run:
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## Post-Deployment Configuration

### 1. Set File Permissions

```bash
chmod -R 755 /var/www/pos-inventory-system
chmod -R 777 /var/www/pos-inventory-system/backend/data
chmod -R 777 /var/www/pos-inventory-system/backend/uploads
```

### 2. Configure PM2 Auto-Restart

```bash
pm2 startup
pm2 save
```

### 3. Set Up Automatic Backups

Create backup script:

```bash
nano /usr/local/bin/backup-pos.sh
```

Add:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf /backups/pos-system-$DATE.tar.gz /var/www/pos-inventory-system/backend/data
find /backups -name "pos-system-*.tar.gz" -mtime +7 -delete
```

Make executable:
```bash
chmod +x /usr/local/bin/backup-pos.sh
```

Add to crontab:
```bash
crontab -e
# Add: 0 2 * * * /usr/local/bin/backup-pos.sh
```

### 4. Monitor Application

```bash
pm2 monit
pm2 logs pos-system
```

---

## Troubleshooting

### Issue: Application Not Starting

**Check:**
```bash
pm2 logs pos-system
pm2 status
node --version
```

**Fix:**
- Verify Node.js is installed
- Check port is not in use
- Verify .env file exists
- Check file permissions

### Issue: Cannot Access API

**Check:**
- Nginx configuration
- Firewall settings
- Port forwarding
- Domain DNS settings

**Fix:**
```bash
nginx -t
systemctl status nginx
ufw status
```

### Issue: Database/Data Issues

**Check:**
- File permissions on `backend/data/`
- Disk space: `df -h`
- Logs: `pm2 logs pos-system`

**Fix:**
```bash
chmod -R 777 /var/www/pos-inventory-system/backend/data
```

### Issue: Frontend Not Loading

**Check:**
- Frontend build exists: `ls frontend/build/`
- Nginx serving static files correctly
- Browser console for errors

**Fix:**
```bash
cd frontend
npm run build
# Verify build folder exists
```

---

## Hostinger-Specific Notes

### If Using hPanel:

1. **Node.js Version**: Use Node.js 18.x LTS
2. **Port**: Use the port provided by Hostinger (usually 3000-5000)
3. **Domain**: Configure in hPanel → Domains
4. **SSL**: Enable in hPanel → SSL
5. **Backups**: Use Hostinger backup feature

### Support:

- Hostinger Support: Available 24/7
- Documentation: https://www.hostinger.com/tutorials
- Node.js Guide: Check Hostinger knowledge base

---

## Alternative: Deploy Backend Separately

If Hostinger doesn't support Node.js well:

### Option A: Backend on Railway (Free Tier)

1. Sign up at https://railway.app
2. Connect GitHub repository
3. Deploy backend only
4. Get public URL
5. Update frontend API URL to Railway URL
6. Deploy frontend to Hostinger (static files)

### Option B: Backend on Heroku (Free Tier)

1. Sign up at https://heroku.com
2. Install Heroku CLI
3. Deploy backend:
```bash
cd backend
heroku create your-app-name
git push heroku main
```
4. Update frontend API URL
5. Deploy frontend to Hostinger

---

## Quick Reference

### Important Commands:

```bash
# Start application
pm2 start server.js --name "pos-system"

# Stop application
pm2 stop pos-system

# Restart application
pm2 restart pos-system

# View logs
pm2 logs pos-system

# View status
pm2 status

# Save PM2 configuration
pm2 save

# Nginx restart
systemctl restart nginx

# Check Nginx config
nginx -t
```

### Important Files:

- Backend: `/var/www/pos-inventory-system/backend/server.js`
- Frontend: `/var/www/pos-inventory-system/frontend/build/`
- Data: `/var/www/pos-inventory-system/backend/data/`
- Logs: `pm2 logs` or `/var/log/nginx/`

---

## Security Checklist

- [ ] Change default JWT_SECRET
- [ ] Use strong passwords
- [ ] Enable SSL/HTTPS
- [ ] Configure firewall
- [ ] Regular backups
- [ ] Keep Node.js updated
- [ ] Use PM2 for process management
- [ ] Set proper file permissions
- [ ] Disable unnecessary services
- [ ] Monitor logs regularly

---

## Need Help?

1. Check Hostinger documentation
2. Contact Hostinger support
3. Check application logs: `pm2 logs`
4. Check Nginx logs: `/var/log/nginx/error.log`
5. Verify Node.js version: `node --version`

---

**Good luck with your deployment! 🚀**

