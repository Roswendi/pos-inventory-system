# 🎨 Quick Guide: Create TDO Icon (5 Minutes)

## Fastest Method: Online Tool

### Step 1: Go to Favicon Generator
Visit: https://www.favicon-generator.org/

### Step 2: Create Text Icon
1. Find "Text to Favicon" section
2. Enter text: **TDO**
3. Choose:
   - Font: Bold, Sans-serif
   - Background: #0066FF (blue)
   - Text Color: #FFFFFF (white)
4. Click "Generate"

### Step 3: Download
1. Download the generated package
2. Extract ZIP file
3. Find: `android-chrome-192x192.png` and `android-chrome-512x512.png`

### Step 4: Rename and Place
1. Rename to:
   - `android-chrome-192x192.png` → `logo192.png`
   - `android-chrome-512x512.png` → `logo512.png`
2. Copy both to: `frontend/public/`

### Step 5: Test
```bash
cd frontend
npm run build
npx serve -s build -p 3000
```
Open http://localhost:3000 - icon should appear!

---

## Better Method: Canva (10 Minutes)

### Step 1: Create Design
1. Go to https://canva.com
2. Create custom size: 512 x 512 pixels

### Step 2: Design
1. Add square shape (fill canvas)
2. Color: #0066FF (blue)
3. Add text "TDO"
4. Font: Bold, White, Large size
5. Center everything

### Step 3: Export
1. Download as PNG (512x512) → `logo512.png`
2. Resize to 192x192 → `logo192.png`
3. Place both in `frontend/public/`

---

## Design Tips

**Colors:**
- Background: #0066FF (blue) or #1A1A1A (dark)
- Text: #FFFFFF (white)

**Font:**
- Use bold, sans-serif fonts
- Size: 60-80% of icon size

**Style:**
- Keep it simple
- High contrast
- Test at small size (192px)

---

**Done! Your TDO icon is ready! 🎉**

