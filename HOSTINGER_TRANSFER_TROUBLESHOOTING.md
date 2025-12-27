# Hostinger Transfer Troubleshooting Guide

Complete guide to fix common issues when transferring files to Hostinger.

## Common Problems and Solutions

### Problem 1: FTP Connection Failed

**Symptoms:**
- Can't connect to FTP
- Connection timeout
- Authentication failed

**Solutions:**

1. **Check FTP Credentials**
   - Go to Hostinger hPanel → FTP Accounts
   - Verify username and password
   - Reset password if needed

2. **Try Different FTP Host**
   - Try: `ftp.your-domain.com`
   - Try: Your server IP address
   - Try: `files.hostinger.com`

3. **Check Port**
   - Standard FTP: Port `21`
   - SFTP: Port `22`
   - Try both

4. **Use Passive Mode**
   - In FileZilla: Edit → Settings → Connection → FTP
   - Enable "Passive mode"
   - Try again

5. **Firewall Issues**
   - Temporarily disable firewall
   - Try connecting
   - Re-enable firewall after

---

### Problem 2: Upload Fails or Very Slow

**Symptoms:**
- Files upload but fail
- Upload is extremely slow
- Connection drops during upload

**Solutions:**

1. **Upload in Smaller Batches**
   - Don't upload everything at once
   - Upload folders one by one
   - Start with `backend/` folder

2. **Check File Size**
   - Large files may timeout
   - Compress large files first
   - Upload compressed files, extract on server

3. **Use SFTP Instead of FTP**
   - More reliable
   - Better for large files
   - Port 22

4. **Check Internet Connection**
   - Stable connection needed
   - Avoid WiFi if possible
   - Use wired connection

5. **Increase Timeout**
   - FileZilla: Edit → Settings → Connection
   - Increase timeout to 60 seconds

---

### Problem 3: Files Upload But Don't Appear

**Symptoms:**
- Upload shows success
- Files not visible in File Manager
- Wrong location

**Solutions:**

1. **Check Upload Location**
   - Should be: `public_html` or `www`
   - Not: `public_html/subfolder` (unless intended)
   - Verify in File Manager

2. **Refresh File Manager**
   - Refresh browser
   - Clear cache
   - Check again

3. **Check Permissions**
   - Files may be hidden
   - Check "Show hidden files" in File Manager
   - Verify file permissions

4. **Verify Upload Completed**
   - Check upload log in FileZilla
   - Ensure no errors
   - Re-upload if needed

---

### Problem 4: Can't Access After Upload

**Symptoms:**
- Files uploaded successfully
- Website shows error
- Application not working

**Solutions:**

1. **Check File Structure**
   - `package.json` should be in root
   - `server.js` should be in root
   - `public/` folder should exist

2. **Install Dependencies**
   ```bash
   cd public_html
   npm install --production
   ```

3. **Check .env File**
   ```bash
   cp .env.example .env
   nano .env
   ```
   Add:
   ```
   NODE_ENV=production
   PORT=5001
   JWT_SECRET=your-secret-key
   ```

4. **Set Permissions**
   ```bash
   chmod -R 755 .
   chmod -R 777 data
   chmod -R 777 uploads
   ```

5. **Check Node.js Version**
   ```bash
   node --version
   ```
   Should be 14.x or higher

---

## Alternative Transfer Methods

### Method 1: Hostinger File Manager (Easiest)

**Step-by-Step:**

1. **Prepare Files Locally**
   ```bash
   bash HOSTINGER_DEPLOY.sh
   tar -xzf hostinger-pos-system.tar.gz
   ```

2. **Log into Hostinger hPanel**
   - Go to File Manager

3. **Navigate to Upload Location**
   - Go to `public_html` folder
   - Or create new folder: `pos-system`

4. **Upload Files**
   - Click **Upload** button
   - Select **all files** from extracted folder
   - Click **Upload**
   - Wait for completion

5. **Extract if Needed**
   - If you uploaded a zip file
   - Right-click → Extract

**Advantages:**
- No FTP client needed
- Works in browser
- Easy to use

**Disadvantages:**
- Slower for many files
- May timeout on large uploads

---

### Method 2: Compress and Upload Single File

**Step-by-Step:**

1. **Create Single Archive**
   ```bash
   cd "/Users/endiroswendi/Documents/ Old Laptop Documents/CAO/FINANCIAL REPORT/pos-inventory-system"
   bash HOSTINGER_DEPLOY.sh
   # This creates hostinger-pos-system.tar.gz
   ```

2. **Upload via File Manager**
   - Log into hPanel
   - Go to File Manager
   - Navigate to `public_html`
   - Upload `hostinger-pos-system.tar.gz`

3. **Extract on Server**
   - In File Manager, right-click the tar.gz file
   - Select **Extract**
   - Or use Terminal:
     ```bash
     cd public_html
     tar -xzf hostinger-pos-system.tar.gz
     ```

**Advantages:**
- Single file upload
- Faster
- Less chance of errors

