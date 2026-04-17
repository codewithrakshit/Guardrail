# 🔄 Extension Updated - Install New Version

## What Was Fixed

✅ **Red squiggly lines** now appear correctly
✅ **Lightbulb icon** (💡) now shows up
✅ **Vulnerability details** are properly displayed
✅ **Quick fixes** are now available

## How to Update

### Step 1: Uninstall Old Version (in Kiro)

1. Open Kiro IDE
2. Press `Cmd+Shift+P` (Command Palette)
3. Type: `Extensions: Show Installed Extensions`
4. Find "GuardRail AI"
5. Click the gear icon ⚙️ → "Uninstall"
6. Restart Kiro

### Step 2: Install New Version

1. Press `Cmd+Shift+P` (Command Palette)
2. Type: `Extensions: Install from VSIX`
3. Select: `guardrail-ai-1.0.0.vsix`
4. Click "Install"
5. Restart Kiro

### Step 3: Restart Backend (Important!)

The backend API was also updated, so restart it:

```bash
# Stop the current backend (Ctrl+C)
# Then restart:
cd ../../api
npm start
```

## Test It Now!

1. Create a test file: `test.js`
2. Add this code:
```javascript
const apiKey = 'sk-1234567890abcdef';
console.log(apiKey);
```
3. Press `Cmd+Shift+G`
4. **You should now see:**
   - ✅ Red squiggly line under `'sk-1234567890abcdef'`
   - ✅ Hover shows: "🔴 CRITICAL: hardcoded secret"
   - ✅ Lightbulb 💡 icon appears
   - ✅ Click lightbulb → "Apply GuardRail AI Fix" option
   - ✅ Problems panel shows the issue

5. Click the lightbulb 💡
6. Select "Apply GuardRail AI Fix"
7. Code is automatically secured! ✅

## What Changed

### Backend Changes
- `api/routes/result.js` - Now returns vulnerability details
- `api/services/patch-generator.js` - Stores vulnerability info in patches

### Extension Changes
- `src/scanner.ts` - Updated to handle new API response format
- Better error handling
- Improved diagnostics display

## Troubleshooting

### Still No Red Lines?

1. **Check backend is running:**
```bash
curl http://localhost:3001/health
```

2. **Check extension settings:**
- Open Kiro settings (`Cmd+,`)
- Search "GuardRail AI"
- Ensure `showInlineErrors` is `true`

3. **Check Problems panel:**
- Press `Cmd+Shift+M`
- Issues should appear here even if red lines don't show

4. **Restart Kiro completely:**
- Quit Kiro
- Reopen Kiro
- Try scanning again

### Lightbulb Not Appearing?

1. **Click directly on the red squiggly line**
2. **Or right-click** → "Quick Fix"
3. **Or press** `Cmd+.` (Quick Fix shortcut)

### Backend Errors?

Check backend logs for errors. Common issues:
- AWS credentials not configured
- Bedrock not available in your region
- DynamoDB table not created

## Success Checklist

- [ ] Old extension uninstalled
- [ ] New extension installed
- [ ] Kiro restarted
- [ ] Backend restarted
- [ ] Test file created
- [ ] Scan triggered (`Cmd+Shift+G`)
- [ ] Red squiggly line appears ✅
- [ ] Lightbulb 💡 shows up ✅
- [ ] Quick fix works ✅

## 🎉 You're All Set!

The extension should now work perfectly with full UI features!

Press `Cmd+Shift+G` to scan and see the magic happen! 🛡️
