# Deployment Guide: Android, iOS & Web

This guide will help you deploy your POS Inventory System to Android, iOS, and Web platforms.

## 📱 Option 1: Progressive Web App (PWA) - Easiest & Recommended

PWA works on all platforms (Android, iOS, Web) without separate app stores.

### Step 1: Install PWA Dependencies

```bash
cd frontend
npm install --save-dev workbox-webpack-plugin
npm install --save-dev webpack-pwa-manifest
```

### Step 2: Create PWA Manifest

Create `frontend/public/manifest.json`:

```json
{
  "short_name": "POS System",
  "name": "POS Inventory Accounting System",
  "icons": [
    {
      "src": "favicon.ico",
      "sizes": "64x64 32x32 24x24 16x16",
      "type": "image/x-icon"
    },
    {
      "src": "logo192.png",
      "type": "image/png",
      "sizes": "192x192"
    },
    {
      "src": "logo512.png",
      "type": "image/png",
      "sizes": "512x512"
    }
  ],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#0066FF",
  "background_color": "#ffffff",
  "orientation": "portrait-primary"
}
```

### Step 3: Update index.html

Add to `frontend/public/index.html` in `<head>`:

```html
<link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
<meta name="theme-color" content="#0066FF" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<meta name="apple-mobile-web-app-title" content="POS System" />
```

### Step 4: Create Service Worker

Create `frontend/public/sw.js`:

```javascript
const CACHE_NAME = 'pos-inventory-v1';
const urlsToCache = [
  '/',
  '/static/css/main.css',
  '/static/js/main.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
```

### Step 5: Register Service Worker

Update `frontend/src/index.js`:

```javascript
// ... existing code ...

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}
```

### Step 6: Build and Deploy

```bash
cd frontend
npm run build
```

Deploy the `build` folder to:
- **Web**: Any web hosting (Netlify, Vercel, GitHub Pages)
- **Android**: Users can "Add to Home Screen" from Chrome
- **iOS**: Users can "Add to Home Screen" from Safari

---

## 📱 Option 2: React Native (Native Apps)

For true native Android and iOS apps.

### Step 1: Install React Native CLI

```bash
npm install -g react-native-cli
npm install -g @react-native-community/cli
```

### Step 2: Create React Native Project

```bash
npx react-native init POSInventoryApp
cd POSInventoryApp
```

### Step 3: Install Dependencies

```bash
npm install @react-navigation/native @react-navigation/stack
npm install react-native-screens react-native-safe-area-context
npm install axios
npm install @react-native-async-storage/async-storage
```

### Step 4: Migrate Components

Copy your React components and adapt them:
- Replace `div` with `View`
- Replace `input` with `TextInput`
- Replace `button` with `TouchableOpacity` or `Button`
- Use React Navigation instead of React Router

### Step 5: Run on Android

```bash
# Start Metro bundler
npx react-native start

# In another terminal
npx react-native run-android
```

### Step 6: Run on iOS (Mac only)

```bash
cd ios
pod install
cd ..
npx react-native run-ios
```

---

## 📱 Option 3: Capacitor (Hybrid App - Recommended for Quick Deployment)

Capacitor wraps your web app as a native app.

### Step 1: Install Capacitor

```bash
cd frontend
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android @capacitor/ios
```

### Step 2: Initialize Capacitor

```bash
npx cap init "POS Inventory" "com.yourcompany.posinventory"
```

### Step 3: Build Web App

```bash
npm run build
```

### Step 4: Add Platforms

```bash
npx cap add android
npx cap add ios
```

### Step 5: Sync Web Assets

```bash
npx cap sync
```

### Step 6: Open in Native IDEs

**Android:**
```bash
npx cap open android
# Opens Android Studio
# Build APK or AAB from Android Studio
```

**iOS (Mac only):**
```bash
npx cap open ios
# Opens Xcode
# Build and run on simulator or device
```

### Step 7: Configure API URL

Update `frontend/src/services/api.js`:

```javascript
// For production, use your deployed backend URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (window.location.hostname === 'localhost' 
    ? 'http://localhost:5001/api' 
    : 'https://your-backend-domain.com/api');
```

---

## 🌐 Option 4: Web Deployment

### Deploy Backend

**Option A: Heroku**
```bash
cd backend
heroku create your-pos-backend
git init
git add .
git commit -m "Initial commit"
git push heroku main
```

**Option B: Railway**
1. Go to railway.app
2. New Project → Deploy from GitHub
3. Connect your repo
4. Set PORT environment variable

**Option C: DigitalOcean/Render**
- Similar process, deploy Node.js app
- Set environment variables

### Deploy Frontend

**Option A: Netlify**
```bash
cd frontend
npm run build
# Drag and drop build folder to netlify.com
```

**Option B: Vercel**
```bash
npm install -g vercel
cd frontend
vercel
```

**Option C: GitHub Pages**
```bash
npm install --save-dev gh-pages
# Add to package.json:
# "homepage": "https://yourusername.github.io/pos-inventory",
# "scripts": {
#   "predeploy": "npm run build",
#   "deploy": "gh-pages -d build"
# }
npm run deploy
```

---

## 📱 Quick Start: PWA Setup (Recommended)

I'll create the necessary files for you to get started with PWA immediately.

---

## 🔧 Configuration for Mobile

### Update API URL for Production

Create `frontend/.env.production`:

```
REACT_APP_API_URL=https://your-backend-domain.com/api
```

### Enable HTTPS

Mobile apps require HTTPS for API calls. Use:
- Let's Encrypt (free SSL)
- Cloudflare (free SSL)
- Your hosting provider's SSL

---

## 📦 Building for Production

### Android APK

```bash
# Using Capacitor
cd frontend
npm run build
npx cap sync
npx cap open android
# In Android Studio: Build → Generate Signed Bundle/APK
```

### iOS IPA

```bash
# Using Capacitor (Mac only)
cd frontend
npm run build
npx cap sync
npx cap open ios
# In Xcode: Product → Archive
```

---

## 🚀 Recommended Approach

**For Quick Deployment:**
1. ✅ Make it a PWA (Option 1)
2. ✅ Deploy backend to cloud (Railway/Heroku)
3. ✅ Deploy frontend to Netlify/Vercel
4. ✅ Users can install from browser

**For Native Apps:**
1. ✅ Use Capacitor (Option 3)
2. ✅ Build once, deploy to both stores
3. ✅ Update API URL for production

---

## 📝 Next Steps

1. Choose your deployment method
2. Follow the steps for that option
3. Test on target devices
4. Deploy to app stores (if using native)

---

## 🆘 Troubleshooting

**CORS Issues:**
- Ensure backend has CORS enabled
- Add your frontend domain to allowed origins

**API Not Working:**
- Check API URL in production
- Ensure backend is accessible
- Check network permissions in mobile apps

**Build Errors:**
- Clear node_modules and reinstall
- Check Node.js version compatibility
- Review error messages carefully

