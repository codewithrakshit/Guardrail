# GuardRail AI Extension - Complete Installation Guide

## ✅ What's Been Fixed

1. **Apply Fix Functionality** - Now works perfectly with diff preview
2. **Extension Icon** - Professional SVG icon created
3. **Enhanced UI** - Better commands and user experience

## 📦 Package Ready

- **File:** `guardrail-ai-1.0.1.vsix`
- **Size:** 924KB
- **Location:** `GuardRail MVP/extensions/vscode/`
- **Status:** ✅ Ready to install

## 🚀 Installation Methods

### Method 1: Drag & Drop (RECOMMENDED - Easiest!)

1. **Open Finder**
   - Navigate to: `GuardRail MVP/extensions/vscode/`
   - Find file: `guardrail-ai-1.0.1.vsix`

2. **Open VS Code or Kiro IDE**

3. **Drag the .vsix file into VS Code window**

4. **Click "Install" button**

5. **Reload Window**
   - Press `Cmd+Shift+P`
   - Type "Reload Window"
   - Press Enter

6. **Done!** ✅

---

### Method 2: Command Palette

1. **Open VS Code or Kiro IDE**

2. **Open Command Palette**
   - Press `Cmd+Shift+P` (Mac)
   - Or press `Ctrl+Shift+P` (Windows/Linux)

3. **Type:** `Extensions: Install from VSIX`

4. **Press Enter**

5. **Navigate to:**
   ```
   GuardRail MVP/extensions/vscode/
   ```

6. **Select:** `guardrail-ai-1.0.1.vsix`

7. **Click "Install"**

8. **Reload Window**
   - Press `Cmd+Shift+P`
   - Type "Reload Window"
   - Press Enter

9. **Done!** ✅

---

### Method 3: Extensions View

1. **Open VS Code or Kiro IDE**

2. **Open Extensions View**
   - Press `Cmd+Shift+X` (Mac)
   - Or press `Ctrl+Shift+X` (Windows/Linux)
   - Or click Extensions icon in sidebar

3. **Click the `...` (three dots) at the top right**

4. **Select "Install from VSIX..."**

5. **Navigate to:**
   ```
   GuardRail MVP/extensions/vscode/
   ```

6. **Select:** `guardrail-ai-1.0.1.vsix`

7. **Click "Install"**

8. **Reload Window**
   - Press `Cmd+Shift+P`
   - Type "Reload Window"
   - Press Enter

9. **Done!** ✅

---

## ✅ Verify Installation

After installing, verify it worked:

1. **Open Extensions View** (`Cmd+Shift+X`)

2. **Search for:** "GuardRail AI"

3. **You should see:**
   - ✅ GuardRail AI extension
   - ✅ Version 1.0.1
   - ✅ Status: Enabled

4. **Check Status Bar**
   - Look at bottom of VS Code
   - You should see "GuardRail AI" item

---

## 🧪 Test It Works

### Step 1: Start Backend
```bash
cd "GuardRail MVP/api"
npm start
```

Keep this terminal running!

### Step 2: Create Test File

Create a new file called `test-security.js`:

```javascript
// Hardcoded secret (BAD)
const apiKey = "sk_live_1234567890abcdef";

// SQL Injection (BAD)
const query = "SELECT * FROM users WHERE id = " + userId;

// Insecure HTTP (BAD)
fetch("http://api.example.com/data");
```

### Step 3: Scan the File

Press `Cmd+Shift+G` (Mac) or `Ctrl+Shift+G` (Windows/Linux)

### Step 4: See Results

You should see:
- ✅ Red squiggly lines under security issues
- ✅ Problems panel shows vulnerabilities
- ✅ Status bar shows issue count

### Step 5: Apply Fix

1. **Click on any red squiggly line**
2. **Click the lightbulb 💡 icon**
3. **Select:** "🛡️ Apply GuardRail AI Security Fix"
4. **See the diff view** (Original ↔ Fixed)
5. **Click "Apply Fixes"**
6. **Watch the code transform!** ✨

### Expected Result:

The code should be automatically fixed to:
```javascript
// Secure version
const apiKey = process.env.API_KEY;
const query = "SELECT * FROM users WHERE id = ?";
// Use parameterized query
fetch("https://api.example.com/data");
```

---

## 🎯 What You Can Do Now

