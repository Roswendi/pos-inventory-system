-- AppleScript to create desktop app for TDO POS System
-- Run this in Script Editor

tell application "Finder"
	set projectPath to "/Users/endiroswendi/Documents/ Old Laptop Documents/CAO/FINANCIAL REPORT/pos-inventory-system"
	set desktopPath to path to desktop folder as string
	set appName to "TDO POS System"
	
	-- Create .app bundle structure
	set appPath to desktopPath & appName & ".app"
	set contentsPath to appPath & ":Contents"
	set macosPath to contentsPath & ":MacOS"
	set resourcesPath to contentsPath & ":Resources"
	
	-- Create directories
	do shell script "mkdir -p " & quoted form of POSIX path of macosPath
	do shell script "mkdir -p " & quoted form of POSIX path of resourcesPath
	
	-- Create launcher script
	set launcherScript to "#!/bin/bash
cd " & quoted form of POSIX path of projectPath & "/backend
if ! lsof -ti:5001 > /dev/null 2>&1; then
    osascript -e 'tell app \"Terminal\" to do script \"cd " & quoted form of POSIX path of projectPath & "/backend && node server.js\"'
    sleep 5
fi
open \"http://localhost:5001\""
	
	set launcherFile to macosPath & ":launcher"
	write launcherScript to file launcherFile
	do shell script "chmod +x " & quoted form of POSIX path of launcherFile
	
	-- Create Info.plist
	set plistContent to "<?xml version=\"1.0\" encoding=\"UTF-8\"?>
<!DOCTYPE plist PUBLIC \"-//Apple//DTD PLIST 1.0//EN\" \"http://www.apple.com/DTDs/PropertyList-1.0.dtd\">
<plist version=\"1.0\">
<dict>
    <key>CFBundleExecutable</key>
    <string>launcher</string>
    <key>CFBundleIdentifier</key>
    <string>com.tdo.possystem</string>
    <key>CFBundleName</key>
    <string>" & appName & "</string>
    <key>CFBundleVersion</key>
    <string>1.0</string>
</dict>
</plist>"
	
	set plistFile to contentsPath & ":Info.plist"
	write plistContent to file plistFile
	
	display dialog "Desktop app created successfully!" & return & return & "Location: " & appPath buttons {"OK"} default button "OK"
end tell

