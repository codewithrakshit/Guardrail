# GuardRail AI Extension - Installation & Usage Guide

## ✅ What's Fixed

### 1. Apply Fix Functionality - WORKING ✅
- Fixed diff preview mechanism
- Proper side-by-side code comparison
- Smooth fix application workflow
- Auto-save after applying fixes
- Clear diagnostics after fix

### 2. Extension Icon - READY ✅
- SVG icon created (shield with AI circuit)
- Instructions provided for PNG generation
- Extension packaged and ready to use

### 3. Enhanced UI - COMPLETE ✅
- Better command names and descriptions
- Icons for all commands
- Improved quick fix experience

## 🚀 Quick Installation

### Step 1: Install the Extension
```bash
cd "GuardRail MVP/extensions/vscode"
code --install-extension guardrail-ai-1.0.1.vsix --force
```

### Step 2: Reload VS Code
- Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
- Type "Reload Window"
- Press Enter

### Step 3: Start Backend (Required)
```bash
cd "GuardRail MVP/api"
npm start
```

## 📖 How to Use Apply Fix

### Method 1: Quick Fix (Recommended)
1. Open a JavaScript/Python/etc file
2. Press `Cmd+Shift+G` (Mac) or `Ctrl+Shift+G` (Windows/Linux) to scan
3. Click on any red squiggly line
4. Click the lightbulb 💡 icon
5. Select "🛡️ Apply GuardRail AI Security Fix"
6. Review the diff view (original vs fixed)
7. Click "Apply Fixes" to accept

### Method 2: Command Palette
1. Scan your file first (`Cmd+Shift+G`)
2. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
3. Type "GuardRail AI: Apply Security Fix"
4. Press Enter
5. Review and apply

### Method 3: From Notification
1. After scanning, a notification appears
2. Click "Apply Fixes" button
3. Review and apply

## 🧪 Test with Sample Code

Create a file `test-security.js`:

```javascript
// Hardcoded secrets (BAD)
const apiKey = "sk_live_1234567890abcdef";
const dbPassword = "admin123";

// SQL Injection vulnerability (BAD)
function getUser(userId) {
    const query = "SELECT * FROM users WHERE id = " + userId;
    return database.query(query);
}

// Insecure HTTP (BAD)
fetch("http://api.example.com/sensitive-data")
    .then(res => res.json())
    .then(data => console.log(data));

// Eval usage (BAD)
function executeCode(userInput) {
    eval(userInput);
}
```

Then:
1. Open the file in VS Code
2. Press `Cmd+Shift+G` to scan
3. See red squiggly lines appear
4. Use any method above to apply fixes
5. Watch the code transform to secure versions!

## 🎨 Adding the Icon (Optional)

The extension works without the icon, but to add it:

### Option 1: Online Converter (Easiest)
1. Go to https://cloudconvert.com/svg-to-png
2. Upload `icon.svg` from the extension directory
3. Set size to 128x128
4. Download as `icon.png`
5. Place in extension directory
6. Update `package.json`: add `"icon": "icon.png",` after `"publisher"`
7. Repackage: `npm run package`
8. Reinstall: `code --install-extension guardrail-ai-1.0.1.vsix --force`

### Option 2: Using ImageMagick
```bash
brew install imagemagick
cd "GuardRail MVP/extensions/vscode"
convert -background none -density 300 icon.svg -resize 128x128 icon.png
npm run package
code --install-extension guardrail-ai-1.0.1.vsix --force
```

## 🔧 Configuration

Open VS Code Settings (`Cmd+,`) and search for "GuardRail AI":

- `guardrailai.apiUrl` - Backend API URL (default: http://localhost:3001)
- `guardrailai.autoScanOnSave` - Auto-scan on file save (default: true)
- `guardrailai.showInlineErrors` - Show inline diagnostics (default: true)
- `guardrailai.timeout` - API timeout in ms (default: 30000)

## 📋 Available Commands

All commands accessible via Command Palette (`Cmd+Shift+P`):

- `GuardRail AI: Scan Current File` - Scan active file (Shortcut: `Cmd+Shift+G`)
- `GuardRail AI: Scan Workspace` - Scan all files in workspace
- `GuardRail AI: Apply Security Fix` - Apply fixes to current file
- `GuardRail AI: Clear Results` - Clear all diagnostics
- `GuardRail AI: Open Dashboard` - Open web dashboard
- `GuardRail AI: Ignore Issue` - Ignore specific issue

## ✅ Verification Checklist

After installation, verify:

- [ ] Extension appears in Extensions view
- [ ] Status bar shows "GuardRail AI" item
- [ ] `Cmd+Shift+G` triggers scan
- [ ] Red squiggly lines appear on vulnerabilities
- [ ] Lightbulb shows "Apply GuardRail AI Security Fix"
- [ ] Diff view opens when applying fix
- [ ] Fixes apply successfully
- [ ] File saves automatically after fix
- [ ] Diagnostics clear after fix

## 🐛 Troubleshooting

### "No response from GuardRail AI backend"
**Solution:** Start the backend:
```bash
cd "GuardRail MVP/api"
npm start
```

### "No fixes available"
**Solution:** 
- Ensure backend is running
- Check backend logs for errors
- Verify the file has actual vulnerabilities

### Diff view doesn't open
**Solution:**
- Reload VS Code window
- Check VS Code version (needs 1.80.0+)
- Check Output panel for errors

### Extension not found after installation
**Solution:**
```bash
# Reinstall with force flag
code --install-extension guardrail-ai-1.0.1.vsix --force

# Then reload window
```

## 📦 Package Contents

- `guardrail-ai-1.0.1.vsix` - Extension package (ready to install)
- `icon.svg` - Vector icon (shield with AI circuit)
- `LICENSE` - MIT License
- `FIXES-APPLIED.md` - Detailed changelog
- `TEST-APPLY-FIX.md` - Testing guide
- `ICON-SETUP.md` - Icon generation guide

## 🎯 What's Working

✅ Security scanning with AI
✅ Real-time vulnerability detection
✅ Inline diagnostics (red squiggly lines)
✅ Quick fix suggestions
✅ **Apply Fix with diff preview** (FIXED!)
✅ Side-by-side code comparison
✅ Automatic fix application
✅ File auto-save after fix
✅ Status bar integration
✅ Command palette integration
✅ Keyboard shortcuts
✅ Multi-language support
✅ Workspace scanning

## 📚 Additional Resources

- `FIXES-APPLIED.md` - Technical details of fixes
- `TEST-APPLY-FIX.md` - Comprehensive testing guide
- `ICON-SETUP.md` - Icon generation instructions
- `README.md` - General extension documentation

## 🎉 Success!

Your GuardRail AI extension is now ready with:
- ✅ Working Apply Fix functionality
- ✅ Beautiful diff preview
- ✅ Icon design ready
- ✅ Enhanced UI/UX
- ✅ Packaged and installable

Enjoy secure coding with GuardRail AI! 🛡️
