# Quick Fix Guide - Extension Fixed! 🎉

## What Was Fixed

The `guardrailai.applyfix not found` error has been resolved. The commands were created but not added to the subscriptions array.

## Changes Made

1. ✅ Added `applyFixCommand` to `context.subscriptions.push()`
2. ✅ Added `ignoreIssueCommand` to `context.subscriptions.push()`
3. ✅ Recompiled TypeScript code
4. ✅ Rebuilt extension package (899KB)

## Installation Steps

```bash
cd extensions/vscode

# Reinstall the extension
./reinstall-kiro.sh

# Reload Kiro IDE
# Press Cmd+R or restart the IDE
```

## Testing Steps

### 1. Test Backend First
```bash
cd extensions/vscode
./test-full-flow.sh
```

This will:
- Check if backend is running
- Test the scan endpoint
- Verify vulnerability detection
- Show you the API response

### 2. Test Extension in IDE

1. **Open test.js** (in root directory)
   ```javascript
   const apiKey = 'sk-1234567890abcdef';
   console.log(apiKey);
   ```

2. **Scan the file**
   - Press `Cmd+Shift+G` (Mac) or `Ctrl+Shift+G` (Windows/Linux)
   - Or: Command Palette → "GuardRail AI: Scan Current File"

3. **Look for diagnostics**
   - Red squiggly line should appear under line 1
   - Hover to see: "🔴 CRITICAL: hardcoded secret"
   - Problems panel should show 1 error

4. **Apply the fix**
   - Click on the red squiggly line
   - Lightbulb 💡 icon should appear
   - Click lightbulb
   - Select "🛡️ Apply GuardRail AI Fix"
   - Review the diff
   - Click "Apply"
   - Code should be replaced with AWS Secrets Manager implementation

## Expected Behavior

### Before Fix
```javascript
const apiKey = 'sk-1234567890abcdef';
console.log(apiKey);
```

### After Fix
```javascript
const AWS = require('aws-sdk');
const secretsManager = new AWS.SecretsManager({ region: 'us-east-1' });

async function getApiKey() {
  const data = await secretsManager.getSecretValue({ 
    SecretId: 'guardrail-secret-xxxxx' 
  }).promise();
  return JSON.parse(data.SecretString).apiKey;
}

// Usage
getApiKey().then(apiKey => {
  console.log(apiKey);
});
```

## Troubleshooting

### Still seeing "command not found"?
1. Make sure you reloaded the IDE (Cmd+R)
2. Check extension is installed: Extensions panel → Search "GuardRail AI"
3. Reinstall: `./reinstall-kiro.sh`

### No red squiggly lines?
1. Check backend is running: `curl http://localhost:3001/health`
2. Check scan completed: Look at status bar
3. Check Problems panel: `Cmd+Shift+M`

### Lightbulb not appearing?
1. Click directly on the red squiggly line
2. Make sure cursor is on the line with the issue
3. Try right-clicking and selecting "Quick Fix"

### Backend not running?
```bash
cd api
npm start
```

## Verification Checklist

- [ ] Backend running on http://localhost:3001
- [ ] Extension installed and IDE reloaded
- [ ] test.js shows red squiggly line after scan
- [ ] Lightbulb appears when clicking on issue
- [ ] "Apply GuardRail AI Fix" option in menu
- [ ] Fix applies successfully
- [ ] Code is replaced with secure version

## Success! 🎉

If all the above works, your extension is fully functional and ready to use!

## Next Steps

1. Test with other vulnerable code patterns
2. Try workspace scanning
3. Test auto-scan on save
4. Explore the dashboard

## Need Help?

Check the full verification checklist:
```bash
cat VERIFICATION-CHECKLIST.md
```

Or run the automated tests:
```bash
node test-extension.js
```
