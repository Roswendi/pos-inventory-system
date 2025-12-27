#!/bin/bash

# GitHub Setup Script
# This script helps you set up Git and push to GitHub

echo "=========================================="
echo "GitHub Repository Setup"
echo "=========================================="
echo ""

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Check if Git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed!"
    echo "Install Git: https://git-scm.com/downloads"
    exit 1
fi

echo "✓ Git is installed"
echo ""

# Check if already a Git repository
if [ -d ".git" ]; then
    echo "⚠️  Git repository already initialized"
    read -p "Do you want to reinitialize? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Reinitializing..."
        rm -rf .git
        git init
    else
        echo "Using existing repository"
    fi
else
    echo "Initializing Git repository..."
    git init
fi

echo ""
echo "Step 1: Configure Git (if not already done)"
echo "------------------------------------------"
read -p "Enter your name: " git_name
read -p "Enter your email: " git_email

if [ ! -z "$git_name" ] && [ ! -z "$git_email" ]; then
    git config user.name "$git_name"
    git config user.email "$git_email"
    echo "✓ Git configured"
fi

echo ""
echo "Step 2: Add files to Git"
echo "-----------------------"
git add .

echo ""
echo "Step 3: Create initial commit"
echo "-----------------------------"
git commit -m "Initial commit: POS Inventory System"

echo ""
echo "Step 4: Add GitHub remote"
echo "------------------------"
echo "Enter your GitHub repository URL:"
echo "Example: https://github.com/your-username/pos-inventory-system.git"
read -p "Repository URL: " repo_url

if [ ! -z "$repo_url" ]; then
    git remote add origin "$repo_url" 2>/dev/null || git remote set-url origin "$repo_url"
    echo "✓ Remote added: $repo_url"
else
    echo "⚠️  No repository URL provided"
    echo "You can add it later with:"
    echo "  git remote add origin https://github.com/your-username/pos-inventory-system.git"
fi

echo ""
echo "Step 5: Push to GitHub"
echo "---------------------"
read -p "Push to GitHub now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git branch -M main
    echo "Pushing to GitHub..."
    git push -u origin main
    if [ $? -eq 0 ]; then
        echo ""
        echo "=========================================="
        echo "✓ Successfully pushed to GitHub!"
        echo "=========================================="
    else
        echo ""
        echo "⚠️  Push failed. You may need to:"
        echo "1. Create repository on GitHub first"
        echo "2. Check your credentials"
        echo "3. Use Personal Access Token instead of password"
    fi
else
    echo ""
    echo "To push later, run:"
    echo "  git branch -M main"
    echo "  git push -u origin main"
fi

echo ""
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Create repository on GitHub (if not done)"
echo "2. Push your code: git push -u origin main"
echo "3. See GITHUB_SETUP_GUIDE.md for deployment"
echo ""

