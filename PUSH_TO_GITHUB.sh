#!/bin/bash

# Simple script to push code to GitHub
# Run: bash PUSH_TO_GITHUB.sh

echo "=========================================="
echo "Push to GitHub - POS System"
echo "=========================================="
echo ""

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Check if Git is initialized
if [ ! -d ".git" ]; then
    echo "Initializing Git repository..."
    git init
fi

# Check if .gitignore exists
if [ ! -f ".gitignore" ]; then
    echo "⚠️  .gitignore not found. Creating one..."
    # .gitignore should already exist, but just in case
fi

echo ""
echo "Step 1: Checking Git status..."
git status

echo ""
echo "Step 2: Adding all files..."
git add .

echo ""
echo "Step 3: Creating commit..."
read -p "Enter commit message (or press Enter for default): " commit_msg
if [ -z "$commit_msg" ]; then
    commit_msg="Update POS system"
fi

git commit -m "$commit_msg"

echo ""
echo "Step 4: Checking remote..."
if ! git remote | grep -q "origin"; then
    echo "No remote 'origin' found."
    read -p "Enter your GitHub repository URL: " repo_url
    if [ ! -z "$repo_url" ]; then
        git remote add origin "$repo_url"
        echo "✓ Remote added"
    else
        echo "⚠️  No URL provided. Add it manually with:"
        echo "   git remote add origin https://github.com/your-username/pos-inventory-system.git"
    fi
else
    echo "✓ Remote 'origin' exists"
    git remote -v
fi

echo ""
echo "Step 5: Pushing to GitHub..."
echo "⚠️  When asked for password, use your Personal Access Token!"
echo ""

read -p "Push to GitHub now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git branch -M main
    git push -u origin main
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "=========================================="
        echo "✓ Successfully pushed to GitHub!"
        echo "=========================================="
        echo ""
        echo "Next steps:"
        echo "1. Go to Railway.app"
        echo "2. Sign up with GitHub"
        echo "3. Deploy from GitHub repository"
        echo ""
        echo "See: RAILWAY_DEPLOY_SIMPLE.txt for Railway deployment"
    else
        echo ""
        echo "⚠️  Push failed. Common issues:"
        echo "   - Wrong password (use Personal Access Token!)"
        echo "   - Token expired"
        echo "   - Wrong repository URL"
        echo ""
        echo "See: GITHUB_SETUP_SIMPLE.txt for help"
    fi
else
    echo ""
    echo "To push later, run:"
    echo "  git push -u origin main"
    echo ""
    echo "Remember: Use Personal Access Token as password!"
fi

echo ""