### Security Scanning
- ✅ Scan individual files
- ✅ Scan entire workspace
- ✅ Auto-scan on save
- ✅ Real-time vulnerability detection

### Fix Application
- ✅ Review fixes before applying
- ✅ Side-by-side diff view
- ✅ One-click application
- ✅ Automatic file save
- ✅ Clear diagnostics

### Supported Languages
- ✅ JavaScript
- ✅ TypeScript
- ✅ Python
- ✅ Java
- ✅ Go
- ✅ Ruby
- ✅ PHP

---

## ⌨️ Keyboard Shortcuts

- `Cmd+Shift+G` (Mac) / `Ctrl+Shift+G` (Win/Linux) - Scan current file

---

## 📋 Available Commands

Open Command Palette (`Cmd+Shift+P`) and type:

- `GuardRail AI: Scan Current File` - Scan active file
- `GuardRail AI: Scan Workspace` - Scan all files
- `GuardRail AI: Apply Security Fix` - Apply fixes
- `GuardRail AI: Clear Results` - Clear diagnostics
- `GuardRail AI: Open Dashboard` - Open web UI
- `GuardRail AI: Ignore Issue` - Ignore specific issue

---

## ⚙️ Configuration

Open Settings (`Cmd+,`) and search for "GuardRail AI":

- **API URL:** Backend server URL (default: http://localhost:3001)
- **Auto Scan on Save:** Automatically scan when saving (default: true)
- **Show Inline Errors:** Show red squiggly lines (default: true)
- **Timeout:** API request timeout in ms (default: 30000)

---

## 🐛 Troubleshooting

### Extension doesn't appear after install
**Solution:**
- Reload window: `Cmd+Shift+P` → "Reload Window"
- Or restart VS Code completely

### "No response from GuardRail AI backend"
**Solution:**
```bash
cd "GuardRail MVP/api"
npm start
```
Keep the terminal running!

### "No fixes available"
**Solution:**
- Ensure backend is running
- Check backend terminal for errors
- Verify the file has actual vulnerabilities

### Diff view doesn't open
**Solution:**
- Reload window: `Cmd+Shift+P` → "Reload Window"
- Check VS Code version (needs 1.80.0+)
- Check Output panel: View → Output → "GuardRail AI"

### Extension installed but not working
**Solution:**
1. Check Extensions view - ensure it's enabled
2. Reload window
3. Check backend is running
4. Try scanning a file with known vulnerabilities

---

## 📚 Additional Documentation

- **START-HERE.md** - Quick start guide
- **INSTALL-NOW.md** - Fast installation steps
- **INSTALL-WITHOUT-CLI.md** - Detailed installation guide
- **WHATS-NEW.md** - Changelog and new features
- **TEST-APPLY-FIX.md** - Testing guide
- **APPLY-FIX-FLOW.md** - How Apply Fix works
- **QUICK-REFERENCE.md** - Quick reference card

---

## 🎨 Optional: Add Extension Icon

The extension works without an icon, but to add one:

1. Go to https://cloudconvert.com/svg-to-png
2. Upload `icon.svg` from this directory
3. Set size to 128x128
4. Download as `icon.png`
5. Place in this directory
6. Update `package.json`: add `"icon": "icon.png",`
7. Run: `npm run package`
8. Reinstall extension

See `ICON-SETUP.md` for details.

---

## 🎉 Success!

You now have GuardRail AI extension installed with:

- ✅ Working Apply Fix functionality
- ✅ Beautiful diff preview
- ✅ Real-time security scanning
- ✅ AI-powered vulnerability detection
- ✅ One-click fix application

**Start securing your code now!** 🛡️

---

## 📍 File Locations

**Extension Package:**
```
GuardRail MVP/extensions/vscode/guardrail-ai-1.0.1.vsix
```

**Full Path:**
```
/Users/rakshit/Desktop/GuardRail AI/GuardRail MVP/extensions/vscode/guardrail-ai-1.0.1.vsix
```

**Backend API:**
```
GuardRail MVP/api/
```

---

## 🆘 Need More Help?

1. Check the troubleshooting section above
2. Read `INSTALL-WITHOUT-CLI.md` for detailed steps
3. Review `TEST-APPLY-FIX.md` for testing guide
4. Check backend logs for API errors

---

**Recommended Installation Method:** Drag & Drop (Method 1)

It's the fastest and easiest way to install! 🚀
