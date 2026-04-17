# ✅ Extension Successfully Packaged!

Your GuardRail AI extension is ready: `guardrail-ai-1.0.0.vsix`

## 📦 Install in Kiro IDE

### Method 1: GUI Installation (Recommended)

1. **Open Kiro IDE**

2. **Open Command Palette**
   - Press `Ctrl+Shift+P` (Windows/Linux)
   - Press `Cmd+Shift+P` (Mac)

3. **Type**: `Extensions: Install from VSIX`

4. **Select the file**:
   ```
   /Users/rakshit/Desktop/GuardRail AI/GuardRail MVP/extensions/vscode/guardrail-ai-1.0.0.vsix
   ```

5. **Restart Kiro** when prompted

6. **Done!** ✅

### Method 2: Drag and Drop

1. Open Kiro IDE
2. Open Extensions panel (`Ctrl+Shift+X` or `Cmd+Shift+X`)
3. Drag and drop `guardrail-ai-1.0.0.vsix` into the Extensions panel
4. Click "Install"
5. Restart Kiro

### Method 3: Command Line (if Kiro CLI is available)

```bash
kiro --install-extension guardrail-ai-1.0.0.vsix
```

## 🚀 Next Steps

### 1. Start the Backend

Open a new terminal and run:

```bash
cd ../../api
npm start
```

The backend will run on `http://localhost:3001`

### 2. Test the Extension

1. Open Kiro IDE
2. Create a new file: `test.js`
3. Add this code:
```javascript
const apiKey = 'sk-1234567890abcdef';
console.log(apiKey);
```
4. Press `Ctrl+Shift+G` (or `Cmd+Shift+G` on Mac)
5. Watch the magic happen! 🎉

You should see:
- Status bar: "🔍 Scanning..."
- After 3-5 seconds: Red squiggly line under the API key
- Status bar: "⚠️ 1 issue"
- Hover over the red line to see details
- Click the lightbulb 💡 icon
- Select "Apply GuardRail AI Fix"
- Code is automatically secured! ✅

## ⚙️ Configure Extension

1. Open Kiro settings: `Ctrl+,` (or `Cmd+,`)
2. Search for "GuardRail AI"
3. Configure:
   - **API URL**: `http://localhost:3001` (default)
   - **Auto Scan on Save**: `true` (recommended)
   - **Show Inline Errors**: `true` (recommended)
   - **Enable Status Bar**: `true` (recommended)

## 🎯 Usage

### Scan Current File
- **Keyboard**: `Ctrl+Shift+G` (or `Cmd+Shift+G`)
- **Menu**: Right-click → "GuardRail AI: Scan Current File"
- **Command Palette**: `Ctrl+Shift+P` → "GuardRail AI: Scan Current File"

### Auto-Scan on Save
Just save your file (`Ctrl+S` or `Cmd+S`) and it scans automatically!

### View Results
- **Inline**: Red squiggly lines under vulnerable code
- **Hover**: Hover over red lines for details
- **Problems Panel**: `Ctrl+Shift+M` (or `Cmd+Shift+M`)
- **Status Bar**: Click the status bar item

### Apply Fixes
1. Click on red squiggly line
2. Click lightbulb 💡 icon
3. Select "Apply GuardRail AI Fix"
4. Review diff preview
5. Click "Apply"

## 🔧 Troubleshooting

### Extension Not Showing

**Solution**: Restart Kiro IDE after installation

### Backend Not Running

**Error**: "GuardRail AI backend is not running"

**Solution**:
```bash
cd ../../api
npm start
```

Verify it's running:
```bash
curl http://localhost:3001/health
```

### Keyboard Shortcut Not Working

**Solution**:
1. Press `Ctrl+K Ctrl+S` (or `Cmd+K Cmd+S`) to open Keyboard Shortcuts
2. Search "GuardRail AI"
3. Change to different shortcut if needed

### No Red Squiggly Lines

**Solution**:
1. Check settings: `guardrailai.showInlineErrors` should be `true`
2. Check Problems panel (`Ctrl+Shift+M`)
3. Restart Kiro IDE

## 📚 More Help

- **Quick Start**: See `../../KIRO-QUICK-START.md`
- **Full Guide**: See `../../UNIVERSAL-IDE-COMPATIBILITY.md`
- **User Manual**: See `README.md`
- **Development**: See `DEVELOPMENT.md`

## ✅ Verification Checklist

- [ ] Extension installed in Kiro
- [ ] Backend running on port 3001
- [ ] Test file created
- [ ] Pressed `Ctrl+Shift+G` to scan
- [ ] Red squiggly line appeared
- [ ] Lightbulb 💡 clicked
- [ ] Fix applied successfully
- [ ] Code is secured!

## 🎉 Success!

You're all set! Start writing secure code with GuardRail AI in Kiro!

Press `Ctrl+Shift+G` anytime to scan your code for security vulnerabilities.

---

**Need help?** Check the documentation or create an issue on GitHub.
