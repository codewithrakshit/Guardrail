# Installing GuardRail AI Extension (Without CLI)

## Problem
The `code` command is not found in your terminal. This is common on macOS.

## Solution: Install via VS Code UI (Easiest)

### Method 1: Drag and Drop (Recommended)
1. Open VS Code (or Kiro IDE)
2. Locate the file: `guardrail-ai-1.0.1.vsix`
3. **Drag and drop** the `.vsix` file into VS Code window
4. Click "Install" when prompted
5. Click "Reload" or press `Cmd+Shift+P` → "Reload Window"
6. Done! ✅

### Method 2: Install from VSIX Menu
1. Open VS Code (or Kiro IDE)
2. Press `Cmd+Shift+P` (Command Palette)
3. Type: "Extensions: Install from VSIX"
4. Press Enter
5. Navigate to: `GuardRail MVP/extensions/vscode/`
6. Select: `guardrail-ai-1.0.1.vsix`
7. Click "Install"
8. Click "Reload" when prompted
9. Done! ✅

### Method 3: Extensions View
1. Open VS Code (or Kiro IDE)
2. Click Extensions icon in sidebar (or press `Cmd+Shift+X`)
3. Click the `...` (three dots) at the top
4. Select "Install from VSIX..."
5. Navigate to: `GuardRail MVP/extensions/vscode/`
6. Select: `guardrail-ai-1.0.1.vsix`
7. Click "Install"
8. Click "Reload" when prompted
9. Done! ✅

## Optional: Add `code` Command to PATH

If you want to use the `code` command in the future:

1. Open VS Code (or Kiro IDE)
2. Press `Cmd+Shift+P`
3. Type: "Shell Command: Install 'code' command in PATH"
4. Press Enter
5. Enter your password if prompted
6. Restart your terminal

Now you can use: `code --install-extension guardrail-ai-1.0.1.vsix --force`

## Verify Installation

After installing:

1. Open Extensions view (`Cmd+Shift+X`)
2. Search for "GuardRail AI"
3. You should see it installed with version 1.0.1
4. Status should show "Enabled"

## Test It Works

1. Create a new file: `test.js`
2. Add this code:
```javascript
const apiKey = "sk_live_1234567890abcdef";
const query = "SELECT * FROM users WHERE id = " + userId;
```
3. Press `Cmd+Shift+G` to scan
4. Wait for red squiggly lines
5. Click lightbulb 💡
6. Select "🛡️ Apply GuardRail AI Security Fix"
7. See the diff view!

## Troubleshooting

### Extension doesn't appear after install
- Reload window: `Cmd+Shift+P` → "Reload Window"
- Restart VS Code completely

### "Backend not running" error
Start the backend:
```bash
cd "GuardRail MVP/api"
npm start
```

### Extension installed but not working
1. Check Extensions view - ensure it's enabled
2. Check Output panel: View → Output → Select "GuardRail AI"
3. Reload window: `Cmd+Shift+P` → "Reload Window"

## Quick Start After Installation

```bash
# 1. Start backend (in terminal)
cd "GuardRail MVP/api"
npm start

# 2. In VS Code:
# - Open a JavaScript/Python file
# - Press Cmd+Shift+G to scan
# - Click lightbulb to apply fixes
```

## File Location

The extension file is at:
```
GuardRail MVP/extensions/vscode/guardrail-ai-1.0.1.vsix
```

Full path from your current directory:
```
/Users/rakshit/Desktop/GuardRail AI/GuardRail MVP/extensions/vscode/guardrail-ai-1.0.1.vsix
```

## Next Steps

1. ✅ Install extension using Method 1, 2, or 3 above
2. ✅ Start backend: `cd "GuardRail MVP/api" && npm start`
3. ✅ Test with sample code
4. ✅ Enjoy secure coding! 🛡️

---

**Recommended:** Use Method 1 (Drag and Drop) - it's the easiest!