---

### Method 3: Use Hostinger's Git Integration (If Available)

1. **Check if Available**
   - In hPanel, look for "Git" or "Version Control"
   - Some Hostinger plans have this

2. **Connect Repository**
   - Add your GitHub repository URL
   - Auto-deploy on push

---

### Method 4: Use Hostinger Node.js App Feature

1. **Create Node.js App in hPanel**
   - Go to Node.js section
   - Create new app
   - Set startup file: `server.js`

2. **Upload via App Interface**
   - Some Hostinger plans allow direct upload
   - Use the app's file upload feature

---

## Step-by-Step: Simplest Method

### Complete Process (No FTP Needed)

**Step 1: Prepare Package**
```bash
cd "/Users/endiroswendi/Documents/ Old Laptop Documents/CAO/FINANCIAL REPORT/pos-inventory-system"
bash HOSTINGER_DEPLOY.sh
```

**Step 2: Extract Locally**
- Double-click `hostinger-pos-system.tar.gz`
- Or: `tar -xzf hostinger-pos-system.tar.gz`
- You get a folder with all files

**Step 3: Upload via File Manager**
1. Log into Hostinger hPanel
2. Go to **File Manager**
3. Navigate to `public_html`
4. Click **Upload**
5. Select **all files and folders** from extracted folder
6. Click **Upload**
7. Wait (may take 5-10 minutes)

**Step 4: Configure on Server**
1. In hPanel, go to **Terminal** or **SSH**
2. Run:
```bash
cd public_html
npm install --production
cp .env.example .env
```

3. Edit `.env`:
```bash
nano .env
```
Add:
```
NODE_ENV=production
PORT=5001
JWT_SECRET=change-this-to-random-string
```
Save: `Ctrl+X`, then `Y`, then `Enter`

4. Set permissions:
```bash
chmod -R 755 .
chmod -R 777 data
chmod -R 777 uploads
```

5. Start application:
   - If using Node.js App: Start from hPanel
   - If VPS: `pm2 start server.js --name "pos-system"`

**Step 5: Test**
- Open: `https://your-domain.com`
- Should see login page
- Login: `admin` / `admin123`

---

## Troubleshooting Specific Errors

### Error: "Connection Refused"

**Cause:** FTP service not running or wrong port

**Fix:**
- Try port 22 (SFTP)
- Contact Hostinger support
- Use File Manager instead

### Error: "Permission Denied"

**Cause:** Wrong file permissions

**Fix:**
```bash
chmod -R 755 .
chmod -R 777 data
chmod -R 777 uploads
```

### Error: "npm: command not found"

**Cause:** Node.js not installed

**Fix:**
- Contact Hostinger support to install Node.js
- Or use Hostinger Node.js App feature

### Error: "Port 5001 already in use"

**Cause:** Another app using the port

**Fix:**
- Change PORT in `.env` to different port
- Or stop other application

### Error: "Cannot find module"

**Cause:** Dependencies not installed

**Fix:**
```bash
npm install --production
```

---

## Getting Help from Hostinger

### Contact Support

1. **Live Chat**
   - Available 24/7
   - Fast response

2. **Support Ticket**
   - Submit detailed issue
   - Include error messages

3. **Knowledge Base**
   - Search for similar issues
   - Step-by-step guides

### What to Tell Support

1. **Your Issue:**
   - "I'm trying to upload a Node.js application"
   - "FTP connection fails" (if applicable)
   - "Files uploaded but app doesn't work"

2. **What You've Tried:**
   - "Tried FTP with FileZilla"
   - "Tried File Manager upload"
   - "Checked credentials"

3. **Error Messages:**
   - Copy exact error messages
   - Include screenshots if possible

4. **Your Plan:**
   - Shared hosting / VPS / Cloud
   - Node.js support available?

---

## Quick Checklist

Before contacting support, verify:

- [ ] FTP credentials are correct
- [ ] File Manager upload tried
- [ ] Files extracted on server
- [ ] `npm install` completed
- [ ] `.env` file created
- [ ] Permissions set correctly
- [ ] Node.js installed on server
- [ ] Application started

---

## Alternative: Use Different Hosting

If Hostinger continues to have issues:

### Option 1: Railway (Free Tier)
- Easy GitHub deployment
- Automatic setup
- Free tier available

### Option 2: Heroku (Free Tier)
- Simple deployment
- Good documentation
- Free tier available

### Option 3: Render (Free Tier)
- Easy setup
- Auto-deploy from GitHub
- Free tier available

---

## Summary

**Easiest Method:**
1. Run `bash HOSTINGER_DEPLOY.sh`
2. Extract `hostinger-pos-system.tar.gz`
3. Upload via File Manager (no FTP needed)
4. Configure on server via Terminal
5. Start application

**If Still Having Issues:**
- Contact Hostinger support
- Try different upload method
- Consider alternative hosting

---

**Need more help?** Check Hostinger knowledge base or contact their 24/7 support.

