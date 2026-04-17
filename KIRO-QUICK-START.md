# GuardRail AI - Quick Start for Kiro IDE Users

## 🚀 5-Minute Setup

### Step 1: Install the Extension

```bash
cd extensions/vscode
./install-kiro.sh
```

This will:
- ✅ Install dependencies
- ✅ Compile TypeScript
- ✅ Package the extension
- ✅ Install in Kiro IDE

### Step 2: Start the Backend

```bash
cd ../../api
npm start
```

Backend runs on `http://localhost:3001`

### Step 3: Try It!

1. Open Kiro IDE
2. Create a test file: `test.js`
3. Add vulnerable code:
```javascript
const apiKey = 'sk-1234567890abcdef';
console.log(apiKey);
```
4. Press `Ctrl+Shift+G` (or `Cmd+Shift+G` on Mac)
5. See red squiggly line appear! 🔴
6. Click lightbulb 💡 → "Apply GuardRail AI Fix"
7. Code is secured! ✅

## 🎯 Daily Usage

### Scan Current File
```
Keyboard: Ctrl+Shift+G (Cmd+Shift+G on Mac)
Menu: Right-click → "GuardRail AI: Scan Current File"
Command: Ctrl+Shift+P → "GuardRail AI: Scan Current File"
```

### Auto-Scan on Save
Just save your file (`Ctrl+S`) and it scans automatically!

### View Results
- **Red squiggly lines** under vulnerable code
- **Hover** to see details
- **Problems panel** (`Ctrl+Shift+M`) for all issues
- **Status bar** shows issue count

### Apply Fixes
1. Click on red squiggly line
2. Click lightbulb 💡 icon
3. Select "Apply GuardRail AI Fix"
4. Review diff preview
5. Click "Apply"

## ⚙️ Configuration

Open Kiro settings (`Ctrl+,`) and search for "GuardRail AI":

```json
{
  "guardrailai.apiUrl": "http://localhost:3001",
  "guardrailai.autoScanOnSave": true,
  "guardrailai.showInlineErrors": true,
  "guardrailai.enableStatusBar": true,
  "guardrailai.timeout": 30000
}
```

## 🧪 Test Examples

### Example 1: Hardcoded Secret
```javascript
// test-secret.js
const apiKey = 'sk-1234567890abcdef';
fetch('https://api.example.com', {
  headers: { 'Authorization': `Bearer ${apiKey}` }
});
```

**Expected**: 🔴 Critical - Hardcoded secret detected

**Fix**: Moves secret to AWS Secrets Manager

### Example 2: SQL Injection
```javascript
// test-sql.js
const userId = req.params.id;
const query = `SELECT * FROM users WHERE id = ${userId}`;
db.query(query);
```

**Expected**: 🟠 High - SQL injection vulnerability

**Fix**: Uses parameterized query

### Example 3: XSS Vulnerability
```javascript
// test-xss.js
const userInput = req.body.comment;
document.getElementById('comments').innerHTML = userInput;
```

**Expected**: 🟠 High - Cross-site scripting (XSS)

**Fix**: Uses safe DOM methods

### Example 4: Insecure HTTP
```javascript
// test-http.js
fetch('http://api.example.com/data')
  .then(res => res.json());
```

**Expected**: 🟡 Medium - Insecure HTTP connection

**Fix**: Changes to HTTPS

## 🎨 Status Bar Indicators

| Icon | Meaning |
|------|---------|
| `🛡️ GuardRail AI` | Ready to scan |
| `🔍 Scanning...` | Scan in progress |
| `⚠️ 3 issues` | Issues found (click to view) |
| `✅ Secure` | No issues found |
| `❌ Scan Failed` | Error occurred (click to retry) |

## ⌨️ Keyboard Shortcuts

| Action | Windows/Linux | Mac |
|--------|--------------|-----|
| Scan File | `Ctrl+Shift+G` | `Cmd+Shift+G` |
| Command Palette | `Ctrl+Shift+P` | `Cmd+Shift+P` |
| Problems Panel | `Ctrl+Shift+M` | `Cmd+Shift+M` |
| Settings | `Ctrl+,` | `Cmd+,` |
| Save File | `Ctrl+S` | `Cmd+S` |

