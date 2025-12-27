#!/bin/bash

# Create Desktop Icon for TDO POS System on macOS
# This script creates an application launcher on the desktop

echo "🖥️  Creating Desktop Icon for TDO POS System"
echo "============================================"
echo ""

# Get the project directory
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
DESKTOP_DIR="$HOME/Desktop"
APP_NAME="TDO POS System"
ICON_NAME="TDO_POS_System"

# Create .app bundle structure
APP_PATH="$DESKTOP_DIR/${APP_NAME}.app"
CONTENTS_DIR="$APP_PATH/Contents"
MACOS_DIR="$CONTENTS_DIR/MacOS"
RESOURCES_DIR="$CONTENTS_DIR/Resources"

echo "Creating application bundle..."
mkdir -p "$MACOS_DIR"
mkdir -p "$RESOURCES_DIR"

# Create Info.plist
cat > "$CONTENTS_DIR/Info.plist" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>launcher</string>
    <key>CFBundleIdentifier</key>
    <string>com.tdo.possystem</string>
    <key>CFBundleName</key>
    <string>${APP_NAME}</string>
    <key>CFBundleVersion</key>
    <string>1.0</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleIconFile</key>
    <string>icon</string>
</dict>
</plist>
EOF

# Create launcher script
cat > "$MACOS_DIR/launcher" << 'LAUNCHER_EOF'
#!/bin/bash

# Get the project directory (assuming script is in project root)
SCRIPT_DIR="$(cd "$(dirname "$0")/../../.." && pwd)"
PROJECT_DIR="$SCRIPT_DIR/pos-inventory-system"

# Check if project exists
if [ ! -d "$PROJECT_DIR" ]; then
    osascript -e 'display dialog "TDO POS System not found at: '"$PROJECT_DIR"'" buttons {"OK"} default button "OK" with icon stop'
    exit 1
fi

# Change to project directory
cd "$PROJECT_DIR"

# Check if backend is running
if ! lsof -ti:5001 > /dev/null 2>&1; then
    # Start backend in new terminal window
    osascript << EOF
        tell application "Terminal"
            activate
            do script "cd '$PROJECT_DIR/backend' && echo 'Starting TDO POS System Backend...' && node server.js"
        end tell
EOF
    
    # Wait for server to start
    sleep 5
fi

# Open browser
open "http://localhost:5001"
LAUNCHER_EOF

chmod +x "$MACOS_DIR/launcher"

# Create a simple icon (if icon file exists, use it)
ICON_SOURCE="$PROJECT_DIR/frontend/public/logo512.png"
if [ -f "$ICON_SOURCE" ]; then
    echo "Using existing icon: $ICON_SOURCE"
    cp "$ICON_SOURCE" "$RESOURCES_DIR/icon.png"
else
    echo "Creating default icon..."
    # Create a simple icon using sips (macOS built-in)
    # We'll create a basic colored square as icon
    echo "Note: You can replace the icon later by copying an image to:"
    echo "      $RESOURCES_DIR/icon.png"
fi

# Make the app executable
chmod +x "$APP_PATH/Contents/MacOS/launcher"

echo ""
echo "✅ Desktop icon created!"
echo ""
echo "Location: $APP_PATH"
echo ""
echo "The icon should appear on your desktop."
echo "Double-click it to launch TDO POS System!"
echo ""
echo "If icon doesn't appear:"
echo "1. Refresh desktop (Cmd+Option+Esc, then click Desktop)"
echo "2. Or restart Finder: killall Finder"

