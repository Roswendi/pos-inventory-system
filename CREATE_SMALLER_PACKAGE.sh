#!/bin/bash

# Create Smaller Package for Easy Upload
# Splits into smaller files if needed

echo "=========================================="
echo "Creating Smaller Upload Package"
echo "=========================================="
echo ""

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Check if hostinger package exists
if [ ! -f "hostinger-pos-system.tar.gz" ]; then
    echo "Creating hostinger package first..."
    bash HOSTINGER_DEPLOY.sh
fi

echo "Step 1: Checking package size..."
PACKAGE_SIZE=$(du -h hostinger-pos-system.tar.gz | cut -f1)
echo "Package size: $PACKAGE_SIZE"

# Extract to create folder structure
echo ""
echo "Step 2: Extracting package..."
rm -rf upload-ready
mkdir -p upload-ready
tar -xzf hostinger-pos-system.tar.gz -C upload-ready

echo ""
echo "Step 3: Creating upload structure..."

# Create separate packages for easier upload
cd upload-ready

# Split into essential and optional
echo "Creating essential files package..."
tar -czf ../essential-files.tar.gz \
    package.json \
    server.js \
    .env.example \
    routes/ \
    data/defaultAccounts.json \
    2>/dev/null

echo "Creating frontend package..."
if [ -d "public" ]; then
    tar -czf ../frontend-files.tar.gz public/ 2>/dev/null
fi

echo "Creating data structure package..."
if [ -d "data" ]; then
    tar -czf ../data-files.tar.gz data/ 2>/dev/null
fi

cd ..

echo ""
echo "=========================================="
echo "✓ Packages Created!"
echo "=========================================="
echo ""
echo "Files created:"
echo "  1. essential-files.tar.gz (Backend core)"
echo "  2. frontend-files.tar.gz (Frontend build)"
echo "  3. data-files.tar.gz (Data structure)"
echo ""
echo "Upload order:"
echo "  1. Upload essential-files.tar.gz first"
echo "  2. Extract it"
echo "  3. Upload frontend-files.tar.gz"
echo "  4. Extract it (will merge with essential)"
echo "  5. Upload data-files.tar.gz"
echo "  6. Extract it"
echo ""
echo "OR upload the complete package:"
echo "  hostinger-pos-system.tar.gz"
echo ""
echo "All files ready in: upload-ready/ folder"
echo "You can also upload this folder directly via FTP"
echo ""

