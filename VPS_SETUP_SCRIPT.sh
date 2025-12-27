#!/bin/bash

# Hostinger VPS Setup Script
# Run this on your VPS after connecting via SSH

echo "=========================================="
echo "Hostinger VPS - POS System Setup"
echo "=========================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "Please run as root (use: sudo su)"
    exit 1
fi

echo "Step 1: Updating system..."
apt update && apt upgrade -y

echo ""
echo "Step 2: Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

echo ""
echo "Step 3: Verifying Node.js installation..."
node --version
npm --version

echo ""
echo "Step 4: Installing PM2..."
npm install -g pm2

echo ""
echo "Step 5: Installing Nginx..."
apt install -y nginx
systemctl start nginx
systemctl enable nginx

echo ""
echo "Step 6: Installing UFW (Firewall)..."
apt install -y ufw
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo ""
echo "=========================================="
echo "✓ Basic setup complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Upload your application files"
echo "2. Extract: tar -xzf hostinger-pos-system.tar.gz"
echo "3. Install dependencies: npm install --production"
echo "4. Configure .env file"
echo "5. Start with PM2: pm2 start server.js --name pos-system"
echo "6. Configure Nginx"
echo "7. Set up SSL"
echo ""
echo "See HOSTINGER_VPS_DEPLOYMENT.md for complete guide"
echo ""

