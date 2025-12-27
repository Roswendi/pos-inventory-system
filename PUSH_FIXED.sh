#!/bin/bash

# Fixed Push Script - Handles directory issues
# Run: bash PUSH_FIXED.sh

echo "=========================================="
echo "Push to GitHub - Fixed Version"
echo "=========================================="
echo ""

# Get the script's directory (wherever it is)
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "Script location: $SCRIPT_DIR"
echo ""

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "⚠️  Not in project directory. Changing to script directory..."
    cd "$SCRIPT_DIR"
    
    if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
        echo "❌ Error: Cannot find backend or frontend folders!"
        echo "Please run this script from the pos-inventory-system directory"
        exit 1
    fi
fi

echo "✓ Current directory: $(pwd)"
echo "✓ Found backend and frontend folders"
echo ""

# Initialize Git if needed
if [ ! -d ".git" ]; then
    echo "Initializing Git repository..."
    git init
    echo "✓ Git initialized"
else
    echo "✓ Git repository already exists"
fi

echo ""
echo "Step 1: Checking Git status..."
git status --short | head -10

echo ""
echo "Step 2: Adding all files..."
git add .

echo ""
echo "Step 3: Creating commit..."
read -p "Enter commit message (or press Enter for default): " commit_msg
if [ -z "$commit_msg" ]; then
    commit_msg="Update POS system - $(date +%Y-%m-%d)"
fi

git commit -m "$commit_msg"

echo ""
echo "Step 4: Checking remote..."
if ! git remote | grep -q "origin"; then
    echo "No remote 'origin' found."
    echo ""
    echo "Enter your GitHub repository URL:"
    echo "Example: https://github.com/your-username/pos-inventory-system.git"
    read -p "Repository URL: " repo_url
    
    if [ ! -z "$repo_url" ]; then
        git remote add origin "$repo_url"
        echo "✓ Remote added: $repo_url"
    else
        echo "⚠️  No URL provided."
        echo ""
        echo "To add remote manually, run:"
        echo "  git remote add origin https://github.com/your-username/pos-inventory-system.git"
        exit 1
    fi
else
    echo "✓ Remote 'origin' exists:"
    git remote -v
fi

echo ""
echo "Step 5: Pushing to GitHub..."
echo "⚠️  IMPORTANT: When asked for password, use your Personal Access Token!"
echo "   (Not your GitHub password!)"
echo ""

read -p "Push to GitHub now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Ensure we're on main branch
    git branch -M main 2>/dev/null || git checkout -b main
    
    echo "Pushing to GitHub..."
    git push -u origin main
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "=========================================="
        echo "✓ Successfully pushed to GitHub!"
        echo "=========================================="
        echo ""
        echo "Your code is now on GitHub!"
        echo ""
        echo "Next steps:"
        echo "1. Go to https://railway.app"
        echo "2. Sign up with GitHub"
        echo "3. Deploy from GitHub repository"
        echo ""
        echo "See: RAILWAY_DEPLOY_SIMPLE.txt for Railway deployment"
    else
        echo ""
        echo "⚠️  Push failed!"
        echo ""
        echo "Common issues:"
        echo "  - Wrong password (use Personal Access Token!)"
        echo "  - Token expired or wrong permissions"
        echo "  - Wrong repository URL"
        echo "  - Network connection issue"
        echo ""
        echo "Troubleshooting:"
        echo "  1. Verify your Personal Access Token at:"
        echo "     https://github.com/settings/tokens"
        echo "  2. Make sure token has 'repo' scope"
        echo "  3. Check repository URL is correct"
        echo "  4. Try: git push -u origin main again"
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

