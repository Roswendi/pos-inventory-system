# Complete Guide: GitHub to Railway Deployment

Step-by-step guide to put your files on GitHub and deploy to Railway.

## Part 1: Set Up GitHub Repository

### Step 1: Create Personal Access Token (Required!)

GitHub doesn't accept passwords anymore. You need a token.

1. **Go to GitHub:**
   - Visit: https://github.com/settings/tokens
   - Or: GitHub → Your Profile → Settings → Developer settings → Personal access tokens → Tokens (classic)

2. **Generate New Token:**
   - Click **Generate new token** → **Generate new token (classic)**
   - **Note:** Give it a name (e.g., "POS System")
   - **Expiration:** Choose 90 days (or no expiration)
   - **Select scopes:** Check ✅ `repo` (Full control of private repositories)
   - Scroll down, click **Generate token**

3. **Copy Token Immediately:**
   - ⚠️ **IMPORTANT:** Copy the token NOW! It looks like: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - You won't be able to see it again!
   - Save it somewhere safe

### Step 2: Create GitHub Repository

1. **Go to GitHub:**
   - Visit: https://github.com
   - Log in

2. **Create New Repository:**
   - Click **+** (top right) → **New repository**
   - **Repository name:** `pos-inventory-system`
   - **Description:** `POS Inventory Accounting and WhatsApp CRM System`
   - Choose: **Public** or **Private**
   - **DO NOT** check "Initialize with README" (we already have files)
   - Click **Create repository**

3. **Copy Repository URL:**
   - After creating, GitHub shows the URL
   - Copy it: `https://github.com/your-username/pos-inventory-system.git`

### Step 3: Initialize Git and Push to GitHub

**On your Mac, open Terminal and run:**

```bash
# Navigate to your project
cd "/Users/endiroswendi/Documents/ Old Laptop Documents/CAO/FINANCIAL REPORT/pos-inventory-system"

# Initialize Git (if not already done)
git init

# Configure Git (first time only)
git config user.name "Your Name"
git config user.email "your.email@example.com"

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: POS Inventory System"

# Add GitHub remote (replace with your URL)
git remote add origin https://github.com/your-username/pos-inventory-system.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**When asked for credentials:**
- **Username:** Your GitHub username
- **Password:** Paste your **Personal Access Token** (not your GitHub password!)

### Step 4: Verify Upload

1. Go to your GitHub repository
2. You should see all your files
3. ✅ Done! Files are on GitHub!

---

## Part 2: Deploy to Railway

### Step 1: Sign Up for Railway

1. **Go to Railway:**
   - Visit: https://railway.app
   - Click **Start a New Project**

2. **Sign Up:**
   - Click **Login with GitHub**
   - Authorize Railway to access your GitHub
   - Complete signup

### Step 2: Create New Project

1. **In Railway Dashboard:**
   - Click **New Project**
   - Select **Deploy from GitHub repo**

2. **Select Repository:**
   - Find `pos-inventory-system`
   - Click **Deploy Now**

### Step 3: Configure Railway

Railway will auto-detect Node.js, but we need to configure it:

1. **Click on your project** in Railway dashboard

2. **Go to Settings:**
   - Click **Settings** tab

3. **Set Root Directory:**
   - Find **Root Directory**
   - Set to: `backend`
   - This tells Railway where your `package.json` is

4. **Set Start Command:**
   - Find **Start Command**
   - Set to: `node server.js`

### Step 4: Set Environment Variables

1. **In Railway Dashboard:**
   - Click **Variables** tab
   - Click **+ New Variable**

2. **Add Variables:**
   - `NODE_ENV` = `production`
   - `PORT` = (Railway will set this automatically, but you can use `5001`)
   - `JWT_SECRET` = `your-super-secret-key-change-this`

3. **Save Variables**

### Step 5: Configure Build Settings

1. **Go to Settings:**
   - Find **Build Command**
   - Set to: `cd ../frontend && npm install && npm run build && cd ../backend`

   OR simpler approach:

2. **Create `railway.json` in root:**
   ```json
   {
     "$schema": "https://railway.app/railway.schema.json",
     "build": {
       "builder": "NIXPACKS",
       "buildCommand": "cd frontend && npm install && npm run build"
     },
     "deploy": {
       "startCommand": "cd backend && node server.js",
       "restartPolicyType": "ON_FAILURE",
       "restartPolicyMaxRetries": 10
     }
   }
   ```

### Step 6: Update Server.js for Railway

Railway provides a `PORT` environment variable. Make sure your `server.js` uses it:

```javascript
const PORT = process.env.PORT || 5001;
```

This should already be in your code!

### Step 7: Update Frontend API URL

Since Railway gives you a public URL, update frontend to use it:

1. **In Railway Dashboard:**
   - Your app gets a URL like: `https://your-app-name.up.railway.app`
   - Copy this URL

