# Quick Start Guide

## 🚀 Fastest Way to Get Started

### Option 1: Using the Start Script (Recommended)

```bash
cd pos-inventory-system
./start.sh
```

This will:
- Check for Node.js and npm
- Install dependencies if needed
- Start both backend and frontend servers
- Open the application in your browser

### Option 2: Manual Start

**Terminal 1 - Backend:**
```bash
cd backend
npm install  # First time only
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install  # First time only
npm start
```

## 📝 First Steps After Starting

1. **Login**
   - Username: `admin`
   - Password: `admin123`

2. **Add Products**
   - Go to Products page
   - Click "Add Product"
   - Fill in product details
   - Save

3. **Add Customers** (Optional)
   - Go to Customers page
   - Click "Add Customer"
   - Fill in customer information
   - Save

4. **Process a Sale**
   - Go to POS page
   - Click products to add to cart
   - Click "Checkout"

5. **View Dashboard**
   - See your business metrics
   - Check sales trends
   - Monitor inventory

## 🔧 Troubleshooting

**Port already in use?**
```bash
# Kill process on port 5000 (backend)
lsof -ti:5000 | xargs kill

# Kill process on port 3000 (frontend)
lsof -ti:3000 | xargs kill
```

**Dependencies not installing?**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**WhatsApp not working?**
- Make sure backend is running
- Check terminal for QR code
- Scan with WhatsApp Business account

## 📚 Next Steps

- Read `SETUP.md` for detailed setup instructions
- Read `README.md` for full documentation
- Explore all features in the application

---

**Happy selling! 💰**

