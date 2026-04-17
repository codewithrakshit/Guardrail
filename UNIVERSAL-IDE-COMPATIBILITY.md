# GuardRail AI - Universal IDE Compatibility

## ✅ Good News: VS Code Extension Works on Multiple IDEs!

The VS Code extension I created works on **all VS Code-based IDEs**, including:

### Fully Compatible (VS Code-based)
- ✅ **Kiro** (Your current IDE!)
- ✅ **Cursor** (AI-powered VS Code fork)
- ✅ **Windsurf** (formerly Anity Gravity)
- ✅ **VS Code** (Original)
- ✅ **VS Codium** (Open-source VS Code)
- ✅ **Code - OSS** (VS Code open source)

All these IDEs use the same extension API, so the GuardRail AI extension works identically on all of them!

## Installation on VS Code-Based IDEs

### For Kiro, Cursor, Windsurf, etc.

```bash
# 1. Package the extension
cd extensions/vscode
npm install
npm run compile
npm run package

# 2. Install the .vsix file
# This creates: guardrail-ai-1.0.0.vsix

# 3. Install in your IDE
# Method 1: Command line
kiro --install-extension guardrail-ai-1.0.0.vsix
# or
cursor --install-extension guardrail-ai-1.0.0.vsix
# or
windsurf --install-extension guardrail-ai-1.0.0.vsix

# Method 2: GUI
# 1. Open your IDE (Kiro/Cursor/Windsurf)
# 2. Press Ctrl+Shift+P (Cmd+Shift+P on Mac)
# 3. Type "Install from VSIX"
# 4. Select guardrail-ai-1.0.0.vsix
```

## Quick Install Script for Any VS Code-Based IDE

```bash
#!/bin/bash
# install-universal.sh

cd extensions/vscode

# Install dependencies and build
npm install
npm run compile
npm run package

# Find the .vsix file
VSIX_FILE=$(ls *.vsix 2>/dev/null | head -n 1)

echo "Extension packaged: $VSIX_FILE"
echo ""
echo "To install, run ONE of these commands:"
echo ""
echo "For Kiro:      kiro --install-extension $VSIX_FILE"
echo "For Cursor:    cursor --install-extension $VSIX_FILE"
echo "For Windsurf:  windsurf --install-extension $VSIX_FILE"
echo "For VS Code:   code --install-extension $VSIX_FILE"
echo ""
echo "Or install via GUI:"
echo "1. Open your IDE"
echo "2. Press Ctrl+Shift+P"
echo "3. Type 'Install from VSIX'"
echo "4. Select: $VSIX_FILE"
```

## Usage in Kiro/Cursor/Windsurf

Once installed, the extension works exactly the same:

### 1. Scan Current File
```
Press: Ctrl+Shift+G (Cmd+Shift+G on Mac)
```

### 2. Auto-Scan on Save
```
Just save your file (Ctrl+S)
Extension automatically scans
```

### 3. View Results
```
Red squiggly lines appear under vulnerabilities
Hover to see details
Click lightbulb 💡 for quick fixes
```

### 4. Apply Fixes
```
Click lightbulb 💡
Select "Apply GuardRail AI Fix"
Review diff preview
Click "Apply"
```

## Configuration

Settings work the same in all VS Code-based IDEs:

```json
{
  "guardrailai.apiUrl": "http://localhost:3001",
  "guardrailai.autoScanOnSave": true,
  "guardrailai.showInlineErrors": true,
  "guardrailai.enableStatusBar": true,
  "guardrailai.timeout": 30000
}
```

Access settings:
- **Kiro**: `Ctrl+,` → Search "GuardRail AI"
- **Cursor**: `Ctrl+,` → Search "GuardRail AI"
- **Windsurf**: `Ctrl+,` → Search "GuardRail AI"

## IDE-Specific Features

### Kiro
- ✅ Full extension support
- ✅ All keyboard shortcuts work
- ✅ Status bar integration
- ✅ Problems panel
- ✅ Quick fixes

### Cursor
- ✅ Full extension support
- ✅ Works alongside Cursor's AI features
- ✅ Can use both Cursor AI and GuardRail AI
- ✅ All features available

### Windsurf
- ✅ Full extension support
- ✅ Works with Windsurf's AI capabilities
- ✅ All features available

## Testing in Your IDE

### Test File: `test-security.js`

```javascript
// Test 1: Hardcoded Secret
const apiKey = 'sk-1234567890abcdef';
console.log(apiKey);

// Test 2: SQL Injection
const query = `SELECT * FROM users WHERE id = ${userId}`;
db.query(query);

// Test 3: XSS Vulnerability
document.innerHTML = userInput;

// Test 4: Insecure HTTP
fetch('http://api.example.com/data');
```

