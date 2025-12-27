# Hostinger VPS Deployment Guide

Complete guide to deploy your POS system on Hostinger VPS.

## Prerequisites

- Hostinger VPS account
- SSH access enabled
- Root or sudo access
- Basic terminal knowledge

---

## Step 1: Access Your VPS

### Get SSH Credentials

1. Log into Hostinger hPanel
2. Go to **VPS** section
3. Find your VPS
4. Note:
   - **IP Address**
   - **SSH Port** (usually 22)
   - **Root Password**

### Connect via SSH

**On Mac/Linux:**
```bash
ssh root@your-vps-ip
# Enter password when prompted
```

**On Windows:**
- Use **PuTTY** (download from putty.org)
- Or use **Windows Terminal** (Windows 10/11)
- Enter IP and port, connect

---

## Step 2: Update System

```bash
# Update package list
apt update && apt upgrade -y
```

---

## Step 3: Install Node.js

```bash
# Install Node.js 18.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Verify installation
node --version
npm --version
```

Should show:
- Node.js: v18.x.x or higher
- npm: 9.x.x or higher

---

## Step 4: Install PM2 (Process Manager)

```bash
npm install -g pm2
```

PM2 keeps your app running even after you disconnect.

---

## Step 5: Install Nginx (Web Server)

```bash
apt install -y nginx
systemctl start nginx
systemctl enable nginx
```

---

## Step 6: Upload Your Application

### Option A: Upload via SCP (From Your Computer)

**On Mac/Linux:**
```bash
cd "/Users/endiroswendi/Documents/ Old Laptop Documents/CAO/FINANCIAL REPORT/pos-inventory-system"
scp hostinger-pos-system.tar.gz root@your-vps-ip:/root/
```

**On Windows:**
Use **WinSCP** (free) to upload the file.

### Option B: Download from Hostinger File Manager

If you already uploaded to Hostinger:

1. In hPanel, go to File Manager
2. Find your uploaded file
3. Note the location
4. On VPS, download it:
```bash
# If file is in public_html
cd /root
# Or download from your Hostinger account
```

### Option C: Extract Already Uploaded File

If you uploaded via File Manager:

```bash
# Find where you uploaded it
cd /home/your-username/public_html
# Or wherever you uploaded
ls -la
# Find hostinger-pos-system.tar.gz
```

---

## Step 7: Extract and Setup Application

```bash
# Create application directory
mkdir -p /var/www/pos-system
cd /var/www/pos-system

# If you uploaded via SCP, file is in /root
# Move it here:
mv /root/hostinger-pos-system.tar.gz .

# Extract
tar -xzf hostinger-pos-system.tar.gz

# Verify files
ls -la
# Should see: package.json, server.js, routes/, etc.
```

---

## Step 8: Install Dependencies

```bash
cd /var/www/pos-system
npm install --production
```

This may take 2-5 minutes.

---

## Step 9: Configure Environment Variables

```bash
# Create .env file
cp .env.example .env
nano .env
```

Add/edit:
```env
NODE_ENV=production
PORT=5001
JWT_SECRET=your-super-secret-key-change-this-to-random-string-12345
```

Save: `Ctrl+X`, then `Y`, then `Enter`

---

## Step 10: Set File Permissions

```bash
cd /var/www/pos-system
chmod -R 755 .
chmod -R 777 data
chmod -R 777 uploads
```

---

## Step 11: Start Application with PM2

```bash
cd /var/www/pos-system
pm2 start server.js --name "pos-system"
pm2 save
pm2 startup
```

The last command will show you a command to run - copy and run it!

---

## Step 12: Configure Nginx Reverse Proxy

```bash
# Create Nginx configuration
nano /etc/nginx/sites-available/pos-system
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Frontend
    location / {
        root /var/www/pos-system/public;
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
        alias /var/www/pos-system/uploads;
    }
}
```

Save: `Ctrl+X`, then `Y`, then `Enter`

Enable the site:
```bash
ln -s /etc/nginx/sites-available/pos-system /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

---

## Step 13: Configure Firewall

```bash
# Install UFW (if not installed)
apt install -y ufw

# Allow SSH
ufw allow 22/tcp

# Allow HTTP
ufw allow 80/tcp

# Allow HTTPS
ufw allow 443/tcp

# Enable firewall
ufw enable
```

---

## Step 14: Install SSL Certificate (HTTPS)

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Get SSL certificate
certbot --nginx -d your-domain.com -d www.your-domain.com

# Follow prompts:
# - Enter email
# - Agree to terms
# - Choose redirect HTTP to HTTPS
```

