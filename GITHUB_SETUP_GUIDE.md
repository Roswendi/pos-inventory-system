# GitHub Repository Setup Guide

Complete guide to set up your POS system on GitHub and deploy from there.

## Table of Contents
1. [Create GitHub Repository](#create-github-repository)
2. [Initialize Git](#initialize-git)
3. [Push to GitHub](#push-to-github)
4. [Deploy from GitHub](#deploy-from-github)
5. [Update Repository](#update-repository)

---

## Create GitHub Repository

### Step 1: Create New Repository on GitHub

1. Go to [GitHub.com](https://github.com)
2. Click the **+** icon → **New repository**
3. Repository name: `pos-inventory-system` (or your preferred name)
4. Description: `POS Inventory Accounting and WhatsApp CRM System`
5. Choose: **Public** or **Private**
6. **DO NOT** initialize with README, .gitignore, or license (we already have these)
7. Click **Create repository**

### Step 2: Copy Repository URL

After creating, GitHub will show you the repository URL. Copy it:
- HTTPS: `https://github.com/your-username/pos-inventory-system.git`
- SSH: `git@github.com:your-username/pos-inventory-system.git`

---

## Initialize Git

### Step 1: Navigate to Project

```bash
cd "/Users/endiroswendi/Documents/ Old Laptop Documents/CAO/FINANCIAL REPORT/pos-inventory-system"
```

### Step 2: Initialize Git Repository

```bash
git init
```

### Step 3: Add All Files

```bash
git add .
```

### Step 4: Create Initial Commit

```bash
git commit -m "Initial commit: POS Inventory System"
```

### Step 5: Add Remote Repository

Replace `your-username` with your GitHub username:

```bash
git remote add origin https://github.com/your-username/pos-inventory-system.git
```

### Step 6: Push to GitHub

```bash
git branch -M main
git push -u origin main
```

You'll be prompted for your GitHub username and password (or token).

---

## Push to GitHub

### First Time Setup

If you haven't set up Git credentials:

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Push Changes

After making changes:

```bash
git add .
git commit -m "Description of changes"
git push origin main
```

---

## Deploy from GitHub

### Option 1: Deploy to Hostinger from GitHub

#### Method A: Manual Download

1. Go to your GitHub repository
2. Click **Code** → **Download ZIP**
3. Extract and upload to Hostinger

#### Method B: Clone on Server

If you have SSH access to Hostinger:

```bash
# On Hostinger server
git clone https://github.com/your-username/pos-inventory-system.git
cd pos-inventory-system
cd backend
npm install --production
cd ../frontend
npm install
npm run build
cd ../backend
node server.js
```

### Option 2: Deploy to Railway (Free Tier)

1. Go to [Railway.app](https://railway.app)
2. Sign up with GitHub
3. Click **New Project** → **Deploy from GitHub repo**
4. Select your repository
5. Railway will auto-detect Node.js
6. Set environment variables
7. Deploy!

### Option 3: Deploy to Heroku (Free Tier)

1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create your-app-name`
4. Push: `git push heroku main`
5. Set environment variables in Heroku dashboard

### Option 4: Deploy to VPS

```bash
# On your VPS
git clone https://github.com/your-username/pos-inventory-system.git
cd pos-inventory-system
cd backend
npm install --production
cd ../frontend
npm install
npm run build
cd ../backend
pm2 start server.js --name "pos-system"
```

---

## Update Repository

### Making Changes

1. **Make your changes** to the code

2. **Check status:**
```bash
git status
```

3. **Add changes:**
```bash
git add .
```

4. **Commit:**
```bash
git commit -m "Description of what you changed"
```

5. **Push:**
```bash
git push origin main
```

### Update on Server

If you deployed from GitHub:

```bash
# On server
cd pos-inventory-system
git pull origin main
# Restart application
pm2 restart pos-system
```

---

## GitHub Actions (Optional)

Create `.github/workflows/deploy.yml` for automated deployment:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: |
          cd backend
          npm install
          cd ../frontend
          npm install
      - name: Build frontend
        run: |
          cd frontend
          npm run build
      - name: Deploy
        run: |
          echo "Add your deployment commands here"
```

---

## Branching Strategy

### Create Feature Branch

```bash
git checkout -b feature/new-feature
# Make changes
git add .
git commit -m "Add new feature"
git push origin feature/new-feature
```

### Merge to Main

1. Create Pull Request on GitHub
2. Review and merge
3. Or merge locally:
```bash
git checkout main
git merge feature/new-feature
git push origin main
```

---

## Troubleshooting

### Issue: Authentication Failed

**Solution:**
Use Personal Access Token instead of password:

1. GitHub → Settings → Developer settings → Personal access tokens
2. Generate new token
3. Use token as password when pushing

### Issue: Large Files

**Solution:**
Check `.gitignore` excludes:
- `node_modules/`
- `frontend/build/`
- `*.tar.gz`
- `backend/data/` (if you don't want to track data)

### Issue: Push Rejected

**Solution:**
```bash
git pull origin main --rebase
git push origin main
```

---

## Best Practices

1. **Commit Often** - Small, frequent commits
2. **Write Good Commit Messages** - Clear descriptions
3. **Use Branches** - Don't work directly on main
4. **Keep .gitignore Updated** - Don't commit unnecessary files
5. **Use .env Files** - Never commit secrets
6. **Document Changes** - Update README when needed

---

## Quick Reference

### Common Git Commands

```bash
# Check status
git status

# Add files
git add .

# Commit
git commit -m "Message"

# Push
git push origin main

# Pull latest
git pull origin main

# Create branch
git checkout -b branch-name

# Switch branch
git checkout branch-name

# View commits
git log

# View remote
git remote -v
```

---

## Next Steps

1. ✅ Create GitHub repository
2. ✅ Push your code
3. ✅ Set up deployment
4. ✅ Keep repository updated

**Your code is now on GitHub! 🚀**

