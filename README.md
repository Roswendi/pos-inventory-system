# TDO POS Inventory System

A comprehensive Point of Sale (POS), Inventory Management, Accounting, and WhatsApp CRM system built with React and Node.js.

## Features

- 🛒 **Point of Sale (POS)** - Complete POS system with cart, checkout, and receipt generation
- 📦 **Inventory Management** - Stock tracking, low stock alerts, and inventory transactions
- 💰 **Accounting** - Chart of accounts, journal entries, balance sheet, and profit & loss reports
- 📱 **WhatsApp CRM** - Customer management and WhatsApp integration
- 📊 **Dashboard** - Real-time analytics and KPIs
- 🏪 **Multi-Outlet Support** - Manage multiple locations with performance tracking
- 📈 **Reports** - Promotional, waste, daily closing, monthly, and more
- 🔐 **Role-Based Access** - Admin, Manager, and Cashier roles
- 💳 **Payment Methods** - Cash, Credit Card, E-Wallet, QRIS (Indonesia)
- 🚚 **Delivery Integration** - GoFood, ShopeeFood, GrabFood integration

## Tech Stack

### Frontend
- React 18
- React Router
- Axios
- Recharts
- React Icons

### Backend
- Node.js
- Express.js
- JWT Authentication
- Bcrypt
- Multer (File Upload)
- WhatsApp Web.js

## Installation

### Prerequisites
- Node.js 14.x or higher
- npm or yarn

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/your-username/pos-inventory-system.git
cd pos-inventory-system
```

2. **Install backend dependencies**
```bash
cd backend
npm install
```

3. **Install frontend dependencies**
```bash
cd ../frontend
npm install
```

4. **Build frontend**
```bash
npm run build
```

5. **Start backend server**
```bash
cd ../backend
node server.js
```

The application will be available at `http://localhost:5001`

## Default Credentials

- **Admin**: username: `admin`, password: `admin123`
- **Manager**: username: `manager`, password: `admin123`
- **Cashier**: username: `cashier`, password: `admin123`

## Project Structure

```
pos-inventory-system/
├── backend/
│   ├── routes/          # API routes
│   ├── data/            # JSON data storage
│   ├── uploads/         # Uploaded images
│   └── server.js        # Express server
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   └── services/    # API services
│   └── public/          # Static files
└── README.md
```

## Development

### Backend Development
```bash
cd backend
npm run dev  # Uses nodemon for auto-reload
```

### Frontend Development
```bash
cd frontend
npm start  # Runs on http://localhost:3000
```

## Deployment

### Deploy to Hostinger

See [DEPLOY_TO_HOSTINGER.md](./DEPLOY_TO_HOSTINGER.md) for detailed instructions.

### Deploy to Railway/Heroku

1. Push to GitHub
2. Connect repository to Railway/Heroku
3. Set environment variables
4. Deploy

### Deploy to VPS

1. Clone repository on server
2. Install dependencies
3. Build frontend
4. Use PM2 to run backend
5. Configure Nginx as reverse proxy

## Environment Variables

Create `.env` file in `backend/` directory:

```env
NODE_ENV=production
PORT=5001
JWT_SECRET=your-super-secret-key-change-this
```

## API Endpoints

- `/api/auth` - Authentication
- `/api/products` - Products management
- `/api/inventory` - Inventory operations
- `/api/pos` - POS operations
- `/api/accounting` - Accounting operations
- `/api/customers` - Customer management
- `/api/whatsapp` - WhatsApp CRM
- `/api/dashboard` - Dashboard data
- `/api/outlets` - Outlet management
- `/api/pos-reports` - POS reports

## Features in Detail

### POS System
- Add items to cart
- Multiple payment methods
- Receipt generation
- Item cancellation with manager approval
- Outlet selection
- Customer type (Dine-in/Delivery)

### Inventory Management
- Stock tracking
- Low stock alerts
- Stock in/out transactions
- Stock adjustments

### Accounting
- Chart of accounts
- Journal entries
- Balance sheet
- Profit & loss statement
- Transaction history

### Reports
- Promotional Report
- Waste Report
- Daily Closing Report
- Monthly POS Report
- Change Payment Report
- Guest Common Report
- Move Table Report
- Branch Menu Report

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Support

For support, email support@example.com or open an issue in the repository.

## Acknowledgments

- React team
- Express.js team
- All open-source contributors

---

**Made with ❤️ for TDO POS System**