## 🔧 Troubleshooting

### Extension Not Working

**Check if installed:**
```bash
kiro --list-extensions | grep guardrail
```

**Reinstall if needed:**
```bash
cd extensions/vscode
kiro --install-extension guardrail-ai-1.0.0.vsix --force
```

### Backend Not Running

**Error**: "GuardRail AI backend is not running"

**Solution**:
```bash
# Start backend
cd api
npm start

# Verify it's running
curl http://localhost:3001/health
```

### Keyboard Shortcut Not Working

**Issue**: `Ctrl+Shift+G` doesn't work

**Solution**:
1. Press `Ctrl+K Ctrl+S` to open Keyboard Shortcuts
2. Search "GuardRail AI"
3. Change to different shortcut if needed
4. Or use Command Palette: `Ctrl+Shift+P` → "GuardRail AI: Scan"

### No Red Squiggly Lines

**Issue**: Scan completes but no diagnostics shown

**Solution**:
1. Check settings: `guardrailai.showInlineErrors` should be `true`
2. Check Problems panel (`Ctrl+Shift+M`)
3. Restart Kiro IDE

## 🎓 Tips & Tricks

### Tip 1: Scan Before Commit
```bash
# Add to your workflow
git add .
# Press Ctrl+Shift+G in Kiro to scan
# Fix issues
git commit -m "Secure code"
```

### Tip 2: Workspace Scanning
```
Ctrl+Shift+P → "GuardRail AI: Scan Workspace"
```
Scans all files in your project!

### Tip 3: Disable Auto-Scan for Large Files
```json
{
  "guardrailai.autoScanOnSave": false
}
```
Then manually scan with `Ctrl+Shift+G`

### Tip 4: View Scan History
```
Ctrl+Shift+P → "GuardRail AI: Open Dashboard"
```
Opens web dashboard with full history

### Tip 5: Ignore False Positives
Click lightbulb 💡 → "Ignore this issue"

## 📊 Supported Languages

- ✅ JavaScript (`.js`)
- ✅ TypeScript (`.ts`)
- ✅ Python (`.py`)
- ✅ Java (`.java`)
- ✅ Go (`.go`)
- ✅ Ruby (`.rb`)
- ✅ PHP (`.php`)

## 🔒 Security & Privacy

- Code is sent to backend API for analysis
- Backend uses AWS Bedrock for AI analysis
- Temporary files deleted after 24 hours
- No permanent storage of your code
- You control the backend (self-hosted)

## 📚 More Resources

- **Full Documentation**: [UNIVERSAL-IDE-COMPATIBILITY.md](UNIVERSAL-IDE-COMPATIBILITY.md)
- **Extension Guide**: [extensions/vscode/README.md](extensions/vscode/README.md)
- **Development Guide**: [extensions/vscode/DEVELOPMENT.md](extensions/vscode/DEVELOPMENT.md)
- **Platform Overview**: [PLATFORM-OVERVIEW.md](PLATFORM-OVERVIEW.md)

## 🆘 Getting Help

### Common Issues

**Q: Extension not showing in Kiro**
A: Restart Kiro after installation

**Q: Scan takes too long**
A: Increase timeout in settings or check backend logs

**Q: Wrong language detected**
A: File extension must match language (`.js` for JavaScript, etc.)

**Q: Can't apply fix**
A: Make sure file is saved and not read-only

### Support Channels

- **GitHub Issues**: Report bugs and request features
- **Documentation**: Check the docs first
- **Backend Logs**: Check `api/` directory for logs

## 🎉 Success Checklist

- ✅ Extension installed in Kiro
- ✅ Backend running on port 3001
- ✅ Test file scanned successfully
- ✅ Red squiggly lines appear
- ✅ Quick fix applied
- ✅ Code secured!

## 🚀 Next Steps

1. **Scan your real projects** - Try it on actual code
2. **Configure settings** - Customize to your workflow
3. **Share with team** - Help others secure their code
4. **Contribute** - Report issues, suggest features

---

**You're all set! Start writing secure code with GuardRail AI in Kiro! 🛡️**

Press `Ctrl+Shift+G` and let the AI secure your code automatically! 🎉
