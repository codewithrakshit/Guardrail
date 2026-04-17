# GuardRail AI Extension - Quick Reference Card

## 🚀 Installation (30 seconds)
```bash
cd "GuardRail MVP/extensions/vscode"
code --install-extension guardrail-ai-1.0.1.vsix --force
```
Then: `Cmd+Shift+P` → "Reload Window"

## ⚡ Quick Start (3 steps)
1. **Start Backend:** `cd "GuardRail MVP/api" && npm start`
2. **Open File:** Any JS/Python/Java/etc file
3. **Scan:** Press `Cmd+Shift+G` (Mac) or `Ctrl+Shift+G` (Win/Linux)

## 🎯 Apply Fix (3 ways)

### Way 1: Quick Fix (Fastest)
1. Click red squiggly line
2. Click lightbulb 💡
3. Select "🛡️ Apply GuardRail AI Security Fix"

### Way 2: Command Palette
1. `Cmd+Shift+P`
2. Type "Apply Security Fix"
3. Press Enter

### Way 3: Notification
1. After scan, click "Apply Fixes" button

## ⌨️ Keyboard Shortcuts
- `Cmd+Shift+G` (Mac) / `Ctrl+Shift+G` (Win/Linux) - Scan file

## 🎨 Icon Setup (Optional)
```bash
# Visit: https://cloudconvert.com/svg-to-png
# Upload: icon.svg
# Download: icon.png (128x128)
# Then: npm run package
```

## 🧪 Test Code
```javascript
const apiKey = "sk_live_1234567890abcdef";
const query = "SELECT * FROM users WHERE id = " + userId;
fetch("http://api.example.com/data");
```

## 📋 Commands
- Scan Current File
- Scan Workspace
- Apply Security Fix ⭐
- Clear Results
- Open Dashboard
- Ignore Issue

## ✅ What's Fixed in v1.0.1
- ✅ Apply Fix now works perfectly
- ✅ Diff preview shows side-by-side
- ✅ Icon design ready
- ✅ Better UI/UX

## 🐛 Troubleshooting
**Backend not running?**
```bash
cd "GuardRail MVP/api" && npm start
```

**Extension not working?**
```bash
code --install-extension guardrail-ai-1.0.1.vsix --force
# Then reload window
```

## 📚 Full Docs
- `INSTALLATION-GUIDE.md` - Complete setup
- `TEST-APPLY-FIX.md` - Testing guide
- `WHATS-NEW.md` - Changelog
- `FIXES-APPLIED.md` - Technical details

## 🎉 You're Ready!
Press `Cmd+Shift+G` and start securing your code! 🛡️
