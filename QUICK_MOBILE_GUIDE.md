# 📱 Quick Mobile Guide - 3 Steps

## Step 1: Create Icons (5 minutes)

Create these files in `frontend/public/`:
- `logo192.png` (192x192 pixels)
- `logo512.png` (512x512 pixels)

**Easy way:**
1. Go to https://www.favicon-generator.org/
2. Upload your logo/image
3. Download all sizes
4. Rename and place in `frontend/public/`

## Step 2: Deploy Backend (10 minutes)

**Using Railway (Free):**
1. Go to https://railway.app
2. Sign up with GitHub
3. New Project → Deploy from GitHub
4. Select your repo → Select `backend` folder
5. Add environment: `PORT=5001`
6. Deploy!

**Copy your backend URL** (e.g., `https://your-app.railway.app`)

## Step 3: Deploy Frontend (5 minutes)

1. Update `frontend/src/services/api.js`:
   ```javascript
   const API_BASE_URL = 'https://your-backend-url.railway.app/api';
   ```

2. Build:
   ```bash
   cd frontend
   npm run build
   ```

3. Deploy to Netlify:
   - Go to https://netlify.com
   - Drag & drop `build` folder
   - Done!

## 📱 Install on Phone

**Android:**
- Open site in Chrome
- Menu → "Add to Home screen"

**iOS:**
- Open site in Safari
- Share → "Add to Home Screen"

## ✅ Done!

Your app now works on:
- ✅ Android
- ✅ iOS  
- ✅ Web

**Total time: ~20 minutes!**