2. **Update `frontend/src/services/api.js`:**
   - Or set environment variable in Railway:
   - `REACT_APP_API_URL` = `https://your-app-name.up.railway.app/api`

### Step 8: Deploy

1. **Railway will automatically:**
   - Detect your repository
   - Install dependencies
   - Build your application
   - Deploy it

2. **Watch the Logs:**
   - Click on your service
   - Go to **Deployments** tab
   - Watch the build process

3. **Wait for Deployment:**
   - First deployment takes 3-5 minutes
   - You'll see "Deployed" when done

### Step 9: Get Your Public URL

1. **In Railway Dashboard:**
   - Click on your service
   - Go to **Settings**
   - Find **Domains**
   - Railway provides a free domain: `your-app-name.up.railway.app`

2. **Or Add Custom Domain:**
   - Click **+ New**
   - Add your domain
   - Update DNS as instructed

### Step 10: Test Your Application

1. **Open your Railway URL:**
   - `https://your-app-name.up.railway.app`

2. **Should see:**
   - Login page
   - Login: `admin` / `admin123`

✅ **Done! Your app is live on Railway!**

---

## Troubleshooting

### Issue: GitHub Push Fails

**Problem:** Authentication failed

**Solution:**
- Make sure you're using Personal Access Token, not password
- Token must have `repo` scope
- Try: `git push -u origin main` again

### Issue: Railway Build Fails

**Problem:** Build errors

**Solution:**
- Check Railway logs for errors
- Make sure Root Directory is set to `backend`
- Verify `package.json` exists in backend folder
- Check build command is correct

### Issue: Application Not Starting

**Problem:** App crashes on start

**Solution:**
- Check Railway logs
- Verify environment variables are set
- Make sure PORT is set correctly
- Check `.env` file or Railway variables

### Issue: Frontend Not Loading

**Problem:** Frontend shows errors

**Solution:**
- Make sure frontend is built: `npm run build`
- Verify `public` folder exists in backend
- Check API URL is correct
- Update `REACT_APP_API_URL` in Railway variables

---

## Railway Configuration File

Create `railway.json` in your project root:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "cd backend && node server.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

---

## Quick Reference

### GitHub Commands

```bash
# Add files
git add .

# Commit
git commit -m "Your message"

# Push
git push origin main

# Pull latest
git pull origin main
```

### Railway Dashboard

- **Deployments:** View deployment history
- **Logs:** See application logs
- **Variables:** Set environment variables
- **Settings:** Configure build and deploy
- **Domains:** Manage your domain

---

## Summary

**Complete Process:**
1. ✅ Create GitHub Personal Access Token
2. ✅ Create GitHub repository
3. ✅ Push code to GitHub
4. ✅ Sign up for Railway
5. ✅ Connect GitHub repository
6. ✅ Configure Railway settings
7. ✅ Set environment variables
8. ✅ Deploy!
9. ✅ Access your live app!

**Your app is now on GitHub and Railway! 🚀**

---

## Need Help?

- **GitHub Docs:** https://docs.github.com
- **Railway Docs:** https://docs.railway.app
- **Railway Discord:** https://discord.gg/railway

---

**Good luck with your deployment!**

