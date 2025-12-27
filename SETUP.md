# Step-by-Step Setup Guide

Follow these steps to set up and run the POS/Inventory/Accounting + WhatsApp CRM System.

## Step 1: Prerequisites Check

Make sure you have:
- ✅ Node.js installed (version 14 or higher)
- ✅ npm installed (comes with Node.js)
- ✅ A code editor (VS Code recommended)
- ✅ Terminal/Command Prompt access

To check if Node.js is installed:
```bash
node --version
npm --version
```

If not installed, download from: https://nodejs.org/

## Step 2: Navigate to Project Directory

```bash
cd "/Users/endiroswendi/Documents/ Old Laptop Documents/CAO/FINANCIAL REPORT/pos-inventory-system"
```

## Step 3: Install Backend Dependencies

```bash
cd backend
npm install
```

This will install all required packages:
- express
- cors
- body-parser
- uuid
- whatsapp-web.js
- qrcode-terminal
- dotenv
- bcryptjs
- jsonwebtoken
- nodemon (for development)

Wait for installation to complete (may take 2-5 minutes).

## Step 4: Install Frontend Dependencies

Open a new terminal window and run:

```bash
cd "/Users/endiroswendi/Documents/ Old Laptop Documents/CAO/FINANCIAL REPORT/pos-inventory-system/frontend"
npm install
```

This will install all required packages:
- react
- react-dom
- react-router-dom
- axios
- recharts
- react-icons
- react-scripts

Wait for installation to complete (may take 3-7 minutes).

## Step 5: Start Backend Server

In the backend terminal:

```bash
cd backend
npm start
```

You should see:
```
🚀 Server running on http://localhost:5000
📊 API endpoints available at http://localhost:5000/api
```

**Keep this terminal window open!**

## Step 6: Start Frontend Development Server

In a new terminal window:

```bash
cd frontend
npm start
```

This will:
- Start the React development server
- Open your browser automatically to http://localhost:3000
- Enable hot-reload (changes update automatically)

**Keep this terminal window open too!**

## Step 7: Login to the Application

1. The application should open in your browser at http://localhost:3000
2. You'll see the login page
3. Use these credentials:
   - **Username:** admin
   - **Password:** admin123
4. Click "Sign In"

## Step 8: Explore the Application

Once logged in, you'll see:
- **Dashboard** - Overview of your business
- **Products** - Manage your product catalog
- **Inventory** - Track stock levels
- **POS** - Process sales
- **Accounting** - Financial management
- **Customers** - Customer database
- **WhatsApp CRM** - Customer communication

## Step 9: Set Up WhatsApp (Optional)

1. Navigate to "WhatsApp CRM" in the sidebar
2. Click "Initialize WhatsApp"
3. Check the backend terminal for a QR code
4. Open WhatsApp on your phone
5. Go to Settings > Linked Devices
6. Tap "Link a Device"
7. Scan the QR code from the terminal
8. Wait for "Connected" status

## Step 10: Add Your First Product

1. Go to "Products" page
2. Click "Add Product"
3. Fill in the form:
   - Product Name (required)
   - Price (required)
   - Stock quantity
   - Minimum stock level
4. Click "Save"

## Step 11: Process Your First Sale

1. Go to "POS" page
2. Click on products to add them to cart
3. Select a customer (or leave as "Walk-in Customer")
4. Apply discount if needed
5. Select payment method
6. Click "Checkout"

The sale will automatically:
- Update inventory
- Create accounting entries
- Generate a receipt

## Quick Start Scripts

### Windows (PowerShell)
Create `start-backend.ps1`:
```powershell
cd backend
npm start
```

Create `start-frontend.ps1`:
```powershell
cd frontend
npm start
```

### Mac/Linux
Create `start.sh`:
```bash
#!/bin/bash
# Start backend
cd backend && npm start &
# Start frontend
cd frontend && npm start
```

Make it executable:
```bash
chmod +x start.sh
```

## Troubleshooting

### Port 5000 already in use
```bash
# Find and kill the process
lsof -ti:5000 | xargs kill
# Or change port in backend/server.js
```

### Port 3000 already in use
```bash
# Find and kill the process
lsof -ti:3000 | xargs kill
# Or React will ask to use a different port
```

### Module not found errors
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### WhatsApp QR code not showing
- Make sure backend server is running
- Check terminal for errors
- Try initializing again

### CORS errors
- Ensure backend is running on port 5000
- Check API URL in frontend/src/services/api.js

## Next Steps

1. **Add Products** - Build your product catalog
2. **Add Customers** - Create customer database
3. **Set Up Accounting** - Review chart of accounts
4. **Configure WhatsApp** - Connect WhatsApp Business
5. **Start Selling** - Use POS to process sales
6. **Monitor Dashboard** - Track your business metrics

## Production Deployment

For production use:
1. Build frontend: `cd frontend && npm run build`
2. Use a process manager (PM2) for backend
3. Set up a web server (nginx) for frontend
4. Configure environment variables
5. Set up SSL/HTTPS
6. Regular backups of data folder

## Need Help?

- Check the main README.md for detailed documentation
- Review API endpoints documentation
- Check browser console for errors
- Check backend terminal for server errors

---

**You're all set! Start managing your business! 🚀**