---

## Step 15: Verify Everything Works

### Check PM2 Status

```bash
pm2 status
```

Should show `pos-system` as `online`.

### Check Application Logs

```bash
pm2 logs pos-system
```

### Test API

```bash
curl http://localhost:5001/api/health
```

Should return: `{"status":"OK",...}`

### Test Website

Open browser:
- `http://your-domain.com` (should redirect to HTTPS)
- `https://your-domain.com`

Should see login page!

---

## Useful Commands

### PM2 Commands

```bash
# View status
pm2 status

# View logs
pm2 logs pos-system

# Restart
pm2 restart pos-system

# Stop
pm2 stop pos-system

# Start
pm2 start pos-system

# Delete
pm2 delete pos-system
```

### Nginx Commands

```bash
# Test configuration
nginx -t

# Reload
systemctl reload nginx

# Restart
systemctl restart nginx

# Check status
systemctl status nginx
```

### Application Commands

```bash
# View application directory
cd /var/www/pos-system

# View logs
pm2 logs pos-system

# Update application (after changes)
cd /var/www/pos-system
git pull  # if using Git
npm install --production
pm2 restart pos-system
```

---

## Troubleshooting

### Issue: Can't Connect via SSH

**Check:**
- IP address is correct
- Port is correct (usually 22)
- Password is correct
- Firewall allows SSH

**Fix:**
- Contact Hostinger support
- Verify SSH is enabled in hPanel

### Issue: Node.js Not Installing

**Check:**
```bash
curl --version
```

**Fix:**
```bash
apt install -y curl
# Then retry Node.js installation
```

### Issue: Application Not Starting

**Check:**
```bash
pm2 logs pos-system
node --version
npm --version
```

**Fix:**
- Check logs for errors
- Verify Node.js is installed
- Check .env file exists
- Verify port 5001 is not in use

### Issue: Nginx Not Working

**Check:**
```bash
nginx -t
systemctl status nginx
```

**Fix:**
- Fix configuration errors
- Restart Nginx: `systemctl restart nginx`

### Issue: Can't Access Website

**Check:**
- Domain DNS points to VPS IP
- Firewall allows ports 80/443
- Nginx is running
- Application is running

**Fix:**
- Verify DNS settings
- Check firewall: `ufw status`
- Check Nginx: `systemctl status nginx`
- Check PM2: `pm2 status`

---

## Updating Your Application

When you make changes:

```bash
# SSH to VPS
ssh root@your-vps-ip

# Navigate to application
cd /var/www/pos-system

# If using Git:
git pull origin main

# Install new dependencies (if any)
npm install --production

# Rebuild frontend (if changed)
cd public
# (frontend should already be built)

# Restart application
pm2 restart pos-system

# Check logs
pm2 logs pos-system
```

---

## Backup Your Data

```bash
# Create backup script
nano /usr/local/bin/backup-pos.sh
```

Add:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf /root/backups/pos-system-$DATE.tar.gz /var/www/pos-system/data
find /root/backups -name "pos-system-*.tar.gz" -mtime +7 -delete
```

Make executable:
```bash
chmod +x /usr/local/bin/backup-pos.sh
mkdir -p /root/backups
```

Add to crontab (daily backup at 2 AM):
```bash
crontab -e
# Add:
0 2 * * * /usr/local/bin/backup-pos.sh
```

---

## Security Checklist

- [ ] Changed default SSH port (optional)
- [ ] Set up SSH key authentication (recommended)
- [ ] Firewall configured
- [ ] SSL certificate installed
- [ ] Strong JWT_SECRET in .env
- [ ] Changed default admin password
- [ ] Regular backups set up
- [ ] Keep system updated: `apt update && apt upgrade`

---

## Summary

**Complete VPS Setup:**
1. ✅ SSH to VPS
2. ✅ Install Node.js
3. ✅ Install PM2
4. ✅ Install Nginx
5. ✅ Upload application
6. ✅ Install dependencies
7. ✅ Configure .env
8. ✅ Start with PM2
9. ✅ Configure Nginx
10. ✅ Set up SSL
11. ✅ Access your app!

**Your application is now live on VPS! 🚀**

---

## Need Help?

- **Hostinger Support:** Available 24/7 via hPanel
- **PM2 Docs:** https://pm2.keymetrics.io
- **Nginx Docs:** https://nginx.org/en/docs/

---

**Good luck with your deployment!**

