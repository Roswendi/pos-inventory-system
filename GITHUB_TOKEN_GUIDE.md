# GitHub Personal Access Token Guide

## Why GitHub Password Doesn't Work

GitHub **removed password authentication** in August 2021 for security reasons. You must now use a **Personal Access Token (PAT)** instead.

## Create Personal Access Token

### Step 1: Go to GitHub Settings

1. Log into [GitHub.com](https://github.com)
2. Click your **profile picture** (top right)
3. Click **Settings**

### Step 2: Access Developer Settings

1. Scroll down in left sidebar
2. Click **Developer settings**
3. Click **Personal access tokens**
4. Click **Tokens (classic)**

### Step 3: Generate New Token

1. Click **Generate new token**
2. Click **Generate new token (classic)**

### Step 4: Configure Token

1. **Note:** Give it a name (e.g., "POS System Deployment")
2. **Expiration:** 
   - Choose expiration (90 days recommended)
   - Or "No expiration" (less secure)
3. **Select scopes:** Check these:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (if using GitHub Actions)
4. Scroll down
5. Click **Generate token**

### Step 5: Copy Token Immediately

⚠️ **IMPORTANT:** Copy the token NOW!
- It looks like: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- You won't be able to see it again!
- Save it somewhere safe

## Use Token as Password

When Git asks for credentials:

- **Username:** Your GitHub username
- **Password:** Paste the **Personal Access Token** (not your GitHub password!)

### Example:

```bash
git push origin main

Username: your-username
Password: ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  # <- Use token here!
```

## Alternative: Use GitHub CLI (Easier)

### Install GitHub CLI

**On Mac:**
```bash
brew install gh
```

**On Windows:**
Download from: https://cli.github.com

**On Linux:**
```bash
sudo apt install gh
```

### Login with GitHub CLI

```bash
gh auth login
```

Follow the prompts:
1. Choose: GitHub.com
2. Choose: HTTPS
3. Authenticate: Yes
4. Choose: Login with a web browser
5. Copy the code shown
6. Press Enter
7. Browser opens - paste code and authorize

### Push Code

After logging in with CLI:
```bash
git push origin main
```

No password or token needed! ✅

## But Remember: You Don't Need GitHub!

Since you're deploying to **Hostinger**, you can:
- ✅ Skip GitHub entirely
- ✅ Upload directly to Hostinger
- ✅ No authentication needed
- ✅ Much simpler!

See `STEP_BY_STEP_UPLOAD.txt` for direct Hostinger upload.

## Quick Reference

| Method | Difficulty | Notes |
|--------|-----------|-------|
| **Direct Hostinger Upload** | ⭐ Easy | No GitHub needed |
| **GitHub CLI** | ⭐⭐ Medium | Easy authentication |
| **Personal Access Token** | ⭐⭐⭐ Harder | Need to create token |

**Recommendation:** Use direct Hostinger upload - it's the easiest!

## Troubleshooting

### Issue: Token Not Working

**Check:**
- Token is copied correctly (no spaces)
- Token hasn't expired
- Correct scopes selected (repo)

**Fix:**
- Generate new token
- Make sure `repo` scope is checked

### Issue: GitHub CLI Not Working

**Check:**
- GitHub CLI is installed: `gh --version`
- You're logged in: `gh auth status`

**Fix:**
- Re-login: `gh auth login`
- Or use Personal Access Token method

### Issue: Still Getting Password Error

**Check:**
- Using token, not password
- Token hasn't expired
- Correct username

**Fix:**
- Generate new token
- Use token as password (not your GitHub password)

---

**Remember:** For Hostinger deployment, you don't need GitHub at all! Just upload directly!

