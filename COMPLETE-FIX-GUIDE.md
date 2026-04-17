# 🔧 Complete Fix Guide - "applyFix not found"

## TL;DR - Do This Now

```bash
cd extensions/vscode
./force-reinstall.sh
```

Then **COMPLETELY RESTART** Kiro IDE (quit and reopen, don't just reload).

---

## What's Been Fixed

The extension code is 100% correct:
- ✅ Commands declared in `package.json`
- ✅ Commands registered in `extension.ts`
- ✅ Commands added to subscriptions
- ✅ Extension compiled and packaged (907KB)

**The issue is that Kiro IDE needs to load the NEW version.**

---

## Installation Steps

### 1. Force Clean Install
```bash
cd extensions/vscode
./force-reinstall.sh
```

This script will:
- Stop Kiro processes
- Remove old extension completely
- Install new extension
- Verify installation

### 2. Restart Kiro IDE

**IMPORTANT:** Don't just reload (`Cmd+R`). You must:
1. Quit Kiro completely
2. Wait 5 seconds
3. Reopen Kiro

### 3. Verify Extension Loaded

Open Command Palette (`Cmd+Shift+P`) and type "GuardRail AI".

You should see **6 commands**:
1. GuardRail AI: Scan Current File
2. GuardRail AI: Scan Workspace
3. GuardRail AI: Clear Results
4. GuardRail AI: Open Dashboard
5. **GuardRail AI: Apply Fix** ← Must be here!
6. **GuardRail AI: Ignore Issue** ← Must be here!

If you don't see all 6, the extension didn't load properly.

---

## Testing

### Test 1: Scan
1. Open `test.js`
2. Press `Cmd+Shift+G`
3. Red squiggly line should appear

### Test 2: Lightbulb
1. Click on the red squiggly line
2. Lightbulb 💡 should appear in left margin
3. Click lightbulb
4. Menu should show 3 options

### Test 3: Apply Fix
1. Select "🛡️ Apply GuardRail AI Fix"
2. Should NOT show "command not found"
3. Should show confirmation dialog
4. Click "Apply"
5. Code should be replaced

---

## Alternative: Use Notification Button

If lightbulb doesn't work, try this:

1. Scan file (`Cmd+Shift+G`)
2. Notification appears: "GuardRail AI found 1 security issue(s)"
3. Click **"Apply Fixes"** button
4. This calls the same function directly

---

## Troubleshooting

### Issue: Commands not in Command Palette

**Cause:** Extension not loaded

**Fix:**
```bash
# Check if installed
kiro --list-extensions | grep guardrail

# If not listed, reinstall
cd extensions/vscode
kiro --install-extension guardrail-ai-1.0.0.vsix

# Restart Kiro completely
```

### Issue: Extension installed but not activating

**Cause:** Activation event not triggered

**Fix:**
1. Open a JavaScript file (triggers activation)
2. Check Developer Console (Help → Toggle Developer Tools)
3. Look for: "GuardRail AI extension is now active"
4. If you see errors, the extension failed to activate

### Issue: Lightbulb doesn't appear

**Possible causes:**
1. No diagnostics on that line
   - Check Problems panel (`Cmd+Shift+M`)
2. Code actions not working
   - Try Command Palette → "GuardRail AI: Apply Fix"
3. Wrong line
   - Click directly on the red squiggly line

### Issue: "Apply Fix" in Command Palette but not in lightbulb

**Cause:** Code actions provider issue

**Workaround:**
- Use Command Palette to run "GuardRail AI: Apply Fix"
- Or use "Apply Fixes" button in notification

---

## Verification Script

Run this to verify everything is correct:

```bash
cd extensions/vscode
node verify-commands.js
```

Should show all ✅ checks passed.

---

## Files Reference

- `extensions/vscode/force-reinstall.sh` - Clean reinstall script
- `extensions/vscode/verify-commands.js` - Verification script
- `extensions/vscode/DEBUG-STEPS.md` - Detailed debugging guide
- `extensions/vscode/guardrail-ai-1.0.0.vsix` - Extension package (907KB)

---

## Still Not Working?

If after force reinstall and complete restart it still doesn't work:

### Check 1: Is extension actually installed?
```bash
kiro --list-extensions
```
Should include `guardrail-ai`

### Check 2: Is extension activated?
1. Help → Toggle Developer Tools
2. Console tab
3. Look for "GuardRail AI extension is now active"

### Check 3: Try manual command
1. Command Palette (`Cmd+Shift+P`)
2. Type: `GuardRail AI: Apply Fix`
3. Does it appear in the list?
4. If yes, select it - does it work?

### Check 4: Check extension version
1. Extensions panel
2. Search "GuardRail AI"
3. Version should be 1.0.0
4. Should be enabled

---

## The Extension IS Correct

I've verified the extension package contains:
- All 6 commands declared in package.json ✅
- All 6 commands registered in code ✅
- All commands added to subscriptions ✅
- Compiled without errors ✅

The issue is getting Kiro to load the new version. The force reinstall script should fix this.

---

## Success Criteria

✅ Extension installed
✅ Kiro completely restarted
✅ All 6 commands in Command Palette
✅ Red squiggly lines appear after scan
✅ Lightbulb appears when clicking line
✅ "Apply GuardRail AI Fix" in menu
✅ Clicking it works (no "command not found")
✅ Code is replaced with secure version

---

**Run `./force-reinstall.sh` and completely restart Kiro. This should fix it.**