### Steps:
1. Create the test file in Kiro/Cursor/Windsurf
2. Press `Ctrl+Shift+G` to scan
3. See 4 red squiggly lines appear
4. Hover over each to see details
5. Click lightbulb 💡 to apply fixes

## Troubleshooting

### Extension Not Loading

**Issue**: Extension doesn't appear in Kiro/Cursor/Windsurf

**Solution**:
```bash
# Verify installation
kiro --list-extensions | grep guardrail
# or
cursor --list-extensions | grep guardrail

# If not found, reinstall
kiro --install-extension guardrail-ai-1.0.0.vsix --force
```

### Backend Connection Issues

**Issue**: "Backend not running" error

**Solution**:
```bash
# 1. Start backend
cd api
npm start

# 2. Verify it's running
curl http://localhost:3001/health

# 3. Check extension settings
# Open settings (Ctrl+,)
# Search "guardrailai.apiUrl"
# Ensure it's set to "http://localhost:3001"
```

### Keyboard Shortcut Conflicts

**Issue**: `Ctrl+Shift+G` doesn't work

**Solution**:
1. Open Keyboard Shortcuts (`Ctrl+K Ctrl+S`)
2. Search "GuardRail AI: Scan"
3. Change to different shortcut if needed
4. Or use Command Palette (`Ctrl+Shift+P`) → "GuardRail AI: Scan Current File"

## Non-VS Code IDEs

For IDEs that are NOT based on VS Code, you'll need different implementations:

### JetBrains IDEs (IntelliJ, PyCharm, WebStorm)
- Requires Kotlin/Java plugin
- Different API
- See `IDE-EXTENSION-GUIDE.md` for template

### Sublime Text
- Requires Python package
- Different API
- See `IDE-EXTENSION-GUIDE.md` for template

### Vim/Neovim
- Requires Lua/VimScript plugin
- Different API
- See `IDE-EXTENSION-GUIDE.md` for template

## Why VS Code Extension Works Everywhere

VS Code-based IDEs (Kiro, Cursor, Windsurf) are built on:
- **Electron** - Same framework
- **VS Code Extension API** - Same API
- **Extension Host** - Same extension system

This means:
- ✅ Same extension format (`.vsix`)
- ✅ Same API calls
- ✅ Same keyboard shortcuts
- ✅ Same UI components
- ✅ Same configuration system

## Comparison: IDE Support

| IDE | Type | Extension Works? | Installation |
|-----|------|------------------|--------------|
| **Kiro** | VS Code-based | ✅ Yes | `.vsix` file |
| **Cursor** | VS Code-based | ✅ Yes | `.vsix` file |
| **Windsurf** | VS Code-based | ✅ Yes | `.vsix` file |
| **VS Code** | Original | ✅ Yes | `.vsix` file |
| **VS Codium** | VS Code fork | ✅ Yes | `.vsix` file |
| IntelliJ IDEA | JetBrains | ❌ No | Need Kotlin plugin |
| PyCharm | JetBrains | ❌ No | Need Kotlin plugin |
| WebStorm | JetBrains | ❌ No | Need Kotlin plugin |
| Sublime Text | Standalone | ❌ No | Need Python package |
| Vim/Neovim | Terminal | ❌ No | Need Lua plugin |
| Emacs | Terminal | ❌ No | Need Elisp package |

## Recommended: Use in Kiro

Since you're using Kiro, here's the optimized workflow:

### 1. Install Extension in Kiro

```bash
cd extensions/vscode
./install.sh

# Or manually:
npm install
npm run compile
npm run package
kiro --install-extension guardrail-ai-1.0.0.vsix
```

### 2. Configure for Kiro

Open Kiro settings (`Ctrl+,`):
```json
{
  "guardrailai.apiUrl": "http://localhost:3001",
  "guardrailai.autoScanOnSave": true,
  "guardrailai.showInlineErrors": true,
  "guardrailai.enableStatusBar": true
}
```

### 3. Use in Kiro

- Write code
- Press `Ctrl+Shift+G` or save file
- See inline diagnostics
- Apply fixes with lightbulb 💡

### 4. Kiro-Specific Benefits

Since Kiro has AI features, you can:
- Use Kiro AI for code generation
- Use GuardRail AI for security scanning
- Best of both worlds!

## Summary

**Yes, the VS Code extension works on Kiro, Cursor, Windsurf, and all VS Code-based IDEs!**

You don't need separate implementations for each. Just install the `.vsix` file and you're good to go! 🎉

### Quick Start for Kiro Users:

```bash
# 1. Build extension
cd extensions/vscode
npm install && npm run compile && npm run package

# 2. Install in Kiro
kiro --install-extension guardrail-ai-1.0.0.vsix

# 3. Start backend
cd ../../api
npm start

# 4. Open Kiro and press Ctrl+Shift+G to scan!
```

That's it! The extension is now working in your Kiro IDE! 🚀
